import { type IArrayColumn, type ICategoricalLikeColumn } from '../model';
export declare const noRenderer: {
    template: string;
    update: () => void;
};
export declare function wideEnough(col: IArrayColumn<any>, length?: number): boolean;
export declare function wideEnoughCat(col: ICategoricalLikeColumn): boolean;
/**
 * Adapts the text color for a given background color
 * @param {string} bgColor as `#ff0000`
 * @returns {string} returns `black` or `white` for best contrast
 */
export declare function adaptTextColorToBgColor(bgColor: string): string;
/**
 *
 * Adapts the text color for a given background color
 * @param {HTMLElement} node the node containing the text
 * @param {string} bgColor as `#ff0000`
 * @param {string} title the title to render
 * @param {number} width for which percentages of the cell this background applies (0..1)
 */
export declare function adaptDynamicColorToBgColor(node: HTMLElement, bgColor: string, title: string, width: number): void;
export declare const BIG_MARK_LIGHTNESS_FACTOR = 1.1;
export declare const SMALL_MARK_LIGHTNESS_FACTOR = 0.9;
export declare function adaptColor(color: string, lightnessFactor?: number, saturationFactor?: number): string;
//# sourceMappingURL=utils.d.ts.map