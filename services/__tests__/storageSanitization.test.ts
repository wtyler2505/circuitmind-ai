import { describe, it, expect } from 'vitest';
// We need to export sanitizeForDB or access it via recordAction
// Since it's internal to storage.ts, I'll temporarily export it or test it via recordAction.
// Let's check storage.ts again.
import { recordAction } from '../storage';

describe('storageService sanitization', () => {
  it('should handle circular references without throwing', async () => {
    const circular: any = { name: 'root' };
    circular.self = circular;

    const action = {
      id: 'test-id',
      timestamp: Date.now(),
      type: 'test' as any,
      payload: circular,
      undoable: true
    };

    // This should not throw TypeError: Converting circular structure to JSON
    await expect(recordAction(action)).resolves.not.toThrow();
  });

  it('should handle DOM-like objects or non-serializables', async () => {
    const action = {
      id: 'test-id-2',
      timestamp: Date.now(),
      type: 'test' as any,
      payload: {
        func: () => console.log('test'),
        event: new Event('click'),
        valid: true
      },
      undoable: true
    };

    await expect(recordAction(action)).resolves.not.toThrow();
  });
});
