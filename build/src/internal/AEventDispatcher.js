var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { dispatch } from 'd3-dispatch';
/**
 * helper function to suffix the given event types
 * @internal
 */
export function suffix(suffix) {
    var prefix = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        prefix[_i - 1] = arguments[_i];
    }
    return prefix.map(function (p) { return "".concat(p).concat(suffix); });
}
var __DEBUG = false;
/**
 * base class for event dispatching using d3 event mechanism, thus .suffix is supported for multiple registrations
 */
var AEventDispatcher = /** @class */ (function () {
    function AEventDispatcher() {
        var events = this.createEventList();
        this.listenerEvents = new Set(events);
        this.listeners = dispatch.apply(void 0, events);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        this.forwarder = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            that.fireImpl.apply(that, __spreadArray([this.type, this.primaryType, this.origin], args, false));
        };
    }
    AEventDispatcher.prototype.on = function (type, listener) {
        var _this = this;
        if (Array.isArray(type)) {
            type.forEach(function (d) {
                if (_this.listenerEvents.has(d.split('.')[0])) {
                    _this.listenersChanged(d, Boolean(listener));
                    _this.listeners.on(d, listener);
                }
                else if (__DEBUG && !d.includes('.')) {
                    console.warn(_this, 'invalid event type', d);
                }
            });
        }
        else if (this.listenerEvents.has(type.split('.')[0])) {
            this.listenersChanged(type, Boolean(listener));
            this.listeners.on(type, listener);
        }
        else if (__DEBUG && !type.includes('.')) {
            console.warn(this, 'invalid event type', type);
        }
        return this;
    };
    /**
     * helper function that will be called upon a listener has changed
     * @param _type event type
     * @param _active registered or de registered
     */
    AEventDispatcher.prototype.listenersChanged = function (_type, _active) {
        // hook
    };
    /**
     * return the list of events to be able to dispatch
     * @return {Array} by default no events
     */
    AEventDispatcher.prototype.createEventList = function () {
        return [];
    };
    AEventDispatcher.prototype.fire = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var primaryType = Array.isArray(type) ? type[0] : type;
        this.fireImpl.apply(this, __spreadArray([type, primaryType, this], args, false));
    };
    AEventDispatcher.prototype.fireImpl = function (type, primaryType, origin) {
        var _this = this;
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var fireImpl = function (t) {
            if (!_this.listenerEvents.has(t)) {
                if (__DEBUG) {
                    console.warn(_this, 'invalid event type', t);
                }
                return;
            }
            //local context per event, set a this argument
            var context = {
                source: _this, //who is sending this event,
                origin: origin,
                type: t, //the event type
                primaryType: primaryType, //in case of multi propagation the 'main' event type
                args: args,
            };
            _this.listeners.apply(t, context, args);
        };
        if (Array.isArray(type)) {
            type.forEach(fireImpl);
        }
        else {
            fireImpl(type);
        }
    };
    /**
     * forwards one or more events from a given dispatcher to the current one
     * i.e. when one of the given events is fired in 'from' it will be forwarded to all my listeners
     * @param {IEventHandler} from the event dispatcher to forward from
     * @param {string[]} types the event types to forward
     */
    AEventDispatcher.prototype.forward = function (from) {
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        from.on(types, this.forwarder);
    };
    /**
     * removes the forwarding declarations
     * @param {IEventHandler} from the originated dispatcher
     * @param {string[]} types event types to forward
     */
    AEventDispatcher.prototype.unforward = function (from) {
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        from.on(types, null);
    };
    return AEventDispatcher;
}());
export default AEventDispatcher;
//# sourceMappingURL=AEventDispatcher.js.map