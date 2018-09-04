module.exports = getOptions
const fs = require('fs')
const logger = require('./logger')

function getOptions (configFile) {
  var options = {}
  if (fs.existsSync(configFile)) {
    options = require(configFile)
  } else {
    logger.log(`Could not locate ${configFile}`) // eslint-disable-line no-console
  } // 引入配置信息-Import and Set Nuxt.js options

  options.build = options.build || {}

  options.dev = false
  options.rootDir = typeof options.rootDir === 'string' ? options.rootDir : (getOptions.rootDir || '')
  return Promise.resolve(options)
}
