import {
  ImageFormat,
  CompressionTargetOptions,
  CompressionPreview,
  CompressionResult,
  CompressionPreset,
  ProgressCallback,
} from './types';
import { loadImage, imageToCanvas } from './loader';
import { getMimeType } from './convert';

const MAX_BINARY_SEARCH_ITERATIONS = 8;

const PRESET_CONFIGS: Record<
  CompressionPreset,
  { format: ImageFormat; quality: number; maxDimension?: number }
> = {
  web: { format: 'webp', quality: 75, maxDimension: 1920 },
  email: { format: 'jpeg', quality: 70, maxDimension: 800 },
  print: { format: 'jpeg', quality: 95, maxDimension: 3000 },
  thumbnail: { format: 'webp', quality: 60, maxDimension: 400 },
};

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

function estimateSize(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number
): Promise<number> {
  const mimeType = getMimeType(format);
  const q = quality / 100;

  if (format === 'png' || format === 'bmp' || format === 'gif') {
    return canvasToBlob(canvas, mimeType).then((blob) => blob?.size ?? 0);
  }

  return canvasToBlob(canvas, mimeType, q).then((blob) => blob?.size ?? 0);
}

export async function compressToTargetSize(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  options: CompressionTargetOptions
): Promise<CompressionResult> {
  const {
    targetSize,
    tolerance = 5,
    maxFileSize,
    format = 'jpeg',
    width,
    height,
    maintainAspectRatio = true,
    onProgress,
  } = options;

  let canvas: HTMLCanvasElement;

  onProgress?.({ phase: 'loading', percent: 0, message: 'Loading image...' });

  if (typeof source === 'string' || source instanceof File) {
    const img = await loadImage(source);
    canvas = imageToCanvas(img);
  } else if (source instanceof HTMLImageElement) {
    canvas = imageToCanvas(source);
  } else {
    canvas = source;
  }

  if (maxFileSize) {
    const initialBlob = await canvasToBlob(canvas, getMimeType(format));
    if (initialBlob && initialBlob.size > maxFileSize) {
      throw new Error(
        `File size (${formatBytes(initialBlob.size)}) exceeds max allowed size (${formatBytes(maxFileSize)})`
      );
    }
  }

  if (options.maxDimension) {
    const maxDim = Math.max(canvas.width, canvas.height);
    if (maxDim > options.maxDimension) {
      const scale = options.maxDimension / maxDim;
      const scaled = document.createElement('canvas');
      scaled.width = Math.round(canvas.width * scale);
      scaled.height = Math.round(canvas.height * scale);
      const ctx = scaled.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
      canvas = scaled;
    }
  }

  if (width || height) {
    canvas = resizeCanvasForCompression(canvas, {
      width,
      height,
      maintainAspectRatio,
    });
  }

  onProgress?.({ phase: 'processing', percent: 20, message: 'Analyzing image...' });

  if (!targetSize) {
    const blob = await canvasToBlob(canvas, getMimeType(format), options.quality ? options.quality / 100 : undefined);
    if (!blob) throw new Error('Failed to encode image');
    return {
      blob,
      actualSize: blob.size,
      withinTarget: !maxFileSize || blob.size <= maxFileSize,
      quality: options.quality ?? 100,
      format,
    };
  }

  const mimeType = getMimeType(format);

  if (format === 'png' || format === 'bmp' || format === 'gif') {
    const blob = await canvasToBlob(canvas, mimeType);
    if (!blob) throw new Error('Failed to encode image');
    return {
      blob,
      actualSize: blob.size,
      targetSize,
      withinTarget: blob.size <= targetSize,
      quality: 100,
      format,
    };
  }

  onProgress?.({ phase: 'encoding', percent: 40, message: 'Optimizing compression...' });

  let low = 0.01;
  let high = 1.0;
  let bestQuality = 0.5;
  let bestBlob: Blob | null = null;
  let bestDiff = Infinity;

  const baselineBlob = await canvasToBlob(canvas, mimeType, 0.5);
  if (!baselineBlob) throw new Error('Failed to encode image');

  if (baselineBlob.size <= targetSize) {
    low = 0.5;
    bestBlob = baselineBlob;
    bestQuality = 0.5;
    bestDiff = targetSize - baselineBlob.size;
  } else {
    high = 0.5;
    bestBlob = baselineBlob;
    bestQuality = 0.5;
    bestDiff = baselineBlob.size - targetSize;
  }

  for (let i = 0; i < MAX_BINARY_SEARCH_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    const blob = await canvasToBlob(canvas, mimeType, mid);

    if (!blob) break;

    const diff = Math.abs(blob.size - targetSize);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestBlob = blob;
      bestQuality = mid;
    }

    if (blob.size > targetSize) {
      high = mid;
    } else {
      low = mid;
    }

    const progress = 40 + ((i + 1) / MAX_BINARY_SEARCH_ITERATIONS) * 50;
    onProgress?.({
      phase: 'encoding',
      percent: progress,
      message: `Optimizing... pass ${i + 1}/${MAX_BINARY_SEARCH_ITERATIONS}`,
    });
  }

  if (!bestBlob) {
    throw new Error('Failed to compress image to target size');
  }

  const toleranceBytes = targetSize * (tolerance / 100);
  const withinTarget = bestBlob.size <= targetSize + toleranceBytes;

  onProgress?.({ phase: 'complete', percent: 100, message: 'Done' });

  return {
    blob: bestBlob,
    actualSize: bestBlob.size,
    targetSize,
    withinTarget,
    quality: Math.round(bestQuality * 100),
    format,
  };
}

