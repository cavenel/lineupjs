import type { IKeyValue, IMapColumn } from './IArrayColumn';
import type { IDataRow, IValueColumnDesc } from './interfaces';
import ValueColumn from './ValueColumn';
export type IMapColumnDesc<T> = IValueColumnDesc<IKeyValue<T>[]>;
export default class MapColumn<T> extends ValueColumn<IKeyValue<T>[]> implements IMapColumn<T> {
    constructor(id: string, desc: Readonly<IMapColumnDesc<T>>);
    getValue(row: IDataRow): IKeyValue<T>[];
    getLabels(row: IDataRow): IKeyValue<string>[];
    getMap(row: IDataRow): IKeyValue<T>[];
    getMapLabel(row: IDataRow): IKeyValue<string>[];
    getLabel(row: IDataRow): string;
}
//# sourceMappingURL=MapColumn.d.ts.map