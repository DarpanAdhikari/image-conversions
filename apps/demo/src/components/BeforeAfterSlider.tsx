import { useState, useRef, useCallback, useEffect } from 'react';
import './BeforeAfterSlider.css';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [updatePosition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setPosition((p) => Math.max(0, p - 2));
    } else if (e.key === 'ArrowRight') {
      setPosition((p) => Math.min(100, p + 2));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="before-after-slider"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="ba-image ba-after">
        <img src={afterSrc} alt={afterLabel} draggable={false} />
        <span className="ba-label ba-label-right">{afterLabel}</span>
      </div>

      <div
        className="ba-image ba-before"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={beforeSrc} alt={beforeLabel} draggable={false} />
        <span className="ba-label ba-label-left">{beforeLabel}</span>
      </div>

      <div className="ba-divider" style={{ left: `${position}%` }}>
        <div className="ba-handle">
          <span className="ba-handle-arrow">◀</span>
          <span className="ba-handle-arrow">▶</span>
        </div>
      </div>
    </div>
  );
}
