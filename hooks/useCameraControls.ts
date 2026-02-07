/**
 * useCameraControls Hook
 *
 * Manages Three.js PerspectiveCamera and OrbitControls lifecycle.
 * Extracted from Diagram3DView.tsx to reduce component complexity.
 *
 * Features:
 * - Camera initialization with configurable FOV, near/far planes, and position
 * - OrbitControls setup with damping, distance limits, and polar angle constraints
 * - Camera centering on bounding box (for focusing on scene content)
 * - Aspect ratio updates for resize handling
 * - Proper cleanup/disposal of controls
 */

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface CameraControlsConfig {
  /** Camera field of view in degrees (default: 50) */
  fov?: number;
  /** Camera near clipping plane (default: 0.1) */
  near?: number;
  /** Camera far clipping plane (default: 2000) */
  far?: number;
  /** Initial camera position [x, y, z] (default: [0, 250, 350]) */
  initialPosition?: [number, number, number];
  /** Initial OrbitControls target [x, y, z] (default: [0, 20, 0]) */
  initialTarget?: [number, number, number];
  /** Enable damping for smooth controls (default: true) */
  enableDamping?: boolean;
  /** Damping factor when damping is enabled (default: 0.05) */
  dampingFactor?: number;
  /** Minimum zoom distance (default: 50) */
  minDistance?: number;
  /** Maximum zoom distance (default: 800) */
  maxDistance?: number;
  /** Maximum polar angle in radians (default: Math.PI * 0.48) */
  maxPolarAngle?: number;
}

const DEFAULT_CONFIG: Required<CameraControlsConfig> = {
  fov: 50,
  near: 0.1,
  far: 2000,
  initialPosition: [0, 250, 350],
  initialTarget: [0, 20, 0],
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 50,
  maxDistance: 800,
  maxPolarAngle: Math.PI * 0.48,
};

export interface UseCameraControlsReturn {
  /** Ref to the PerspectiveCamera instance */
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  /** Ref to the OrbitControls instance */
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  /** Create and initialize a PerspectiveCamera */
  createCamera: (width: number, height: number) => THREE.PerspectiveCamera;
  /** Create and configure OrbitControls for the camera */
  setupControls: (domElement: HTMLElement) => OrbitControls;
  /** Center the controls target on a bounding box */
  centerOnBoundingBox: (box: THREE.Box3, yOverride?: number) => void;
  /** Update camera aspect ratio (call on resize) */
  updateAspect: (width: number, height: number) => void;
  /** Dispose of controls and clear refs */
  dispose: () => void;
}

/**
 * Hook for managing Three.js camera and OrbitControls.
 *
 * Usage:
 * ```tsx
 * const { cameraRef, controlsRef, createCamera, setupControls, centerOnBoundingBox, updateAspect, dispose } = useCameraControls();
 *
 * // In initialization effect:
 * const camera = createCamera(width, height);
 * const controls = setupControls(renderer.domElement);
 * controls.addEventListener('change', requestRender);
 *
 * // In resize handler:
 * updateAspect(newWidth, newHeight);
 *
 * // When focusing on content:
 * const box = new THREE.Box3().setFromObject(group);
 * centerOnBoundingBox(box, 20);
 *
 * // In cleanup:
 * controls.removeEventListener('change', requestRender);
 * dispose();
 * ```
 */
export function useCameraControls(config?: CameraControlsConfig): UseCameraControlsReturn {
  const configRef = useRef(config);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const createCamera = useCallback((width: number, height: number): THREE.PerspectiveCamera => {
    const cfg = { ...DEFAULT_CONFIG, ...configRef.current };
    const camera = new THREE.PerspectiveCamera(cfg.fov, width / height, cfg.near, cfg.far);
    camera.position.set(...cfg.initialPosition);
    cameraRef.current = camera;
    return camera;
  }, []);

  const setupControls = useCallback((domElement: HTMLElement): OrbitControls => {
    if (!cameraRef.current) {
      throw new Error('useCameraControls: Camera must be created before controls. Call createCamera() first.');
    }
    const cfg = { ...DEFAULT_CONFIG, ...configRef.current };

    const controls = new OrbitControls(cameraRef.current, domElement);
    controls.enableDamping = cfg.enableDamping;
    controls.dampingFactor = cfg.dampingFactor;
    controls.minDistance = cfg.minDistance;
    controls.maxDistance = cfg.maxDistance;
    controls.maxPolarAngle = cfg.maxPolarAngle;
    controls.target.set(...cfg.initialTarget);
    controlsRef.current = controls;
    return controls;
  }, []);

  const centerOnBoundingBox = useCallback((box: THREE.Box3, yOverride?: number): void => {
    if (!controlsRef.current || box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    controlsRef.current.target.copy(center);
    if (yOverride !== undefined) {
      controlsRef.current.target.y = yOverride;
    }
  }, []);

  const updateAspect = useCallback((width: number, height: number): void => {
    if (!cameraRef.current) return;
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
  }, []);

  const dispose = useCallback((): void => {
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }
    cameraRef.current = null;
  }, []);

  return {
    cameraRef,
    controlsRef,
    createCamera,
    setupControls,
    centerOnBoundingBox,
    updateAspect,
    dispose,
  };
}

export default useCameraControls;
