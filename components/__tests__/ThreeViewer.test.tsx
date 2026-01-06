import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ThreeViewer from '../ThreeViewer';

vi.mock('three', () => {
  class Object3D {
    position = { sub: vi.fn(), y: 0 };
    scale = { setScalar: vi.fn(), x: 1, y: 1 };
    traverse = vi.fn();
  }
  class Scene {
    background = null;
    fog = null;
    add = vi.fn();
    remove = vi.fn();
    traverse = vi.fn();
    clear = vi.fn();
  }
  class Color {
    constructor() {}
  }
  class Fog {
    constructor() {}
  }
  class PerspectiveCamera {
    aspect = 1;
    position = { set: vi.fn() };
    lookAt = vi.fn();
    updateProjectionMatrix = vi.fn();
  }
  class WebGLRenderer {
    domElement = document.createElement('canvas');
    shadowMap = { enabled: false };
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
    forceContextLoss = vi.fn();
  }
  class AmbientLight {
    intensity = 0;
    color = { set: vi.fn() };
    constructor() {}
  }
  class DirectionalLight {
    intensity = 0;
    color = { set: vi.fn() };
    position = { set: vi.fn() };
    shadow = { mapSize: { width: 0, height: 0 }, camera: { near: 0, far: 0 } };
    constructor() {}
  }
  class PointLight {
    position = { set: vi.fn() };
    constructor() {}
  }
  class GridHelper {
    constructor() {}
  }
  class Box3 {
    setFromObject() {
      return this;
    }
    isEmpty() {
      return true;
    }
  }
  class Vector3 {
    x = 0;
    y = 0;
    z = 0;
    multiplyScalar() {
      return this;
    }
  }
  class Material {
    dispose = vi.fn();
    constructor() {}
  }
  class MeshStandardMaterial extends Material {
    constructor() {
      super();
    }
  }
  class MeshBasicMaterial extends Material {
    constructor() {
      super();
    }
  }
  class BoxGeometry {
    dispose = vi.fn();
    constructor() {}
  }
  class Mesh {
    geometry = new BoxGeometry();
    material = new MeshStandardMaterial();
    constructor() {}
  }
  return {
    Object3D,
    Scene,
    Color,
    Fog,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    PointLight,
    GridHelper,
    Box3,
    Vector3,
    Material,
    MeshStandardMaterial,
    MeshBasicMaterial,
    BoxGeometry,
    Mesh,
  };
});

vi.mock('three/addons/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    enableDamping = false;
    dampingFactor = 0;
    autoRotate = false;
    autoRotateSpeed = 0;
    update = vi.fn();
    dispose = vi.fn();
  },
}));

vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    load = vi.fn();
  },
}));

describe('ThreeViewer', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      }
    );
    vi.stubGlobal('requestAnimationFrame', () => 0);
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders empty state when no 3d content is provided', () => {
    render(<ThreeViewer />);
    expect(screen.getByText('No 3D model yet.')).toBeInTheDocument();
    expect(screen.getByText(/Generate a model with AI/i)).toBeInTheDocument();
  });

  it('hides empty state when code is provided', () => {
    const code = 'const group = new THREE.Object3D();\nreturn group;';
    render(<ThreeViewer code={code} />);
    expect(screen.queryByText('No 3D model yet.')).not.toBeInTheDocument();
  });
});
