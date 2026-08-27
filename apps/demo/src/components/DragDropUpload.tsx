import { useCallback, useRef, useState, useEffect, ReactNode } from 'react';
import './DragDropUpload.css';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function DragDropUpload({
  onFileSelect,
  onFilesSelect,
  accept = 'image/*',
  multiple = false,
  children,
  className = '',
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleFile = useCallback(
    (file: File) => {
      if (accept && !file.type.match(accept.replace(/\*/g, '.*'))) {
        return;
      }
      onFileSelect(file);
    },
    [accept, onFileSelect]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        accept ? f.type.match(accept.replace(/\*/g, '.*')) : true
      );
      if (fileArray.length === 0) return;

      if (multiple && onFilesSelect) {
        onFilesSelect(fileArray);
      } else {
        onFileSelect(fileArray[0]);
      }
    },
    [accept, multiple, onFileSelect, onFilesSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [handleFiles]
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFile]);

  return (
    <div
      className={`drag-drop-upload ${isDragging ? 'dragging' : ''} ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
        className="drag-drop-input"
      />

      {isDragging && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-overlay-content">
            <span className="drag-drop-icon">📥</span>
            <p>Drop image{multiple ? 's' : ''} here</p>
          </div>
        </div>
      )}

      {children || (
        <div
          className="drag-drop-placeholder"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="drag-drop-icon">📁</span>
          <p>Drag & drop or click to upload</p>
          <p className="drag-drop-hint">Paste from clipboard with Ctrl+V</p>
        </div>
      )}
    </div>
  );
}
