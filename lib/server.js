const app = require('express')()
const worker = require('ddv-worker')
const http = require('http')
const {
  Nuxt,
  Builder
} = require('nuxt')
const logger = require('./logger')
const cookieParser = require('cookie-parser')
const { isObject, isFunction } = require('../utils/valid')
var options = null
var nuxt = null
app.use(cookieParser())
// 创建http服务
worker.server = http.createServer(app)

// 创建编译器的方法
function createNuxtRender () {
  return (nuxt && nuxt.close ? nuxt.close() : Promise.resolve())
    .then(() => {
      // Init Nuxt.js
      nuxt = new Nuxt(options)
      // Build only in dev mode
      if (options.dev) {
        const builder = new Builder(nuxt)
        // 编译 - Build only in dev mode
        return builder.build()
      }
    })
    .then(() => {
      logger.log('create nuxt render success')
    })
    .catch((error) => {
      logger.error(error) // eslint-disable-line no-console
      process.exit(1)
    })
}
module.exports = worker
worker.serverStart = function serverStart (config) {
  config.onChange(opts => {
    options = opts
    logger.log('You have modified the configuration information and are recompiling')
    // 重新创建编译器
    createNuxtRender()
  })
  config.getConfig()
    .then(opts => {
      if (opts.express && (isObject(opts.express.headers) || isFunction(opts.express.headers))) {
        const headers = opts.express.headers

        app.use((req, res, next) => {
          if (isFunction(headers)) {
            headers(req, res)
          } else {
            Object.keys(headers).forEach(key => {
              res.setHeader(key, headers[key])
            })
          }

          next()
        })
      }
      return opts
    })
    .then(opts => {
      options = opts
      // 监听服务 - Listen the server
      worker.updateServerConf({
        defaultListen: options.defaultListen,
        listen: options.listen,
        cpuLen: options.cpuLen,
        notMasterListen: {
          port: config.argv.port || 3000,
          hostname: config.argv.hostname || void 0
        }
      }).then(() => {
        logger.log('监听配置参数 更新成功')
      }, e => {
        logger.error('监听配置参数 更新失败')
        logger.error(e)
      })
      // 创建编译器
      return createNuxtRender()
    })
    .then(() => {
      if (options.dev) {
        // 使用nuxt插件
        app.use(function (res, req, next) {
          return nuxt.render.apply(this, arguments)
        })
      } else {
        // 使用nuxt插件
        app.use(nuxt.render)
      }
    })
}
