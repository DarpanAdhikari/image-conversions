import { RotateOptions, FlipOptions } from './types';
import { imageToCanvas, loadImage } from './loader';

export async function rotateImage(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  options: RotateOptions
): Promise<HTMLCanvasElement> {
  let canvas: HTMLCanvasElement;
  
  if (typeof source === 'string' || source instanceof File) {
    const img = await loadImage(source);
    canvas = imageToCanvas(img);
  } else if (source instanceof HTMLImageElement) {
    canvas = imageToCanvas(source);
  } else {
    canvas = source;
  }

  const { degrees, backgroundColor = 'transparent' } = options;
  const radians = (degrees * Math.PI) / 180;
  
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  
  const newWidth = Math.round(canvas.width * cos + canvas.height * sin);
  const newHeight = Math.round(canvas.width * sin + canvas.height * cos);
  
  const rotated = document.createElement('canvas');
  rotated.width = newWidth;
  rotated.height = newHeight;
  
  const ctx = rotated.getContext('2d')!;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, newWidth, newHeight);
  
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return rotated;
}

export async function flipImage(
  source: HTMLImageElement | HTMLCanvasElement | string | File,
  options: FlipOptions
): Promise<HTMLCanvasElement> {
  let canvas: HTMLCanvasElement;
  
  if (typeof source === 'string' || source instanceof File) {
    const img = await loadImage(source);
    canvas = imageToCanvas(img);
  } else if (source instanceof HTMLImageElement) {
    canvas = imageToCanvas(source);
  } else {
    canvas = source;
  }

  const { horizontal = false, vertical = false } = options;
  
  const flipped = document.createElement('canvas');
  flipped.width = canvas.width;
  flipped.height = canvas.height;
  
  const ctx = flipped.getContext('2d')!;
  
  if (horizontal) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  
  if (vertical) {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  
  ctx.drawImage(canvas, 0, 0);

  return flipped;
}

export function rotateCanvas(
  canvas: HTMLCanvasElement,
  options: RotateOptions
): HTMLCanvasElement {
  const { degrees, backgroundColor = 'transparent' } = options;
  const radians = (degrees * Math.PI) / 180;
  
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  
  const newWidth = Math.round(canvas.width * cos + canvas.height * sin);
  const newHeight = Math.round(canvas.width * sin + canvas.height * cos);
  
  const rotated = document.createElement('canvas');
  rotated.width = newWidth;
  rotated.height = newHeight;
  
  const ctx = rotated.getContext('2d')!;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, newWidth, newHeight);
  
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return rotated;
}

export function flipCanvas(
  canvas: HTMLCanvasElement,
  options: FlipOptions
): HTMLCanvasElement {
  const { horizontal = false, vertical = false } = options;
  
  const flipped = document.createElement('canvas');
  flipped.width = canvas.width;
  flipped.height = canvas.height;
  
  const ctx = flipped.getContext('2d')!;
  
  if (horizontal) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  
  if (vertical) {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  
  ctx.drawImage(canvas, 0, 0);

  return flipped;
}
