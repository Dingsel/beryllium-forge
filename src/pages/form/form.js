const closeSVG = `<svg xmlns="http://www.w3.org/2000/svg" height="45" viewBox="0 96 960 960" width="45"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>`

export class Form {
    /**@private */
    node;
    /**@private */
    blocker;
    /**@private */
    formValues = []
    constructor() {
        const blocker = document.createElement("div")
        blocker.id = "formBlocker"
        const formTemplate = document.createElement("div")
        formTemplate.id = "form"

        const close = document.createElement("button")
        close.id = "formClose"
        close.innerHTML = closeSVG
        close.addEventListener("click", () => {
            this.exit()
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

    addText(val) {
        const text = document.createElement("h2")
        text.id = "formText"
        text.innerText = val
        this.node.appendChild(text)
        return this
    }

    addInput(defaultValue) {
        const input = document.createElement("input")
        input.id = "formInput"
        input.value = defaultValue
        input.spellcheck = false
        this.node.appendChild(input)
        this.formValues.push(
            input
        )
        return this
    }

    addDropdown(options) {
        const dropdown = document.createElement("select")
        dropdown.id = "formDropdown"
        for (const arg of options) {
            const element = document.createElement("option")
            element.text = arg
            dropdown.appendChild(element)
        }
        this.node.appendChild(dropdown)
        this.formValues.push(dropdown)
        return this
    }

    /**@private */
    getFormValues() {
        return new Proxy(this.formValues, {
            get(target, name) {
                return target[name].value
            }
        })
    }
    /**@private */
    exit() {
        this.blocker.remove()
        this.node.remove()
    }

    /**
     * @param {function()} callback 
     */
    show(callback) {
        document.body.prepend(this.blocker)
        const submit = document.createElement("button")
        submit.id = "formSubmit"
        submit.textContent = "Submit"
        submit.addEventListener("click", () => {
            callback(this.getFormValues())
            this.exit()
        })
        this.node.appendChild(submit)
        document.body.prepend(this.node)
    }
}