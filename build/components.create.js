'use strict'
var path = require('path')
var fs = require('fs')
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
  return packagesPathFilter()
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
function packagesPathFilter () {
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
        if (!(name && isString(name) && name.substr)) {
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
function listsWrite (listsComponentsJs, listsComponentsJson) {
  return Promise.all([
    writeTextFile((components + '.js'), listsComponentsJs),
    writeTextFile((components + '.json'), listsComponentsJson)
  ])
}
// 获取
function getComponentsText (names) {
  return new Promise(function (resolve, reject) {
    var listsComponentsJs = ''
    var listsComponentsJson = ''
    var listsComponentsJsExportArray = []
    var listsComponentsJsImport = ''
    var listsComponentsJsonObj = Object.create(null)
    names && names.forEach && names.forEach(function (name) {
      if (!(name && isString(name))) {
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
      if (isNumber(name)) {
        console.error('The name can not be purely, name:' + nameSource)
        return
      }
      var nameUpperCase = middlelineToUpperCase(name)
      listsComponentsJsImport += '\nimport ' + nameUpperCase + ' from \'../packages/' + name + '\''
      listsComponentsJsExportArray.push('  ' + nameUpperCase)
      listsComponentsJsonObj[name] = './packages/' + name
    })
    listsComponentsJs = listsComponentsJsImport + '\n\nexport {\n' + listsComponentsJsExportArray.join(',\n') + '\n}\n'
    listsComponentsJson = JSON.stringify(listsComponentsJsonObj, '', 2)
    resolve({listsComponentsJs, listsComponentsJson})
  })
}
// 写文本文件
function writeTextFile (path, text) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, text, function (err) {
      err ? reject(err) : resolve()
      path = text = resolve = reject = void 0
    })
  })
}
// 中杠转驼峰
function middlelineToUpperCase (str) {
  return str.toString().replace(/(-[a-zA-Z0-9]{1})/g, function (a) { return (a.substr(1) || '').toUpperCase() })
}
// 判断是否为数组
function isArray () {
  return Array.isArray.apply(this, arguments)
}
// 判断是否为数字
function isNumber (obj) {
  return (typeof obj === 'string' || typeof obj === 'number') && (!isArray(obj) && (obj - parseFloat(obj) >= 0))
}
function isString (str) {
  return typeof name === typeof ''
}
