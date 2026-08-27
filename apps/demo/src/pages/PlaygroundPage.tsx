import { useState, useRef } from 'react';
import {
  DRP,
  AVAILABLE_FILTERS,
  getFilterName,
  FilterPreset,
} from 'drp-imagesdk';
import { downloadFile } from '../utils/download';
import './PlaygroundPage.css';

type Operation = 'resize' | 'crop' | 'rotate' | 'flip' | 'filter' | 'convert';

interface OperationConfig {
  resize: { width: number; height: number; maintainAspectRatio: boolean };
  crop: { x: number; y: number; width: number; height: number };
  rotate: { degrees: number };
  flip: { horizontal: boolean; vertical: boolean };
  filter: { preset: FilterPreset };
  convert: { format: string; quality: number };
}

export default function PlaygroundPage() {
  const [selectedOperation, setSelectedOperation] = useState<Operation>('resize');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<OperationConfig>({
    resize: { width: 400, height: 300, maintainAspectRatio: true },
    crop: { x: 0, y: 0, width: 200, height: 200 },
    rotate: { degrees: 45 },
    flip: { horizontal: true, vertical: false },
    filter: { preset: 'vintage' },
    convert: { format: 'webp', quality: 85 },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceImage(file);
    setSourcePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleRun = async () => {
    if (!sourceImage) return;

    setLoading(true);
    setResult(null);

    try {
      let outputBlob: Blob;
      let codeExample: string;

      switch (selectedOperation) {
        case 'resize': {
          const r = await DRP(sourceImage, { width: config.resize.width, height: config.resize.height });
          outputBlob = r.blob;
          codeExample = `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  width: ${config.resize.width},
  height: ${config.resize.height}
});`;
          break;
        }

        case 'crop': {
          const r = await DRP(sourceImage, { crop: config.crop });
          outputBlob = r.blob;
          codeExample = `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  crop: { x: ${config.crop.x}, y: ${config.crop.y}, width: ${config.crop.width}, height: ${config.crop.height} }
});`;
          break;
        }

        case 'rotate': {
          const r = await DRP(sourceImage, { rotate: config.rotate.degrees });
          outputBlob = r.blob;
          codeExample = `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  rotate: ${config.rotate.degrees}
});`;
          break;
        }

        case 'flip': {
          const dir = config.flip.horizontal && config.flip.vertical ? 'both' : config.flip.horizontal ? 'horizontal' : 'vertical';
          const r = await DRP(sourceImage, { flip: dir });
          outputBlob = r.blob;
          codeExample = `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  flip: '${dir}'
});`;
          break;
        }

        case 'filter': {
          const r = await DRP(sourceImage, { filter: config.filter.preset, width: 400 });
          outputBlob = r.blob;
          codeExample = `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  filter: '${config.filter.preset}',
  width: 400
});`;
          break;
        }

        case 'convert': {
          const r = await DRP(sourceImage, { format: config.convert.format as any, quality: config.convert.quality });
          outputBlob = r.blob;
          codeExample = `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  format: '${config.convert.format}',
  quality: ${config.convert.quality}
});`;
          break;
        }

        default:
          return;
      }

      setResult(URL.createObjectURL(outputBlob));
      setResultBlob(outputBlob);
      setCode(codeExample);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playground-page">
      <div className="container">
        <div className="page-header">
          <h1>Developer Playground</h1>
          <p>Try individual SDK operations with custom configurations</p>
        </div>

        <div className="playground-content">
          <div className="playground-sidebar">
            <div className="operation-selector">
              <label className="label">Operation</label>
              <select
                className="select"
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value as Operation)}
              >
                <option value="resize">Resize</option>
                <option value="crop">Crop</option>
                <option value="rotate">Rotate</option>
                <option value="flip">Flip</option>
                <option value="filter">Filter</option>
                <option value="convert">Convert</option>
              </select>
            </div>

            <div className="upload-section">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
              {!sourcePreview ? (
                <div
                  className="upload-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p>Upload Image</p>
                </div>
              ) : (
                <div className="preview-section">
                  <img src={sourcePreview} alt="Source" className="source-preview" />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="config-section">
              <h3>Configuration</h3>

              {selectedOperation === 'resize' && (
                <>
                  <div className="form-group">
                    <label className="label">Width</label>
                    <input
                      type="number"
                      className="input"
                      value={config.resize.width}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          resize: { ...config.resize, width: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Height</label>
                    <input
                      type="number"
                      className="input"
                      value={config.resize.height}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          resize: { ...config.resize, height: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.resize.maintainAspectRatio}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            resize: {
                              ...config.resize,
                              maintainAspectRatio: e.target.checked,
                            },
                          })
                        }
                      />
                      Maintain aspect ratio
                    </label>
                  </div>
                </>
              )}

              {selectedOperation === 'crop' && (
                <>
                  <div className="form-group">
                    <label className="label">X</label>
                    <input
                      type="number"
                      className="input"
                      value={config.crop.x}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          crop: { ...config.crop, x: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Y</label>
                    <input
                      type="number"
                      className="input"
                      value={config.crop.y}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          crop: { ...config.crop, y: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Width</label>
                    <input
                      type="number"
                      className="input"
                      value={config.crop.width}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          crop: { ...config.crop, width: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Height</label>
                    <input
                      type="number"
                      className="input"
                      value={config.crop.height}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          crop: { ...config.crop, height: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </>
              )}

              {selectedOperation === 'rotate' && (
                <div className="form-group">
                  <label className="label">Degrees: {config.rotate.degrees}°</label>
                  <input
                    type="range"
                    className="slider"
                    min={-180}
                    max={180}
                    value={config.rotate.degrees}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rotate: { degrees: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              )}

              {selectedOperation === 'flip' && (
                <>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.flip.horizontal}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            flip: { ...config.flip, horizontal: e.target.checked },
                          })
                        }
                      />
                      Horizontal
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={config.flip.vertical}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            flip: { ...config.flip, vertical: e.target.checked },
                          })
                        }
                      />
                      Vertical
                    </label>
                  </div>
                </>
              )}

              {selectedOperation === 'filter' && (
                <div className="form-group">
                  <label className="label">Filter</label>
                  <select
                    className="select"
                    value={config.filter.preset}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        filter: { preset: e.target.value as FilterPreset },
                      })
                    }
                  >
                    {(AVAILABLE_FILTERS as FilterPreset[]).map((filter) => (
                      <option key={filter} value={filter}>
                        {getFilterName(filter)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedOperation === 'convert' && (
                <>
                  <div className="form-group">
                    <label className="label">Format</label>
                    <select
                      className="select"
                      value={config.convert.format}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          convert: { ...config.convert, format: e.target.value },
                        })
                      }
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Quality: {config.convert.quality}%</label>
                    <input
                      type="range"
                      className="slider"
                      min={1}
                      max={100}
                      value={config.convert.quality}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          convert: {
                            ...config.convert,
                            quality: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <button
              className="btn btn-primary full-width"
              onClick={handleRun}
              disabled={!sourceImage || loading}
            >
              {loading ? 'Processing...' : 'Run'}
            </button>
          </div>

          <div className="playground-main">
            {result ? (
              <div className="result-section">
                <h3>Preview</h3>
                <img src={result} alt="Result" className="result-image" />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => resultBlob && sourceImage && downloadFile(resultBlob, sourceImage.name)}
                >
                  Download
                </button>
              </div>
            ) : (
              <div className="empty-result">
                <p>Upload an image and click Run to see the result</p>
              </div>
            )}

            {code && (
              <div className="code-section">
                <div className="code-header">
                  <h4>SDK Code</h4>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigator.clipboard.writeText(code)}
                  >
                    Copy
                  </button>
                </div>
                <pre className="code-block">{code}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
