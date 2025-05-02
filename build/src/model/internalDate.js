import { timeDay, timeHour, timeMinute, timeMonth, timeSecond, timeWeek } from 'd3-time';
import { timeFormat } from 'd3-time-format';
import { equal, isSeqEmpty } from '../internal';
import { isNumberIncluded } from './internalNumber';
/** @internal */
export { isDummyNumberFilter as isDummyDateFilter, isEqualNumberFilter as isEqualDateFilter, noNumberFilter as noDateFilter, restoreNumberFilter as restoreDateFilter, } from './internalNumber';
/** @internal */
export function isDateIncluded(filter, value) {
    if (!filter) {
        return true;
    }
    if (value == null || !(value instanceof Date)) {
        return !filter.filterMissing;
    }
    return isNumberIncluded(filter, value.getTime());
}
/**
 * shifts the given date such that it is on 23:59:59, or 00:00:00
 * @internal
 */
export function shiftFilterDateDay(date, type) {
    var d = new Date(date);
    if (type === 'max') {
        d.setHours(23);
        d.setMinutes(59);
        d.setSeconds(59);
        d.setMilliseconds(999);
    }
    else {
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
    }
    return d.getTime();
}
/**
 * @internal
 */
export function defaultDateGrouper() {
    return { granularity: 'month', circular: false };
}
/**
 * @internal
 */
export function isDefaultDateGrouper(grouper) {
    return equal(defaultDateGrouper(), grouper);
}
/**
 * convert the given date to the desired grouper
 * @internal
 */
export function toDateGroup(grouper, value) {
    switch (grouper.granularity) {
        case 'century': {
            var centuryP = Math.floor(value.getFullYear() / 100);
            if (grouper.circular) {
                var century = centuryP % 10;
                return {
                    value: century,
                    name: "*".concat(century, "00"),
                };
            }
            return {
                value: centuryP,
                name: "".concat(centuryP, "00"),
            };
        }
        case 'decade': {
            var decadeP = Math.floor(value.getFullYear() / 10);
            if (grouper.circular) {
                var decade = decadeP % 10;
                return {
                    value: decade,
                    name: "**".concat(decade, "0"),
                };
            }
            return {
                value: decadeP,
                name: "".concat(decadeP, "0"),
            };
        }
        case 'year':
            if (grouper.circular) {
                var year = value.getFullYear() % 10;
                return {
                    value: year,
                    name: "***".concat(year),
                };
            }
            return {
                value: value.getFullYear(),
                name: String(value.getFullYear()),
            };
        case 'month':
            if (grouper.circular) {
                return {
                    value: value.getMonth(),
                    name: timeFormat('%B')(value),
                };
            }
            return {
                value: timeMonth(value).getTime(),
                name: timeFormat('%B %Y')(value),
            };
        case 'week':
            if (grouper.circular) {
                return {
                    value: value.getMonth(),
                    name: timeFormat('%W')(value),
                };
            }
            return {
                value: timeWeek(value).getTime(),
                name: timeFormat('%W %Y')(value),
            };
        case 'day_of_week':
            if (grouper.circular) {
                return {
                    value: value.getDay(),
                    name: timeFormat('%A')(value),
                };
            }
            return {
                value: timeDay(value).getTime(),
                name: timeFormat('%x')(value),
            };
        case 'day_of_month':
            if (grouper.circular) {
                return {
                    value: value.getDate(),
                    name: timeFormat('%d')(value),
                };
            }
            return {
                value: timeDay(value).getTime(),
                name: timeFormat('%x')(value),
            };
        case 'day_of_year':
            if (grouper.circular) {
                // %j = day of year
                var v = timeFormat('%j')(value);
                return {
                    value: Number.parseInt(v, 10),
                    name: v,
                };
            }
            return {
                value: timeDay(value).getTime(),
                name: timeFormat('%x')(value),
            };
        case 'hour':
            if (grouper.circular) {
                return {
                    value: value.getHours(),
                    name: timeFormat('%A')(value),
                };
            }
            return {
                value: timeHour(value).getTime(),
                name: timeFormat('%x')(value),
            };
        case 'minute':
            if (grouper.circular) {
                return {
                    value: value.getMinutes(),
                    name: timeFormat('%A')(value),
                };
            }
            return {
                value: timeMinute(value).getTime(),
                name: timeFormat('%x')(value),
            };
        case 'second':
            if (grouper.circular) {
                return {
                    value: value.getSeconds(),
                    name: timeFormat('%A')(value),
                };
            }
            return {
                value: timeSecond(value).getTime(),
                name: timeFormat('%x')(value),
            };
    }
}
/**
 * @internal
 */
export function chooseAggregatedDate(rows, grouper, col, valueCache) {
    var vs = (valueCache ? valueCache : rows.map(function (d) { return col.getDate(d); })).filter(function (d) { return d instanceof Date; });
    if (isSeqEmpty(vs)) {
        return { value: null, name: '' };
    }
    var median = trueMedian(vs.map(function (d) { return d.getTime(); }));
    if (!grouper) {
        return { value: median, name: new Date(median).toString() };
    }
    return toDateGroup(grouper, new Date(median));
}
function trueMedian(dates) {
    // to avoid interpolating between the centers do it manually
    var s = Float64Array.from(dates);
    if (s.length === 1) {
        return s[0];
    }
    s.sort();
    return s[Math.floor(s.length / 2)];
}
//# sourceMappingURL=internalDate.js.map