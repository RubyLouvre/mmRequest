var ie = require('./ie')
var ret = false
if (ie >= 9) {
    var xhr = new XMLHttpRequest()
    ret = typeof xhr.withCredentials === 'boolean'
}

module.exports = ret
 