# vue-cli 打包命令探索

vue-cli 是一个很好的工具. 它帮助我们集成了babel和webpack, 以及一些常用的插件.
让我们不用过多的关心配置, 专心业务.

但是, 秉承着一个对技术的好奇.
还是驱使我去看了看vue-cli的代码.

想要知道 npm run build 到底为我们做了什么

## 前言

文章涉及到一些常用的库, 大家可以先简单了解一下, 再看文章可能会更好理解.

### webpack

这里只做一些简单的介绍, 具体可以看[官网](https://webpack.js.org/concepts/) . 

[webpack](https://webpack.js.org/guides/getting-started/) 是一个现代JavaScript应用的静态打包工具, 当webpack处理应用时,它内部建立了一个映射项目中需要的每一个模块的依赖图.

webpack 通过插件和loader, 来进行打包的处理. 非常的灵活.
但是, webpack的配置是一件极其复杂而笨重的事情.

### webpack-chain

[webpack-chain](https://github.com/neutrinojs/webpack-chain)是一个可以动态生成的webpack配置的工具
它可以给rules和plugins进行分组具名, 从而更好地管理loader和插件.

vue-cli中也使用了webpack-chain, 用于生成webpack的配置


### webpack-merge

[webpack-merge](https://github.com/survivejs/webpack-merge)用于合并webpack的配置项

```js
const { merge } = require('webpack-merge');
// Keys matching to the right take precedence:
const output = merge(
  { fruit: "apple", color: "red" },
  { fruit: "strawberries" }
);
console.log(output);
// { color: "red", fruit: "strawberries"}
```

### babel

babel 是一个js的编译工具. 具体可以看[官网](https://babeljs.io/docs/en/).

webpack 和 babel通过 `babel-loader` 关联在了一起.
使得在用webpack打包时, 可以编译代码.(例如: 把ES6的语法转成ES5)

[vue-cli babel](https://cli.vuejs.org/core-plugins/babel.html#configuration)

```js
module.exports = {
  transpileDependencies: [
    // can be string or regex
    'my-dep',
    /other-dep/
  ]
}
```

### vue-cli webpack

[vue webpack 配置方式](https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F)

vue-cli 配置webpack可以通过vue.config.js中

1. configureWebpack 简单的配置方式, 合并默认配置
2. chainWebpack 链式操作 (高级)


## 从命令入手

我们知道打包时, 我们会执行`npm run build`

这个对应 `package.json` script 中的
```json
"build": "vue-cli-service build",
```

npm run 会去找 node_modules 下面的 `.bin` 目录下 vue-cli-service

我们可以看到一个 vue-cli-service 文件. ( `#!/bin/sh` 是对应linux系统的脚本解释器)

```sh
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

case `uname` in
    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
esac

if [ -x "$basedir/node" ]; then
  "$basedir/node"  "$basedir/../@vue/cli-service/bin/vue-cli-service.js" "$@"
  ret=$?
else 
  node  "$basedir/../@vue/cli-service/bin/vue-cli-service.js" "$@"
  ret=$?
fi
exit $ret
```

代码很少, 意思就是找 node_modules 下面的 `@vue/cli-service/bin/vue-cli-service.js`

```js
// 省去一些不关键的代码  ...
const Service = require('../lib/Service')
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())

const command = args._[0]

service.run(command, args, rawArgv).catch(err => {
  error(err)
  process.exit(1)
})
```

此时, 我们便清晰了. 想要知道怎么打包的,
那我们就要去看看 `Service` 到底做了什么.

## Service

代码的位置 
`node_modules\@vue\cli-service\lib\Service.js`


>特别注意: 下面的代码, 我会`去掉很多的代码`. 但是, 不会影响到我们对整体流程的理解.

我们可以通过以下命令, 来查看vue项目应用的webpack配置(导出到一个 output.js 的文件中)

```bash
vue inspect > output.js
```

### 初始化service

首先看

```js
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())
```

在源代码中, 我们可以看到定义的 class Service

其中, [vue-cli plugins](https://cli.vuejs.org/zh/guide/plugins-and-presets.html#%E6%8F%92%E4%BB%B6)

>Vue CLI 使用了一套基于插件的架构。如果你查阅一个新创建项目的 package.json，就会发现依赖都是以 @vue/cli-plugin- 开头的。


```js
module.exports = class Service {
  constructor (context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
    process.VUE_CLI_SERVICE = this
    this.initialized = false
    this.context = context
    this.inlineOptions = inlineOptions
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.devServerConfigFns = []
    this.commands = {}
    // Folder containing the target package.json for plugins
    this.pkgContext = context
    // package.json containing the plugins
    this.pkg = this.resolvePkg(pkg)
    // 这里会初始化一些插件, 包括一些内置的和在package.json中配置的
    // 例如
    // "@vue/cli-plugin-babel": "^4.5.0",
    // "@vue/cli-plugin-eslint": "^4.5.0",
    this.plugins = this.resolvePlugins(plugins, useBuiltIn)
    // pluginsToSkip will be populated during run()
    this.pluginsToSkip = new Set()
    // resolve the default mode to use for each command
    // this is provided by plugins as module.exports.defaultModes
    // so we can get the information without actually applying the plugin.
    this.modes = this.plugins.reduce((modes, { apply: { defaultModes }}) => {
      return Object.assign(modes, defaultModes)
    }, {})
  }
}
```

vue-cli 也是基于插件式的. 下面的方法加载插件.
其中, 我们会经常加载例如  `@vue/cli-plugin-babel` 的插件
vue-cli 在打包时, 会读取项目中 package.json 中 `@vue/cli-plugin`开头的插件

```js
  this.plugins = this.resolvePlugins(plugins, useBuiltIn)
```

### cli-plugin-babel

我们以加载vue的babel插件为例, 看看插件做了哪些配置.

```js
module.exports = (api, options) => {
  const useThreads = process.env.NODE_ENV === 'production' && !!options.parallel
  const cliServicePath = path.dirname(require.resolve('@vue/cli-service'))
  // 在vue.config.js中配置的 transpileDependencies
  const transpileDepRegex = genTranspileDepRegex(options.transpileDependencies)

  // 这里babel 会尝试加载配置文件
  babel.loadPartialConfigSync({ filename: api.resolve('src/main.js') })

  api.chainWebpack(webpackConfig => {
    webpackConfig.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'))
    // 通过 webpack.chain 来配置babel
    const jsRule = webpackConfig.module
      .rule('js')
        .test(/\.m?jsx?$/)
        .exclude
          .add(filepath => {
            // always transpile js in vue files
            if (/\.vue\.jsx?$/.test(filepath)) {
              return false
            }
            // exclude dynamic entries from cli-service
            if (filepath.startsWith(cliServicePath)) {
              return true
            }

            // only include @babel/runtime when the @vue/babel-preset-app preset is used
            if (
              process.env.VUE_CLI_TRANSPILE_BABEL_RUNTIME &&
              filepath.includes(path.join('@babel', 'runtime'))
            ) {
              return false
            }

            // 如果在配置的编译依赖中, 则会被babel编译
            if (transpileDepRegex && transpileDepRegex.test(filepath)) {
              return false
            }
            // Don't transpile node_modules
            return /node_modules/.test(filepath)
          })
          .end()
          // 省去了 cache-loader的处理
    jsRule
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))
  })
}
```

通过jsRule(具名rule, 由webpack-chain 提供的方法), 来配置babel-loader. 


### 执行run


```js
// command就是你在命令行输入的参数
// 例如 npm run build, 那么 command 就是 build
const command = args._[0]

service.run(command, args, rawArgv).catch(err => {
  error(err)
  process.exit(1)
})
```

我们看看 `run`, 我把分析写在了代码注释里.

```js
// 这里, 我们可以看到根据命令, 来选择不同的环境, 从而加载不同的命令
  async run (name, args = {}, rawArgv = []) {
    // 省去了很多代码
    // load env variables, load user config, apply plugins
    this.init(mode)
    let command = this.commands[name]
    const { fn } = command
    // 如果执行的build 方法
    // 那么会 node_modules\@vue\cli-service\lib\commands\build\index.js 导出的函数fn
    return fn(args, rawArgv)
  }

  init (mode = process.env.VUE_CLI_MODE) {
    this.mode = mode

    // 这里根据不同的环境, 加载不同的文件
    // 例如: .env.production 
    // load mode .env
    if (mode) {
      this.loadEnv(mode)
    }
    // load base .env
    this.loadEnv()

    // 加载用户传入的配置项, 并且合并默认的配置
    const userOptions = this.loadUserOptions()
    this.projectOptions = defaultsDeep(userOptions, defaults())

    debug('vue:project-config')(this.projectOptions)
    // @vue/cli-plugin-babel 
    // 应用一些vue插件, 包括内置的例如build, serve 
    this.plugins.forEach(({ id, apply }) => {
      if (this.pluginsToSkip.has(id)) return
      apply(new PluginAPI(id, this), this.projectOptions)
    })

    // 链式调用webpack的配置
    if (this.projectOptions.chainWebpack) {
      this.webpackChainFns.push(this.projectOptions.chainWebpack)
    }
    // webpack原生的配置
    if (this.projectOptions.configureWebpack) {
      this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
    }
  }
```

我们找到了内置插件 build的代码

```js
// apply(new PluginAPI(id, this), this.projectOptions)
// args是命令行输入的参数 api是new PluginAPI(id, this) options是this.projectOptions 
await build(args, api, options) 
```

`node_modules\@vue\cli-service\lib\commands\build\index.js`

```js
async function build (args, api, options) {
  const webpack = require('webpack')
  const validateWebpackConfig = require('../../util/validateWebpackConfig')

  if (args.dest) {
    // Override outputDir before resolving webpack config as config relies on it (#2327)
    options.outputDir = args.dest
  }

  const targetDir = api.resolve(options.outputDir)
  const isLegacyBuild = args.target === 'app' && args.modern && !args.modernBuild

  // resolve raw webpack config
  let webpackConfig
  // ..省去根据不同模式来选择不同配置的代码
  // 并且根据用户传入的配置进行
  // chainWebpack, 
  // webpack-chain获取到最终要使用的配置 webpackConfig
  webpackConfig = require('./resolveAppConfig')(api, args, options)
  // check for common config errors
  validateWebpackConfig(webpackConfig, api, options, args.target)

  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      // 省去了一些错误处理
      resolve()
    })
  })
}
```

OK, 至此我们看到了, `webpack()` 的调用, 之后, 就开始进行打包了.
打包的工作有webpack 来处理.

## 总结

vue-cli 是集成了webpack, babel 及其一些常用的插件的一个脚手架.
同时, vue-cli 还使用了 webpack-chain 来处理webpack的配置文件.

并且, 通过vue.config.js的 `chainWebpack` 来灵活地改变配置.

vue-cli 自己又有自己的一套插件.
vue-cli 帮我们做了很多配置上的处理. 使用它的默认配置, 往往能够满足开发的需要.

当然, 如果需要更多灵活地配置, 就需要了解一些代码上的处理.

代码部分, 我只讲了大致流程. 如果想看详细的代码, 可以自己在一个 vue项目中查看.
