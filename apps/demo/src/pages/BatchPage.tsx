import { useState } from 'react';
import {
  batchProcess,
  BatchOperation,
  BatchResult,
  AVAILABLE_FILTERS,
  getFilterName,
  ImageFormat,
} from 'drp-imagesdk';
import DragDropUpload from '../components/DragDropUpload';
import ProgressBar from '../components/ProgressBar';
import { downloadFile } from '../utils/download';
import './BatchPage.css';

type BatchType = 'convert' | 'resize' | 'filter' | 'compress';

export default function BatchPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [batchType, setBatchType] = useState<BatchType>('convert');
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(85);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [filterPreset, setFilterPreset] = useState('vintage');
  const [compressFormat, setCompressFormat] = useState<ImageFormat>('webp');
  const [targetSizeKB, setTargetSizeKB] = useState(200);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });

  const handleFilesSelect = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResults([]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setResults([]);

    const operation: BatchOperation = {
      type: batchType,
      options: {
        format: (batchType === 'compress' ? compressFormat : format) as any,
        quality,
        width: resizeWidth,
        height: resizeHeight,
        maintainAspectRatio: maintainRatio,
        preset: filterPreset as any,
        targetSize: batchType === 'compress' ? targetSizeKB * 1024 : undefined,
      },
    };

    const batchResults = await batchProcess(files, operation, (p) => {
      setProgress({ current: p.current, total: p.total, phase: p.phase });
    });

    setResults(batchResults);
    setProcessing(false);
  };

  const handleDownloadAll = async () => {
    for (const result of results) {
      if (result.success) {
        await downloadFile(result.blob, result.file.name, format);
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  };

  return (
    <div className="batch-page">
      <div className="container">
        <div className="page-header">
          <h1>Batch Processing</h1>
          <p>Process multiple images at once with the same operation</p>
        </div>

        <div className="batch-content">
          <div className="batch-upload">
            <DragDropUpload
              onFileSelect={(file) => handleFilesSelect([file])}
              onFilesSelect={handleFilesSelect}
              multiple
            >
              <div className="batch-drop-zone">
                <span className="batch-drop-icon">📁</span>
                <p>Drag & drop multiple images here</p>
                <p className="batch-drop-hint">Or click to select files</p>
              </div>
            </DragDropUpload>

            {files.length > 0 && (
              <div className="file-list">
                <div className="file-list-header">
                  <h3>Files ({files.length})</h3>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setFiles([]); setResults([]); }}
                  >
                    Clear All
                  </button>
                </div>
                <div className="file-items">
                  {files.map((file, i) => (
                    <div key={i} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeFile(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="batch-options">
            <h3>Operation</h3>
            <div className="form-group">
              <label className="label">Type</label>
              <select
                className="select"
                value={batchType}
                onChange={(e) => setBatchType(e.target.value as BatchType)}
              >
                <option value="convert">Convert Format</option>
                <option value="resize">Resize</option>
                <option value="filter">Apply Filter</option>
                <option value="compress">Compress to Target Size</option>
              </select>
            </div>

            {batchType === 'convert' && (
              <>
                <div className="form-group">
                  <label className="label">Target Format</label>
                  <select
                    className="select"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Quality: {quality}%</label>
                  <input
                    type="range"
                    className="slider"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {batchType === 'resize' && (
              <>
                <div className="form-group">
                  <label className="label">Width</label>
                  <input
                    type="number"
                    className="input"
                    value={resizeWidth}
                    onChange={(e) => setResizeWidth(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Height</label>
                  <input
                    type="number"
                    className="input"
                    value={resizeHeight}
                    onChange={(e) => setResizeHeight(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={maintainRatio}
                      onChange={(e) => setMaintainRatio(e.target.checked)}
                    />
                    Maintain aspect ratio
                  </label>
                </div>
              </>
            )}

            {batchType === 'filter' && (
              <div className="form-group">
                <label className="label">Filter</label>
                <select
                  className="select"
                  value={filterPreset}
                  onChange={(e) => setFilterPreset(e.target.value)}
                >
                  {AVAILABLE_FILTERS.map((f) => (
                    <option key={f} value={f}>
                      {getFilterName(f)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {batchType === 'compress' && (
              <>
                <div className="form-group">
                  <label className="label">Target Format</label>
                  <select
                    className="select"
                    value={compressFormat}
                    onChange={(e) => setCompressFormat(e.target.value as ImageFormat)}
                  >
                    <option value="webp">WebP (Recommended)</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Target Size (KB)</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    value={targetSizeKB}
                    onChange={(e) => setTargetSizeKB(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Max Quality: {quality}%</label>
                  <input
                    type="range"
                    className="slider"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                </div>
              </>
            )}

            <button
              className="btn btn-primary full-width"
              onClick={handleProcess}
              disabled={files.length === 0 || processing}
            >
              {processing
                ? `Processing ${progress.current}/${progress.total}...`
                : `Process ${files.length} Image${files.length !== 1 ? 's' : ''}`}
            </button>

            {processing && (
              <div style={{ marginTop: 16 }}>
                <ProgressBar
                  percent={(progress.current / progress.total) * 100}
                  message={progress.phase}
                />
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="batch-results">
              <div className="results-header">
                <h3>Results ({results.filter((r) => r.success).length}/{results.length} succeeded)</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleDownloadAll}
                  disabled={results.every((r) => !r.success)}
                >
                  Download All
                </button>
              </div>
              <div className="results-list">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`result-item ${result.success ? 'success' : 'error'}`}
                  >
                    <span className="result-name">{result.file.name}</span>
                    <span className={`result-status ${result.success ? 'success' : 'error'}`}>
                      {result.success ? `✓ ${(result.blob.size / 1024).toFixed(1)} KB` : `✗ ${result.error}`}
                    </span>
                    {result.success && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => downloadFile(result.blob, result.file.name, batchType === 'compress' ? compressFormat : format)}
                      >
                        Download
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="code-section" style={{ marginTop: 24 }}>
                <h4>DRP Code</h4>
                <pre className="code-block">{`import { batchProcess } from 'drp-imagesdk';

const results = await batchProcess(files, {
  type: '${batchType}',
  options: ${JSON.stringify(
    batchType === 'convert'
      ? { format, quality }
      : batchType === 'compress'
      ? { format: compressFormat, quality, targetSize: `${targetSizeKB}KB` }
      : batchType === 'resize'
      ? { width: resizeWidth, height: resizeHeight, maintainAspectRatio: maintainRatio }
      : { preset: filterPreset },
    null,
    2
  )}
});

// results: Array<{ blob, size, width, height, format, name }>`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
