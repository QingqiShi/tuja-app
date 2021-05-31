import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'workers',
  resetMocks: true,
  testEnvironment: 'jsdom',
};

export default config;
