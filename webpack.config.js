const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.js'],
  },
  target: 'web',
  module: {
    rules: [
      // JS만 번들링, CSS는 별도 관리
    ],
  },
}; 