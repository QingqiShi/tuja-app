import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'app',
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    'workers/processor\\.worker\\?worker':
      '<rootDir>/src/workers/__mocks__/mock.worker.ts',
    'idb-latest': 'idb',
    '\\.(css|less)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
};

export default config;
