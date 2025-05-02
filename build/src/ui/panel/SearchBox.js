var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { clear, AEventDispatcher } from '../../internal';
import { cssClass } from '../../styles';
function isItem(v) {
    return v.id !== undefined;
}
var SearchBox = /** @class */ (function (_super) {
    __extends(SearchBox, _super);
    function SearchBox(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = {
            formatItem: function (item, node) {
                node.textContent = item.text;
            },
            doc: document,
            placeholder: 'Select...',
        };
        _this.values = [];
        Object.assign(_this.options, options);
        _this.node = _this.options.doc.createElement('div');
        _this.node.classList.add(cssClass('search'));
        _this.node.innerHTML = "<input class=\"".concat(cssClass('search-input'), "\" type=\"search\">\n    <ul class=\"").concat(cssClass('search-list'), "\"></ul>");
        _this.search = _this.node.firstElementChild;
        _this.search.placeholder = _this.options.placeholder;
        _this.body = _this.node.lastElementChild;
        _this.search.onfocus = function () { return _this.focus(); };
        _this.search.onblur = function () { return _this.blur(); };
        _this.search.oninput = function () { return _this.filter(); };
        _this.search.onkeydown = function (evt) { return _this.handleKey(evt); };
        _this.itemTemplate = _this.options.doc.createElement('li');
        _this.itemTemplate.classList.add(cssClass('search-item'));
        _this.itemTemplate.innerHTML = "<span></span>";
        _this.groupTemplate = _this.options.doc.createElement('li');
        _this.groupTemplate.classList.add(cssClass('search-group'));
        _this.groupTemplate.innerHTML = "<span></span><ul></ul>";
        return _this;
    }
    Object.defineProperty(SearchBox.prototype, "data", {
        get: function () {
            return this.values;
        },
        set: function (data) {
            this.values = data;
            clear(this.body);
            this.buildDialog(this.body, this.values);
        },
        enumerable: false,
        configurable: true
    });
    SearchBox.prototype.buildDialog = function (node, values) {
        var _this = this;
        var _loop_1 = function (v) {
            var li;
            if (isItem(v)) {
                li = this_1.itemTemplate.cloneNode(true);
                li.onmousedown = function (evt) {
                    // see https://stackoverflow.com/questions/10652852/jquery-fire-click-before-blur-event#10653160
                    evt.preventDefault();
                };
                li.onclick = function () { return _this.select(v); };
                li.onmouseenter = function () { return (_this.highlighted = li); };
                li.onmouseleave = function () { return (_this.highlighted = null); };
                node.appendChild(li);
            }
            else {
                li = this_1.groupTemplate.cloneNode(true);
                this_1.buildDialog(li.lastElementChild, v.children);
                node.appendChild(li);
            }
            var item = li.firstElementChild;
            this_1.options.formatItem(v, item);
        };
        var this_1 = this;
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var v = values_1[_i];
            _loop_1(v);
        }
    };
    SearchBox.prototype.handleKey = function (evt) {
        switch (evt.key) {
            case 'Escape':
                this.search.blur();
                break;
            case 'Enter': {
                var h = this.highlighted;
                if (h) {
                    h.click();
                }
                else {
                    evt.preventDefault();
                }
                break;
            }
            case 'ArrowUp':
                this.highlightPrevious();
                break;
            case 'ArrowDown':
                this.highlightNext();
                break;
        }
    };
    SearchBox.prototype.select = function (item) {
        this.search.value = ''; // reset
        this.search.blur();
        this.fire(SearchBox.EVENT_SELECT, item);
    };
    SearchBox.prototype.focus = function () {
        this.body.style.width = "".concat(this.search.offsetWidth, "px");
        this.highlighted = this.body.querySelector(SearchBox.SEARCH_ITEM_SELECTOR) || null;
        this.node.classList.add(cssClass('search-open'));
    };
    Object.defineProperty(SearchBox.prototype, "highlighted", {
        get: function () {
            var _a;
            return (_a = this.body.getElementsByClassName(cssClass('search-highlighted'))[0]) !== null && _a !== void 0 ? _a : null;
        },
        set: function (value) {
            var old = this.highlighted;
            if (old === value) {
                return;
            }
            if (old) {
                old.classList.remove(cssClass('search-highlighted'));
            }
            if (value) {
                value.classList.add(cssClass('search-highlighted'));
            }
        },
        enumerable: false,
        configurable: true
    });
    SearchBox.prototype.highlightNext = function () {
        var h = this.highlighted;
        if (!h || h.classList.contains(cssClass('hidden'))) {
            this.highlighted = this.body.querySelector(SearchBox.SEARCH_ITEM_SELECTOR) || null;
            return;
        }
        var items = Array.from(this.body.querySelectorAll(SearchBox.SEARCH_ITEM_SELECTOR));
        var index = items.indexOf(h);
        this.highlighted = items[index + 1] || null;
    };
    SearchBox.prototype.highlightPrevious = function () {
        var h = this.highlighted;
        var items = Array.from(this.body.querySelectorAll(SearchBox.SEARCH_ITEM_SELECTOR));
        if (!h || h.classList.contains(cssClass('hidden'))) {
            this.highlighted = items[items.length - 1] || null;
            return;
        }
        var index = items.indexOf(h);
        this.highlighted = items[index - 1] || null;
    };
    SearchBox.prototype.blur = function () {
        this.search.value = '';
        // clear filter
        this.filterResults(this.body, '');
        this.node.classList.remove(cssClass('search-open'));
    };
    SearchBox.prototype.filter = function () {
        var empty = this.filterResults(this.body, this.search.value.toLowerCase());
        this.body.classList.toggle(cssClass('search-empty'), empty);
    };
    SearchBox.prototype.filterResults = function (node, text) {
        var _this = this;
        if (text === '') {
            // show all
            Array.from(node.getElementsByClassName(cssClass('hidden'))).forEach(function (d) {
                return d.classList.remove(cssClass('hidden'));
            });
            return false;
        }
        var children = Array.from(node.children);
        children.forEach(function (d) {
            var content = d.firstElementChild.innerHTML.toLowerCase();
            var hidden = !content.includes(text);
            if (d.classList.contains(cssClass('search-group'))) {
                var ul = d.lastElementChild;
                var allChildrenHidden = _this.filterResults(ul, text);
                hidden = hidden && allChildrenHidden;
            }
            d.classList.toggle(cssClass('hidden'), hidden);
        });
        return children.every(function (d) { return d.classList.contains(cssClass('hidden')); });
    };
    SearchBox.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([SearchBox.EVENT_SELECT]);
    };
    SearchBox.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    SearchBox.EVENT_SELECT = 'select';
    SearchBox.SEARCH_ITEM_SELECTOR = ".".concat(cssClass('search-item'), ":not(.").concat(cssClass('hidden'), ")");
    return SearchBox;
}(AEventDispatcher));
export default SearchBox;
//# sourceMappingURL=SearchBox.js.map