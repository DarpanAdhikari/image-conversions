# MASTER PROJECT PROMPT

Build a production-quality **modular image editing, processing, conversion, and metadata NPM SDK**, together with a complete **interactive demo website** that consumes the SDK.

The most important architectural principle is:

> **The NPM SDK is the actual product. The demo website is a real consumer of the SDK and demonstrates what developers can build with it.**

Do NOT build the demo as an independent image-processing application with duplicated logic.

The demo must use the SDK's public APIs for all image-processing functionality.

The result should be a monorepo containing:

```text id="b7s3k4"
image-platform/
│
├── packages/
│   └── image-sdk/
│       ├── src/
│       ├── tests/
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── apps/
│   └── demo/
│       ├── src/
│       ├── public/
│       └── package.json
│
├── package.json
├── README.md
└── LICENSE
```

Use a different structure if technically superior, but maintain the same separation:

```text
NPM SDK
   ↓
Public API
   ↓
Demo Application
```

---

# 1. PRODUCT GOAL

Create an SDK that allows developers to integrate image-processing capabilities into their own applications.

The SDK should support, where technically practical:

* Image loading
* Image decoding
* Image rendering
* Crop
* Resize
* Rotate
* Flip
* Image adjustments
* Filters
* Text layers
* Shape layers
* Image layers
* Layer management
* Non-destructive editing
* Image format conversion
* Metadata reading
* Metadata preservation
* Custom metadata
* Image export
* File validation
* Browser processing
* Web Worker/off-main-thread processing where useful

The demo website should showcase all implemented functionality.

---

# 2. CORE ARCHITECTURE

The SDK is the core engine.

The demo is a consumer.

Architecture:

```text id="m0n9p2"
                    ┌─────────────────────────┐
                    │     @our-org/image-sdk  │
                    │                         │
                    │ Core Image Engine       │
                    │ Editing                 │
                    │ Rendering               │
                    │ Conversion              │
                    │ Metadata                │
                    │ Export                  │
                    │ Validation              │
                    └────────────┬────────────┘
                                 │
                         Public SDK API
                                 │
                 ┌───────────────▼────────────────┐
                 │         Demo Application       │
                 │                                │
                 │ Landing Page                   │
                 │ Feature Showcase               │
                 │ Photo Editor                   │
                 │ Converter                      │
                 │ Metadata Playground            │
                 │ Developer Playground            │
                 │ Documentation                  │
                 └────────────────────────────────┘
```

The demo must never directly access internal SDK implementation files.

It should consume the SDK exactly like an external customer would.

---

# 3. NPM PACKAGE

Use TypeScript.

Suggested package:

```text
@our-org/image-sdk
```

Design the SDK to be modular and tree-shakable where practical.

Potential public imports:

```typescript
import {
  createEditor,
  convertImage,
  resizeImage,
  cropImage,
  rotateImage,
  flipImage,
  applyFilter,
  addTextLayer,
  exportImage
} from "@our-org/image-sdk";
```

Potential subpath exports if appropriate:

```text
@our-org/image-sdk/convert
@our-org/image-sdk/resize
@our-org/image-sdk/crop
@our-org/image-sdk/filters
@our-org/image-sdk/metadata
```

Choose the final API based on good TypeScript/NPM package design.

Do not create unnecessary complexity.

---

# 4. MODULAR FEATURE SYSTEM

Each feature should be independently usable.

For example:

```typescript
const output = await convertImage(file, {
  format: "webp",
  quality: 85
});
```

A developer should not have to initialize the complete visual editor to perform conversion.

Similarly:

```typescript
const output = await resizeImage(file, {
  width: 1200,
  maintainAspectRatio: true
});
```

should work independently.

For the full editor, provide a higher-level API such as:

```typescript
const editor = createEditor({
  image
});
```

Then:

```typescript
editor.crop(...);
editor.resize(...);
editor.rotate(...);
editor.applyFilter(...);
editor.addText(...);
```

