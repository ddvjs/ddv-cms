const webpack = require('webpack')
const program = require('commander')
const config = require('./webpack.base.js')
const logger = require('../util/logger')
let compiler
console.log(444)
// production
compiler = webpack(config)
// Hack: remove extract-text-webpack-plugin log
const cleanStats = function (stats) {
  stats.compilation.children = stats.compilation.children.filter(child =>
    !/extract-text-webpack-plugin|html-webpack-plugin/.test(child.name)
  )
}
/*compiler.plugin('done', stats => {
  cleanStats(stats)
  console.log('完成')
})
compiler.run(function (err, stats) {
  if (err) {
    logger.fatal(err)
  }

  var config = {
    colors: true,
    progress: true,
    chunks: false,
    hash: false,
    version: false
  }
  if (stats.hasErrors()) {
    logger.fatal(stats.toString(config))
  }

  logger.success('info\n' + stats.toString(config))
})*/

logger.log('Loading...')
compiler.watch({}, (err, stats) => {
  if (err) {
    return logger.error(err)
  }

  var config = {
    colors: true,
    progress: true,
    chunks: false,
    hash: false,
    version: false
  }
  logger.log('webpack info \n' + stats.toString(config))
  //stats = stats.toJson()
  //stats.errors.forEach(err => console.error(err))
  //stats.warnings.forEach(err => console.warn(err))
})