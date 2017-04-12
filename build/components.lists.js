'use strict'
var path = require('path')
var fs = require('fs')
var util = require('./util.js')
var runTimer = null
var packagesPath = path.resolve(__dirname, '../packages')
var components = path.resolve(__dirname, '../src/components')
var isWatch = (process.argv[1] && process.argv[1].indexOf('watch') > -1) || false
var isComponentsCreate = (process.argv && process.argv.indexOf('componentscreate') > -1) || false
if (isWatch) {
  fs.watch(packagesPath, function (e, name) {
    clearRunTimer()
    runTimer = setTimeout(function () {
      clearRunTimer()
      componentsCreate()
    }, 100)
  })
} else if (isComponentsCreate) {
  console.log('Create the Components list to begin')
  componentsCreate()
  .then(function () {
    console.log('Create the Components list to complete')
  })
}
function reloadComponentsLists () {
  console.log('配置文件也改变，请重启')
}
// 创建
function componentsCreate () {
  return
  return getPackagesListsByPath(packagesPath)
  .then(function (names) {
    return getComponentsText(names)
  })
  .then(function ({listsComponentsJs, listsComponentsJson}) {
    return listsWrite(listsComponentsJs, listsComponentsJson)
  }).then(function () {
    if (isWatch) {
      return reloadComponentsLists()
    }
  }).catch(function (e) {
    console.error('Read components directory list error')
    console.error(e)
  })
}
// 清理定时器
function clearRunTimer () {
  if (runTimer) {
    clearTimeout(runTimer)
    runTimer = null
  }
}
function listsWrite (listsComponentsJs, listsComponentsJson) {
  return Promise.all([
    util.writeTextFile((components + '.js'), listsComponentsJs),
    util.writeTextFile((components + '.json'), listsComponentsJson)
  ])
}
// 获取
function getComponentsLists (names) {
  var entryComponents = Object.create(null)
  if (!(names && Array.isArray(names) && names.length > 0)) {

  }
  return new Promise(function (resolve, reject) {
    var listsComponentsJs = ''
    var listsComponentsJsExportArray = []
    var listsComponentsJsImport = ''
    var entryComponents = Object.create(null)
    names && names.forEach && names.forEach(function (name) {
      if (!(name && util.isString(name))) {
        return
      }
      var nameSource = name
      var namePointIndex = name.indexOf('.')
      if (namePointIndex > -1) {
        if (name.split('.') > 2) {
          console.error('Skip the file package, please replace the file name:' + nameSource)
          return
        } else {
          name = name.substr(0, namePointIndex)
        }
      }
      if (util.isNumber(name)) {
        console.error('The name can not be purely, name:' + nameSource)
        return
      }
      var nameUpperCase = util.middlelineToUpperCase(name)
      listsComponentsJsImport += '\nimport ' + nameUpperCase + ' from \'../packages/' + name + '\''
      listsComponentsJsExportArray.push('  ' + nameUpperCase)
      entryComponents[name] = './packages/' + name
    })
    listsComponentsJs = listsComponentsJsImport + '\n\nexport {\n' + listsComponentsJsExportArray.join(',\n') + '\n}\n'
    resolve({listsComponentsJs, entryComponents})
  })
}
// 通过地址获取packages列表
function getPackagesListsByPath (packagesPath) {
  return new Promise(function (resolve, reject) {
    var names
    fs.readdir(packagesPath, function (err, files) {
      if (err) {
        reject(err)
        return false
      }
      names = []
      files.forEach(function (name) {
        // 排除空或者不是字符串
        if (!(name && util.isString(name) && name.substr)) {
          return
        }
        // 排除一点开头的
        if (name.substr(0, 1) === '.') {
          return
        }
        // 插入数组
        names.push(name)
      })

      resolve(names)
    })
  })
}

module.exports = {
  getComponentsLists,
  getPackagesListsByPath
}