Finally:

```typescript
const result = await editor.export({
  format: "webp",
  quality: 90
});
```

The exact API can differ, but it must be consistent, strongly typed, documented, and actually implemented.

---

# 5. FEATURE REGISTRY / PLUGIN ARCHITECTURE

Design the SDK for future extensibility.

Consider a feature/plugin architecture such as:

```typescript
createEditor({
  features: [
    cropFeature(),
    resizeFeature(),
    filtersFeature(),
    textFeature(),
    conversionFeature(),
    metadataFeature()
  ]
});
```

Or another clean architecture.

The objective is that applications can choose the functionality they need.

For example:

```text
Application A:
Crop + Resize + Conversion

Application B:
Crop + Filters + Text + Layers

Application C:
Conversion + Metadata only
```

Do not force every application to use every feature.

If a plugin system is implemented, document its lifecycle and public interfaces.

---

# 6. IMAGE EDITING

Implement genuine image processing for:

## Transformations

* Crop
* Resize
* Rotate
* Flip horizontal
* Flip vertical
* Zoom
* Pan
* Straighten where practical
* Aspect ratio handling

## Adjustments

* Brightness
* Contrast
* Saturation
* Exposure
* Highlights
* Shadows
* Temperature
* Tint
* Sharpness
* Blur
* Opacity
* Grayscale
* Sepia

## Filters

Provide presets such as:

* Original
* Vintage
* Black & White
* Warm
* Cool
* Cinematic
* Fade
* Dramatic
* Soft
* High Contrast

Filters must affect the actual rendered/exported image.

Do not simply apply CSS filters to a preview and claim the exported image was processed.

---

# 7. LAYERS

Implement a layer model.

Layers can include:

* Background
* Image
* Text
* Shape

Each layer should support appropriate properties:

```text
id
type
name
position
size
rotation
opacity
visibility
locked
z-index
```

Support:

* Add
* Delete
* Duplicate
* Rename
* Hide/show
* Lock/unlock
* Reorder
* Move
* Resize
* Rotate

---

# 8. TEXT

Support text layers with:

* Content
* Font family
* Font size
* Weight
* Color
* Opacity
* Alignment
* Letter spacing
* Line height
* Rotation
* Position

Text must be rendered into the final exported image.

---

# 9. SHAPES

Support basic shapes:

* Rectangle
* Circle
* Line
* Border

Support:

* Fill
* Stroke
* Opacity
* Position
* Size
* Rotation

---

# 10. NON-DESTRUCTIVE EDITING

Keep the original source image intact.

Conceptual pipeline:

```text id="u6j2w8"
Original Image
       ↓
Editor State
       ├── Crop
       ├── Resize
       ├── Rotation
       ├── Adjustments
       ├── Filters
       └── Layers
       ↓
Final Render
       ↓
Encoder
       ↓
Export
```

Undo/redo should operate on editor state.

Do not repeatedly destroy the original image.

---

# 11. REAL IMAGE FORMAT CONVERSION

This is a **non-negotiable requirement**.

Conversion must be actual binary image conversion.

Never change only the extension.

WRONG:

```text
photo.png
   ↓
rename
photo.jpg
```

CORRECT:

```text
PNG binary
   ↓
PNG decoder
   ↓
Raw pixels
   ↓
JPEG encoder
   ↓
JPEG binary
   ↓
photo.jpg
```

The same applies to:

```text
PNG → JPEG
JPEG → PNG
PNG → WebP
WebP → PNG
JPEG → WebP
WebP → JPEG
PNG → AVIF
JPEG → AVIF
```

and any other supported formats.

Only advertise formats that are genuinely supported.

---

# 12. SUPPORTED FORMATS

Support as many practical formats as the selected technology allows, potentially:

```text
JPEG
PNG
WebP
AVIF
GIF
BMP
TIFF
SVG
```

Clearly distinguish raster and vector formats.

