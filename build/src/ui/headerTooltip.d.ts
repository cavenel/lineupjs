import Column from '../model';
import type { IRankingHeaderContext, IToolbarAction } from './interfaces';
export declare function addIconDOM(node: HTMLElement, col: Column, ctx: IRankingHeaderContext, level: number, showLabel: boolean, mode: 'header' | 'sidePanel'): (action: IToolbarAction) => HTMLElement;
export declare function isActionMode(col: Column, d: IToolbarAction, mode: 'header' | 'sidePanel', value: 'menu' | 'menu+shortcut' | 'shortcut'): boolean;
//# sourceMappingURL=headerTooltip.d.ts.map