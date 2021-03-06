const HtmlWebpackPlugin = require('html-webpack-plugin');
var Path = require('path');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    'pad': Path.resolve(__dirname, '../src/pad/index.js'),
    'listener': Path.resolve(__dirname, '../src/listener/index.js'),
    'demo': Path.resolve(__dirname, '../src/demo/index.js')
  },
  output: {
    path: Path.resolve(__dirname, '../public/'),
    filename: './touchpad/[name].js',
    chunkFilename: '[name].bundle.js',
    library: '',
    libraryTarget: 'window',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.html$|\.tmp$)/, loader: 'html-loader?minimize=false'
      },
      { 
        test: /\.js$/, loader: 'babel-loader'
      },
      {
        test: /(\.less$|\.css$)/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              outputPath: './images'
            }
          }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'listener',
      filename: 'index.html',
      template: 'src/demo/index.html',
      chunks: ['demo','listener']
    }),
    new HtmlWebpackPlugin({
      title: 'pad',
      filename: 'pad.html',
      template: 'src/pad/page/index.html',
      chunks: ['pad']
    })
  ]
};