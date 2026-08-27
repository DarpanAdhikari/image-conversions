import { useState, useRef, useEffect, useCallback } from 'react';
import {
  createEditor,
  Editor,
  CropOptions,
  ResizeOptions,
  RotateOptions,
  FlipOptions,
  Adjustments,
  FilterPreset,
  AVAILABLE_FILTERS,
  getFilterName,
  ExportOptions,
  ZoomState,
  createZoomState,
  zoomIn,
  zoomOut,
  zoomToFit,
  zoomAtPoint,
  getCanvasTransform,
  EXPORT_PRESETS,
  getPresetsByCategory,
  ImageFormat,
} from 'drp-imagesdk';
import DragDropUpload from '../components/DragDropUpload';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import CompressionControls from '../components/CompressionControls';
import { downloadFile } from '../utils/download';
import './EditorPage.css';

type Tool = 'select' | 'crop' | 'resize' | 'rotate' | 'flip' | 'adjust' | 'filter' | 'text' | 'shape';

export default function EditorPage() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [zoomState, setZoomState] = useState<ZoomState>(createZoomState());
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [showComparison, setShowComparison] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('image');
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const [cropOptions, setCropOptions] = useState<CropOptions>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
  });

  const [rotateOptions, setRotateOptions] = useState<RotateOptions>({
    degrees: 0,
  });

  const [flipOptions, setFlipOptions] = useState<FlipOptions>({
    horizontal: false,
    vertical: false,
  });

  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });

  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>('original');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 90,
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [compressMode, setCompressMode] = useState<'simple' | 'advanced'>('simple');
  const [targetSizeKB, setTargetSizeKB] = useState(200);

  useEffect(() => {
    if (editor && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      const canvas = editor.getCanvas();
      canvasRef.current.width = canvas.width;
      canvasRef.current.height = canvas.height;
      ctx.drawImage(canvas, 0, 0);
    }
  }, [editor, activeTool, adjustments, selectedFilter]);

  const handleCrop = () => {
    if (!editor) return;
    editor.crop(cropOptions);
    refreshCanvas();
  };

  const handleResize = () => {
    if (!editor) return;
    editor.resize(resizeOptions);
    refreshCanvas();
  };

  const handleRotate = () => {
    if (!editor) return;
    editor.rotate(rotateOptions);
    refreshCanvas();
  };

  const handleFlip = () => {
    if (!editor) return;
    editor.flip(flipOptions);
    refreshCanvas();
  };

  const handleAdjustmentChange = (key: keyof Adjustments, value: number) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    if (editor) {
      editor.adjust(newAdjustments);
      refreshCanvas();
    }
  };

  const handleFilterChange = (filter: FilterPreset) => {
    setSelectedFilter(filter);
    if (editor) {
      editor.applyFilter(filter);
      refreshCanvas();
    }
  };

  const handleExport = async () => {
    if (!editor) return;

    try {
      let blob: Blob;

      if (compressMode === 'advanced') {
        blob = await editor.compress({
          format: exportOptions.format as ImageFormat,
          quality: exportOptions.quality,
          targetSize: targetSizeKB * 1024,
          tolerance: 10,
          width: exportOptions.width,
          height: exportOptions.height,
          maintainAspectRatio: exportOptions.maintainAspectRatio,
        });
      } else {
        blob = await editor.export(exportOptions);
      }

      await downloadFile(blob, originalFileName, exportOptions.format);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const refreshCanvas = () => {
    if (editor && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      const canvas = editor.getCanvas();
      canvasRef.current.width = canvas.width;
      canvasRef.current.height = canvas.height;
      ctx.drawImage(canvas, 0, 0);
      setEditedImage(canvasRef.current.toDataURL());
    }
  };

  const handleZoomIn = () => setZoomState((s) => zoomIn(s));
  const handleZoomOut = () => setZoomState((s) => zoomOut(s));

  const handleZoomToFit = () => {
    if (canvasRef.current && canvasContainerRef.current) {
      const container = canvasContainerRef.current;
      setZoomState((s) =>
        zoomToFit(
          s,
          canvasRef.current!.width,
          canvasRef.current!.height,
          container.clientWidth,
          container.clientHeight
        )
      );
    }
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        setZoomState((s) => zoomAtPoint(s, -e.deltaY, e.clientX, e.clientY, rect));
      }
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select' && e.button === 0) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      setZoomState((s) => ({
        ...s,
        panX: s.panX + dx,
        panY: s.panY + dy,
      }));
    },
    [isPanning]
  );

  const handleMouseUp = () => setIsPanning(false);

  const handleUndo = () => {
    if (editor) {
      editor.undo();
      refreshCanvas();
    }
  };

  const handleRedo = () => {
    if (editor) {
      editor.redo();
      refreshCanvas();
    }
  };

  const handleReset = () => {
    if (editor) {
      editor.reset();
      refreshCanvas();
      setAdjustments({ brightness: 0, contrast: 0, saturation: 0 });
      setSelectedFilter('original');
    }
  };

  return (
    <div className="editor-page">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-title">Image Editor</span>
        </div>
        <div className="toolbar-center">
          <button
            className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => setActiveTool('select')}
          >
            Select
          </button>
          <button
            className={`toolbar-btn ${activeTool === 'crop' ? 'active' : ''}`}
            onClick={() => setActiveTool('crop')}
          >
            Crop
          </button>
          <button
            className={`toolbar-btn ${activeTool === 'resize' ? 'active' : ''}`}
            onClick={() => setActiveTool('resize')}
          >
            Resize
          </button>
          <button
            className={`toolbar-btn ${activeTool === 'rotate' ? 'active' : ''}`}
            onClick={() => setActiveTool('rotate')}
          >
            Rotate
          </button>
          <button
            className={`toolbar-btn ${activeTool === 'flip' ? 'active' : ''}`}
            onClick={() => setActiveTool('flip')}
          >
            Flip
          </button>
          <button
            className={`toolbar-btn ${activeTool === 'adjust' ? 'active' : ''}`}
            onClick={() => setActiveTool('adjust')}
          >
            Adjust
          </button>
          <button
            className={`toolbar-btn ${activeTool === 'filter' ? 'active' : ''}`}
            onClick={() => setActiveTool('filter')}
          >
            Filter
          </button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleUndo} disabled={!editor?.canUndo()}>
            Undo
          </button>
          <button className="toolbar-btn" onClick={handleRedo} disabled={!editor?.canRedo()}>
            Redo
          </button>
          <button className="toolbar-btn" onClick={handleReset}>
            Reset
          </button>
          <button
            className={`toolbar-btn ${showComparison ? 'active' : ''}`}
            onClick={() => setShowComparison(!showComparison)}
            disabled={!originalImage || !editedImage}
          >
            Compare
          </button>
          <button className="toolbar-btn primary" onClick={() => setShowExportModal(true)}>
            Export
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-canvas-area" ref={canvasContainerRef}>
          {!imageLoaded ? (
            <div className="canvas-empty">
              <DragDropUpload
                onFileSelect={async (file) => {
                  try {
                    const url = URL.createObjectURL(file);
                    setOriginalImage(url);
                    setOriginalFileName(file.name);
                    const newEditor = await createEditor(file);
                    setEditor(newEditor);
                    setImageLoaded(true);
                    if (canvasRef.current) {
                      const ctx = canvasRef.current.getContext('2d')!;
                      const canvas = newEditor.getCanvas();
                      canvasRef.current.width = canvas.width;
                      canvasRef.current.height = canvas.height;
                      ctx.drawImage(canvas, 0, 0);
                      setEditedImage(canvasRef.current.toDataURL());
                    }
                  } catch (error) {
                    console.error('Failed to load image:', error);
                  }
                }}
              >
                <div className="empty-content">
                  <div className="empty-icon">🖼️</div>
                  <h3>Upload an image</h3>
                  <p>Drag & drop your image here</p>
                  <p className="empty-hint">PNG • JPEG • WebP • AVIF • Paste with Ctrl+V</p>
                </div>
              </DragDropUpload>
            </div>
          ) : showComparison && originalImage && editedImage ? (
            <div className="comparison-view">
              <BeforeAfterSlider
                beforeSrc={originalImage}
                afterSrc={editedImage}
              />
            </div>
          ) : (
            <div
              className="canvas-viewport"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
              <canvas
                ref={canvasRef}
                className="editor-canvas"
                style={{ transform: getCanvasTransform(zoomState) }}
              />
            </div>
          )}

          {imageLoaded && (
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={handleZoomOut}>−</button>
              <span className="zoom-level">{Math.round(zoomState.zoom * 100)}%</span>
              <button className="zoom-btn" onClick={handleZoomIn}>+</button>
              <button className="zoom-btn" onClick={handleZoomToFit}>Fit</button>
              <button className="zoom-btn" onClick={() => setZoomState((s) => ({ ...s, zoom: 1, panX: 0, panY: 0 }))}>1:1</button>
            </div>
          )}
        </div>

        <div className="editor-sidebar">
          {activeTool === 'crop' && (
            <div className="sidebar-panel">
              <h3>Crop</h3>
              <div className="form-group">
                <label className="label">X</label>
                <input
                  type="number"
                  className="input"
                  value={cropOptions.x}
                  onChange={(e) =>
                    setCropOptions({ ...cropOptions, x: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">Y</label>
                <input
                  type="number"
                  className="input"
                  value={cropOptions.y}
                  onChange={(e) =>
                    setCropOptions({ ...cropOptions, y: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">Width</label>
                <input
                  type="number"
                  className="input"
                  value={cropOptions.width}
                  onChange={(e) =>
                    setCropOptions({ ...cropOptions, width: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">Height</label>
                <input
                  type="number"
                  className="input"
                  value={cropOptions.height}
                  onChange={(e) =>
                    setCropOptions({ ...cropOptions, height: Number(e.target.value) })
                  }
                />
              </div>
              <button className="btn btn-primary full-width" onClick={handleCrop}>
                Apply Crop
              </button>
            </div>
          )}

          {activeTool === 'resize' && (
            <div className="sidebar-panel">
              <h3>Resize</h3>
              <div className="form-group">
                <label className="label">Width</label>
                <input
                  type="number"
                  className="input"
                  value={resizeOptions.width}
                  onChange={(e) =>
                    setResizeOptions({ ...resizeOptions, width: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">Height</label>
                <input
                  type="number"
                  className="input"
                  value={resizeOptions.height}
                  onChange={(e) =>
                    setResizeOptions({ ...resizeOptions, height: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={resizeOptions.maintainAspectRatio}
                    onChange={(e) =>
                      setResizeOptions({
                        ...resizeOptions,
                        maintainAspectRatio: e.target.checked,
                      })
                    }
                  />
                  Maintain aspect ratio
                </label>
              </div>
              <button className="btn btn-primary full-width" onClick={handleResize}>
                Apply Resize
              </button>
            </div>
          )}

          {activeTool === 'rotate' && (
            <div className="sidebar-panel">
              <h3>Rotate</h3>
              <div className="form-group">
                <label className="label">Degrees</label>
                <input
                  type="range"
                  className="slider"
                  min={-180}
                  max={180}
                  value={rotateOptions.degrees}
                  onChange={(e) =>
                    setRotateOptions({ ...rotateOptions, degrees: Number(e.target.value) })
                  }
                />
                <span className="slider-value">{rotateOptions.degrees}°</span>
              </div>
              <button className="btn btn-primary full-width" onClick={handleRotate}>
                Apply Rotation
              </button>
            </div>
          )}

          {activeTool === 'flip' && (
            <div className="sidebar-panel">
              <h3>Flip</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={flipOptions.horizontal}
                    onChange={(e) =>
                      setFlipOptions({ ...flipOptions, horizontal: e.target.checked })
                    }
                  />
                  Horizontal
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={flipOptions.vertical}
                    onChange={(e) =>
                      setFlipOptions({ ...flipOptions, vertical: e.target.checked })
                    }
                  />
                  Vertical
                </label>
              </div>
              <button className="btn btn-primary full-width" onClick={handleFlip}>
                Apply Flip
              </button>
            </div>
          )}

          {activeTool === 'adjust' && (
            <div className="sidebar-panel">
              <h3>Adjustments</h3>
              <div className="form-group">
                <label className="label">
                  Brightness: {adjustments.brightness}
                </label>
                <input
                  type="range"
                  className="slider"
                  min={-100}
                  max={100}
                  value={adjustments.brightness}
                  onChange={(e) =>
                    handleAdjustmentChange('brightness', Number(e.target.value))
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">
                  Contrast: {adjustments.contrast}
                </label>
                <input
                  type="range"
                  className="slider"
                  min={-100}
                  max={100}
                  value={adjustments.contrast}
                  onChange={(e) =>
                    handleAdjustmentChange('contrast', Number(e.target.value))
                  }
                />
              </div>
              <div className="form-group">
                <label className="label">
                  Saturation: {adjustments.saturation}
                </label>
                <input
                  type="range"
                  className="slider"
                  min={-100}
                  max={100}
                  value={adjustments.saturation}
                  onChange={(e) =>
                    handleAdjustmentChange('saturation', Number(e.target.value))
                  }
                />
              </div>
            </div>
          )}

          {activeTool === 'filter' && (
            <div className="sidebar-panel">
              <h3>Filters</h3>
              <div className="filter-list">
                {AVAILABLE_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                    onClick={() => handleFilterChange(filter)}
                  >
                    {getFilterName(filter)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTool === 'select' && imageLoaded && (
            <div className="sidebar-panel">
              <h3>Properties</h3>
              <div className="property-row">
                <span className="property-label">Width:</span>
                <span className="property-value">{editor?.getWidth()}px</span>
              </div>
              <div className="property-row">
                <span className="property-label">Height:</span>
                <span className="property-value">{editor?.getHeight()}px</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Export Image</h2>
            <div className="form-group">
              <label className="label">Size Preset</label>
              <select
                className="select"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const preset = EXPORT_PRESETS.find((p) => p.name === e.target.value);
                    if (preset) {
                      setExportOptions({
                        ...exportOptions,
                        width: preset.width,
                        height: preset.height,
                      });
                    }
                  }
                }}
              >
                <option value="">Custom Size</option>
                {Object.entries(getPresetsByCategory()).map(([category, presets]) => (
                  <optgroup key={category} label={category}>
                    {(presets as any[]).map((preset) => (
                      <option key={preset.name} value={preset.name}>
                        {preset.label} ({preset.width}×{preset.height})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <CompressionControls
              format={exportOptions.format as ImageFormat}
              quality={exportOptions.quality ?? 90}
              targetSizeKB={targetSizeKB}
              mode={compressMode}
              sourceCanvas={editor?.getCanvas() ?? null}
              onFormatChange={(fmt) => setExportOptions({ ...exportOptions, format: fmt })}
              onQualityChange={(q) => setExportOptions({ ...exportOptions, quality: q })}
              onTargetSizeChange={setTargetSizeKB}
              onModeChange={setCompressMode}
            />
            <div className="form-group">
              <label className="label">Width</label>
              <input
                type="number"
                className="input"
                value={exportOptions.width || ''}
                onChange={(e) =>
                  setExportOptions({ ...exportOptions, width: Number(e.target.value) || undefined })
                }
              />
            </div>
            <div className="form-group">
              <label className="label">Height</label>
              <input
                type="number"
                className="input"
                value={exportOptions.height || ''}
                onChange={(e) =>
                  setExportOptions({ ...exportOptions, height: Number(e.target.value) || undefined })
                }
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exportOptions.maintainAspectRatio ?? true}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      maintainAspectRatio: e.target.checked,
                    })
                  }
                />
                Maintain aspect ratio
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleExport}>
                {compressMode === 'advanced' ? 'Compress & Download' : 'Export & Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
