export { VERSION } from './types';
export type {
  ImageFormat,
  ImageData,
  ImageInfo,
  MetadataInfo,
  ExportOptions,
  MetadataOptions,
  ResizeOptions,
  CropOptions,
  RotateOptions,
  FlipOptions,
  Adjustments,
  FilterPreset,
  Layer,
  TextLayer,
  ShapeLayer,
  ImageLayer,
  EditorState,
  ProgressEvent,
  ProgressCallback,
  CompressionTargetOptions,
  CompressionPreview,
  CompressionResult,
  CompressionPreset,
  ValidationResult,
} from './types';

export {
  validateFile,
  detectFormat,
  loadImage,
  getImageInfo,
  imageToCanvas,
  canvasToImageData,
  imageDataToCanvas,
} from './loader';

export { cropImage, cropCanvas } from './crop';
export { resizeImage, resizeCanvas } from './resize';
export {
  rotateImage,
  flipImage,
  rotateCanvas,
  flipCanvas,
} from './transform';

export { applyAdjustments } from './adjustments';
export {
  applyFilter,
  getFilterConfig,
  getFilterName,
  AVAILABLE_FILTERS,
} from './filters';

export {
  convertImage,
  convertToFile,
  getMimeType,
  getExtension,
  getSupportedFormats,
  isFormatSupported,
} from './convert';

export {
  createTextLayer,
  createShapeLayer,
  createImageLayer,
  sortLayersByZIndex,
  getMaxZIndex,
  moveLayerUp,
  moveLayerDown,
  duplicateLayer,
  renderLayersToCanvas,
} from './layers';

export {
  readMetadata,
  generateCustomMetadata,
  exportWithMetadata,
  removeMetadata,
} from './metadata';

export { createEditor } from './editor';
export type { Editor } from './editor';

export {
  createZoomState,
  zoomIn,
  zoomOut,
  zoomToFit,
  zoomTo100,
  pan,
  zoomAtPoint,
  getCanvasTransform,
} from './zoom';
export type { ZoomState } from './zoom';

export {
  EXPORT_PRESETS,
  getExportPreset,
  getPresetsByCategory,
} from './presets';
export type { ExportPreset } from './presets';

export {
  processInWorker,
  isWorkerSupported,
  terminateWorker,
} from './worker';

export {
  batchProcess,
  downloadBatchResult,
  downloadAllBatchResults,
} from './batch';
export type {
  BatchOperation,
  BatchResult,
  BatchProgress,
  BatchProgressCallback,
} from './batch';

export {
  compressToTargetSize,
  validateFileSize,
  getCompressionPreview,
  smartCompress,
} from './compress';

export {
  DRP_NAME,
  DRP_VERSION,
  DRP_TAG,
  getDRPVersion,
  getDRPInfo,
  getDRPFilename,
  isDRPFile,
  stripDRPTag,
} from './drp';

export { DRP } from './drp-class';
export type { DRPResult, DRPOptions } from './drp-class';
