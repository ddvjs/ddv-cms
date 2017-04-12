const config = require('./build/webpack.base.js')
const entryComponents = {
  'admin-breadcrumb': './packages/admin-breadcrumb',
  'admin-header': './packages/admin-header',
  'admin-sidebar': './packages/admin-sidebar'
}
const entryStyle = {
  'admin/base': ['./style/admin/base.css'],
  'admin/colors': ['./style/admin/colors.css'],
  'admin/components': ['./style/admin/components.scss'],
  'admin/core': ['./style/admin/core.scss'],
  'wap/base': ['./style/wap/base.scss']
}
Object.assign(config.entry, entryStyle, entryComponents)
module.exports = config
