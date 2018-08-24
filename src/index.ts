import { Option, parseOptions } from './config';
import { trigger } from './even';
import switches from './switch';
import { executeScripts } from './eval';
import { request, doRequest } from './fetchPage';
import { replaceState, loadContent } from './handleRes'
import { defaultSwitches, shouldAbort } from './util';

export default class Pjax {
    options: Option
    private request: XMLHttpRequest
    private lastUid: string

    constructor(options) {
        this.options = parseOptions(options);
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

    static switches = switches;

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

    private switches(fromEl: ParentNode, toEl: ParentNode) {
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
        this.options.selectors.forEach(selector => {
            Array.from(document.querySelectorAll(selector)).forEach(el => executeScripts(el))
        });

        trigger(document, "pjax:complete pjax:success");

        this.options.analytics();
    }
}