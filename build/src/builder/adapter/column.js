var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { extent, resolveValue } from '../../internal';
export function build(props, _data) {
    var column = props.column;
    var desc = {
        column: column,
        type: props.type,
        label: column ? column[0].toUpperCase() + column.slice(1) : props.type,
    };
    [
        'label',
        'description',
        'frozen',
        'width',
        'renderer',
        'groupRenderer',
        'summaryRenderer',
        'visible',
        'fixed',
    ].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    if (props.custom) {
        // merge custom attributes
        Object.assign(desc, props.custom);
    }
    if (props.asMap) {
        console.assert(['categorical', 'date', 'number', 'string', 'link'].includes(desc.type));
        desc.type += 'Map';
    }
    if (props.asArray != null) {
        console.assert(['boolean', 'categorical', 'date', 'number', 'string', 'link'].includes(desc.type));
        desc.type += 's';
        var a = desc;
        var labels = props.asArray;
        if (Array.isArray(labels)) {
            a.labels = labels;
            a.dataLength = labels.length;
        }
        else if (typeof labels === 'number') {
            a.dataLength = labels;
        }
    }
    return desc;
}
export function buildCategorical(props, data) {
    var desc = build(__assign(__assign({}, props), { type: 'categorical' }));
    if (props.asOrdinal) {
        desc.type = 'ordinal';
    }
    if (props.missingCategory) {
        desc.missingCategory = props.missingCategory;
    }
    if (props.asSet) {
        if (typeof props.asSet === 'string') {
            desc.separator = props.asSet;
        }
        desc.type = 'set';
    }
    if (!props.categories) {
        // derive categories
        var categories = new Set(data.map(function (d) { return resolveValue(d, desc.column); }));
        desc.categories = Array.from(categories).sort();
    }
    else {
        desc.categories = props.categories;
    }
    return desc;
}
export function buildDate(props) {
    var desc = build(__assign(__assign({}, props), { type: 'date' }));
    ['dateFormat', 'dateParse'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
export function buildHierarchy(props) {
    var desc = build(__assign(__assign({}, props), { type: 'hierarchy' }));
    ['hierarchy', 'hierarchySeparator'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
export function buildNumber(props, data) {
    var desc = build(__assign(__assign({}, props), { type: 'number' }));
    var domain = props.domain ? props.domain : extent(data, function (d) { return resolveValue(d, desc.column); });
    if (Object.prototype.hasOwnProperty.call(props, 'color')) {
        desc.colorMapping = props.color;
    }
    ['sort', 'colorMapping'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    if (props.scripted) {
        desc.map = { domain: domain, code: props.scripted, type: 'script' };
    }
    else if (!props.mapping || props.mapping === 'linear') {
        desc.domain = domain;
        if (props.range) {
            desc.range = props.range;
        }
    }
    else {
        desc.map = {
            type: props.mapping,
            domain: domain,
            range: props.range || [0, 1],
        };
    }
    return desc;
}
export function buildString(props) {
    var desc = build(__assign(__assign({}, props), { type: 'string' }));
    ['pattern', 'patternTemplate', 'alignment'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    if (props.editable) {
        desc.type = 'annotate';
    }
    if (props.pattern) {
        desc.type = 'link';
    }
    if (props.html) {
        desc.escape = false;
    }
    return desc;
}
export function buildBoolean(props) {
    var desc = build(__assign(__assign({}, props), { type: 'boolean' }));
    ['trueMarker', 'falseMarker'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
export function buildActions(props) {
    var desc = build(__assign(__assign({}, props), { type: 'actions' }));
    ['actions', 'groupActions'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
//# sourceMappingURL=column.js.map