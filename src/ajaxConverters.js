function parseJS(code) {
    var indirect = eval
    code = code.trim()
    if (code) {
        if (code.indexOf("use strict") === 1) {
            var script = document.createElement("script")
            script.text = code
            head.appendChild(script).parentNode.removeChild(script)
        } else {
            indirect(code)
        }
    }
}
var head = require('./head')

avalon.ajaxConverters = {//转换器，返回用户想要做的数据
    text: function(text) {
        // return text || "";
        return text
    },
    xml: function(text, xml) {
        return xml !== void 0 ? xml : avalon.parseXML(text)
    },
    html: function(text) {
        return avalon.parseHTML(text)  //一个文档碎片,方便直接插入DOM树
    },
    json: function(text) {
        return avalon.parseJSON(text)
    },
    script: function(text) {
        parseJS(text)
        return text
    },
    jsonp: function() {
        var json, callbackName
        if (this.jsonpCallback.startsWith('avalon.')) {
            callbackName = this.jsonpCallback.replace(/avalon\./,'')
            json = avalon[callbackName]
            delete avalon[callbackName]
        } else {
            json = window[this.jsonpCallback]
        }
        return json
    }
}

