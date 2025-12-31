import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ErrorBoundary from './ErrorBoundary';

interface ThreeViewerProps {
  code?: string;
  modelUrl?: string;
}

const ThreeViewerContent: React.FC<ThreeViewerProps> = ({ code, modelUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const [settings, setSettings] = useState({
    ambientIntensity: 0.8,
    ambientColor: '#ffffff',
    dirIntensity: 2.5,
    dirColor: '#00f3ff'
  });

  const [showControls, setShowControls] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Setup Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a12'); // Cyber dark
    scene.fog = new THREE.Fog('#0a0a12', 5, 30);

    // --- Setup Camera ---
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    // --- Setup Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Setup Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(settings.ambientColor, settings.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(settings.dirColor, settings.dirIntensity);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const purpleLight = new THREE.PointLight(0xbd00ff, 2, 10);
    purpleLight.position.set(-5, 2, -5);
    scene.add(purpleLight);

    // --- Helpers ---
    // Make grid brighter to ensure user sees *something*
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    // --- Content Loading ---
    const loadContent = async () => {
      // Clear previous objects (except lights/helpers)
      // Note: A simple clear is safer than trying to track IDs
      // but we need to keep lights. 
      // Simplified: We just add the new group.
      
      try {
        if (code) {
          console.log("Executing 3D Code...");
          // Execute Generated Code
          // eslint-disable-next-line no-new-func
          const createMesh = new Function('THREE', code);
          const componentGroup = createMesh(THREE);
          
          if (componentGroup && componentGroup instanceof THREE.Object3D) {
            scene.add(componentGroup);
            
            // Auto-Center and Scale
            const box = new THREE.Box3().setFromObject(componentGroup);
            if (!box.isEmpty()) {
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                
                // If it's huge or tiny, scale it to ~2 units
                if (maxDim > 0) {
                    const scaleFactor = 2 / maxDim;
                    componentGroup.scale.setScalar(scaleFactor);
                }
                
                // Re-center after scale (approximate)
                componentGroup.position.sub(center.multiplyScalar(componentGroup.scale.x)); 
                componentGroup.position.y += (size.y * componentGroup.scale.y) / 2; // Sit on grid
            }
          } else {
             throw new Error("Code ran but returned no valid THREE object.");
          }
        } else if (modelUrl) {
          const loader = new GLTFLoader();
          loader.load(
            modelUrl,
            (gltf) => {
              const model = gltf.scene;
              scene.add(model);
              
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
              console.error("GLTF Load Error", err);
              throw new Error("Failed to load model URL.");
            }
          );
        } else {
             // Nothing to load? Show placeholder?
             // Only if we expected something.
        }
      } catch (err: any) {
        console.error("3D Render Error:", err);
        setError(`Render Failed: ${err.message}`);
        
        // Fallback: Red Wireframe Cube so screen isn't black
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: true });
        const errorMesh = new THREE.Mesh(geometry, material);
        scene.add(errorMesh);
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
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      ambientLightRef.current = null;
      dirLightRef.current = null;
      rendererRef.current = null;
    };
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      </button>

      {showControls && (
        <div className="absolute top-12 right-2 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg w-64 text-xs shadow-xl animate-fade-in z-20">
          <h4 className="text-neon-cyan font-bold mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">Lighting Studio</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-400">Ambient</label>
                <span className="text-slate-200 font-mono">{settings.ambientIntensity}</span>
              </div>
              <input 
                type="range" 
                min="0" max="2" step="0.1"
                value={settings.ambientIntensity}
                onChange={(e) => setSettings({...settings, ambientIntensity: parseFloat(e.target.value)})}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-400">Directional</label>
                <span className="text-slate-200 font-mono">{settings.dirIntensity}</span>
              </div>
              <input 
                type="range" 
                min="0" max="5" step="0.1"
                value={settings.dirIntensity}
                onChange={(e) => setSettings({...settings, dirIntensity: parseFloat(e.target.value)})}
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
        <ErrorBoundary fallback={
            <div className="w-full h-full flex flex-col items-center justify-center bg-cyber-dark text-red-500 p-4 border border-red-900 rounded-xl">
                <h3 className="font-bold">WebGL Crash</h3>
                <p className="text-xs">Context lost. Try refreshing.</p>
            </div>
        }>
            <ThreeViewerContent {...props} />
        </ErrorBoundary>
    )
}