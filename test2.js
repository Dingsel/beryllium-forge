const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

const xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", "https://raw.githubusercontent.com/MCMrARM/mc-w10-versiondb/master/versions.json.min", false);
xmlHttp.send(null);
console.log(xmlHttp.responseText)