var msie = 0
if (window.VBArray) {
    msie = document.documentMode || (window.XMLHttpRequest ? 7 : 6)
}

module.exports = msie