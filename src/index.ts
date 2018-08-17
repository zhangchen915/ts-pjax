import { Option, defaultConfig } from './config';
import { trigger } from './even';
import { request, doRequest } from './fetchPage';
import { replaceState, loadContent } from './handleRes'
import { defaultSwitches, shouldAbort } from './util'

export default class Pjax {
    options: Option
    private request: XMLHttpRequest
    private lastUid: string

    constructor(options) {
        this.parseOptions(options);
        this.parseDOM(document);

        window.addEventListener('popstate', (st) => {
            if (st.state) {
                // var opt = Object.assign({}, this.options)
                // opt.url = st.state.url
                // opt.title = st.state.title
                // // Since state already exists, prevent it from being pushed again
                // opt.history = false
                // opt.scrollPos = st.state.scrollPos
                // if (st.state.uid < this.lastUid) {
                //     opt.backward = true
                // }
                // else {
                //     opt.forward = true
                // }
                this.lastUid = st.state.uid

                // @todo implement history cache here, based on uid
                this.loadUrl(st.state.url)
            }
        })
    }

    parseOptions(options: Option) {
        options = Object.assign(defaultConfig, options)

        options.history = (typeof options.history === "undefined") ? true : options.history
        // options.analytics = (typeof options.analytics === "function" || options.analytics === false) ? options.analytics : defaultAnalytics
        options.scrollTo = (typeof options.scrollTo === "undefined") ? 0 : options.scrollTo
        options.scrollRestoration = (typeof options.scrollRestoration !== "undefined") ? options.scrollRestoration : true
        options.cacheBust = (typeof options.cacheBust === "undefined") ? true : options.cacheBust
        options.currentUrlFullReload = (typeof options.currentUrlFullReload === "undefined") ? false : options.currentUrlFullReload

        // We can’t replace body.outerHTML or head.outerHTML.
        // It creates a bug where a new body or head are created in the DOM.
        // If you set head.outerHTML, a new body tag is appended, so the DOM has 2 body nodes, and vice versa
        // if (!options.switches.head) options.switches.head = defaultSwitches.switchElementsAlt;
        // if (!options.switches.body) options.switches.body = defaultSwitches.switchElementsAlt;

        this.options = options
    }

    loadUrl(url: string) {
        if (this.request) this.request.abort();

        this.request = request(url, this.options);
        trigger(document, "pjax:send")
        doRequest(this.request).then(res => {
            replaceState(res);
            this.switches(loadContent(res.responseText), document)
        }).catch(e => {
            console.log(e)
            trigger(document, "pjax:error")
        });
    }

    parseDOM(el: ParentNode) {
        Array.from(el.querySelectorAll(this.options.elements)).forEach(item => this.attach(item));
    }

    attach(el: Element) {
        switch (el.tagName.toLowerCase()) {
            case "a":
                el.addEventListener("click", (event: KeyboardEvent) => {
                    this.linkAction(el, event)
                })

                el.addEventListener("keyup", (event: KeyboardEvent) => {
                    if (event.keyCode === 13) this.linkAction(el, event)
                })
                break;
            case "form":
                // this.attachForm(el)
                break;
            default:
                throw "Pjax can only be applied on <a> or <form> submit"
        }
    }

    linkAction(el, event: KeyboardEvent) {
        console.log(arguments)
        if (shouldAbort(el, event)) return;
        event.preventDefault();

        // don’t do "nothing" if user try to reload the page by clicking the same link twice
        if (this.options.currentUrlFullReload &&
            el.href === window.location.href.split("#")[0]
        ) {
            window.location.reload();
        } else {
            this.loadUrl(el.href)
        }
    }

    switches(fromEl: ParentNode, toEl: ParentNode) {
        var switchesQueue: Array<Function> = []

        this.options.selectors.forEach(selector => {
            const newEls = Array.from(fromEl.querySelectorAll(selector));
            const oldEls = Array.from(toEl.querySelectorAll(selector));

            console.log(newEls, oldEls)

            if (newEls.length !== oldEls.length) {
                throw "DOM doesn’t look the same on new loaded page: ’" + selector + "’ - new " + newEls.length + ", old " + oldEls.length
            }

            newEls.forEach((newEl, i) => {
                const oldEl = oldEls[i];

                this.options.switches[selector] ?
                    this.options.switches[selector](oldEl, newEl, this.options.switchesOptions[selector]) :
                    defaultSwitches(oldEl, newEl)
            })
        })
    }

    afterAllSwitches() {
        trigger(document, "pjax:complete pjax:success");

        this.options.analytics();
    }
}