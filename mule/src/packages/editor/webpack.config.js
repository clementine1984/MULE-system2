const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const APP_DIR = path.resolve(__dirname, './src');
//const MONACO_DIR = path.resolve(__dirname, './node_modules/monaco-editor');
//const CONVERGE = path.resolve(__dirname, './node_modules/@convergencelabs/monaco-collab-ext');

const mode = process.env.NODE_ENV || 'development';
const minimize = mode === 'production';
const plugins = [];

if (mode === 'production') {
  plugins.push(new OptimizeCSSAssetsPlugin({
    cssProcessorOptions: {
      discardComments: true
    },
  }));
}

module.exports = {
  mode,
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'index.tsx'),
  output: {
    publicPath: '/apps/editor/'
  },
  externals: {
    osjs: 'OSjs'
  },
  optimization: {
    minimize,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin([
      { from: 'node_modules/monaco-editor' ,  to: 'monaco-editor'},
      { from: 'icon.png' ,  to: 'icon.png'}
  ]),
  //  new MonacoWebpackPlugin(),
    ...plugins
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
    /*  {
        test: /\.css$/,
        include: [MONACO_DIR, CONVERGE],
        use: ['style-loader', 'css-loader'],
      },*/
      {
        test: /\.(jpg|png)$/,
        loader: "url-loader",
        options: {
            limit: 45000
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              minimize,
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              {
                plugins: [
                  ['@babel/plugin-proposal-decorators', { 'legacy': true}],
                  "@babel/plugin-proposal-class-properties"
                ]
              }
            ]
          },
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js",".jsx"]
  }
};
