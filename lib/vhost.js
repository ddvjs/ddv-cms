const getOptions = require('./getOptions')
const app = require('express')()
const worker = require('ddv-worker')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { Nuxt } = require('nuxt')
const logger = require('./logger')
const nuxts = Object.create(null)
const templates = Object.create(null)
const hostToTemplateId = Object.create(null)
const vhostOptions = Object.create(null)
const cookieParser = require('cookie-parser')
const deleteFolder = require('../utils/delete-folder.js')

// 创建http服务
worker.server = http.createServer(app)
module.exports = worker
app.use(cookieParser())
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
    return Promise.resolve(nuxts[templateId].render)
  } else {
    return createNuxtRender(templateId, req, res)
      .then(nuxt => {
        nuxts[templateId] = nuxt
        return nuxts[templateId].render
      })
  }
}

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
      // 配置目录
      var arr = options.rootDir.split('/')
      var program = arr[arr.length - 1]
      var rootDir = path.resolve('.')
      var templatPath = path.resolve(vhostOptions.rootTemplateDir, program)
      var buildTemplateDir = vhostOptions.buildTemplateDir || path.resolve(rootDir, '.nuxt-dists')
      options.__program = program

      options.rootDir = vhostOptions.rootDir || rootDir
      options.srcDir = options.srcDir ? path.resolve(templatPath, options.srcDir) : templatPath
      arr = program = rootDir = templatPath = void 0

      return {
        options,
        buildTemplateDir
      }
    })
    .then(({
      options,
      buildTemplateDir
    }) => {
      // 判断build文件夹是否存在
      if (!fs.existsSync(buildTemplateDir)) {
        // 默认build路径
        options.buildDir = path.resolve(buildTemplateDir, options.__program)
        return options
      }
      // 获取最新编译文件路劲
      return new Promise((resolve, reject) => {
        fs.readdir(buildTemplateDir, (err, files) => {
          if (err) {
            reject(err)
          } else {
            let fileName = ''
            let fileChangeTime = -1
            let fileLists = []
            files.forEach(file => {
              if (file.split('--subVersion--')[0] === options.__program) {
                let pathDir = path.resolve(buildTemplateDir, file)
                let stat = fs.statSync(pathDir)

                if (stat.isDirectory()) {
                  let ctime = (stat.ctime).getTime()

                  if (ctime > fileChangeTime) {
                    if (fileChangeTime > -1) {
                      let obj = {
                        pathDir,
                        ctime: fileChangeTime
                      }
                      fileLists.push(obj)
                    }
                    fileChangeTime = +ctime
                    fileName = file
                  }
                }
              }
            })

            if (typeof vhostOptions.delCache === typeof void 0 ? true : !!vhostOptions.delCache) {
              delCache(
                fileLists
                  .sort((a, b) => b.ctime - a.ctime)
                  .map(item => item.pathDir)
              )
            }
            options.buildDir = path.resolve(buildTemplateDir, fileName)
            fileName = fileChangeTime = void 0
            resolve(options)
          }
        })
      })
    })
    .then(options => {
      let distDir = path.resolve(
        options.rootDir,
        options.buildDir || '.nuxt',
        'dist'
      )

      if (vhostOptions.processPool[options.__program]) {
        var e = new Error('Please wait patiently while the project is in progress.')
        e.errorId = 'WEBSITE_UPGRADE'

        return Promise.reject(e)
      }

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
        // 发生错误
        nuxt.hook('error', err => {
          err.errorId = 'NUXT_BUILD_SEVER_ERROR'
          logger.error(`调用钩子时出现未处理的错误,来源于 -- ${options.__program}`)
          reject(err)
        })
        // SSR中间件和所有资源都准备就绪
        nuxt.hook('render:done', res => {
          resolve(nuxt)
        })
      })
    })
}
// 获取模板信息
function getTemplateInfo (templateId, req, res) {
  if (templates[templateId]) {
    return Promise.resolve(templates[templateId])
  }
  return loadTemplateByIdRun(templateId, req, res)
    .then(res => {
      templates[templateId] = res
      return templates[templateId]
    })
}
// 删除编译文件
function delCache (filePath) {
  if (!filePath) {
    return Promise.resolve()
  }
  let filePathLists = []

  if (typeof filePath === 'string') {
    filePathLists.push(filePath)
  } else if (Array.isArray(filePath)) {
    filePathLists = filePath.map(file => file)
  }
  let keepCacheNum = !+vhostOptions.keepCacheNum || +vhostOptions.keepCacheNum <= 0
    ? 1
    : +vhostOptions.keepCacheNum > filePathLists.length
      ? filePathLists.length
      : +vhostOptions.keepCacheNum

  filePathLists.splice(0, keepCacheNum)

  if (!filePathLists.length) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      filePathLists.forEach(path => {
        console.log()
        logger.warn(`开始删除文件 -- ${path}`)
        console.log()
        deleteFolder(path)
      })
      logger.warn('删除成功')
      console.log()
      resolve()
    }, 0)
  })
}

function getTemplateIdByHost (host, req, res) {
  if (hostToTemplateId[host]) {
    return Promise.resolve(hostToTemplateId[host])
  }
  return loadTemplateIdByHost(host, req, res)
    .then(templateId => {
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
