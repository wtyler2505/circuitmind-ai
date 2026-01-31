export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureResult {
  landmarks: HandLandmark[][];
  worldLandmarks: HandLandmark[][];
  handedness: any[][];
  timestamp: number;
}

type GestureListener = (result: GestureResult) => void;

class GestureEngine {
  private worker: Worker | null = null;
  private listeners: Set<GestureListener> = new Set();
  private isInitialized = false;
  private isProcessing = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    console.log('GestureEngine: Starting worker initialization...');

    return new Promise((resolve, reject) => {
      try {
        // Load the worker as a classic script because MediaPipe bundles use importScripts internally
        this.worker = new Worker('/assets/mediapipe/gestureWorker.js');
        
        const timeout = setTimeout(() => {
          if (!this.isInitialized) {
            console.error('GestureEngine: Initialization timed out');
            reject(new Error('Gesture tracking initialization timed out.'));
          }
        }, 15000); // 15s timeout for model loading

        this.worker.onmessage = (event) => {
          const { type, payload } = event.data;

          if (type === 'INIT_COMPLETE') {
            console.log('GestureEngine: Worker initialized successfully');
            this.isInitialized = true;
            clearTimeout(timeout);
            resolve();
          } else if (type === 'LANDMARKS') {
            this.listeners.forEach(l => l(payload));
            this.isProcessing = false;
          } else if (type === 'ERROR') {
            console.error('Gesture Worker Error:', payload);
            this.isProcessing = false;
            if (!this.isInitialized) {
              clearTimeout(timeout);
              reject(new Error(payload));
            }
          }
        };

        this.worker.onerror = (e) => {
          console.error('Gesture Worker Critical Error:', e);
          clearTimeout(timeout);
          reject(new Error('Gesture worker failed to load. Check console for details.'));
        };

        this.worker.postMessage({ type: 'INIT' });
      } catch (err) {
        console.error('GestureEngine: Failed to create worker', err);
        reject(err);
      }
    });
  }

  onLandmarks(listener: GestureListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async processFrame(video: HTMLVideoElement) {
    if (!this.isInitialized || !this.worker || this.isProcessing) return;

    // Use OffscreenCanvas or ImageBitmap for efficiency
    try {
      const imageBitmap = await createImageBitmap(video);
      this.isProcessing = true;
      this.worker.postMessage({
        type: 'PROCESS_FRAME',
        payload: {
          imageBitmap,
          timestamp: performance.now()
        }
      }, [imageBitmap]); // Transfer the bitmap to the worker
    } catch (e) {
      console.warn('Frame capture failed', e);
    }
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.listeners.clear();
    this.isInitialized = false;
  }
}

export const gestureEngine = new GestureEngine();
