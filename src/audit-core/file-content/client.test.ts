import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import { FileContentClient, resetFileContentClient } from "./client"
import type { FileInfo } from "./types"

describe("FileContentClient", () => {
  const originalFileContentUrl = process.env.FILE_CONTENT_BASE_URL
  const originalAuditKgUrl = process.env.AUDIT_KG_BASE_URL

  beforeEach(() => {
    resetFileContentClient()
    delete process.env.FILE_CONTENT_BASE_URL
    delete process.env.AUDIT_KG_BASE_URL
  })

  afterEach(() => {
    resetFileContentClient()
    if (originalFileContentUrl !== undefined) {
      process.env.FILE_CONTENT_BASE_URL = originalFileContentUrl
    } else {
      delete process.env.FILE_CONTENT_BASE_URL
    }
    if (originalAuditKgUrl !== undefined) {
      process.env.AUDIT_KG_BASE_URL = originalAuditKgUrl
    } else {
      delete process.env.AUDIT_KG_BASE_URL
    }
  })

  describe("resolveBaseUrl", () => {
    it("#given FILE_CONTENT_BASE_URL is set #when creating client #then uses that URL", () => {
      process.env.FILE_CONTENT_BASE_URL = "http://test:3104/api/v1"
      const client = new FileContentClient()
      expect(client["baseUrl"]).toBe("http://test:3104/api/v1")
    })

    it("#given AUDIT_KG_BASE_URL is set #when FILE_CONTENT_BASE_URL is not set #then falls back to AUDIT_KG_BASE_URL", () => {
      process.env.AUDIT_KG_BASE_URL = "http://kg:3104/api/v1"
      const client = new FileContentClient()
      expect(client["baseUrl"]).toBe("http://kg:3104/api/v1")
    })

    it("#given explicit baseUrl provided #when creating client #then uses provided URL", () => {
      const client = new FileContentClient({ baseUrl: "http://custom:3104/api/v1" })
      expect(client["baseUrl"]).toBe("http://custom:3104/api/v1")
    })
  })

  describe("getHeaders", () => {
    it("#given auth token is set #when getting headers #then includes Authorization header", () => {
      process.env.SEARCH_SERVICE_TOKEN = "test-token"
      const client = new FileContentClient()
      const headers = client["getHeaders"]()
      expect(headers["Authorization"]).toBe("Bearer test-token")
      expect(headers["Content-Type"]).toBe("application/json")
      delete process.env.SEARCH_SERVICE_TOKEN
    })

    it("#given multipart request #when getting headers #then excludes Content-Type", () => {
      const client = new FileContentClient()
      const headers = client["getHeaders"](true)
      expect(headers["Content-Type"]).toBeUndefined()
    })
  })

  describe("submitExtraction", () => {
    it("#given valid file paths #when submitting extraction #then calls API with FormData", async () => {
      const mockResponse = {
        task_id: "fc_test123",
        status: "pending",
        message: "Task submitted",
        file_count: 1,
        estimated_seconds: 10,
        links: { self: "/tasks/fc_test123" },
      }

      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      )
      globalThis.fetch = mockFetch as unknown as typeof fetch

      const client = new FileContentClient()

      const testFilePath = "/tmp/test-file-content.txt"
      await Bun.write(testFilePath, "test content")

      try {
        const result = await client.submitExtraction([testFilePath], {
          output_format: "markdown",
        })

        expect(result.task_id).toBe("fc_test123")
        expect(result.status).toBe("pending")
        expect(mockFetch).toHaveBeenCalledTimes(1)
      } finally {
        await Bun.file(testFilePath).exists() &&
          (await import("fs/promises")).unlink(testFilePath)
      }
    })
  })

  describe("getTaskStatus", () => {
    it("#given valid task ID #when getting status #then returns task status", async () => {
      const mockStatus = {
        task_id: "fc_test123",
        status: "processing",
        progress: { current: 1, total: 2, percentage: 50, current_file: "test.pdf" },
        created_at: "2026-01-01T00:00:00Z",
        started_at: "2026-01-01T00:00:01Z",
        completed_at: null,
        links: { self: "/tasks/fc_test123" },
      }

      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatus),
        })
      ) as unknown as typeof fetch

      const client = new FileContentClient()
      const result = await client.getTaskStatus("fc_test123")

      expect(result.task_id).toBe("fc_test123")
      expect(result.status).toBe("processing")
      expect(result.progress.percentage).toBe(50)
    })
  })

  describe("pollUntilComplete", () => {
    it("#given task completes #when polling #then returns extraction result", async () => {
      let callCount = 0
      const mockStatusPending = {
        task_id: "fc_test123",
        status: "processing",
        progress: { current: 1, total: 2, percentage: 50, current_file: "test.pdf" },
      }
      const mockStatusComplete = {
        task_id: "fc_test123",
        status: "completed",
        progress: { current: 2, total: 2, percentage: 100, current_file: null },
      }
      const mockResult = {
        task_id: "fc_test123",
        status: "completed",
        result: {
          content: "extracted content",
          metadata: { filename: "test.pdf", format: "pdf", char_count: 100 },
          files: null,
        },
      }

      globalThis.fetch = mock((url: string) => {
        callCount++
        if (url.includes("/result")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResult),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(callCount < 3 ? mockStatusPending : mockStatusComplete),
        })
      }) as unknown as typeof fetch

      const client = new FileContentClient()
      const result = await client.pollUntilComplete("fc_test123", {
        pollIntervalMs: 10,
      })

      expect(result.task_id).toBe("fc_test123")
      expect(result.result.content).toBe("extracted content")
    })

    it("#given task fails #when polling #then throws error", async () => {
      const mockStatusFailed = {
        task_id: "fc_test123",
        status: "failed",
        error: { code: "EXTRACTION_FAILED", message: "OCR failed" },
      }

      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatusFailed),
        })
      ) as unknown as typeof fetch

      const client = new FileContentClient()

      await expect(
        client.pollUntilComplete("fc_test123", { pollIntervalMs: 10 })
      ).rejects.toThrow("Extraction failed: OCR failed")
    })

    it("#given timeout exceeded #when polling #then throws timeout error", async () => {
      const mockStatusPending = {
        task_id: "fc_test123",
        status: "processing",
        progress: { current: 0, total: 1, percentage: 0 },
      }

      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatusPending),
        })
      ) as unknown as typeof fetch

      const client = new FileContentClient()

      await expect(
        client.pollUntilComplete("fc_test123", {
          pollIntervalMs: 10,
          maxWaitMs: 50,
        })
      ).rejects.toThrow("Extraction timed out after 50ms")
    })
  })

  describe("splitIntoBatches", () => {
    it("#given files within batch limit #when splitting #then returns single batch", () => {
      const client = new FileContentClient()
      const files: FileInfo[] = [
        { path: "/a.pdf", filename: "a.pdf", size: 1000 },
        { path: "/b.pdf", filename: "b.pdf", size: 2000 },
        { path: "/c.pdf", filename: "c.pdf", size: 3000 },
      ]

      const batches = client.splitIntoBatches(files, 10000)

      expect(batches.length).toBe(1)
      expect(batches[0].length).toBe(3)
    })

    it("#given files exceeding batch limit #when splitting #then creates multiple batches", () => {
      const client = new FileContentClient()
      const files: FileInfo[] = [
        { path: "/a.pdf", filename: "a.pdf", size: 3000 },
        { path: "/b.pdf", filename: "b.pdf", size: 3000 },
        { path: "/c.pdf", filename: "c.pdf", size: 3000 },
        { path: "/d.pdf", filename: "d.pdf", size: 3000 },
      ]

      const batches = client.splitIntoBatches(files, 5000)

      expect(batches.length).toBe(4)
      batches.forEach((batch) => {
        expect(batch.length).toBe(1)
      })
    })

    it("#given oversized single file #when splitting #then puts file in own batch", () => {
      const client = new FileContentClient()
      const files: FileInfo[] = [
        { path: "/huge.pdf", filename: "huge.pdf", size: 50000 },
        { path: "/small.pdf", filename: "small.pdf", size: 1000 },
      ]

      const batches = client.splitIntoBatches(files, 10000)

      expect(batches.length).toBe(2)
      expect(batches[0][0].filename).toBe("huge.pdf")
      expect(batches[1][0].filename).toBe("small.pdf")
    })

    it("#given mixed file sizes #when splitting #then optimizes batch grouping", () => {
      const client = new FileContentClient()
      const files: FileInfo[] = [
        { path: "/small1.pdf", filename: "small1.pdf", size: 1000 },
        { path: "/medium.pdf", filename: "medium.pdf", size: 5000 },
        { path: "/small2.pdf", filename: "small2.pdf", size: 1000 },
        { path: "/large.pdf", filename: "large.pdf", size: 8000 },
        { path: "/small3.pdf", filename: "small3.pdf", size: 1000 },
      ]

      const batches = client.splitIntoBatches(files, 10000)

      expect(batches.length).toBe(2)
      expect(batches[0][0].filename).toBe("large.pdf")
      expect(batches[1].length).toBe(4)
      const totalFiles = batches.reduce((sum, b) => sum + b.length, 0)
      expect(totalFiles).toBe(5)
    })

    it("#given empty file list #when splitting #then returns empty array", () => {
      const client = new FileContentClient()
      const batches = client.splitIntoBatches([], 10000)
      expect(batches.length).toBe(0)
    })
  })
})
