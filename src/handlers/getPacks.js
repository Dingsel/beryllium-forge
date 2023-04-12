const { readdirSync } = require('fs');
const os = require('os')

function getPacks() {
    const dirs = readdirSync(os.userInfo().homedir + "\\AppData\\Local\\Packages")
    return dirs.filter((x) => {
        return (x.includes("Microsoft.Minecraft") && !x.includes("Microsoft.MinecraftJavaEdition"))
    })
}

module.exports = {
    handle: "packs",
    handler: getPacks
}
