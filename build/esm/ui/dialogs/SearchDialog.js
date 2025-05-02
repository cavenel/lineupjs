import ADialog, {} from './ADialog';
import { aria, cssClass } from '../../styles';
import { debounce } from '../../internal';
/** @internal */
export default class SearchDialog extends ADialog {
    constructor(column, dialog, provider) {
        super(dialog, {
            livePreview: 'search',
        });
        this.column = column;
        this.provider = provider;
        this.current = null;
    }
    build(node) {
        // NOTE: the next button is of type submit to enable jumping to the next search result with the enter key in the search input field
        node.insertAdjacentHTML('beforeend', `<div class="${cssClass('string-search-dialog')}">
        <input type="text" size="20" value="" required autofocus placeholder="Enter a search term...">
        <div class="${cssClass('search-count')}" hidden>
          <span class="${cssClass('search-current')}"></span>/<span class="${cssClass('search-total')}"></span>
        </div>
        <button type="button" class="${cssClass('previous-result')}" title="Previous search result" disabled>${aria('Previous search result')}</button>
        <button type="submit" class="${cssClass('next-result')}" title="Next search result" disabled>${aria('Next search result')}</button>
      </div>
      <label class="${cssClass('checkbox')}">
        <input type="checkbox">
        <span>Use regular expressions</span>
      </label>
    `);
        const input = node.querySelector('input[type="text"]');
        const checkbox = node.querySelector('input[type="checkbox"]');
        const previous = node.querySelector(`.${cssClass('previous-result')}`);
        const next = node.querySelector(`.${cssClass('next-result')}`);
        const update = () => {
            const search = input.value;
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
        previous.addEventListener('click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.jumpToPreviousResult();
        });
        next.addEventListener('click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.jumpToNextResult();
        });
        this.enableLivePreviews([input, checkbox]);
        if (!this.showLivePreviews()) {
            return;
        }
        input.addEventListener('input', debounce(() => this.searchAndJump(), 100), {
            passive: true,
        });
    }
    jumpToPreviousResult() {
        if (this.current) {
            const searchCount = this.find(`.${cssClass('search-count')}`);
            const current = searchCount.querySelector(`.${cssClass('search-current')}`);
            const previous = (this.current.index - 1 + this.current.indices.length) % this.current.indices.length;
            this.current.index = previous;
            current.textContent = String(previous + 1);
            this.provider.jumpToNearest([this.current.indices[previous]]);
        }
    }
    jumpToNextResult() {
        if (this.current) {
            const searchCount = this.find(`.${cssClass('search-count')}`);
            const current = searchCount.querySelector(`.${cssClass('search-current')}`);
            const next = (this.current.index + 1) % this.current.indices.length;
            this.current.index = next;
            current.textContent = String(next + 1);
            this.provider.jumpToNearest([this.current.indices[next]]);
        }
    }
    searchAndJump() {
        const input = this.findInput('input[type="text"]');
        const checkbox = this.findInput('input[type="checkbox"]');
        const previous = this.find(`.${cssClass('previous-result')}`);
        const next = this.find(`.${cssClass('next-result')}`);
        const searchCount = this.find(`.${cssClass('search-count')}`);
        const search = input.value;
        const isRegex = checkbox.checked;
        if (search.length === 0) {
            this.current = null;
            previous.disabled = true;
            next.disabled = true;
            searchCount.hidden = true;
            return false;
        }
        const indices = this.provider.searchAndJump(isRegex ? new RegExp(search) : search, this.column, true);
        if (indices) {
            this.current = {
                search,
                isRegex,
                indices,
                index: 0,
            };
            const current = searchCount.querySelector(`.${cssClass('search-current')}`);
            const total = searchCount.querySelector(`.${cssClass('search-total')}`);
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
    }
    submit() {
        return true;
    }
    reset() {
        const input = this.findInput('input[type="text"]');
        const checkbox = this.findInput('input[type="checkbox"]');
        const previous = this.find(`.${cssClass('previous-result')}`);
        const next = this.find(`.${cssClass('next-result')}`);
        const searchCount = this.find(`.${cssClass('search-count')}`);
        this.current = null;
        input.value = '';
        checkbox.checked = false;
        previous.disabled = true;
        next.disabled = true;
        searchCount.hidden = true;
    }
    cancel() {
        // nothing to do
    }
}
