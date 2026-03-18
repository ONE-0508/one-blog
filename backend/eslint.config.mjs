import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': 'error',
      
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'curly': ['error', 'all'],
      'eqeqeq': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'logs/**'],
  },
];