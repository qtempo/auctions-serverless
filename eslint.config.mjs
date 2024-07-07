import stylistic from '@stylistic/eslint-plugin'
import parserTs from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.js', '**/*.ts'],
    ignores: ['*.yml'],
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      parser: parserTs,
    },
    rules: {
      'max-len': ['error', { code: 120, tabWidth: 2 }],
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-parens': ['error', 'as-needed'],
      'no-trailing-spaces': ['error'],
      'nonblock-statement-body-position': ['error', 'below'],
      'no-multi-spaces': ['error', { ignoreEOLComments: false }],
      'no-useless-rename': ['error', { ignoreDestructuring: false }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
    },
  },
]
