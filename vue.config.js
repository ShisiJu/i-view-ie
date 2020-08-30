// https://cli.vuejs.org/zh/config/#vue-config-js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...
    } else {
      // 为开发环境修改配置...
      // config 是webpack的配置项
      console.log(config);
    }
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        // 修改它的选项...
        return options
      })

    config.module.rule('js')
      .include
      .add('src')
      .add('test')
      .end()

  }
}