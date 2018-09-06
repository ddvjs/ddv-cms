const { spawn } = require('child_process')
const logger = require('../lib/logger')
module.exports = getLog

function getLog (cwd) {
  return new Promise((resolve, reject) => {
    var ls = spawn('git', ['log', '--max-count', '1'], {
      cwd
    })
    ls.stdout.on('data', data => {
      if (typeof data === 'object') {
        data = data.toString()
      }
      resolve(data.split(/[\s(\r\n)\r\n]/)[1])
    })

    ls.stderr.on('data', data => {
      logger.error(`error used command 'git log --max-count 1' in ${cwd} -- ${data}`)
      resolve('')
    })

    ls.on('close', code => {
      if (code === 0 || code === '0') {
        ls = void 0
        resolve()
      }
    })
  })
}
