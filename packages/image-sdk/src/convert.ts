import { ImageFormat, ExportOptions, CompressionTargetOptions } from './types';
import { loadImage, imageToCanvas } from './loader';

const MIME_TYPES: Record<ImageFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  bmp: 'image/bmp',
};

const EXTENSIONS: Record<ImageFormat, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
  avif: '.avif',
  gif: '.gif',
  bmp: '.bmp',
};

export function getMimeType(format: ImageFormat): string {
  return MIME_TYPES[format];
}

export function getExtension(format: ImageFormat): string {
  return EXTENSIONS[format];
}

export function getSupportedFormats(): ImageFormat[] {
  return ['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp'];
}

export async function convertImage(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  options: ExportOptions | CompressionTargetOptions
): Promise<Blob> {
  const onProgress = options.onProgress;
  let canvas: HTMLCanvasElement;
  
  onProgress?.({ phase: 'loading', percent: 0, message: 'Loading image...' });

  if ('maxFileSize' in options && options.maxFileSize && source instanceof File) {
    if (source.size > options.maxFileSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${options.maxFileSize} bytes`
      );
    }
  }

  if (typeof source === 'string' || source instanceof File) {
    const img = await loadImage(source);
    canvas = imageToCanvas(img);
  } else if (source instanceof HTMLImageElement) {
    canvas = imageToCanvas(source);
  } else {
    canvas = source;
  }

  onProgress?.({ phase: 'processing', percent: 30, message: 'Processing image...' });

  if (options.width || options.height) {
    const { width, height } = calculateOutputDimensions(
      canvas.width,
      canvas.height,
      options
    );
    const resized = document.createElement('canvas');
    resized.width = width;
    resized.height = height;
    const ctx = resized.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, width, height);
    canvas = resized;
  }

  onProgress?.({ phase: 'encoding', percent: 70, message: 'Encoding image...' });

  const mimeType = MIME_TYPES[options.format];
  const quality = options.quality ? options.quality / 100 : undefined;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob) {
    throw new Error(`Failed to convert to ${options.format}`);
  }

  onProgress?.({ phase: 'complete', percent: 100, message: 'Done' });

  return blob;
}

export async function convertToFile(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  options: ExportOptions,
  filename: string
): Promise<File> {
  const blob = await convertImage(source, options);
  const ext = EXTENSIONS[options.format];
  const name = filename.replace(/\.[^/.]+$/, '') + ext;
  return new File([blob], name, { type: MIME_TYPES[options.format] });
}

function calculateOutputDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ExportOptions
): { width: number; height: number } {
  let { width, height } = options;
  const maintainAspectRatio = options.maintainAspectRatio ?? true;

  if (!width && !height) {
    return { width: originalWidth, height: originalHeight };
  }

  if (maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight;
    
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
    width = width ?? originalWidth;
    height = height ?? originalHeight;
  }

  return { width: width!, height: height! };
}

export function isFormatSupported(format: ImageFormat): Promise<boolean> {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return new Promise<boolean>((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob !== null);
      },
      MIME_TYPES[format]
    );
  });
}