Do not pretend raster-to-vector conversion is a normal file-format conversion.

If SVG import/export has limitations, document them.

If a format requires a WASM codec, Node processing, server processing, or another runtime capability, make that explicit.

---

# 13. FILE VALIDATION

Do not trust file extensions.

When importing:

* Validate MIME type where available.
* Inspect magic bytes/file signatures where practical.
* Validate actual image contents.
* Reject corrupted files.
* Reject unsupported formats.

When exporting:

* Correct MIME type
* Correct extension
* Correct binary encoding
* Valid output file

For example:

```text
photo.webp
MIME: image/webp
Binary: actual WebP
```

not a renamed PNG.

---

# 14. EXPORT API

Provide an export API.

Example:

```typescript
const output = await exportImage(image, {
  format: "webp",
  quality: 85,
  width: 1920,
  height: 1080,
  maintainAspectRatio: true
});
```

Return an appropriate binary representation such as:

```text
Blob
File
ArrayBuffer
Uint8Array
```

depending on the API design.

---

# 15. METADATA

Implement metadata functionality where technically possible.

Support:

* Reading metadata
* Preserving supported metadata
* Removing metadata
* Adding custom SDK metadata

Example:

```typescript
const output = await exportImage(image, {
  format: "webp",
  metadata: {
    preserve: true,
    custom: {
      application: "OurImageSDK",
      editorVersion: "1.0.0",
      exportedAt: new Date().toISOString()
    }
  }
});
```

Where the target format and encoder support metadata, actually embed it into the binary file.

Never claim metadata was embedded if it wasn't.

If metadata support varies by format, document the limitation.

Handle privacy-sensitive metadata such as GPS carefully.

---

# 16. PERFORMANCE

Consider:

* Web Workers
* OffscreenCanvas
* WASM codecs
* Lazy loading
* Memory management
* Avoiding unnecessary copies
* Object URL cleanup
* Large image handling
* Progress events

Expensive processing should not unnecessarily freeze the UI.

---

# 17. BROWSER / NODE SUPPORT

Design the SDK so that browser and Node functionality can be separated cleanly where necessary.

Potential structure:

```text
@our-org/image-sdk
@our-org/image-sdk/browser
@our-org/image-sdk/node
```

Only use separate packages/subpaths where actually justified.

Clearly document environment-specific limitations.

---

# 18. TESTING

Write comprehensive automated tests.

Test actual binary output, not just API responses.

## Conversion tests

```text
PNG → JPEG
JPEG → PNG
PNG → WebP
WebP → PNG
JPEG → WebP
PNG → AVIF
```

where supported.

Validate output using:

* MIME type
* File extension
* Magic bytes
* Image decoder
* Dimensions

## Editing tests

Test:

* Crop
* Resize
* Rotate
* Flip
* Brightness
* Contrast
* Saturation
* Filters
* Text
* Shapes
* Layers

## Metadata tests

Test:

* Read
* Preserve
* Remove
* Add
* Unsupported metadata behavior

---

# 19. DEMO WEBSITE

Build a complete polished website around the SDK.

The demo is not just a photo editor.

It should function as:

```text
Product Landing Page
+
Interactive Feature Showcase
+
Photo Editor
+
Image Converter
+
Metadata Playground
+
Developer Playground
+
SDK Documentation
```

---

# 20. WEBSITE NAVIGATION

Use:

```text
Logo

Features
Editor
Converter
Metadata
Playground
Documentation

GitHub
NPM

[ Get Started ]
```

---

# 21. HERO

Create a strong hero section.

Example:

```text
Build powerful image editing into your application.

A modular image editing, processing,
conversion, and metadata SDK for JavaScript.

[ Get Started ]
[ Open Editor ]

@our-org/image-sdk
```

Show an interactive visual pipeline:

```text
Upload
 ↓
Edit
 ↓
Filter
 ↓
Layers
 ↓
Convert
 ↓
Metadata
 ↓
Export
```

