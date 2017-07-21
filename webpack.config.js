const webpack = require('webpack');
//const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  // entry: ['bootstrap-loader', './src/client.js'],
  entry: './src/client.js',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/, exclude: /node_modules/,
        loader: 'babel-loader'
      },
      { 
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      { 
        test: /\.png$/,
        loader: "url-loader?limit=100000"
      },
      { 
        test: /\.jpg$/,
        loader: "file-loader"
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
  plugins: [
    //new CleanWebpackPlugin(['public']),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
};
