import nx from '@nx/eslint-plugin'

// NOTE: intentionally no next/core-web-vitals here. It is only consumable via
// FlatCompat, whose plugin instances collide with the flat configs
// ("Cannot redefine plugin react / @typescript-eslint"). `next build` still
// type-checks the app, so lint stays on the same deterministic Nx flat stack
// as the rest of the repo. Re-add the Next rules only if you pin a single
// plugin instance strategy for the whole workspace.
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-useless-escape': 'off',
    },
  },
  {
    ignores: ['.next/**/*'],
  },
]
