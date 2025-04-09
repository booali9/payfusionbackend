const path = require('path');

module.exports = {
  entry: './server.js', // Your entry point (main server file)
  output: {
    path: path.resolve(__dirname, 'dist'),  // The output directory
    filename: 'bundle.js',  // The output file
  },
  target: 'node',  // Tells Webpack it's for a Node.js app
  externals: {
    mongoose: 'commonjs mongoose',  // Exclude mongoose from bundling
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',  // Transpile your JavaScript with Babel
      },
    ],
  },
  resolve: {
    extensions: ['.js'],  // Resolve .js extensions
  },
};

