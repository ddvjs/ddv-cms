import adminHeader from '../packages/adminHeader'
import adminBreadcrumb from '../packages/adminBreadcrumb'
import adminSidebar from '../packages/adminSidebar'
/* istanbul ignore next */
adminHeader.install = function (Vue) {
  Vue.component(adminHeader.name, adminHeader)
}

adminBreadcrumb.install = function (Vue) {
  Vue.component(adminBreadcrumb.name, adminBreadcrumb)
}

adminSidebar.install = function (Vue) {
  Vue.component(adminSidebar.name, adminSidebar)
}

export {
  adminHeader,
  adminBreadcrumb,
  adminSidebar
}
export default {
  adminHeader,
  adminBreadcrumb,
  adminSidebar
}
