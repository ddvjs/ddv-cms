// 引入 cooking 依赖
var cooking = require('cooking')
var components = require('../src/components.json')
var entry = Object.assign({}, {
  index: './src/index.js',
  each: './src/each.js'
}, components)

// 调用 set 方法传入自定义配置
cooking.set({
  use: 'vue2',
  entry: entry, // 指定入口文件
  dist: './lib', // 设置打包后的文件目录
  hash: true, // 打包的文件是否带 hash
  sourceMap: true, // 是否带 sourceMap
  clean: false,
  format: 'umd',
  extractCSS: '[name]/style.css',
  extends: ['vue2', 'lint'],
  externals: { vue: {
    root: 'Vue',
    commonjs: 'vue',
    commonjs2: 'vue',
    amd: 'vue'
  } },
  alias: {
    'vue$': 'vue/dist/vue.common.js'
  }
})
cooking.add('output.filename', '[name]/index.js')
cooking.add('vue.preserveWhitespace', false)

// 生成 webpack 配置并导出
module.exports = cooking.resolve()
