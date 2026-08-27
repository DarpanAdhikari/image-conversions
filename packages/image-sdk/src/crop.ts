import { CropOptions } from './types';
import { loadImage } from './loader';

export async function cropImage(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  options: CropOptions
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

  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    img,
    options.x,
    options.y,
    options.width,
    options.height,
    0,
    0,
    options.width,
    options.height
  );

  return canvas;
}

export function cropCanvas(
  canvas: HTMLCanvasElement,
  options: CropOptions
): HTMLCanvasElement {
  const cropped = document.createElement('canvas');
  cropped.width = options.width;
  cropped.height = options.height;
  
  const ctx = cropped.getContext('2d')!;
  ctx.drawImage(
    canvas,
    options.x,
    options.y,
    options.width,
    options.height,
    0,
    0,
    options.width,
    options.height
  );

  return cropped;
}
