// .eslintrc.js
// (BARU) File untuk konfigurasi ESLint
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // BARIS INI AKAN MEMATIKAN SEMUA ERROR "multi-word-component-names"
    'vue/multi-word-component-names': 'off',
  },
};

