import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.stories.tsx',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.config.ts',
    '!**/jestWorkerTransformer/*',
  ],
  projects: ['<rootDir>/packages/*'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

export default config;
