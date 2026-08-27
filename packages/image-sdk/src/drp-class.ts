import { VERSION } from './types';
import type {
  ImageFormat,
  Adjustments,
  FilterPreset,
  CropOptions,
  CompressionResult,
} from './types';
import { loadImage, imageToCanvas } from './loader';
import { cropImage } from './crop';
import { resizeImage } from './resize';
import { rotateImage, flipImage } from './transform';
import { applyAdjustments } from './adjustments';
import { applyFilter } from './filters';
import { compressToTargetSize, getCompressionPreview, validateFileSize } from './compress';
import { readMetadata, exportWithMetadata } from './metadata';
import { createEditor } from './editor';
import { EXPORT_PRESETS } from './presets';
import { batchProcess } from './batch';

export interface DRPResult {
  blob: Blob;
  size: number;
  format: string;
  quality: number;
  width: number;
  height: number;
}

export interface DRPOptions {
  format?: ImageFormat;
  quality?: number;
  targetSize?: string | number;
  tolerance?: number;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  crop?: { x: number; y: number; width: number; height: number } | CropOptions;
  rotate?: number;
  flip?: 'horizontal' | 'vertical' | 'both' | boolean;
  filter?: FilterPreset;
  adjustments?: Adjustments;
  metadata?: { preserve?: boolean; remove?: boolean; custom?: Record<string, unknown> };
  onProgress?: (event: { phase: string; percent: number; message: string }) => void;
}

function parseSize(input: string | number): number {
  if (typeof input === 'number') return input;

  const str = input.trim().toUpperCase();
  const match = str.match(/^([\d.]+)\s*(B|KB|MB|GB)$/);
  if (!match) throw new Error(`Invalid size format: "${input}". Use "500KB", "2MB", etc.`);

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'B':  return value;
    case 'KB': return value * 1024;
    case 'MB': return value * 1024 * 1024;
    case 'GB': return value * 1024 * 1024 * 1024;
    default:   return value;
  }
}

function parseFlip(input: string | boolean): { horizontal?: boolean; vertical?: boolean } {
  if (input === true) return { horizontal: true };
  if (input === false) return {};
  switch (input) {
    case 'horizontal': return { horizontal: true };
    case 'vertical':   return { vertical: true };
    case 'both':       return { horizontal: true, vertical: true };
    default:           return {};
  }
}

function normalizeCrop(
  crop: { x: number; y: number; width: number; height: number } | CropOptions
): CropOptions {
  return {
    x: crop.x,
    y: crop.y,
    width: 'width' in crop ? crop.width : (crop as any).width,
    height: 'height' in crop ? crop.height : (crop as any).height,
  };
}

