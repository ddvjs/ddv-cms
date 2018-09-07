const lists = []

module.exports = CacheTemp

function CacheTemp () {
  Object.defineProperty(this, 'value', {
    get () {
      return lists
    }
  })
}

CacheTemp.prototype.add = function (data, opts) {
  let params = {
    isEnumerate: false,
    type: 'push'
  }

  if (typeof opts === 'boolean') {
    params.isEnumerate = opts
  } else if (typeof opts === 'object' && !Array.isArray(opts)) {
    params.isEnumerate = opts.isEnumerate
    params.type = opts.type === 'unshift' ? opts.type : 'push'
  }

  if (params.isEnumerate) {
    for (let key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        lists[params.type](data[key])
      }
    }
  } else {
    lists[params.type](data)
  }
}

CacheTemp.prototype.remove = function (index, num) {
  num = num || 1
  lists.splice(index, num)
}

CacheTemp.prototype.clean = function () {
  this.remove(0, lists.length)
}
