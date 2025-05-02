/**
 * main module of LineUp.js containing the main class and exposes all other modules
 */
import { DataProvider, LocalDataProvider } from './provider';
import { LineUp, Taggle } from './ui';
export * from './builder';
export * from './config';
export { default as AEventDispatcher } from './internal/AEventDispatcher';
export * from './internal/mathInterfaces';
export * from './model';
export * from './provider';
export * from './renderer';
export * from './ui';
export { LineUp as default } from './ui';
export function createLocalDataProvider(data, columns, options) {
    if (options === void 0) { options = {}; }
    return new LocalDataProvider(data, columns, options);
}
/**
 *
 * @param container the html element lineup should be built in
 * @param data the data provider
 * @param config lineup configuration overrides
 * @returns the created lineup instance
 */
export function createLineUp(container, data, config) {
    if (config === void 0) { config = {}; }
    return new LineUp(container, data, config);
}
export function createTaggle(container, data, config) {
    if (config === void 0) { config = {}; }
    return new Taggle(container, data, config);
}
//# sourceMappingURL=index.js.map