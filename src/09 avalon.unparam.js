//将一个字符串转换为对象
function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch (e) {
        return value
    }
}


//a%5B0%5D%5Bvalue%5D a%5B1%5D%5B%5D
function addSubObject(host, text, value) {
    var match = text.match(r5b5d)
    if (!match) {
        return true
    }

    var steps = []
    var first = true
    var step, index, key
    while (index = text.lastIndexOf("%5B")) {
        if (index === -1) {
            break
        }
        key = text.slice(index).slice(3, -3)
        text = text.slice(0, index)
        if (key === "") {
            steps.unshift({
                action: "pushArrayElement"
            })
        } else if ((key >>> 0) + "" === key) {
            steps.unshift({
                action: "setSubArray",
                value: key
            })
        } else {
            if (first) {
                steps.unshift({
                    action: "setObjectProperty",
                    value: tryDecodeURIComponent(key)
                })
            } else {
                steps.unshift({
                    action: "setSubObjet",
                    value: tryDecodeURIComponent(key)
                })
            }
        }
        first = false
    }
    first = true
    while (step = steps.shift()) {
        var isObject = /Object/.test(step.action)
        if (first) {
            if (!(text in host)) {
                host[text] = isObject ? {} : []
            }
            first = false
            host = host[text]
        }
        switch (step.action) {
            case "pushArrayElement":
                host.push(value)
                break
            case "setObjectProperty":
                host[step.value] = value
                break
            case "setSubObjet":
                if (!(step.value in host)) {
                    host[step.value] = {}
                }
                host = host[step.value]
                break
            case "setSubArray":
                if (!(step.value in host)) {
                    host[step.value] = []
                }
                host = host[step.value]
                break
        }
    }
}
//  function add
avalon.unparam = function(qs, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
    if ((typeof qs !== "string") || qs.length === 0) {
        return obj;
    }
    if(qs.indexOf("?") !== -1){
        qs = qs.split("?").pop()
    }
    var array = qs.split(sep);
    for (var i = 0, el; el = array[i++]; ) {
        var arr = el.split("=")
        if (arr.length === 1) {//处理只有键名没键值的情况
            obj[arr[0]] = ""
        } else {
            var key = arr[0].replace(radd, '%20')
            var v = tryDecodeURIComponent(arr.slice(1).join("=").replace(radd, ' '));
            if (addSubObject(obj, key, v)) { //处理存在中括号的情况
                var k = tryDecodeURIComponent(key) //处理不存在中括号的简单的情况
                if (!Object.prototype.hasOwnProperty.call(obj, k)) {
                    obj[k] = v;
                } else if (Array.isArray(obj[k])) {
                    obj[k].push(v);
                } else {
                    obj[k] = [obj[k], v];
                }
            }
        }
    }

    return obj
}