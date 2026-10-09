/*
 * Copyright 2025 TemplateOrg.
 * SPDX-License-Identifier: Apache-2.0
 */

export default {
  displayName: 'daytona',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  transformIgnorePatterns: ['/node_modules/(?!uuid)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/daytona',
}
