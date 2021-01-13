module.exports = {
  projects: [
    '<rootDir>/packages/libs',
    '<rootDir>/packages/components',
    '<rootDir>/packages/workers',
    '<rootDir>/packages/functions',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/*.stories.tsx', '!**/*.d.ts'],
};
