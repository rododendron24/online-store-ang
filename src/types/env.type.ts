export interface Environment {
  production: boolean;
  api: string;
  serverStaticPath: string; // <-- Вот это мы добавляем

  // Остальные опциональные поля (если они могут быть не во всех env)
  appName?: string;
  version?: string;
  debugMode?: boolean;
  logLevel?: string;
  featureFlags: {
    enableDebug: boolean;
    enableExperimentalFeatures: boolean;
    enableMockData?: boolean;
  };
  externalLinks?: {
    docs?: string;
    analytics?: string;
  };
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
  };
}
