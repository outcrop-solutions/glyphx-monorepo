//eslint-disable-next-line
module.exports = {
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  extends: '@glyphx/eslint-config-glyphx-backend',
  rules: {
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: [
          'aws-sdk-client-mock',
          'uuid',
          'tsup',
          '@glyphx/types',
          'chai',
          'sinon',
        ],
      },
    ],
  },
};
