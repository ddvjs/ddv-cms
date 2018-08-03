const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const logger = require('./logger')
const { format, URL } = require('url')

module.exports = function (config) {
  return config.getConfig().then(({ vueutilConfig }) => {
    const url = new URL(vueutilConfig.url)
    const gitUrl = format({
      protocol: url.protocol,
      auth: vueutilConfig.auth.username + ':' + vueutilConfig.auth.password,
      hostname: url.hostname,
      pathname: url.pathname
    })
    const folderName = vueutilConfig.folderName || getFolderName(url.pathname)

    if (folderName) {
      const projectPath = path.resolve('./', folderName)
      return checkFile(projectPath)
        .then(_ => {
          // 找到文件，尝试拉取更新
          console.log('the project has been found, try to pull the update')
          return shell('git', ['pull'], {
            cwd: projectPath
          })
        })
        .catch(_ => {
          // 没找到文件
          console.log(`start to clone ${folderName}...`)
          return shell('git', ['clone', gitUrl, folderName])
        })
    } else {
      return Promise.reject(new Error('project name is wrong'))
    }
  })
}

function checkFile (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err || !stats.isDirectory()) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function getFolderName (path) {
  if (typeof path === 'string') {
    var strList = path.split('.git')[0].split('/')
    return strList[strList.length - 1]
  } else {
    logger.error('the path is not a string')
    return null
  }
}

function shell (cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    var ls = spawn(cmd, args, opts)
    ls.stdout.on('data', data => {
      logger.log(`${data}`)
    })

    ls.stderr.on('data', data => {
      logger.error(`${data}`)
    })

    ls.on('close', code => {
      logger.log('child_process exit')
      if (code === 0 || code === '0') {
        ls = void 0
        resolve()
      }
    })
  })
}
