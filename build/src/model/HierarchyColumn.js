var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var HierarchyColumn = /** @class */ (function (_super) {
    __extends(HierarchyColumn, _super);
    function HierarchyColumn(id, desc) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'categorical',
        })) || this;
        _this.currentMaxDepth = Number.POSITIVE_INFINITY;
        _this.currentLeaves = [];
        _this.currentLeavesNameCache = new Map();
        _this.currentLeavesPathCache = new Map();
        _this.hierarchySeparator = desc.hierarchySeparator || '.';
        _this.hierarchy = _this.initHierarchy(desc.hierarchy);
        _this.currentNode = _this.hierarchy;
        _this.currentLeaves = computeLeaves(_this.currentNode, _this.currentMaxDepth);
        _this.updateCaches();
        _this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
        return _this;
    }
    HierarchyColumn_1 = HierarchyColumn;
    HierarchyColumn.prototype.initHierarchy = function (root) {
        var colors = colorPool();
        var s = this.hierarchySeparator;
        var add = function (prefix, node) {
            var name = node.name == null ? String(node.value) : node.name;
            var children = (node.children || []).map(function (child) {
                if (typeof child === 'string') {
                    var path_1 = prefix + child;
                    return {
                        path: path_1,
                        name: child,
                        label: path_1,
                        color: colors(),
                        value: 0,
                        children: [],
                    };
                }
                var r = add("".concat(prefix).concat(name).concat(s), child);
                if (!r.color) {
                    //hack to inject the next color
                    r.color = colors();
                }
                return r;
            });
            var path = prefix + name;
            var label = node.label ? node.label : path;
            return { path: path, name: name, children: children, label: label, color: node.color, value: 0 };
        };
        return add('', root);
    };
    Object.defineProperty(HierarchyColumn.prototype, "categories", {
        get: function () {
            return this.currentLeaves;
        },
        enumerable: false,
        configurable: true
    });
    HierarchyColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([HierarchyColumn_1.EVENT_COLOR_MAPPING_CHANGED, HierarchyColumn_1.EVENT_CUTOFF_CHANGED]);
    };
    HierarchyColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    HierarchyColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.colorMapping = this.colorMapping.toJSON();
        if (isFinite(this.currentMaxDepth)) {
            r.maxDepth = this.currentMaxDepth;
        }
        if (this.currentNode !== this.hierarchy) {
            r.cutOffNode = this.currentNode.path;
        }
        return r;
    };
    HierarchyColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
        if (typeof dump.maxDepth !== 'undefined') {
            this.currentMaxDepth = dump.maxDepth;
        }
        if (typeof dump.cutOffNode !== 'undefined') {
            var path = dump.cutOffNode.split(this.hierarchySeparator);
            var node = this.hierarchy;
            var findName = function (act) {
                return function (d) { return d.name === act; };
            };
            var act = path.shift();
            while (act && node) {
                if (node.name !== act) {
                    node = null;
                    break;
                }
                var next = path.shift();
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
    };
    HierarchyColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    HierarchyColumn.prototype.setColorMapping = function (mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
    };
    HierarchyColumn.prototype.getCutOff = function () {
        return {
            node: this.currentNode,
            maxDepth: this.currentMaxDepth,
        };
    };
    HierarchyColumn.prototype.setCutOff = function (value) {
        var maxDepth = value.maxDepth == null ? Number.POSITIVE_INFINITY : value.maxDepth;
        if (this.currentNode === value.node && this.currentMaxDepth === maxDepth) {
            return;
        }
        var bak = this.getCutOff();
        this.currentNode = value.node;
        this.currentMaxDepth = maxDepth;
        this.currentLeaves = computeLeaves(value.node, maxDepth);
        this.updateCaches();
        this.fire([HierarchyColumn_1.EVENT_CUTOFF_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, this.getCutOff());
    };
    HierarchyColumn.prototype.getCategory = function (row) {
        var _this = this;
        var v = _super.prototype.getValue.call(this, row);
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
        return (this.currentLeaves.find(function (n) {
            //direct hit or is a child of it
            return n.path === v || n.name === v || v.startsWith(n.path + _this.hierarchySeparator);
        }) || null);
    };
    Object.defineProperty(HierarchyColumn.prototype, "dataLength", {
        get: function () {
            return this.currentLeaves.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HierarchyColumn.prototype, "labels", {
        get: function () {
            return this.currentLeaves.map(function (d) { return d.label; });
        },
        enumerable: false,
        configurable: true
    });
    HierarchyColumn.prototype.getValue = function (row) {
        var v = this.getCategory(row);
        return v ? v.name : null;
    };
    HierarchyColumn.prototype.getCategories = function (row) {
        return [this.getCategory(row)];
    };
    HierarchyColumn.prototype.iterCategory = function (row) {
        return [this.getCategory(row)];
    };
    HierarchyColumn.prototype.getLabel = function (row) {
        return CategoricalColumn.prototype.getLabel.call(this, row);
    };
    HierarchyColumn.prototype.getColor = function (row) {
        return CategoricalColumn.prototype.getColor.call(this, row);
    };
    HierarchyColumn.prototype.getLabels = function (row) {
        return CategoricalColumn.prototype.getLabels.call(this, row);
    };
    HierarchyColumn.prototype.getValues = function (row) {
        return CategoricalColumn.prototype.getValues.call(this, row);
    };
    HierarchyColumn.prototype.getMap = function (row) {
        return CategoricalColumn.prototype.getMap.call(this, row);
    };
    HierarchyColumn.prototype.getMapLabel = function (row) {
        return CategoricalColumn.prototype.getMapLabel.call(this, row);
    };
    HierarchyColumn.prototype.getSet = function (row) {
        return CategoricalColumn.prototype.getSet.call(this, row);
    };
    HierarchyColumn.prototype.toCompareValue = function (row) {
        return CategoricalColumn.prototype.toCompareValue.call(this, row);
    };
    HierarchyColumn.prototype.toCompareValueType = function () {
        return CategoricalColumn.prototype.toCompareValueType.call(this);
    };
    HierarchyColumn.prototype.group = function (row) {
        var base = this.getCategory(row);
        if (!base) {
            return Object.assign({}, missingGroup);
        }
        return { name: base.label, color: base.color };
    };
    HierarchyColumn.prototype.updateCaches = function () {
        var _this = this;
        this.currentLeavesPathCache.clear();
        this.currentLeavesNameCache.clear();
        this.currentLeaves.forEach(function (n) {
            _this.currentLeavesPathCache.set(n.path, n);
            _this.currentLeavesNameCache.set(n.name, n);
        });
    };
    var HierarchyColumn_1;
    HierarchyColumn.EVENT_CUTOFF_CHANGED = 'cutOffChanged';
    HierarchyColumn.EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';
    HierarchyColumn = HierarchyColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'cutoff', 'group', 'groupBy', 'colorMappedCategorical'),
        Category('categorical')
    ], HierarchyColumn);
    return HierarchyColumn;
}(ValueColumn));
export default HierarchyColumn;
function computeLeaves(node, maxDepth) {
    if (maxDepth === void 0) { maxDepth = Number.POSITIVE_INFINITY; }
    var leaves = [];
    //depth first
    var visit = function (node, depth) {
        //hit or end
        if (depth >= maxDepth || node.children.length === 0) {
            leaves.push(node);
        }
        else {
            // go down
            node.children.forEach(function (c) { return visit(c, depth + 1); });
        }
    };
    visit(node, 0);
    return leaves;
}
export function resolveInnerNodes(node) {
    //breath first
    var queue = [node];
    var index = 0;
    while (index < queue.length) {
        var next = queue[index++];
        for (var _i = 0, _a = next.children; _i < _a.length; _i++) {
            var n = _a[_i];
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
    return categories.some(function (c) { return c.parent != null; });
}
export function deriveHierarchy(categories) {
    var lookup = new Map();
    categories.forEach(function (c) {
        var p = c.parent || '';
        // set and fill up proxy
        var item = Object.assign({
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
    var root = lookup.get('');
    console.assert(root !== undefined, 'hierarchy with no root');
    if (root.children.length === 1) {
        return root.children[0];
    }
    return root;
}
//# sourceMappingURL=HierarchyColumn.js.map