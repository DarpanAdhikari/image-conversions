import { Layer, TextLayer, ShapeLayer, ImageLayer } from './types';

let layerCounter = 0;

export function generateLayerId(): string {
  return `layer_${Date.now()}_${++layerCounter}`;
}

export function createTextLayer(options: Partial<TextLayer> = {}): TextLayer {
  return {
    id: generateLayerId(),
    type: 'text',
    name: options.name || 'Text',
    visible: true,
    locked: false,
    opacity: options.opacity ?? 100,
    x: options.x ?? 50,
    y: options.y ?? 50,
    width: options.width ?? 200,
    height: options.height ?? 50,
    rotation: options.rotation ?? 0,
    zIndex: options.zIndex ?? 0,
    content: options.content || 'Hello World',
    fontFamily: options.fontFamily || 'Arial',
    fontSize: options.fontSize ?? 24,
    fontWeight: options.fontWeight || 'normal',
    color: options.color || '#000000',
    alignment: options.alignment || 'left',
    letterSpacing: options.letterSpacing ?? 0,
    lineHeight: options.lineHeight ?? 1.5,
  };
}

export function createShapeLayer(options: Partial<ShapeLayer> = {}): ShapeLayer {
  return {
    id: generateLayerId(),
    type: 'shape',
    name: options.name || 'Shape',
    visible: true,
    locked: false,
    opacity: options.opacity ?? 100,
    x: options.x ?? 50,
    y: options.y ?? 50,
    width: options.width ?? 100,
    height: options.height ?? 100,
    rotation: options.rotation ?? 0,
    zIndex: options.zIndex ?? 0,
    shapeType: options.shapeType || 'rectangle',
    fill: options.fill || '#3b82f6',
    stroke: options.stroke || '#1e40af',
    strokeWidth: options.strokeWidth ?? 2,
  };
}

export function createImageLayer(
  imageElement: HTMLImageElement,
  options: Partial<ImageLayer> = {}
): ImageLayer {
  return {
    id: generateLayerId(),
    type: 'image',
    name: options.name || 'Image',
    visible: true,
    locked: false,
    opacity: options.opacity ?? 100,
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? imageElement.width,
    height: options.height ?? imageElement.height,
    rotation: options.rotation ?? 0,
    zIndex: options.zIndex ?? 0,
    imageElement,
    originalWidth: imageElement.width,
    originalHeight: imageElement.height,
  };
}

export function sortLayersByZIndex(layers: Layer[]): Layer[] {
  return [...layers].sort((a, b) => a.zIndex - b.zIndex);
}

export function getMaxZIndex(layers: Layer[]): number {
  if (layers.length === 0) return 0;
  return Math.max(...layers.map((l) => l.zIndex));
}

export function moveLayerUp(layers: Layer[], layerId: string): Layer[] {
  const index = layers.findIndex((l) => l.id === layerId);
  if (index === -1 || index === layers.length - 1) return layers;

  const newLayers = [...layers];
  const current = newLayers[index];
  const next = newLayers[index + 1];

  newLayers[index] = { ...next, zIndex: current.zIndex };
  newLayers[index + 1] = { ...current, zIndex: next.zIndex };

  return newLayers;
}

export function moveLayerDown(layers: Layer[], layerId: string): Layer[] {
  const index = layers.findIndex((l) => l.id === layerId);
  if (index <= 0) return layers;

  const newLayers = [...layers];
  const current = newLayers[index];
  const prev = newLayers[index - 1];

  newLayers[index] = { ...prev, zIndex: current.zIndex };
  newLayers[index - 1] = { ...current, zIndex: prev.zIndex };

  return newLayers;
}

export function duplicateLayer(layer: Layer): Layer {
  const newLayer = { ...layer };
  newLayer.id = generateLayerId();
  newLayer.name = `${layer.name} Copy`;
  return newLayer;
}

export function renderLayersToCanvas(
  layers: Layer[],
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const sortedLayers = sortLayersByZIndex(layers);

  for (const layer of sortedLayers) {
    if (!layer.visible) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity / 100;

    if (layer.rotation !== 0) {
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    switch (layer.type) {
      case 'text':
        renderTextLayer(ctx, layer as TextLayer);
        break;
      case 'shape':
        renderShapeLayer(ctx, layer as ShapeLayer);
        break;
      case 'image':
        renderImageLayer(ctx, layer as ImageLayer);
        break;
    }

    ctx.restore();
  }

  return canvas;
}

function renderTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer): void {
  ctx.fillStyle = layer.color;
  ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
  ctx.textAlign = layer.alignment;
  ctx.textBaseline = 'top';

  const lines = layer.content.split('\n');
  const lineHeight = layer.fontSize * layer.lineHeight;

  lines.forEach((line, index) => {
    ctx.fillText(line, layer.x, layer.y + index * lineHeight);
  });
}

function renderShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer): void {
  ctx.fillStyle = layer.fill;
  ctx.strokeStyle = layer.stroke;
  ctx.lineWidth = layer.strokeWidth;

  switch (layer.shapeType) {
    case 'rectangle':
      ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
      ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.ellipse(
        layer.x + layer.width / 2,
        layer.y + layer.height / 2,
        layer.width / 2,
        layer.height / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();
      break;
    case 'line':
      ctx.beginPath();
      ctx.moveTo(layer.x, layer.y);
      ctx.lineTo(layer.x + layer.width, layer.y + layer.height);
      ctx.stroke();
      break;
  }
}

function renderImageLayer(ctx: CanvasRenderingContext2D, layer: ImageLayer): void {
  ctx.drawImage(layer.imageElement, layer.x, layer.y, layer.width, layer.height);
}
