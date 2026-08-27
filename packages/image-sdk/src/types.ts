export const VERSION = '1.0.0';

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'bmp';

export interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface ImageInfo {
  width: number;
  height: number;
  format: ImageFormat;
  size: number;
  metadata?: MetadataInfo;
}

export interface MetadataInfo {
  exif?: Record<string, unknown>;
  xmp?: Record<string, unknown>;
  custom?: Record<string, unknown>;
}

export interface ExportOptions {
  format: ImageFormat;
  quality?: number;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  metadata?: MetadataOptions;
  onProgress?: ProgressCallback;
}

export interface MetadataOptions {
  preserve?: boolean;
  remove?: boolean;
  custom?: Record<string, unknown>;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RotateOptions {
  degrees: number;
  backgroundColor?: string;
}

export interface FlipOptions {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface Adjustments {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  exposure?: number;
  highlights?: number;
  shadows?: number;
  temperature?: number;
  tint?: number;
  sharpness?: number;
  blur?: number;
  opacity?: number;
  grayscale?: boolean;
  sepia?: boolean;
}

export type FilterPreset = 
  | 'original' 
  | 'vintage' 
  | 'blackAndWhite' 
  | 'warm' 
  | 'cool' 
  | 'cinematic' 
  | 'fade' 
  | 'dramatic' 
  | 'soft' 
  | 'highContrast';

export interface Layer {
  id: string;
  type: 'background' | 'image' | 'text' | 'shape';
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface TextLayer extends Layer {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
}

export interface ShapeLayer extends Layer {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface ImageLayer extends Layer {
  type: 'image';
  imageElement: HTMLImageElement;
  originalWidth: number;
  originalHeight: number;
}

export interface EditorState {
  width: number;
  height: number;
  layers: Layer[];
  adjustments: Adjustments;
  filter: FilterPreset;
  history: EditorState[];
  historyIndex: number;
}

export interface ProgressEvent {
  phase: string;
  percent: number;
  message: string;
}

export type ProgressCallback = (event: ProgressEvent) => void;

export interface CompressionTargetOptions extends ExportOptions {
  targetSize?: number;
  tolerance?: number;
  maxFileSize?: number;
  maxDimension?: number;
}

export interface CompressionPreview {
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  estimatedSize: number;
  estimatedSavingsPercent: number;
  recommendedFormat: ImageFormat;
  recommendedQuality: number;
}

export interface CompressionResult {
  blob: Blob;
  actualSize: number;
  targetSize?: number;
  withinTarget: boolean;
  quality: number;
  format: ImageFormat;
}

export type CompressionPreset = 'web' | 'email' | 'print' | 'thumbnail';

export interface ValidationResult {
  valid: boolean;
  size: number;
  maxSize?: number;
  message: string;
}
