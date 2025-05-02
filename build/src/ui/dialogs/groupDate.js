import { cssClass } from '../../styles';
import { defaultDateGrouper } from '../../model/internalDate';
/** @internal */
export default function appendDate(col, node) {
    var before = col.getDateGrouper();
    var html = '';
    for (var _i = 0, _a = [
        'century',
        'decade',
        'year',
        'month',
        'week',
        'day_of_week',
        'day_of_month',
        'day_of_year',
        'hour',
        'minute',
        'second',
    ]; _i < _a.length; _i++) {
        var g = _a[_i];
        html += "<label class=\"".concat(cssClass('checkbox'), "\">\n    <input type=\"radio\" name=\"granularity\" value=\"").concat(g, "\" ").concat(before.granularity === g ? 'checked' : '', ">\n    <span> by ").concat(g, " </span>\n  </label>");
    }
    html += "<label class=\"".concat(cssClass('checkbox'), "\">\n    <input type=\"checkbox\" name=\"circular\" ").concat(before.circular ? 'checked' : '', ">\n    <span> Circular </span>\n  </label>");
    node.insertAdjacentHTML('beforeend', html);
    var circular = node.querySelector('input[name=circular]');
    return {
        elems: 'input[name=granularity],input[name=circular]',
        submit: function () {
            var granularity = node.querySelector('input[name=granularity]:checked')
                .value;
            col.setDateGrouper({
                granularity: granularity,
                circular: circular.checked,
            });
            return true;
        },
        cancel: function () {
            col.setDateGrouper(before);
        },
        reset: function () {
            var r = defaultDateGrouper();
            circular.checked = r.circular;
            var g = node.querySelector("input[name=granularity][value=\"".concat(r.granularity, "\"]"));
            g.checked = true;
        },
    };
}
//# sourceMappingURL=groupDate.js.map