---

# 22. FEATURE SHOWCASE

Create interactive feature cards for:

```text
Crop
Resize
Rotate
Adjustments
Filters
Layers
Text
Shapes
Conversion
Metadata
Export
```

Each feature card should contain:

* Description
* Interactive demo where practical
* SDK API name
* Try button
* View API button

For example:

```text
Resize

Width: 1200
Height: 800

[ Run ]

const result = await resizeImage(image, {
  width: 1200,
  height: 800
});

[ Copy Code ]
```

The result must come from the actual SDK.

---

# 23. FULL PHOTO EDITOR

Create a professional editor.

Desktop layout:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Logo   File   Edit   Image   Features   Export   Help               │
├───────────────┬──────────────────────────────────┬───────────────────┤
│               │                                  │                   │
│ TOOLS         │                                  │ PROPERTIES        │
│               │                                  │                   │
│ Select        │                                  │                   │
│ Crop          │                                  │                   │
│ Resize        │             CANVAS               │ Layer Properties  │
│ Adjust        │                                  │ Adjustments       │
│ Filters       │                                  │ Filters            │
│ Text          │                                  │                   │
│ Shapes        │                                  │                   │
│ Layers        │                                  │                   │
│               │                                  │                   │
├───────────────┴──────────────────────────────────┴───────────────────┤
│ Zoom   Undo   Redo   Reset   Before/After                  Export    │
└──────────────────────────────────────────────────────────────────────┘
```

The editor must use the SDK.

Do not duplicate processing algorithms inside the demo.

---

# 24. RIGHT PROPERTIES PANEL

Dynamically display controls based on the selected tool.

Crop:

```text
Crop

Aspect Ratio
[ Free ▼ ]

Width
[ 1920 ]

Height
[ 1080 ]

☑ Maintain aspect ratio

[ Apply Crop ]
```

Text:

```text
Text

Content
[ Hello World ]

Font
[ Inter ▼ ]

Size
[ 48 ]

Weight
[ Bold ▼ ]

Opacity
[━━━━━━●━━] 85%

Rotation
[ 0° ]
```

Image:

```text
Position
X [120]
Y [80]

Size
W [800]
H [600]

Rotation
[0°]

Opacity
[━━━━━━●━━] 100%
```

---

# 25. LAYERS PANEL

Show:

```text
Layers

👁 Text
👁 Rectangle
👁 Image
👁 Background

+ Add Layer
```

Support:

* Select
* Rename
* Hide/show
* Lock/unlock
* Delete
* Duplicate
* Reorder

The UI must represent the SDK's actual layer state.

---

# 26. BEFORE / AFTER

Provide:

```text
[ Before ]
[ After ]
[ Split ]
```

Show the actual original versus processed image.

---

# 27. EXPORT MODAL

Create a polished export dialog.

```text
Export Image

Format
[ WebP ▼ ]

Quality
[━━━━━━●━━] 85%

Width
[ 1920 ]

Height
[ 1080 ]

☑ Maintain aspect ratio

Metadata

☑ Preserve supported metadata
☑ Add SDK metadata

Custom Metadata

Application
[ OurImageSDK ]

Editor Version
[ 1.0.0 ]

Exported At
[ Automatic ]

Estimated size
842 KB

[ Cancel ] [ Export & Download ]
```

Quality controls must affect the actual encoder.

---

# 28. EXPORT PIPELINE

When the user clicks Export:

```text
Editor State
     ↓
SDK Render
     ↓
SDK Processing
     ↓
SDK Layer Rendering
     ↓
SDK Encoder
     ↓
SDK Metadata
     ↓
Final Binary
     ↓
Browser Download
```

Never perform fake extension changes.

---

# 29. EXPORT PROGRESS

For expensive operations:

```text
Exporting...

██████████████████░░░░ 78%

