import { detect } from 'detect-browser';
export var SUPPORTED_FIREFOX_VERSION = 57;
export var SUPPORTED_CHROME_VERSION = 64;
export var SUPPORTED_EDGE_VERSION = 16;
/**
 * @internal
 */
export function getUnsupportedBrowserError() {
    var info = detect();
    if (!info || !info.version) {
        return 'browser cannot be detected';
    }
    var prefix = "unsupported browser detected:";
    switch (info.name) {
        case 'firefox': {
            var fVersion = Number.parseInt(info.version.slice(0, info.version.indexOf('.')), 10);
            if (fVersion <= SUPPORTED_FIREFOX_VERSION && fVersion !== 52) {
                // ESR
                return "".concat(prefix, " Firefox ").concat(info.version, " (&lt; ").concat(SUPPORTED_FIREFOX_VERSION, ")");
            }
            return null;
        }
        case 'edge': {
            var eVersion = Number.parseInt(info.version.slice(0, info.version.indexOf('.')), 10);
            if (eVersion <= SUPPORTED_EDGE_VERSION) {
                return "".concat(prefix, " Edge ").concat(info.version, " (&lt; ").concat(SUPPORTED_EDGE_VERSION, ")");
            }
            return null;
        }
        case 'chrome': {
            var cVersion = Number.parseInt(info.version.slice(0, info.version.indexOf('.')), 10);
            if (cVersion <= SUPPORTED_CHROME_VERSION) {
                return "".concat(prefix, " Chrome ").concat(info.version, " (&lt; ").concat(SUPPORTED_CHROME_VERSION, ")");
            }
            return null;
        }
        case 'ie':
            return "".concat(prefix, " Internet Explorer");
    }
    console.warn('unknown browser detected', info, 'assuming fine...');
    return null;
}
/**
 * checks whether the current browser is compatible with lineupjs
 * @return boolean
 */
export function isBrowserSupported() {
    return getUnsupportedBrowserError() == null;
}
//# sourceMappingURL=browser.js.map