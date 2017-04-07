import adminHeader from '../packages/adminHeader'
/* istanbul ignore next */
adminHeader.install = function (Vue) {
  Vue.component(adminHeader.name, adminHeader)
}

export {
  adminHeader
}
export default {
  adminHeader
}
