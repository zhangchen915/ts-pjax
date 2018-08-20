import { on } from './even'

export default {
    outerHTML: function (oldEl, newEl) {
        oldEl.outerHTML = newEl.outerHTML
    },

    innerHTML: function (oldEl, newEl) {
        oldEl.innerHTML = newEl.innerHTML

        if (newEl.className === "") {
            oldEl.removeAttribute("class")
        }
        else {
            oldEl.className = newEl.className
        }
    },

    switchElementsAlt: function (oldEl, newEl) {
        oldEl.innerHTML = newEl.innerHTML

        // Copy attributes from the new element to the old one
        if (newEl.hasAttributes()) {
            var attrs = newEl.attributes
            for (var i = 0; i < attrs.length; i++) {
                oldEl.attributes.setNamedItem(attrs[i].cloneNode())
            }
        }
    },

    // Equivalent to outerHTML(), but doesn't require switchElementsAlt() for <head> and <body>
    replaceNode: function (oldEl, newEl) {
        oldEl.parentNode.replaceChild(newEl, oldEl);
    },

    sideBySide: function (oldEl, newEl, options, switchOptions) {
        var forEach = Array.prototype.forEach
        var elsToRemove = []
        var elsToAdd = []
        var fragToAppend = document.createDocumentFragment()
        var animationEventNames = "animationend webkitAnimationEnd MSAnimationEnd oanimationend"
        var animatedElsNumber = 0
        var sexyAnimationEnd = function (e) {
            if (e.target !== e.currentTarget) {
                // end triggered by an animation on a child
                return
            }

            animatedElsNumber--
            if (animatedElsNumber <= 0 && elsToRemove) {
                elsToRemove.forEach(function (el) {
                    // browsing quickly can make the el
                    // already removed by last page update ?
                    if (el.parentNode) {
                        el.parentNode.removeChild(el)
                    }
                })

                elsToAdd.forEach(function (el) {
                    el.className = el.className.replace(el.getAttribute("data-pjax-classes"), "")
                    el.removeAttribute("data-pjax-classes")
                })

                elsToAdd = null // free memory
                elsToRemove = null // free memory

            }
        }

        switchOptions = switchOptions || {}

        forEach.call(oldEl.childNodes, function (el) {
            elsToRemove.push(el)
            if (el.classList && !el.classList.contains("js-Pjax-remove")) {
                // for fast switch, clean element that just have been added, & not cleaned yet.
                if (el.hasAttribute("data-pjax-classes")) {
                    el.className = el.className.replace(el.getAttribute("data-pjax-classes"), "")
                    el.removeAttribute("data-pjax-classes")
                }
                el.classList.add("js-Pjax-remove")
                if (switchOptions.callbacks && switchOptions.callbacks.removeElement) {
                    switchOptions.callbacks.removeElement(el)
                }
                if (switchOptions.classNames) {
                    el.className += " " + switchOptions.classNames.remove + " " + (options.backward ? switchOptions.classNames.backward : switchOptions.classNames.forward)
                }
                animatedElsNumber++
                on(el, animationEventNames, sexyAnimationEnd, true)
            }
        })

        forEach.call(newEl.childNodes, function (el) {
            if (el.classList) {
                var addClasses = ""
                if (switchOptions.classNames) {
                    addClasses = " js-Pjax-add " + switchOptions.classNames.add + " " + (options.backward ? switchOptions.classNames.forward : switchOptions.classNames.backward)
                }
                if (switchOptions.callbacks && switchOptions.callbacks.addElement) {
                    switchOptions.callbacks.addElement(el)
                }
                el.className += addClasses
                el.setAttribute("data-pjax-classes", addClasses)
                elsToAdd.push(el)
                fragToAppend.appendChild(el)
                animatedElsNumber++
                on(el, animationEventNames, sexyAnimationEnd, true)
            }
        })

        // pass all className of the parent
        oldEl.className = newEl.className
        oldEl.appendChild(fragToAppend)
    }
}
