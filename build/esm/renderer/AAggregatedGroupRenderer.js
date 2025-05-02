import { noRenderer } from './utils';
/**
 * helper class that renders a group renderer as a selected (e.g. median) single item
 */
export class AAggregatedGroupRenderer {
    createGroup(col, context, imposer) {
        const single = this.create(col, context, imposer);
        return {
            template: single.template,
            update: (node, group) => {
                return context.tasks
                    .groupRows(col, group, 'aggregated', (rows) => this.aggregatedIndex(rows, col))
                    .then((data) => {
                    if (typeof data !== 'symbol') {
                        single.update(node, data.row, data.index, group);
                    }
                });
            },
        };
    }
    createSummary() {
        return noRenderer;
    }
}
export default AAggregatedGroupRenderer;
