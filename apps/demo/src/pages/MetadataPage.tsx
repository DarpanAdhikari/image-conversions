import { useState, useRef } from 'react';
import {
  DRP,
  MetadataOptions,
} from 'drp-imagesdk';
import { downloadFile } from '../utils/download';
import './MetadataPage.css';

export default function MetadataPage() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [metadataOptions, setMetadataOptions] = useState<MetadataOptions>({
    preserve: true,
    custom: {
      application: 'drp-imagesdk',
      version: '2.0.0',
    },
  });
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceImage(file);
    setSourcePreview(URL.createObjectURL(file));
    setResult(null);

    try {
      const meta = await DRP.readMetadata(file);
      setMetadata(meta);
    } catch (error) {
      console.error('Failed to read metadata:', error);
      setMetadata(null);
    }
  };

  const handleExport = async () => {
    if (!sourceImage) return;

    setLoading(true);
    try {
      const result = await DRP(sourceImage, {
        format: 'png',
        metadata: metadataOptions,
      });
      const url = URL.createObjectURL(result.blob);
      setResult({ blob: result.blob, url });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !sourceImage) return;
    await downloadFile(result.blob, sourceImage.name, 'png');
  };

  return (
    <div className="metadata-page">
      <div className="container">
        <div className="page-header">
          <h1>Metadata Playground</h1>
          <p>Read, preserve, and embed metadata in your images</p>
        </div>

        <div className="metadata-content">
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
                <div className="upload-icon">📁</div>
                <p>Click to upload an image</p>
                <p className="upload-hint">Metadata works best with JPEG and PNG</p>
              </div>
            ) : (
              <div className="preview-section">
                <img src={sourcePreview} alt="Source" className="source-preview" />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          {metadata && (
            <div className="metadata-display">
              <h3>Original Metadata</h3>
              {Object.keys(metadata).length === 0 ? (
                <p className="no-metadata">No metadata found in this image</p>
              ) : (
                <pre className="code-block">{JSON.stringify(metadata, null, 2)}</pre>
              )}
            </div>
          )}

          <div className="metadata-options">
            <h3>SDK Metadata Options</h3>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={metadataOptions.preserve}
                  onChange={(e) =>
                    setMetadataOptions({
                      ...metadataOptions,
                      preserve: e.target.checked,
                    })
                  }
                />
                Preserve existing metadata
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!metadataOptions.custom}
                  onChange={(e) =>
                    setMetadataOptions({
                      ...metadataOptions,
                      custom: e.target.checked
                        ? {
                            application: 'drp-imagesdk',
                            version: '2.0.0',
                          }
                        : undefined,
                    })
                  }
                />
                Add custom SDK metadata
              </label>
            </div>

            {metadataOptions.custom && (
              <div className="custom-metadata">
                <div className="form-group">
                  <label className="label">Application</label>
                  <input
                    type="text"
                    className="input"
                    value={(metadataOptions.custom as any)?.application || ''}
                    onChange={(e) =>
                      setMetadataOptions({
                        ...metadataOptions,
                        custom: {
                          ...(metadataOptions.custom as any),
                          application: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="label">Version</label>
                  <input
                    type="text"
                    className="input"
                    value={(metadataOptions.custom as any)?.version || ''}
                    onChange={(e) =>
                      setMetadataOptions({
                        ...metadataOptions,
                        custom: {
                          ...(metadataOptions.custom as any),
                          version: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}

            <button
              className="btn btn-primary full-width"
              onClick={handleExport}
              disabled={!sourceImage || loading}
            >
              {loading ? 'Exporting...' : 'Export with Metadata'}
            </button>
          </div>

          {result && (
            <div className="result-section">
              <h3>Result</h3>
              <div className="result-preview">
                <img src={result.url} alt="Result" className="result-image" />
                <div className="result-info">
                  <div className="info-row">
                    <span className="info-label">Size:</span>
                    <span className="info-value">
                      {(result.blob.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download
                </button>
              </div>

              <div className="code-section">
                <h4>DRP Code</h4>
                <pre className="code-block">{`import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  format: 'png',
  metadata: {
    preserve: ${metadataOptions.preserve},
    custom: ${JSON.stringify(metadataOptions.custom, null, 4)}
  }
});`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
