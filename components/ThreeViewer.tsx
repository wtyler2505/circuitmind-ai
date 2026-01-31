import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ErrorBoundary from './ErrorBoundary';
import { disposeCaches } from '../services/threePrimitives';
import { executeInWorker } from '../services/threeCodeRunner';
import { securityAuditor } from '../services/securityAuditor';

interface ThreeViewerProps {
  code?: string;
  modelUrl?: string;
}

const validateThreeCode = (code: string): string | null => {
  const trimmed = code.trim();
  if (!trimmed) return 'No 3D code provided.';
  if (!/return\s+group/i.test(trimmed)) {
      return '3D code must return the "group" object.';
  }
  const violations = securityAuditor.scanAIGeneratedCode(trimmed);
  if (violations.length > 0) {
    return `Security violation: ${violations[0].message}`;
  }
  return null;
};

const disposeObject = (obj: THREE.Object3D) => {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        mat.dispose();
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

export interface ThreeViewerRef {
  resize: () => void;
}

const ThreeViewerContent = forwardRef<ThreeViewerRef, ThreeViewerProps>(({ code, modelUrl }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

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
  const [xrayMode, setXrayMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasContent = Boolean(code || modelUrl);

  useEffect(() => {
      if (!contentGroupRef.current) return;
      contentGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
              const mat = child.material;
              if (mat instanceof THREE.MeshPhysicalMaterial && mat.roughness > 0.6 && mat.color.getHex() === 0x222222) {
                  mat.transparent = true;
                  mat.opacity = xrayMode ? 0.1 : 1.0;
                  mat.needsUpdate = true;
              }
          }
      });
  }, [xrayMode]);

  const handleResize = useCallback(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    if (width === 0 || height === 0) return;
    const currentSize = rendererRef.current.getSize(new THREE.Vector2());
    if (Math.abs(currentSize.width - width) < 1 && Math.abs(currentSize.height - height) < 1) return;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height, false);
  }, []);

  useImperativeHandle(ref, () => ({ resize: handleResize }), [handleResize]);

  const loadContent = useCallback(async () => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (contentGroupRef.current) {
      scene.remove(contentGroupRef.current);
      disposeObject(contentGroupRef.current);
      contentGroupRef.current = null;
    }
    if (errorMeshRef.current) {
      scene.remove(errorMeshRef.current);
      disposeObject(errorMeshRef.current);
      errorMeshRef.current = null;
    }
    setError(null);
    try {
      if (code) {
        const validationError = validateThreeCode(code);
        if (validationError) throw new Error(validationError);
        const json = await executeInWorker(code);
        const loader = new THREE.ObjectLoader();
        const componentGroup = loader.parse(json);
        if (componentGroup && componentGroup instanceof THREE.Object3D) {
          scene.add(componentGroup);
          contentGroupRef.current = componentGroup;
          const box = new THREE.Box3().setFromObject(componentGroup);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scale = 30 / maxDim;
            componentGroup.scale.setScalar(scale);
          }
          const newBox = new THREE.Box3().setFromObject(componentGroup);
          const newCenter = newBox.getCenter(new THREE.Vector3());
          componentGroup.position.sub(newCenter);
          componentGroup.position.y += 5;
        } else {
          throw new Error('Worker returned invalid 3D object data.');
        }
      } else if (modelUrl) {
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
            const model = gltf.scene;
            scene.add(model);
            contentGroupRef.current = model;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const scale = 30 / maxDim;
              model.scale.setScalar(scale);
            }
            const newBox = new THREE.Box3().setFromObject(model);
            const newCenter = newBox.getCenter(new THREE.Vector3());
            model.position.sub(newCenter);
            model.position.y += 5;
          }, undefined, (err) => {
            console.error('GLTF Load Error', err);
            setError('Failed to load model URL.');
          }
        );
      }
    } catch (err: unknown) {
      console.error('3D Content Error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
      scene.add(cube);
      errorMeshRef.current = cube;
    }
  }, [code, modelUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a12');
    scene.fog = new THREE.Fog('#0a0a12', 10, 50);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(50, 50, 50);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const studioScene = new THREE.Scene();
    const studioLight = new THREE.RectAreaLight(0xffffff, 5, 10, 10);
    studioLight.position.set(5, 5, 5);
    studioLight.lookAt(0, 0, 0);
    studioScene.add(studioLight);
    const envTarget = pmremGenerator.fromScene(studioScene);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();
    const ambientLight = new THREE.AmbientLight(settings.ambientColor, settings.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;
    const dirLight = new THREE.DirectionalLight(settings.dirColor, settings.dirIntensity);
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    dirLightRef.current = dirLight;
    const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
    scene.add(gridHelper);
    const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.1, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    scanLine.rotation.x = -Math.PI / 2;
    scene.add(scanLine);
    let resizeTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { window.requestAnimationFrame(handleResize); }, 16);
    });
    observer.observe(container);
    resizeObserverRef.current = observer;
    handleResize();
    let animationId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      scanLine.position.y = Math.sin(time * 0.5) * 10;
      if (scanLine.material instanceof THREE.Material) {
        scanLine.material.opacity = (Math.sin(time * 4) + 1) * 0.05;
      }
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationId);
      if (scene.environment) scene.environment.dispose();
      envTarget.dispose();
      if (contentGroupRef.current) disposeObject(contentGroupRef.current);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else if (child.material) child.material.dispose();
        }
        if (child instanceof THREE.Light) child.dispose?.();
      });
      scene.clear();
      controls.dispose();
      if (renderer.domElement && container) container.removeChild(renderer.domElement);
      renderer.dispose();
      disposeCaches();
    };
    // We only want to run setup once or when handleResize changes.
    // Settings changes are handled by a separate granular effect to avoid full scene rebuilds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleResize]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = settings.ambientIntensity;
      ambientLightRef.current.color.set(settings.ambientColor);
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = settings.dirIntensity;
      dirLightRef.current.color.set(settings.dirColor);
    }
  }, [settings.ambientIntensity, settings.ambientColor, settings.dirIntensity, settings.dirColor]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700 group bg-cyber-dark panel-frame panel-loading">
      <div ref={containerRef} className="w-full h-full relative z-10" />
      {!hasContent && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-slate-300 p-6 pointer-events-none z-20">
          <div className="w-20 h-20 flex items-center justify-center">
            <img src="/assets/ui/logo.png" alt="" className="w-16 h-16 object-contain opacity-40 grayscale animate-pulse-slow" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-[0.2em]">No 3D model yet.</h3>
            <p className="text-[11px] text-slate-300 max-w-xs">Generate a model with AI or paste a GLB/GLTF URL in the editor.</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-2 left-2 right-12 bg-red-950/90 border border-red-500/50 text-red-200 text-[10px] p-3 rounded-lg backdrop-blur-xl shadow-2xl z-30 animate-shake">
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold">ENGINE_FAILURE:</span>
            <span className="font-mono opacity-90">{error}</span>
          </div>
          <button onClick={() => { setError(null); loadContent(); }} className="mt-2 text-red-400 hover:text-white underline uppercase tracking-tighter font-bold">Retry Construction</button>
        </div>
      )}
      <button onClick={() => setShowControls(!showControls)} className="absolute top-2 right-2 bg-slate-800/80 p-2 rounded text-slate-300 hover:text-white transition-colors z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      </button>
      <button onClick={() => setXrayMode(!xrayMode)} className={`absolute top-2 right-12 p-2 rounded transition-colors z-10 font-bold text-xs uppercase tracking-wider border ${xrayMode ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-slate-800/80 border-transparent text-slate-400 hover:text-white'}`}>{xrayMode ? 'X-RAY ON' : 'X-RAY'}</button>
      {showControls && (
        <div className="absolute top-12 right-2 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg w-64 text-xs shadow-xl z-20">
          <h4 className="text-neon-cyan font-bold mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">Lighting Studio</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300">Ambient</label>
                <span className="text-slate-200 font-mono">{settings.ambientIntensity}</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={settings.ambientIntensity} onChange={(e) => setSettings({ ...settings, ambientIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-slate-300">Directional</label>
                <span className="text-slate-200 font-mono">{settings.dirIntensity}</span>
              </div>
              <input type="range" min="0" max="5" step="0.1" value={settings.dirIntensity} onChange={(e) => setSettings({ ...settings, dirIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ThreeViewerContent.displayName = 'ThreeViewerContent';

export default function ThreeViewer(props: ThreeViewerProps) {
  return (
    <ErrorBoundary fallback={<div className="w-full h-full flex flex-col items-center justify-center bg-cyber-dark text-red-500 p-4 border border-red-900 rounded-xl"><h3 className="font-bold">WebGL Crash</h3><p className="text-xs">Context lost. Try refreshing.</p></div>}>
      <ThreeViewerContent {...props} />
    </ErrorBoundary>
  );
}
