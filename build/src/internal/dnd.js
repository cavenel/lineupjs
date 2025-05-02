var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { cssClass } from '../styles';
/** @internal */
export function hasDnDType(e) {
    var typesToCheck = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        typesToCheck[_i - 1] = arguments[_i];
    }
    var available = e.dataTransfer.types;
    /*
     * In Chrome data transfer.types is an Array,
     * while in Firefox it is a DOMStringList
     * that only implements a contains-method!
     */
    if (typeof available.indexOf === 'function') {
        return typesToCheck.some(function (type) { return available.indexOf(type) >= 0; });
    }
    if (typeof available.includes === 'function') {
        return typesToCheck.some(function (type) { return available.includes(type); });
    }
    if (typeof available.contains === 'function') {
        return typesToCheck.some(function (type) { return available.contains(type); });
    }
    return false;
}
/**
 * helper storage for dnd in edge since edge doesn't support custom mime-types
 * @type {Map<number, {[p: string]: string}>}
 */
var dndTransferStorage = new Map();
function isEdgeDnD(e) {
    return dndTransferStorage.size > 0 && hasDnDType(e, 'text/plain');
}
/**
 * checks whether it is a copy operation
 * @param e
 * @returns {boolean|RegExpMatchArray}
 * @internal
 */
export function copyDnD(e) {
    var dT = e.dataTransfer;
    return Boolean((e.ctrlKey && dT.effectAllowed.match(/copy/gi)) || !dT.effectAllowed.match(/move/gi));
}
/**
 * updates the drop effect according to the current copyDnD state
 * @param e
 * @internal
 */
export function updateDropEffect(e) {
    var dT = e.dataTransfer;
    if (copyDnD(e)) {
        dT.dropEffect = 'copy';
    }
    else {
        dT.dropEffect = 'move';
    }
}
var idCounter = 0;
/**
 * add drag support for the given element
 * @param {HTMLElement} node
 * @param {() => IDragStartResult} onDragStart callback to compute the payload an object of mime types
 * @param {boolean} stopPropagation whether to stop propagation in case of success
 * @internal
 */
export function dragAble(node, onDragStart, onDragEnd, stopPropagation) {
    if (stopPropagation === void 0) { stopPropagation = false; }
    var id = ++idCounter;
    node.classList.add(cssClass('dragable'));
    node.draggable = true;
    node.addEventListener('dragstart', function (e) {
        node.classList.add(cssClass('dragging'));
        var payload = onDragStart();
        e.dataTransfer.effectAllowed = payload.effectAllowed;
        if (stopPropagation) {
            e.stopPropagation();
        }
        // copy all data transfer objects
        var keys = Object.keys(payload.data);
        var allSucceeded = keys.every(function (k) {
            try {
                e.dataTransfer.setData(k, payload.data[k]);
                return true;
            }
            catch (_a) {
                return false;
            }
        });
        if (allSucceeded) {
            return;
        }
        //compatibility mode for edge
        var text = payload.data['text/plain'] || '';
        e.dataTransfer.setData('text/plain', "".concat(id).concat(text ? ": ".concat(text) : ''));
        dndTransferStorage.set(id, payload.data);
    });
    node.addEventListener('dragend', function (e) {
        node.classList.remove(cssClass('dragging'));
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (dndTransferStorage.size > 0) {
            //clear the id
            dndTransferStorage.delete(id);
        }
        // remove all
        var over = node.ownerDocument.getElementsByClassName(cssClass('dragover'))[0];
        if (over) {
            over.classList.remove(cssClass('dragover'));
        }
        if (onDragEnd) {
            onDragEnd();
        }
    });
}
/**
 * add dropable support for the given node
 * @param {HTMLElement} node
 * @param {string[]} mimeTypes mimeTypes to look for
 * @param {(result: IDropResult, e: DragEvent) => boolean} onDrop callback when dropped, returns true if the drop was successful
 * @param {(e: DragEvent) => void} onDragOver optional drag over handler, e.g. for special effects
 * @param {boolean} stopPropagation flag if the event propagation should be stopped in case of success
 * @param {() => boolean} optional whether to enable dropping at all
 * @internal
 */
export function dropAble(node, mimeTypes, onDrop, onDragOver, stopPropagation, canDrop) {
    if (onDragOver === void 0) { onDragOver = null; }
    if (stopPropagation === void 0) { stopPropagation = false; }
    if (canDrop === void 0) { canDrop = function () { return true; }; }
    node.addEventListener('dragenter', function (e) {
        //var xy = mouse($node.node());
        if (node.classList.contains(cssClass('dragging')) || !(hasDnDType.apply(void 0, __spreadArray([e], mimeTypes, false)) || isEdgeDnD(e)) || !canDrop()) {
            // not a valid mime type
            node.classList.remove(cssClass('dragover'));
            return undefined;
        }
        node.classList.add(cssClass('dragover'));
        if (stopPropagation) {
            e.stopPropagation();
        }
        //sounds good
        return false;
    });
    node.addEventListener('dragover', function (e) {
        if (node.classList.contains(cssClass('dragging')) || !(hasDnDType.apply(void 0, __spreadArray([e], mimeTypes, false)) || isEdgeDnD(e)) || !canDrop()) {
            // not a valid mime type
            return undefined;
        }
        e.preventDefault();
        updateDropEffect(e);
        node.classList.add(cssClass('dragover'));
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (onDragOver) {
            onDragOver(e);
        }
        //sound good
        return false;
    });
    node.addEventListener('dragleave', function (evt) {
        // same fix as in phovea
        evt.target.classList.remove(cssClass('dragover'));
    });
    node.addEventListener('drop', function (e) {
        e.preventDefault();
        if (stopPropagation) {
            e.stopPropagation();
        }
        updateDropEffect(e);
        var effect = e.dataTransfer.dropEffect;
        node.classList.remove(cssClass('dragover'));
        if (isEdgeDnD(e)) {
            // retrieve from helper
            var base = e.dataTransfer.getData('text/plain');
            var id = Number.parseInt(base.indexOf(':') >= 0 ? base.substring(0, base.indexOf(':')) : base, 10);
            if (dndTransferStorage.has(id)) {
                var data_1 = dndTransferStorage.get(id);
                dndTransferStorage.delete(id);
                return !onDrop({ effect: effect, data: data_1 }, e);
            }
            return undefined;
        }
        if (!hasDnDType.apply(void 0, __spreadArray([e], mimeTypes, false))) {
            return undefined;
        }
        // copy sub mime types
        var data = {};
        //selects the data contained in the data transfer
        mimeTypes.forEach(function (mime) {
            var value = e.dataTransfer.getData(mime);
            if (value !== '') {
                data[mime] = value;
            }
        });
        return !onDrop({ effect: effect, data: data }, e);
    });
}
//# sourceMappingURL=dnd.js.map