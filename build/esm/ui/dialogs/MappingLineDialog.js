import { round, similar, dragHandle } from '../../internal';
import ADialog, {} from './ADialog';
import { cssClass } from '../../styles';
function clamp(v) {
    return Math.max(Math.min(v, 100), 0);
}
/** @internal */
export default class MappingLineDialog extends ADialog {
    constructor(line, dialog, adapter) {
        super(dialog, {
            livePreview: 'dataMapping',
        });
        this.line = line;
        this.adapter = adapter;
        this.dialog.attachment.classList.add(cssClass('mapping-line-selected'));
        this.before = {
            domain: this.line.domain,
            range: this.line.range,
        };
    }
    build(node) {
        const domain = this.adapter.domain();
        node.insertAdjacentHTML('beforeend', `
        <button class="${cssClass('dialog-button')} lu-action-remove" title="Remove" type="button" ${this.line.frozen ? 'style="display: none"' : ''} ><span style="margin-left: 3px">Remove Mapping Line</span></button>
        <strong>Input Domain Value (min ... max)</strong>
        <input type="number" value="${this.adapter.formatter(this.adapter.unnormalizeRaw(this.line.domain))}" ${this.line.frozen ? 'readonly disabled' : ''} autofocus required min="${domain[0]}" max="${domain[1]}" step="any">
        <strong>Output Normalized Value (0 ... 1)</strong>
        <input type="number" value="${round(this.line.range / 100, 3)}" required min="0" max="1" step="any">
      `);
        this.find('button').addEventListener('click', () => {
            this.destroy('confirm');
            this.line.destroy();
        }, {
            passive: true,
        });
        this.enableLivePreviews('input');
    }
    cleanUp(action) {
        super.cleanUp(action);
        this.dialog.attachment.classList.remove(cssClass('mapping-line-selected'));
    }
    cancel() {
        this.line.update(this.before.domain, this.before.range, true);
    }
    reset() {
        this.findInput('input[type=number]').value = round(this.adapter.unnormalizeRaw(this.before.domain), 3).toString();
        this.findInput('input[type=number]:last-of-type').value = round(this.before.range / 100, 3).toString();
    }
    submit() {
        if (!this.node.checkValidity()) {
            return false;
        }
        const domain = this.adapter.normalizeRaw(this.findInput('input[type=number]').valueAsNumber);
        const range = this.findInput('input[type=number]:last-of-type').valueAsNumber * 100;
        this.line.update(domain, range, true);
        return true;
    }
}
/** @internal */
export class MappingLine {
    constructor(g, domain, range, adapter) {
        this.domain = domain;
        this.range = range;
        this.adapter = adapter;
        const h = 52;
        g.insertAdjacentHTML('beforeend', `<g class="${cssClass('dialog-mapper-mapping')}" transform="translate(${domain},0)">
      <line x1="0" x2="${range - domain}" y2="${h}"></line>
      <line x1="0" x2="${range - domain}" y2="${h}"></line>
      <circle r="2"></circle>
      <circle cx="${range - domain}" cy="${h}" r="2"></circle>
      <text class="${cssClass('dialog-mapper-mapping-domain')} ${domain > 25 && domain < 75 ? cssClass('dialog-mapper-mapping-middle') : ''}${domain > 75 ? cssClass('dialog-mapper-mapping-right') : ''}" dy="-3">
        ${this.adapter.formatter(this.adapter.unnormalizeRaw(domain))}
      </text>
      <text class="${cssClass('dialog-mapper-mapping-range')} ${range > 25 && range < 75 ? cssClass('dialog-mapper-mapping-middle') : ''}${range > 50 ? cssClass('dialog-mapper-mapping-right') : ''}" dy="3" x="${range - domain}" y="${h}">
        ${round(range / 100, 3)}
      </text>
      <title>Drag the anchor circle to change the mapping, double click to edit</title>
    </g>`);
        this.node = g.lastElementChild;
        // freeze 0 and 100 domain = raw domain ones
        this.node.classList.toggle(cssClass('frozen'), similar(0, domain) || similar(domain, 100));
        {
            let beforeDomain;
            let beforeRange;
            let shiftDomain;
            let shiftRange;
            const normalize = (x) => (x * 100) / g.getBoundingClientRect().width;
            const common = {
                container: g.parentElement,
                filter: (evt) => evt.button === 0 && !evt.shiftKey,
                onStart: (_, x) => {
                    beforeDomain = this.domain;
                    beforeRange = this.range;
                    const normalized = normalize(x);
                    shiftDomain = this.domain - normalized;
                    shiftRange = this.range - normalized;
                },
                onEnd: () => {
                    if (!similar(beforeDomain, this.domain) || !similar(beforeRange, this.range)) {
                        this.adapter.updated(this);
                    }
                },
            };
            const line = this.node.querySelector('line:first-of-type');
            dragHandle(line, {
                // line
                ...common,
                onDrag: (_, x) => {
                    const normalized = normalize(x);
                    this.update(clamp(normalized + shiftDomain), clamp(normalized + shiftRange));
                },
            });
            const domainCircle = this.node.querySelector('circle:first-of-type');
            dragHandle(domainCircle, {
                ...common,
                onDrag: (_, x) => {
                    const normalized = normalize(x);
                    this.update(clamp(normalized), this.range);
                },
            });
            const rangeCircle = this.node.querySelector('circle:last-of-type');
            dragHandle(rangeCircle, {
                ...common,
                onDrag: (_, x) => {
                    const normalized = normalize(x);
                    this.update(this.domain, clamp(normalized));
                },
            });
        }
        this.node.onclick = (evt) => {
            if (!evt.shiftKey) {
                return;
            }
            this.openDialog();
        };
        this.node.ondblclick = () => {
            this.openDialog();
        };
    }
    openDialog() {
        const ctx = {
            manager: this.adapter.dialog.manager,
            level: this.adapter.dialog.level + 1,
            attachment: this.node,
            idPrefix: this.adapter.dialog.idPrefix,
            sanitize: this.adapter.dialog.sanitize,
        };
        const dialog = new MappingLineDialog(this, ctx, this.adapter);
        dialog.open();
    }
    get frozen() {
        return this.node.classList.contains(cssClass('frozen'));
    }
    destroy(handled = false) {
        this.node.remove();
        if (!handled) {
            this.adapter.destroyed(this);
        }
    }
    update(domain, range, trigger = false) {
        if (similar(domain, 100)) {
            domain = 100;
        }
        if (similar(domain, 0)) {
            domain = 0;
        }
        if (similar(range, 100)) {
            range = 100;
        }
        if (similar(range, 0)) {
            range = 0;
        }
        if (similar(domain, this.domain) && similar(range, this.range)) {
            return;
        }
        if (this.frozen) {
            domain = this.domain;
        }
        this.domain = domain;
        this.range = range;
        this.node.setAttribute('transform', `translate(${domain},0)`);
        const shift = range - domain;
        Array.from(this.node.querySelectorAll('line')).forEach((d) => d.setAttribute('x2', String(shift)));
        this.node.querySelector('circle[cx]').setAttribute('cx', String(shift));
        const t1 = this.node.querySelector('text');
        t1.textContent = this.adapter.formatter(this.adapter.unnormalizeRaw(domain));
        t1.classList.toggle(cssClass('dialog-mapper-mapping-right'), domain > 75);
        t1.classList.toggle(cssClass('dialog-mapper-mapping-middle'), domain >= 25 && domain <= 75);
        const t2 = this.node.querySelector('text[x]');
        t2.textContent = round(range / 100, 3).toString();
        t2.classList.toggle(cssClass('dialog-mapper-mapping-right'), range > 75);
        t2.classList.toggle(cssClass('dialog-mapper-mapping-middle'), range >= 25 && range <= 75);
        t2.setAttribute('x', String(shift));
        if (trigger) {
            this.adapter.updated(this);
        }
    }
}
