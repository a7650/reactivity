const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const webpack = require('webpack')
const path = require('path')

module.exports = merge(common, {
  mode: 'development',
  entry: {
    app: ['webpack-hot-middleware/client', path.resolve(__dirname, '../example/index.ts')]
  },
  devtool: 'inline-source-map',
  module: {},
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  stats: 'none'
})