import { FilterPreset } from './types';

interface FilterConfig {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  grayscale: boolean;
  sepia: boolean;
  hueRotate: number;
  blur: number;
  opacity: number;
}

const FILTERS: Record<FilterPreset, FilterConfig> = {
  original: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
  vintage: {
    brightness: 10,
    contrast: -10,
    saturation: -30,
    temperature: 20,
    tint: 10,
    grayscale: false,
    sepia: true,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
  blackAndWhite: {
    brightness: 0,
    contrast: 20,
    saturation: -100,
    temperature: 0,
    tint: 0,
    grayscale: true,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
  warm: {
    brightness: 5,
    contrast: 5,
    saturation: 10,
    temperature: 30,
    tint: 5,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
  cool: {
    brightness: 5,
    contrast: 5,
    saturation: 10,
    temperature: -30,
    tint: -5,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
  cinematic: {
    brightness: -5,
    contrast: 30,
    saturation: -20,
    temperature: -10,
    tint: 5,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
  fade: {
    brightness: 15,
    contrast: -20,
    saturation: -30,
    temperature: 0,
    tint: 0,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 90,
  },
  dramatic: {
    brightness: -10,
    contrast: 40,
    saturation: -40,
    temperature: -10,
    tint: 0,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
  soft: {
    brightness: 10,
    contrast: -10,
    saturation: -10,
    temperature: 5,
    tint: 0,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 1,
    opacity: 95,
  },
  highContrast: {
    brightness: 5,
    contrast: 50,
    saturation: 15,
    temperature: 0,
    tint: 0,
    grayscale: false,
    sepia: false,
    hueRotate: 0,
    blur: 0,
    opacity: 100,
  },
};

export function getFilterConfig(preset: FilterPreset): FilterConfig {
  return { ...FILTERS[preset] };
}

export function applyFilter(
  canvas: HTMLCanvasElement,
  preset: FilterPreset
): HTMLCanvasElement {
  if (preset === 'original') {
    return canvas;
  }

  const config = FILTERS[preset];
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d')!;

  let filterString = '';
  
  if (config.brightness !== 0) {
    filterString += `brightness(${100 + config.brightness}%) `;
  }
  if (config.contrast !== 0) {
    filterString += `contrast(${100 + config.contrast}%) `;
  }
  if (config.saturation !== 0) {
    filterString += `saturate(${100 + config.saturation}%) `;
  }
  if (config.hueRotate !== 0) {
    filterString += `hue-rotate(${config.hueRotate}deg) `;
  }
  if (config.blur > 0) {
    filterString += `blur(${config.blur}px) `;
  }
  if (config.opacity < 100) {
    filterString += `opacity(${config.opacity}%) `;
  }
  if (config.grayscale) {
    filterString += 'grayscale(100%) ';
  }
  if (config.sepia) {
    filterString += 'sepia(100%) ';
  }

  ctx.filter = filterString.trim() || 'none';
  ctx.drawImage(canvas, 0, 0);

  if (config.temperature !== 0 || config.tint !== 0) {
    const imageData = ctx.getImageData(0, 0, result.width, result.height);
    const data = imageData.data;
    const tempValue = config.temperature / 100;
    const tintValue = config.tint / 100;

    for (let i = 0; i < data.length; i += 4) {
      if (tempValue !== 0) {
        data[i] = Math.max(0, Math.min(255, data[i] + tempValue * 30));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] - tempValue * 30));
      }
      if (tintValue !== 0) {
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + tintValue * 30));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return result;
}

export const AVAILABLE_FILTERS: FilterPreset[] = [
  'original',
  'vintage',
  'blackAndWhite',
  'warm',
  'cool',
  'cinematic',
  'fade',
  'dramatic',
  'soft',
  'highContrast',
];

export function getFilterName(preset: FilterPreset): string {
  const names: Record<FilterPreset, string> = {
    original: 'Original',
    vintage: 'Vintage',
    blackAndWhite: 'Black & White',
    warm: 'Warm',
    cool: 'Cool',
    cinematic: 'Cinematic',
    fade: 'Fade',
    dramatic: 'Dramatic',
    soft: 'Soft',
    highContrast: 'High Contrast',
  };
  return names[preset];
}
