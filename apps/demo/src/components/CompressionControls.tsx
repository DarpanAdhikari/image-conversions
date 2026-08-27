import { useState, useEffect } from 'react';
import type { ImageFormat, CompressionPreview } from 'drp-imagesdk';
import { getCompressionPreview } from 'drp-imagesdk';
import CompressionPreviewCard from './CompressionPreviewCard';
import './CompressionControls.css';

export interface CompressionMode {
  type: 'simple' | 'advanced';
}

interface CompressionControlsProps {
  format: ImageFormat;
  quality: number;
  targetSizeKB: number;
  mode: CompressionMode['type'];
  sourceFile?: File | null;
  sourceCanvas?: HTMLCanvasElement | null;
  onFormatChange: (format: ImageFormat) => void;
  onQualityChange: (quality: number) => void;
  onTargetSizeChange: (targetSizeKB: number) => void;
  onModeChange: (mode: CompressionMode['type']) => void;
}

export default function CompressionControls({
  format,
  quality,
  targetSizeKB,
  mode,
  sourceFile,
  sourceCanvas,
  onFormatChange,
  onQualityChange,
  onTargetSizeChange,
  onModeChange,
}: CompressionControlsProps) {
  const [preview, setPreview] = useState<CompressionPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB'>('KB');

  const targetSizeBytes = sizeUnit === 'MB' ? targetSizeKB * 1024 : targetSizeKB * 1024;

  useEffect(() => {
    if (mode !== 'advanced') {
      setPreview(null);
      return;
    }

    const source = sourceCanvas ?? sourceFile;
    if (!source) return;

    setPreviewLoading(true);
    getCompressionPreview(source, format)
      .then(setPreview)
      .catch(console.error)
      .finally(() => setPreviewLoading(false));
  }, [mode, format, sourceFile, sourceCanvas]);

  return (
    <div className="compression-controls">
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'simple' ? 'active' : ''}`}
          onClick={() => onModeChange('simple')}
        >
          Simple
        </button>
        <button
          className={`mode-btn ${mode === 'advanced' ? 'active' : ''}`}
          onClick={() => onModeChange('advanced')}
        >
          Advanced
        </button>
      </div>

      <div className="form-group">
        <label className="label">Format</label>
        <select
          className="select"
          value={format}
          onChange={(e) => onFormatChange(e.target.value as ImageFormat)}
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
          <option value="gif">GIF</option>
          <option value="bmp">BMP</option>
        </select>
      </div>

      {mode === 'simple' ? (
        (format === 'jpeg' || format === 'webp') && (
          <div className="form-group">
            <label className="label">Quality: {quality}%</label>
            <input
              type="range"
              className="slider"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => onQualityChange(Number(e.target.value))}
            />
          </div>
        )
      ) : (
        <>
          <div className="form-group">
            <label className="label">Target File Size</label>
            <div className="target-size-input">
              <input
                type="number"
                className="input target-size-field"
                min={1}
                value={targetSizeKB}
                onChange={(e) => onTargetSizeChange(Math.max(1, Number(e.target.value)))}
              />
              <select
                className="select size-unit-select"
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as 'KB' | 'MB')}
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
              </select>
            </div>
          </div>

          {(format === 'jpeg' || format === 'webp') && (
            <div className="form-group">
              <label className="label">Max Quality: {quality}%</label>
              <input
                type="range"
                className="slider"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => onQualityChange(Number(e.target.value))}
              />
            </div>
          )}

          <div className="preview-section">
            {previewLoading ? (
              <div className="preview-loading">Analyzing image...</div>
            ) : preview ? (
              <CompressionPreviewCard
                preview={preview}
                targetSize={targetSizeBytes}
              />
            ) : (
              <div className="preview-hint">
                Upload an image to see compression preview
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
