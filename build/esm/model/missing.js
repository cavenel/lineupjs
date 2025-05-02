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
    for (const vi of v) {
        if (!isMissingValue(vi)) {
            return false;
        }
    }
    return true;
}
export function isUnknown(v) {
    return v == null || v === undefined || Number.isNaN(v);
}
export const FIRST_IS_NAN = -1;
export const FIRST_IS_MISSING = 1;
export const missingGroup = {
    name: 'Missing values',
    color: 'gray',
};
