import { ResizeOptions } from './types';
import { loadImage } from './loader';

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  options: ResizeOptions
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

export async function resizeImage(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  options: ResizeOptions
): Promise<HTMLCanvasElement> {
  let img: HTMLImageElement;
  
  if (typeof source === 'string' || source instanceof File) {
    img = await loadImage(source);
  } else if (source instanceof HTMLImageElement) {
    img = source;
  } else {
    img = new Image();
    img.src = source.toDataURL();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });
  }

  const { width, height } = calculateDimensions(img.width, img.height, options);
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  options: ResizeOptions
): HTMLCanvasElement {
  const { width, height } = calculateDimensions(canvas.width, canvas.height, options);
  
  const resized = document.createElement('canvas');
  resized.width = width;
  resized.height = height;
  
  const ctx = resized.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, width, height);

  return resized;
}
