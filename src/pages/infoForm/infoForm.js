export class InfoForm {
    /**@private */
    node;
    /**@private */
    blocker;
    /**@private */
    cancelCallbacks = [];
    /**@private */
    buttonText;
    constructor() {
        const blocker = document.createElement("div")
        blocker.id = "formBlocker"
        const formTemplate = document.createElement("div")
        formTemplate.id = "form"

        const close = document.createElement("button")
        close.id = "formClose"
        close.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="45" viewBox="0 96 960 960" width="45"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>`
        close.addEventListener("click", () => {
            this.exit()
            this.cancelCallbacks.map(x => x())
        })

        formTemplate.appendChild(close)

        this.node = formTemplate
        this.blocker = blocker
    }

    setTitle(val) {
        const text = document.createElement("h1")
        text.id = "formTitle"
        text.innerText = val
        this.node.prepend(text)
        return this
    }

    onCancel(callback) {
        this.cancelCallbacks.push(callback)
        return this
    }

    addText(val) {
        const text = document.createElement("h2")
        text.id = "formText"
        text.innerText = val
        this.node.appendChild(text)
        return this
    }

    addProgressBar(handler) {
        const bar = document.createElement("progress")
        const text = document.createElement("h3")
        text.id = "formText"
        bar.id = "formBar"
        bar.max = "100"
        handler((_, percentage, current, total) => {
            bar.value = percentage
            text.innerText = `${current ? `${current} b | ` : ""}${total ? `${total} b | ` : ""}${percentage ? `${percentage}%` : ""}`
        })
        this.node.appendChild(bar)
        this.node.appendChild(text)
        return this
    }

    setButtonText(text) {
        this.buttonText = text
        return this
    }

    exit() {
        this.blocker?.remove()
        this.node?.remove()
    }

    show() {
        document.body.prepend(this.blocker)
        const cancel = document.createElement("button")
        cancel.id = "formCancel"
        cancel.innerText = this.buttonText ? this.buttonText : "Cancel"
        cancel.addEventListener("click", () => {
            this.exit()
            this.cancelCallbacks.map(x => x())
        })
        this.node.appendChild(cancel)
        document.body.prepend(this.node)
        return this;
    }
}