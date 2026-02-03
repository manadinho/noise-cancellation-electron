/**
 * Noise Cancellation Electron App
 * 
 * A system tray application that provides real-time noise cancellation
 * using the DeepFilterNet3 AI model. This app runs in the background
 * and processes audio from your microphone to remove unwanted noise.
 */

const { app, Tray, Menu } = require('electron');
const path = require('path');

// Global state
let tray = null;        // System tray instance
let engine = null;      // Native noise cancellation engine
let isRunning = false;  // Engine status flag

/**
 * Load the native noise cancellation engine module.
 * This module interfaces with the C/C++ audio processing libraries.
 * If loading fails, the app will quit since it cannot function without the engine.
 */
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
 * 
 * Strategy:
 *  - Prefer physical microphones over virtual audio devices
 *  - Avoid virtual devices like BlackHole (used for audio routing)
 *  - Fallback to first available device if no physical mic is found
 * 
 * @returns {number} Index of the selected microphone device
 */
function getDefaultMicIndex() {
  const devices = engine.listDevices();

  console.log('Input devices:', devices);

  // Prefer real mic over virtual ones (e.g., BlackHole)
  const index = devices.findIndex(
    d => !d.toLowerCase().includes('blackhole')
  );

  return index !== -1 ? index : 0;
}

/**
 * Start the noise cancellation engine.
 * 
 * This function:
 * 1. Selects the appropriate microphone device
 * 2. Loads the DeepFilterNet3 AI model
 * 3. Starts real-time audio processing
 * 
 * The engine will continue processing audio until stopped.
 */
function startEngine() {
  if (isRunning) return;

  const micIndex = getDefaultMicIndex();

  // IMPORTANT: Must use absolute path for the ONNX model file
  const modelPath = path.join(
    __dirname,
    'native',
    'models',
    'DeepFilterNet3_onnx.tar.gz'
  );

  console.log('Using mic index:', micIndex);
  console.log('Using model:', modelPath);

  // Verify model file exists before attempting to start
  const fs = require('fs');
  console.log('Model exists:', fs.existsSync(modelPath));
  console.log('Model stat:', fs.statSync(modelPath));

  try {
    engine.start(micIndex, modelPath);
    isRunning = true;
    console.log('Noise cancellation engine started successfully');
  } catch (err) {
    console.error('Failed to start engine:', err);
  }
}

/**
 * Stop the noise cancellation engine.
 * 
 * This halts all audio processing and releases microphone resources.
 * The app remains running in the tray and can be restarted at any time.
 */
function stopEngine() {
  if (!isRunning) return;

  try {
    engine.stop();
    isRunning = false;
    console.log('Noise cancellation engine stopped');
  } catch (err) {
    console.error('Failed to stop engine:', err);
  }
}

/**
 * Application initialization
 * 
 * When Electron is ready:
 * 1. Load the native noise cancellation engine
 * 2. Create the system tray icon and menu
 * 3. Set up event handlers
 */
app.whenReady()
  .then(() => {
    loadEngine();

    // Create system tray icon (iconTemplate.png must exist)
    const iconPath = path.join(__dirname, 'iconTemplate.png');
    tray = new Tray(iconPath);

    // Build the context menu with start/stop controls
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
    
    console.log('Application ready - check system tray for icon');
  })
  .catch(err => {
    console.error('Electron failed to start:', err);
    app.quit();
  });

// Keep app alive in tray even when all windows are closed
// This is a tray-only app with no visible windows
app.on('window-all-closed', e => e.preventDefault());
