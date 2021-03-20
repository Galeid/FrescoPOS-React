const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');   
const path = require('path');
const url = require('url')

require('dotenv').config()

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        backgroundColor: 'white',
        minWidth: 1280,
        minHeight: 720,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname,'preload.js'),
        }
    })
    const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
 
    win.loadURL(startURL);
}
app.whenReady().then(() => {
    createWindow()
    require('../src/services/SqlServerService')
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})