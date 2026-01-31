type AppEvent = 'save' | 'simulation_pass' | 'low_stock' | 'action_execute';

class AppEventEmitter {
  private listeners: Map<AppEvent, ((data: unknown) => void)[]> = new Map();

  on(event: AppEvent, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: AppEvent, data: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
    
    // Also trigger local webhooks
    this.triggerWebhooks(event, data);
  }

  private async triggerWebhooks(event: AppEvent, data: unknown) {
    const saved = localStorage.getItem('cm_webhooks');
    const webhooks: { url: string, events: AppEvent[] }[] = saved ? JSON.parse(saved) : [];
    
    webhooks.filter(w => w.events.includes(event)).forEach(w => {
      fetch(w.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data, timestamp: Date.now() })
      }).catch(() => {}); // Fire and forget
    });
  }
}

export const appEvents = new AppEventEmitter();
