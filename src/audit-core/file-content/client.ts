import { readFileSync } from "fs"
import { basename } from "path"
import { getEnvVar } from "../http-client"
import type {
  TaskCreatedResponse,
  TaskStatusResponse,
  ExtractionResult,
  ExtractOptions,
  PollOptions,
} from "./types"

const DEFAULT_POLL_INTERVAL_MS = 2000
const DEFAULT_MAX_WAIT_MS = 300000

export interface FileContentClientOptions {
  baseUrl?: string
  authToken?: string
}

export class FileContentClient {
  private readonly baseUrl: string
  private readonly authToken?: string

  constructor(options: FileContentClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? this.resolveBaseUrl()
    this.authToken = options.authToken ?? getEnvVar("SEARCH_SERVICE_TOKEN")
  }

  private resolveBaseUrl(): string {
    const explicit = getEnvVar("FILE_CONTENT_BASE_URL")
    if (explicit) return explicit.replace(/\/$/, "")

    const kgUrl = getEnvVar("AUDIT_KG_BASE_URL")
    if (kgUrl) return kgUrl.replace(/\/$/, "")

    return "http://localhost:3104/api/v1"
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

    const response = await fetch(`${this.baseUrl}/file-content/extract`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to submit extraction: ${response.status} ${text}`)
    }

    return response.json() as Promise<TaskCreatedResponse>
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response = await fetch(
      `${this.baseUrl}/file-content/tasks/${taskId}`,
      { headers: this.getHeaders() }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to get task status: ${response.status} ${text}`)
    }

    return response.json() as Promise<TaskStatusResponse>
  }

  async getTaskResult(taskId: string): Promise<ExtractionResult> {
    const response = await fetch(
      `${this.baseUrl}/file-content/tasks/${taskId}/result`,
      { headers: this.getHeaders() }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to get task result: ${response.status} ${text}`)
    }

    return response.json() as Promise<ExtractionResult>
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
