'use strict'

var components = require('./components')
var each = require('./each')
// 让每个模块支持安装
each(components, function (component, key) {
  if (typeof component !== 'object') {
    return
  }
  component.install = typeof component.install === 'function' ? component.install : function VueUseInstall (Vue) {
    component.name = component.name || key
    Vue.component(component.name, component)
  }
})

// 全局安装
components.install = function VueUseInstall (Vue, opts) {
  opts = opts || {}
  /* istanbul ignore if */
  if (components.install.installed) return

  each(components, function (component) {
    // 安装每一个模块
    component.install(Vue, opts)
  })
}
// 撮合必要数据
Object.assign(components, {

})
// 直接require引入
module.exports = Object.create(components)
// 默认导出
module.exports['default'] = components
