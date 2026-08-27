export interface ZoomState {
  zoom: number;
  panX: number;
  panY: number;
}

export function createZoomState(): ZoomState {
  return { zoom: 1, panX: 0, panY: 0 };
}

export function zoomIn(state: ZoomState, step?: number): ZoomState {
  const s = step ?? 0.25;
  const newZoom = Math.min(state.zoom + s, 5);
  return { ...state, zoom: newZoom };
}

export function zoomOut(state: ZoomState, step?: number): ZoomState {
  const s = step ?? 0.25;
  const newZoom = Math.max(state.zoom - s, 0.1);
  return { ...state, zoom: newZoom };
}

export function zoomToFit(
  _state: ZoomState,
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number
): ZoomState {
  const scaleX = containerWidth / canvasWidth;
  const scaleY = containerHeight / canvasHeight;
  const zoom = Math.min(scaleX, scaleY) * 0.9;
  return {
    zoom: Math.max(0.1, Math.min(zoom, 5)),
    panX: 0,
    panY: 0,
  };
}

export function zoomTo100(
  _state: ZoomState,
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number
): ZoomState {
  return {
    zoom: 1,
    panX: (containerWidth - canvasWidth) / 2,
    panY: (containerHeight - canvasHeight) / 2,
  };
}

export function pan(state: ZoomState, deltaX: number, deltaY: number): ZoomState {
  return {
    ...state,
    panX: state.panX + deltaX,
    panY: state.panY + deltaY,
  };
}

export function zoomAtPoint(
  state: ZoomState,
  delta: number,
  clientX: number,
  clientY: number,
  containerRect: DOMRect
): ZoomState {
  const factor = delta > 0 ? 1.1 : 0.9;
  const newZoom = Math.max(0.1, Math.min(state.zoom * factor, 5));

  const mouseX = clientX - containerRect.left;
  const mouseY = clientY - containerRect.top;

  const zoomRatio = newZoom / state.zoom;
  const newPanX = mouseX - (mouseX - state.panX) * zoomRatio;
  const newPanY = mouseY - (mouseY - state.panY) * zoomRatio;

  return {
    zoom: newZoom,
    panX: newPanX,
    panY: newPanY,
  };
}

export function getCanvasTransform(state: ZoomState): string {
  return `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}
