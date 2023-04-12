// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld('electronAPI', {
  packs: () => ipcRenderer.invoke('packs'),
  startGame: (uwpName) => ipcRenderer.invoke('startGame', uwpName),
  getVersions: () => ipcRenderer.invoke('getVersions'),
  getAppxLink: (id, packName, shorthand) => ipcRenderer.invoke('getAppxLink', id, packName, shorthand),
  downloadProgress: (percent, current, total) => ipcRenderer.on('downloadProgress', percent, current, total),
  onComplete: (callback) => ipcRenderer.on('onComplete', callback),
  onUnzip: (callback) => ipcRenderer.on('onUnzip', callback),
  cancelDownload: () => ipcRenderer.invoke('cancelDownload'),
  castError: (shorthand, description) => ipcRenderer.on('castError', shorthand, description)
})
