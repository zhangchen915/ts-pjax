export interface IRequestParams {
    name: string,
    value: string
}

export interface Option {
    elements: string,
    selectors: Array<string>,
    switches: Object,
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
    analytics?: Function ;
    scrollRestoration?: Boolean,
    cacheBust?: Boolean,
    currentUrlFullReload?: Boolean
}

export const defaultConfig: Option = {
    elements: "a[href], form[action]",
    selectors: ["title"],
    switches: {},
    switchesOptions: {},
    debug: false,
    timeout: 0,
    requestOptions: {
        requestMethod: 'GET'
    }
}