async function process(source: any, options: DRPOptions = {}): Promise<DRPResult> {
  const {
    format = 'webp',
    quality = 80,
    targetSize,
    tolerance = 10,
    width,
    height,
    maintainAspectRatio = true,
    crop: cropOpts,
    rotate: rotateDeg,
    flip: flipOpts,
    filter: filterPreset,
    adjustments: adjOpts,
    metadata: metaOpts,
    onProgress,
  } = options;

  onProgress?.({ phase: 'loading', percent: 0, message: 'Loading image...' });

  let canvas: HTMLCanvasElement;

  if (source instanceof Blob && !(source instanceof File)) {
    const url = URL.createObjectURL(source);
    const img = await loadImage(url);
    URL.revokeObjectURL(url);
    canvas = imageToCanvas(img);
  } else if (typeof source === 'string' || source instanceof File) {
    const img = await loadImage(source);
    canvas = imageToCanvas(img);
  } else if (source instanceof HTMLImageElement) {
    canvas = imageToCanvas(source);
  } else if (source instanceof HTMLCanvasElement) {
    canvas = source;
  } else {
    throw new Error('DRP: Invalid source. Provide a File, Blob, URL string, HTMLImageElement, or HTMLCanvasElement.');
  }

  const originalWidth = canvas.width;
  const originalHeight = canvas.height;
  void originalWidth;
  void originalHeight;
  let step = 0;
  const totalSteps = [cropOpts, width || height, rotateDeg, flipOpts, adjOpts, filterPreset, true].filter(Boolean).length;

  function progress(phase: string, msg: string) {
    step++;
    onProgress?.({ phase, percent: Math.round((step / totalSteps) * 80), message: msg });
  }

  if (cropOpts) {
    progress('processing', 'Cropping...');
    canvas = await cropImage(canvas, normalizeCrop(cropOpts));
  }

  if (width || height) {
    progress('processing', 'Resizing...');
    canvas = await resizeImage(canvas, {
      width,
      height,
      maintainAspectRatio,
    });
  }

  if (rotateDeg) {
    progress('processing', 'Rotating...');
    canvas = await rotateImage(canvas, { degrees: rotateDeg });
  }

  if (flipOpts) {
    progress('processing', 'Flipping...');
    canvas = await flipImage(canvas, parseFlip(flipOpts));
  }

  if (adjOpts) {
    progress('processing', 'Adjusting...');
    canvas = applyAdjustments(canvas, adjOpts);
  }

  if (filterPreset && filterPreset !== 'original') {
    progress('processing', 'Applying filter...');
    canvas = applyFilter(canvas, filterPreset);
  }

  onProgress?.({ phase: 'encoding', percent: 80, message: 'Encoding...' });

  let blob: Blob;
  let actualQuality = quality;
  let actualFormat = format;

  if (targetSize) {
    const targetBytes = parseSize(targetSize);
    const result: CompressionResult = await compressToTargetSize(canvas, {
      format,
      quality,
      targetSize: targetBytes,
      tolerance,
      onProgress: onProgress
        ? (e) => onProgress({ ...e, percent: 80 + Math.round(e.percent * 0.2) })
        : undefined,
    });
    blob = result.blob;
    actualQuality = result.quality;
    actualFormat = result.format;
  } else {
    const mimeType = getMimeTypeForFormat(format);
    const q = quality / 100;

    let encoded: Blob | null;
    if (format === 'png' || format === 'bmp' || format === 'gif') {
      encoded = await canvasToBlob(canvas, mimeType);
    } else {
      encoded = await canvasToBlob(canvas, mimeType, q);
    }

    if (!encoded) {
      throw new Error(`DRP: Failed to encode to ${format}`);
    }
    blob = encoded;
  }

  if (metaOpts && (metaOpts.preserve || metaOpts.custom)) {
    blob = await exportWithMetadata(blob, actualFormat as ImageFormat, metaOpts);
  }

  onProgress?.({ phase: 'complete', percent: 100, message: 'Done' });

  return {
    blob,
    size: blob.size,
    format: actualFormat,
    quality: actualQuality,
    width: canvas.width,
    height: canvas.height,
  };
}

function getMimeTypeForFormat(format: string): string {
  const map: Record<string, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    bmp: 'image/bmp',
  };
  return map[format] || 'image/webp';
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

function DRP(source: any, options?: DRPOptions): Promise<DRPResult> {
  return process(source, options);
}

DRP.process = process;
DRP.version = () => VERSION;
DRP.formats = (): ImageFormat[] => ['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp'];
DRP.filters = (): FilterPreset[] => [
  'original', 'vintage', 'blackAndWhite', 'warm', 'cool',
  'cinematic', 'fade', 'dramatic', 'soft', 'highContrast',
];
DRP.presets = () => EXPORT_PRESETS;
DRP.editor = (source: any) => createEditor(source);
DRP.batch = (files: File[], operation: any, onProgress?: any) => batchProcess(files, operation, onProgress);
DRP.validate = (file: File, maxSize?: number) => validateFileSize(file, maxSize);
DRP.preview = (source: any, format?: ImageFormat) => getCompressionPreview(source, format);
DRP.readMetadata = (source: any) => readMetadata(source);

export { DRP };
