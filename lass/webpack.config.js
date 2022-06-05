 const path = require('path');
const webpack = require('webpack');
module.exports = {
  entry: ['./client/app.js'],
  //===============================================================================
//  mode: "development",
//  devtool: "inline-source-map",
//  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
//    extensions: [".ts", ".tsx", ".js"]
//  },
//  module: {
//    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
//      { test: /\.tsx?$/, loader: "ts-loader" }
//    ]
//  },
  //===============================================================================

  output: {
    path: __dirname,
    filename: 'assets/bundle.js'
  },
  plugins: [
	new webpack.ProvidePlugin({
  	$: 'jquery',
  	jQuery: 'jquery'
	})]
};
