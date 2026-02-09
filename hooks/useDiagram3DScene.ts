import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { disposeObject } from '../components/diagram/3d/wireUtils';

// ============================================================================
// ENVIRONMENT MAP CREATION
// ============================================================================

const createEnvironmentMap = (renderer: THREE.WebGLRenderer): THREE.Texture => {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();

  // Sky gradient
  const skyGeo = new THREE.SphereGeometry(500, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  envScene.add(sky);

  const lightGeo = new THREE.SphereGeometry(50, 16, 16);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const light1 = new THREE.Mesh(lightGeo, lightMat);
  light1.position.set(200, 300, 100);
  envScene.add(light1);

  const light2 = new THREE.Mesh(lightGeo.clone(), lightMat.clone());
  light2.position.set(-200, 200, -100);
  envScene.add(light2);

  const envCamera = new THREE.CubeCamera(1, 1000, new THREE.WebGLCubeRenderTarget(256));
  envCamera.update(renderer, envScene);

  const envMap = pmremGenerator.fromCubemap(envCamera.renderTarget.texture).texture;
  pmremGenerator.dispose();

  return envMap;
};

// ============================================================================
// SCENE SETUP HELPERS
// ============================================================================

const createLighting = (scene: THREE.Scene): void => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(150, 300, 150);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 50;
  keyLight.shadow.camera.far = 800;
  keyLight.shadow.camera.left = -300;
  keyLight.shadow.camera.right = 300;
  keyLight.shadow.camera.top = 300;
  keyLight.shadow.camera.bottom = -300;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x88ccff, 0.5);
  fillLight.position.set(-100, 150, -100);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffcc88, 0.4);
  rimLight.position.set(0, 50, -200);
  scene.add(rimLight);
};

const createGround = (scene: THREE.Scene): void => {
  const groundGeo = new THREE.PlaneGeometry(2000, 2000);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x001122,
    roughness: 0.3,
    metalness: 0.8,
    transparent: true,
    opacity: 0.6,
    emissive: 0x002244,
    emissiveIntensity: 0.1,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 2.0;
  ground.receiveShadow = true;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(2000, 100, 0x0088ff, 0x002244);
  gridHelper.position.y = 2.01;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.2;
  scene.add(gridHelper);
};

const createPostProcessing = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): EffectComposer => {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    0.2, 0.1, 0.9
  );
  composer.addPass(bloomPass);

  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
  fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
  composer.addPass(fxaaPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return composer;
};

// ============================================================================
// RENDER LOOP
// ============================================================================

const createRenderLoop = (
  composer: EffectComposer,
  controls: OrbitControls,
  camera: THREE.PerspectiveCamera,
  componentsGroupRef: React.RefObject<THREE.Group | null>,
  stats: Stats
) => {
  let renderRequested = false;
  let lastRenderTime = 0;
  const FRAME_MIN_TIME = 1000 / 30;

  const requestRender = () => {
    if (!renderRequested) {
      renderRequested = true;
      requestAnimationFrame(render);
    }
  };

  const render = (now: number) => {
    renderRequested = false;

    if (now - lastRenderTime < FRAME_MIN_TIME) {
      requestRender();
      return;
    }
    lastRenderTime = now;

    stats.update();
    if (controls.update()) {
      requestRender();
    }

    if (componentsGroupRef.current) {
      componentsGroupRef.current.traverse((child) => {
        if (child instanceof THREE.LOD) {
          child.update(camera);
        }
      });
    }

    composer.render();
  };

  return requestRender;
};

// ============================================================================
// HOOK: useDiagram3DScene
// ============================================================================

export interface SceneRefs {
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
  sceneRef: React.RefObject<THREE.Scene | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
  composerRef: React.RefObject<EffectComposer | null>;
  componentsGroupRef: React.RefObject<THREE.Group | null>;
  wiresGroupRef: React.RefObject<THREE.Group | null>;
  telemetryGroupRef: React.RefObject<THREE.Group | null>;
  envMapRef: React.RefObject<THREE.Texture | null>;
}

export const useDiagram3DScene = (
  containerRef: React.RefObject<HTMLDivElement | null>
): SceneRefs => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const componentsGroupRef = useRef<THREE.Group | null>(null);
  const wiresGroupRef = useRef<THREE.Group | null>(null);
  const telemetryGroupRef = useRef<THREE.Group | null>(null);
  const envMapRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 250, 350);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment map
    const envMap = createEnvironmentMap(renderer);
    scene.environment = envMap;
    envMapRef.current = envMap;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 800;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 20, 0);
    controlsRef.current = controls;

    // Lighting & ground
    createLighting(scene);
    createGround(scene);

    // Static shadow maps
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    // Stats
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px';
    stats.dom.style.left = '10px';
    container.appendChild(stats.dom);

    // Object groups
    const componentsGroup = new THREE.Group();
    const wiresGroup = new THREE.Group();
    const telemetryGroup = new THREE.Group();
    scene.add(componentsGroup);
    scene.add(wiresGroup);
    scene.add(telemetryGroup);
    componentsGroupRef.current = componentsGroup;
    wiresGroupRef.current = wiresGroup;
    telemetryGroupRef.current = telemetryGroup;

    // Post-processing
    const composer = createPostProcessing(renderer, scene, camera, width, height);
    composerRef.current = composer;

    // Render loop
    const requestRender = createRenderLoop(composer, controls, camera, componentsGroupRef, stats);
    controls.addEventListener('change', requestRender);
    requestRender();
    setTimeout(requestRender, 100);
    setTimeout(requestRender, 500);

    // Expose requestRender to other effects
    (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender = requestRender;

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer || !composer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      composer.setSize(newWidth, newHeight);

      const pixelRatio = renderer.getPixelRatio();
      const fxaaPass = composer.passes.find(p => p instanceof ShaderPass && (p as ShaderPass).material?.uniforms?.['resolution']);
      if (fxaaPass instanceof ShaderPass) {
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (newWidth * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (newHeight * pixelRatio);
      }

      requestRender();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      envMap.dispose();
      scene.traverse(disposeObject);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (container.contains(stats.dom)) {
        container.removeChild(stats.dom);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    rendererRef,
    sceneRef,
    cameraRef,
    controlsRef,
    composerRef,
    componentsGroupRef,
    wiresGroupRef,
    telemetryGroupRef,
    envMapRef,
  };
};
