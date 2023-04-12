const { readdirSync, existsSync, readFileSync } = require('fs');
const os = require('os')

const STABLE = {
    name: "Stable",
    shortHand: "UWP",
    UWPName: "Microsoft.MinecraftUWP_8wekyb3d8bbwe"
}
const PREVIEW = {
    name: "Preview",
    shortHand: "WindowsBeta",
    UWPName: "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe"
}

const templates = [STABLE, PREVIEW]



function getPacks() {
    const packs = []
    const dirs = JSON.stringify(readdirSync(os.userInfo().homedir + "\\AppData\\Local\\Packages"))
    const validTemplates = templates.filter((x) => dirs.includes(x.UWPName))
    packs.push(validTemplates)
    if (!existsSync(process.env.APPDATA + "\\.beryllium-forge\\instances")) return packs.flat()
    const instances = readdirSync(process.env.APPDATA + "\\.beryllium-forge\\instances")
    for (const instancePath of instances) {
        const path = `${process.env.APPDATA}\\.beryllium-forge\\instances\\${instancePath}\\.instance`
        if (!existsSync(path)) continue
        packs.push(JSON.parse(readFileSync(path).toString()))
    }
    return packs.flat()
}

module.exports = {
    handle: "packs",
    handler: getPacks
}
