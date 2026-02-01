//import {Environment} from '../types/env.type';

export const environment: {
  production: boolean;
  api: string;
  serverStaticPath: string;
  featureFlags: {
    enableDebug: boolean;
    enableExperimentalFeatures: boolean;
  };
} = {
  production: false,
  api: 'http://localhost:3000/api/',
  serverStaticPath: 'http://localhost:3000/images/products/',
  featureFlags: {
    enableDebug: true,
    enableExperimentalFeatures: false
  }
};
