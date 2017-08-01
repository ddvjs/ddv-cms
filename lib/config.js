'use strict'
module.exports = config
const fs = require('fs')
const chokidar = require('chokidar')
const logger = require('./logger')
const onChanges = []
const timers = []
var isWatch = false

Object.assign(config, {
  onChange,
  getConfig,
  setArgv,
  setConfigFile,
  checkConfigFile
})

function config (configFile, argv) {
  setConfigFile(configFile)
  setArgv(argv)
  return getConfig()
}
function getConfig () {
  var options = {}
  if (fs.existsSync(config.configFile)) {
    options = require(config.configFile)
  } else {
    logger.log(`Could not locate ${config.configFile}`) // eslint-disable-line no-console
  }// 引入配置信息-Import and Set Nuxt.js options

  options.build = options.build || {}
  if (config.argv.analyze) {
    options.build.analyze = config.argv['analyze']
  }

  options.dev = config.argv.dev
  options.rootDir = typeof options.rootDir === 'string' ? options.rootDir : config.argv.rootDir
  return Promise.resolve(options)
}
function setConfigFile (file) {
  config.configFile = file
}
function setArgv (argv) {
  config.argv = argv
}
function checkConfigFile (isSetTimeout) {
  if (!isSetTimeout) {
    timers.forEach(t => clearTimeout(t))
    timers.push(setTimeout(() => {
      checkConfigFile(true)
    }, 10))
    return
  }
  getConfig()
    .then(options => {
      onChanges.forEach(fn => {
        typeof fn === 'function' && fn(options)
      })
      options = void 0
    })
}
function onChange (fn) {
  if (typeof fn === 'function') {
    onChanges.push(fn)
    isWatch || watchConfigFile()
  }
}
function watchConfigFile () {
  if (isWatch) {
    return
  }
  isWatch = true
  chokidar
    .watch(config.configFile, { ignoreInitial: true })
    .on('all', function () {
      // 重新创建编译器
      checkConfigFile()
    })
}
