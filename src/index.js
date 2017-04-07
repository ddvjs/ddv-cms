import adminHeader from '../packages/adminHeader'
/* istanbul ignore next */
adminHeader.install = function (Vue) {
  Vue.component(adminHeader.name, adminHeader)
}

const eps = {
  adminHeader
}
export {...eps}
export default eps
