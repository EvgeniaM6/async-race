import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
  },
};
export default config;
