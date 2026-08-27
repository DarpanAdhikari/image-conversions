import {
  EditorState,
  CropOptions,
  ResizeOptions,
  RotateOptions,
  FlipOptions,
  Adjustments,
  FilterPreset,
  ExportOptions,
  CompressionTargetOptions,
  Layer,
} from './types';
import { loadImage, imageToCanvas } from './loader';
import { cropCanvas } from './crop';
import { resizeCanvas } from './resize';
import { rotateCanvas, flipCanvas } from './transform';
import { applyAdjustments } from './adjustments';
import { applyFilter } from './filters';
import { convertImage } from './convert';
import { renderLayersToCanvas, getMaxZIndex } from './layers';
import { exportWithMetadata } from './metadata';
import { compressToTargetSize } from './compress';

export interface Editor {
  getWidth(): number;
  getHeight(): number;
  getCanvas(): HTMLCanvasElement;
  crop(options: CropOptions): void;
  resize(options: ResizeOptions): void;
  rotate(options: RotateOptions): void;
  flip(options: FlipOptions): void;
  adjust(adjustments: Adjustments): void;
  applyFilter(filter: FilterPreset): void;
  addLayer(layer: Layer): void;
  removeLayer(layerId: string): void;
  getLayers(): Layer[];
  export(options: ExportOptions): Promise<Blob>;
  compress(options: CompressionTargetOptions): Promise<Blob>;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  reset(): void;
}

export async function createEditor(
  source: HTMLImageElement | string | File
): Promise<Editor> {
  let img: HTMLImageElement;

  if (typeof source === 'string' || source instanceof File) {
    img = await loadImage(source);
  } else {
    img = source;
  }

  const originalCanvas = imageToCanvas(img);
  let currentCanvas = originalCanvas;

  const state: EditorState = {
    width: originalCanvas.width,
    height: originalCanvas.height,
    layers: [],
    adjustments: {},
    filter: 'original',
    history: [],
    historyIndex: -1,
  };

  function saveState(): void {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push({
      ...state,
      layers: [...state.layers],
      adjustments: { ...state.adjustments },
    });
    state.historyIndex = state.history.length - 1;
  }

  function applyAllTransformations(): HTMLCanvasElement {
    let canvas = originalCanvas;

    canvas = applyAdjustments(canvas, state.adjustments);
    canvas = applyFilter(canvas, state.filter);

    if (state.layers.length > 0) {
      const layersCanvas = renderLayersToCanvas(
        state.layers,
        state.width,
        state.height
      );
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(layersCanvas, 0, 0);
    }

    return canvas;
  }

  saveState();

  return {
    getWidth: () => currentCanvas.width,
    getHeight: () => currentCanvas.height,
    getCanvas: () => currentCanvas,

    crop: (options: CropOptions) => {
      currentCanvas = cropCanvas(currentCanvas, options);
      state.width = currentCanvas.width;
      state.height = currentCanvas.height;
      saveState();
    },

    resize: (options: ResizeOptions) => {
      currentCanvas = resizeCanvas(currentCanvas, options);
      state.width = currentCanvas.width;
      state.height = currentCanvas.height;
      saveState();
    },

    rotate: (options: RotateOptions) => {
      currentCanvas = rotateCanvas(currentCanvas, options);
      state.width = currentCanvas.width;
      state.height = currentCanvas.height;
      saveState();
    },

    flip: (options: FlipOptions) => {
      currentCanvas = flipCanvas(currentCanvas, options);
      saveState();
    },

    adjust: (adjustments: Adjustments) => {
      state.adjustments = { ...state.adjustments, ...adjustments };
      currentCanvas = applyAllTransformations();
      saveState();
    },

    applyFilter: (filter: FilterPreset) => {
      state.filter = filter;
      currentCanvas = applyAllTransformations();
      saveState();
    },

    addLayer: (layer: Layer) => {
      const maxZ = getMaxZIndex(state.layers);
      layer.zIndex = maxZ + 1;
      state.layers.push(layer);
      currentCanvas = applyAllTransformations();
      saveState();
    },

    removeLayer: (layerId: string) => {
      state.layers = state.layers.filter((l) => l.id !== layerId);
      currentCanvas = applyAllTransformations();
      saveState();
    },

    getLayers: () => [...state.layers],

    export: async (options: ExportOptions): Promise<Blob> => {
      let blob = await convertImage(currentCanvas, options);

      if (options.metadata) {
        blob = await exportWithMetadata(blob, options.format, options.metadata);
      }

      return blob;
    },

    compress: async (options: CompressionTargetOptions): Promise<Blob> => {
      const result = await compressToTargetSize(currentCanvas, options);

      if (options.metadata) {
        return exportWithMetadata(result.blob, options.format, options.metadata);
      }

      return result.blob;
    },

    undo: () => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const prev = state.history[state.historyIndex];
        state.width = prev.width;
        state.height = prev.height;
        state.layers = [...prev.layers];
        state.adjustments = { ...prev.adjustments };
        state.filter = prev.filter;
        currentCanvas = applyAllTransformations();
      }
    },

    redo: () => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const next = state.history[state.historyIndex];
        state.width = next.width;
        state.height = next.height;
        state.layers = [...next.layers];
        state.adjustments = { ...next.adjustments };
        state.filter = next.filter;
        currentCanvas = applyAllTransformations();
      }
    },

    canUndo: () => state.historyIndex > 0,
    canRedo: () => state.historyIndex < state.history.length - 1,

    reset: () => {
      currentCanvas = originalCanvas;
      state.width = originalCanvas.width;
      state.height = originalCanvas.height;
      state.layers = [];
      state.adjustments = {};
      state.filter = 'original';
      state.history = [];
      state.historyIndex = -1;
      saveState();
    },
  };
}
