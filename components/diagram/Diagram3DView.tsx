import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { WiringDiagram, ElectronicComponent } from '../../types';
import { getComponentShape } from './componentShapes';
import { useTelemetry } from '../../contexts/TelemetryContext';
import { useLayout } from '../../contexts/LayoutContext';
import { useCameraControls } from '../../hooks/useCameraControls';
import {
  createLODComponent,
  getPinCoordinates,
  createWireMaterial,
  getWireColor,
  createPlasticMaterial,
  disposeObject,
  createEnvironmentMap,
} from '../../services/threeFunctions';
import IconButton from '../IconButton';

interface Diagram3DViewProps {
  diagram: WiringDiagram | null;
  positions: Map<string, { x: number; y: number }>;
  onComponentClick?: (component: ElectronicComponent) => void;
  onGenerate3D?: (component: ElectronicComponent) => Promise<void>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Diagram3DViewComponent = React.forwardRef<{ getSnapshotBlob: () => Promise<Blob | null> }, Diagram3DViewProps>(
  ({ diagram, positions, onComponentClick: _onComponentClick, onGenerate3D }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const _animationIdRef = useRef<number>(0);
  const componentsGroupRef = useRef<THREE.Group | null>(null);
  const wiresGroupRef = useRef<THREE.Group | null>(null);
  const telemetryGroupRef = useRef<THREE.Group | null>(null);
  const envMapRef = useRef<THREE.Texture | null>(null);

  const {
    cameraRef,
    createCamera,
    setupControls,
    centerOnBoundingBox,
    dispose: disposeControls,
  } = useCameraControls();

  const { liveData } = useTelemetry();
  const { neuralLinkEnabled, setNeuralLinkEnabled } = useLayout();
  const [missingModels, setMissingModels] = useState<ElectronicComponent[]>([]);

  // Expose snapshot capability to parent (DiagramCanvas)
  React.useImperativeHandle(ref, () => ({
    getSnapshotBlob: async () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;

      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const composer = composerRef.current;

      // Force a high-quality render for the snapshot
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      return new Promise((resolve) => {
        renderer.domElement.toBlob((blob) => resolve(blob), 'image/png', 0.8);
      });
    }
  }));

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1a);
    sceneRef.current = scene;

    // Camera (via hook)
    const camera = createCamera(width, height);

