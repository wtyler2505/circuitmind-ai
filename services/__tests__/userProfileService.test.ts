import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userProfileService } from '../userProfileService';

// Mock IndexedDB more functionally for this test
const mockStore = new Map<string, any>();

const mockTransaction = {
  objectStore: () => ({
    put: (val: any) => {
      mockStore.set(val.id, val);
      const req = { onsuccess: null as any, onerror: null as any };
      setTimeout(() => req.onsuccess && req.onsuccess({ target: { result: val.id } }), 0);
      return req;
    },
    get: (id: string) => {
      const val = mockStore.get(id);
      const req = { onsuccess: null as any, onerror: null as any, result: val };
      setTimeout(() => req.onsuccess && req.onsuccess({ target: { result: val } }), 0);
      return req;
    },
    getAll: () => {
      const vals = Array.from(mockStore.values());
      const req = { onsuccess: null as any, onerror: null as any, result: vals };
      setTimeout(() => req.onsuccess && req.onsuccess({ target: { result: vals } }), 0);
      return req;
    }
  })
};

const mockDB = {
  transaction: () => mockTransaction,
  objectStoreNames: {
    contains: () => true // Assume store exists for simplicity after open
  },
  createObjectStore: vi.fn()
};

const mockOpen = {
  result: mockDB,
  onupgradeneeded: null as any,
  onsuccess: null as any,
  onerror: null as any,
  error: null
};

// Override global indexedDB for this test file
global.indexedDB = {
  open: () => {
    setTimeout(() => {
       if (mockOpen.onupgradeneeded) mockOpen.onupgradeneeded({ target: { result: mockDB } });
       if (mockOpen.onsuccess) mockOpen.onsuccess({ target: { result: mockDB } });
    }, 0);
    return mockOpen as any;
  }
} as any;

describe('UserProfileService', () => {
  beforeEach(() => {
    mockStore.clear();
    localStorage.clear();
    vi.clearAllMocks();
    // Reset private dbPromise if possible, but it's private. 
    // Since we mock the global IDB, the service will call open() and get our mock.
  });

  it('should create a new profile with defaults', async () => {
    const profile = await userProfileService.createProfile('Test User', 'pro');
    
    expect(profile.name).toBe('Test User');
    expect(profile.expertise).toBe('pro');
    expect(profile.id).toBeDefined();
    expect(mockStore.has(profile.id)).toBe(true);
  });

  it('should get a saved profile', async () => {
    const created = await userProfileService.createProfile('Saved User');
    const retrieved = await userProfileService.getProfile(created.id);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Saved User');
  });

  it('should manage active profile in localStorage', async () => {
    const p1 = await userProfileService.createProfile('User 1');
    userProfileService.switchProfile(p1.id);
    
    expect(localStorage.getItem('cm_active_profile_id')).toBe(p1.id);
    expect(userProfileService.getActiveProfileId()).toBe(p1.id);
  });

  it('should getActiveProfile returns newly created default if none exists', async () => {
    const active = await userProfileService.getActiveProfile();
    expect(active.name).toBe('Default User');
    expect(active.expertise).toBe('intermediate');
    expect(localStorage.getItem('cm_active_profile_id')).toBe(active.id);
  });

  it('should update preferences', async () => {
    const p = await userProfileService.createProfile('Pref User');
    const updated = await userProfileService.updatePreferences(p.id, { theme: 'industrial' });
    
    expect(updated.preferences.theme).toBe('industrial');
    // Verify in DB
    const inDb = await userProfileService.getProfile(p.id);
    expect(inDb?.preferences.theme).toBe('industrial');
  });
});
