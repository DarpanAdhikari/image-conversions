import './DocsPage.css';

const SECTIONS = [
  {
    title: 'Installation',
    content: `npm install drp-imagesdk`,
  },
  {
    title: 'Quick Start — DRP()',
    content: `import DRP from 'drp-imagesdk';

// Any combination. One line.
const result = await DRP(file, {
  format: 'webp',
  quality: 85,
  width: 800,
  filter: 'vintage'
});

// result.blob — processed image
// result.size — final file size
// result.width / result.height — dimensions
// result.format — output format`,
  },
  {
    title: 'Single Method API',
    content: `import DRP from 'drp-imagesdk';

// DRP() handles everything
const result = await DRP(file, {
  format: 'webp',           // convert
  targetSize: '500KB',     // compress to target
  width: 800,              // resize
  crop: { x: 0, y: 0, width: 300, height: 200 },  // crop
  rotate: 45,              // rotate degrees
  flip: 'horizontal',      // flip
  filter: 'vintage',      // filter
  quality: 85,             // quality
  metadata: { preserve: true }
});

// Static methods
const editor = await DRP.editor('#container');
const batch = await DRP.batch(files, 'resize', { width: 800 });
const valid = await DRP.validate(file, '5MB');
const preview = await DRP.preview(source);`,
  },
  {
    title: 'Editor',
    content: `import DRP from 'drp-imagesdk';

const editor = await DRP.editor('#editor-container');

// Or use createEditor for imperative API
import { createEditor } from 'drp-imagesdk';
const editor = await createEditor(file);

editor.crop({ x: 0, y: 0, width: 400, height: 300 });
editor.resize({ width: 800, maintainAspectRatio: true });
editor.rotate({ degrees: 45 });
editor.flip({ horizontal: true });
editor.compress('web');

const blob = await editor.export({ format: 'png' });`,
  },
  {
    title: 'Adjustments',
    content: `import { createEditor } from 'drp-imagesdk';

const editor = await createEditor(file);

editor.adjust({
  brightness: 20,
  contrast: 10,
  saturation: -15
});

const blob = await editor.export({ format: 'png' });`,
  },
  {
    title: 'Filters',
    content: `import DRP from 'drp-imagesdk';

// One line filter
const result = await DRP(file, { filter: 'vintage' });

// Or use modular API
import { applyFilter, AVAILABLE_FILTERS } from 'drp-imagesdk';

const result = applyFilter(canvas, 'vintage');

// Available filters:
// original, vintage, blackAndWhite, warm, cool,
// cinematic, fade, dramatic, soft, highContrast`,
  },
  {
    title: 'Compression',
    content: `import DRP from 'drp-imagesdk';

// Compress to target size
const result = await DRP(file, {
  targetSize: '500KB',   // or '2MB' or bytes number
  format: 'webp'         // target format
});

// result.size — actual output size
// result.withinTarget — did we hit the target?

// Or use modular API
import { compressToTargetSize, smartCompress } from 'drp-imagesdk';

const result = await compressToTargetSize(file, {
  format: 'webp',
  targetSize: 500 * 1024,
  tolerance: 10
});

const webResult = await smartCompress(file, 'web');`,
  },
  {
    title: 'Format Conversion',
    content: `import DRP from 'drp-imagesdk';

// Convert with one line
const result = await DRP(file, {
  format: 'webp',
  quality: 85,
  width: 1200,
  height: 800
});

// Or use modular API
import { convertImage, getSupportedFormats } from 'drp-imagesdk';

const formats = getSupportedFormats();
// ['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp']

const blob = await convertImage(file, {
  format: 'webp',
  quality: 85,
  width: 1200,
  height: 800,
  maintainAspectRatio: true
});`,
  },
  {
    title: 'Metadata',
    content: `import DRP from 'drp-imagesdk';

// Read metadata
const metadata = await DRP.readMetadata(file);
console.log(metadata);

// Export with metadata
const result = await DRP(file, {
  format: 'png',
  metadata: {
    preserve: true,
    custom: {
      application: 'drp-imagesdk',
      version: '2.0.0'
    }
  }
});`,
  },
  {
    title: 'Batch Processing',
    content: `import DRP from 'drp-imagesdk';

// Batch with DRP()
const results = await DRP.batch(files, 'resize', {
  width: 800,
  maintainAspectRatio: true
});

// Or use modular API
import { batchProcess } from 'drp-imagesdk';

const results = await batchProcess(files, [
  { type: 'resize', options: { width: 800 } },
  { type: 'compress', options: { format: 'webp', targetSize: '200KB' } }
]);`,
  },
  {
    title: 'Modular Import',
    content: `// Individual operations (tree-shakeable)
import {
  convertImage,
  resizeImage,
  cropImage,
  rotateImage,
  flipImage,
  applyFilter,
  readMetadata,
  compressToTargetSize,
  smartCompress,
  createEditor,
  batchProcess,
  getSupportedFormats,
  AVAILABLE_FILTERS,
  ImageFormat,
  DRPResult,
  DRPOptions
} from 'drp-imagesdk';

// Or use the single DRP method
import DRP from 'drp-imagesdk';`,
  },
];

export default function DocsPage() {
  return (
    <div className="docs-page">
      <div className="container">
        <div className="page-header">
          <h1>DRP Documentation</h1>
          <p>Learn how to use DRP (Digital Resolution Pro) in your application</p>
        </div>

        <div className="docs-content">
          <div className="docs-sidebar">
            <h3>API Reference</h3>
            <nav className="docs-nav">
              {SECTIONS.map((section) => (
                <a
                  key={section.title}
                  href={`#${section.title.toLowerCase().replace(/[\s—]+/g, '-')}`}
                  className="docs-nav-link"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>

          <div className="docs-main">
            {SECTIONS.map((section) => (
              <section
                key={section.title}
                id={section.title.toLowerCase().replace(/[\s—]+/g, '-')}
                className="docs-section"
              >
                <h2>{section.title}</h2>
                <pre className="code-block">{section.content}</pre>
              </section>
            ))}

            <section className="docs-section">
              <h2>Supported Formats</h2>
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Read</th>
                    <th>Write</th>
                    <th>Quality</th>
                    <th>Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>JPEG</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>PNG</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>—</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>WebP</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>AVIF</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>Limited</td>
                  </tr>
                  <tr>
                    <td>GIF</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>—</td>
                    <td>Limited</td>
                  </tr>
                  <tr>
                    <td>BMP</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>—</td>
                    <td>Limited</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="docs-section">
              <h2>Browser Support</h2>
              <p>
                DRP works in all modern browsers that support the Canvas API.
                For format-specific features:
              </p>
              <ul>
                <li>WebP: Supported in all modern browsers</li>
                <li>AVIF: Chrome 85+, Firefox 93+, Safari 16.4+</li>
                <li>Canvas: Required for all image processing</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
