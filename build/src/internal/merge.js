var TYPE_OBJECT = '[object Object]';
/**
 * deep merge the source object into the target object and return the target object.
 * will concatenate arrays instead of replacing them.
 * @internal
 */
export default function merge(target, source) {
    var result = target;
    if (!source) {
        return result;
    }
    var bKeys = Object.keys(source);
    if (bKeys.length === 0) {
        return result;
    }
    for (var _i = 0, bKeys_1 = bKeys; _i < bKeys_1.length; _i++) {
        var key = bKeys_1[_i];
        var value = source[key];
        //merge just POJOs
        if (Object.prototype.toString.call(value) === TYPE_OBJECT && Object.getPrototypeOf(value) === Object.prototype) {
            //pojo
            if (result[key] == null) {
                result[key] = {};
            }
            result[key] = merge(result[key], value);
        }
        else if (Array.isArray(value)) {
            if (result[key] == null) {
                result[key] = [];
            }
            result[key] = result[key].concat(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
//# sourceMappingURL=merge.js.map