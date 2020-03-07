import electron from 'electron';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//Prepare for Nativ Transparancy
//var electronVibrancy = require('..');
//electronVibrancy.SetVibrancy(true,browserWindowInstance.getNativeWindowHandle());


import fs from 'fs';
import os from 'os';
import path from 'path';
import child_process from 'child_process';
let Promise = require('bluebird');

process.env.NODE_PATH = path.join(__dirname, 'node_modules');
process.env.RESOURCES_PATH = path.join(__dirname, '/../resources');
if (process.platform !== 'win32') {
  process.env.PATH = '/usr/local/bin:' + process.env.PATH;
}
var exiting = false;
var size = {}, settingsjson = {};
try {
  size = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'size')));
} catch (err) {}


try {
  settingsjson = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'));
} catch (err) {}

/*

// mainWindow with show: false
mainWindow.on('ready-to-show',function() {
  var electronVibrancy = require('..');

  // Whole window vibrancy with Material 0 and auto resize
  electronVibrancy.SetVibrancy(mainWindow, 0);

  // auto resizing vibrant view at {0,0} with size {300,300} with Material 0
  electronVibrancy.AddView(mainWindow, { Width: 300,Height:300,X:0,Y:0,ResizeMask:2,Material:0 })

  // non-resizing vibrant view at {0,0} with size {300,300} with Material 0
  electronVibrancy.AddView(mainWindow, { Width: 300,Height:300,X:0,Y:0,ResizeMask:3,Material:0 })

  //Remove a view
  var viewId = electronVibrancy.SetVibrancy(mainWindow, 0);
  electronVibrancy.RemoveView(mainWindow,viewId);

  // Add a view then update it
  var viewId = electronVibrancy.SetVibrancy(mainWindow, 0);
  electronVibrancy.UpdateView(mainWindow,{ ViewId: viewId,Width: 600, Height: 600 });

  // Multipe views with different materials
  var viewId1 = electronVibrancy.AddView(mainWindow, { Width: 300,Height:300,X:0,Y:0,ResizeMask:3,Material:0 })
  var viewId2 = electronVibrancy.AddView(mainWindow, { Width: 300,Height:300,X:300,Y:0,ResizeMask:3,Material:2 })

  console.log(viewId1);
  console.log(viewId2);

  // electronVibrancy.RemoveView(mainWindow,0);
  // electronVibrancy.RemoveView(mainWindow,1);

  // or

  electronVibrancy.DisableVibrancy(mainWindow);
})

 */



app.on('ready', function () {
  var mainWindow = new BrowserWindow({
    width: size.width || 1080,
    height: size.height || 680,
    'min-width': os.platform() === 'win32' ? 400 : 700,
    'min-height': os.platform() === 'win32' ? 260 : 500,
    'standard-window': false,
    resizable: true,
    frame: false,
    transparent: true,
    show: false
  });

  //console.log(mainWindow.localStorage.getItem('settings.colorshema'));
  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools({detach: true});
  }

  mainWindow.loadURL(path.normalize('file://' + path.join(__dirname, 'index.html')));


  app.on('activate', function () {
    if (mainWindow) {
      mainWindow.show();
    }
    return false;
  });


  if (os.platform() === 'win32' || os.platform() === 'linux') {
    mainWindow.on('close', function (e) {
      mainWindow.webContents.send('application:quitting');
      if(!exiting){
        Promise.delay(1000).then(function(){
          mainWindow.close();
        });
        exiting = true;
        e.preventDefault();
      }
    });

    app.on('window-all-closed', function () {
      app.quit();
    });
  } else if (os.platform() === 'darwin') {
    app.on('before-quit', function () {
      mainWindow.webContents.send('application:quitting');
    });
  }

  mainWindow.webContents.on('new-window', function (e) {
    e.preventDefault();
  });

  mainWindow.webContents.on('will-navigate', function (e, url) {
    if (url.indexOf('build/index.html#') < 0) {
      e.preventDefault();
    }
  });

  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow.setTitle('Kitematic');
    mainWindow.show();
    mainWindow.focus();
  });
});
