export { equal } from '../../internal';
export function isTypeInstance(clazz, superClass) {
    var c = clazz;
    while (c && c !== superClass) {
        c = c.__proto__;
    }
    return c === superClass;
}
export function pick(obj, keys) {
    var r = {};
    keys.forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            r[k] = obj[k];
        }
    });
    return r;
}
export function isSame(current, changed, props) {
    if (props.every(function (p) { return !changed(p); })) {
        return null;
    }
    return pick(current, props);
}
//# sourceMappingURL=utils.js.map