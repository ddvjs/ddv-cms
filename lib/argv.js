module.exports = Object.create(null)
const argv = module.exports
const fs = require('fs')
const path = require('path')
const parseArgs = require('minimist')
const defaultCommand = 'dev'
const commands = new Set([
  'vhost',
  'start',
  'ddvstart',
  'dev',
  'ddvdev',
  'build',
  'generate',
  'vueutil'
])

var argvInput, argvInputCli, argvParse, configFileName
try {
  argvInputCli = process.argv.slice(2)
} catch (e) {}
try {
  argvInput = JSON.parse((process && process.env && process.env.npm_config_argv) || '')
  argvInput = argvInput && argvInput.original
  if (argvInput[0] === 'run') {
    argvInput.splice(0, 1)
  }
} catch (e) {}
if (!argvInput) {
  argvInput = argvInputCli
}

argvInput = Array.isArray(argvInput) ? argvInput : []

if (argvInputCli && argvInputCli.length > 0) {
  if (commands.has(argvInputCli[0] || '')) {
    argvInput[0] = argvInputCli[0]
  }
}
if (argvInputCli) {
  if (argvInputCli.indexOf('-A') > -1 || argvInputCli.indexOf('--is-argv') > -1) {
    argvInput = argvInputCli
  }
}

argvParse = parseArgs(argvInput, {
  alias: {
    h: 'help',
    H: 'hostname',
    A: 'is-argv',
    a: 'analyze',
    p: 'port',
    c: 'config-file',
    t: 'template'
  },
  boolean: ['A', 'a', 'h'],
  string: ['H', 'c'],
  default: {
    p: process.env.PORT || 3000,
    c: 'nuxt.config.js',
    t: '--all'
  },
  '--': true
})

'help hostname analyze port is-argv template --'.split(' ').forEach(key => {
  if (typeof argvParse[key] !== 'undefined') {
    argv[key] = argvParse[key]
  }
})

if (argvParse._ && commands.has(argvParse._[0])) {
  argv.cmd = argvParse._.splice(0, 1)[0]
} else {
  argv.cmd = defaultCommand
}

if (argv.cmd === 'build' || argv.cmd === 'generate' || argv.cmd === 'vhost' || argv.cmd === 'start' || argv.cmd === 'ddvstart') {
  argv.dev = false // Create production build when calling `nuxt build`
} else {
  argv.dev = true
}

// 调试模式
process.env.NODE_ENV = argv.dev ? 'development' : 'production'

argv.rootDir = path.resolve('.', (argvParse._ && typeof argvParse._[0] === 'string' ? argvParse._[0] : './'))
argv.rootDir = fs.existsSync(argv.rootDir) ? argv.rootDir : path.resolve('.', './')

configFileName = argvParse['config-file']

// 尝试获取配置文件地址
argv.configFile = path.resolve(argv.rootDir, configFileName)
if (!fs.existsSync(argv.configFile) && configFileName !== 'site.config.js') {
  configFileName = 'site.config.js'
  // 再次参数获取
  argv.configFile = path.resolve(argv.rootDir, configFileName)
}
if (!fs.existsSync(argv.configFile) && configFileName !== 'nuxt.config.js') {
  // 再次参数获取
  argv.configFile = path.resolve(argv.rootDir, 'nuxt.config.js')
}

argvInput = argvParse = configFileName = void 0

if (argv.help) {
  console.log(`
    Description
      Starts the application in production mode.
      The application should be compiled with \`ddv-cms build\` first.
    Usage
      $ ddv-cms start <dir> -p <port number> -H <hostname>
    Options
      --port, -p          A port number on which to start the application
      --hostname, -H      Hostname on which to start the application
      --config-file, -c   Path to Nuxt.js config file (default: nuxt.config.js)
      --help, -h          Displays this message
      --analyze, -a       analyze
      --template, -t      Build a specific template name for vhost (default all template)
  `)
  process.exit(0)
}
