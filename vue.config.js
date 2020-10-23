// https://cli.vuejs.org/zh/config/#vue-config-js
module.exports = {
  // 4.4.0 版本的 view-design 修复了一些编译上的bug
  // 老版本的可能需要特殊编译一下 locale
  //resolve('node_modules/view-design/src/locale')
  transpileDependencies: ["view-design/src/locale"],
};
