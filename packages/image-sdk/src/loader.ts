import { ImageInfo, ImageFormat, ValidationResult } from './types';

const FORMAT_SIGNATURES: Record<string, Uint8Array> = {
  jpeg: new Uint8Array([0xff, 0xd8, 0xff]),
  png: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  webp: new Uint8Array([0x52, 0x49, 0x46, 0x46]),
  gif: new Uint8Array([0x47, 0x49, 0x46]),
  bmp: new Uint8Array([0x42, 0x4d]),
};

export function validateFile(file: File): boolean;
export function validateFile(file: File, maxSize: number): ValidationResult;
export function validateFile(file: File, maxSize?: number): boolean | ValidationResult {
  if (!file || !(file instanceof File)) {
    return maxSize !== undefined
      ? { valid: false, size: 0, maxSize, message: 'Not a valid File object' }
      : false;
  }

  if (file.size === 0) {
    return maxSize !== undefined
      ? { valid: false, size: 0, maxSize, message: 'File is empty' }
      : false;
  }

  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/avif',
  ];

  if (!validTypes.includes(file.type)) {
    return maxSize !== undefined
      ? { valid: false, size: file.size, maxSize, message: `Unsupported file type: ${file.type}` }
      : false;
  }

  if (maxSize !== undefined) {
    const valid = file.size <= maxSize;
    return {
      valid,
      size: file.size,
      maxSize,
      message: valid
        ? 'File validation passed'
        : `File size exceeds maximum allowed size`,
    };
  }

  return true;
}

export async function detectFormat(file: File): Promise<ImageFormat> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  for (const [format, signature] of Object.entries(FORMAT_SIGNATURES)) {
    if (signature.every((byte, i) => bytes[i] === byte)) {
      if (format === 'webp' && bytes[8] === 0x57 && bytes[9] === 0x45) {
        return 'webp';
      }
      if (format === 'webp' && bytes[8] === 0x41 && bytes[9] === 0x56) {
        return 'avif';
      }
      return format as ImageFormat;
    }
  }

  throw new Error('Unable to detect image format');
}

export async function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      if (!validateFile(source)) {
        reject(new Error('Invalid file'));
        return;
      }
      img.src = URL.createObjectURL(source);
    }
  });
}

export async function getImageInfo(file: File): Promise<ImageInfo> {
  const format = await detectFormat(file);
  const img = await loadImage(file);

  return {
    width: img.width,
    height: img.height,
    format,
    size: file.size,
  };
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d')!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(new window.ImageData(imageData.data, imageData.width, imageData.height), 0, 0);
  return canvas;
}
