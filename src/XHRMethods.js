/**
 * 伪XMLHttpRequest类,用于屏蔽浏览器差异性
 * var ajax = new(self.XMLHttpRequest||ActiveXObject)("Microsoft.XMLHTTP")
 * ajax.onreadystatechange = function(){
 *   if (ajax.readyState==4 && ajax.status==200){
 *        alert(ajax.responseText)
 *   }
 * }
 * ajax.open("POST", url, true) 
 * ajax.send("key=val&key1=val2") 
 */
var rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg

var XHRMethods = {
    setRequestHeader: function (name, value) {
        this.requestHeaders[name] = value
        return this
    },
    getAllResponseHeaders: function () {
        return this.readyState === 4 ? this.responseHeadersString : null
    },
    getResponseHeader: function (name, match) {
        if (this.readyState === 4) {
            while ((match = rheaders.exec(this.responseHeadersString))) {
                this.responseHeaders[match[1]] = match[2]
            }
            match = this.responseHeaders[name]
        }
        return match === undefined ? null : match
    },
    overrideMimeType: function (type) {
        this.mimeType = type
        return this
    },
    // 中止请求
    abort: function (statusText) {
        statusText = statusText || "abort"
        if (this.transport) {
            this.respond(0, statusText)
        }
        return this
    },
    /**
     * 用于派发success,error,complete等回调
     * http://www.cnblogs.com/rubylouvre/archive/2011/05/18/2049989.html
     * @param {Number} status 状态码
     * @param {String} statusText 对应的扼要描述
     */
    dispatch: function (status, nativeStatusText) {
        var statusText = nativeStatusText
        // 只能执行一次，防止重复执行
        if (!this.transport) { //2:已执行回调
            return
        }
        this.readyState = 4
        var isSuccess = status >= 200 && status < 300 || status === 304
        if (isSuccess) {
            if (status === 204) {
                statusText = "nocontent"
            } else if (status === 304) {
                statusText = "notmodified"
            } else {
                //如果浏览器能直接返回转换好的数据就最好不过,否则需要手动转换
                if (typeof this.response === "undefined") {
                    var dataType = this.options.dataType || this.options.mimeType
                    if (!dataType && this.responseText || this.responseXML) { //如果没有指定dataType，则根据mimeType或Content-Type进行揣测
                        dataType = this.getResponseHeader("Content-Type") || ""
                        dataType = dataType.match(/json|xml|script|html/i) || ["text"]
                        dataType = dataType[0].toLowerCase()
                    }
                    var responseText = this.responseText || '',
                            responseXML = this.responseXML || ''
                    try {
                        this.response = avalon.ajaxConverters[dataType].call(this, responseText, responseXML)
                    } catch (e) {
                        isSuccess = false
                        this.error = e
                        statusText = "parsererror"
                    }
                }
            }
        }
        this.status = status
        this.statusText = statusText + ""
        if (this.timeoutID) {
            clearTimeout(this.timeoutID)
            delete this.timeoutID
        }
        this._transport = this.transport

        /**
         * global event handler
         */
        var that = this

        // 到这要么成功，调用success, 要么失败，调用 error, 最终都会调用 complete
        if (isSuccess) {
            this._resolve([this.response, statusText, this])
            /**
             * global event handler
             */
            window.setTimeout(function() {
                avalon.ajaxGlobalEvents.success(that, that.options, that.response)
            }, 0)
        } else {
            this._reject([this, statusText, this.error])
            /**
             * global event handler
             */
            window.setTimeout(function() {
                avalon.ajaxGlobalEvents.error(that, that.options, statusText)
            }, 0)
        }
        delete this.transport

        /**
         * global event handler
         */
        avalon.ajax.activeIndex --
        
        window.setTimeout(function() {
            avalon.ajaxGlobalEvents.complete(that, that.options)
        }, 0)
        
        if (avalon.ajax.activeIndex === 0) {
            // 最后一个
            window.setTimeout(function() {
                avalon.ajaxGlobalEvents.stop()
            }, 0)
        }

    }
}

module.exports = XHRMethods