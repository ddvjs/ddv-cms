'use strict'

module.exports = each

function each (objs, fn) {
  var key
  for (key in objs) {
    fn(objs[key], key, objs)
    key = void 0
  }
  key = objs = fn = void 0
}
