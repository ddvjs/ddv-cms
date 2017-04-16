'use strict'

const path = require('path')
const dirRoot = path.resolve(__dirname, '../')
const CssEntryPlugin = require('css-entry-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const vueLoaderConfig = require('./vue-loader.conf')
const webpack = require('webpack')
module.exports = {
  entry: {
    'index': './src/index.js',
    'each': './src/each.js'
  },
  output: {
    path: path.resolve(dirRoot, 'lib'),
    filename: '[name]/index.js',
    chunkFilename: '[name].[id]/index.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.vue',
      '.css',
      '.scss',
      '.sass'
    ],
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    },
    modules: [
      'node_modules'
    ]
  },
  resolveLoader: {},
  devtool: '#source-map',
  devServer: {
    enable: false,
    stats: 'errors-only'
  },
  externals: {
    vue: {
      'root': 'Vue',
      'commonjs': 'vue',
      'commonjs2': 'vue',
      'amd': 'vue'
    }
  },
  module: {
    rules:
    [
      {
        test: /\.(jsx?|babel|es6)$/,
        include: '/Users/hua/Documents/其他项目/ddv-cms',
        exclude: /node_modules|bower_components/,
        loader: 'buble-loader',
        query: {
          objectAssign: 'Object.assign',
          jsx: 'h'
        }
      },
      {
        test: /\.json$/,
        loaders: 'json-loader'
      },
      {
        test: /\.css$/,
        loaders: 'css-loader!postcss-loader?sourceMap=true'
      },
      {
        test: /\.html$/,
        loaders: 'html-loader?minimize=false'
      },
      {
        test: /\.otf|ttf|woff2?|eot(\?\S*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'static/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.svg(\?\S*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'static/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(gif|png|jpe?g)(\?\S*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'static/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.vue$/,
        loaders: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.scss$/,
        loader: 'css-loader!sass-loader?sourceMap=true'
      },
      {
        test: /\.sass$/,
        loader: 'css-loader!sass-loader?sourceMap=true&indentedSyntax'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules|bower_components/,
        loader: 'eslint-loader',
        enforce: 'pre'
      },
      {
        test: /\.vue$/,
        exclude: /node_modules|bower_components/,
        loader: 'eslint-loader',
        enforce: 'pre'
      }
    ]
  },
  plugins: [
    new ProgressBarPlugin(),
    new CssEntryPlugin({
      output: {
        filename: '../css/[name].css'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        debug: true,
        vue: {
          postcss: [
            require('autoprefixer')
          ]
        }
      }
    })
  ]
}
