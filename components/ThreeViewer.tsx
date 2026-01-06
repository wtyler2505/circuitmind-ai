import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ErrorBoundary from './ErrorBoundary';
import { Primitives, Materials } from '../services/threePrimitives';
import { executeInWorker } from '../services/threeCodeRunner';

interface ThreeViewerProps {
  code?: string;
  modelUrl?: string;
}

const BLOCKED_CODE_TOKENS: { pattern: RegExp; label: string }[] = [
  // Keeping fast-fail checks, though worker provides true sandbox
  { pattern: /\bwindow\b/, label: 'window' },
  { pattern: /\bdocument\b/, label: 'document' },
  { pattern: /\blocalStorage\b/, label: 'localStorage' },
  { pattern: /\bfetch\b/, label: 'fetch' },
];

const validateThreeCode = (code: string): string | null => {
  const trimmed = code.trim();
  if (!trimmed) return 'No 3D code provided.';
  
  if (!/return\s+group\s*;?$/m.test(trimmed) && !/return\s+group\s*;?\s*\/\/.*$/m.test(trimmed)) {
    if (!/return\s+group\s*;?/m.test(trimmed)) {
        return '3D code must end with "return group;".';
    }
  }

  const blocked = BLOCKED_CODE_TOKENS.filter(({ pattern }) => pattern.test(trimmed)).map(
    ({ label }) => label
  );
  
  if (blocked.length > 0) {
    return `Security violation: Code contains blocked tokens: ${blocked.join(', ')}`;
  }
  return null;
};

// Utility: Dispose a Three.js object and all children
const disposeObject = (obj: THREE.Object3D) => {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        mat.dispose();
        // Dispose textures on MeshStandardMaterial
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.map?.dispose();
          mat.normalMap?.dispose();
          mat.roughnessMap?.dispose();
          mat.metalnessMap?.dispose();
          mat.emissiveMap?.dispose();
        }
      });
    }
  });
};

