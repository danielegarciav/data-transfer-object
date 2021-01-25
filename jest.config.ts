import type { Config } from '@jest/types';
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  testPathIgnorePatterns: ['node_mdoules', 'lib'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
  moduleNameMapper: {
    '~(.*)$': '<rootDir>/src/$1',
  },
  coverageReporters: ['json', 'lcov', 'text'],
} as Config.InitialOptions;
