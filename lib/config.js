'use strict'
module.exports = config
const chokidar = require('chokidar')
const getOptions = require('./getOptions')
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
    .then(function getConfigCb (options) {
      options.dev = argv.dev
      options.build.analyze = argv.analyze || options.build.analyze
      process.env.NODE_ENV = options.dev ? 'development' : 'production'
      return options
    })
}
function getConfig () {
  getConfig.rootDir = getConfig.rootDir || config.argv.rootDir
  return getOptions(config.configFile)
    .then(function getConfigCb (options) {
      options.rootDir = typeof options.rootDir === 'string' ? options.rootDir : config.argv.rootDir
      return options
    })
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