Rendering
Encoding
Writing metadata
Preparing download
```

Show useful progress where technically possible.

---

# 30. CONVERSION PLAYGROUND

Create a dedicated conversion page.

```text
Convert Any Supported Image Format

[ Upload Image ]

Original:
PNG
1920 × 1080
2.4 MB

Convert To:
[ WebP ▼ ]

Quality:
[━━━━━━●━━] 85%

[ Convert ]

Result:
photo.webp
1.1 MB

[ Download ]
```

Show the actual conversion pipeline:

```text
PNG
 ↓
Decode
 ↓
Pixel Data
 ↓
WebP Encoder
 ↓
WebP
```

---

# 31. FORMAT SUPPORT MATRIX

Display:

```text
Format     Read     Write     Metadata
JPEG         ✓        ✓          ✓
PNG          ✓        ✓          ✓
WebP         ✓        ✓          ✓
AVIF         ✓        ✓          ✓
GIF          ✓        ✓        Limited
BMP          ✓        ✓        Limited
TIFF         ✓        ✓        Limited
SVG          ✓        —        Limited
```

Only show capabilities that are genuinely implemented.

---

# 32. METADATA PLAYGROUND

Create an interactive metadata demo.

Display:

```text
Original Metadata

Camera
Canon...

Date
...

Orientation
...

GPS
Available
```

Then:

```text
SDK Metadata

Application
OurImageSDK

Version
1.0.0

Exported At
Automatic
```

Options:

```text
☑ Preserve metadata
☐ Remove metadata
☑ Add SDK metadata
```

Export the resulting file and demonstrate actual behavior.

---

# 33. DEVELOPER PLAYGROUND

Create an interactive playground.

Feature selector:

```text
[ Resize ▼ ]
```

Configuration:

```text
Width
[1200]

Height
[800]

☑ Maintain ratio

[ Run ]
```

Result:

```text
Preview
```

Code:

```typescript
const result = await resizeImage(image, {
  width: 1200,
  height: 800,
  maintainAspectRatio: true
});
```

Buttons:

```text
[ Copy Code ]
[ Documentation ]
```

The generated example must correspond to the real public SDK API.

---

# 34. EDITOR + CODE VIEW

Provide a split view:

```text
┌──────────────────────────────┬──────────────────────────────┐
│                              │ SDK CODE                     │
│                              │                              │
│        PHOTO EDITOR          │ const editor =               │
│                              │ createEditor({ image });     │
│                              │                              │
│                              │ editor.crop(...);            │
│                              │ editor.applyFilter(...);     │
│                              │                              │
│                              │ await editor.export(...);    │
│                              │                              │
│                              │ [ Copy Code ]                │
└──────────────────────────────┴──────────────────────────────┘
```

Where practical, update the displayed code when editor settings change.

---

# 35. API SHOWCASE

Display major public APIs:

```text
Core
createEditor()
loadImage()
render()
exportImage()

Editing
cropImage()
resizeImage()
rotateImage()
flipImage()

Adjustments
adjustBrightness()
adjustContrast()
adjustSaturation()

Filters
applyFilter()

Layers
createLayer()
addTextLayer()
addShapeLayer()

Conversion
convertImage()

Metadata
readMetadata()
writeMetadata()
removeMetadata()
```

Every API should link to documentation/examples.

---

# 36. INSTALLATION

Show:

```bash
npm install @our-org/image-sdk
```

Then:

```typescript
import { convertImage } from "@our-org/image-sdk";

const result = await convertImage(file, {
  format: "webp",
  quality: 85
});
```

Provide:

```text
[ Copy Installation ]
[ Copy Example ]
```

---

# 37. BUILD YOUR OWN EDITOR

Add a section explaining the SDK's value.

```text
Build your own image editor.

Choose only the features your application needs.

