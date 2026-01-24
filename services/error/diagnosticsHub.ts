import { auditService } from '../logging/auditService';

export interface CaughtError {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  source: string;
  recovered: boolean;
}

class DiagnosticsHub {
  private initialized = false;

  init() {
    if (this.initialized) return;

    window.onerror = (message, source, lineno, colno, error) => {
      this.reportError({
        message: String(message),
        source: `${source}:${lineno}:${colno}`,
        stack: error?.stack,
        recovered: false
      });
    };

    window.onunhandledrejection = (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        source: 'promise',
        stack: event.reason?.stack,
        recovered: false
      });
    };

    this.initialized = true;
    console.log('Diagnostics Hub initialized');
  }

  reportError(error: Omit<CaughtError, 'id' | 'timestamp'>) {
    const fullError: CaughtError = {
      ...error,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    // Log to Black Box
    auditService.log('error', 'diagnostics', error.message, {
      stack: this.sanitizeStack(error.stack || ''),
      source: error.source
    });

    // In a real app, we might sync this to a server if user opted-in
    return fullError.id;
  }

  private sanitizeStack(stack: string): string {
    // Remove local file paths for privacy
    return stack.replace(/\/home\/[^/]+\//g, '~/');
  }

  generateBugReport() {
    return {
      version: '1.0.0', // Should come from package.json
      userAgent: navigator.userAgent,
      logs: auditService.getLogs().slice(-50), // Last 50 logs
      timestamp: Date.now()
    };
  }
}

export const diagnosticsHub = new DiagnosticsHub();
