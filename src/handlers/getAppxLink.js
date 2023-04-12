const { ipcMain } = require("electron");
const { XMLParser } = require("fast-xml-parser");
const { xml2json, json2xml } = require("xml-js")
const decompress = require("decompress")
const { createWriteStream, existsSync, mkdirSync, unlinkSync, readFileSync, writeFileSync } = require("fs");
const path = require("path");
const { exec } = require("child_process");
const ERRORS = require("../error");

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
const SECURED_URL = "https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

let stopDownload = false;

function buildHeader(id) {
  const now = new Date(Date.now()).toISOString()
  const then = new Date(Date.now() + 5 * 60000).toISOString()
  const header = `
        <s:Envelope xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:s="http://www.w3.org/2003/05/soap-envelope">
        <s:Header>
          <a:Action s:mustUnderstand="1">http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService/GetExtendedUpdateInfo2</a:Action>
          <a:MessageID>urn:uuid:5754a03d-d8d5-489f-b24d-efc31b3fd32d</a:MessageID>
          <a:To s:mustUnderstand="1">https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured</a:To>
          <o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
            <Timestamp xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
              <Created>${now}</Created>
              <Expires>${then}</Expires>
            </Timestamp>
            <wuws:WindowsUpdateTicketsToken wsu:id="ClientMSA" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:wuws="http://schemas.microsoft.com/msus/2014/10/WindowsUpdateAuthorization">
              <TicketType Name="AAD" Version="1.0" Policy="MBI_SSL"></TicketType>
            </wuws:WindowsUpdateTicketsToken>
          </o:Security>
        </s:Header>
        <s:Body>
          <GetExtendedUpdateInfo2 xmlns="http://www.microsoft.com/SoftwareDistribution/Server/ClientWebService">
            <updateIDs>
              <UpdateIdentity>
                <UpdateID>${id}</UpdateID>
                <RevisionNumber>1</RevisionNumber>
              </UpdateIdentity>
            </updateIDs>
            <infoTypes>
              <XmlUpdateFragmentType>FileUrl</XmlUpdateFragmentType>
            </infoTypes>
            <deviceAttributes>E:BranchReadinessLevel=CBB&amp;DchuNvidiaGrfxExists=1&amp;ProcessorIdentifier=Intel64%20Family%206%20Model%2063%20Stepping%202&amp;CurrentBranch=rs4_release&amp;DataVer_RS5=1942&amp;FlightRing=Retail&amp;AttrDataVer=57&amp;InstallLanguage=en-US&amp;DchuAmdGrfxExists=1&amp;OSUILocale=en-US&amp;InstallationType=Client&amp;FlightingBranchName=&amp;Version_RS5=10&amp;UpgEx_RS5=Green&amp;GStatus_RS5=2&amp;OSSkuId=48&amp;App=WU&amp;InstallDate=1529700913&amp;ProcessorManufacturer=GenuineIntel&amp;AppVer=10.0.17134.471&amp;OSArchitecture=AMD64&amp;UpdateManagementGroup=2&amp;IsDeviceRetailDemo=0&amp;HidOverGattReg=C%3A%5CWINDOWS%5CSystem32%5CDriverStore%5CFileRepository%5Chidbthle.inf_amd64_467f181075371c89%5CMicrosoft.Bluetooth.Profiles.HidOverGatt.dll&amp;IsFlightingEnabled=0&amp;DchuIntelGrfxExists=1&amp;TelemetryLevel=1&amp;DefaultUserRegion=244&amp;DeferFeatureUpdatePeriodInDays=365&amp;Bios=Unknown&amp;WuClientVer=10.0.17134.471&amp;PausedFeatureStatus=1&amp;Steam=URL%3Asteam%20protocol&amp;Free=8to16&amp;OSVersion=10.0.17134.472&amp;DeviceFamily=Windows.Desktop</deviceAttributes>
          </GetExtendedUpdateInfo2>
        </s:Body>
        </s:Envelope>`
  return header
}

function findValue(obj, searchTerm, results = []) {
  for (let key in obj) {
    if (typeof obj[key] === "object") {
      findValue(obj[key], searchTerm, results);
    } else if (typeof obj[key] === "string" && obj[key].includes(searchTerm)) {
      results.push(obj[key]);
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach(element => {
        if (typeof element === "string" && element.includes(searchTerm)) {
          results.push(element);
        }
      });
    }
  }
  return results;
}


