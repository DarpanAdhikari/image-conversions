# DRP Monorepo

**DRP (Digital Resolution Pro)** — A single-method image processing SDK for JavaScript.

## What's Inside

| Package | Description |
|---------|-------------|
| [`packages/image-sdk`](./packages/image-sdk) | `drp-imagesdk` — the SDK (npm package) |
| [`apps/demo`](./apps/demo) | Demo website showcasing all SDK features |

**The SDK is the product. The demo site is a consumer of the SDK.**

---

## Quick Start

```bash
npm install
npm run dev
```

Opens the demo at `http://localhost:3000`.

---

## Monorepo Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start demo dev server |
| `npm run build` | Build all packages |
| `npm run build:sdk` | Build SDK only |
| `npm run build:demo` | Build demo only |
| `npm run test` | Run all tests |
| `npm run test:sdk` | Run SDK tests |
| `npm run lint` | Lint all packages |

---

## SDK at a Glance

```typescript
import { DRP } from 'drp-imagesdk';

// Any combination. One line.
const result = await DRP(file, {
  format: 'webp',
  targetSize: '500KB',
  width: 800,
  filter: 'vintage',
});

// result.blob → processed image
```

See the full [SDK README](./packages/image-sdk/README.md) for documentation.

---

## License

MIT