    // Renderer with enhanced settings
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable MSAA if we are using post-processing
      powerPreference: 'high-performance',
      precision: 'mediump', // Use medium precision for better performance
    });
    renderer.setSize(width, height);
    // CRITICAL PERFORMANCE FIX: Cap pixel ratio at 1.0
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create environment map for PBR reflections
    const envMap = createEnvironmentMap(renderer);
    scene.environment = envMap;
    envMapRef.current = envMap;

    // Controls (via hook)
    const controls = setupControls(renderer.domElement);

    // Enhanced lighting for PBR
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Adaptive settings
    const _isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    // Key light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(150, 300, 150);
    keyLight.castShadow = true;
    // PERFORMANCE: Drastically reduce shadow map size
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

    // PERFORMANCE: STATIC SHADOW MAPS
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    // Performance stats
    const stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '10px';
    stats.dom.style.left = '10px';
    container.appendChild(stats.dom);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.5);
    fillLight.position.set(-100, 150, -100);
    scene.add(fillLight);

    // Rim light (back light for edge definition)
    const rimLight = new THREE.DirectionalLight(0xffcc88, 0.4);
    rimLight.position.set(0, 50, -200);
    scene.add(rimLight);

    // ENERGIZED GLASS TABLE (Simplified to prevent feedback loops)
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x001122,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.6,
      emissive: 0x002244,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 2.0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Helper - Adds technical "blueprint" look to the glass
    const gridHelper = new THREE.GridHelper(2000, 100, 0x0088ff, 0x002244);
    gridHelper.position.y = 2.01;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // Component and wire groups
    const componentsGroup = new THREE.Group();
    const wiresGroup = new THREE.Group();
    const telemetryGroup = new THREE.Group();
    scene.add(componentsGroup);
    scene.add(wiresGroup);
    scene.add(telemetryGroup);
    componentsGroupRef.current = componentsGroup;
    wiresGroupRef.current = wiresGroup;
    telemetryGroupRef.current = telemetryGroup;

    // Post-processing setup with optimized settings
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    // Render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Subtle bloom - Reduced complexity
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.2,
      0.1,
      0.9
    );
    composer.addPass(bloomPass);

    // FXAA as the final pass
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
    fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
    composer.addPass(fxaaPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // PERFORMANCE: ON-DEMAND RENDERING WITH THROTTLING
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

      // Update LOD levels
      if (componentsGroupRef.current) {
        componentsGroupRef.current.traverse((child) => {
          if (child instanceof THREE.LOD) {
            child.update(camera);
          }
        });
      }

      composer.render();
    };

    // Render on interaction
    controls.addEventListener('change', requestRender);

    // Initial render burst
    requestRender();
    setTimeout(requestRender, 100);
    setTimeout(requestRender, 500);

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer || !composer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      composer.setSize(newWidth, newHeight);

      const pixelRatio = renderer.getPixelRatio();
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (newWidth * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (newHeight * pixelRatio);

      requestRender();
    };
    window.addEventListener('resize', handleResize);

    // Expose requestRender to effect below
    (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender = requestRender;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      disposeControls();
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
  }, [createCamera, setupControls, disposeControls]);

  // Update components and wires when diagram changes
  useEffect(() => {
    if (!diagram || !componentsGroupRef.current || !wiresGroupRef.current || !sceneRef.current) return;

    const componentsGroup = componentsGroupRef.current;
    const wiresGroup = wiresGroupRef.current;
    const scene = sceneRef.current;
    const requestRender = (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender;

    // Clear existing objects
    while (componentsGroup.children.length > 0) {
      const child = componentsGroup.children[0];
      disposeObject(child);
      componentsGroup.remove(child);
    }
    while (wiresGroup.children.length > 0) {
      const child = wiresGroup.children[0];
      disposeObject(child);
      wiresGroup.remove(child);
    }

    // Scale factor (2D canvas coords to 3D)
    const scale = 0.5;
    const offsetX = -200;
    const offsetZ = -150;

    // Track missing models
    const missing: ElectronicComponent[] = [];

    // Create 3D components with LOD (Level of Detail)
    diagram.components.forEach((component) => {
      if (!component || !component.id) return;

      const pos = positions.get(component.id) || { x: 0, y: 0 };
      if (isNaN(pos.x) || isNaN(pos.y)) {
        console.warn(`Invalid position for component ${component.id}`, pos);
        return;
      }

      const shape = getComponentShape(component.type || 'other', component.name || 'Unknown');

      if (!shape || isNaN(shape.width) || isNaN(shape.height)) {
        console.warn(`Invalid shape dimensions for ${component.id}`);
        return;
      }

      const width = shape.width * scale;
      const depth = shape.height * scale;

      if (!component.threeCode && !component.threeDModelUrl) {
        missing.push(component);
      }

      const lodComponent = createLODComponent(component, width, depth);

      lodComponent.position.set(
        pos.x * scale + offsetX + width / 2,
        3,
        pos.y * scale + offsetZ + depth / 2
      );

      lodComponent.userData = { component };

      // Apply environment map to all materials in all LOD levels
      lodComponent.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.envMap = envMapRef.current;
          child.material.needsUpdate = true;
        }
      });

      // Add floating label
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText((component.name || 'Unknown').substring(0, 16), 256, 80);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const label = new THREE.Sprite(labelMaterial);
      label.position.set(0, 35, 0);
      label.scale.set(60, 15, 1);
      lodComponent.add(label);

      componentsGroup.add(lodComponent);
    });

    setMissingModels(missing);

    // Create 3D wires with PBR materials
    diagram.connections.forEach((connection) => {
      if (!connection.fromComponentId || !connection.toComponentId) return;

      const fromComponent = diagram.components.find((c) => c.id === connection.fromComponentId);
      const toComponent = diagram.components.find((c) => c.id === connection.toComponentId);

      if (!fromComponent || !toComponent) return;

      const fromPos = positions.get(fromComponent.id) || { x: 0, y: 0 };
      const toPos = positions.get(toComponent.id) || { x: 0, y: 0 };

      if (isNaN(fromPos.x) || isNaN(fromPos.y) || isNaN(toPos.x) || isNaN(toPos.y)) return;

      const fromShape = getComponentShape(fromComponent.type || 'other', fromComponent.name || 'Unknown');
      const toShape = getComponentShape(toComponent.type || 'other', toComponent.name || 'Unknown');

      const fromWidth = fromShape.width * scale;
      const fromDepth = fromShape.height * scale;
      const toWidth = toShape.width * scale;
      const toDepth = toShape.height * scale;

      const fromPinOffset = getPinCoordinates(
        fromComponent.type || 'other',
        fromComponent.name || 'Unknown',
        connection.fromPin || '',
        fromWidth,
        fromDepth
      );
      const toPinOffset = getPinCoordinates(
        toComponent.type || 'other',
        toComponent.name || 'Unknown',
        connection.toPin || '',
        toWidth,
        toDepth
      );

      if (isNaN(fromPinOffset.x) || isNaN(fromPinOffset.z) || isNaN(toPinOffset.x) || isNaN(toPinOffset.z)) {
          console.warn("Invalid pin coordinates", connection);
          return;
      }

      const startX = (fromPos.x * scale + offsetX + fromWidth / 2) + fromPinOffset.x;
      const startY = 3 + fromPinOffset.y;
      const startZ = (fromPos.y * scale + offsetZ + fromDepth / 2) + fromPinOffset.z;

      const endX = (toPos.x * scale + offsetX + toWidth / 2) + toPinOffset.x;
      const endY = 3 + toPinOffset.y;
      const endZ = (toPos.y * scale + offsetZ + toDepth / 2) + toPinOffset.z;

      const wireHeight = Math.max(startY, endY) + 10 + Math.random() * 15;
      const midX = (startX + endX) / 2;
      const midZ = (startZ + endZ) / 2;

      const horizontalOffset = (Math.random() - 0.5) * 30;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(startX, startY + 10, startZ),
        new THREE.Vector3(startX + horizontalOffset * 0.3, wireHeight, startZ + (midZ - startZ) * 0.3),
        new THREE.Vector3(midX + horizontalOffset, wireHeight + 5, midZ),
        new THREE.Vector3(endX - horizontalOffset * 0.3, wireHeight, endZ - (endZ - midZ) * 0.3),
        new THREE.Vector3(endX, endY + 10, endZ),
        new THREE.Vector3(endX, endY, endZ),
      ]);

      const tubeGeometry = new THREE.TubeGeometry(curve, 32, 1.5, 8, false);
      const wireMaterial = createWireMaterial(getWireColor(connection.fromPin || ''));
      wireMaterial.envMap = envMapRef.current;

      const wireMesh = new THREE.Mesh(tubeGeometry, wireMaterial);
      wireMesh.castShadow = true;
      wireMesh.receiveShadow = true;
      wiresGroup.add(wireMesh);

      const connectorGeo = new THREE.CylinderGeometry(2, 2, 4, 8);
      const connectorMat = createPlasticMaterial(0x111111);

      const startConnector = new THREE.Mesh(connectorGeo, connectorMat);
      startConnector.position.set(startX, startY, startZ);
      startConnector.castShadow = true;
      wiresGroup.add(startConnector);

      const endConnector = new THREE.Mesh(connectorGeo, connectorMat);
      endConnector.position.set(endX, endY, endZ);
      endConnector.castShadow = true;
      wiresGroup.add(endConnector);
    });

    // Center camera on components (via hook)
    if (diagram.components.length > 0) {
      const box = new THREE.Box3().setFromObject(componentsGroup);
      centerOnBoundingBox(box, 20);
    }

    // Trigger update
    if (rendererRef.current) {
        rendererRef.current.shadowMap.needsUpdate = true;
    }
    if (requestRender) requestRender();

  }, [diagram, positions, centerOnBoundingBox]);

  // Update telemetry sprites when liveData changes
  useEffect(() => {
    if (!telemetryGroupRef.current || !diagram || !sceneRef.current) return;
    const group = telemetryGroupRef.current;
    const scene = sceneRef.current;
    const requestRender = (scene as THREE.Scene & { userData: { requestRender: () => void } }).userData.requestRender;

    // Clear existing sprites
    while (group.children.length > 0) {
      const child = group.children[0];
      disposeObject(child);
      group.remove(child);
    }

    const scale = 0.5;
    const offsetX = -200;
    const offsetZ = -150;

    Object.entries(liveData).forEach(([key, packet]) => {
      const [componentId, pin] = key.split(':');

      const component = diagram.components.find(c => c.id === componentId);
      if (!component) return;

      const pos = positions.get(component.id) || { x: 0, y: 0 };
      const shape = getComponentShape(component.type || 'other', component.name || 'Unknown');

      const width = shape.width * scale;
      const depth = shape.height * scale;

      const pinOffset = getPinCoordinates(
        component.type || 'other',
        component.name || 'Unknown',
        pin === 'default' ? '' : pin,
        width,
        depth
      );

      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = packet.value === 'HIGH' || packet.value === '1' ? '#00ff9d' : '#00f3ff';
        ctx.beginPath();
        ctx.roundRect(0, 0, 128, 64, 12);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(packet.value), 64, 32);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      });
      const sprite = new THREE.Sprite(spriteMaterial);

      sprite.position.set(
        pos.x * scale + offsetX + width / 2 + pinOffset.x,
        3 + pinOffset.y + 15,
        pos.y * scale + offsetZ + depth / 2 + pinOffset.z
      );

      sprite.scale.set(24, 12, 1);
      group.add(sprite);
    });

    if (requestRender) requestRender();
  }, [liveData, diagram, positions]);

  // Handle generation click
  const handleGenerateClick = async (component: ElectronicComponent) => {
    if (onGenerate3D) {
      await onGenerate3D(component);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      {/* Neural Link Toggle */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <IconButton
          label={neuralLinkEnabled ? "DISABLE NEURAL-LINK" : "ENABLE NEURAL-LINK"}
          icon={
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {neuralLinkEnabled && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-cyan rounded-full animate-ping" />
              )}
            </div>
          }
          variant={neuralLinkEnabled ? "primary" : "secondary"}
          onClick={() => setNeuralLinkEnabled(!neuralLinkEnabled)}
          className={neuralLinkEnabled ? "shadow-[0_0_15px_rgba(0,243,255,0.4)]" : ""}
        />
      </div>

      {/* Missing Models Overlay */}
      {missingModels.length > 0 && onGenerate3D && (
        <div className="absolute top-4 right-4 z-10 bg-slate-950/90 border border-neon-purple/50 rounded-lg p-3 max-w-sm shadow-xl backdrop-blur-sm animate-fade-in">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <h4 className="text-xs font-bold text-neon-purple font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"/>
              Missing 3D Models
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{missingModels.length} ITEMS</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {missingModels.map(comp => (
              <div key={comp.id} className="flex items-center justify-between gap-3 text-[10px]">
                <span className="text-slate-300 truncate max-w-[120px]" title={comp.name}>{comp.name}</span>
                <button
                  onClick={() => handleGenerateClick(comp)}
                  className="px-2 py-1 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple hover:text-black transition-colors rounded uppercase font-bold tracking-wider shrink-0"
                >
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const Diagram3DView = memo(Diagram3DViewComponent);

export default Diagram3DView;
