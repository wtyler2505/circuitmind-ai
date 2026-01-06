/// <reference lib="webworker" />

import * as THREE from 'three';
import { Primitives, Materials } from './threePrimitives';

// Polyfill DOM environment for THREE and Primitives
const polyfillDOM = () => {
  if (typeof self === 'undefined') return;

  // Polyfill document
  if (!('document' in self)) {
    (self as any).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') {
          // OffscreenCanvas is available in workers
          return new OffscreenCanvas(256, 256);
        }
        return {
          getContext: () => null,
          style: {},
        };
      },
      // Minimal implementation for other checks
      body: {
        appendChild: () => {},
        removeChild: () => {},
      },
    };
  }

  // Polyfill window
  if (!('window' in self)) {
    (self as any).window = self;
  }
};

polyfillDOM();

self.onmessage = async (e: MessageEvent) => {
  const { code } = e.data;

  if (!code) {
    self.postMessage({ success: false, error: 'No code provided' });
    return;
  }

  try {
    // 1. Create Function
    // We pass THREE, Primitives, Materials as arguments
    const createMesh = new Function('THREE', 'Primitives', 'Materials', code);

    // 2. Execute
    const componentGroup = createMesh(THREE, Primitives, Materials);

    // 3. Validate
    if (!componentGroup || !(componentGroup instanceof THREE.Object3D)) {
      throw new Error('Code did not return a valid THREE.Object3D (Group or Mesh).');
    }

    // 4. Handle Textures (CanvasTexture -> DataURL)
    // JSON serialization of CanvasTexture doesn't include the image data by default
    // We need to bake it.
    // However, OffscreenCanvas.convertToBlob() is async.
    // THREE.ObjectLoader parses JSON.
    // We can traverse the object, find materials with maps, and if map image is OffscreenCanvas, convert.
    
    // Note: This is complex. For now, we rely on basic geometry serialization.
    // If textures break, we might need a post-processing step here.
    
    // 5. Serialize
    const json = componentGroup.toJSON();

    self.postMessage({ success: true, json });

  } catch (error: any) {
    self.postMessage({
      success: false,
      error: error.message || error.toString(),
      details: error.stack,
    });
  }
};
