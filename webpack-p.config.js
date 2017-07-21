const webpack = require('webpack');
const devConfig = require('./webpack.config');
module.exports = env => Object.assign({}, devConfig, {
  plugins: [ ...devConfig.plugins,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: env.production
    })
  ]
});
