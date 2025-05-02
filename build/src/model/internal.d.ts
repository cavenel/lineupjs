import Column from './Column';
import { type IGroupParent, type IOrderedGroup } from './interfaces';
export declare function duplicateGroup<T extends IOrderedGroup | IGroupParent>(group: T): T;
/**
 * unify the parents of the given groups by reusing the same group parent if possible
 * @param groups
 */
export declare function unifyParents<T extends IOrderedGroup>(groups: T[]): T[];
export declare function getAllToolbarActions(col: Column): string[];
export declare function getAllToolbarDialogAddons(col: Column, key: string): string[];
//# sourceMappingURL=internal.d.ts.map