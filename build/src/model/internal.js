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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { schemeCategory10, schemeSet3 } from 'd3-scale-chromatic';
import { OrderedSet } from '../internal';
import Column, { DEFAULT_COLOR } from './Column';
import { defaultGroup, ECompareValueType, } from './interfaces';
/** @internal */
export function integrateDefaults(desc, defaults) {
    if (defaults === void 0) { defaults = {}; }
    Object.keys(defaults).forEach(function (key) {
        var typed = key;
        if (typeof desc[typed] === 'undefined') {
            desc[typed] = defaults[typed];
        }
    });
    return desc;
}
/** @internal */
export function patternFunction(pattern) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new (Function.bind.apply(Function, __spreadArray(__spreadArray([void 0, 'value'], args, false), ["\n  const escapedValue = encodeURIComponent(String(value));\n  return `".concat(pattern, "`;\n ")], false)))();
}
/** @internal */
export function joinGroups(groups) {
    if (groups.length === 0) {
        return __assign({}, defaultGroup); //copy
    }
    if (groups.length === 1 && !groups[0].parent) {
        return __assign({}, groups[0]); //copy
    }
    // create a chain
    var parents = [];
    for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
        var group = groups_1[_i];
        var gparents = [];
        var g = group;
        while (g.parent) {
            // add all parents of this groups
            gparents.unshift(g.parent);
            g = g.parent;
        }
        parents.push.apply(parents, gparents);
        parents.push(Object.assign({ subGroups: [] }, group));
    }
    parents.slice(1).forEach(function (g, i) {
        g.parent = parents[i];
        g.name = "".concat(parents[i].name, " \u2229 ").concat(g.name);
        g.color = g.color !== DEFAULT_COLOR ? g.color : g.parent.color;
        parents[i].subGroups = [g];
    });
    return parents[parents.length - 1];
}
export function duplicateGroup(group) {
    var clone = Object.assign({}, group);
    delete clone.order;
    if (isGroupParent(clone)) {
        clone.subGroups = [];
    }
    if (clone.parent) {
        clone.parent = duplicateGroup(clone.parent);
        clone.parent.subGroups.push(clone);
    }
    return clone;
}
/** @internal */
export function toGroupID(group) {
    return group.name;
}
/** @internal */
export function isOrderedGroup(g) {
    return g.order != null;
}
/** @internal */
function isGroupParent(g) {
    return g.subGroups != null;
}
/**
 * unify the parents of the given groups by reusing the same group parent if possible
 * @param groups
 */
export function unifyParents(groups) {
    if (groups.length <= 1) {
        return groups;
    }
    var toPath = function (group) {
        var path = [group];
        var p = group.parent;
        while (p) {
            path.unshift(p);
            p = p.parent;
        }
        return path;
    };
    var paths = groups.map(toPath);
    var isSame = function (a, b) {
        return b.name === a.name && b.parent === a.parent && isGroupParent(b) && b.subGroups.length > 0;
    };
    var removeDuplicates = function (level, i) {
        var _a;
        var real = [];
        while (level.length > 0) {
            var node = level.shift();
            if (!isGroupParent(node) || node.subGroups.length === 0) {
                // cannot share leaves
                real.push(node);
                continue;
            }
            var root = __assign({}, node);
            real.push(root);
            // remove duplicates that directly follow
            while (level.length > 0 && isSame(root, level[0])) {
                (_a = root.subGroups).push.apply(_a, level.shift().subGroups);
            }
            for (var _i = 0, _b = root.subGroups; _i < _b.length; _i++) {
                var child = _b[_i];
                child.parent = root;
            }
            // cleanup children duplicates
            root.subGroups = removeDuplicates(root.subGroups, i + 1);
        }
        return real;
    };
    removeDuplicates(paths.map(function (p) { return p[0]; }), 0);
    return groups;
}
/** @internal */
export function groupRoots(groups) {
    var roots = new OrderedSet();
    for (var _i = 0, groups_2 = groups; _i < groups_2.length; _i++) {
        var group = groups_2[_i];
        var root = group;
        while (root.parent) {
            root = root.parent;
        }
        roots.add(root);
    }
    return Array.from(roots);
}
/**
 * Traverse the tree of given groups in depth first search (DFS)
 *
 * @param groups Groups to traverse
 * @param f Function to check each group. Traversing subgroups can be stopped when returning `false`.
 *
 * @internal
 */
export function traverseGroupsDFS(groups, f) {
    var traverse = function (v) {
        if (f(v) === false) {
            return;
        }
        if (isGroupParent(v)) {
            v.subGroups.forEach(traverse);
        }
    };
    var roots = groupRoots(groups);
    roots.forEach(traverse);
}
// based on https://github.com/d3/d3-scale-chromatic#d3-scale-chromatic
var colors = schemeCategory10.concat(schemeSet3);
/** @internal */
export var MAX_COLORS = colors.length;
/** @internal */
export function colorPool() {
    var act = 0;
    return function () { return colors[act++ % colors.length]; };
}
/**
 * @internal
 */
export function mapIndices(arr, callback) {
    var r = [];
    for (var i = 0; i < arr.length; ++i) {
        r.push(callback(arr[i], i));
    }
    return r;
}
/**
 * @internal
 */
export function everyIndices(arr, callback) {
    for (var i = 0; i < arr.length; ++i) {
        if (!callback(arr[i], i)) {
            return false;
        }
    }
    return true;
}
/**
 * @internal
 */
export function filterIndices(arr, callback) {
    var r = [];
    for (var i = 0; i < arr.length; ++i) {
        if (callback(arr[i], i)) {
            r.push(arr[i]);
        }
    }
    return r;
}
/**
 * @internal
 */
export function forEachIndices(arr, callback) {
    for (var i = 0; i < arr.length; ++i) {
        callback(arr[i], i);
    }
}
/**
 * @internal
 */
export function chooseUIntByDataLength(dataLength) {
    if (dataLength == null || (typeof dataLength !== 'number' && !Number.isNaN(dataLength))) {
        return ECompareValueType.UINT32; // worst case
    }
    if (dataLength <= 255) {
        return ECompareValueType.UINT8;
    }
    if (dataLength <= 65535) {
        return ECompareValueType.UINT16;
    }
    return ECompareValueType.UINT32;
}
export function getAllToolbarActions(col) {
    var actions = new OrderedSet();
    // walk up the prototype chain
    var obj = col;
    var toolbarIcon = Symbol.for('toolbarIcon');
    do {
        var m = Reflect.getOwnMetadata(toolbarIcon, obj.constructor);
        if (m) {
            for (var _i = 0, m_1 = m; _i < m_1.length; _i++) {
                var mi = m_1[_i];
                actions.add(mi);
            }
        }
        obj = Object.getPrototypeOf(obj);
    } while (obj);
    return Array.from(actions);
}
export function getAllToolbarDialogAddons(col, key) {
    var actions = new OrderedSet();
    // walk up the prototype chain
    var obj = col;
    var symbol = Symbol.for("toolbarDialogAddon".concat(key));
    do {
        var m = Reflect.getOwnMetadata(symbol, obj.constructor);
        if (m) {
            for (var _i = 0, m_2 = m; _i < m_2.length; _i++) {
                var mi = m_2[_i];
                actions.add(mi);
            }
        }
        obj = Object.getPrototypeOf(obj);
    } while (obj);
    return Array.from(actions);
}
//# sourceMappingURL=internal.js.map