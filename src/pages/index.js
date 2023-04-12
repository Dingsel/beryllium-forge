const button = document.getElementById("add")
const list = document.getElementById("packs")

/** @param {Event} event  */
function menu(event) {
  const element = event.target
  /** @type {Node} */
  const parent = element.parentNode.parentNode.parentNode
  console.log(parent.children[0].children)
  for (const child of parent.children[0].children) {
    const current = child.style.display
    child.style.display = current == "flex" ? "none" : "flex"
  }
}


function startApp(uwpName) {
  window.electronAPI.startGame(uwpName)
}

function addPack(name, uwpName) {
  const node = document.createElement("div")
  node.id = "pack"

  node.innerHTML =
    `<div id="pack">
    <div id="menu">
      <button id="delete">
        <svg xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 96 960 960" width="30">
          <path
            d="M261 936q-24.75 0-42.375-17.625T201 876V306h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438V306ZM367 790h60V391h-60v399Zm166 0h60V391h-60v399ZM261 306v570-570Z" />
        </svg>
        Delete
      </button>
      <button id="reveal">
        <svg xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 96 960 960" width="30"><path d="M140 896q-23 0-41.5-18.5T80 836V316q0-23 18.5-41.5T140 256h281l60 60h339q23 0 41.5 18.5T880 376H455l-60-60H140v520l102-400h698L833 850q-6 24-22 35t-41 11H140Zm63-60h572l84-340H287l-84 340Zm0 0 84-340-84 340Zm-63-460v-60 60Z"/></svg>
        Reveal
      </button>
      <button id="close">
        <svg xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 96 960 960" width="30"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>
        Close
      </button>
    </div>
    <div id="header">${name}</div>
    <img src="pack.jpg" id="img">
    <div id="bar">
      <button id="button" onclick="startApp('${uwpName}')">
        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48">
          <path d="M320 853V293l440 280-440 280Zm60-280Zm0 171 269-171-269-171v342Z" />
        </svg>
      </button>
      <button id="button" onclick="menu(event)">
        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48">
          <path d="M120 816v-60h720v60H120Zm0-210v-60h720v60H120Zm0-210v-60h720v60H120Z" />
        </svg>
      </button>
    </div>
  </div>`

  list.appendChild(node)
}

const map = {
  'UWP': 'Default',
  'WindowsBeta': 'Preview'
}


async function getPacks() {
  /** @type {Array<string>} */
  const packs = await window.electronAPI.packs()
  for (const pack of packs) {
    addPack(pack.name, pack.UWPName)
  }
}
getPacks()

const reload = document.getElementById("reload")
reload.addEventListener("click", () => {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
  getPacks()
})