import { describe, it, expect, vi } from 'vitest';
import { FzpzLoader } from '../fzpzLoader';
import JSZip from 'jszip';

// Mock DOMParser for Node environment
class MockDOMParser {
  parseFromString(str: string) {
    return {
      querySelector: () => ({
        getAttribute: (name: string) => {
          if (name === 'width') return '1in';
          if (name === 'height') return '1in';
          if (name === 'viewBox') return '0 0 1000 1000';
          return null;
        }
      }),
      getElementById: (id: string) => ({
        tagName: 'circle',
        getAttribute: (name: string) => {
          if (name === 'cx') return '500';
          if (name === 'cy') return '500';
          return null;
        }
      })
    };
  }
}

vi.stubGlobal('DOMParser', MockDOMParser);

describe('FzpzLoader', () => {
  it('should parse unit "in" correctly', async () => {
    // This is hard to test without a real zip, but we can test the private extractFootprint logic
    // if we make it public or test through the main load method with a mocked zip.
    
    // For now, let's verify the logic we improved in Task 2.1
    // 1in should be 10 units
    const loader = FzpzLoader as any;
    const footprint = loader.extractFootprint({
        module: {
            connectors: {
                connector: {
                    _attributes: { id: 'connector0' },
                    views: { breadboardView: { p: { _attributes: { svgId: 'pin0' } } } }
                }
            }
        }
    }, '<svg width="1in" height="1in" viewBox="0 0 1000 1000"><circle id="pin0" cx="500" cy="500" r="10"/></svg>');

    expect(footprint.width).toBe(10);
    expect(footprint.pins[0].x).toBe(5); // (500 / 1000) * 10
  });

  it('should parse unit "mm" correctly', () => {
    const loader = FzpzLoader as any;
    const footprint = loader.extractFootprint({
        module: { connectors: { connector: [] } }
    }, '<svg width="25.4mm" height="25.4mm" viewBox="0 0 100 100"></svg>');

    expect(footprint.width).toBeCloseTo(10, 1);
  });

  it('should parse unit "mil" correctly', () => {
    const loader = FzpzLoader as any;
    const footprint = loader.extractFootprint({
        module: { connectors: { connector: [] } }
    }, '<svg width="1000mil" height="1000mil" viewBox="0 0 100 100"></svg>');

    expect(footprint.width).toBe(10);
  });

  it('should derive internal buses for breadboard-style connector names', () => {
    const loader = FzpzLoader as any;
    const buses = loader.deriveInternalBuses('Breadboard Large', [
      'pin_0_0',
      'pin_0_1',
      'pin_0_2',
      'pin_0_5',
      'pin_0_6',
      'vcc_top_0',
      'vcc_top_1',
      'gnd_top_0',
      'gnd_top_1',
    ]) as string[][];

    expect(buses.some((group) => group.includes('pin_0_0') && group.includes('pin_0_2'))).toBe(true);
    expect(buses.some((group) => group.includes('pin_0_5') && group.includes('pin_0_6'))).toBe(true);
    expect(buses.some((group) => group.includes('vcc_top_0') && group.includes('vcc_top_1'))).toBe(true);
    expect(buses.some((group) => group.includes('gnd_top_0') && group.includes('gnd_top_1'))).toBe(true);
  });
});
