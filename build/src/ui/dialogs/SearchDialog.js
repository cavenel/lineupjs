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
import ADialog, {} from './ADialog';
import { aria, cssClass } from '../../styles';
import { debounce } from '../../internal';
/** @internal */
var SearchDialog = /** @class */ (function (_super) {
    __extends(SearchDialog, _super);
    function SearchDialog(column, dialog, provider) {
        var _this = _super.call(this, dialog, {
            livePreview: 'search',
        }) || this;
        _this.column = column;
        _this.provider = provider;
        _this.current = null;
        return _this;
    }
    SearchDialog.prototype.build = function (node) {
        var _this = this;
        // NOTE: the next button is of type submit to enable jumping to the next search result with the enter key in the search input field
        node.insertAdjacentHTML('beforeend', "<div class=\"".concat(cssClass('string-search-dialog'), "\">\n        <input type=\"text\" size=\"20\" value=\"\" required autofocus placeholder=\"Enter a search term...\">\n        <div class=\"").concat(cssClass('search-count'), "\" hidden>\n          <span class=\"").concat(cssClass('search-current'), "\"></span>/<span class=\"").concat(cssClass('search-total'), "\"></span>\n        </div>\n        <button type=\"button\" class=\"").concat(cssClass('previous-result'), "\" title=\"Previous search result\" disabled>").concat(aria('Previous search result'), "</button>\n        <button type=\"submit\" class=\"").concat(cssClass('next-result'), "\" title=\"Next search result\" disabled>").concat(aria('Next search result'), "</button>\n      </div>\n      <label class=\"").concat(cssClass('checkbox'), "\">\n        <input type=\"checkbox\">\n        <span>Use regular expressions</span>\n      </label>\n    "));
        var input = node.querySelector('input[type="text"]');
        var checkbox = node.querySelector('input[type="checkbox"]');
        var previous = node.querySelector(".".concat(cssClass('previous-result')));
        var next = node.querySelector(".".concat(cssClass('next-result')));
        var update = function () {
            var search = input.value;
            if (search.length === 0) {
                input.setCustomValidity('Enter a search term');
                return;
            }
            input.setCustomValidity('');
        };
        input.addEventListener('input', update, {
            passive: true,
        });
        checkbox.addEventListener('change', update, {
            passive: true,
        });
        previous.addEventListener('click', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            _this.jumpToPreviousResult();
        });
        next.addEventListener('click', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            _this.jumpToNextResult();
        });
        this.enableLivePreviews([input, checkbox]);
        if (!this.showLivePreviews()) {
            return;
        }
        input.addEventListener('input', debounce(function () { return _this.searchAndJump(); }, 100), {
            passive: true,
        });
    };
    SearchDialog.prototype.jumpToPreviousResult = function () {
        if (this.current) {
            var searchCount = this.find(".".concat(cssClass('search-count')));
            var current = searchCount.querySelector(".".concat(cssClass('search-current')));
            var previous = (this.current.index - 1 + this.current.indices.length) % this.current.indices.length;
            this.current.index = previous;
            current.textContent = String(previous + 1);
            this.provider.jumpToNearest([this.current.indices[previous]]);
        }
    };
    SearchDialog.prototype.jumpToNextResult = function () {
        if (this.current) {
            var searchCount = this.find(".".concat(cssClass('search-count')));
            var current = searchCount.querySelector(".".concat(cssClass('search-current')));
            var next = (this.current.index + 1) % this.current.indices.length;
            this.current.index = next;
            current.textContent = String(next + 1);
            this.provider.jumpToNearest([this.current.indices[next]]);
        }
    };
    SearchDialog.prototype.searchAndJump = function () {
        var input = this.findInput('input[type="text"]');
        var checkbox = this.findInput('input[type="checkbox"]');
        var previous = this.find(".".concat(cssClass('previous-result')));
        var next = this.find(".".concat(cssClass('next-result')));
        var searchCount = this.find(".".concat(cssClass('search-count')));
        var search = input.value;
        var isRegex = checkbox.checked;
        if (search.length === 0) {
            this.current = null;
            previous.disabled = true;
            next.disabled = true;
            searchCount.hidden = true;
            return false;
        }
        var indices = this.provider.searchAndJump(isRegex ? new RegExp(search) : search, this.column, true);
        if (indices) {
            this.current = {
                search: search,
                isRegex: isRegex,
                indices: indices,
                index: 0,
            };
            var current = searchCount.querySelector(".".concat(cssClass('search-current')));
            var total = searchCount.querySelector(".".concat(cssClass('search-total')));
            current.textContent = String(indices.length < 1 ? this.current.index : this.current.index + 1);
            total.textContent = String(indices.length);
            searchCount.hidden = false;
            previous.disabled = indices.length < 1;
            next.disabled = indices.length < 1;
            return indices.length > 1;
        }
        else {
            this.current = null;
            searchCount.hidden = true;
            previous.disabled = true;
            next.disabled = true;
        }
        return true;
    };
    SearchDialog.prototype.submit = function () {
        return true;
    };
    SearchDialog.prototype.reset = function () {
        var input = this.findInput('input[type="text"]');
        var checkbox = this.findInput('input[type="checkbox"]');
        var previous = this.find(".".concat(cssClass('previous-result')));
        var next = this.find(".".concat(cssClass('next-result')));
        var searchCount = this.find(".".concat(cssClass('search-count')));
        this.current = null;
        input.value = '';
        checkbox.checked = false;
        previous.disabled = true;
        next.disabled = true;
        searchCount.hidden = true;
    };
    SearchDialog.prototype.cancel = function () {
        // nothing to do
    };
    return SearchDialog;
}(ADialog));
export default SearchDialog;
//# sourceMappingURL=SearchDialog.js.map