const ThreeViewerContent: React.FC<ThreeViewerProps> = ({ code, modelUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Track scene objects for proper cleanup
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const contentGroupRef = useRef<THREE.Object3D | null>(null);
  const errorMeshRef = useRef<THREE.Mesh | null>(null);

  const [settings, setSettings] = useState({
    ambientIntensity: 1.0,
    ambientColor: '#ffffff',
    dirIntensity: 3.0,
    dirColor: '#00f3ff',
  });

  const [showControls, setShowControls] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasContent = Boolean(code || modelUrl);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Setup Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a12'); // Cyber dark
    scene.fog = new THREE.Fog('#0a0a12', 5, 30);
    sceneRef.current = scene;

    // --- Setup Camera ---
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    // --- Setup Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Setup Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(settings.ambientColor, settings.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(settings.dirColor, settings.dirIntensity);
    dirLight.position.set(5, 10, 7);
    // Optimize shadow map for performance (1024 instead of default 2048+)
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Point light without shadows (expensive on GPU)
    const purpleLight = new THREE.PointLight(0xbd00ff, 2, 10);
    purpleLight.position.set(-5, 2, -5);
    purpleLight.castShadow = false;
    scene.add(purpleLight);

    // --- Helpers ---
    // Make grid brighter to ensure user sees *something*
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    // --- Content Loading ---
    const loadContent = async () => {
      // Dispose previous content before adding new
      if (contentGroupRef.current) {
        scene.remove(contentGroupRef.current);
        disposeObject(contentGroupRef.current);
        contentGroupRef.current = null;
      }
      if (errorMeshRef.current) {
        scene.remove(errorMeshRef.current);
        errorMeshRef.current.geometry?.dispose();
        if (errorMeshRef.current.material instanceof THREE.Material) {
          errorMeshRef.current.material.dispose();
        }
        errorMeshRef.current = null;
      }

      try {
        if (code) {
          console.log('Executing 3D Code (Worker)...');
          const validationError = validateThreeCode(code);
          if (validationError) {
            throw new Error(validationError);
          }

          // Execute Generated Code in Worker
          const json = await executeInWorker(code);
          
          // Hydrate scene from JSON
          const loader = new THREE.ObjectLoader();
          const componentGroup = loader.parse(json);

          if (componentGroup && componentGroup instanceof THREE.Object3D) {
            scene.add(componentGroup);
            contentGroupRef.current = componentGroup;

            // Auto-center and scale
            const box = new THREE.Box3().setFromObject(componentGroup);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            if (maxDim > 0) {
              const scale = 4 / maxDim; // Slightly smaller than before to fit view
              componentGroup.scale.setScalar(scale);
            }
            // Re-center after scaling
            const newBox = new THREE.Box3().setFromObject(componentGroup);
            const newCenter = newBox.getCenter(new THREE.Vector3());
            componentGroup.position.sub(newCenter);
            
          } else {
            throw new Error('Worker returned invalid 3D object data.');
          }
        } else if (modelUrl) {
          const loader = new GLTFLoader();
          loader.load(
            modelUrl,
            (gltf) => {
              const model = gltf.scene;
              scene.add(model);
              contentGroupRef.current = model;

              const box = new THREE.Box3().setFromObject(model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);

              if (maxDim > 0) {
                const scale = 2 / maxDim;
                model.scale.setScalar(scale);
              }
              model.position.sub(center.multiplyScalar(model.scale.x));
              model.position.y += (size.y * model.scale.y) / 2;
            },
            undefined,
            (err) => {
              console.error('GLTF Load Error', err);
              throw new Error('Failed to load model URL.');
            }
          );
        } else {
          // Nothing to load? Show placeholder?
          // Only if we expected something.
        }
      } catch (err: unknown) {
        console.error('3D Render Error:', err);
        setError(`Render Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);

        // Fallback: Wireframe Ghost Cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff00ff, 
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const errorMesh = new THREE.Mesh(geometry, material);
        scene.add(errorMesh);
        errorMeshRef.current = errorMesh;
      }
    };

    if (code || modelUrl) {
      loadContent();
    }

    // --- Resize Handling with ResizeObserver ---
    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerRef.current);

    // Initial size check
    handleResize();

    // --- Animation Loop ---
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);

      // Dispose content group
      if (contentGroupRef.current) {
        scene.remove(contentGroupRef.current);
        disposeObject(contentGroupRef.current);
        contentGroupRef.current = null;
      }

      // Dispose error mesh
      if (errorMeshRef.current) {
        scene.remove(errorMeshRef.current);
        errorMeshRef.current.geometry?.dispose();
        if (errorMeshRef.current.material instanceof THREE.Material) {
          errorMeshRef.current.material.dispose();
        }
        errorMeshRef.current = null;
      }

      // Dispose all remaining scene objects (lights, grid, etc.)
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
        if (child instanceof THREE.Light) {
          child.dispose?.();
        }
      });
      scene.clear();

      // Dispose controls
      controls.dispose();
      controlsRef.current = null;

      // Dispose renderer and remove from DOM
      if (renderer.domElement && container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer.forceContextLoss();

      // Clear all potential AI highlight timers (if passed through context/props)
      // Note: highlightedComponents are managed in DiagramCanvas, but we ensure
      // this viewer doesn't hold onto stale refs.
      
      // Clear refs
      sceneRef.current = null;
      ambientLightRef.current = null;
      dirLightRef.current = null;
      rendererRef.current = null;
    };
    // Light settings intentionally excluded - updated in separate effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, modelUrl]);

  // --- Light Updates ---
  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = settings.ambientIntensity;
      ambientLightRef.current.color.set(settings.ambientColor);
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = settings.dirIntensity;
      dirLightRef.current.color.set(settings.dirColor);
    }
  }, [settings]);

  // We throw error to Boundary if it's critical, but here we handled it with fallback visualization
  // Only throw if we want the ErrorBoundary UI to replace the canvas entirely.
  // if (error) throw new Error(error);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700 group bg-cyber-dark">
      <div ref={containerRef} className="w-full h-full" />

      {!hasContent && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-slate-300 p-6 pointer-events-none">
          <div className="w-16 h-16 rounded-full border border-neon-purple/40 flex items-center justify-center text-neon-purple/80">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">No 3D model yet.</h3>
            <p className="text-[11px] text-slate-300 max-w-xs">
              Generate a model with AI or paste a GLB/GLTF URL in the editor.
            </p>
          </div>
          <div className="text-[11px] text-slate-300">
            Tip: Models are auto-centered and scaled for the grid.
          </div>
        </div>
      )}

      {/* Error Toast inside Canvas */}
      {error && (
        <div className="absolute top-2 left-2 right-12 bg-red-900/80 border border-red-500 text-white text-xs p-2 rounded backdrop-blur">
          ⚠ {error} (Showing fallback)
        </div>
      )}

      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-2 right-2 bg-slate-800/80 p-2 rounded text-slate-300 hover:text-white transition-colors z-10"
        title="Lighting Controls"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {showControls && (
        <div className="absolute top-12 right-2 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg w-64 text-xs shadow-xl animate-fade-in z-20">
          <h4 className="text-neon-cyan font-bold mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">
            Lighting Studio
          </h4>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300">Ambient</label>
                <span className="text-slate-200 font-mono">{settings.ambientIntensity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.ambientIntensity}
                onChange={(e) =>
                  setSettings({ ...settings, ambientIntensity: parseFloat(e.target.value) })
                }
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300">Directional</label>
                <span className="text-slate-200 font-mono">{settings.dirIntensity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={settings.dirIntensity}
                onChange={(e) =>
                  setSettings({ ...settings, dirIntensity: parseFloat(e.target.value) })
                }
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ThreeViewer(props: ThreeViewerProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="w-full h-full flex flex-col items-center justify-center bg-cyber-dark text-red-500 p-4 border border-red-900 rounded-xl">
          <h3 className="font-bold">WebGL Crash</h3>
          <p className="text-xs">Context lost. Try refreshing.</p>
        </div>
      }
    >
      <ThreeViewerContent {...props} />
    </ErrorBoundary>
  );
}
