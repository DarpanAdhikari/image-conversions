interface WorkerMessage {
  id: string;
  type: string;
  payload: unknown;
}

interface WorkerResponse {
  id: string;
  type: string;
  payload: unknown;
  error?: string;
}

export interface WorkerOperation {
  type: string;
  payload: unknown;
}

let worker: Worker | null = null;
let messageId = 0;
const pendingMessages = new Map<string, {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}>();

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;

  if (!worker) {
    try {
      const workerCode = `
        self.onmessage = function(e) {
          const { id, type, payload } = e.data;
          
          try {
            let result;
            
            switch (type) {
              case 'resize': {
                const { imageData, width, height } = payload;
                const canvas = new OffscreenCanvas(width, height);
                const ctx = canvas.getContext('2d');
                const imgData = new ImageData(
                  new Uint8ClampedArray(imageData.data),
                  imageData.width,
                  imageData.height
                );
                const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(imgData, 0, 0);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(tempCanvas, 0, 0, width, height);
                result = ctx.getImageData(0, 0, width, height);
                break;
              }
              
              case 'adjust': {
                const { imageData: imgData2, adjustments } = payload;
                const data = new Uint8ClampedArray(imgData2.data);
                const { brightness = 0, contrast = 0, saturation = 0 } = adjustments;
                
                const brightnessValue = brightness / 100;
                const contrastValue = (contrast + 100) / 100;
                const saturationValue = (saturation + 100) / 100;
                
                for (let i = 0; i < data.length; i += 4) {
                  let r = data[i] + brightnessValue * 255;
                  let g = data[i + 1] + brightnessValue * 255;
                  let b = data[i + 2] + brightnessValue * 255;
                  
                  r = ((r / 255 - 0.5) * contrastValue + 0.5) * 255;
                  g = ((g / 255 - 0.5) * contrastValue + 0.5) * 255;
                  b = ((b / 255 - 0.5) * contrastValue + 0.5) * 255;
                  
                  const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                  r = r + (gray - r) * (1 - saturationValue);
                  g = g + (gray - g) * (1 - saturationValue);
                  b = b + (gray - b) * (1 - saturationValue);
                  
                  data[i] = Math.max(0, Math.min(255, r));
                  data[i + 1] = Math.max(0, Math.min(255, g));
                  data[i + 2] = Math.max(0, Math.min(255, b));
                }
                
                result = { data: data.buffer, width: imgData2.width, height: imgData2.height };
                break;
              }
              
              default:
                throw new Error('Unknown operation: ' + type);
            }
            
            self.postMessage({ id, type: 'result', payload: result });
          } catch (err) {
            self.postMessage({ id, type: 'error', error: err.message });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { id, type, payload, error } = e.data;
        const pending = pendingMessages.get(id);
        if (pending) {
          pendingMessages.delete(id);
          if (type === 'error') {
            pending.reject(new Error(error));
          } else {
            pending.resolve(payload);
          }
        }
      };

      worker.onerror = (e) => {
        console.error('Worker error:', e);
      };
    } catch {
      return null;
    }
  }

  return worker;
}

export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
}

export async function processInWorker(operation: WorkerOperation): Promise<unknown> {
  const w = getWorker();
  if (!w) {
    throw new Error('Web Worker not supported');
  }

  const id = `msg_${++messageId}`;
  
  return new Promise((resolve, reject) => {
    pendingMessages.set(id, { resolve, reject });
    w.postMessage({ id, ...operation } as WorkerMessage);
  });
}

export function terminateWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
    pendingMessages.clear();
  }
}
