import './threeWorkerPolyfill';
import * as THREE from 'three';
import { Primitives as BasePrimitives, Materials as BaseMaterials } from './threePrimitives';
import { validateThreeCode } from './threeCodeValidator';

// Safety Proxy for Materials: Return IC_BODY if a hallucinated material is requested
const Materials = new Proxy(BaseMaterials, {
  get: (target: typeof BaseMaterials, prop: string) => {
    if (prop in target) return target[prop as keyof typeof BaseMaterials];
    console.warn(`Worker Engine: Hallucinated material requested: Materials.${prop}. Falling back to IC_BODY.`);
    return (color: number = 0x222222) => BaseMaterials.IC_BODY(color);
  }
});

// Safety Proxy for Primitives: Smarter handling of hallucinations
const Primitives = new Proxy(BasePrimitives, {
  get: (target: typeof BasePrimitives, prop: string) => {
    if (prop in target) return target[prop as keyof typeof BasePrimitives];
    console.warn(`Worker Engine: Hallucinated primitive requested: Primitives.${prop}.`);
    
    // Heuristic: If it sounds like a data calculation, return safe data types
    if (prop.startsWith('get') || prop.startsWith('calc') || prop.startsWith('compute') || prop.includes('Position') || prop.includes('List')) {
        return () => []; // Return empty array to prevent .forEach crashes
    }
    
    // Default: Assume it's a geometry creator
    return () => {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1), 
            BaseMaterials.IC_BODY(0xff0000) // Red to indicate error
        );
        return mesh;
    };
  }
});

self.onmessage = async (e: MessageEvent) => {
  const { code } = e.data;

  if (!code) {
    self.postMessage({ success: false, error: 'No code provided' });
    return;
  }

  try {
    // SECURITY: Validate code before execution
    const validation = validateThreeCode(code);
    if (!validation.valid) {
      self.postMessage({ 
        success: false, 
        error: `Code validation failed: ${validation.errors.join(', ')}` 
      });
      return;
    }

    // 1. Create Function (now validated)
    const createMesh = new Function('THREE', 'Primitives', 'Materials', code);

    // 2. Execute
    const componentGroup = createMesh(THREE, Primitives, Materials);

    // 3. Validate result
    if (!componentGroup || !(componentGroup instanceof THREE.Object3D)) {
      throw new Error('Code did not return a valid THREE.Object3D.');
    }

    // 4. Robust Texture Baking (Async)
    // We must convert OffscreenCanvas to serializable data URLs because toJSON 
    // and postMessage cannot handle raw OffscreenCanvas objects correctly in all environments.
    interface TextureImage extends Partial<ImageBitmap> {
        convertToBlob?: () => Promise<Blob>;
        toBlob?: (callback: (blob: Blob | null) => void) => void;
        src?: string;
    }

    const bakeTextures = async (object: THREE.Object3D) => {
      const textures: THREE.Texture[] = [];
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            const m = mat as THREE.Material & { [key: string]: unknown };
            // Comprehensive list of texture maps to check
            const mapNames = [
                'map', 'normalMap', 'roughnessMap', 'metalnessMap', 
                'emissiveMap', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap',
                'clearcoatMap', 'clearcoatRoughnessMap', 'clearcoatNormalMap',
                'transmissionMap', 'thicknessMap', 
                'sheenColorMap', 'sheenRoughnessMap',
                'specularIntensityMap', 'specularColorMap',
                'iridescenceMap', 'iridescenceThicknessMap',
                'anisotropyMap'
            ];
            
            mapNames.forEach(prop => {
              const tex = m[prop];
              if (tex instanceof THREE.Texture && tex.image && (tex.image instanceof OffscreenCanvas || tex.image.constructor.name === 'OffscreenCanvas')) {
                textures.push(tex);
              }
            });
          });
        }
      });

      for (const tex of textures) {
        const texture = tex as THREE.Texture & { image: TextureImage };
        const canvas = texture.image; 
        
        if (!canvas) {
            console.warn('Worker: Texture has no image, skipping.');
            continue;
        }

        try {
          let blob: Blob | null = null;

          // Check if it's an OffscreenCanvas or standard Canvas with blob support
          if (canvas.convertToBlob && typeof canvas.convertToBlob === 'function') {
             blob = await canvas.convertToBlob();
          } else if (canvas.toBlob && typeof canvas.toBlob === 'function') {
             blob = await new Promise<Blob | null>(resolve => canvas.toBlob!(resolve));
          } else if (canvas instanceof ImageBitmap) {
             // ImageBitmaps are already efficient, but we might need to convert for serialization if required
             // For now, we assume ImageBitmap can be handled or transfered, but strict JSON serialization might fail.
             // Converting ImageBitmap to Blob requires drawing it to a canvas first.
             const tempCanvas = new OffscreenCanvas(canvas.width, canvas.height);
             const ctx = tempCanvas.getContext('2d');
             if (ctx) {
                 ctx.drawImage(canvas, 0, 0);
                 blob = await tempCanvas.convertToBlob();
             }
          }

          if (!blob) {
             // Safe warning, don't crash
             // console.warn('Worker: Canvas does not support blob conversion or blob is null.');
             continue;
          }

          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          // We replace the image with a plain object that has the same dimensions and a src
          // THREE.ObjectLoader.parse will handle these during deserialization.
          const img = {
            width: canvas.width,
            height: canvas.height,
            src: dataUrl
          };
          
          // Hack: Replace the internal image. Three.js serialization picks up .image.src
          texture.image = img as unknown as ImageBitmap;
          tex.needsUpdate = true;
        } catch (e) {
          console.error('Worker: Failed to bake texture', e);
          texture.image = null as unknown as ImageBitmap; // Fallback: strip if baking fails
        }
      }
    };

    await bakeTextures(componentGroup);

    // Strategy: Try toJSON. 
    let json;
    try {
        json = componentGroup.toJSON();
    } catch (serializeError) {
        console.warn('Worker: Serialization failed even after baking, stripping textures...', serializeError);
        componentGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(m => {
                    const mat = m as THREE.MeshStandardMaterial;
                    if (mat.map) mat.map = null;
                    if (mat.normalMap) mat.normalMap = null;
                });
            }
        });
        json = componentGroup.toJSON();
    }

    self.postMessage({ success: true, json });

  } catch (error: unknown) {
    const err = error as Error;
    self.postMessage({
      success: false,
      error: err.message || String(error),
      details: err.stack,
    });
  }
};