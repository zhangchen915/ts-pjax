export function on(els: NodeList, events: string, listener, useCapture?) {
    events.split(" ").forEach(e => {
        Array.from(els).forEach(el => {
            el.addEventListener(e, listener, useCapture)
        })
    })
}

export function trigger(node: Node, events: string, opts?) {
    events.split(" ").forEach(eventName => {
        var event = new Event(eventName);
        event.initEvent(eventName, true, true)

        if (opts) {
            Object.keys(opts).forEach(function (key) {
                event[key] = opts[key]
            })
        }

        let domFix = false
        if (!node.parentNode && node !== document) {
            // THANK YOU IE (9/10/11)
            // dispatchEvent doesn't work if the nodeement is not in the DOM
            domFix = true
            document.body.appendChild(node)
        }
        node.dispatchEvent(event)
        if (domFix) node.parentNode.removeChild(node);
    })
}