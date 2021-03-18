import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.stories.tsx',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/jest.config.ts',
  ],
  projects: ['<rootDir>/packages/*'],
};

export default config;
