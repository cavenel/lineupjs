export interface IEventContext {
    /**
     * who is sending this event
     */
    readonly source: AEventDispatcher;
    /**
     * who was sending this event in case of forwarding
     */
    readonly origin: AEventDispatcher;
    /**
     * the event type
     */
    readonly type: string;
    /**
     * in case of multi propagation the 'main' event type, aka the first one
     */
    readonly primaryType: string;
    /**
     * the arguments to the listener
     */
    readonly args: any[];
}
export interface IEventListener {
    (this: IEventContext, ...args: any[]): any;
}
export interface IEventHandler {
    on(type: string | string[], listener: IEventListener | null): this;
}
/**
 * base class for event dispatching using d3 event mechanism, thus .suffix is supported for multiple registrations
 */
export default class AEventDispatcher implements IEventHandler {
    private readonly listeners;
    private readonly listenerEvents;
    private readonly forwarder;
    constructor();
    on(type: string | string[], listener: IEventListener | null): this;
    /**
     * helper function that will be called upon a listener has changed
     * @param _type event type
     * @param _active registered or de registered
     */
    protected listenersChanged(_type: string, _active: boolean): void;
    /**
     * return the list of events to be able to dispatch
     * @return {Array} by default no events
     */
    protected createEventList(): string[];
    protected fire(type: string | string[], ...args: any[]): void;
    private fireImpl;
    /**
     * forwards one or more events from a given dispatcher to the current one
     * i.e. when one of the given events is fired in 'from' it will be forwarded to all my listeners
     * @param {IEventHandler} from the event dispatcher to forward from
     * @param {string[]} types the event types to forward
     */
    protected forward(from: IEventHandler, ...types: string[]): void;
    /**
     * removes the forwarding declarations
     * @param {IEventHandler} from the originated dispatcher
     * @param {string[]} types event types to forward
     */
    protected unforward(from: IEventHandler, ...types: string[]): void;
}
//# sourceMappingURL=AEventDispatcher.d.ts.map