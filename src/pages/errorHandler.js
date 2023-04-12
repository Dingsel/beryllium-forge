import { InfoForm } from "./infoForm/infoForm.js";

export function displayError(_, shorthand, details) {
    new InfoForm()
        .setTitle(`ERROR : ${shorthand}`)
        .addText(details)
        .setButtonText("Ok")
        .show()
}

window.electronAPI.castError(displayError)