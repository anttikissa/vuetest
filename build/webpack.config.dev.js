const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const path = require('path')

function resolve(dir) {
	return path.join(__dirname, '..', dir)
}

module.exports = {
	mode: 'development',
	// entry: './src/app.js',

	devServer: {
		hot: true,
		watchOptions: {
			poll: true
		}
	},

	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader'
			},
			// {
			// 	test: /\.js$/,
			// 	use: 'babel-loader'
			// },
			{
				test: /\.css$/,
				use: [
					// 'vue-style-loader',
					'css-loader'
				]
			},
			{
				test: /\.styl(us)?$/,
				use: [
					MiniCssExtractPlugin.loader,
					// 'vue-style-loader',
					'css-loader',
					'stylus-loader'
				]
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new VueLoaderPlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'index.html',
			inject: true
		}),
		new CopyWebpackPlugin([{
			from: resolve('static'),
			to: resolve('dist/static'),
			toType: 'dir'
		}]),
		new MiniCssExtractPlugin({
			filename: 'main.css'
		})
	]
}
