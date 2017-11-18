'use strict'

const getOptions = require('./getOptions')
const app = require('express')()
const worker = require('ddv-worker')
const http = require('http')
const path = require('path')
const {Nuxt} = require('nuxt')
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

  getTemplateIdByHost(host)
    .then(templateId => {
      getNuxtRender(templateId)
        .then(render => {
          render.apply(this, arguments)
        })
    })
    .catch(e => {
      res.end('错误:' + e.message)
    })
}
// 获取编译器的方法
function getNuxtRender (templateId) {
  if (nuxts[templateId]) {
    return Promise.resolve(nuxts[templateId])
  } else {
    return createNuxtRender(templateId)
      .then(nuxtRender => {
        nuxts[templateId] = nuxtRender
        return nuxts[templateId]
      })
  }
}
// 创建编译器的方法
function createNuxtRender (templateId) {
  return getTemplateInfo(templateId)
    .then(info => {
      return getOptions(info.configFile)
        .then(options => {
          options.rootDir = options.rootDir || info.rootDir
          return options
        })
    })
    .then(options => {
      let nuxt = new Nuxt(options)
      return nuxt.render
    })
}
// 获取模板信息
function getTemplateInfo (templateId) {
  if (!templates[templateId]) {
    return Promise.reject(new Error('template not find'))
  }
  return Promise.resolve(templates[templateId])
}

function getTemplateIdByHost (host) {
  if (!hostToTemplateId[host]) {
    return loadTemplateIdByHost(host)
  }
  return Promise.resolve(hostToTemplateId[host])
}
function loadTemplateIdByHost (host) {
  console.log('host', host)
  // return Promise.reject(new Error('host not find'))
  if (host == '127.0.0.1') {
    return Promise.resolve('1')
  } else {
    return Promise.resolve('2')
  }
}
function loadTemplate () {
  console.log('vhostOptions', vhostOptions)

  templates['1'] = {
    templateId: '1',
    configFile: path.resolve(vhostOptions.rootTemplateDir, 'auto-make-station-xibing-cdn/nuxt.config.js'),
    rootDir: path.resolve(vhostOptions.rootTemplateDir, 'auto-make-station-xibing-cdn')

  }
  templates['2'] = {
    templateId: '2',
    configFile: path.resolve(vhostOptions.rootTemplateDir, 'auto-make-station-futong-cdn/nuxt.config.js'),
    rootDir: path.resolve(vhostOptions.rootTemplateDir, 'auto-make-station-futong-cdn')

  }
  console.log('templates', templates)
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
    })
    .then(() => {
      loadTemplate()
    })
}
