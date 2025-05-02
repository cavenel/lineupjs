import type { IActionColumnDesc, IBooleanColumnDesc, ICategoricalColumnDesc, IColumnDesc, IDateColumnDesc, IHierarchyColumnDesc, ILinkColumnDesc, INumberColumnDesc } from '../../model';
import type { IBuilderAdapterActionsColumnDescProps, IBuilderAdapterBooleanColumnDescProps, IBuilderAdapterCategoricalColumnDescProps, IBuilderAdapterColumnDescProps, IBuilderAdapterDateColumnDescProps, IBuilderAdapterHierarchyColumnDescProps, IBuilderAdapterNumberColumnDescProps, IBuilderAdapterStringColumnDescProps } from './interfaces';
export declare function build<T extends IBuilderAdapterColumnDescProps>(props: T, _data?: any[]): IColumnDesc;
export declare function buildCategorical(props: IBuilderAdapterCategoricalColumnDescProps, data: any[]): ICategoricalColumnDesc;
export declare function buildDate(props: IBuilderAdapterDateColumnDescProps): IDateColumnDesc;
export declare function buildHierarchy(props: Partial<IBuilderAdapterHierarchyColumnDescProps>): IHierarchyColumnDesc;
export declare function buildNumber(props: IBuilderAdapterNumberColumnDescProps, data: any[]): INumberColumnDesc;
export declare function buildString(props: IBuilderAdapterStringColumnDescProps): ILinkColumnDesc;
export declare function buildBoolean(props: IBuilderAdapterBooleanColumnDescProps): IBooleanColumnDesc;
export declare function buildActions(props: IBuilderAdapterActionsColumnDescProps): IActionColumnDesc;
//# sourceMappingURL=column.d.ts.map