✓ Crop
✓ Resize
✓ Filters
✓ Text
✓ Shapes
✓ Layers
✓ Conversion
✓ Metadata
✓ Export
```

Show an example based on the actual API.

---

# 38. RESPONSIVE DESIGN

Desktop:

```text
Tools | Canvas | Properties
```

Mobile:

```text
┌─────────────────────────┐
│ Logo              Export│
├─────────────────────────┤
│                         │
│         Canvas          │
│                         │
├─────────────────────────┤
│ Crop | Resize | Adjust  │
├─────────────────────────┤
│ Properties              │
└─────────────────────────┘
```

Use:

* Bottom sheets
* Collapsible panels
* Touch-friendly controls
* Pinch-to-zoom where practical
* Touch dragging
* Mobile-friendly sliders

Do not merely shrink the desktop layout.

---

# 39. ACCESSIBILITY

Implement:

* Keyboard navigation
* Focus states
* ARIA labels
* Accessible sliders
* Accessible dropdowns
* Sufficient contrast
* Screen-reader-friendly controls

Useful shortcuts:

```text
Ctrl/Cmd + Z       Undo
Ctrl/Cmd + Shift+Z Redo
Ctrl/Cmd + S       Export
Delete             Delete Layer
Esc                Cancel
```

---

# 40. EMPTY STATE

Before upload:

```text
Upload an image

Drag & drop your image here

[ Choose Image ]

PNG • JPEG • WebP • AVIF
```

Also support clipboard paste where practical.

---

# 41. ERROR HANDLING

Errors must be clear.

Example:

```text
Unable to export image

AVIF encoding is unavailable in this environment.

Try:
• WebP
• JPEG
• PNG

[ Change Format ]
```

Never present an invalid file as successfully exported.

---

# 42. DESIGN SYSTEM

The demo should look like a professional commercial developer product.

Prioritize:

* Clean spacing
* Strong hierarchy
* Consistent typography
* Consistent buttons
* Consistent panels
* Clear active states
* Subtle transitions
* Professional light/dark themes
* Responsive design
* Excellent loading states
* Excellent empty states
* Excellent error states

Avoid:

* Excessive gradients
* Excessive shadows
* Excessive rounded cards
* Clutter
* Random colors
* Unnecessary animations
* Prototype-like UI

---

# 43. PERFORMANCE

The demo should be performant even with large images.

Use the SDK's optimized APIs.

Consider:

* Web Workers
* OffscreenCanvas
* WASM
* Lazy loading
* Memory cleanup
* Object URL cleanup
* Avoid unnecessary image copies

---

# 44. DOCUMENTATION

Provide documentation for:

* Installation
* Quick start
* Browser usage
* Node usage if supported
* Editor API
* Conversion API
* Metadata API
* Filters
* Layers
* Export
* Supported formats
* Runtime limitations
* Examples

Each feature should include:

```text
Description
API
Parameters
Return value
Example
Supported environments
Limitations
```

---

# 45. DEMO MUST BE A REAL SDK CONSUMER

This is one of the most important requirements.

The demo should use:

```text
@our-org/image-sdk
```

through its public APIs.

Do not:

* Import private SDK files
* Duplicate algorithms
* Create demo-only conversion logic
* Create fake metadata logic
* Use filename extension changes
* Fake unsupported formats
* Show fake SDK code

The demo should be capable of proving that the SDK works.

---

# 46. SDK FEATURE → DEMO FEATURE

Every feature should follow this relationship:

```text
SDK Feature
     ↓
Public API
     ↓
Demo UI
     ↓
User Interaction
     ↓
SDK Function
     ↓
Actual Result
```

Example:

```text
User clicks Crop
       ↓
Demo Crop UI
       ↓
cropImage()
       ↓
SDK processing
       ↓
New image
       ↓
Canvas updates
```

Example:

```text
User selects PNG → WebP
       ↓
Demo Converter
       ↓
convertImage()
       ↓
PNG decoder
       ↓
Pixel data
       ↓
WebP encoder
       ↓
Valid WebP
       ↓
