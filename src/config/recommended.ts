export default {
  plugins: ['css-import-order'],

  rules: {
    'css-import-order/css-import-order': 'error',
  },

  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
  },
};
