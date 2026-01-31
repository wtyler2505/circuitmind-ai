import yaml from 'js-yaml';

export interface WorkspaceConfig {
  version: string;
  metadata: {
    name: string;
    environment: 'home' | 'work' | 'lab';
  };
  ui: Record<string, unknown>;
  ai: Record<string, unknown>;
  standards: Record<string, unknown>;
}

class ConfigManager {
  /**
   * Serializes current app state to YAML string.
   */
  serialize(data: unknown): string {
    const scrubbed = this.scrubSecrets(data);
    return yaml.dump(scrubbed);
  }

  /**
   * Parses and validates a configuration string.
   */
  deserialize(content: string): WorkspaceConfig | null {
    try {
      const parsed = yaml.load(content) as unknown;
      if (this.validate(parsed)) return parsed;
      return null;
    } catch (e) {
      console.error('Failed to parse config', e);
      return null;
    }
  }

  private scrubSecrets(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;
    
    const copy = JSON.parse(JSON.stringify(data)) as Record<string, any>;
    // Implementation to remove API keys, PINs etc.
    if (copy.ai && typeof copy.ai === 'object' && copy.ai.apiKey) {
      copy.ai.apiKey = '********';
    }
    return copy;
  }

  private validate(config: unknown): config is WorkspaceConfig {
    if (!config || typeof config !== 'object') return false;
    const c = config as Record<string, unknown>;
    return typeof c.version === 'string';
  }
}

export const configManager = new ConfigManager();
