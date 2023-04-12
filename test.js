const { XMLParser } = require("fast-xml-parser");

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
const SECURED_URL = "https://fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx/secured";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function buildHeader() {
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
          <UpdateID>A2612767-B607-49E0-9145-6BD4AEC49FE7</UpdateID>
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


function findNestedObj(entireObj, keyToFind) {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind]) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};

//fetch(SECURED_URL, {
//  method: 'POST',
//  headers: {
//  'Content-Type': 'application/soap+xml',
//  "charset": "utf-8"
//  },
//  body: buildHeader()
//})
//  .then(response => console.log(response.json()))

const parser = new XMLParser()
let xhr = new XMLHttpRequest()
xhr.open("POST", SECURED_URL)
xhr.setRequestHeader('Content-Type', 'application/soap+xml')
xhr.onload = function () {

  if (xhr.status == 200) {
    const parsed = parser.parse(xhr.responseText)
    const files = findNestedObj(parsed, "FileLocation") ?? parsed["s:Envelope"]["s:Body"]["GetExtendedUpdateInfo2Response"]
    console.log(files)

  } else {

    console.log(`Error: ${xhr.status}`, xhr.responseText)

  }
}

xhr.send(buildHeader())


//https://mrarm.io/r/w10-vdb
