const path = require('path');
const fs  = require('fs');
var webpack = require('webpack');
// const lessToJs = require('less-vars-to-js');
// const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, './app/styles/ant-theme-vars.less'), 'utf8'));

// lessToJs does not support @icon-url: "some-string", so we are manually adding it to the produced themeVariables js object here
// themeVariables["@icon-url"] = "'http://localhost:8080/fonts/iconfont'";

module.exports = {
    context: __dirname,
    devtool: 'eval',
    entry:  [
        'webpack-hot-middleware/client',
        './app/creaptive.js'
    ],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, './dist')
    },
    resolve: {
        modules: ['.js', '.jsx', '.css', '.less', 'node_modules']
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                exclude: /node_modules/,
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
                            // modifyVars: themeVariables,
                            root: path.resolve(__dirname, './')
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader","css-loader"
                ]
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
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ],

    devServer: {
        contentBase: './app',
        host: 'localhost',
        inline: true
    }
};