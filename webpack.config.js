'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');
const webpack = require('webpack');

// 项目根路径
const ROOT_PATH = path.resolve(__dirname);
// 源代码路径
const SRC_PATH = ROOT_PATH + '/src';
// 输出路径
const DIST_PATH = ROOT_PATH + '/dist';
// Babel缓存路径
const CACHE_PATH = ROOT_PATH + '/cache';

const pkgInfo = require('./package.json')

module.exports = (options = {}) => {

  // 是否开发环境
  let isDev = options.dev;

  const config = require('./config/' + (process.env.npm_config_config || options.config || 'default'));

  return {
    /*
    这里entry我们改用对象来定义
    属性名在下面的output.filename中使用, 值为文件路径
    */
    entry: {
      index: SRC_PATH + '/index', //主入口
      vendor: SRC_PATH + '/vendor', //第三方库
    },

    output: {
      // 打包输出目录
      path: DIST_PATH,
      filename: isDev ? '[name].js' : '[name].js?[chunkhash]',
    },

    module: {
      /*
      配置各种类型文件的加载器, 称之为loader
      webpack当遇到import ... 时, 会调用这里配置的loader对引用的文件进行编译
      */
      rules: [
        {
          /**
          使用babel编译ES6/ES7/ES8为ES5代码
          使用正则表达式匹配后缀名为.js的文件
          */
          test: /\.js$/,
          // 排除node_modules目录下的文件, npm安装的包不需要编译
          exclude: /node_modules/,
          /*
          use指定该文件的loader, 值可以是字符串或者数组.
          这里先使用eslint-loader处理, 返回的结果交给babel-loader处理. loader的处理顺序是从最后一个到第一个.
          eslint-loader用来检查代码, 如果有错误, 编译的时候会报错.
          babel-loader用来编译js文件.
          */
          /*use: [{
            loader: 'babel-loader',
            options: {
              cacheDirectory: CACHE_PATH
            }
          }, {
            loader: 'eslint-loader'
          }]*/
          use: [{
            loader: 'babel-loader',
            options: {
			  presets: ['es2015', 'stage-0', 'react'],
              cacheDirectory: CACHE_PATH
            }
          }]
        }, {
          test: /\.html$/,
          /*
          使用html-loader, 将html内容存为js字符串, 比如当遇到
          import htmlString from './template.html'
          template.html的文件内容会被转成一个js字符串, 合并到js文件里.
          */
          use: [
            {
              loader: 'html-loader',
              options: {
                root: SRC_PATH,
                /*
                html-loader接受attrs参数, 表示什么标签的什么属性需要调用webpack的loader进行打包.
                比如<img>标签的src属性, webpack会把<img>引用的图片打包, 然后src的属性值替换为打包后的路径.
                使用什么loader代码, 同样是在module.rules定义中使用匹配的规则.

                如果html-loader不指定attrs参数, 默认值是img:src, 意味着会默认打包<img>标签的图片.
                这里我们加上<link>标签的href属性, 用来打包入口index.html引入的favicon.png文件.
                */
                attrs: ['img:src', 'link:href']
              }
            }
          ]
        }, {
          /*
          匹配favicon.png
          上面的html-loader会把入口index.html引用的favicon.png图标文件解析出来进行打包
          打包规则就按照这里指定的loader执行
           */
          test: /favicon\.ico$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                /*
                name: 指定文件输出名
                [name]是源文件名, 不包含后缀. [ext]为后缀. [hash]为源文件的hash值,
                这里我们保持文件名, 在后面跟上hash, 防止浏览器读取过期的缓存文件.
                */
                name: 'images/' + (isDev ? '[name].[ext]' : '[name].[ext]?[hash]'),
              }
            }
          ]
        }, {
          test: /\.(less|css)$/,

          /*
          先使用less-loader, css-loader处理, 返回的结果交给style-loader处理.
          css-loader将css内容存为js字符串, 并且会把background, @font-face等引用的图片,
          字体文件交给指定的loader打包, 类似上面的html-loader, 用什么loader同样在loaders对象中定义, 等会下面就会看到.
          */
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: ['css-loader', 'postcss-loader', 'less-loader'],
          }),
        }, {
          /*
          匹配各种格式的图片和字体文件
          上面html-loader会把html中<img>标签的图片解析出来, 文件名匹配到这里的test的正则表达式,
          css-loader引用的图片和字体同样会匹配到这里的test条件
          */
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,

          exclude: /favicon\.png$/,
          /*
          使用url-loader, 它接受一个limit参数, 单位为字节(byte)

          当文件体积小于limit时, url-loader把文件转为Data URI的格式内联到引用的地方
          当文件大于limit时, url-loader会调用file-loader, 把文件储存到输出目录, 并把引用的文件路径改写成输出后的路径

          比如 views/foo/index.html中
          <img src="smallpic.png">
          会被编译成
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAA...">

          而
          <img src="largepic.png">
          会被编译成
          <img src="/f78661bef717cf2cc2c2e5158f196384.png">
           */
          use: [{
            loader: 'url-loader',
            options: {
              limit: 400,
              name: "images/" + (isDev ? '[name].[ext]' : '[name].[ext]?[hash:7]'),
            }
          }]
        }
      ]
    },

    plugins: [
      /*
      使用CommonsChunkPlugin插件来处理重复代码
      因为vendor.js和index.js都引用了spa-history, 如果不处理的话, 两个文件里都会有spa-history包的代码,
      我们用CommonsChunkPlugin插件来使共同引用的文件只打包进vendor.js
       */
      new webpack.optimize.CommonsChunkPlugin({
        /*
        首先把重复引用的库打包进vendor.js, 这时候我们的代码里已经没有重复引用了, chunk文件名存在vendor.js中,
        然后我们在执行一次CommonsChunkPlugin, 把所有chunk的文件名打包到manifest.js中.
        这样我们就实现了chunk文件名和代码的分离. 这样修改一个js文件不会导致其他js文件在打包时发生改变, 只有manifest.js会改变.
         */
        names: ['vendor', 'mainfest']
      }),

      /*new webpack.DllReferencePlugin({
          context: ROOT_PATH,
          manifest: require('./manifest.json'),
      }),*/

      new webpack.DefinePlugin({
        DEBUG: Boolean(isDev),
        VERSION: JSON.stringify(pkgInfo.version),
        CONFIG: JSON.stringify(config.runtimeConfig)
      }),

      /*
      html-webpack-plugin用来打包入口html文件
      entry配置的入口是js文件, webpack以js文件为入口, 遇到import, 用配置的loader加载引入文件
      但作为浏览器打开的入口html, 是引用入口js的文件, 它在整个编译过程的外面,
      所以, 我们需要html-webpack-plugin来打包作为入口的html文件
      */
      new HtmlWebpackPlugin({
        /*
        template参数指定入口html文件路径, 插件会把这个文件交给webpack去编译,
        webpack按照正常流程, 找到loaders中test条件匹配的loader来编译, 那么这里html-loader就是匹配的loader
        html-loader编译后产生的字符串, 会由html-webpack-plugin储存为html文件到输出目录, 默认文件名为index.html
        可以通过filename参数指定输出的文件名
        html-webpack-plugin也可以不指定template参数, 它会使用默认的html模板.
        */
        template: SRC_PATH + '/index.html'
      }),
      new ExtractTextPlugin(isDev ? 'index.css' : 'index.css?[chunkhash]'),
    ],

    /*
    开发环境关闭performance.hints
     */
    performance: {
      hints: isDev ? false : 'warning'
    },

    /*
    简化import路径
     */
    resolve: {
      alias: {
        '~': SRC_PATH
      }
    },

    /*
    配置开发时用的服务器, 让你可以用 http://127.0.0.1:8080/ 这样的url打开页面来调试
    并且带有热更新的功能, 打代码时保存一下文件, 浏览器会自动刷新. 比nginx方便很多
    如果是修改css, 甚至不需要刷新页面, 直接生效. 这让像弹框这种需要点击交互后才会出来的东西调试起来方便很多.
    */
    devServer: config.devServer ? {
      host: config.devServer.host,

      // 配置监听端口, 因为8080很常用, 为了避免和其他程序冲突, 我们配个其他的端口号
      port: config.devServer.port,

      proxy: config.devServer.proxy,

      /*
      historyApiFallback用来配置页面的重定向

      SPA的入口是一个统一的html文件, 比如
      http://localhost:8010/foo
      我们要返回给它
      http://localhost:8010/index.html
      这个文件

      配置为true, 当访问的文件不存在时, 返回根目录下的index.html文件
      */
      historyApiFallback: isDev ? true : {index: '/assets'},
      //
      // 指定index.html文件的url路径
      /*historyApiFallback: {
        index: '/assets/'
      }*/
    } : undefined,
  };
};
