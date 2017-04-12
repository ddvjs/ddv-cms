var fs = require('fs')
module.exports = {
  isString,
  isNumber,
  isArray,
  middlelineToUpperCase,
  writeTextFile
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
  return typeof str === typeof ''
}
