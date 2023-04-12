import { Form } from "./form/form.js"
import { InfoForm } from "./infoForm/infoForm.js"

const versionMap = [
    "Stable",
    "Beta",
    "Preview"
]

async function getVersions() {
    const versions = await window.electronAPI.getVersions()
    if (!versions) console.error("Failed to get versions.")
    new Form()
        .setTitle("Pack Creator")
        .addText("Pack Name")
        .addInput("Untitled Modpack")
        .addText("Shorthand")
        .addInput("custom")
        .addText("Mc Version")
        .addDropdown(versions.map((x) => `${x.version} (${versionMap[x.state]})`).reverse())
        .show((data) => {
            console.log(data)
            const id = versions.find(x => {
                return (JSON.stringify(x.version) == JSON.stringify(data[2].split(" ")[0]))
            }).id

            const download = new InfoForm()
                .setTitle("Downloading Pack")
                .addText("Progress")
                .addProgressBar(window.electronAPI.downloadProgress)
                .onCancel(window.electronAPI.cancelDownload)
                .show()

            window.electronAPI.castError(() => { download.exit() })
            window.electronAPI.getAppxLink(id, data[0], data[1])
            window.electronAPI.onComplete((event, args) => {
                download.exit()
                const unZip = new InfoForm()
                    .setTitle("Unpacking Pack...")
                    .addText("Status")
                    .addProgressBar(() => { })
                    .show();
                window.electronAPI.onUnzip(() => { unZip.exit() })
                window.electronAPI.castError(() => { unZip.exit() })
            })
        })
}

const button = document.getElementById("addPack")
button.addEventListener("click", getVersions)