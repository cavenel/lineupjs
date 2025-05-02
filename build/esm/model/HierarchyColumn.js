var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HierarchyColumn_1;
import { Category, toolbar } from './annotations';
import CategoricalColumn from './CategoricalColumn';
import Column, { widthChanged, labelChanged, metaDataChanged, dirty, dirtyHeader, dirtyValues, dirtyCaches, rendererTypeChanged, groupRendererChanged, summaryRendererChanged, visibilityChanged, DEFAULT_COLOR, } from './Column';
import { colorPool, integrateDefaults } from './internal';
import { missingGroup } from './missing';
import ValueColumn from './ValueColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
/**
 * column for hierarchical categorical values
 */
let HierarchyColumn = HierarchyColumn_1 = class HierarchyColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            renderer: 'categorical',
        }));
        this.currentMaxDepth = Number.POSITIVE_INFINITY;
        this.currentLeaves = [];
        this.currentLeavesNameCache = new Map();
        this.currentLeavesPathCache = new Map();
        this.hierarchySeparator = desc.hierarchySeparator || '.';
        this.hierarchy = this.initHierarchy(desc.hierarchy);
        this.currentNode = this.hierarchy;
        this.currentLeaves = computeLeaves(this.currentNode, this.currentMaxDepth);
        this.updateCaches();
        this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
    }
    initHierarchy(root) {
        const colors = colorPool();
        const s = this.hierarchySeparator;
        const add = (prefix, node) => {
            const name = node.name == null ? String(node.value) : node.name;
            const children = (node.children || []).map((child) => {
                if (typeof child === 'string') {
                    const path = prefix + child;
                    return {
                        path,
                        name: child,
                        label: path,
                        color: colors(),
                        value: 0,
                        children: [],
                    };
                }
                const r = add(`${prefix}${name}${s}`, child);
                if (!r.color) {
                    //hack to inject the next color
                    r.color = colors();
                }
                return r;
            });
            const path = prefix + name;
            const label = node.label ? node.label : path;
            return { path, name, children, label, color: node.color, value: 0 };
        };
        return add('', root);
    }
    get categories() {
        return this.currentLeaves;
    }
    createEventList() {
        return super
            .createEventList()
            .concat([HierarchyColumn_1.EVENT_COLOR_MAPPING_CHANGED, HierarchyColumn_1.EVENT_CUTOFF_CHANGED]);
    }
    on(type, listener) {
        return super.on(type, listener);
    }
    dump(toDescRef) {
        const r = super.dump(toDescRef);
        r.colorMapping = this.colorMapping.toJSON();
        if (isFinite(this.currentMaxDepth)) {
            r.maxDepth = this.currentMaxDepth;
        }
        if (this.currentNode !== this.hierarchy) {
            r.cutOffNode = this.currentNode.path;
        }
        return r;
    }
    restore(dump, factory) {
        super.restore(dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
        if (typeof dump.maxDepth !== 'undefined') {
            this.currentMaxDepth = dump.maxDepth;
        }
        if (typeof dump.cutOffNode !== 'undefined') {
            const path = dump.cutOffNode.split(this.hierarchySeparator);
            let node = this.hierarchy;
            const findName = (act) => {
                return (d) => d.name === act;
            };
            let act = path.shift();
            while (act && node) {
                if (node.name !== act) {
                    node = null;
                    break;
                }
                const next = path.shift();
                if (!next) {
                    break;
                }
                act = next;
                node = node.children.find(findName(act)) || null;
            }
            this.currentNode = node || this.hierarchy;
        }
        if (typeof dump.maxDepth !== 'undefined' || typeof dump.cutOffNode !== 'undefined') {
            this.currentLeaves = computeLeaves(this.currentNode, this.currentMaxDepth);
            this.updateCaches();
        }
    }
    getColorMapping() {
        return this.colorMapping.clone();
    }
    setColorMapping(mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    }
    getCutOff() {
        return {
            node: this.currentNode,
            maxDepth: this.currentMaxDepth,
        };
    }
    setCutOff(value) {
        const maxDepth = value.maxDepth == null ? Number.POSITIVE_INFINITY : value.maxDepth;
        if (this.currentNode === value.node && this.currentMaxDepth === maxDepth) {
            return;
        }
        const bak = this.getCutOff();
        this.currentNode = value.node;
        this.currentMaxDepth = maxDepth;
        this.currentLeaves = computeLeaves(value.node, maxDepth);
        this.updateCaches();
        this.fire([HierarchyColumn_1.EVENT_CUTOFF_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, this.getCutOff());
    }
    getCategory(row) {
        let v = super.getValue(row);
        if (v == null || v === '') {
            return null;
        }
        v = v.trim();
        if (this.currentLeavesNameCache.has(v)) {
            return this.currentLeavesNameCache.get(v);
        }
        if (this.currentLeavesPathCache.has(v)) {
            return this.currentLeavesPathCache.get(v);
        }
        return (this.currentLeaves.find((n) => {
            //direct hit or is a child of it
            return n.path === v || n.name === v || v.startsWith(n.path + this.hierarchySeparator);
        }) || null);
    }
    get dataLength() {
        return this.currentLeaves.length;
    }
    get labels() {
        return this.currentLeaves.map((d) => d.label);
    }
    getValue(row) {
        const v = this.getCategory(row);
        return v ? v.name : null;
    }
    getCategories(row) {
        return [this.getCategory(row)];
    }
    iterCategory(row) {
        return [this.getCategory(row)];
    }
    getLabel(row) {
        return CategoricalColumn.prototype.getLabel.call(this, row);
    }
    getColor(row) {
        return CategoricalColumn.prototype.getColor.call(this, row);
    }
    getLabels(row) {
        return CategoricalColumn.prototype.getLabels.call(this, row);
    }
    getValues(row) {
        return CategoricalColumn.prototype.getValues.call(this, row);
    }
    getMap(row) {
        return CategoricalColumn.prototype.getMap.call(this, row);
    }
    getMapLabel(row) {
        return CategoricalColumn.prototype.getMapLabel.call(this, row);
    }
    getSet(row) {
        return CategoricalColumn.prototype.getSet.call(this, row);
    }
    toCompareValue(row) {
        return CategoricalColumn.prototype.toCompareValue.call(this, row);
    }
    toCompareValueType() {
        return CategoricalColumn.prototype.toCompareValueType.call(this);
    }
    group(row) {
        const base = this.getCategory(row);
        if (!base) {
            return Object.assign({}, missingGroup);
        }
        return { name: base.label, color: base.color };
    }
    updateCaches() {
        this.currentLeavesPathCache.clear();
        this.currentLeavesNameCache.clear();
        this.currentLeaves.forEach((n) => {
            this.currentLeavesPathCache.set(n.path, n);
            this.currentLeavesNameCache.set(n.name, n);
        });
    }
};
HierarchyColumn.EVENT_CUTOFF_CHANGED = 'cutOffChanged';
HierarchyColumn.EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';
HierarchyColumn = HierarchyColumn_1 = __decorate([
    toolbar('rename', 'clone', 'sort', 'sortBy', 'cutoff', 'group', 'groupBy', 'colorMappedCategorical'),
    Category('categorical')
], HierarchyColumn);
export default HierarchyColumn;
function computeLeaves(node, maxDepth = Number.POSITIVE_INFINITY) {
    const leaves = [];
    //depth first
    const visit = (node, depth) => {
        //hit or end
        if (depth >= maxDepth || node.children.length === 0) {
            leaves.push(node);
        }
        else {
            // go down
            node.children.forEach((c) => visit(c, depth + 1));
        }
    };
    visit(node, 0);
    return leaves;
}
export function resolveInnerNodes(node) {
    //breath first
    const queue = [node];
    let index = 0;
    while (index < queue.length) {
        const next = queue[index++];
        for (const n of next.children) {
            queue.push(n);
        }
    }
    return queue;
}
export function isHierarchical(categories) {
    if (categories.length === 0 || typeof categories[0] === 'string') {
        return false;
    }
    // check if any has a given parent name
    return categories.some((c) => c.parent != null);
}
export function deriveHierarchy(categories) {
    const lookup = new Map();
    categories.forEach((c) => {
        const p = c.parent || '';
        // set and fill up proxy
        const item = Object.assign({
            children: [],
            label: c.name,
            name: c.name,
            color: DEFAULT_COLOR,
            value: 0,
        }, lookup.get(c.name) || {}, c);
        lookup.set(c.name, item);
        if (!lookup.has(p)) {
            // create proxy
            lookup.set(p, { name: p, children: [], label: p, value: 0, color: DEFAULT_COLOR });
        }
        lookup.get(p).children.push(item);
    });
    const root = lookup.get('');
    console.assert(root !== undefined, 'hierarchy with no root');
    if (root.children.length === 1) {
        return root.children[0];
    }
    return root;
}
