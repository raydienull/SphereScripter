module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-var': 'error',
    'prefer-const': 'warn',
    'no-console': 'off',
  },
  globals: {
    require: 'readonly',
    module: 'readonly',
    exports: 'readonly',
  },
};