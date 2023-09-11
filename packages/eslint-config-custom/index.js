// eslint-disable-next-line
module.exports = {
  extends: ['turbo', 'prettier', 'next'],
  root: true,
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    'import/no-unresolved': 0,
    '@typescript-eslint/no-explicit-any': 'off',
  },
  ignorePatterns: ['*.d.ts', 'build/**/*.*', '**.next**', '**.turbo**', '**/glyphx_cube_model.js'],
};
