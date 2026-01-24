import yaml from 'js-yaml';

export interface WorkspaceConfig {
  version: string;
  metadata: {
    name: string;
    environment: 'home' | 'work' | 'lab';
  };
  ui: any;
  ai: any;
  standards: any;
}

class ConfigManager {
  /**
   * Serializes current app state to YAML string.
   */
  serialize(data: any): string {
    const scrubbed = this.scrubSecrets(data);
    return yaml.dump(scrubbed);
  }

  /**
   * Parses and validates a configuration string.
   */
  deserialize(content: string): WorkspaceConfig | null {
    try {
      const parsed = yaml.load(content) as any;
      if (this.validate(parsed)) return parsed;
      return null;
    } catch (e) {
      console.error('Failed to parse config', e);
      return null;
    }
  }

  private scrubSecrets(data: any): any {
    const copy = JSON.parse(JSON.stringify(data));
    // Implementation to remove API keys, PINs etc.
    if (copy.ai?.apiKey) copy.ai.apiKey = '********';
    return copy;
  }

  private validate(config: any): config is WorkspaceConfig {
    return !!config && typeof config.version === 'string';
  }
}

export const configManager = new ConfigManager();
