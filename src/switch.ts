interface switchOptions {
    classNames?: {
        add: string,
        remove: string,
        forward: string,
        backward: string
    }
    callbacks?: {
        addElement: Function,
        removeElement: Function
    }
}

export default {
    outerHTML: function (oldEl, newEl) {
        oldEl.outerHTML = newEl.outerHTML
    },

    innerHTML: function (oldEl, newEl) {
        oldEl.innerHTML = newEl.innerHTML
        oldEl.className = newEl.className
    },

    switchElementsAlt: function (oldEl, newEl) {
        oldEl.innerHTML = newEl.innerHTML

        // Copy attributes from the new element to the old one
        if (newEl.hasAttributes()) {
            for (let i = 0; i < newEl.attributes.length; i++) {
                oldEl.attributes.setNamedItem(newEl.attributes[i].cloneNode())
            }
        }
    },

    // Equivalent to outerHTML(), but doesn't require switchElementsAlt() for <head> and <body>
    replaceNode: function (oldEl, newEl) {
        oldEl.parentNode.replaceChild(newEl, oldEl);
    },

    sideBySide: function (oldEl, newEl, options, switchOptions: switchOptions = {}) {
        var elsToRemove = []
        var elsToAdd = []
        var animatedElsNumber = 0;
        const fragToAppend = document.createDocumentFragment()
        const animationEventNames = "animationend webkitAnimationEnd MSAnimationEnd oanimationend"
        const sexyAnimationEnd = e => {
            // end triggered by an animation on a child
            if (e.target !== e.currentTarget) return;

            animatedElsNumber--
            if (animatedElsNumber <= 0 && elsToRemove) {
                elsToRemove.forEach(el => {
                    if (el.parentNode) el.parentNode.removeChild(el)
                })

                elsToAdd.forEach(el => {
                    el.className = el.className.replace(el.getAttribute("data-pjax-classes"), "")
                    el.removeAttribute("data-pjax-classes")
                })

                elsToAdd = null
                elsToRemove = null
            }
        }

        Array.from(oldEl.childNodes).forEach((el: Element) => {
            elsToRemove.push(el)
            if (el.classList && !el.classList.contains("js-Pjax-remove")) {
                // for fast switch, clean element that just have been added, & not cleaned yet.
                if (el.hasAttribute("data-pjax-classes")) {
                    el.className = el.className.replace(el.getAttribute("data-pjax-classes"), "")
                    el.removeAttribute("data-pjax-classes")
                }
                el.classList.add("js-Pjax-remove")
                if (switchOptions.callbacks && switchOptions.callbacks.removeElement) switchOptions.callbacks.removeElement(el);
                if (switchOptions.classNames) {
                    el.classList.add(switchOptions.classNames.remove)
                    el.classList.add(options.backward ? switchOptions.classNames.backward : switchOptions.classNames.forward)
                }
                animatedElsNumber++
                el.addEventListener(animationEventNames, sexyAnimationEnd, true)
            }
        })

        Array.from(newEl.childNodes).forEach((el: Element) => {
            if (el.classList) {
                if (switchOptions.classNames) {
                    el.classList.add(switchOptions.classNames.add);
                    el.classList.add(options.backward ? switchOptions.classNames.forward : switchOptions.classNames.backward);
                }
                if (switchOptions.callbacks && switchOptions.callbacks.addElement) switchOptions.callbacks.addElement(el);

                elsToAdd.push(el)
                fragToAppend.appendChild(el)
                animatedElsNumber++;
                el.addEventListener(animationEventNames, sexyAnimationEnd, true)
            }
        })

        // pass all className of the parent
        oldEl.className = newEl.className
        oldEl.appendChild(fragToAppend)
    }
}
