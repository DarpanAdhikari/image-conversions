import { Link } from 'react-router-dom';
import { useState } from 'react';
import { DRP } from 'drp-imagesdk';
import DragDropUpload from '../components/DragDropUpload';
import { downloadFile } from '../utils/download';
import './HomePage.css';

const FEATURES = [
  {
    title: 'Crop',
    description: 'Crop images to any dimensions with precision control.',
    icon: '✂️',
    action: 'crop',
    drpCode: `await DRP(file, {\n  crop: { x: 50, y: 50, width: 300, height: 200 }\n});`,
  },
  {
    title: 'Resize',
    description: 'Resize images while maintaining aspect ratio.',
    icon: '↔️',
    action: 'resize',
    drpCode: `await DRP(file, { width: 400 });`,
  },
  {
    title: 'Rotate',
    description: 'Rotate images to any angle.',
    icon: '↻',
    action: 'rotate',
    drpCode: `await DRP(file, { rotate: 45 });`,
  },
  {
    title: 'Flip',
    description: 'Flip images horizontally or vertically.',
    icon: '⟺',
    action: 'flip',
    drpCode: `await DRP(file, { flip: 'horizontal' });`,
  },
  {
    title: 'Filters',
    description: 'Apply professional filters to enhance images.',
    icon: '🎨',
    action: 'filter',
    drpCode: `await DRP(file, { filter: 'vintage' });`,
  },
  {
    title: 'Convert',
    description: 'Convert between JPEG, PNG, WebP, and more.',
    icon: '🔄',
    action: 'convert',
    drpCode: `await DRP(file, { format: 'webp', quality: 85 });`,
  },
  {
    title: 'Metadata',
    description: 'Read and preserve image metadata.',
    icon: 'ℹ️',
    action: 'metadata',
    drpCode: `await DRP.readMetadata(file);`,
  },
  {
    title: 'Export',
    description: 'Export with quality control and format options.',
    icon: '💾',
    action: 'export',
    drpCode: `await DRP(file, {\n  width: 600,\n  format: 'jpeg',\n  quality: 90\n});`,
  },
  {
    title: 'Compress',
    description: 'Smart compression to target file size.',
    icon: '📦',
    action: 'compress',
    drpCode: `await DRP(file, {\n  targetSize: '500KB',\n  format: 'webp'\n});`,
  },
];

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string>('');

  const handleFeatureClick = async (action: string, drpCode: string) => {
    if (!selectedImage) return;

    setActiveFeature(action);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      let outputBlob: Blob;

      switch (action) {
        case 'resize': {
          const r = await DRP(file, { width: 400 });
          outputBlob = r.blob;
          break;
        }
        case 'crop': {
          const r = await DRP(file, { crop: { x: 50, y: 50, width: 300, height: 200 } });
          outputBlob = r.blob;
          break;
        }
        case 'rotate': {
          const r = await DRP(file, { rotate: 45 });
          outputBlob = r.blob;
          break;
        }
        case 'flip': {
          const r = await DRP(file, { flip: 'horizontal' });
          outputBlob = r.blob;
          break;
        }
        case 'filter': {
          const r = await DRP(file, { filter: 'vintage', width: 400 });
          outputBlob = r.blob;
          break;
        }
        case 'convert': {
          const r = await DRP(file, { format: 'webp', quality: 85 });
          outputBlob = r.blob;
          break;
        }
        case 'metadata': {
          const metadata = await DRP.readMetadata(file);
          outputBlob = file;
          setResult(JSON.stringify(metadata, null, 2));
          setLoading(false);
          setCode(drpCode);
          return;
        }
        case 'export': {
          const r = await DRP(file, { width: 600, format: 'jpeg', quality: 90 });
          outputBlob = r.blob;
          break;
        }
        case 'compress': {
          const r = await DRP(file, { targetSize: '500KB', format: 'webp' });
          outputBlob = r.blob;
          break;
        }
        default:
          return;
      }

      const url = URL.createObjectURL(outputBlob);
      setResult(url);
      setResultBlob(outputBlob);
      setCode(drpCode);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">v2.0 — Now with DRP() API</div>
            <h1 className="hero-title">
              One line. Any combination.
              <br />
              <span className="hero-highlight">DRP</span> handles the rest.
            </h1>
            <p className="hero-description">
              DRP (Digital Resolution Pro) is a single-method image processing SDK.
              Pass any combination of options — format, compression, resize, filter, crop —
              and the pipeline builds itself.
            </p>
            <div className="hero-actions">
              <Link to="/converter" className="btn btn-primary btn-lg">
                Try DRP
              </Link>
              <Link to="/editor" className="btn btn-secondary btn-lg">
                Open Editor
              </Link>
            </div>
            <div className="hero-install">
              <code className="hero-code">npm install drp-imagesdk</code>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-code-demo">
              <pre className="code-block">{`import DRP from 'drp-imagesdk';

// Any combination. One line.
const result = await DRP(file, {
  format: 'webp',
  targetSize: '500KB',
  width: 800,
  filter: 'vintage'
});

// That's it. Pipeline built automatically.`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Try DRP</h2>
          <p className="section-description">
            Upload an image and click any feature. Each uses the same <code>DRP()</code> method.
          </p>

          <div className="upload-area">
            {selectedImage ? (
              <div className="preview-container">
                <img src={selectedImage} alt="Preview" className="preview-image" />
                <DragDropUpload
                  onFileSelect={(file) => {
                    const url = URL.createObjectURL(file);
                    setSelectedImage(url);
                    setResult(null);
                    setActiveFeature(null);
                  }}
                >
                  <button className="btn btn-secondary btn-sm">
                    Change Image
                  </button>
                </DragDropUpload>
              </div>
            ) : (
              <DragDropUpload
                onFileSelect={(file) => {
                  const url = URL.createObjectURL(file);
                  setSelectedImage(url);
                  setResult(null);
                  setActiveFeature(null);
                }}
              />
            )}
          </div>

          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div
                key={feature.action}
                className={`feature-card ${
                  activeFeature === feature.action ? 'active' : ''
                }`}
                onClick={() => handleFeatureClick(feature.action, feature.drpCode)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <button className="btn btn-primary btn-sm">Try It</button>
              </div>
            ))}
          </div>

          {(result || loading) && (
            <div className="result-section">
              <h3 className="result-title">Result</h3>
              {loading ? (
                <div className="loading">Processing...</div>
              ) : result?.startsWith('data:') || result?.startsWith('blob:') ? (
                <div className="result-preview">
                  <img src={result} alt="Result" className="result-image" />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => resultBlob && downloadFile(resultBlob, 'image.jpg')}
                  >
                    Download
                  </button>
                </div>
              ) : (
                <div className="result-text">
                  <pre className="code-block">{result}</pre>
                </div>
              )}

              {code && (
                <div className="code-section">
                  <h4>DRP Code</h4>
                  <pre className="code-block">{code}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="api-section">
        <div className="container">
          <h2 className="section-title">DRP API</h2>
          <p className="section-description">
            One method. Any keywords. The pipeline builds itself.
          </p>

          <div className="api-grid">
            <div className="api-card api-card-primary">
              <h3>DRP() — The Method</h3>
              <ul>
                <li><code>DRP(file, {'{ format, width, crop, ... }'})</code></li>
                <li><code>DRP.editor('#container')</code></li>
                <li><code>DRP.batch(files, operation)</code></li>
                <li><code>DRP.validate(file, '5MB')</code></li>
                <li><code>DRP.preview(source)</code></li>
              </ul>
            </div>
            <div className="api-card">
              <h3>Options</h3>
              <ul>
                <li><code>format</code> — jpeg, png, webp, gif, bmp</li>
                <li><code>targetSize</code> — '500KB', '2MB'</li>
                <li><code>quality</code> — 1 to 100</li>
                <li><code>width / height</code> — resize</li>
                <li><code>crop</code> — {'{ x, y, width, height }'}</li>
                <li><code>rotate</code> — degrees</li>
                <li><code>flip</code> — 'horizontal', 'vertical', 'both'</li>
                <li><code>filter</code> — 'vintage', 'warm', etc.</li>
              </ul>
            </div>
            <div className="api-card">
              <h3>Modular Import</h3>
              <ul>
                <li><code>import {'{ convertImage }'} from 'drp-imagesdk'</code></li>
                <li><code>import {'{ compressToTargetSize }'} from 'drp-imagesdk'</code></li>
                <li><code>import {'{ resizeImage }'} from 'drp-imagesdk'</code></li>
                <li><code>import {'{ applyFilter }'} from 'drp-imagesdk'</code></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
