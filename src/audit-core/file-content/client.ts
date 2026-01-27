import { readFileSync, statSync } from "fs"
import { basename } from "path"
import { getEnvVar } from "../http-client"
import { getServiceUrlsWithFallback } from "../config"
import type {
  TaskCreatedResponse,
  TaskStatusResponse,
  ExtractionResult,
  ExtractOptions,
  ExtractedFile,
  PollOptions,
  FileInfo,
  BatchProgress,
  BatchedExtractOptions,
  BatchedExtractionResult,
} from "./types"

const DEFAULT_POLL_INTERVAL_MS = 2000
const DEFAULT_MAX_WAIT_MS = 300000
const DEFAULT_MAX_BATCH_SIZE_BYTES = 40 * 1024 * 1024
const DEFAULT_MAX_RETRIES = 2

export interface FileContentClientOptions {
  baseUrl?: string
  authToken?: string
}

export class FileContentClient {
  private baseUrl: string
  private readonly authToken?: string

  constructor(options: FileContentClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? this.resolveBaseUrl()
    this.authToken = options.authToken ?? getEnvVar("SEARCH_SERVICE_TOKEN")
  }

  private resolveBaseUrl(): string {
    this.urlPriority = getServiceUrlsWithFallback("fileContent")
    console.log(`[FileContentClient] URL priority: ${this.urlPriority.join(" -> ")}`)
    return this.urlPriority[0]
  }

  private urlPriority: string[] = []

  /**
   * Try multiple URLs in priority order
   * Falls back to next URL if one fails
   */
  private async fetchWithFallback<T>(
    fetchFn: (url: string) => Promise<T>
  ): Promise<T> {
    if (this.urlPriority.length === 0) {
      // 如果没有初始化优先列表，尝试一次
      this.resolveBaseUrl()
    }

    let lastError: Error | undefined

    for (const url of this.urlPriority) {
      try {
        console.log(`[FileContentClient] Trying URL: ${url}`)
        const result = await fetchFn(url)
        console.log(`[FileContentClient] ✅ Success with URL: ${url}`)
        this.baseUrl = url // 更新 baseUrl 为成功的 URL
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`[FileContentClient] ⚠️ Failed with ${url}: ${lastError.message}`)
        // 继续尝试下一个 URL
      }
    }

