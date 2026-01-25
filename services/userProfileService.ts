// Removed uuid import

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'pro';
export type ThemePreference = 'cyber' | 'industrial' | 'minimal';
export type AITone = 'sass' | 'technical' | 'concise';

export interface UserProfile {
  id: string;
  name: string;
  expertise: ExpertiseLevel;
  preferences: {
    theme: ThemePreference;
    wiringColors: Record<string, string>; // e.g., { "VCC": "#ff0000" }
    aiTone: AITone;
  };
  stats: {
    projectsCreated: number;
    componentsMastered: string[];
  };
}

const DB_NAME = 'CircuitMindProfiles';
const DB_VERSION = 1;
const STORE_NAME = 'profiles';
const ACTIVE_PROFILE_KEY = 'cm_active_profile_id';

class UserProfileService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });

    return this.dbPromise;
  }

  async getProfile(id: string): Promise<UserProfile | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(profile);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async createProfile(name: string, expertise: ExpertiseLevel = 'intermediate'): Promise<UserProfile> {
    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      name,
      expertise,
      preferences: {
        theme: 'cyber',
        wiringColors: {
          'VCC': '#ff0000',
          'GND': '#000000',
          'SDA': '#00ff00',
          'SCL': '#ffff00'
        },
        aiTone: 'technical'
      },
      stats: {
        projectsCreated: 0,
        componentsMastered: []
      }
    };

    await this.saveProfile(newProfile);
    return newProfile;
  }

  getActiveProfileId(): string | null {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  }

  async getActiveProfile(): Promise<UserProfile> {
    const id = this.getActiveProfileId();
    if (id) {
      const profile = await this.getProfile(id);
      if (profile) return profile;
    }

    // Fallback: Check if any profiles exist, if so use first, else create default
    const all = await this.getAllProfiles();
    if (all.length > 0) {
      this.switchProfile(all[0].id);
      return all[0];
    }

    // Initialize Default
    const defaultProfile = await this.createProfile('Default User', 'intermediate');
    this.switchProfile(defaultProfile.id);
    return defaultProfile;
  }

  switchProfile(id: string): void {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    // Ideally, we'd trigger an event here, but we'll handle reactivity in the Context
  }

  async updatePreferences(id: string, updates: Partial<UserProfile['preferences']>): Promise<UserProfile> {
    const profile = await this.getProfile(id);
    if (!profile) throw new Error(`Profile ${id} not found`);

    profile.preferences = { ...profile.preferences, ...updates };
    await this.saveProfile(profile);
    return profile;
  }
}

export const userProfileService = new UserProfileService();