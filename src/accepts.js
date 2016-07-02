module.exports = {
    xml: "application/xml, text/xml",
    html: "text/html",
    text: "text/plain",
    json: "application/json, text/javascript",
    script: "text/javascript, application/javascript",
    "*": ["*/"] + ["*"] //避免被压缩掉
}
