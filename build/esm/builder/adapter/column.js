import { extent, resolveValue } from '../../internal';
export function build(props, _data) {
    const { column } = props;
    const desc = {
        column,
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
    ].forEach((key) => {
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
        const a = desc;
        const labels = props.asArray;
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
    const desc = build({ ...props, type: 'categorical' });
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
        const categories = new Set(data.map((d) => resolveValue(d, desc.column)));
        desc.categories = Array.from(categories).sort();
    }
    else {
        desc.categories = props.categories;
    }
    return desc;
}
export function buildDate(props) {
    const desc = build({ ...props, type: 'date' });
    ['dateFormat', 'dateParse'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
export function buildHierarchy(props) {
    const desc = build({ ...props, type: 'hierarchy' });
    ['hierarchy', 'hierarchySeparator'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
export function buildNumber(props, data) {
    const desc = build({ ...props, type: 'number' });
    const domain = props.domain ? props.domain : extent(data, (d) => resolveValue(d, desc.column));
    if (Object.prototype.hasOwnProperty.call(props, 'color')) {
        desc.colorMapping = props.color;
    }
    ['sort', 'colorMapping'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    if (props.scripted) {
        desc.map = { domain, code: props.scripted, type: 'script' };
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
            domain,
            range: props.range || [0, 1],
        };
    }
    return desc;
}
export function buildString(props) {
    const desc = build({ ...props, type: 'string' });
    ['pattern', 'patternTemplate', 'alignment'].forEach((key) => {
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
    const desc = build({ ...props, type: 'boolean' });
    ['trueMarker', 'falseMarker'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
export function buildActions(props) {
    const desc = build({ ...props, type: 'actions' });
    ['actions', 'groupActions'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            desc[key] = props[key];
        }
    });
    return desc;
}
