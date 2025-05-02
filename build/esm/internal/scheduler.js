import { ABORTED } from 'lineupengine';
export { ABORTED } from 'lineupengine';
/**
 * iterator result for another round
 * @internal
 */
export const ANOTHER_ROUND = {
    value: null,
    done: false,
};
/**
 * iterator for just one entry
 * @internal
 */
export function oneShotIterator(calc) {
    return {
        next: () => ({ done: true, value: calc() }),
    };
}
function thenFactory(wrappee, abort, isAborted) {
    function then(onfulfilled, onrejected) {
        const r = wrappee.then(onfulfilled, onrejected);
        return {
            then: thenFactory(r, abort, isAborted),
            abort,
            isAborted,
        };
    }
    return then;
}
/**
 * task scheduler for running tasks in idle callbacks
 * @internal
 */
export default class TaskScheduler {
    constructor() {
        this.tasks = [];
        // idle callback id
        this.taskId = -1;
        this.runTasks = (deadline) => {
            // while more tasks and not timed out
            while (this.tasks.length > 0 && (deadline.didTimeout || deadline.timeRemaining() > 0)) {
                const task = this.tasks.shift();
                let r = task.it.next();
                // call next till done or ran out of time
                while (!r.done && (deadline.didTimeout || deadline.timeRemaining() > 0)) {
                    r = task.it.next();
                }
                if (r.done) {
                    // resolve async
                    requestAnimationFrame(() => task.resolve(r.value));
                }
                else {
                    // reschedule again
                    this.tasks.unshift(task);
                }
            }
            this.taskId = -1;
            this.reSchedule();
        };
    }
    reSchedule() {
        if (this.tasks.length === 0 || this.taskId > -1) {
            return;
        }
        const ww = self;
        if (ww.requestIdleCallback) {
            this.taskId = ww.requestIdleCallback(this.runTasks);
        }
        else {
            this.taskId = setTimeout(this.runTasks, 1);
        }
    }
    /**
     * pushes a task with multi hops using an iterator
     * @param id task id
     * @param it iterator to execute
     */
    pushMulti(id, it, abortAble = true) {
        // abort task with the same id
        const abort = () => {
            const index = this.tasks.findIndex((d) => d.id === id);
            if (index < 0) {
                return; // too late or none
            }
            const task = this.tasks[index];
            this.tasks.splice(index, 1);
            task.isAborted = true;
            task.resolve(ABORTED);
        };
        {
            // abort existing
            const index = this.tasks.findIndex((d) => d.id === id);
            if (index >= 0) {
                const task = this.tasks[index];
                task.abort();
            }
        }
        let resolve;
        const p = new Promise((r) => {
            // called during constructor
            resolve = r;
        });
        const task = {
            id,
            it,
            result: p,
            abort,
            isAborted: false,
            resolve: resolve,
        };
        const isAborted = () => task.isAborted;
        this.tasks.push(task);
        this.reSchedule();
        const abortOrDummy = abortAble ? abort : () => undefined;
        const isAbortedOrDummy = abortAble ? isAborted : () => false;
        return {
            then: thenFactory(p, abortOrDummy, isAbortedOrDummy),
            abort: abortOrDummy,
            isAborted: isAbortedOrDummy,
        };
    }
    /**
     * pushes a simple task
     * @param id task id
     * @param calc task function
     */
    push(id, calc) {
        return this.pushMulti(id, oneShotIterator(calc));
    }
    /**
     * abort a task with the given id
     * @param id task id
     */
    abort(id) {
        const index = this.tasks.findIndex((d) => d.id === id);
        if (index < 0) {
            return false; // too late or none
        }
        const task = this.tasks[index];
        task.abort();
        return true;
    }
    abortAll(filter) {
        const abort = this.tasks.filter(filter);
        if (abort.length === 0) {
            return;
        }
        this.tasks = this.tasks.filter((d) => !filter(d));
        for (const task of abort) {
            task.resolve(ABORTED);
            task.abort();
        }
    }
    clear() {
        if (this.taskId === -1) {
            return;
        }
        const ww = self;
        if (ww.requestIdleCallback && ww.clearIdleCallback) {
            ww.clearIdleCallback(this.taskId);
        }
        else {
            clearTimeout(this.taskId);
        }
        this.taskId = -1;
        this.tasks.splice(0, this.tasks.length).forEach((d) => {
            d.resolve(ABORTED);
            d.abort();
        });
    }
}
