import { updateQueryString } from './util';

export function request(url: string, option) {
    const request: XMLHttpRequest = new XMLHttpRequest();
    const { timeout, requestOptions, cacheBust } = option;

    if (cacheBust) url = updateQueryString(url, "t", Date.now())

    request.open(requestOptions.requestMethod, url, true)
    request.timeout = timeout;
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.setRequestHeader("X-PJAX", "true");
    // if (requestPayload && requestMethod === "POST") {
    //     request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    // }

    return request;
}

export function doRequest(request: XMLHttpRequest): Promise<XMLHttpRequest> {
    return new Promise((res, rej) => {
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(request)
                }
                else if (request.status !== 0) {
                    rej(request)
                }
            }
        };

        request.onerror = e => {
            rej(e)
        }

        request.ontimeout = e => {
            rej(e)
        }

        request.send();
    })
}