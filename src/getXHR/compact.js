var isLocal = false
var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/
var ie = require('../ie')
try {
    //在IE下如果重置了document.domain，直接访问window.location会抛错，但用document.URL就ok了
    //http://www.cnblogs.com/WuQiang/archive/2012/09/21/2697474.html
    isLocal = rlocalProtocol.test(location.protocol)
} catch (e) {
}

//http://www.cnblogs.com/rubylouvre/archive/2010/04/20/1716486.html
var s = ["XMLHttpRequest",
    "ActiveXObject('MSXML2.XMLHTTP.6.0')",
    "ActiveXObject('MSXML2.XMLHTTP.3.0')",
    "ActiveXObject('MSXML2.XMLHTTP')",
    "ActiveXObject('Microsoft.XMLHTTP')"
]
s[0] = ie < 8 && ie !== 0 && isLocal ? "!" : s[0] //IE下只能使用ActiveXObject
for (var i = 0, axo; axo = s[i++]; ) {
    try {
        if (eval("new " + axo)) {
            avalon.xhr = new Function("return new " + axo)
            break
        }
    } catch (e) {
    }
}

