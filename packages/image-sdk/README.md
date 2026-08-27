# DRP

**One line. Any combination. Image processing for JavaScript.**

[![npm version](https://img.shields.io/npm/v/drp-imagesdk.svg)](https://www.npmjs.com/package/drp-imagesdk)
[![license](https://img.shields.io/npm/l/drp-imagesdk.svg)](https://github.com/DarpanAdhikari/image-conversions/blob/main/LICENSE)

DRP (Digital Resolution Pro) is a single-method image SDK. Pass any combination of options — format, compression, resize, crop, filter, rotate — and the pipeline builds itself.

```typescript
import { DRP } from 'drp-imagesdk';

const result = await DRP(file, {
  format: 'webp',
  targetSize: '500KB',
  width: 800,
  filter: 'vintage',
});
// result.blob — processed image ready to use
```

No chains. No config. Just `DRP()`.

---

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Why DRP](#why-drp)
- [Recipes](#recipes)
- [DRP Options](#drp-options)
- [Static Methods](#static-methods)
- [Compression](#compression)
- [Editor](#editor)
- [Filters](#filters)
- [Batch Processing](#batch-processing)
- [Export Presets](#export-presets)
- [Modular Imports](#modular-imports)
- [Supported Formats](#supported-formats)
- [Browser Support](#browser-support)
- [Development](#development)
- [License](#license)

---

## Install

```bash
npm install drp-imagesdk
```

Or use a CDN:

```html
<script src="https://unpkg.com/drp-imagesdk/dist/image-sdk.min.js"></script>
<script>
  // Available globally as window.DRP
</script>
```

---

## Quick Start

```typescript
import { DRP } from 'drp-imagesdk';

// 1. Read any source
const result = await DRP(file); // File, Blob, URL string, HTMLImageElement, or canvas

// 2. Add any options
const result = await DRP(file, {
  format: 'webp',      // convert
  width: 800,           // resize
  rotate: 90,           // rotate
  filter: 'warm',      // filter
  quality: 85,          // quality
});

// 3. Use the result
const url = URL.createObjectURL(result.blob);
```

The pipeline runs automatically: **load → crop → resize → rotate → flip → adjustments → filter → encode → metadata**. You only specify what you need.

---

## Why DRP

**One method, not twenty.** Every operation goes through `DRP()`. No need to learn separate functions for resize, crop, convert, compress.

**Any combination.** Mix resize + convert + filter + compress in one call. The order is always correct.

**Target size compression.** Say `targetSize: '500KB'` and DRP uses binary search to hit your file size goal — automatically.

---

## Recipes

### I want to resize an image

```typescript
const result = await DRP(file, { width: 800 });
```

### I want to convert to WebP

```typescript
const result = await DRP(file, { format: 'webp', quality: 85 });
```

### I want to compress to a specific file size

```typescript
const result = await DRP(file, { targetSize: '200KB' });
```

### I want to crop and resize

```typescript
const result = await DRP(file, {
  crop: { x: 100, y: 50, width: 400, height: 300 },
  width: 800,
});
```

### I want to rotate and flip

```typescript
const result = await DRP(file, { rotate: 90, flip: 'horizontal' });
```

### I want to apply a filter

```typescript
const result = await DRP(file, { filter: 'cinematic' });
```

### I want to resize and compress for web

```typescript
const result = await DRP(file, {
  width: 1200,
  format: 'webp',
  targetSize: '300KB',
});
```

### I want to do everything at once

```typescript
const result = await DRP(file, {
  crop: { x: 0, y: 0, width: 500, height: 500 },
  width: 400,
  height: 400,
  rotate: 180,
  flip: 'horizontal',
  filter: 'vintage',
  adjustments: { brightness: 10, contrast: 15 },
  format: 'webp',
  quality: 90,
  metadata: { preserve: true },
});
```

---

## DRP Options

All options are optional. Pass only what you need.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `'jpeg' \| 'png' \| 'webp' \| 'avif' \| 'gif' \| 'bmp'` | `'webp'` | Output format |
| `quality` | `number` | `80` | Quality 1–100 (JPEG/WebP/AVIF) |
| `targetSize` | `string \| number` | — | Target file size. String: `'500KB'`, `'2MB'`. Number: bytes |
| `tolerance` | `number` | `10` | Target size tolerance % |
| `width` | `number` | — | Target width in pixels |
| `height` | `number` | — | Target height in pixels |
| `maintainAspectRatio` | `boolean` | `true` | Keep aspect ratio when resizing |
| `crop` | `{ x, y, width, height }` | — | Crop region (pixels from top-left) |
| `rotate` | `number` | — | Rotation in degrees |
| `flip` | `'horizontal' \| 'vertical' \| 'both'` | — | Flip direction |
| `filter` | `FilterPreset` | — | Filter preset name (see [Filters](#filters)) |
| `adjustments` | `Adjustments` | — | Color/tone adjustments (see below) |
| `metadata` | `{ preserve?, remove?, custom? }` | — | Metadata handling |
| `onProgress` | `(event) => void` | — | Progress callback |

### Adjustments

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `brightness` | `number` | -100 to 100 | Brightness |
| `contrast` | `number` | -100 to 100 | Contrast |
| `saturation` | `number` | -100 to 100 | Color saturation |
| `temperature` | `number` | -100 to 100 | Warm/cool shift |
| `tint` | `number` | -100 to 100 | Green/magenta shift |
| `exposure` | `number` | -100 to 100 | Exposure |
| `highlights` | `number` | -100 to 100 | Highlight recovery |
| `shadows` | `number` | -100 to 100 | Shadow recovery |
| `sharpness` | `number` | 0 to 100 | Sharpness |
| `blur` | `number` | 0 to 20 | Blur radius |
| `opacity` | `number` | 0 to 100 | Opacity |
| `grayscale` | `boolean` | — | Convert to grayscale |
| `sepia` | `boolean` | — | Apply sepia tone |

### Metadata Options

| Property | Type | Description |
|----------|------|-------------|
| `preserve` | `boolean` | Preserve existing EXIF/metadata |
| `remove` | `boolean` | Strip all metadata |
| `custom` | `Record<string, unknown>` | Embed custom key-value metadata |

### DRP Result

```typescript
interface DRPResult {
  blob: Blob;         // Processed image
  size: number;       // Output file size in bytes
  format: string;     // Output format used
  quality: number;    // Quality applied
  width: number;      // Output width
  height: number;     // Output height
}
```

---

## Static Methods

```typescript
import { DRP } from 'drp-imagesdk';
```

### `DRP.editor(source)`

Creates a full editor instance with undo/redo, layers, and interactive editing.

```typescript
const editor = await DRP.editor(file);

editor.crop({ x: 0, y: 0, width: 400, height: 300 });
editor.resize({ width: 800 });
editor.adjust({ brightness: 20, contrast: 10 });
editor.applyFilter('cinematic');

const blob = await editor.export({ format: 'png' });
```

### `DRP.batch(files, operation, onProgress?)`

Process multiple files at once.

```typescript
const results = await DRP.batch(files, {
  type: 'resize',
  options: { width: 800 },
});

// results: Array<{ blob, file, success, error? }>
```

### `DRP.validate(file, maxSize?)`

Check if a file meets size requirements.

```typescript
const result = DRP.validate(file, 5 * 1024 * 1024); // 5MB limit
// result: { valid: boolean, size: number, maxSize?: number, message: string }
```

### `DRP.preview(source, format?)`

Get compression estimates before processing.

```typescript
const preview = await DRP.preview(file, 'jpeg');
// preview: { originalSize, estimatedSize, estimatedSavingsPercent, recommendedFormat, recommendedQuality }
```

### `DRP.readMetadata(source)`

Read EXIF and metadata from an image.

```typescript
const metadata = await DRP.readMetadata(file);
// metadata: { exif?, xmp?, custom? }
```

### `DRP.version()`

Returns the SDK version string.

### `DRP.formats()`

Returns supported format list: `['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp']`

### `DRP.filters()`

Returns available filter presets: `['original', 'vintage', 'blackAndWhite', ...]`

---

## Compression

DRP uses binary search over quality levels to hit your target file size — automatically.

### Target Size

```typescript
// String format
const result = await DRP(file, { targetSize: '500KB' });
const result = await DRP(file, { targetSize: '2MB' });

// Bytes
const result = await DRP(file, { targetSize: 512000 });
```

### Compression Presets

```typescript
import { smartCompress } from 'drp-imagesdk';

const result = await smartCompress(file, 'web');      // Web-optimized
const result = await smartCompress(file, 'email');    // Email-friendly
const result = await smartCompress(file, 'print');    // Print quality
const result = await smartCompress(file, 'thumbnail'); // Thumbnail
```

| Preset | Format | Quality | Max Dimension | Target Size |
|--------|--------|---------|---------------|-------------|
| `web` | WebP | 75 | 1920px | 500 KB |
| `email` | JPEG | 70 | 800px | 1 MB |
| `print` | JPEG | 95 | 3000px | — |
| `thumbnail` | WebP | 60 | 400px | 100 KB |

### Preview Before Compressing

```typescript
import { getCompressionPreview } from 'drp-imagesdk';

const preview = await getCompressionPreview(file, 'webp');
console.log(preview.originalSize);          // 2.4 MB
console.log(preview.estimatedSize);         // ~180 KB
console.log(preview.estimatedSavingsPercent); // 92%
console.log(preview.recommendedFormat);     // 'webp'
```

---

## Editor

The editor provides non-destructive editing with full undo/redo history and layer support.

```typescript
const editor = await DRP.editor(file);

// Transform
editor.crop({ x: 50, y: 50, width: 400, height: 300 });
editor.resize({ width: 800, maintainAspectRatio: true });
editor.rotate({ degrees: 45 });
editor.flip({ horizontal: true });

// Adjust
editor.adjust({ brightness: 20, contrast: 10, saturation: -15 });
editor.applyFilter('vintage');

// Layers
import { createTextLayer, createShapeLayer } from 'drp-imagesdk';

editor.addLayer(createTextLayer({
  content: 'Hello World',
  fontSize: 48,
  color: '#ffffff',
  x: 50,
  y: 50,
}));

editor.addLayer(createShapeLayer({
  shapeType: 'rectangle',
  fill: '#3b82f6',
  x: 100,
  y: 100,
  width: 200,
  height: 100,
}));

// Undo/Redo
editor.undo();
editor.redo();
editor.reset();

// Export
const blob = await editor.export({ format: 'png', quality: 90 });
```

### Compression from Editor

```typescript
// Compress to target size from the editor
const blob = await editor.compress({
  format: 'webp',
  targetSize: '200KB',
  quality: 80,
});
```

### Layer Types

| Factory | Type | Description |
|---------|------|-------------|
| `createTextLayer(options?)` | `TextLayer` | Text with font, size, color, alignment |
| `createShapeLayer(options?)` | `ShapeLayer` | Rectangle, circle, or line |
| `createImageLayer(img, options?)` | `ImageLayer` | Embedded image |

---

## Filters

```typescript
const result = await DRP(file, { filter: 'vintage' });
```

| Preset | Description |
|--------|-------------|
| `original` | No filter |
| `vintage` | Warm, faded vintage look |
| `blackAndWhite` | High-contrast black & white |
| `warm` | Warm color temperature |
| `cool` | Cool color temperature |
| `cinematic` | Movie-like color grading |
| `fade` | Low-contrast faded look |
| `dramatic` | High contrast, desaturated |
| `soft` | Soft, slightly blurred |
| `highContrast` | Increased contrast and punch |

List all filters programmatically:

```typescript
import { AVAILABLE_FILTERS, getFilterName } from 'drp-imagesdk';

AVAILABLE_FILTERS.forEach((f) => {
  console.log(`${f} → ${getFilterName(f)}`);
});
```

---

## Batch Processing

Process multiple files with a single operation.

```typescript
import { DRP } from 'drp-imagesdk';

// Resize all files to 800px width
const results = await DRP.batch(files, {
  type: 'resize',
  options: { width: 800, maintainAspectRatio: true },
});

// Convert all to WebP
const results = await DRP.batch(files, {
  type: 'convert',
  options: { format: 'webp', quality: 85 },
});

// Compress all to target size
const results = await DRP.batch(files, {
  type: 'compress',
  options: { format: 'webp', targetSize: 200 * 1024 },
});

// Apply filter to all
const results = await DRP.batch(files, {
  type: 'filter',
  options: { preset: 'cinematic' },
});
```

### Download Batch Results

```typescript
import { downloadBatchResult, downloadAllBatchResults } from 'drp-imagesdk';

// Download one
downloadBatchResult(results[0]);

// Download all
await downloadAllBatchResults(results);
```

---

## Export Presets

Pre-configured dimensions for popular social media platforms.

```typescript
import { EXPORT_PRESETS, getExportPreset, getPresetsByCategory } from 'drp-imagesdk';

// Get a specific preset
const preset = getExportPreset('instagram-post');
// { name: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080, category: 'Instagram' }

// Get all presets grouped by platform
const grouped = getPresetsByCategory();
// { Instagram: [...], Twitter: [...], Facebook: [...], YouTube: [...], ... }

// Use a preset with DRP
const preset = getExportPreset('youtube-thumbnail');
const result = await DRP(file, { width: preset.width, height: preset.height });
```

### Available Presets

| Platform | Preset Name | Dimensions |
|----------|-------------|------------|
| Instagram | `instagram-post` | 1080 × 1080 |
| Instagram | `instagram-story` | 1080 × 1920 |
| Instagram | `instagram-reel` | 1080 × 1920 |
| Twitter | `twitter-post` | 1200 × 675 |
| Twitter | `twitter-header` | 1500 × 500 |
| Facebook | `facebook-post` | 1200 × 630 |
| Facebook | `facebook-cover` | 820 × 312 |
| YouTube | `youtube-thumbnail` | 1280 × 720 |
| YouTube | `youtube-banner` | 2560 × 1440 |
| LinkedIn | `linkedin-post` | 1200 × 627 |
| LinkedIn | `linkedin-cover` | 1584 × 396 |
| Pinterest | `pinterest-pin` | 1000 × 1500 |
| TikTok | `tiktok` | 1080 × 1920 |

---

## Modular Imports

For tree-shaking or advanced use, import individual operations:

```typescript
// Single operations
import { resizeImage, cropImage, rotateImage, flipImage } from 'drp-imagesdk';
import { convertImage, getSupportedFormats } from 'drp-imagesdk';
import { applyFilter, AVAILABLE_FILTERS } from 'drp-imagesdk';
import { compressToTargetSize, smartCompress, getCompressionPreview } from 'drp-imagesdk';
import { readMetadata, exportWithMetadata } from 'drp-imagesdk';

// Editor
import { createEditor } from 'drp-imagesdk';

// Batch
import { batchProcess } from 'drp-imagesdk';

// Layers
import { createTextLayer, createShapeLayer, createImageLayer } from 'drp-imagesdk';

// Types
import type { ImageFormat, FilterPreset, DRPOptions, DRPResult, Editor } from 'drp-imagesdk';
```

### Individual Operation Examples

```typescript
import { resizeImage, convertImage } from 'drp-imagesdk';

// Resize
const canvas = await resizeImage(file, { width: 800, maintainAspectRatio: true });

// Convert
const blob = await convertImage(file, { format: 'webp', quality: 85 });

// Chain operations manually
const resized = await resizeImage(file, { width: 400 });
const blob = await convertImage(resized, { format: 'jpeg', quality: 90 });
```

---

## Supported Formats

| Format | Read | Write | Quality Control | Metadata |
|--------|------|-------|-----------------|----------|
| JPEG | Yes | Yes | Yes | Yes |
| PNG | Yes | Yes | — | Yes |
| WebP | Yes | Yes | Yes | Yes |
| AVIF | Yes | Yes | Yes | Limited |
| GIF | Yes | Yes | — | Limited |
| BMP | Yes | Yes | — | Limited |

---

## Browser Support

DRP requires the Canvas API, supported in all modern browsers:

- Chrome 4+
- Firefox 2+
- Safari 3.1+
- Edge 12+

**Format-specific notes:**
- **WebP** — All modern browsers
- **AVIF** — Chrome 85+, Firefox 93+, Safari 16.4+
- **Worker processing** — Available when `Worker` and `OffscreenCanvas` are supported

---

## Development

This is a monorepo. The SDK is at `packages/image-sdk`, the demo site is at `apps/demo`.

### Setup

```bash
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start demo dev server |
| `npm run build` | Build all packages |
| `npm run build:sdk` | Build SDK only |
| `npm run build:demo` | Build demo only |
| `npm run test` | Run all tests |
| `npm run test:sdk` | Run SDK tests |
| `npm run lint` | Lint all packages |

### Project Structure

```
drp-imagesdk/
├── packages/
│   └── image-sdk/          # The SDK (drp-imagesdk on npm)
│       ├── src/
│       │   ├── index.ts           # All exports
│       │   ├── drp-class.ts       # DRP() single method
│       │   ├── compress.ts        # Compression engine
│       │   ├── editor.ts          # Editor with undo/redo
│       │   ├── batch.ts           # Batch processing
│       │   ├── convert.ts         # Format conversion
│       │   ├── resize.ts          # Resize operations
│       │   ├── crop.ts            # Crop operations
│       │   ├── transform.ts       # Rotate & flip
│       │   ├── filters.ts         # 10 filter presets
│       │   ├── adjustments.ts     # Color/tone adjustments
│       │   ├── layers.ts          # Text, shape, image layers
│       │   ├── metadata.ts        # EXIF read & write
│       │   ├── presets.ts         # Social media presets
│       │   ├── loader.ts          # File validation & loading
│       │   ├── worker.ts          # Web Worker processing
│       │   └── zoom.ts            # Zoom & pan utilities
│       ├── rollup.config.js       # UMD/IIFE bundle config
│       └── package.json
└── apps/
    └── demo/               # Demo website (drp-imagesdk in action)
```

---

## License

MIT
