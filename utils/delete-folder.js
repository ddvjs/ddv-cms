const fs = require('fs')
module.exports = deleteFolder

function deleteFolder (path) {
  var files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(file => {
      var curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}
