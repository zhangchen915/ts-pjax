import { trigger } from './even'
import { newUid } from './util'

export function replaceState(res: XMLHttpRequest) {
    if (!res) trigger(document, "pjax:complete pjax:error", {});

    // push scroll position to history
    const { url = window.location.href, uid = newUid() } = window.history.state || {};
    // const href = res.responseURL || res.getResponseHeader("X-PJAX-URL") || res.getResponseHeader("X-XHR-Redirected-To")
    window.history.replaceState({
        url: url,
        uid: uid,
        scrollPos: [document.documentElement.scrollLeft || document.body.scrollLeft,
        document.documentElement.scrollTop || document.body.scrollTop]
    }, '', window.location.href)
}

export function loadContent(html: string): Document {
    var tmpEl = document.implementation.createHTMLDocument("pjax")

    // parse HTML attributes to copy them
    // since we are forced to use documentElement.innerHTML (outerHTML can't be used for <html>)
    let matches = html.match(/<html[^>]+>/gi)
    if (matches && matches.length) {
        matches = matches[0].match(/\\s?[a-z:]+(?:\\=(?:\\\'|\\")[^\\\'\\">]+(?:\\\'|\\"))*/gi)
        if (matches.length) {
            matches.shift();
            matches.forEach(function (htmlAttrib) {
                var attr = htmlAttrib.trim().split("=")
                if (attr.length === 1) {
                    tmpEl.documentElement.setAttribute(attr[0], 'true')
                }
                else {
                    tmpEl.documentElement.setAttribute(attr[0], attr[1].slice(1, -1))
                }
            })
        }
    }
    tmpEl.documentElement.innerHTML = html

    return tmpEl


    // Clear out any focused controls before inserting new page contents.
    // if (document.activeElement && contains(document, this.options.selectors, document.activeElement)) {
    //     try {
    //         document.activeElement.blur()
    //     } catch (e) {
    //         this.log(e);
    //     }
    // }

    // this.switchSelectors(this.options.selectors, tmpEl, document)
}