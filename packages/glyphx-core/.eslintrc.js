//eslint-disable-next-line
module.exports = {
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  extends: 'eslint-config-glyphx-backend',
  rules: {
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: ['chai', 'sinon'],
      },
    ],
  },
};
