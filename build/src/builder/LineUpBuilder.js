/**
 * builder for LineUp/Taggle instance
 */
var LineUpBuilder = /** @class */ (function () {
    function LineUpBuilder() {
        this.options = {
            renderers: {},
            toolbarActions: {},
            toolbarDialogAddons: {},
            flags: {},
        };
    }
    /**
     * option to enable/disable animated transitions
     * @default true
     */
    LineUpBuilder.prototype.animated = function (enable) {
        this.options.animated = enable;
        return this;
    };
    LineUpBuilder.prototype.livePreviews = function (options) {
        this.options.livePreviews = options;
        return this;
    };
    /**
     * option to rotate labels on demand in narrow columns
     * @param rotation rotation in degrees
     * @default 0 - disabled
     */
    LineUpBuilder.prototype.labelRotation = function (rotation) {
        this.options.labelRotation = rotation;
        return this;
    };
    /**
     * option to enable/disable the side panel
     * @param {boolean} enable enable flag
     * @param {boolean} collapsed whether collapsed by default
     */
    LineUpBuilder.prototype.sidePanel = function (enable, collapsed) {
        if (collapsed === void 0) { collapsed = false; }
        this.options.sidePanel = enable;
        this.options.sidePanelCollapsed = collapsed;
        return this;
    };
    /**
     * show the sorting and grouping hierarchy indicator in the side panel
     * @param {boolean} enable enable flag
     */
    LineUpBuilder.prototype.hierarchyIndicator = function (enable) {
        this.options.hierarchyIndicator = enable;
        return this;
    };
    /**
     * option to specify the default slope graph mode
     * @default 'item'
     */
    LineUpBuilder.prototype.defaultSlopeGraphMode = function (mode) {
        this.options.defaultSlopeGraphMode = mode;
        return this;
    };
    /**
     * option to enable/disable showing a summary (histogram, ...) in the header
     * @default true
     */
    LineUpBuilder.prototype.summaryHeader = function (enable) {
        this.options.summaryHeader = enable;
        return this;
    };
    /**
     * option to enforce that the whole row is shown upon hover without overflow hidden
     * @default false
     */
    LineUpBuilder.prototype.expandLineOnHover = function (enable) {
        this.options.expandLineOnHover = enable;
        return this;
    };
    /**
     * option to enable overview mode by default, just valid when building a Taggle instance
     * @returns {this}
     */
    LineUpBuilder.prototype.overviewMode = function () {
        this.options.overviewMode = true;
        return this;
    };
    /**
     * option to ignore unsupported browser check - at own risk
     * @returns {this}
     */
    LineUpBuilder.prototype.ignoreUnsupportedBrowser = function () {
        this.options.ignoreUnsupportedBrowser = true;
        return this;
    };
    /**
     * register a new renderer factory function
     * @param id the renderer id
     * @param factory factory class implementing the renderer
     */
    LineUpBuilder.prototype.registerRenderer = function (id, factory) {
        this.options.renderers[id] = factory;
        return this;
    };
    /**
     * custom function whether the given renderer should be allowed to render the give colum in the given mode
     */
    LineUpBuilder.prototype.canRender = function (canRender) {
        this.options.canRender = canRender;
        return this;
    };
    /**
     * register another toolbar action which can be used within a model class
     * @param id toolbar id
     * @param action
     */
    LineUpBuilder.prototype.registerToolbarAction = function (id, action) {
        this.options.toolbarActions[id] = action;
        return this;
    };
    /**
     * register another toolbar action which can be sued within a model class
     * @param id  dialog id
     * @param addon addon description
     */
    LineUpBuilder.prototype.registerToolbarDialogAddon = function (id, addon) {
        this.options.toolbarDialogAddons[id] = addon;
        return this;
    };
    /**
     * height and padding of a row
     * @default 18 and 2
     */
    LineUpBuilder.prototype.rowHeight = function (rowHeight, rowPadding) {
        if (rowPadding === void 0) { rowPadding = 2; }
        this.options.rowHeight = rowHeight;
        this.options.rowPadding = rowPadding;
        return this;
    };
    /**
     * height and padding of an aggregated group in pixel
     * @default 40 and 5
     */
    LineUpBuilder.prototype.groupRowHeight = function (groupHeight, groupPadding) {
        if (groupPadding === void 0) { groupPadding = 5; }
        this.options.groupHeight = groupHeight;
        this.options.groupPadding = groupPadding;
        return this;
    };
    /**
     * custom function to compute the height of a row (group or item)
     * @param {(data: (IGroupItem | IGroupData)[], ranking: Ranking) => (IDynamicHeight | null)} callback
     */
    LineUpBuilder.prototype.dynamicHeight = function (callback) {
        this.options.dynamicHeight = callback;
        return this;
    };
    /**
     * disables advanced ranking features (sort by, group by, sorting hierarchy, ...)
     */
    LineUpBuilder.prototype.disableAdvancedRankingFeatures = function () {
        this.options.flags.advancedRankingFeatures = false;
        return this;
    };
    /**
     * disables advanced model features (add combine column, data mapping, edit pattern, ...)
     */
    LineUpBuilder.prototype.disableAdvancedModelFeatures = function () {
        this.options.flags.advancedModelFeatures = false;
        return this;
    };
    /**
     * disables advanced ui features (change visualization, color mapping)
     */
    LineUpBuilder.prototype.disableAdvancedUIFeatures = function () {
        this.options.flags.advancedUIFeatures = false;
        return this;
    };
    /**
     * identifier for this LineUp instance. by default a random id is generated.
     * @default random string
     */
    LineUpBuilder.prototype.instanceId = function (instanceId) {
        this.options.instanceId = instanceId;
        return this;
    };
    return LineUpBuilder;
}());
export default LineUpBuilder;
//# sourceMappingURL=LineUpBuilder.js.map