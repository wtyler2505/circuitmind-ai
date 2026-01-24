export type UserRole = 'admin' | 'engineer' | 'observer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: number;
}

const PIN_STORAGE_KEY = 'cm_auth_hash';
const SALT_STORAGE_KEY = 'cm_auth_salt';

class AuthService {
  private currentSession: Session | null = null;

  /**
   * Hashes a PIN using PBKDF2.
   */
  async hashPin(pin: string, salt: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();
    const pinData = encoder.encode(pin);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      pinData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  }

  /**
   * Initializes the master PIN (Owner Setup).
   */
  async setupMasterPin(pin: string): Promise<void> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await this.hashPin(pin, salt);
    
    localStorage.setItem(PIN_STORAGE_KEY, hash);
    localStorage.setItem(SALT_STORAGE_KEY, btoa(String.fromCharCode(...salt)));
  }

  /**
   * Validates a PIN against stored hash.
   */
  async validatePin(pin: string): Promise<User | null> {
    const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
    const storedSaltBase64 = localStorage.getItem(SALT_STORAGE_KEY);

    if (!storedHash || !storedSaltBase64) return null;

    const salt = new Uint8Array(
      atob(storedSaltBase64)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const hash = await this.hashPin(pin, salt);

    if (hash === storedHash) {
      // In this local-only version, we treat valid PIN as Admin
      const user: User = { id: 'owner', name: 'Owner', role: 'admin' };
      this.createSession(user);
      return user;
    }

    return null;
  }

  private createSession(user: User) {
    this.currentSession = {
      token: crypto.randomUUID(),
      user,
      expiresAt: Date.now() + 3600000 // 1 hour
    };
  }

  getSession(): Session | null {
    if (this.currentSession && this.currentSession.expiresAt > Date.now()) {
      return this.currentSession;
    }
    return null;
  }

  logout() {
    this.currentSession = null;
  }

  isSetup(): boolean {
    return !!localStorage.getItem(PIN_STORAGE_KEY);
  }
}

export const authService = new AuthService();
