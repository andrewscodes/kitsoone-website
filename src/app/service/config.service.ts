import { Injectable } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  cognito: {
    region: string;
    userPoolId: string;
    userPoolClientId: string;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  apiUrl: '',
  cognito: {
    region: 'us-east-2',
    userPoolId: '',
    userPoolClientId: '',
  },
};

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: AppConfig = DEFAULT_CONFIG;

  public get appConfig(): AppConfig {
    return this.config;
  }

  public async load(): Promise<void> {
    try {
      const response = await fetch('/assets/config/app.config.json');
      this.config = await response.json();
    } catch {
      // During SSR/prerender, fetch may fail — use default config
      this.config = DEFAULT_CONFIG;
    }
  }
}
