# ES6, Webpack2 + React 15 + Redux + Router + Koa

自己玩的一整套前端开发环境。

#### 准备工作
1. 安装node稳定版本（4.x）

2. 安装npm 3.x

3. 安装依赖

```
npm install
```

4. 设置registry使用淘宝的源，这样比npm官方的快很多：
```
npm config set registry http://registry.npm.taobao.org/
```

#### 命令
开发方式实时编译：
```
npm run dev
```
> 启用监听模式，可以在文件变化后，再次编译。

打包压缩：
```
npm run build
```

#### 启动服务
```
npm start
```

打开浏览器，访问 http://localhost:3000


#### 代码规范
本项目采用了Airbnb的[javascript书写规范](https://github.com/airbnb/javascript)，并结合实际情况，稍作修改。

代码检查：
`npm run eslint`


#### CSS浏览器兼容
引入`autoprefixer`工具，将css/less编译成兼容主流浏览器写法。
例如：
```css
display: flex;
```
将编译为：
```
display: -webkit-box;
display: -ms-flexbox;
display: flex;
```
>所以你开发的时候，基本不用考虑样式在各个主流浏览器下的兼容问题。
