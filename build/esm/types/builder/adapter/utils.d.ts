export { equal } from '../../internal';
export declare function isTypeInstance(clazz: any, superClass: any): boolean;
export declare function pick<T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]): Pick<T, keyof T>;
export declare function isSame<T extends Record<string, unknown>>(current: T, changed: (prop: keyof T) => boolean, props: (keyof T)[]): Pick<T, keyof T>;
//# sourceMappingURL=utils.d.ts.map