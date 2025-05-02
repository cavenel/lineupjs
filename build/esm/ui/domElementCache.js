/**
 * caches parsing of html strings in a dom element cache
 * @param doc the doc to create the elements under
 * @internal
 */
export default function domElementCache(doc) {
    const cache = new Map();
    const helper = doc.createElement('div');
    return (html) => {
        if (cache.has(html)) {
            return cache.get(html).cloneNode(true);
        }
        helper.innerHTML = html;
        const node = helper.firstElementChild;
        // keep a copy
        cache.set(html, node.cloneNode(true));
        return node;
    };
}
export function createSanitizer(doc) {
    // prepare variables
    // based on https://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery/17546215#17546215
    const textNode = doc.createTextNode('');
    const wrapper = doc.createElement('div');
    wrapper.appendChild(textNode);
    return (v) => {
        if (!v) {
            return '';
        }
        textNode.nodeValue = v;
        return wrapper.innerHTML;
    };
}
