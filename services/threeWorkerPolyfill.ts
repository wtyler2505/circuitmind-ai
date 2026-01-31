// DOM Polyfill for Three.js in Worker
if (typeof self !== 'undefined') {
  if (!('document' in self)) {
    (self as unknown as Record<string, unknown>).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') {
          try {
            return new OffscreenCanvas(256, 256);
          } catch (_e) {
            return {
              getContext: () => null,
              width: 256,
              height: 256,
              style: {},
              convertToBlob: () => Promise.resolve(new Blob()),
            };
          }
        }
        return {
          getContext: () => null,
          style: {},
          convertToBlob: () => Promise.resolve(new Blob()),
        };
      },
      body: {
        appendChild: () => {},
        removeChild: () => {},
      },
    };
  }

  if (!('window' in self)) {
    (self as unknown as Record<string, unknown>).window = self;
  }
}

export {};
