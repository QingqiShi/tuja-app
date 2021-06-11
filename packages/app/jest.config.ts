import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'app',
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '(.*)\\?worker$': '$1',
    'idb-latest': 'idb',
    '\\.(css|less)$': '<rootDir>/fileMock.js',
    '@tuja/components': '@tuja/components/src/index.ts',
    '@tuja/libs': '@tuja/libs/src/index.ts',
  },
  transform: {
    '\\.worker\\.ts': '<rootDir>/jestWorkerTransformer/index.js',
    '\\.[jt]sx?$': 'babel-jest',
  },
  setupFiles: ['fake-indexeddb/auto'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
};

export default config;
