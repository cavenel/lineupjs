import type { IDynamicHeight, ITaggleOptions, ILivePreviewOptions } from '../config';
import type { IGroupData, IGroupItem, Ranking } from '../model';
import type Column from '../model';
import type { ICellRendererFactory, ERenderMode } from '../renderer';
import type { IToolbarAction, IToolbarDialogAddon } from '../ui';
/**
 * builder for LineUp/Taggle instance
 */
export default class LineUpBuilder {
    protected readonly options: Partial<ITaggleOptions>;
    /**
     * option to enable/disable animated transitions
     * @default true
     */
    animated(enable: boolean): this;
    livePreviews(options: Partial<ILivePreviewOptions>): this;
    /**
     * option to rotate labels on demand in narrow columns
     * @param rotation rotation in degrees
     * @default 0 - disabled
     */
    labelRotation(rotation: number): this;
    /**
     * option to enable/disable the side panel
     * @param {boolean} enable enable flag
     * @param {boolean} collapsed whether collapsed by default
     */
    sidePanel(enable: boolean, collapsed?: boolean): this;
    /**
     * show the sorting and grouping hierarchy indicator in the side panel
     * @param {boolean} enable enable flag
     */
    hierarchyIndicator(enable: boolean): this;
    /**
     * option to specify the default slope graph mode
     * @default 'item'
     */
    defaultSlopeGraphMode(mode: 'item' | 'band'): this;
    /**
     * option to enable/disable showing a summary (histogram, ...) in the header
     * @default true
     */
    summaryHeader(enable: boolean): this;
    /**
     * option to enforce that the whole row is shown upon hover without overflow hidden
     * @default false
     */
    expandLineOnHover(enable: boolean): this;
    /**
     * option to enable overview mode by default, just valid when building a Taggle instance
     * @returns {this}
     */
    overviewMode(): this;
    /**
     * option to ignore unsupported browser check - at own risk
     * @returns {this}
     */
    ignoreUnsupportedBrowser(): this;
    /**
     * register a new renderer factory function
     * @param id the renderer id
     * @param factory factory class implementing the renderer
     */
    registerRenderer(id: string, factory: ICellRendererFactory): this;
    /**
     * custom function whether the given renderer should be allowed to render the give colum in the given mode
     */
    canRender(canRender: (type: string, renderer: ICellRendererFactory, col: Column, mode: ERenderMode) => boolean): this;
    /**
     * register another toolbar action which can be used within a model class
     * @param id toolbar id
     * @param action
     */
    registerToolbarAction(id: string, action: IToolbarAction): this;
    /**
     * register another toolbar action which can be sued within a model class
     * @param id  dialog id
     * @param addon addon description
     */
    registerToolbarDialogAddon(id: string, addon: IToolbarDialogAddon): this;
    /**
     * height and padding of a row
     * @default 18 and 2
     */
    rowHeight(rowHeight: number, rowPadding?: number): this;
    /**
     * height and padding of an aggregated group in pixel
     * @default 40 and 5
     */
    groupRowHeight(groupHeight: number, groupPadding?: number): this;
    /**
     * custom function to compute the height of a row (group or item)
     * @param {(data: (IGroupItem | IGroupData)[], ranking: Ranking) => (IDynamicHeight | null)} callback
     */
    dynamicHeight(callback: (data: (IGroupItem | IGroupData)[], ranking: Ranking) => IDynamicHeight | null): this;
    /**
     * disables advanced ranking features (sort by, group by, sorting hierarchy, ...)
     */
    disableAdvancedRankingFeatures(): this;
    /**
     * disables advanced model features (add combine column, data mapping, edit pattern, ...)
     */
    disableAdvancedModelFeatures(): this;
    /**
     * disables advanced ui features (change visualization, color mapping)
     */
    disableAdvancedUIFeatures(): this;
    /**
     * identifier for this LineUp instance. by default a random id is generated.
     * @default random string
     */
    instanceId(instanceId: string): this;
}
//# sourceMappingURL=LineUpBuilder.d.ts.map