const { exec } = require('child_process')

function startGame(_, uwpName) {
    if (!uwpName) return
    console.log(`Starting Game with UWP Name: ${uwpName}`)
    exec(`start shell:AppsFolder\\${uwpName}!App`)
}

module.exports = {
    handle: "startGame",
    handler: startGame
}