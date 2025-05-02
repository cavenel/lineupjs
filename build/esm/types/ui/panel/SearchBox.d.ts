import { AEventDispatcher, type IEventListener } from '../../internal';
export interface IItem {
    id: string;
    text: string;
}
export interface IGroupSearchItem<T extends IItem> {
    text: string;
    children: (T | IGroupSearchItem<T>)[];
}
export interface ISearchBoxOptions<T extends IItem> {
    doc: Document;
    formatItem(item: T | IGroupSearchItem<T>, node: HTMLElement): void;
    placeholder: string;
}
/**
 * @asMemberOf SearchBox
 * @event
 */
export declare function select(item: any): void;
export default class SearchBox<T extends IItem> extends AEventDispatcher {
    static readonly EVENT_SELECT = "select";
    private static readonly SEARCH_ITEM_SELECTOR;
    private readonly options;
    readonly node: HTMLElement;
    private search;
    private body;
    private readonly itemTemplate;
    private readonly groupTemplate;
    private values;
    constructor(options?: Partial<ISearchBoxOptions<T>>);
    get data(): (T | IGroupSearchItem<T>)[];
    set data(data: (T | IGroupSearchItem<T>)[]);
    private buildDialog;
    private handleKey;
    private select;
    focus(): void;
    private get highlighted();
    private set highlighted(value);
    private highlightNext;
    private highlightPrevious;
    private blur;
    private filter;
    private filterResults;
    protected createEventList(): string[];
    on(type: typeof SearchBox.EVENT_SELECT, listener: typeof select | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
}
//# sourceMappingURL=SearchBox.d.ts.map