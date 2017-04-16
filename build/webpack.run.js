'use strict'

const path = require('path')
const webpack = require('webpack')
const config = require('./webpack.base.js')
const logger = require('./logger')
const util = require('./util.js')
const componentsLists = require('./components.lists.js')
const componentsPath = path.resolve(__dirname, '../components')
const importComponentsPath = path.resolve(__dirname, '../src/components.js')
const entry = Object.create(null)
entry.style = Object.create(null)
entry.components = Object.create(null)
entry.base = config.entry || Object.create(null)
let compiler, compilerWatch, isDev
isDev = process.argv.indexOf('build') === -1
logger.log('Loading...')
logger.log('isDev : ' + (isDev ? 'true' : 'false'))
const entryStyle22 = {
  'admin/base': ['./style/admin/base.css'],
  'admin/colors': ['./style/admin/colors.css'],
  'admin/components': ['./style/admin/components.scss'],
  'admin/core': ['./style/admin/core.scss'],
  'wap/base': ['./style/wap/base.scss']
}
// Hack: remove extract-text-webpack-plugin log
const cleanStats = function (stats) {
  stats.compilation.children = stats.compilation.children.filter(child =>
    !/extract-text-webpack-plugin|html-webpack-plugin/.test(child.name)
  )
}
process.env.NODE_ENV = isDev ? 'development' : 'production'
if (isDev) {
  componentsLists.watchComponentsPath(componentsPath, function (res) {
    componentsListsSave(res).then(() => watchChangeDev())
  })
  // 初始化一次
  watchChangeDev()
} else {
  // production
  getEntry()
  .then(entry => {
    config.entry = entry
    compiler = webpack(config)
    compiler.plugin('done', stats => {
      cleanStats(stats)
      logger.success('完成')
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
    })
  })
  .catch(err => {
    console.log(err)
  })
}
function watchChangeDev () {
  new Promise(function (resolve, reject) {
    if (compilerWatch && compilerWatch.close) {
      // 关闭原有的webpack 监听
      logger.log('webpack watch closeing...')
      compilerWatch.close(function () {
        logger.log('webpack watch close success')
        resolve()
      })
    } else {
      resolve()
    }
  })
  .then(function () {
    return getEntry()
  })
  .then(function (entry) {
    // 获取入口列表
    config.entry = entry
    console.log('config.entry', config.entry)
    logger.log('webpack watch runing...')
    // 实例化webpack
    compiler = webpack(config)

    compiler.plugin('done', stats => {
      cleanStats(stats)
      console.log('完成')
    })
    compilerWatch = compiler.watch({}, (err, stats) => {
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
      // stats = stats.toJson()
      // stats.errors.forEach(err => console.error(err))
      // stats.warnings.forEach(err => console.warn(err))
    })
  })
}
// 获取入口列表
function getEntry (entryStyleInput, entryComponentsInput) {
  logger.log('webpack config.entry geting...')
  return Promise.all([
    Promise.resolve(entry.base),
    new Promise(function (resolve, reject) {
      var res = entryStyleInput || entry.style
      if ((!res) || util.isEmptyObject(res)) {
        Promise.resolve(entryStyle22)
        .then(resolve, reject)
        entry.style = entryStyle22
      } else {
        resolve(res)
      }
      resolve = reject = res = void 0
    }),
    new Promise(function (resolve, reject) {
      var res = entryComponentsInput || entry.components
      if ((!res) || util.isEmptyObject(res)) {
        componentsLists
        .getComponentsListsByPath(componentsPath)
        .then(componentsListsSave)
        .then(() => (entry.components))
        .then(resolve, reject)
      } else {
        resolve(res)
      }
      resolve = reject = res = void 0
    })
  ])
  .then(([base, style, components]) => {
    logger.log('webpack config.entry success')
    return Object.assign(Object.create(null), base, style, components)
  })
}
function componentsListsSave ({importComponents, entryComponents, errorNames}) {
  errorNames && errorNames.length > 0 && logger.error('errorNames', errorNames)
  entry.components = entryComponents
  return util.writeTextFile(importComponentsPath, importComponents)
}
