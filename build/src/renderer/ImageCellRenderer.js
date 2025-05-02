import { Column, LinkColumn } from '../model';
import { ERenderMode, } from './interfaces';
import { renderMissingDOM } from './missing';
import { noRenderer } from './utils';
import { abortAble } from 'lineupengine';
function loadImage(src) {
    return new Promise(function (resolve) {
        var image = new Image();
        image.onload = function () { return resolve(image); };
        image.src = src;
    });
}
var ImageCellRenderer = /** @class */ (function () {
    function ImageCellRenderer() {
        this.title = 'Image';
    }
    ImageCellRenderer.prototype.canRender = function (col, mode) {
        return col instanceof LinkColumn && mode === ERenderMode.CELL;
    };
    ImageCellRenderer.prototype.create = function (col) {
        return {
            template: "<div></div>",
            update: function (n, d) {
                var missing = renderMissingDOM(n, col, d);
                n.style.backgroundImage = null;
                if (missing) {
                    n.title = '';
                    return undefined;
                }
                var v = col.getLink(d);
                n.title = v ? v.alt : '';
                if (!v) {
                    return undefined;
                }
                return abortAble(loadImage(v.href)).then(function (image) {
                    if (typeof image === 'symbol') {
                        return;
                    }
                    n.style.backgroundImage = missing || !v ? null : "url('".concat(image.src, "')");
                });
            },
        };
    };
    ImageCellRenderer.prototype.createGroup = function () {
        return noRenderer;
    };
    ImageCellRenderer.prototype.createSummary = function () {
        return noRenderer;
    };
    return ImageCellRenderer;
}());
export default ImageCellRenderer;
//# sourceMappingURL=ImageCellRenderer.js.map