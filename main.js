const { app, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let engine = null;
let isRunning = false;

function loadEngine() {
  try {
    const addonPath = path.join(__dirname, 'native', 'addon.node');
    engine = require(addonPath);
    console.log('Native engine loaded');
  } catch (err) {
    console.error('Failed to load native engine:', err);
    app.quit();
  }
}

/**
 * Select default physical microphone.
 * Strategy:
 *  - Prefer non-BlackHole input
 *  - Fallback to first device
 */
function getDefaultMicIndex() {
  const devices = engine.listDevices();

  console.log('Input devices:', devices);

  // Prefer real mic over virtual ones
  const index = devices.findIndex(
    d => !d.toLowerCase().includes('blackhole')
  );

  return index !== -1 ? index : 0;
}

function startEngine() {
  if (isRunning) return;

  const micIndex = getDefaultMicIndex();

  // IMPORTANT: absolute path inside app
  const modelPath = path.join(
    __dirname,
    'native',
    'models',
    'DeepFilterNet3_onnx.tar.gz'
  );

  console.log('Using mic index:', micIndex);
  console.log('Using model:', modelPath);

  const fs = require('fs');

console.log('Model exists:', fs.existsSync(modelPath));
console.log('Model stat:', fs.statSync(modelPath));

  try {
    engine.start(micIndex, modelPath);
    isRunning = true;
  } catch (err) {
    console.error('Failed to start engine:', err);
  }
}

function stopEngine() {
  if (!isRunning) return;

  try {
    engine.stop();
    isRunning = false;
  } catch (err) {
    console.error('Failed to stop engine:', err);
  }
}

app.whenReady()
  .then(() => {
    loadEngine();

    // Tray icon (must exist)
    const iconPath = path.join(__dirname, 'iconTemplate.png');
    tray = new Tray(iconPath);

    const menu = Menu.buildFromTemplate([
      {
        label: 'Start Noise Cancellation',
        click: startEngine,
        enabled: () => !isRunning
      },
      {
        label: 'Stop Noise Cancellation',
        click: stopEngine,
        enabled: () => isRunning
      },
      { type: 'separator' },
      { role: 'quit' }
    ]);

    tray.setToolTip('Noise Cancellation');
    tray.setContextMenu(menu);
  })
  .catch(err => {
    console.error('Electron failed to start:', err);
    app.quit();
  });

// Keep app alive (tray-only app)
app.on('window-all-closed', e => e.preventDefault());
