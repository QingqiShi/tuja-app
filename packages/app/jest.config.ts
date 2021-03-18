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
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};

export default config;