export function validateFileSize(
  file: File,
  maxSize?: number
): { valid: boolean; size: number; maxSize?: number; message: string } {
  if (!maxSize) {
    return { valid: true, size: file.size, message: 'File size check passed' };
  }

  const valid = file.size <= maxSize;
  return {
    valid,
    size: file.size,
    maxSize,
    message: valid
      ? 'File size check passed'
      : `File size (${formatBytes(file.size)}) exceeds limit (${formatBytes(maxSize)})`,
  };
}

export async function getCompressionPreview(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  format: ImageFormat = 'jpeg'
): Promise<CompressionPreview> {
  let canvas: HTMLCanvasElement;

  if (typeof source === 'string' || source instanceof File) {
    const img = await loadImage(source);
    canvas = imageToCanvas(img);
  } else if (source instanceof HTMLImageElement) {
    canvas = imageToCanvas(source);
  } else {
    canvas = source;
  }

  const originalSize = await estimateSize(canvas, 'png', 100);

  const quality100 = await estimateSize(canvas, format, 100);
  const quality75 = await estimateSize(canvas, format, 75);
  const quality50 = await estimateSize(canvas, format, 50);

  let estimatedSize: number;
  let recommendedQuality: number;

  if (quality75 <= originalSize * 0.7) {
    estimatedSize = quality75;
    recommendedQuality = 75;
  } else if (quality50 <= originalSize * 0.5) {
    estimatedSize = quality50;
    recommendedQuality = 50;
  } else {
    estimatedSize = quality100;
    recommendedQuality = 100;
  }

  const estimatedSavingsPercent =
    originalSize > 0 ? ((originalSize - estimatedSize) / originalSize) * 100 : 0;

  const recommendedFormat =
    format === 'png' ? ('webp' as ImageFormat) : format;

  return {
    originalWidth: canvas.width,
    originalHeight: canvas.height,
    originalSize,
    estimatedSize,
    estimatedSavingsPercent: Math.max(0, Math.round(estimatedSavingsPercent)),
    recommendedFormat,
    recommendedQuality,
  };
}

export async function smartCompress(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  preset: CompressionPreset = 'web',
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  const config = PRESET_CONFIGS[preset];

  const options: CompressionTargetOptions = {
    format: config.format,
    quality: config.quality,
    maxDimension: config.maxDimension,
    onProgress,
  };

  if (preset === 'email') {
    options.targetSize = 1024 * 1024;
    options.tolerance = 10;
  } else if (preset === 'thumbnail') {
    options.targetSize = 100 * 1024;
    options.tolerance = 15;
  } else if (preset === 'web') {
    options.targetSize = 500 * 1024;
    options.tolerance = 10;
  }

  return compressToTargetSize(source, options);
}

function resizeCanvasForCompression(
  canvas: HTMLCanvasElement,
  options: { width?: number; height?: number; maintainAspectRatio: boolean }
): HTMLCanvasElement {
  let { width, height } = options;
  const { maintainAspectRatio } = options;

  if (!width && !height) return canvas;

  const aspectRatio = canvas.width / canvas.height;

  if (maintainAspectRatio) {
    if (width && !height) {
      height = Math.round(width / aspectRatio);
    } else if (!width && height) {
      width = Math.round(height * aspectRatio);
    } else {
      const targetRatio = width! / height!;
      if (targetRatio > aspectRatio) {
        width = Math.round(height! * aspectRatio);
      } else {
        height = Math.round(width! / aspectRatio);
      }
    }
  } else {
    width = width ?? canvas.width;
    height = height ?? canvas.height;
  }

  const resized = document.createElement('canvas');
  resized.width = width!;
  resized.height = height!;
  const ctx = resized.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, width!, height!);
  return resized;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
