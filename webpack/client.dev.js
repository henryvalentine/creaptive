const path = require('path');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
module.exports = {
  name: 'client',
  target: 'web',
  devtool: 'eval',
  entry: [
      'react-hot-loader/patch',
    'babel-polyfill',
    'fetch-everywhere',
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
    // 'react-hot-loader',
    path.resolve(__dirname, '../app/index.js')
  ],
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, '../client/ui'),
    publicPath: '/static/'
  },
  module:  {
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
            use: ExtractCssChunks.extract({
              use: {
                loader: 'css-loader'
              }
            })
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
    new WriteFilePlugin(), // used so you can see what chunks are produced in dev
    new ExtractCssChunks(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['bootstrap'], // needed to put webpack bootstrap code before chunks
      filename: '[name].js',
      minChunks: Infinity
    }),
      new webpack.DefinePlugin({
          "typeof window": "\"object\""
      }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new AutoDllPlugin({
      context: path.join(__dirname, '..'),
      filename: '[name].js',
      entry: {
        vendor: [
          'react',
          'react-dom',
          'react-redux',
          'redux',
          'history/createBrowserHistory',
          'transition-group',
          'redux-first-router',
          'redux-first-router-link',
          'fetch-everywhere',
          'babel-polyfill',
          'redux-devtools-extension/logOnlyInProduction'
        ]
      }
    })
  ]
};
