export const newUid = (function () {
  let counter = 0
  return function () {
    return "pjax" + new Date().getTime() + "_" + counter++;
  }
})()

export function defaultSwitches(oldEl, newEl) {
  oldEl.outerHTML = newEl.outerHTML;
}

export function updateQueryString(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i")
  var separator = uri.indexOf("?") !== -1 ? "&" : "?"
  if (uri.match(re)) {
    return uri.replace(re, "$1" + key + "=" + value + "$2")
  }
  else {
    return uri + separator + key + "=" + value
  }
}

export function isDefaultPrevented(event: Event): Boolean {
  return event.defaultPrevented || event.returnValue === false
}

export function shouldAbort(el: HTMLAnchorElement, event: KeyboardEvent): Boolean {
  if (isDefaultPrevented(event)) return true;

  // Don’t break browser special behavior on links (like page in new window)
  if (event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;

  // Ignore cross origin links
  if (el.protocol !== window.location.protocol || el.host !== window.location.host) return true;

  // Ignore anchors on the same page (keep native behavior)
  if (el.hash && el.href.replace(el.hash, "") === window.location.href.replace(location.hash, "")) return true;

  // Ignore empty anchor "foo.html#"
  if (el.href === window.location.href.split("#")[0] + "#") return true;

  return false;
}

function defaultAnalytics() {
  // @ts-ignore
  if (window._gaq) _gaq.push(["_trackPageview"]);
  // @ts-ignore
  if (window.ga) ga("send", "pageview", { page: location.pathname, title: document.title });
}