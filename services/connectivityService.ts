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
    return () => this.listeners.delete(listener);
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }
}

export const connectivityService = new ConnectivityService();
