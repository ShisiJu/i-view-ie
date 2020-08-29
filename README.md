# vue iview 浏览器兼容问题

支持到IE9

如果遇到问题, 可以给我留言. 说明具体的问题.

## js

我们根据浏览器的用户代理字符串, 来区别出是哪种浏览器的哪个版本.
然后, 我们就要根据版本来进行兼容了.

[vue 浏览器兼容](https://cli.vuejs.org/zh/guide/browser-compatibility.html) 中说明了一些兼容性的处理.
但是, 真正做起来还有一些不明确的地方.

我在下面的文章中, 做了一些我自己的说明.

下面是可能你需要安装的npm包

```
# 兼容iview
npm install -D babel-loader @babel/core @babel/preset-env webpack
# 兼容IE, 如果是新版的vue-cli 会自带安装这个包
npm install --save core-js
```

### 转义ES6语法和polyfill

ES6语法, 可以通过babel来自动转换成ES5.
在vue-cli3 创建的项目已经包括了[babel](https://babeljs.io/).

其中有`babel-preset-env`, 可以根据`browserslist`来智能地进行转义和提供polyfill

不过需要你安装一下`core-js`

```
npm install --save core-js
```

vue的项目可以设置一下 package.json的 `browserslist`

```json
{
"browserslist": [
    "> 0.1%",
    "last 3 versions",
    "not ie <= 8"
  ],
}
```

在 `.babelrc` 文件中改为


```json
{
  "presets": [
    [
      "@vue/app",
      {
        "useBuiltIns": "entry"
      }
    ]
  ]
}
```

新版本的vue-cli中是babel.config.js

```js
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    {
        "useBuiltIns": "entry"
    }
  ]
}
```

通过下面的命令可以看到支持的浏览器清单

```bash
# 查询支持的浏览器
npx browserslist
```

要在入口文件中加入


```js
// 为了兼容IE9
import 'core-js/stable'
import 'regenerator-runtime/runtime'
// 这个方法里包含了一些对IE的特殊处理, 具体代码见下面
import compat_ie from '@/libs/ie.js'

compat_ie()
```

兼容IE9, 我写到一个`compat_ie.js` 

```js
/* eslint-disable */
export default function compat_ie() {
  /**
*作用：兼容dataset
*问题：[Vue warn]: Error in directive transfer-dom inserted hook: "TypeError: 无法获取未定义或 null 引用的属性“transfer”"
*说明：ie10及以下不支持dataset，以下代码处理兼容
* */
  if (window.HTMLElement) {
    if (Object.getOwnPropertyNames(HTMLElement.prototype).indexOf('dataset') === -1) {
      Object.defineProperty(HTMLElement.prototype, 'dataset', {
        get: function () {
          var attributes = this.attributes; // 获取节点的所有属性
          var name = [];
          var value = []; // 定义两个数组保存属性名和属性值
          var obj = {}; // 定义一个空对象
          for (var i = 0; i < attributes.length; i++) { // 遍历节点的所有属性
            if (attributes[i].nodeName.slice(0, 5) === 'data-') { // 如果属性名的前面5个字符符合"data-"
              // 取出属性名的"data-"的后面的字符串放入name数组中
              name.push(attributes[i].nodeName.slice(5));
              // 取出对应的属性值放入value数组中
              value.push(attributes[i].nodeValue);
            }
          }
          for (var j = 0; j < name.length; j++) { // 遍历name和value数组
            obj[name[j]] = value[j]; // 将属性名和属性值保存到obj中
          }
          return obj; // 返回对象
        },
      });
    }
  }

  /**
   *作用：兼容requestAnimationFrame（ie9）
   *问题：
   *说明：ie9是不支持requestAnimationFrame的，以下代码处理兼容
   * */
  (function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
        window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
    }
  }());

  /**
   *作用：兼容classList（ie9）
   *错误信息： 无法获取未定义或 null 引用的属性“add”/  无法获取未定义或 null 引用的属性“remove”
   *说明：ie9以下代码处理兼容
   * */
  if (!('classList' in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
      get: function () {
        var self = this;
        function update(fn) {
          return function (value) {
            var classes = self.className.split(/s+/g);
            var index = classes.indexOf(value);

            fn(classes, index, value);
            self.className = classes.join(' ');
          };
        }

        return {
          add: update(function (classes, index, value) {
            if (!~index) classes.push(value);
          }),

          remove: update(function (classes, index) {
            if (~index) classes.splice(index, 1);
          }),

          toggle: update(function (classes, index, value) {
            if (~index) { classes.splice(index, 1); } else { classes.push(value); }
          }),

          contains: function (value) {
            return !!~self.className.split(/s+/g).indexOf(value);
          },

          item: function (i) {
            return self.className.split(/s+/g)[i] || null;
          },
        };
      },
    });
  }
}
```


### iview

`vue.config.js` 的要配置一下configureWebpack,
使用`@babel/preset-env` 去打包一下 `node_modules/view-design/src/locale`

这个包里有ES6语法, 且没有转义. 只能自己转义一下了.

需要先安装一下npm包
```
# 兼容iview
npm install -D babel-loader @babel/core @babel/preset-env webpack
```

```js
module.exports = {
   // ....
  configureWebpack: {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.m?js$/,
          include: [
            resolve('src'),
            resolve('node_modules/view-design/src/locale')
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  }
}
```

tabs 组件

通过设置属性 animated 为 false 可以禁用动画, 从而使得IE9兼容, 但是动画就没有了
可以写一个方法判断是否是IE9(IE8直接就不用考虑了Vue都不支持..)

```js
export const canUseAnimation = agent !== 'Mozilla/5.0(compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)'
```

```html
<Tabs :animated="canUseAnimation">
```

### axios

[IE9 XMLHttpRequest 不支持 CORS](https://blog.csdn.net/icewfz/article/details/79415708)

所以只能用Nginx做代理, 让请求的都通过前端项目的地址

可以参考我的

如果遇到[vue项目提示Invalid Host header](https://juejin.im/post/6844903667003310087)

在devServer`disableHostCheck`设置为 true

```js
  devServer: {
    host: 'localhost',
    https: false, // https:{type:Boolean}
    open: true, // 配置自动启动浏览器
    disableHostCheck: true
  },
```

## html 

### 浏览器内核兼容

```html 
    <!-- 避免IE使用兼容模式 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <!-- 启用360浏览器的极速模式(webkit) -->
    <meta name="renderer" content="webkit">
```

X-UA-Compatible是针对IE8新加的一个设置，是为了避免制作出的页面在IE8下面出现错误，
而指定使用其他浏览器版本来渲染网页内容，对于IE8之外的浏览器是不识别的。

IE=edge 意味着IE应该使用其渲染引擎的最新版本
chrome=1表示IE应该使用Chrome渲染引擎（如果已安装）


具体可见[microsoft-ie](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/dn255001(v=vs.85)?redirectedfrom=MSDN)的相关文档.

## CSS 

IE 部分支持Flex布局.
如果项目明确要支持IE, 最好就使用iview提供的Grid布局

IE 支持动画非常不好. 使用组件时, 可以根据IE进行特殊处理, 不使用动画.


## 参考文档


特别感谢, 下面的文章提供了很多思路

[iview-admin（cli3 + webpack4 ）解决兼容ie9+ 方案](https://www.cnblogs.com/ysxq/p/11052207.html)

[Vue 兼容 ie9 的全面解决方案](https://juejin.im/post/6844903621927108615)

[前端常用的一些meta属性](https://juejin.im/post/6844903568739155975)

[browserslist](https://github.com/browserslist/browserslist)

[听说你的 fetch 还要兼容 IE9](https://juejin.im/post/6844903561793372173)

