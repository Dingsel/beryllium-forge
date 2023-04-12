const { exec } = require('child_process')

function startGame(_, uwpName) {
    if (!uwpName) return
    exec(`start shell:AppsFolder\\${uwpName}!App`)
}

module.exports = {
    handle : "startGame",
    handler : startGame
}