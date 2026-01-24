export interface APIToken {
  id: string;
  name: string;
  secret: string;
  role: 'admin' | 'engineer';
  createdAt: number;
}

const TOKEN_STORAGE_KEY = 'cm_api_tokens';

class TokenService {
  private tokens: APIToken[] = [];

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    try {
      const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (saved) this.tokens = JSON.parse(saved);
    } catch {
      this.tokens = [];
    }
  }

  private saveTokens() {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(this.tokens));
  }

  generateToken(name: string, role: APIToken['role']): APIToken {
    const token: APIToken = {
      id: crypto.randomUUID(),
      name,
      secret: `cm_${Math.random().toString(36).substr(2, 16)}`,
      role,
      createdAt: Date.now()
    };
    this.tokens.push(token);
    this.saveTokens();
    return token;
  }

  validateToken(secret: string): APIToken | null {
    return this.tokens.find(t => t.secret === secret) || null;
  }

  getTokens(): APIToken[] {
    return this.tokens;
  }

  revokeToken(id: string) {
    this.tokens = this.tokens.filter(t => t.id !== id);
    this.saveTokens();
  }
}

export const tokenService = new TokenService();
