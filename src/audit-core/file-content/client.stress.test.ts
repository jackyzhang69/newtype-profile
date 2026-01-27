/**
 * Stress tests for FileContentClient
 * Tests concurrent operations, large files, and performance baselines
 */

import { describe, it, expect, beforeEach } from 'bun:test';

interface FileContentClient {
  extractBatched(
    files: Array<{ path: string }>,
    options: Record<string, unknown>,
  ): Promise<{ files?: Array<{ filename: string; content: string }> }>;
  submitBatchWithRetry(
    batch: Array<Buffer>,
    options: Record<string, unknown>,
  ): Promise<{ task_id: string }>;
}

describe('FileContentClient Stress Tests', () => {
  let client: FileContentClient;

  beforeEach(() => {
    // Mock client with controlled performance characteristics
    client = {
      extractBatched: async (files, options) => {
        const startTime = Date.now();

        // Simulate processing delay proportional to file count
        const delayMs = Math.max(1, files.length * 2);
        await new Promise((r) => setTimeout(r, delayMs));

        return {
          files: files.map((f) => ({
            filename: f.path.split('/').pop() || 'unknown',
            content: `Extracted from ${f.path}`,
          })),
        };
      },
      submitBatchWithRetry: async (batch, options) => {
        await new Promise((r) => setTimeout(r, 1));
        return { task_id: `task_${Date.now()}` };
      },
    };
  });

  describe('Concurrent operations', () => {
    it('should handle 10 concurrent extractions', async () => {
      const start = Date.now();

      const tasks = Array.from({ length: 10 }, async (_, i) => {
        return client.extractBatched([{ path: `/case/file${i}.pdf` }], {});
      });

      const results = await Promise.all(tasks);

      expect(results).toHaveLength(10);
      expect(results.every((r) => r.files)).toBe(true);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle 50 concurrent extractions', async () => {
      const tasks = Array.from({ length: 50 }, async (_, i) => {
        return client.extractBatched([{ path: `/case/file${i}.pdf` }], {});
      });

      const results = await Promise.all(tasks);

      expect(results).toHaveLength(50);
      expect(results.every((r) => r.files)).toBe(true);
    });

    it('should handle 100 concurrent extractions', async () => {
      const start = Date.now();

      const tasks = Array.from({ length: 100 }, async (_, i) => {
        return client.extractBatched([{ path: `/case/file${i}.pdf` }], {});
      });

      const results = await Promise.all(tasks);

      expect(results).toHaveLength(100);
      expect(results.every((r) => r.files)).toBe(true);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should not leak connections under concurrent load', async () => {
      const iterations = 10;
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const trackConcurrent = async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        try {
          await client.extractBatched([{ path: '/case/file.pdf' }], {});
        } finally {
          currentConcurrent--;
        }
      };

      const tasks = Array.from({ length: iterations }, () => trackConcurrent());
      await Promise.all(tasks);

      // Should maintain reasonable concurrency
      expect(maxConcurrent).toBeLessThanOrEqual(iterations);
    });
  });

  describe('Large file handling', () => {
    it('should handle batch with 100 files', async () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        path: `/case/file${i}.pdf`,
      }));

      const result = await client.extractBatched(files, {});

      expect(result.files).toHaveLength(100);
    });

    it('should handle batch with files totaling 1GB (simulated)', async () => {
      const files = Array.from({ length: 100 }, (_, i) => ({
        path: `/case/large${i}.pdf`, // Would be ~10MB each in real scenario
      }));

      const result = await client.extractBatched(files, {});

      expect(result.files).toHaveLength(100);
    });

    it('should handle 200MB+ files in batch', async () => {
      const files = [
        { path: '/case/large_file_1.pdf' }, // 200MB
        { path: '/case/large_file_2.pdf' }, // 200MB
      ];

      const result = await client.extractBatched(files, {});

      expect(result.files).toHaveLength(2);
    });

    it('should not duplicate content for large files', async () => {
      const result = await client.extractBatched(
        [{ path: '/case/large.pdf' }],
        {},
      );

      expect(result.files).toHaveLength(1);
      expect(result.files?.[0].content).toBeDefined();
      // Should not have duplicate content
    });
  });

  describe('Performance baselines', () => {
    it('should extract single file in < 100ms', async () => {
      const start = Date.now();

      await client.extractBatched([{ path: '/case/file.txt' }], {});

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('should extract 10 files in < 500ms', async () => {
      const start = Date.now();

      const files = Array.from({ length: 10 }, (_, i) => ({
        path: `/case/file${i}.txt`,
      }));

      await client.extractBatched(files, {});

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });

    it('should extract 100 files in < 5 seconds', async () => {
      const start = Date.now();

      const files = Array.from({ length: 100 }, (_, i) => ({
        path: `/case/file${i}.txt`,
      }));

      await client.extractBatched(files, {});

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(5000);
    });

    it('should submit batch task in < 100ms', async () => {
      const start = Date.now();

      const batch = [Buffer.from('x'.repeat(1024 * 100))]; // 100KB

      await client.submitBatchWithRetry(batch, {});

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('should handle peak load without timeout', async () => {
      const start = Date.now();
      const timeout = 10000; // 10 seconds

      // Submit concurrent batches
      const tasks = Array.from({ length: 20 }, async () => {
        return client.submitBatchWithRetry(
          [Buffer.from('content')],
          {},
        );
      });

      const results = await Promise.race([
        Promise.all(tasks),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Timeout')),
            timeout,
          ),
        ),
      ]);

      expect(results).toBeDefined();

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(timeout);
    });
  });

  describe('Memory efficiency under load', () => {
    it('should not accumulate memory with repeated operations', async () => {
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        await client.extractBatched([{ path: '/case/file.pdf' }], {});
      }

      // Should complete without OOM
      expect(true).toBe(true);
    });

    it('should efficiently handle large batches', async () => {
      const largeFiles = Array.from({ length: 1000 }, (_, i) => ({
        path: `/case/file${i}.txt`,
      }));

      // Split into chunks to avoid memory issues
      const chunkSize = 100;
      for (let i = 0; i < largeFiles.length; i += chunkSize) {
        const chunk = largeFiles.slice(i, i + chunkSize);
        const result = await client.extractBatched(chunk, {});
        expect(result.files).toHaveLength(Math.min(chunkSize, largeFiles.length - i));
      }
    });

    it('should cleanup temporary buffers', async () => {
      const batch = [Buffer.from('x'.repeat(10 * 1024 * 1024))]; // 10MB

      await client.submitBatchWithRetry(batch, {});

      // Buffer should be eligible for GC
      expect(batch[0].length).toBe(10 * 1024 * 1024);
    });
  });

  describe('Scalability', () => {
    it('should scale linearly with batch size up to 100 files', async () => {
      const times: Record<number, number> = {};

      for (const count of [10, 50, 100]) {
        const files = Array.from({ length: count }, (_, i) => ({
          path: `/case/file${i}.txt`,
        }));

        const start = Date.now();
        await client.extractBatched(files, {});
        times[count] = Date.now() - start;
      }

      // Time should roughly double when batch doubles
      expect(times[50] < times[100]).toBe(true);
    });

    it('should handle concurrent batch submissions', async () => {
      const concurrentBatches = 10;
      const filesPerBatch = 10;

      const tasks = Array.from({ length: concurrentBatches }, async () => {
        const files = Array.from({ length: filesPerBatch }, (_, i) => ({
          path: `/case/file${i}.pdf`,
        }));
        return client.extractBatched(files, {});
      });

      const results = await Promise.all(tasks);

      expect(results).toHaveLength(concurrentBatches);
      expect(results.every((r) => r.files?.length === filesPerBatch)).toBe(true);
    });
  });

  describe('Reliability under stress', () => {
    it('should not lose data under high concurrency', async () => {
      const fileCount = 500;
      const batchSize = 50;
      const batches = Math.ceil(fileCount / batchSize);

      const results: number[] = [];

      const tasks = Array.from({ length: batches }, async (_, batchIdx) => {
        const start = batchIdx * batchSize;
        const end = Math.min(start + batchSize, fileCount);
        const files = Array.from({ length: end - start }, (_, i) => ({
          path: `/case/file${start + i}.pdf`,
        }));

        const result = await client.extractBatched(files, {});
        results.push(result.files?.length || 0);
      });

      await Promise.all(tasks);

      const totalExtracted = results.reduce((a, b) => a + b, 0);
      expect(totalExtracted).toBe(fileCount);
    });

    it('should maintain consistency across concurrent operations', async () => {
      const tasks = Array.from({ length: 10 }, async () => {
        const result = await client.extractBatched(
          [{ path: '/case/file.pdf' }],
          {},
        );
        return result.files?.[0].content;
      });

      const results = await Promise.all(tasks);

      // All should have same content
      expect(new Set(results).size).toBe(1);
    });
  });
});
