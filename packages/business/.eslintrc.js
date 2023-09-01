//eslint-disable-next-line
module.exports = {
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  extends: ['@glyphx/eslint-config-glyphx-backend'],
  parser: '@typescript-eslint/parser',
  rules: {
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: ['chai', 'sinon', 'mocha', 'types'],
      },
    ],
  },
};
