/* eslint-env node */

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['**/*.js', 'dist'],
  rules: {
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    // tests import dev dependencies such as supertest
    'import/no-extraneous-dependencies': 'off',

    // functions are hoisted, so helpers can sit below the code that uses them
    'no-use-before-define': ['error', { functions: false }],
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],

    // Express error middleware must declare all four arguments
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },

  overrides: [
    {
      // TypeORM migrations are classes whose methods do not use `this`
      files: ['src/database/migrations/**/*.ts'],
      rules: { 'class-methods-use-this': 'off' },
    },
    {
      // entities reference each other for relations
      files: ['src/entities/**/*.ts'],
      rules: { 'import/no-cycle': 'off' },
    },
  ],
}
