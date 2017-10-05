const path = require('path');
const packageName = require('./package').name;

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: 'index.js',
    libraryTarget: 'umd',
    library: packageName,
    path: path.resolve(__dirname, 'dist/umd'),
    umdNamedDefine: true
  }
};
