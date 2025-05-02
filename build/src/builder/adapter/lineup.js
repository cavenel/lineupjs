import { deriveColors, deriveColumnDescriptions, LocalDataProvider, } from '../../provider';
import { LineUp, Taggle } from '../../ui';
import { buildRanking } from './ranking';
import { equal, isSame, pick } from './utils';
var providerOptions = [
    'singleSelection',
    'filterGlobally',
    'columnTypes',
    'taskExecutor',
    'jumpToSearchResult',
];
var lineupOptions = [
    'animated',
    'sidePanel',
    'sidePanelCollapsed',
    'hierarchyIndicator',
    'defaultSlopeGraphMode',
    'summaryHeader',
    'expandLineOnHover',
    'overviewMode',
    'renderers',
    'canRender',
    'toolbarActions',
    'toolbarDialogAddons',
    'rowHeight',
    'rowPadding',
    'groupHeight',
    'groupPadding',
    'dynamicHeight',
    'labelRotation',
    'ignoreUnsupportedBrowser',
    'livePreviews',
];
var Adapter = /** @class */ (function () {
    function Adapter(adapter) {
        var _this = this;
        this.adapter = adapter;
        this.data = null;
        this.instance = null;
        this.prevRankings = null;
        this.prevColumns = null;
        this.prevHighlight = null;
        this.onSelectionChanged = function (indices) {
            if (_this.props.onSelectionChanged && !equal(_this.props.selection, indices)) {
                _this.props.onSelectionChanged(indices);
            }
        };
        this.onHighlightChanged = function (highlight) {
            var prev = _this.prevHighlight != null ? _this.prevHighlight : -1;
            if (prev === highlight) {
                return;
            }
            _this.prevHighlight = highlight;
            if (_this.props.onHighlightChanged) {
                _this.props.onHighlightChanged(highlight);
            }
        };
    }
    Object.defineProperty(Adapter.prototype, "props", {
        get: function () {
            return this.adapter.props();
        },
        enumerable: false,
        configurable: true
    });
    Adapter.prototype.componentDidMount = function () {
        this.data = this.buildProvider();
        this.instance = this.adapter.createInstance(this.data, pick(this.props, lineupOptions));
        this.instance.on(LineUp.EVENT_HIGHLIGHT_CHANGED, this.onHighlightChanged);
    };
    Adapter.prototype.resolveColumnDescs = function (data) {
        var columns = this.adapter.columnDescs(data);
        var deriveColumns = columns.length === 0 || Boolean(this.props.deriveColumns);
        var deriveColumnNames = Array.isArray(this.props.deriveColumns) ? this.props.deriveColumns : [];
        var deriveColors = Boolean(this.props.deriveColors);
        return {
            columns: columns,
            deriveColors: deriveColors,
            deriveColumns: deriveColumns,
            deriveColumnNames: deriveColumnNames,
        };
    };
    Adapter.prototype.resolveRankings = function () {
        var builders = this.adapter.rankingBuilders();
        return {
            builders: builders,
            restore: this.props.restore,
            derive: (builders.length === 0 && !this.props.restore) || Boolean(this.props.defaultRanking),
            supportTypes: this.props.defaultRanking !== 'noSupportTypes',
        };
    };
    Adapter.prototype.buildColumns = function (data, ctx) {
        this.prevColumns = ctx;
        var columns = ctx.columns.map(function (d) { return Object.assign({}, d); }); // work on copy
        if (ctx.deriveColumns) {
            var labels = new Set(columns.map(function (d) { return "".concat(d.type, "@").concat(d.label); }));
            var derived = deriveColumnDescriptions(data, { columns: ctx.deriveColumnNames });
            for (var _i = 0, derived_1 = derived; _i < derived_1.length; _i++) {
                var derive = derived_1[_i];
                if (labels.has("".concat(derive.type, "@").concat(derive.label))) {
                    // skip same name
                    continue;
                }
                columns.push(derive);
            }
        }
        if (ctx.deriveColors) {
            deriveColors(columns);
        }
        return columns;
    };
    Adapter.prototype.buildRankings = function (data, rankings) {
        data.clearRankings();
        this.prevRankings = rankings;
        if (rankings.derive) {
            data.deriveDefault(rankings.supportTypes);
        }
        if (rankings.restore) {
            data.restore(rankings.restore);
        }
        rankings.builders.forEach(function (b) { return buildRanking(b, data); });
    };
    Adapter.prototype.buildProvider = function () {
        var columns = this.buildColumns(this.props.data, this.resolveColumnDescs(this.props.data));
        var data = new LocalDataProvider(this.props.data, columns, pick(this.props, providerOptions));
        this.buildRankings(data, this.resolveRankings());
        data.setSelection(this.props.selection || []);
        data.on(LocalDataProvider.EVENT_SELECTION_CHANGED, this.onSelectionChanged);
        return data;
    };
    Adapter.prototype.updateLineUp = function (changeDetector, providerChanged) {
        // check lineup instance properties
        var changedLineUpOptions = isSame(this.props, changeDetector, lineupOptions);
        if (!changedLineUpOptions) {
            if (providerChanged) {
                this.instance.setDataProvider(this.data);
            }
            if (providerChanged || (this.props.highlight != null && this.prevHighlight !== this.props.highlight)) {
                this.prevHighlight = this.props.highlight == null ? -1 : this.props.highlight;
                this.instance.on(LineUp.EVENT_HIGHLIGHT_CHANGED, null);
                this.instance.setHighlight(this.prevHighlight);
                this.instance.on(LineUp.EVENT_HIGHLIGHT_CHANGED, this.onHighlightChanged);
                return true;
            }
            return false;
        }
        // recreate lineup
        if (this.instance) {
            this.instance.destroy();
        }
        this.instance = this.adapter.createInstance(this.data, changedLineUpOptions);
        this.prevHighlight = this.props.highlight == null ? -1 : this.props.highlight;
        this.instance.setHighlight(this.prevHighlight);
        this.instance.on(LineUp.EVENT_HIGHLIGHT_CHANGED, this.onHighlightChanged);
        return true;
    };
    Adapter.prototype.updateProvider = function (changeDetector) {
        var _this = this;
        var changedProviderOptions = isSame(this.props, changeDetector, providerOptions);
        if (changedProviderOptions || !this.data || changeDetector('data')) {
            // big change start from scratch
            this.data = this.buildProvider();
            return true;
        }
        var rankings = this.resolveRankings();
        var columns = this.resolveColumnDescs(this.props.data);
        var columnsChanged = !equal(this.prevColumns, columns);
        if (columnsChanged) {
            var descs = this.buildColumns(this.props.data, columns);
            this.data.clearColumns();
            descs.forEach(function (d) { return _this.data.pushDesc(d); });
        }
        if (columnsChanged || !equal(rankings, this.prevRankings)) {
            this.buildRankings(this.data, rankings);
        }
        this.data.on(LocalDataProvider.EVENT_SELECTION_CHANGED, null);
        this.data.setSelection(this.props.selection || []);
        this.data.on(LocalDataProvider.EVENT_SELECTION_CHANGED, this.onSelectionChanged);
        return false;
    };
    Adapter.prototype.componentDidUpdate = function (changeDetector) {
        var providerChanged = this.updateProvider(changeDetector);
        this.updateLineUp(changeDetector, providerChanged);
        // this.instance!.update();
    };
    Adapter.prototype.componentWillUnmount = function () {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
        this.data = null;
    };
    return Adapter;
}());
export { Adapter };
//# sourceMappingURL=lineup.js.map