export interface IRequestParams {
    name: string,
    value: string
}
export enum Switches {
    outerHTML = 'outerHTML', innerHTML = 'innerHTML', replaceNode = 'outerHTML', sideBySide = 'outerHTML'
}

export interface Option {
    elements: string,
    selectors: Array<string>,
    switches: Switches,
    switchesOptions: Object,
    debug: Boolean,
    timeout: Number,
    requestOptions: {
        requestUrl?: string;
        requestMethod?: string;
        requestParams?: IRequestParams[];
        formData?: FormData;
    },
    scrollTo?: Number,
    history?: Boolean,
    analytics?: Function;
    scrollRestoration?: Boolean,
    cacheBust?: Boolean,
    currentUrlFullReload?: Boolean
}

const defaultConfig: Option = {
    elements: "a[href], form[action]",
    selectors: ["title"],
    switches: Switches.outerHTML,
    switchesOptions: {},
    debug: false,
    timeout: 0,
    requestOptions: {
        requestMethod: 'GET'
    }
}

export function parseOptions(options: Option): Option {
    options = Object.assign(defaultConfig, options)

    options.history = (typeof options.history === "undefined") ? true : options.history
    options.analytics = (typeof options.analytics === "function" || options.analytics === false) ? options.analytics : defaultAnalytics
    options.scrollTo = (typeof options.scrollTo === "undefined") ? 0 : options.scrollTo
    options.scrollRestoration = (typeof options.scrollRestoration !== "undefined") ? options.scrollRestoration : true
    options.cacheBust = (typeof options.cacheBust === "undefined") ? true : options.cacheBust
    options.currentUrlFullReload = (typeof options.currentUrlFullReload === "undefined") ? false : options.currentUrlFullReload

    // We can’t replace body.outerHTML or head.outerHTML.
    // It creates a bug where a new body or head are created in the DOM.
    // If you set head.outerHTML, a new body tag is appended, so the DOM has 2 body nodes, and vice versa
    // if (!options.switches.head) options.switches.head = defaultSwitches.switchElementsAlt;
    // if (!options.switches.body) options.switches.body = defaultSwitches.switchElementsAlt;

    return options;
}