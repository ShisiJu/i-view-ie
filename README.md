# iview 兼容IE9 

IE9 本身就有一些js 上的兼容性问题
在 src/lib/compat_ie 文件中统一处理了


在 vue.config.js 中配置一下 特殊编译 locale

```js
// https://cli.vuejs.org/zh/config/#vue-config-js
module.exports = {
  // 4.4.0 版本的 view-design 修复了一些编译上的bug
  // 老版本的可能需要特殊编译一下 locale
  //resolve('node_modules/view-design/src/locale')
  transpileDependencies: ["view-design/src/locale"],
};
```


babel.config.js 要指定`entry` 不然有的polyfill 不全

```js
module.exports = {
  presets: [
    [
      "@vue/babel-preset-app",
      {
        useBuiltIns: "entry",
      },
    ],
  ],
};
```