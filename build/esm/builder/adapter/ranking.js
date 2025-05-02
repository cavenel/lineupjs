import { buildRanking as buildRankingImpl, } from '../RankingBuilder';
/*
 * build the column description
 */
export function buildRanking(props, data) {
    const r = buildRankingImpl();
    if (props.sortBy) {
        const s = Array.isArray(props.sortBy) ? props.sortBy : [props.sortBy];
        s.forEach((si) => {
            if (typeof si === 'string') {
                r.sortBy(si);
            }
            else {
                r.sortBy(si.column, si.asc);
            }
        });
    }
    if (props.groupBy) {
        const s = Array.isArray(props.groupBy) ? props.groupBy : [props.groupBy];
        r.groupBy(...s);
    }
    if (props.columns) {
        props.columns.forEach((c) => r.column(c));
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
    const r = {
        type: 'nested',
        columns: children,
    };
    if (props.label) {
        r.label = props.label;
    }
    return r;
}
export function buildWeightedSumRanking(props, children) {
    const r = {
        type: 'weightedSum',
        columns: children.map((d) => d.column),
        weights: children.map((d) => d.weight),
    };
    if (props.label) {
        r.label = props.label;
    }
    return r;
}
export function buildReduceRanking(props, children) {
    const r = {
        type: props.type,
        columns: children,
    };
    if (props.label) {
        r.label = props.label;
    }
    return r;
}
export function buildScriptRanking(props, children) {
    const r = {
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
    return `_${props.type}`;
}
export function buildAllColumnsRanking() {
    return '*';
}
