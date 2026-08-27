import { ExportOptions, CompressionTargetOptions, FilterPreset } from './types';
import { convertImage } from './convert';
import { resizeImage } from './resize';
import { applyFilter } from './filters';
import { compressToTargetSize } from './compress';
import { getDRPFilename } from './drp';

export interface BatchOperation {
  type: 'convert' | 'resize' | 'filter' | 'compress';
  options?: Partial<ExportOptions> &
    Partial<CompressionTargetOptions> & {
      width?: number;
      height?: number;
      maintainAspectRatio?: boolean;
      preset?: FilterPreset;
    };
}

export interface BatchResult {
  file: File;
  blob: Blob;
  success: boolean;
  error?: string;
}

export interface BatchProgress {
  current: number;
  total: number;
  file: File;
  phase: string;
}

export type BatchProgressCallback = (progress: BatchProgress) => void;

export async function batchProcess(
  files: File[],
  operation: BatchOperation,
  onProgress?: BatchProgressCallback
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    onProgress?.({
      current: i + 1,
      total: files.length,
      file,
      phase: 'processing',
    });

    try {
      let blob: Blob;

      switch (operation.type) {
        case 'convert':
          blob = await convertImage(file, operation.options as ExportOptions);
          break;

        case 'resize': {
          const canvas = await resizeImage(file, {
            width: operation.options?.width,
            height: operation.options?.height,
            maintainAspectRatio: operation.options?.maintainAspectRatio,
          });
          blob = await convertImage(canvas, {
            format: operation.options?.format || 'png',
            quality: operation.options?.quality,
          });
          break;
        }

        case 'filter': {
          const img = await resizeImage(file, { width: 800, maintainAspectRatio: true });
          const filtered = applyFilter(img, operation.options?.preset || 'original');
          blob = await convertImage(filtered, {
            format: operation.options?.format || 'png',
            quality: operation.options?.quality,
          });
          break;
        }

        case 'compress': {
          const result = await compressToTargetSize(file, {
            format: operation.options?.format || 'webp',
            targetSize: operation.options?.targetSize,
            tolerance: operation.options?.tolerance,
            maxFileSize: operation.options?.maxFileSize,
            maxDimension: operation.options?.maxDimension,
            quality: operation.options?.quality,
            width: operation.options?.width,
            height: operation.options?.height,
            maintainAspectRatio: operation.options?.maintainAspectRatio,
          });
          blob = result.blob;
          break;
        }

        default:
          throw new Error(`Unknown operation: ${(operation as BatchOperation).type}`);
      }

      results.push({ file, blob, success: true });
    } catch (error) {
      results.push({
        file,
        blob: new Blob(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  onProgress?.({
    current: files.length,
    total: files.length,
    file: files[files.length - 1],
    phase: 'complete',
  });

  return results;
}

export function downloadBatchResult(result: BatchResult): void {
  if (!result.success) return;

  const url = URL.createObjectURL(result.blob);
  const a = document.createElement('a');
  a.href = url;

  const ext = result.file.name.split('.').pop() || 'png';
  a.download = getDRPFilename(result.file.name, ext as any);

  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadAllBatchResults(results: BatchResult[]): Promise<void> {
  for (const result of results) {
    if (result.success) {
      downloadBatchResult(result);
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}
