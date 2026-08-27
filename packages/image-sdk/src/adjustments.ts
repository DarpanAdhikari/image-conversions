import { Adjustments } from './types';

export function applyAdjustments(
  canvas: HTMLCanvasElement,
  adjustments: Adjustments
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let {
    brightness = 0,
    contrast = 0,
    saturation = 0,
    temperature = 0,
    tint = 0,
    grayscale = false,
    sepia = false,
  } = adjustments;

  const brightnessValue = brightness / 100;
  const contrastValue = (contrast + 100) / 100;
  const saturationValue = (saturation + 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = r + brightnessValue * 255;
    g = g + brightnessValue * 255;
    b = b + brightnessValue * 255;

    r = ((r / 255 - 0.5) * contrastValue + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrastValue + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrastValue + 0.5) * 255;

    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = r + (gray - r) * (1 - saturationValue);
    g = g + (gray - g) * (1 - saturationValue);
    b = b + (gray - b) * (1 - saturationValue);

    if (temperature !== 0) {
      const tempValue = temperature / 100;
      r = r + tempValue * 30;
      b = b - tempValue * 30;
    }

    if (tint !== 0) {
      const tintValue = tint / 100;
      g = g + tintValue * 30;
    }

    if (grayscale) {
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    if (sepia) {
      const sepiaR = r * 0.393 + g * 0.769 + b * 0.189;
      const sepiaG = r * 0.349 + g * 0.686 + b * 0.168;
      const sepiaB = r * 0.272 + g * 0.534 + b * 0.131;
      r = sepiaR;
      g = sepiaG;
      b = sepiaB;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const resultCtx = result.getContext('2d')!;
  resultCtx.putImageData(imageData, 0, 0);

  return result;
}
