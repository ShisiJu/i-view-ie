# vue-cli 

vue-cli 是一个很好的工具. 它帮助我们集成了babel和webpack, 以及一些常用的插件.
让我们不用过多的关心配置, 专心业务.

但是, 秉承着一个对技术的好奇.
还是驱使我去看了看vue-cli的代码.

想要知道 npm run build 到底为我们做了什么

## 前言

简单说一些

有一些知识, 如果了解会更好.

### webpack

这里只做一些简单的介绍, 具体可以看[官网](https://webpack.js.org/concepts/) . 

[webpack](https://webpack.js.org/guides/getting-started/) 是一个现代JavaScript应用的静态打包工具, 当webpack处理应用时,它内部建立了一个映射项目中需要的每一个模块的依赖图.

webpack 通过插件和loader, 来进行打包的处理. 非常的灵活.

### babel

babel 是一个js的编译工具. 具体可以看[官网](https://babeljs.io/docs/en/).

webpack 和 babel通过 `babel-loader` 关联在了一起.
使得在用webpack打包时, 可以编译代码.(例如: 把ES6的语法转成ES5)

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

## 神奇的Service

代码的位置 
`node_modules\@vue\cli-service\lib\Service.js`


### 初始化service

首先看

```js
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())
```

### 执行run

我们再看

```js
// command就是你在命令行输入的参数
// 例如 npm run build, 那么 command 就是 build
const command = args._[0]

service.run(command, args, rawArgv).catch(err => {
  error(err)
  process.exit(1)
})
```