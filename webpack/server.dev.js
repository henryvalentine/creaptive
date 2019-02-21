const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const res = p => path.resolve(__dirname, p);

// if you're specifying externals to leave unbundled, you need to tell Webpack
// to still bundle `react-universal-component`, `webpack-flush-chunks` and
// `require-universal-module` so that they know they are running
// within Webpack and can properly make connections to client modules:
const externals = fs
  .readdirSync(res('../node_modules'))
  .filter(
    x =>
      !/\.bin|react-universal-component|require-universal-module|webpack-flush-chunks/.test(
        x
      )
  )
  .reduce((externals, mod) => {
    externals[mod] = `commonjs ${mod}`
    return externals
  }, {})

module.exports = {
  name: 'server',
  target: 'node',
  devtool: 'eval',
  entry: ['babel-polyfill', 'fetch-everywhere', res('../server/render.js')],
  externals,
  output: {
    path: res('../buildServer'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    publicPath: '/static/'
  },
  module: {
    rules: [
        {
            loader: 'babel-loader',
            test: /\.js$/,
            options: {
                presets: [
                    ['env', {modules: false, targets: {browsers: ['last 2 versions']}}],
                    'react'
                ],
                cacheDirectory: true,
                plugins: [
                    ['import', { libraryName: "antd", style: 'css' }],
                    'transform-strict-mode',
                    'transform-object-rest-spread'
                ]
            },
        },
        {
            test: /\.less$/,
            use: [
                {loader: "style-loader"},
                {loader: "css-loader"},
                {loader: "less-loader",
                    options: {
                        root: path.resolve(__dirname, './')
                    }
                }
            ]
        },
        {
          test: /\.css$/,
          use: {
            loader: 'css-loader'
          }
        }

        , {
            test: /\.(jpe?g|png|gif|svg|ico)/i,
            loader: 'file-loader?name=img/[name].[ext]'
        }, {
            test: /\.(ttf|eot|svg|woff|woff2)/,
            loader: 'file-loader?name=font/[name].[ext]'
        }, {
            test: /\.(pdf)/,
            loader: 'file-loader?name=asset/[name].[ext]'
        }
    ]
},
  resolve: {
  modules: ['.js', '.jsx', '.css', '.less', 'node_modules', 'app', 'server']
},
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ]
}
