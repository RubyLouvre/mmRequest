var rbracket = /\[\]$/
avalon.param = function (obj) {
    var prefix,
            s = [],
            add = function (key, value) {
                // If value is a function, invoke it and return its value
                value = typeof value === "function" ? value() : (value == null ? "" : value);
                s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            }
    // 处理数组与类数组的jquery对象
    if (Array.isArray(obj)) {
        // Serialize the form elements
        avalon.each(obj, add)

    } else {
        for (prefix in obj) {
            paramInner(prefix, obj[ prefix ], add);
        }
    }

    // Return the resulting serialization
    return s.join("&").replace(r20, "+");
}

function paramInner(prefix, obj, add) {
    var name;
    if (Array.isArray(obj)) {
        // Serialize array item.
        avalon.each(obj, function (i, v) {
            if (rbracket.test(prefix)) {
                // Treat each array item as a scalar.
                add(prefix, v);
            } else {
                // Item is non-scalar (array or object), encode its numeric index.
                paramInner(
                        prefix + "[" + (typeof v === "object" ? i : "") + "]",
                        v,
                        add  );
            }
        });
    } else if (avalon.isPlainObject(obj)) {
        // Serialize object item.
        for (name in obj) {
            paramInner(prefix + "[" + name + "]", obj[ name ], add);
        }

    } else {
        // Serialize scalar item.
        add(prefix, obj);
    }
}