    throw new Error(
      `All URLs failed. Last error: ${lastError?.message}\n` +
      `Tried: ${this.urlPriority.join(", ")}`
    )
  }

  private getHeaders(isMultipart = false): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`
    }
    if (!isMultipart) {
      headers["Content-Type"] = "application/json"
    }
    return headers
  }

  async submitExtraction(
    filePaths: string[],
    options: ExtractOptions = {}
  ): Promise<TaskCreatedResponse> {
    return this.fetchWithFallback(async (baseUrl) => {
      const formData = new FormData()

      for (const filePath of filePaths) {
        const content = readFileSync(filePath)
        const filename = basename(filePath)
        const blob = new Blob([content])
        formData.append("files", blob, filename)
      }

      if (options.output_format) {
        formData.append("output_format", options.output_format)
      }
      if (options.detect_scanned !== undefined) {
        formData.append("detect_scanned", String(options.detect_scanned))
      }
      if (options.extract_xfa !== undefined) {
        formData.append("extract_xfa", String(options.extract_xfa))
      }
      if (options.include_structure !== undefined) {
        formData.append("include_structure", String(options.include_structure))
      }

      const response = await fetch(`${baseUrl}/file-content/extract`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: formData,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to submit extraction: ${response.status} ${text}`)
      }

      return response.json() as Promise<TaskCreatedResponse>
    })
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    return this.fetchWithFallback(async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/file-content/tasks/${taskId}`,
        { headers: this.getHeaders() }
      )

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to get task status: ${response.status} ${text}`)
      }

      return response.json() as Promise<TaskStatusResponse>
    })
  }

  async getTaskResult(taskId: string): Promise<ExtractionResult> {
    return this.fetchWithFallback(async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/file-content/tasks/${taskId}/result`,
        { headers: this.getHeaders() }
      )

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to get task result: ${response.status} ${text}`)
      }

      return response.json() as Promise<ExtractionResult>
    })
  }

  async pollUntilComplete(
    taskId: string,
    options: PollOptions = {}
  ): Promise<ExtractionResult> {
    const pollInterval = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS
    const maxWait = options.maxWaitMs ?? DEFAULT_MAX_WAIT_MS
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      const status = await this.getTaskStatus(taskId)

      options.onProgress?.(status)

      if (status.status === "completed") {
        return this.getTaskResult(taskId)
      }

      if (status.status === "failed") {
        throw new Error(
          `Extraction failed: ${status.error?.message ?? "Unknown error"}`
        )
      }

      await this.sleep(pollInterval)
    }

    throw new Error(`Extraction timed out after ${maxWait}ms`)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  getFileInfos(filePaths: string[]): FileInfo[] {
    return filePaths.map((path) => ({
      path,
      filename: basename(path),
      size: statSync(path).size,
    }))
  }

  splitIntoBatches(
    fileInfos: FileInfo[],
    maxBatchSizeBytes: number = DEFAULT_MAX_BATCH_SIZE_BYTES
  ): FileInfo[][] {
    const batches: FileInfo[][] = []
    let currentBatch: FileInfo[] = []
    let currentSize = 0

    const sortedFiles = [...fileInfos].sort((a, b) => b.size - a.size)

    for (const file of sortedFiles) {
      if (file.size > maxBatchSizeBytes) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch)
          currentBatch = []
          currentSize = 0
        }
        batches.push([file])
        continue
      }

      if (currentSize + file.size > maxBatchSizeBytes && currentBatch.length > 0) {
        batches.push(currentBatch)
        currentBatch = [file]
        currentSize = file.size
      } else {
        currentBatch.push(file)
        currentSize += file.size
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }

    return batches
  }

  private async submitBatchWithRetry(
    batch: FileInfo[],
    options: ExtractOptions,
    maxRetries: number
  ): Promise<ExtractionResult> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const filePaths = batch.map((f) => f.path)
        const task = await this.submitExtraction(filePaths, options)
        return await this.pollUntilComplete(task.task_id)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxRetries) {
          await this.sleep(1000 * (attempt + 1))
        }
      }
    }

    throw lastError ?? new Error("Batch extraction failed")
  }

  async extractBatched(
    filePaths: string[],
    options: BatchedExtractOptions = {}
  ): Promise<BatchedExtractionResult> {
    const {
      maxBatchSizeBytes = DEFAULT_MAX_BATCH_SIZE_BYTES,
      maxRetries = DEFAULT_MAX_RETRIES,
      onBatchProgress,
      ...extractOptions
    } = options

    const fileInfos = this.getFileInfos(filePaths)
    const batches = this.splitIntoBatches(fileInfos, maxBatchSizeBytes)

    const taskIds: string[] = []
    const allFiles: ExtractedFile[] = []
    const failedFiles: Array<{ filename: string; error: string }> = []
    let filesProcessed = 0

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]

      onBatchProgress?.({
        currentBatch: i + 1,
        totalBatches: batches.length,
        filesProcessed,
        totalFiles: fileInfos.length,
        currentBatchFiles: batch.map((f) => f.filename),
      })

      try {
        const result = await this.submitBatchWithRetry(batch, extractOptions, maxRetries)
        taskIds.push(result.task_id)

        if (result.result.files) {
          allFiles.push(...result.result.files)
        }

        filesProcessed += batch.length
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        for (const file of batch) {
          failedFiles.push({ filename: file.filename, error: errorMsg })
        }
        filesProcessed += batch.length
      }
    }

    return {
      task_ids: taskIds,
      total_files: fileInfos.length,
      total_batches: batches.length,
      files: allFiles,
      failed_files: failedFiles,
    }
  }
}

let clientInstance: FileContentClient | null = null

export function getFileContentClient(): FileContentClient {
  if (!clientInstance) {
    clientInstance = new FileContentClient()
  }
  return clientInstance
}

export function resetFileContentClient(): void {
  clientInstance = null
}
