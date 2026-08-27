import { useState, useRef } from 'react';
import { DRP, getImageInfo, ImageFormat } from 'drp-imagesdk';
import CompressionControls from '../components/CompressionControls';
import { downloadFile } from '../utils/download';
import './ConverterPage.css';

export default function ConverterPage() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('webp');
  const [quality, setQuality] = useState(85);
  const [compressMode, setCompressMode] = useState<'simple' | 'advanced'>('simple');
  const [targetSizeKB, setTargetSizeKB] = useState(200);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sourceInfo, setSourceInfo] = useState<{
    format: string;
    width: number;
    height: number;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceImage(file);
    setSourcePreview(URL.createObjectURL(file));
    setResult(null);

    try {
      const info = await getImageInfo(file);
      setSourceInfo({
        format: info.format.toUpperCase(),
        width: info.width,
        height: info.height,
        size: info.size,
      });
    } catch (error) {
      console.error('Failed to get image info:', error);
    }
  };

  const handleConvert = async () => {
    if (!sourceImage) return;

    setLoading(true);
    try {
      let blob: Blob;

      if (compressMode === 'advanced') {
        const result = await DRP(sourceImage, {
          format: targetFormat,
          quality,
          targetSize: `${targetSizeKB}KB`,
        });
        blob = result.blob;
      } else {
        const result = await DRP(sourceImage, {
          format: targetFormat,
          quality,
        });
        blob = result.blob;
      }

      const url = URL.createObjectURL(blob);
      setResult({ blob, url });
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !sourceImage) return;
    await downloadFile(result.blob, sourceImage.name, targetFormat);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const savingsPercent = result && sourceImage
    ? Math.round(((sourceImage.size - result.blob.size) / sourceImage.size) * 100)
    : 0;

  return (
    <div className="converter-page">
      <div className="container">
        <div className="page-header">
          <h1>Image Converter</h1>
          <p>Convert between JPEG, PNG, WebP, and other formats</p>
        </div>

        <div className="converter-content">
          <div className="converter-upload">
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
                <p className="upload-hint">PNG • JPEG • WebP • AVIF • GIF • BMP</p>
              </div>
            ) : (
              <div className="preview-section">
                <img src={sourcePreview} alt="Source" className="source-preview" />
                {sourceInfo && (
                  <div className="source-info">
                    <div className="info-row">
                      <span className="info-label">Format:</span>
                      <span className="info-value">{sourceInfo.format}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Dimensions:</span>
                      <span className="info-value">
                        {sourceInfo.width} × {sourceInfo.height}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Size:</span>
                      <span className="info-value">{formatSize(sourceInfo.size)}</span>
                    </div>
                  </div>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          <div className="converter-options">
            <h3>Convert To</h3>
            <CompressionControls
              format={targetFormat}
              quality={quality}
              targetSizeKB={targetSizeKB}
              mode={compressMode}
              sourceFile={sourceImage}
              onFormatChange={setTargetFormat}
              onQualityChange={setQuality}
              onTargetSizeChange={setTargetSizeKB}
              onModeChange={setCompressMode}
            />

            <button
              className="btn btn-primary full-width"
              onClick={handleConvert}
              disabled={!sourceImage || loading}
            >
              {loading
                ? 'Compressing...'
                : compressMode === 'advanced'
                  ? 'Compress & Convert'
                  : 'Convert'}
            </button>
          </div>

          {result && (
            <div className="converter-result">
              <h3>Result</h3>
              <div className="result-preview">
                <img src={result.url} alt="Result" className="result-image" />
                <div className="result-info">
                  <div className="info-row">
                    <span className="info-label">Format:</span>
                    <span className="info-value">{targetFormat.toUpperCase()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Size:</span>
                    <span className="info-value">{formatSize(result.blob.size)}</span>
                  </div>
                  {sourceImage && (
                    <div className="info-row">
                      <span className="info-label">Savings:</span>
                      <span className={`info-value ${savingsPercent > 0 ? 'savings' : ''}`}>
                        {savingsPercent > 0 ? `-${savingsPercent}%` : 'No reduction'}
                        <span className="savings-detail">
                          ({formatSize(sourceImage.size)} → {formatSize(result.blob.size)})
                        </span>
                      </span>
                    </div>
                  )}
                  {compressMode === 'advanced' && (
                    <div className="info-row">
                      <span className="info-label">Target:</span>
                      <span className="info-value">
                        {formatSize(targetSizeKB * 1024)} {result.blob.size <= targetSizeKB * 1024 ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                </div>
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download
                </button>
              </div>

              <div className="code-section">
                <h4>SDK Code</h4>
                <pre className="code-block">{compressMode === 'advanced'
                  ? `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  format: '${targetFormat}',
  targetSize: '${targetSizeKB}KB',
  quality: ${quality}
});
// result.size: ${result.blob.size}
// result.format: ${targetFormat}`
                  : `import DRP from 'drp-imagesdk';

const result = await DRP(file, {
  format: '${targetFormat}',
  quality: ${quality}
});`}</pre>
              </div>
            </div>
          )}

          <div className="format-matrix">
            <h3>Supported Formats</h3>
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Format</th>
                  <th>Read</th>
                  <th>Write</th>
                  <th>Quality Control</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>JPEG</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>PNG</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>WebP</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>GIF</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>BMP</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
