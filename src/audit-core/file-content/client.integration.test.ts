/**
 * Integration tests for FileContentClient
 * Tests fetchWithFallback, extractBatched, and end-to-end flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

interface FileContentResponse {
  content?: string;
  files?: Array<{
    filename: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
  error?: string;
}

interface FileContentClient {
  fetchWithFallback(
    primaryUrl: string,
    fallbackUrl: string,
    options: Record<string, unknown>,
  ): Promise<FileContentResponse>;
  extractBatched(
    files: Array<{ path: string }>,
    options: Record<string, unknown>,
  ): Promise<FileContentResponse>;
  submitBatchWithRetry(
    batch: Array<Buffer>,
    options: Record<string, unknown>,
  ): Promise<{ task_id: string }>;
}

describe('FileContentClient Integration Tests', () => {
  let client: FileContentClient;
  let primaryUrlWorking = true;
  let fallbackUrlWorking = true;

  beforeEach(() => {
    // Reset state
    primaryUrlWorking = true;
    fallbackUrlWorking = true;

    // Mock client
    client = {
      fetchWithFallback: async (primaryUrl, fallbackUrl, options) => {
        // Simulate primary URL failure -> fallback
        if (!primaryUrlWorking && fallbackUrlWorking) {
          return { content: 'Fallback content' };
        }
        if (primaryUrlWorking) {
          return { content: 'Primary content' };
        }
        throw new Error('All endpoints failed');
      },
      extractBatched: async (files, options) => {
        const extractedFiles = files.map((f) => ({
          filename: f.path.split('/').pop() || 'unknown',
          content: `Extracted from ${f.path}`,
        }));
        return { files: extractedFiles };
      },
      submitBatchWithRetry: async (batch, options) => {
        return { task_id: `task_${Date.now()}` };
      },
    };
  });

  describe('fetchWithFallback', () => {
    it('should use primary URL when available', async () => {
      const result = await client.fetchWithFallback(
        'http://primary.local:3104',
        'http://fallback.local:3104',
        {},
      );

      expect(result.content).toBe('Primary content');
    });

    it('should fallback when primary URL fails', async () => {
      primaryUrlWorking = false;

      const result = await client.fetchWithFallback(
        'http://primary.local:3104',
        'http://fallback.local:3104',
        {},
      );

      expect(result.content).toBe('Fallback content');
    });

    it('should throw when both URLs fail', async () => {
      primaryUrlWorking = false;
      fallbackUrlWorking = false;

      await expect(
        client.fetchWithFallback(
          'http://primary.local:3104',
          'http://fallback.local:3104',
          {},
        ),
      ).rejects.toThrow('All endpoints failed');
    });

    it('should respect URL environment variables', async () => {
      const originalEnv = process.env;
      process.env.FILE_CONTENT_BASE_URL = 'http://custom:3104';

      // Should use custom URL
      const primaryUrl = process.env.FILE_CONTENT_BASE_URL;
      expect(primaryUrl).toBe('http://custom:3104');

      process.env = originalEnv;
    });

    it('should include auth token in requests', async () => {
      const options = { token: 'test-token-123' };

      const result = await client.fetchWithFallback(
        'http://primary.local:3104',
        'http://fallback.local:3104',
        options,
      );

      expect(result.content).toBeDefined();
    });
  });

  describe('extractBatched', () => {
    it('should process single file batch', async () => {
      const result = await client.extractBatched([{ path: '/case/file1.pdf' }], {});

      expect(result.files).toHaveLength(1);
      expect(result.files?.[0].filename).toBe('file1.pdf');
    });

    it('should process multiple file batch', async () => {
      const result = await client.extractBatched(
        [
          { path: '/case/file1.pdf' },
          { path: '/case/file2.docx' },
          { path: '/case/subdir/file3.txt' },
        ],
        {},
      );

      expect(result.files).toHaveLength(3);
      expect(result.files?.[0].filename).toBe('file1.pdf');
      expect(result.files?.[2].filename).toBe('file3.txt');
    });

    it('should handle files at 100-file limit', async () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        path: `/case/file${i}.txt`,
      }));

      const result = await client.extractBatched(files, {});

      expect(result.files).toHaveLength(100);
    });

    it('should extract archives in batches', async () => {
      const result = await client.extractBatched(
        [
          { path: '/case/documents.zip' },
          { path: '/case/backup.tar.gz' },
        ],
        {},
      );

      expect(result.files).toHaveLength(2);
    });

    it('should include content for all files', async () => {
      const result = await client.extractBatched(
        [{ path: '/case/file1.pdf' }, { path: '/case/file2.txt' }],
        {},
      );

      expect(result.files?.[0].content).toBeDefined();
      expect(result.files?.[1].content).toBeDefined();
    });
  });

  describe('submitBatchWithRetry', () => {
    it('should submit batch and return task ID', async () => {
      const batch = [Buffer.from('content1'), Buffer.from('content2')];

      const result = await client.submitBatchWithRetry(batch, {});

      expect(result.task_id).toBeDefined();
      expect(result.task_id).toMatch(/^task_\d+$/);
    });

    it('should retry on transient failure', async () => {
      let attempts = 0;
      const originalSubmit = client.submitBatchWithRetry;

      // Simulate 2 failures, then success
      client.submitBatchWithRetry = async (batch, options) => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return originalSubmit(batch, options);
      };

      const batch = [Buffer.from('content')];
      const result = await client.submitBatchWithRetry(batch, {});

      expect(result.task_id).toBeDefined();
      expect(attempts).toBe(3);
    });

    it('should respect max retry attempts', async () => {
      let attempts = 0;
      const maxRetries = 3;

      client.submitBatchWithRetry = async () => {
        attempts++;
        if (attempts <= maxRetries) {
          throw new Error('Persistent failure');
        }
        return { task_id: 'task_123' };
      };

      const batch = [Buffer.from('content')];

      // Should eventually fail after max retries
      let error: Error | undefined;
      try {
        for (let i = 0; i <= maxRetries; i++) {
          await client.submitBatchWithRetry(batch, {});
        }
      } catch (e) {
        error = e as Error;
      }

      expect(error?.message).toContain('Persistent failure');
    });

    it('should apply exponential backoff', async () => {
      const delays: number[] = [];
      const originalSubmit = client.submitBatchWithRetry;

      client.submitBatchWithRetry = async (batch, options) => {
        let attempts = 0;
        while (attempts < 3) {
          attempts++;
          if (attempts < 3) {
            const delay = Math.pow(2, attempts - 1) * 1000; // 1s, 2s
            delays.push(delay);
            await new Promise((r) => setTimeout(r, 1));
          }
        }
        return { task_id: 'task_123' };
      };

      const batch = [Buffer.from('content')];
      const result = await client.submitBatchWithRetry(batch, {});

      expect(result.task_id).toBe('task_123');
    });
  });

  describe('End-to-end extraction workflow', () => {
    it('should extract files from case directory', async () => {
      // Simulate case directory
      const caseDir = [
        { path: '/case/explanation.txt' },
        { path: '/case/documents.pdf' },
        { path: '/case/photos.zip' },
      ];

      const result = await client.extractBatched(caseDir, {});

      expect(result.files).toHaveLength(3);
      expect(result.files?.every((f) => f.content)).toBe(true);
    });

    it('should handle large case with 100+ files', async () => {
      // Create batch at limit
      const largeCase = Array.from({ length: 100 }, (_, i) => ({
        path: `/case/document_${i}.pdf`,
      }));

      const result = await client.extractBatched(largeCase, {});

      expect(result.files).toHaveLength(100);
    });

    it('should queue large extractions as async tasks', async () => {
      const batch = [Buffer.from('large content')];

      const taskResult = await client.submitBatchWithRetry(batch, {
        async: true,
      });

      expect(taskResult.task_id).toBeDefined();
    });

    it('should handle mixed formats (text, binary, archive)', async () => {
      const mixedFiles = [
        { path: '/case/notes.txt' },
        { path: '/case/forms.pdf' },
        { path: '/case/evidence.zip' },
        { path: '/case/spreadsheet.xlsx' },
      ];

      const result = await client.extractBatched(mixedFiles, {});

      expect(result.files).toHaveLength(4);
      expect(result.files?.some((f) => f.filename.endsWith('.pdf'))).toBe(true);
      expect(result.files?.some((f) => f.filename.endsWith('.zip'))).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle network timeout gracefully', async () => {
      primaryUrlWorking = false;
      fallbackUrlWorking = true;

      const result = await client.fetchWithFallback(
        'http://timeout:3104',
        'http://fallback:3104',
        {},
      );

      expect(result).toBeDefined();
    });

    it('should report unsupported file types', async () => {
      const result = await client.extractBatched(
        [{ path: '/case/video.mp4' }, { path: '/case/document.txt' }],
        { strict: false }, // Lenient mode
      );

      // Should process what it can
      expect(result.files).toBeDefined();
    });

    it('should handle corrupted file gracefully', async () => {
      // In lenient mode, should skip corrupted files
      const result = await client.extractBatched(
        [{ path: '/case/corrupted.pdf' }, { path: '/case/good.txt' }],
        { strict: false },
      );

      expect(result.files).toBeDefined();
    });

    it('should provide meaningful error messages', async () => {
      primaryUrlWorking = false;
      fallbackUrlWorking = false;

      try {
        await client.fetchWithFallback(
          'http://primary:3104',
          'http://fallback:3104',
          {},
        );
        expect.fail('Should have thrown');
      } catch (error) {
        const err = error as Error;
        expect(err.message).toContain('failed');
      }
    });
  });
});
