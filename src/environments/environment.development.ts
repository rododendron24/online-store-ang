// Конфигурация для разработки
// Используется при запуске: ng serve

export const environment = {
  production: false,
  api: 'http://localhost:3000/api/',
  appName: 'My Angular App - Dev',
  version: '1.0.0-dev',

  // Специфичные для разработки настройки
  debugMode: true,
  logLevel: 'debug',

  featureFlags: {
    enableDebug: true,
    enableExperimentalFeatures: true,
    enableMockData: true
  },

  // Ссылки для разработки
  externalLinks: {
    docs: 'http://localhost:8080/docs',
    analytics: 'http://localhost:8081'
  }
};
