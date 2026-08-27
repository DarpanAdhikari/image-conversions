import type { CompressionPreview } from 'drp-imagesdk';
import './CompressionPreviewCard.css';

interface CompressionPreviewCardProps {
  preview: CompressionPreview;
  actualSize?: number;
  targetSize?: number;
}

export default function CompressionPreviewCard({
  preview,
  actualSize,
  targetSize,
}: CompressionPreviewCardProps) {
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const savings = actualSize
    ? Math.round(((preview.originalSize - actualSize) / preview.originalSize) * 100)
    : preview.estimatedSavingsPercent;

  const displaySize = actualSize ?? preview.estimatedSize;
  const withinTarget = targetSize ? displaySize <= targetSize : true;

  return (
    <div className="compression-preview-card">
      <div className="preview-header">
        <span className="preview-icon">📦</span>
        <span className="preview-title">Compression Preview</span>
      </div>
      <div className="preview-stats">
        <div className="stat-row">
          <span className="stat-label">Original</span>
          <span className="stat-value">
            {formatBytes(preview.originalSize)}
            <span className="stat-dim">
              ({preview.originalWidth}×{preview.originalHeight})
            </span>
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">{actualSize ? 'Actual' : 'Estimated'}</span>
          <span className={`stat-value ${savings > 0 ? 'savings' : ''}`}>
            {formatBytes(displaySize)}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Savings</span>
          <span className={`stat-value ${savings > 50 ? 'great' : savings > 0 ? 'good' : ''}`}>
            {savings > 0 ? `-${savings}%` : 'Minimal'}
          </span>
        </div>
        {targetSize && (
          <div className="stat-row">
            <span className="stat-label">Target</span>
            <span className={`stat-value ${withinTarget ? 'within-target' : 'over-target'}`}>
              {formatBytes(targetSize)} {withinTarget ? '✓' : '✗'}
            </span>
          </div>
        )}
      </div>
      <div className="preview-recommendation">
        Recommended: {preview.recommendedFormat.toUpperCase()} @ {preview.recommendedQuality}%
      </div>
    </div>
  );
}
