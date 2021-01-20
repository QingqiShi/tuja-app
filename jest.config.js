module.exports = {
  testPathIgnorePatterns: ['<rootDir>/packages/app'],
  resetMocks: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.stories.tsx',
    '!**/*.d.ts',
    '!packages/app/**/*',
  ],
};
