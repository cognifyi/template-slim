// Copyright Daytona Platforms Inc.
// SPDX-License-Identifier: Apache-2.0

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'sdk-typescript',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@template-slim/api-client$': '<rootDir>/../api-client/src/index.ts',
    '^@template-slim/toolbox-api-client$': '<rootDir>/../toolbox-api-client/src/index.ts',
    '^@template-slim/sdk$': '<rootDir>/src/index.ts',
  },
  coverageDirectory: '../../coverage/libs/sdk-typescript',
}
