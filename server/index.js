const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const app = require('express')()
const worker = require('ddv-worker')
const http = require('http')
const Nuxt = require('nuxt')
const siteRootPath = path.resolve('.', './')
var config = null
var nuxt = null
// 尝试获取配置文件地址
var siteConfigFile = path.resolve(siteRootPath, 'site.config.js')
if (!fs.existsSync(siteConfigFile)) {
  // 再次参数获取
  siteConfigFile = path.resolve(siteRootPath, 'nuxt.config.js')
}
// 创建http服务
worker.server = http.createServer(app)

// 创建编译器的方法
function createNuxtRender () {
  return (nuxt && nuxt.close ? nuxt.close() : Promise.resolve())
  .then(() => {
    // 删除旧的配置
    if (require.cache && siteConfigFile && require.cache[siteConfigFile]) {
      delete require.cache[siteConfigFile]
    }
    // 引入配置信息-Import and Set Nuxt.js options
    config = require(siteConfigFile)
    // 调试模式
    worker.DEBUG = config.dev = !(process.env.NODE_ENV === 'production')
  }).then(() => {
    // Init Nuxt.js
    nuxt = new Nuxt(config)
    // Build only in dev mode
    if (config.dev) {
      // 编译 - Build only in dev mode
      return nuxt.build()
    }
  }).then(() => {
    console.log('create nuxt render success')
  }).catch((error) => {
    console.error(error) // eslint-disable-line no-console
    process.exit(1)
  })
}
chokidar.watch(siteConfigFile, { ignoreInitial: true })
.on('all', function () {
  console.log('You have modified the configuration information and are recompiling')
  // 重新创建编译器
  createNuxtRender()
})
// 创建编译器
createNuxtRender().then(() => {
  if (config.dev) {
    // 使用nuxt插件
    app.use(function (res, req, next) {
      return nuxt.render.apply(this, arguments)
    })
  } else {
    // 使用nuxt插件
    app.use(nuxt.render)
  }
  // 监听服务 - Listen the server
  worker.updateServerConf({
    defaultListen: config.defaultListen,
    listen: config.listen,
    cpuLen: config.cpuLen
  }).then(() => {
    console.log('监听配置参数 更新成功')
  }, e => {
    console.error('监听配置参数 更新失败')
    console.error(e)
  })
})
