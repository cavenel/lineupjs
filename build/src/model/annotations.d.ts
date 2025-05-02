import 'reflect-metadata';
import type Column from './Column';
import type { IColumnDesc, IColumnConstructor } from './interfaces';
export declare function SupportType(): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function SortByDefault(order?: 'ascending' | 'descending'): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function isSortingAscByDefault(col: Column): boolean;
export declare class Categories {
    readonly string: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly categorical: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly number: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly date: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly array: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly map: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly composite: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly support: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
    readonly other: {
        label: string;
        order: number;
        name: string;
        featureLevel: string;
    };
}
export declare const categories: Categories;
export declare function Category(cat: keyof Categories): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function getSortType(col: Column): 'abc' | 'num' | undefined;
export declare function toolbar(...keys: string[]): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function dialogAddons(key: string, ...keys: string[]): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function isSupportType(col: Column): boolean;
export interface IColumnCategory {
    label: string;
    name: string;
    order: number;
    featureLevel: 'basic' | 'advanced';
}
export declare function categoryOf(col: IColumnConstructor | Column): IColumnCategory;
export declare function categoryOfDesc(col: IColumnDesc | string, models: {
    [key: string]: IColumnConstructor;
}): IColumnCategory;
//# sourceMappingURL=annotations.d.ts.map