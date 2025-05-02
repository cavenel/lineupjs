export function isMissingValue(v) {
    if (v == null ||
        v === undefined ||
        v === '' ||
        v === 'NA' ||
        v === 'na' ||
        v === 'Na' ||
        v === 'nA' ||
        v === 'NaN' ||
        (typeof v === 'number' && Number.isNaN(v))) {
        return true;
    }
    if (!Array.isArray(v)) {
        return false;
    }
    for (var _i = 0, v_1 = v; _i < v_1.length; _i++) {
        var vi = v_1[_i];
        if (!isMissingValue(vi)) {
            return false;
        }
    }
    return true;
}
export function isUnknown(v) {
    return v == null || v === undefined || Number.isNaN(v);
}
export var FIRST_IS_NAN = -1;
export var FIRST_IS_MISSING = 1;
export var missingGroup = {
    name: 'Missing values',
    color: 'gray',
};
//# sourceMappingURL=missing.js.map