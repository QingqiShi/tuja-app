module.exports = {
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.stories.tsx',
    '!**/*.d.ts',
    '!packages/app/**/*',
  ],
  projects: ['<rootDir>/packages/*'],
};
