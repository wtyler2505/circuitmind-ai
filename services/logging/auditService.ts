export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AuditLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
  data?: unknown;
}

const STORAGE_KEY = 'cm_audit_logs';

class AuditService {
  private logs: AuditLog[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) this.logs = JSON.parse(saved) as AuditLog[];
    } catch {
      this.logs = [];
    }
  }

  private saveLogs() {
    // Keep last 1000 logs (Rotation)
    const rotated = this.logs.slice(-1000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rotated));
  }

  log(level: LogLevel, source: string, message: string, data?: unknown) {
    const logEntry: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level,
      source,
      message: this.maskSecrets(message),
      data: data ? JSON.parse(this.maskSecrets(JSON.stringify(data))) : undefined
    };

    this.logs.push(logEntry);
    this.saveLogs();
    
    if (level === 'error') console.error(`[${source}] ${message}`, data);
    else console.debug(`[${source}] ${message}`);
  }

  private maskSecrets(str: string): string {
    return str.replace(/cm_[a-z0-9]{16}/gi, '********')
              .replace(/AIza[0-9A-Za-z-_]{35}/g, '********');
  }

  getLogs(): AuditLog[] {
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.saveLogs();
  }
}

export const auditService = new AuditService();
