const getOptions = require('./getOptions')
const app = require('express')()
const worker = require('ddv-worker')
const http = require('http')
const fs = require('fs')
const path = require('path')
const {
  Nuxt
} = require('nuxt')
const logger = require('./logger')
const nuxts = Object.create(null)
const templates = Object.create(null)
const hostToTemplateId = Object.create(null)
const vhostOptions = Object.create(null)

// 创建http服务
worker.server = http.createServer(app)
module.exports = worker
app.use(function (req, res, next) {
  return vhostRender.apply(this, arguments)
})

// 渲染中间件
function vhostRender (req, res, next) {
  var host = req.hostname || req.headers.host

  return getTemplateIdByHost(host, req, res)
    .then(templateId => {
      return getNuxtRender(templateId, req, res)
        .then(render => {
          render.apply(this, arguments)
        })
    })
    .catch(e => {
      if (vhostOptions.onError && typeof vhostOptions.onError === 'function') {
        return vhostOptions.onError(e, req, res)
      } else {
        return Promise.reject(e)
      }
    })
    .catch(e => {
      echoErrorByRes(e, req, res)
    })
}

function echoErrorByRes (e, req, res) {
  // 响应头
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf8',
    'Access-Control-Allow-Origin': '*',
    'Accept-Language': 'zh-CN'
  })
  res.write('错误-:' + e.message)
  res.write('错误stack:' + e.stack)
  res.end('错误body:' + e.body)
}
// 获取编译器的方法
function getNuxtRender (templateId, req, res) {
  if (nuxts[templateId]) {
    return Promise.resolve(nuxts[templateId])
  } else {
    return createNuxtRender(templateId, req, res)
      .then(nuxtRender => {
        nuxts[templateId] = nuxtRender
        return nuxts[templateId]
      })
  }
}
// function closeNuxtRender (templateId) {
//   return getNuxtRender(templateId)
//     .then(render => {
//       delete nuxts[templateId]
//       return render.close()
//     })
// }
// 创建编译器的方法
function createNuxtRender (templateId, req, res) {
  return getTemplateInfo(templateId, req, res)
    .then(info => {
      return getOptions(info.configFile)
        .then(options => {
          options.rootDir = info.rootDir || options.rootDir
          return options
        })
    })
    .then(options => {
      var arr = options.rootDir.split('/')
      var program = arr[arr.length - 1]
      var rootDir = path.resolve('.')
      var templatPath = path.resolve(vhostOptions.rootTemplateDir, program)
      var buildTemplateDir = vhostOptions.buildTemplateDir || path.resolve(rootDir, '.nuxt-dists')

      options.buildDir = path.resolve(buildTemplateDir, program)
      options.rootDir = vhostOptions.rootDir || rootDir
      options.srcDir = options.srcDir ? path.resolve(templatPath, options.srcDir) : templatPath

      let distDir = path.resolve(
        options.rootDir,
        options.buildDir || '.nuxt',
        'dist'
      )
      arr = void 0

      if (vhostOptions.processPool[program]) {
        program = void 0
        var e = new Error('Please wait patiently while the project is in progress.')
        e.errorId = 'WEBSITE_UPGRADE'

        return Promise.reject(e)
      }
      program = void 0

      return new Promise((resolve, reject) => {
        fs.stat(distDir, (err, stats) => {
          var isError = false
          if (err) {
            isError = true
          } else if (!stats.isDirectory()) {
            isError = true
          }

          if (isError) {
            if (
              vhostOptions.loadBuildFiles &&
              typeof vhostOptions.loadBuildFiles === 'function'
            ) {
              vhostOptions
                .loadBuildFiles(options.srcDir, vhostOptions, req, {
                  mode: 'production',
                  cwd: options.rootDir
                })
                .catch(e => {
                  e =
                    e ||
                    new Error(
                      'No build files found, please run `nuxt build` before launching `nuxt start`'
                    )
                  reject(e)
                })
            } else {
              reject(
                new Error(
                  'No build files found, please run `nuxt build` before launching `nuxt start`'
                )
              )
            }
          } else {
            resolve(options)
          }
        })
      })
    })
    .then(options => {
      const nuxt = new Nuxt(options)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(nuxt.render)
        }, 0)
      })
    })
}
// 获取模板信息
function getTemplateInfo (templateId, req, res) {
  if (templates[templateId]) {
    return Promise.resolve(templates[templateId])
  }
  return loadTemplateByIdRun(templateId, req, res).then(res => {
    templates[templateId] = res
    return templates[templateId]
  })
}

function getTemplateIdByHost (host, req, res) {
  if (hostToTemplateId[host]) {
    return Promise.resolve(hostToTemplateId[host])
  }
  return loadTemplateIdByHost(host, req, res).then(templateId => {
    hostToTemplateId[host] = templateId
    return hostToTemplateId[host]
  })
}

function loadTemplateIdByHost (host, req, res) {
  if (
    vhostOptions.loadTemplateIdByHost &&
    typeof vhostOptions.loadTemplateIdByHost === 'function'
  ) {
    return vhostOptions.loadTemplateIdByHost(host, req, res)
  } else {
    return Promise.reject(
      new Error('vhostOptions not find loadTemplateIdByHost')
    )
  }
}

function loadTemplateByIdRun (templateId, req, res) {
  if (
    vhostOptions.loadTemplateById &&
    typeof vhostOptions.loadTemplateById === 'function'
  ) {
    return vhostOptions.loadTemplateById(templateId, vhostOptions, req, res)
  } else {
    return Promise.reject(new Error('vhostOptions not find loadTemplateById'))
  }
}

worker.serverStart = function serverStart (config) {
  config.getConfig()
    .then(options => {
      Object.keys(vhostOptions).forEach(key => {
        if (options[key]) {
          vhostOptions[key] = options[key]
        } else {
          delete vhostOptions[key]
        }
      })
      Object.keys(options).forEach(key => {
        if (options[key]) {
          vhostOptions[key] = options[key]
        }
      })
      // 监听服务 - Listen the server
      worker
        .updateServerConf({
          defaultListen: options.defaultListen,
          listen: options.listen,
          cpuLen: options.cpuLen,
          notMasterListen: {
            port: config.argv.port || 3000,
            hostname: config.argv.hostname || void 0
          }
        })
        .then(
          () => {
            logger.log('监听配置参数 更新成功')
          },
          e => {
            logger.error('监听配置参数 更新失败')
            logger.error(e)
          }
        )
    })
}
