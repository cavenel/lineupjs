import { schemeCategory10, schemeSet3 } from 'd3-scale-chromatic';
import { OrderedSet } from '../internal';
import Column, { DEFAULT_COLOR } from './Column';
import { defaultGroup, ECompareValueType, } from './interfaces';
/** @internal */
export function integrateDefaults(desc, defaults = {}) {
    Object.keys(defaults).forEach((key) => {
        const typed = key;
        if (typeof desc[typed] === 'undefined') {
            desc[typed] = defaults[typed];
        }
    });
    return desc;
}
/** @internal */
export function patternFunction(pattern, ...args) {
    return new Function('value', ...args, `
  const escapedValue = encodeURIComponent(String(value));
  return \`${pattern}\`;
 `);
}
/** @internal */
export function joinGroups(groups) {
    if (groups.length === 0) {
        return { ...defaultGroup }; //copy
    }
    if (groups.length === 1 && !groups[0].parent) {
        return { ...groups[0] }; //copy
    }
    // create a chain
    const parents = [];
    for (const group of groups) {
        const gparents = [];
        let g = group;
        while (g.parent) {
            // add all parents of this groups
            gparents.unshift(g.parent);
            g = g.parent;
        }
        parents.push(...gparents);
        parents.push(Object.assign({ subGroups: [] }, group));
    }
    parents.slice(1).forEach((g, i) => {
        g.parent = parents[i];
        g.name = `${parents[i].name} ∩ ${g.name}`;
        g.color = g.color !== DEFAULT_COLOR ? g.color : g.parent.color;
        parents[i].subGroups = [g];
    });
    return parents[parents.length - 1];
}
export function duplicateGroup(group) {
    const clone = Object.assign({}, group);
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
    const toPath = (group) => {
        const path = [group];
        let p = group.parent;
        while (p) {
            path.unshift(p);
            p = p.parent;
        }
        return path;
    };
    const paths = groups.map(toPath);
    const isSame = (a, b) => {
        return b.name === a.name && b.parent === a.parent && isGroupParent(b) && b.subGroups.length > 0;
    };
    const removeDuplicates = (level, i) => {
        const real = [];
        while (level.length > 0) {
            const node = level.shift();
            if (!isGroupParent(node) || node.subGroups.length === 0) {
                // cannot share leaves
                real.push(node);
                continue;
            }
            const root = { ...node };
            real.push(root);
            // remove duplicates that directly follow
            while (level.length > 0 && isSame(root, level[0])) {
                root.subGroups.push(...level.shift().subGroups);
            }
            for (const child of root.subGroups) {
                child.parent = root;
            }
            // cleanup children duplicates
            root.subGroups = removeDuplicates(root.subGroups, i + 1);
        }
        return real;
    };
    removeDuplicates(paths.map((p) => p[0]), 0);
    return groups;
}
/** @internal */
export function groupRoots(groups) {
    const roots = new OrderedSet();
    for (const group of groups) {
        let root = group;
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
    const traverse = (v) => {
        if (f(v) === false) {
            return;
        }
        if (isGroupParent(v)) {
            v.subGroups.forEach(traverse);
        }
    };
    const roots = groupRoots(groups);
    roots.forEach(traverse);
}
// based on https://github.com/d3/d3-scale-chromatic#d3-scale-chromatic
const colors = schemeCategory10.concat(schemeSet3);
/** @internal */
export const MAX_COLORS = colors.length;
/** @internal */
export function colorPool() {
    let act = 0;
    return () => colors[act++ % colors.length];
}
/**
 * @internal
 */
export function mapIndices(arr, callback) {
    const r = [];
    for (let i = 0; i < arr.length; ++i) {
        r.push(callback(arr[i], i));
    }
    return r;
}
/**
 * @internal
 */
export function everyIndices(arr, callback) {
    for (let i = 0; i < arr.length; ++i) {
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
    const r = [];
    for (let i = 0; i < arr.length; ++i) {
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
    for (let i = 0; i < arr.length; ++i) {
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
    const actions = new OrderedSet();
    // walk up the prototype chain
    let obj = col;
    const toolbarIcon = Symbol.for('toolbarIcon');
    do {
        const m = Reflect.getOwnMetadata(toolbarIcon, obj.constructor);
        if (m) {
            for (const mi of m) {
                actions.add(mi);
            }
        }
        obj = Object.getPrototypeOf(obj);
    } while (obj);
    return Array.from(actions);
}
export function getAllToolbarDialogAddons(col, key) {
    const actions = new OrderedSet();
    // walk up the prototype chain
    let obj = col;
    const symbol = Symbol.for(`toolbarDialogAddon${key}`);
    do {
        const m = Reflect.getOwnMetadata(symbol, obj.constructor);
        if (m) {
            for (const mi of m) {
                actions.add(mi);
            }
        }
        obj = Object.getPrototypeOf(obj);
    } while (obj);
    return Array.from(actions);
}
