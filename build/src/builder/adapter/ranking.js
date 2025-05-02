import { buildRanking as buildRankingImpl, } from '../RankingBuilder';
/*
 * build the column description
 */
export function buildRanking(props, data) {
    var r = buildRankingImpl();
    if (props.sortBy) {
        var s = Array.isArray(props.sortBy) ? props.sortBy : [props.sortBy];
        s.forEach(function (si) {
            if (typeof si === 'string') {
                r.sortBy(si);
            }
            else {
                r.sortBy(si.column, si.asc);
            }
        });
    }
    if (props.groupBy) {
        var s = Array.isArray(props.groupBy) ? props.groupBy : [props.groupBy];
        r.groupBy.apply(r, s);
    }
    if (props.columns) {
        props.columns.forEach(function (c) { return r.column(c); });
    }
    return r.build(data);
}
export function buildGeneric(props) {
    return props.column;
}
export function buildImposeRanking(props) {
    return Object.assign({
        type: 'impose',
    }, props);
}
export function buildNestedRanking(props, children) {
    var r = {
        type: 'nested',
        columns: children,
    };
    if (props.label) {
        r.label = props.label;
    }
    return r;
}
export function buildWeightedSumRanking(props, children) {
    var r = {
        type: 'weightedSum',
        columns: children.map(function (d) { return d.column; }),
        weights: children.map(function (d) { return d.weight; }),
    };
    if (props.label) {
        r.label = props.label;
    }
    return r;
}
export function buildReduceRanking(props, children) {
    var r = {
        type: props.type,
        columns: children,
    };
    if (props.label) {
        r.label = props.label;
    }
    return r;
}
export function buildScriptRanking(props, children) {
    var r = {
        type: 'script',
        code: props.code,
        columns: children,
    };
    if (props.label) {
        r.label = props.label;
    }
    return r;
}
export function buildSupportRanking(props) {
    return "_".concat(props.type);
}
export function buildAllColumnsRanking() {
    return '*';
}
//# sourceMappingURL=ranking.js.map