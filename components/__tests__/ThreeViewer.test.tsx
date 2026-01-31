import { render, screen } from '../../tests/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ThreeViewer from '../ThreeViewer';

vi.mock('three', () => {
  class Object3D {
    position = { sub: vi.fn(), y: 0, set: vi.fn() };
    scale = { setScalar: vi.fn(), x: 1, y: 1 };
    rotation = { x: 0, y: 0, z: 0 };
    traverse = vi.fn();
    add = vi.fn();
    remove = vi.fn();
  }
  class Scene extends Object3D {
    background = null;
    fog = null;
    clear = vi.fn();
  }
  class Color {
    constructor() {}
    set() {}
  }
  class Fog {
    constructor() {}
  }
  class PerspectiveCamera extends Object3D {
    aspect = 1;
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
    getSize() { return { width: 0, height: 0 }; }
  }
  class AmbientLight extends Object3D {
    intensity = 0;
    color = { set: vi.fn() };
    constructor() { super(); }
  }
  class DirectionalLight extends Object3D {
    intensity = 0;
    color = { set: vi.fn() };
    shadow = { mapSize: { width: 0, height: 0 }, camera: { near: 0, far: 0 } };
    constructor() { super(); }
  }
  class PointLight extends Object3D {
    constructor() { super(); }
  }
  class GridHelper extends Object3D {
    constructor() { super(); }
  }
  class Box3 {
    setFromObject() {
      return this;
    }
    isEmpty() {
      return true;
    }
    getSize() { return new Vector3(); }
    getCenter() { return new Vector3(); }
  }
  class Vector3 {
    x = 0;
    y = 0;
    z = 0;
    multiplyScalar() {
      return this;
    }
    sub() { return this; }
    set() { return this; }
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
  class Mesh extends Object3D {
    geometry = new BoxGeometry();
    material = new MeshStandardMaterial();
    constructor() { super(); }
  }
  class CanvasTexture {
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
    CanvasTexture,
    RepeatWrapping: 1000,
    ACESFilmicToneMapping: 4,
    PCFSoftShadowMap: 1,
    DoubleSide: 2,
    AdditiveBlending: 2,
    PMREMGenerator: class {
      constructor() {}
      compileEquirectangularShader() {}
      fromScene() { return { texture: { dispose: vi.fn() }, dispose: vi.fn() }; }
      dispose() {}
    },
    RectAreaLight: class {
      constructor() {}
      position = { set: vi.fn() };
      lookAt = vi.fn();
    },
    PlaneGeometry: class {
      constructor() {}
      dispose() {}
    },
    Clock: class {
      getElapsedTime() { return 0; }
    },
    ObjectLoader: class {
      parse() { return new Object3D(); }
    },
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
