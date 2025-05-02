import type { Column } from '../model';
import { ERenderMode, type ICellRendererFactory } from './interfaces';
/**
 * default render factories
 */
export declare const renderers: {
    [key: string]: ICellRendererFactory;
};
export declare function chooseRenderer(col: Column, renderers: {
    [key: string]: ICellRendererFactory;
}): ICellRendererFactory;
export declare function chooseGroupRenderer(col: Column, renderers: {
    [key: string]: ICellRendererFactory;
}): ICellRendererFactory;
export declare function chooseSummaryRenderer(col: Column, renderers: {
    [key: string]: ICellRendererFactory;
}): ICellRendererFactory;
/**
 * determined the list of possible renderers for a given colum
 * @param col the column to resolve the renderers
 * @param renderers map of possible renderers
 * @param canRender optional custom canRender function
 */
export declare function getPossibleRenderer(col: Column, renderers: {
    [key: string]: ICellRendererFactory;
}, canRender?: (type: string, renderer: ICellRendererFactory, col: Column, mode: ERenderMode) => boolean): {
    item: {
        type: string;
        label: string;
    }[];
    group: {
        type: string;
        label: string;
    }[];
    summary: {
        type: string;
        label: string;
    }[];
};
//# sourceMappingURL=renderers.d.ts.map