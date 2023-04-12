let cache;

async function getVersions() {
    if (cache) return cache
    const data = await (await fetch("https://raw.githubusercontent.com/MCMrARM/mc-w10-versiondb/master/versions.json.min")).json()
    const formated = data.map(([v, id, p]) => {
        return ({
            version: v,
            id: id,
            state : p
        })
    });
    cache = formated
    return formated
}

module.exports = {
    handle: "getVersions",
    handler: getVersions
}
