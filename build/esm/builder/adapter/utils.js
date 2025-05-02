export { equal } from '../../internal';
export function isTypeInstance(clazz, superClass) {
    let c = clazz;
    while (c && c !== superClass) {
        c = c.__proto__;
    }
    return c === superClass;
}
export function pick(obj, keys) {
    const r = {};
    keys.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            r[k] = obj[k];
        }
    });
    return r;
}
export function isSame(current, changed, props) {
    if (props.every((p) => !changed(p))) {
        return null;
    }
    return pick(current, props);
}