function getAppxLink(_, id, name, shorthand) {
  stopDownload = false
  if (!id) return
  let xhr = new XMLHttpRequest()
  xhr.open("POST", SECURED_URL)
  xhr.setRequestHeader('Content-Type', 'application/soap+xml')
  xhr.onload = function () {
    if (xhr.status == 200) {
      console.warn(id)
      const parsed = JSON.parse(xml2json(xhr.responseText))
      const files = findValue(parsed, "http://tlu.dl.delivery.mp.microsoft.com/filestreamingservice/")
      console.log(files)
      if (!files[0]) {
        const { shorthand, description } = ERRORS.SERVER_ERROR
        globalThis.mainWindow.webContents.send("castError", shorthand, description)
        console.log(xml2json(xhr.responseText))
        return
      }
      downloader(files[0], id, name, shorthand)
    } else {
      const { shorthand } = ERRORS.SERVER_ERROR
      console.log(`Error: ${xhr.status}`, xhr.responseText)
      globalThis.mainWindow.webContents.send("castError", shorthand, `Error: ${xhr.status} ${xhr.responseText}`)

    }
  }

  xhr.send(buildHeader(id))
}

async function downloader(uri, name, customName, shorthand) {
  if (!existsSync(path.join(__dirname, "../pages/versions"))) mkdirSync(path.join(__dirname, "../pages/versions"))
  const streamPath = path.join(__dirname, `../pages/versions/${name}.appx`)
  const fileStream = createWriteStream(streamPath);
  const res = await fetch(uri, {
    method: "GET",
    headers: {
      'Content-Type': 'application/soap+xml'
    }
  })

  const totalLength = parseInt(res.headers.get('content-length'), 10);
  let downloadedLength = 0;
  const reader = res.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (stopDownload) {
      stopDownload = false;
      fileStream.close()
      console.log("Canceled Download")
      unlinkSync(streamPath)
      return
    }

    downloadedLength += value.length;
    const percent = ((downloadedLength / totalLength) * 100).toFixed(2);
    console.log(`Downloaded ${percent}% (${downloadedLength} bytes) of ${totalLength} bytes`);
    fileStream.write(value);
    globalThis.mainWindow.webContents.send("downloadProgress", percent, downloadedLength, totalLength)
  }

  fileStream.close();
  console.log('Download complete!');
  globalThis.mainWindow.webContents.send("onComplete", "Finished!")
  deflate(streamPath, customName, shorthand)
}

function deflate(path, packName, shorthand) {
  if (!existsSync(process.env.APPDATA + "\\.beryllium-forge\\instances")) mkdirSync(process.env.APPDATA + "\\.beryllium-forge\\instances", { recursive: true })
  const destenation = process.env.APPDATA + "\\.beryllium-forge\\instances\\" + packName
  decompress(path, destenation).then(() => {
    editPack(destenation, packName, shorthand)
  })
}


function editPack(pathToPack, packName, shorthand) {
  unlinkSync(pathToPack + "\\AppxBlockMap.xml")
  unlinkSync(pathToPack + "\\AppxSignature.p7x")
  const manifest = xml2json(readFileSync(pathToPack + "\\AppxManifest.xml"))
  const appxManifest = JSON.parse(manifest)
  appxManifest["elements"][0]["elements"][1]["attributes"]["Name"] = "Microsoft.Minecraft" + shorthand
  const str = JSON.stringify(appxManifest).replace("Minecraft: Windows 10 Edition", packName)
  const xml = json2xml(str)
  writeFileSync(pathToPack + "\\AppxManifest.xml", xml)
  registerPack(pathToPack + "\\AppxManifest.xml")
}

function registerPack(path) {
  exec(`Add-AppxPackage -path ${path} -register`, { shell: "powershell.exe" })
  globalThis.mainWindow.webContents.send("onUnzip", "Finished!")
  console.log("Done!")
}

module.exports = {
  handle: "getAppxLink",
  handler: getAppxLink
}

ipcMain.handle("cancelDownload", (_) => {
  stopDownload = true
})



