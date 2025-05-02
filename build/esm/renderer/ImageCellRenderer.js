import { Column, LinkColumn } from '../model';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { noRenderer } from './utils';
import { abortAble } from 'lineupengine';
function loadImage(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = src;
    });
}
export default class ImageCellRenderer {
    constructor() {
        this.title = 'Image';
    }
    canRender(col, mode) {
        return col instanceof LinkColumn && mode === ERenderMode.CELL;
    }
    create(col) {
        return {
            template: `<div></div>`,
            update: (n, d) => {
                const missing = renderMissingDOM(n, col, d);
                n.style.backgroundImage = null;
                if (missing) {
                    n.title = '';
                    return undefined;
                }
                const v = col.getLink(d);
                n.title = v ? v.alt : '';
                if (!v) {
                    return undefined;
                }
                return abortAble(loadImage(v.href)).then((image) => {
                    if (typeof image === 'symbol') {
                        return;
                    }
                    n.style.backgroundImage = missing || !v ? null : `url('${image.src}')`;
                });
            },
        };
    }
    createGroup() {
        return noRenderer;
    }
    createSummary() {
        return noRenderer;
    }
}
