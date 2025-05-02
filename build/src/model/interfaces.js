export var defaultGroup = {
    name: 'Default',
    color: 'gray',
};
export var othersGroup = {
    name: 'Others',
    color: 'gray',
};
export function isGroup(item) {
    return item && item.group == null; // use .group as separator
}
export var ECompareValueType;
(function (ECompareValueType) {
    ECompareValueType[ECompareValueType["BINARY"] = 0] = "BINARY";
    ECompareValueType[ECompareValueType["COUNT"] = 1] = "COUNT";
    ECompareValueType[ECompareValueType["UINT8"] = 2] = "UINT8";
    ECompareValueType[ECompareValueType["UINT16"] = 3] = "UINT16";
    ECompareValueType[ECompareValueType["UINT32"] = 4] = "UINT32";
    ECompareValueType[ECompareValueType["INT8"] = 5] = "INT8";
    ECompareValueType[ECompareValueType["INT16"] = 6] = "INT16";
    ECompareValueType[ECompareValueType["INT32"] = 7] = "INT32";
    ECompareValueType[ECompareValueType["FLOAT"] = 8] = "FLOAT";
    ECompareValueType[ECompareValueType["FLOAT_ASC"] = 9] = "FLOAT_ASC";
    ECompareValueType[ECompareValueType["DOUBLE"] = 10] = "DOUBLE";
    ECompareValueType[ECompareValueType["DOUBLE_ASC"] = 11] = "DOUBLE_ASC";
    ECompareValueType[ECompareValueType["STRING"] = 12] = "STRING";
})(ECompareValueType || (ECompareValueType = {}));
export function isMultiLevelColumn(col) {
    return typeof col.getCollapsed === 'function';
}
//# sourceMappingURL=interfaces.js.map