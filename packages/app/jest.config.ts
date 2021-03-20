import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'app',
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    'workers/processor\\.worker\\?worker':
      '<rootDir>/src/workers/__mocks__/processor.mock.ts',
    'idb-latest': 'idb',
    '\\.(css|less)$': '<rootDir>/fileMock.js',
    '@tuja/components': '@tuja/components/src/index.ts',
    '@tuja/libs': '@tuja/libs/src/index.ts',
  },
  setupFiles: ['fake-indexeddb/auto'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};

export default config;
