module.exports = {
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.stories.tsx',
    '!**/*.d.ts',
  ],
  projects: ['<rootDir>/packages/*'],
};
