export function executeScripts(el) {
    if (el.tagName.toLowerCase() === "script") evalScript(el);

    Array.from(document.querySelectorAll('script')).forEach(script => {
        if (!script.type || script.type.toLowerCase() === "text/javascript") {
            if (script.parentNode) script.parentNode.removeChild(script);
            evalScript(script)
        }
    })
}

function evalScript(el: HTMLScriptElement): boolean {
    const { text, src, parentNode = document.documentElement } = el;
    const script: HTMLScriptElement = document.createElement("script");
    script.type = "text/javascript";

    if (src) {
        script.src = src;
        script.defer = true;
        script.async = false; // force synchronous loading of peripheral JS
    }

    if (text) script.appendChild(document.createTextNode(text));

    parentNode.appendChild(script);
    // avoid pollution only in head or body tags
    if (parentNode instanceof HTMLHeadElement || parentNode instanceof HTMLBodyElement) parentNode.removeChild(script);
    return true
}