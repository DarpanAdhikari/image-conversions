# ImageSDK Demo

Interactive demo website showcasing the `@our-org/image-sdk` capabilities.

## Running

```bash
# From monorepo root
npm run dev

# Or from this directory
npm run dev
```

Opens at `http://localhost:3000`.

## Pages

### Features (Home)

Try individual SDK operations without the full editor:

1. Upload an image
2. Click any feature card (Crop, Resize, Rotate, Flip, Filters, Convert, Metadata, Export)
3. See the real result from the SDK
4. View the corresponding SDK code

Each operation runs the actual SDK function - no shortcuts or fakes.

### Editor

Full-featured photo editor built on the SDK:

- **Tools**: Select, Crop, Resize, Rotate, Flip, Adjust, Filter
- **Canvas**: Real-time preview of edits
- **Properties Panel**: Context-sensitive controls for each tool
- **Undo/Redo**: Full history support
- **Export**: Download with format and quality options

### Converter

Format conversion playground:

- Upload any supported image
- Select target format (JPEG, PNG, WebP, GIF, BMP)
- Adjust quality for lossy formats
- See file size comparison
- Download converted result

### Metadata

Read and embed image metadata:

- View original EXIF data
- Choose to preserve or remove metadata
- Add custom SDK metadata
- Export with embedded metadata

### Playground

Developer sandbox for testing operations:

- Select operation type (Resize, Crop, Rotate, Flip, Filter, Convert)
- Configure operation parameters
- Run and see results
- Copy generated SDK code

### Docs

API documentation with:

- Installation instructions
- Quick start examples
- Full API reference
- Supported formats matrix
- Browser compatibility

## How It Works

The demo imports the SDK as a real dependency:

```typescript
import { resizeImage, convertImage, applyFilter } from "@our-org/image-sdk";
```

All image processing happens through the SDK's public APIs. The demo does not contain any duplicate processing logic.

## Tech Stack

- React 18
- Vite
- TypeScript
- React Router
- @our-org/image-sdk
