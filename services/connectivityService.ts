type ConnectivityListener = (isOnline: boolean) => void;

class ConnectivityService {
  private listeners: Set<ConnectivityListener> = new Set();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => this.handleStatusChange(true));
    window.addEventListener('offline', () => this.handleStatusChange(false));
  }

  private handleStatusChange(status: boolean) {
    this.isOnline = status;
    this.listeners.forEach(l => l(status));
  }

  onStatusChange(listener: ConnectivityListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Performs an actual network request to verify if the Gemini API is reachable.
   * Useful when ICMP (ping) is blocked by firewalls but HTTPS is allowed.
   */
  async checkApiReachability(): Promise<boolean> {
    try {
      // Use a HEAD request to minimize data usage
      const response = await fetch('https://generativelanguage.googleapis.com/', {
        method: 'HEAD',
        mode: 'no-cors' // We just need to know if the server is there
      });
      return true; // If we get here, the server responded (even if it's a 404/403)
    } catch (e) {
      console.warn('API Reachability check failed:', e);
      return false;
    }
  }
}

export const connectivityService = new ConnectivityService();
