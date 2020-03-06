const path = require('path');
const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'sourcemap',
  stats: 'errors-only',
  entry: {
    'youtube/index': './source/youtube/index.jsx',
    'background/index': './source/background.js',
    'options/index': './source/options/index.jsx',
    'search/index': './source/search/index.jsx',
  },
  output: {
    path: path.join(__dirname, 'distribution'),
    filename: '[name].js',
  },
  plugins: [
    new SizePlugin(),
    new CopyWebpackPlugin([
      {
        from: './source/manifest.json',
      },
      {
        from: '**/*',
        context: 'media',
        ignore: ['*.js'],
      },
      {
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
      },
      {
        from: './source/options/index.html',
        to: 'options',
      },
      {
        from: './source/search/*',
        to: 'search',
        ignore: ['*.js', '*.jsx', '*.cs'],
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-flexbugs-fixes'),
                require('autoprefixer')({
                  browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9',
                  ],
                  flexbox: 'no-2009',
                }),
              ],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            indent_level: 2, // eslint-disable-line camelcase
          },
        },
      }),
    ],
  },
};
