//=========================================
//  数据交互模块 by 司徒正美
//  版本: 1.0.0
//  最近更新: 2015/4/30
//==========================================
define("mmRequest", ["avalon", "mmPromise"], function(avalon) {
    var global = this || (0, eval)("this")
    var DOC = global.document
    var encode = encodeURIComponent
    var decode = decodeURIComponent

    var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/
    var rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg
    var rnoContent = /^(?:GET|HEAD)$/
    var rprotocol = /^\/\//
    var rhash = /#.*$/
    var rquery = /\?/
    var rjsonp = /(=)\?(?=&|$)|\?\?/
    var r20 = /%20/g
    var radd = /\+/g
    var r5b5d = /%5B(.*?)%5D$/

    var originAnchor = document.createElement("a")
    originAnchor.href = location.href
    //告诉WEB服务器自己接受什么介质类型，*/* 表示任何类型，type/* 表示该类型下的所有子类型，type/sub-type。
    var accepts = {
        xml: "application/xml, text/xml",
        html: "text/html",
        text: "text/plain",
        json: "application/json, text/javascript",
        script: "text/javascript, application/javascript",
        "*": ["*/"] + ["*"] //避免被压缩掉
    }

    function IE() {
        if (window.VBArray) {
            var mode = document.documentMode
            return mode ? mode : window.XMLHttpRequest ? 7 : 6
        } else {
            return 0
        }
    }
    var useOnload = IE() === 0 || IE() > 8

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

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0
            return this.lastIndexOf(searchString, position) === position
        }
    }

    var head = DOC.head //HEAD元素
    var isLocal = rlocalProtocol.test(location.protocol)
    avalon.xhr = function() {
        return new XMLHttpRequest
    }
    var supportCors = "withCredentials" in avalon.xhr()
    function parseXML(data, xml, tmp) {
        var xml
        if (!data || typeof data !== "string") {
            return null
        }
        // Support: IE9
        try {
            xml = (new DOMParser()).parseFromString(data, "text/xml")
        } catch (e) {
            xml = undefined
        }

        if (!xml || xml.getElementsByTagName("parsererror").length) {
            avalon.error("Invalid XML: " + data)
        }
        return xml
    }


    //ajaxExtend是一个非常重要的内部方法，负责将用法参数进行规整化
    //1. data转换为字符串
    //2. type转换为大写
    //3. url正常化，加querystring, 加时间戮
    //4. 判定有没有跨域
    //5. 添加hasContent参数
    var defaults = {
        type: "GET",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: true,
        jsonp: "callback"
    }
    function ajaxExtend(opts) {
        opts = avalon.mix({}, defaults, opts)
        opts.type = opts.type.toUpperCase()
        var querystring = typeof opts.data === "string" ? opts.data : avalon.param(opts.data)
        opts.querystring = querystring || ""
        opts.url = opts.url.replace(rhash, "").replace(rprotocol, location.protocol + "//")

        if (typeof opts.crossDomain !== "boolean") { //判定是否跨域
            var urlAnchor = document.createElement("a")
            // Support: IE6-11+
            // IE throws exception if url is malformed, e.g. http://example.com:80x/
            try {
                urlAnchor.href = opts.url
                // in IE7-, get the absolute path
                var absUrl = !"1"[0] ? urlAnchor.getAttribute("href", 4) : urlAnchor.href
                urlAnchor.href = absUrl
                opts.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host
            } catch (e) {
                opts.crossDomain = true
            }
        }
        opts.hasContent = !rnoContent.test(opts.type) //是否为post请求
        if (!opts.hasContent) {
            if (querystring) { //如果为GET请求,则参数依附于url上
                opts.url += (rquery.test(opts.url) ? "&" : "?") + querystring
            }
            if (opts.cache === false) { //添加时间截
                opts.url += (rquery.test(opts.url) ? "&" : "?") + "_time=" + (new Date() - 0)
            }
        }
        return opts
    }
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
    var XHRMethods = {
        setRequestHeader: function(name, value) {
            this.requestHeaders[name] = value
            return this
        },
        getAllResponseHeaders: function() {
            return this.readyState === 4 ? this.responseHeadersString : null
        },
        getResponseHeader: function(name, match) {
            if (this.readyState === 4) {
                while ((match = rheaders.exec(this.responseHeadersString))) {
                    this.responseHeaders[match[1]] = match[2]
                }
                match = this.responseHeaders[name]
            }
            return match === undefined ? null : match
        },
        overrideMimeType: function(type) {
            this.mimeType = type
            return this
        },
        // 中止请求
        abort: function(statusText) {
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
        dispatch: function(status, nativeStatusText) {
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
                            dataType = dataType.match(/json|xml|script|html/) || ["text"]
                            dataType = dataType[0]
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
            ajaxActive--

            window.setTimeout(function() {
                avalon.ajaxGlobalEvents.complete(that, that.options)
            }, 0)

            if (ajaxActive === 0) {
                // 最后一个
                window.setTimeout(function() {
                    avalon.ajaxGlobalEvents.stop()
                }, 0)
            }

        }
    }
    /**
     * global event handler
     */
    // 记录当前活跃的 ajax 数
    var ajaxActive = 0

    //ajax主函数
    avalon.ajax = function(opts, promise) {
        if (!opts || !opts.url) {
            avalon.error("参数必须为Object并且拥有url属性")
        }
        opts = ajaxExtend(opts) //处理用户参数，比如生成querystring, type大写化
        //创建一个伪XMLHttpRequest,能处理complete,success,error等多投事件
        var XHRProperties = {
            responseHeadersString: "",
            responseHeaders: {},
            requestHeaders: {},
            querystring: opts.querystring,
            readyState: 0,
            uniqueID: ("" + Math.random()).replace(/0\./, ""),
            status: 0
        }
        var _reject, _resolve
        var promise = new avalon.Promise(function(resolve, reject) {
            _resolve = resolve
            _reject = reject
        })

        promise.options = opts
        promise._reject = _reject
        promise._resolve = _resolve

        var doneList = [],
            failList = []

        Array("done", "fail", "always").forEach(function(method) {
            promise[method] = function(fn) {
                if (typeof fn === "function") {
                    if (method !== "fail")
                        doneList.push(fn)
                    if (method !== "done")
                        failList.push(fn)
                }
                return this
            }
        })

        var isSync = opts.async === false
        if (isSync) {
            avalon.log("warnning:与jquery1.8一样,async:false这配置已经被废弃")
            promise.async = false
        }


        avalon.mix(promise, XHRProperties, XHRMethods)

        promise.then(function(value) {
            value = Array.isArray(value) ? value : value === void 0 ? [] : [value]
            for (var i = 0, fn; fn = doneList[i++];) {
                fn.apply(promise, value)
            }
            return value
        }, function(value) {
            value = Array.isArray(value) ? value : value === void 0 ? [] : [value]
            for (var i = 0, fn; fn = failList[i++];) {
                fn.apply(promise, value)
            }
            return value
        })


        promise.done(opts.success).fail(opts.error).always(opts.complete)

        var dataType = opts.dataType //目标返回数据类型
        var transports = avalon.ajaxTransports

        if ((opts.crossDomain && !supportCors || rjsonp.test(opts.url)) && dataType === "json" && opts.type === "GET") {
            dataType = opts.dataType = "jsonp"
        }
        var name = opts.form ? "upload" : dataType
        var transport = transports[name] || transports.xhr
        avalon.mix(promise, transport) //取得传送器的request, respond, preproccess
        if (promise.preproccess) { //这用于jsonp upload传送器
            dataType = promise.preproccess() || dataType
        }
        //设置首部 1、Content-Type首部
        if (opts.contentType) {
            promise.setRequestHeader("Content-Type", opts.contentType)
        }
        //2.处理Accept首部
        promise.setRequestHeader("Accept", accepts[dataType] ? accepts[dataType] + ", */*; q=0.01" : accepts["*"])
        for (var i in opts.headers) { //3. 处理headers里面的首部
            promise.setRequestHeader(i, opts.headers[i])
        }
        // 4.处理超时
        if (opts.async && opts.timeout > 0) {
            promise.timeoutID = setTimeout(function() {
                promise.abort("timeout")
                promise.dispatch(0, "timeout")
            }, opts.timeout)
        }

        /**
         * global event handler
         */
        if (ajaxActive === 0) {
            // 第一个
            avalon.ajaxGlobalEvents.start()
        }
        avalon.ajaxGlobalEvents.send(promise, opts)
        ajaxActive++



        promise.request()
        return promise
    }
    "get,post".replace(avalon.rword, function(method) {
        avalon[method] = function(url, data, callback, type) {
            if (typeof data === "function") {
                type = type || callback
                callback = data
                data = void 0
            }
            return avalon.ajax({
                type: method,
                url: url,
                data: data,
                success: callback,
                dataType: type
            })
        }
    })
    function ok(val) {
        return val
    }
    function ng(e) {
        throw e
    }
    avalon.getScript = function(url, callback) {
        return avalon.get(url, null, callback, "script")
    }
    avalon.getJSON = function(url, data, callback) {
        return avalon.get(url, data, callback, "json")
    }
    avalon.upload = function(url, form, data, callback, dataType) {
        if (typeof data === "function") {
            dataType = callback
            callback = data
            data = void 0
        }
        return avalon.ajax({
            url: url,
            type: "post",
            dataType: dataType,
            form: form,
            data: data,
            success: callback
        })
    }


    /**
     * global event handler
     */
    avalon.ajaxGlobalEvents = {}

    ;["start", "stop", "complete", "error", "success", "send"].forEach(function(method) {
        avalon.ajaxGlobalEvents[method] = avalon.noop
    })

    avalon.ajaxConverters = { //转换器，返回用户想要做的数据
        text: function(text) {
            // return text || "";
            return text
        },
        xml: function(text, xml) {
            return xml !== void 0 ? xml : parseXML(text)
        },
        html: function(text) {
            return avalon.parseHTML(text) //一个文档碎片,方便直接插入DOM树
        },
        json: function(text) {
            if (!avalon.parseJSON) {
                avalon.log("avalon.parseJSON不存在,请升级到最新版")
            }
            return avalon.parseJSON(text)
        },
        script: function(text) {
            parseJS(text)
            return text
        },
        jsonp: function() {
            var json, callbackName
            if (this.jsonpCallback.startsWith('avalon.')) {
                callbackName = this.jsonpCallback.replace(/avalon\./, '')
                json = avalon[callbackName]
                delete avalon[callbackName]
            } else {
                json = window[this.jsonpCallback]
            }
            return json
        }
    }

    var rbracket = /\[\]$/
    avalon.param = function(obj) {
        var prefix,
            s = [],
            add = function(key, value) {
                // If value is a function, invoke it and return its value
                value = typeof value === "function" ? value() : (value == null ? "" : value)
                s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value)
        }
        // 处理数组与类数组的jquery对象
        if (Array.isArray(obj)) {
            // Serialize the form elements
            avalon.each(obj, add)

        } else {
            for (prefix in obj) {
                paramInner(prefix, obj[prefix], add)
            }
        }

        // Return the resulting serialization
        return s.join("&").replace(r20, "+")
    }

    function paramInner(prefix, obj, add) {
        var name
        if (Array.isArray(obj)) {
            // Serialize array item.
            avalon.each(obj, function(i, v) {
                if (rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v)
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    paramInner(
                        prefix + "[" + (typeof v === "object" ? i : "") + "]",
                        v,
                        add)
                }
            })
        } else if (avalon.isPlainObject(obj)) {
            // Serialize object item.
            for (name in obj) {
                paramInner(prefix + "[" + name + "]", obj[name], add)
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj)
        }
    }
    //将一个字符串转换为对象
    function tryDecodeURIComponent(value) {
        try {
            return decodeURIComponent(value)
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
        sep = sep || '&'
        eq = eq || '='
        var obj = {}
        if ((typeof qs !== "string") || qs.length === 0) {
            return obj
        }
        if (qs.indexOf("?") !== -1) {
            qs = qs.split("?").pop()
        }
        var array = qs.split(sep)
        for (var i = 0, el; el = array[i++];) {
            var arr = el.split("=")
            if (arr.length === 1) { //处理只有键名没键值的情况
                obj[arr[0]] = ""
            } else {
                var key = arr[0].replace(radd, '%20')
                var v = tryDecodeURIComponent(arr.slice(1).join("=").replace(radd, ' '))
                if (addSubObject(obj, key, v)) { //处理存在中括号的情况
                    var k = tryDecodeURIComponent(key) //处理不存在中括号的简单的情况
                    if (!Object.prototype.hasOwnProperty.call(obj, k)) {
                        obj[k] = v
                    } else if (Array.isArray(obj[k])) {
                        obj[k].push(v)
                    } else {
                        obj[k] = [obj[k], v]
                    }
                }
            }
        }

        return obj
    }
    var rinput = /select|input|button|textarea/i
    var rcheckbox = /radio|checkbox/
    var rline = /\r?\n/g
    function trimLine(val) {
        return val.replace(rline, "\r\n")
    }
    //表单元素变字符串, form为一个元素节点
    avalon.serialize = function(form) {
        var json = {}
        // 不直接转换form.elements，防止以下情况：   <form > <input name="elements"/><input name="test"/></form>
        Array.prototype.filter.call(form.getElementsByTagName("*"), function(el) {
            if (rinput.test(el.nodeName) && el.name && !el.disabled) {
                return rcheckbox.test(el.type) ? el.checked : true //只处理拥有name并且没有disabled的表单元素
            }
        }).forEach(function(el) {
            var val = avalon(el).val()
            val = Array.isArray(val) ? val.map(trimLine) : trimLine(val)
            var name = el.name
            if (name in json) {
                if (Array.isArray(val)) {
                    json[name].push(val)
                } else {
                    json[name] = [json[name], val]
                }
            } else {
                json[name] = val
            }
        })
        return avalon.param(json, false) // 名值键值对序列化,数组元素名字前不加 []
    }

    var xhrSuccessStatus = {
        0: 200,
        1223: 204
    }
    var transports = avalon.ajaxTransports = {
        xhr: {
            //发送请求
            request: function() {
                var self = this
                var opts = this.options
                var transport = this.transport = new avalon.xhr
                transport.open(opts.type, opts.url, opts.async, opts.username, opts.password)
                if (this.mimeType && transport.overrideMimeType) {
                    transport.overrideMimeType(this.mimeType)
                }
                transport.withCredentials = true

                /*
                 * header 中设置 X-Requested-With 用来给后端做标示：
                 * 这是一个 ajax 请求。
                 *
                 * 在 Chrome、Firefox 3.5+ 和 Safari 4+ 下，
                 * 在进行跨域请求时设置自定义 header，会触发 preflighted requests，
                 * 会预先发送 method 为 OPTIONS 的请求。
                 *
                 * 于是，如果跨域，禁用此功能。
                 */
                if (!opts.crossDomain) {
                    this.requestHeaders["X-Requested-With"] = "XMLHttpRequest"
                }

                for (var i in this.requestHeaders) {
                    transport.setRequestHeader(i, this.requestHeaders[i] + "")
                }

                /*
                 * progress
                 */
                if (opts.progressCallback) {
                    transport.upload.onprogress = opts.progressCallback
                }

                var dataType = opts.dataType
                if ("responseType" in transport && /^(blob|arraybuffer|text)$/.test(dataType)) {
                    transport.responseType = dataType
                    this.useResponseType = true
                }
                //必须要支持 FormData 和 file.fileList 的浏览器 才能用 xhr 发送
                //标准规定的 multipart/form-data 发送必须用 utf-8 格式， 记得 ie 会受到 document.charset 的影响
                transport.send(opts.hasContent && (this.formdata || this.querystring) || null)

                transport.onload = transport.onerror = function(e) {
                    this.readyState = 4 //IE9+ 
                    this.status = e.type === "load" ? 200 : 500
                    self.respond()
                }
            },
            //用于获取原始的responseXMLresponseText 修正status statusText
            //第二个参数为1时中止清求
            respond: function(event, forceAbort) {
                var transport = this.transport
                if (!transport) {
                    return
                }
                // by zilong：避免abort后还继续派发onerror等事件
                if (forceAbort && this.timeoutID) {
                    clearTimeout(this.timeoutID)
                    delete this.timeoutID
                }

                var completed = transport.readyState === 4
                if (forceAbort || completed) {
                    transport.onerror = transport.onload = null
                    if (forceAbort) {
                        if (!completed && typeof transport.abort === "function") { // 完成以后 abort 不要调用
                            transport.abort()
                        }
                    } else {

                        var text = transport.responseText
                        var statusText = transport.statusText
                        var status = xhrSuccessStatus[status] || transport.status

                        //设置response
                        if (this.useResponseType) {
                            this.response = transport.response
                        }
                        this.responseText = typeof text === "string" ? text : void 0
                        this.responseXML = (transport.responseXML || {}).documentElement
                        this.responseHeadersString = transport.getAllResponseHeaders()
                        this.dispatch(status, statusText)
                    }
                }

            }
        },
        jsonp: {
            preproccess: function() {
                var opts = this.options
                var name = this.jsonpCallback = opts.jsonpCallback || "avalon.jsonp" + setTimeout("1")
                if (rjsonp.test(opts.url)) {
                    opts.url = opts.url.replace(rjsonp, "$1" + name)
                } else {
                    opts.url = opts.url + (rquery.test(opts.url) ? "&" : "?") + opts.jsonp + "=" + name
                }
                //将后台返回的json保存在惰性函数中
                if (name.startsWith('avalon.')) {
                    name = name.replace(/avalon\./, '')
                    avalon[name] = function(json) {
                        avalon[name] = json
                    }
                } else {
                    window[name] = function(json) {
                        window[name] = json
                    }
                }
                return "script"
            }
        },
        script: {
            request: function() {
                var opts = this.options
                var node = this.transport = DOC.createElement("script")
                if (opts.charset) {
                    node.charset = opts.charset
                }
                var self = this
                node.onerror = node.onload = function() {
                    self.respond()
                }
                node.src = opts.url
                head.insertBefore(node, head.firstChild)
            },
            respond: function(event, forceAbort) {
                var node = this.transport
                if (!node) {
                    return
                }
                // by zilong：避免abort后还继续派发onerror等事件
                if (forceAbort && this.timeoutID) {
                    clearTimeout(this.timeoutID)
                    delete this.timeoutID
                }
                node.onerror = node.onload = null
                var parent = node.parentNode
                if (parent) {
                    parent.removeChild(node)
                }
                if (!forceAbort) {
                    var args
                    if (this.jsonpCallback) {
                        var jsonpCallback = this.jsonpCallback.startsWith('avalon.') ? avalon[this.jsonpCallback.replace(/avalon\./, '')] : window[this.jsonpCallback]
                        args = typeof jsonpCallback === "function" ? [500, "error"] : [200, "success"]
                    } else {
                        args = [200, "success"]
                    }
                    this.dispatch.apply(this, args)
                }
            }
        },
        upload: {
            preproccess: function() {
                var opts = this.options, formdata
                if (typeof opts.form.append === "function") { //简单判断opts.form是否为FormData
                    formdata = opts.form
                    opts.contentType = ''
                } else {
                    formdata = new FormData(opts.form) //将二进制什么一下子打包到formdata
                }
                avalon.each(opts.data, function(key, val) {
                    formdata.append(key, val) //添加客外数据
                })
                this.formdata = formdata
            }
        }
    }

    avalon.mix(transports.jsonp, transports.script)
    avalon.mix(transports.upload, transports.xhr)
    return avalon
})
/**
 2011.8.31
 将会传送器的abort方法上传到avalon.XHR.abort去处理
 修复serializeArray的bug
 对XMLHttpRequest.abort进行try...catch
 2012.3.31 v2 大重构,支持XMLHttpRequest Level2
 2013.4.8 v3 大重构 支持二进制上传与下载
 http://www.cnblogs.com/heyuquan/archive/2013/05/13/3076465.html
 2014.12.25  v4 大重构 
 2015.3.2   去掉mmPromise
 2014.3.13  使用加强版mmPromise
 2014.3.17  增加 xhr 的 onprogress 回调
 */
