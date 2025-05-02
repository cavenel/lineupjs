import { noop } from './utils';
export default class LoadingCellRenderer {
    constructor() {
        this.title = 'Loading';
    }
    canRender() {
        return false; // just direct selection
    }
    create() {
        // no typing because ICellRenderer would not be assignable to IGroupCellRenderer and ISummaryRenderer
        return {
            template: `<div>Loading …</div>`,
            update: noop,
        };
    }
    createGroup() {
        return this.create();
    }
    createSummary() {
        return this.create();
    }
}