Download
```

---

# 47. SDK METADATA → ACTUAL FILE

If the demo says:

```text
Metadata embedded ✓
```

then inspect the resulting file and verify that the metadata really exists.

If the format does not support the requested metadata:

```text
Metadata embedding is not supported for this format.
```

Do not fake it.

---

# 48. VERSIONING

Use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

Prepare the SDK for future releases.

Expose a version constant where appropriate:

```typescript
import { VERSION } from "@our-org/image-sdk";
```

---

# 49. PACKAGE QUALITY

The NPM package should include:

```text
TypeScript declarations
ESM support
CommonJS support if appropriate
Tree-shaking support
Source maps
Tests
README
Changelog
License
```

Use a professional build pipeline.

---

# 50. FINAL QUALITY REQUIREMENT

This project must be implemented as a **real SDK + real demo**, not a UI prototype.

The final test should be:

> If we publish the NPM package today, can an unrelated developer install it and use the same image-processing functionality that the demo website uses?

The answer must be **yes**.

The following are explicitly forbidden:

```text
❌ Renaming extensions instead of converting
❌ Fake format support
❌ Fake metadata
❌ CSS-only filters presented as exported filters
❌ Demo-only processing logic
❌ Hard-coded fake results
❌ Fake API examples
❌ Private SDK imports from demo
❌ Claiming unsupported capabilities
```

The following are required:

```text
✅ Real image decoding
✅ Real image encoding
✅ Real format conversion
✅ Real metadata handling where supported
✅ Real editing
✅ Real export
✅ Modular NPM APIs
✅ TypeScript
✅ Tests
✅ Documentation
✅ Interactive demo
✅ Developer playground
✅ Responsive professional UI
```

---

# 51. IMPLEMENTATION ORDER

Do not build the entire UI first and fake the SDK later.

Implement in this order:

### Phase 1 — Architecture

Design:

* Monorepo
* Package structure
* SDK core
* Public API
* Feature system
* Editor state model

### Phase 2 — Core SDK

Implement:

* File loading
* Decode
* Render
* Export
* Validation

### Phase 3 — Editing

Implement:

* Crop
* Resize
* Rotate
* Flip
* Adjustments
* Filters

### Phase 4 — Layers

Implement:

* Image layers
* Text
* Shapes
* Layer ordering
* Layer manipulation

### Phase 5 — Conversion

Implement genuine:

* JPEG
* PNG
* WebP
* AVIF

and additional formats where practical.

### Phase 6 — Metadata

Implement:

* Read
* Preserve
* Remove
* Custom metadata

### Phase 7 — Tests

Verify actual binary files and image properties.

### Phase 8 — Demo

Build the website using only public SDK APIs.

### Phase 9 — Developer Playground

Add:

* API examples
* Generated code
* Copy buttons
* Interactive feature demos

### Phase 10 — Documentation

Create complete SDK documentation.

### Phase 11 — Production Polish

Improve:

* Performance
* Accessibility
* Responsive design
* Error handling
* Loading states
* UX
* Bundle size

---

# 52. DEFINITION OF DONE

The project is complete only when:

1. The NPM SDK builds successfully.
2. The SDK has a clean public API.
3. The SDK can perform genuine image conversions.
4. Output files are actually valid target formats.
5. Editing operations affect exported pixels.
6. Metadata behavior is genuine and documented.
7. The SDK has automated tests.
8. The demo imports the SDK as a dependency.
9. The demo does not duplicate processing logic.
10. The photo editor works.
11. The conversion playground works.
12. The metadata playground works.
13. The developer playground works.
14. SDK code examples correspond to actual APIs.
15. The UI is responsive.
16. Errors are handled correctly.
17. Documentation exists.
18. The project can be built and run from a clean installation.

Start by designing the architecture and public API before implementing the UI.

Build the **SDK first**, validate it with tests, and then build the **demo website as a genuine consumer of the SDK**.

Do not take shortcuts that make features appear to work when they do not actually work.
