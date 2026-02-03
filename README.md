# Noise Cancellation Electron

A real-time audio noise cancellation application for macOS that runs as a lightweight system tray application. This app intercepts microphone input and applies AI-powered noise filtering before passing the cleaned audio to other applications.

## Overview

This application provides professional-grade noise cancellation using the **DeepFilterNet3** deep learning model. It runs silently in the background as a system tray app, allowing you to easily toggle noise cancellation on and off without cluttering your workspace.

## Features

- 🎤 **Real-time Audio Processing** - Filters noise from your microphone input in real-time
- 🤖 **AI-Powered** - Uses DeepFilterNet3 ONNX model for advanced noise reduction
- 🖥️ **System Tray Integration** - Minimalist interface that stays out of your way
- 🎯 **Smart Device Selection** - Automatically selects your physical microphone (avoids virtual devices)
- ⚡ **High Performance** - Native C/C++ modules for efficient audio processing
- 🔧 **Simple Controls** - Start/Stop with a click from the menu bar

## Architecture

### Technology Stack

- **Electron (v40.0.0)** - Desktop application framework
- **DeepFilterNet3** - State-of-the-art noise filtering model (ONNX format)
- **Native Modules** - C/C++ addon for high-performance audio processing
- **Audio Libraries**:
  - `libdf.dylib` - DeepFilterNet audio filter library
  - `libnoise_engine.dylib` - Noise engine core logic
  - `addon.node` - Node.js native binding

### Project Structure

```
noise-cancellation-electron/
├── main.js                           # Electron entry point & tray app logic
├── package.json                      # Project dependencies
├── iconTemplate.png                  # System tray icon
└── native/                           # Native modules
    ├── addon.node                    # Node.js native binding
    ├── libdf.dylib                   # DeepFilterNet audio library
    ├── libnoise_engine.dylib         # Noise engine
    └── models/
        └── DeepFilterNet3_onnx.tar.gz # ML model file
```

### How It Works

1. **Initialization**: The app loads the native addon module and prepares the DeepFilterNet3 model
2. **Device Detection**: Scans available audio input devices and intelligently selects the physical microphone
3. **Audio Pipeline**: 
   - Microphone input → Native module processing → DeepFilterNet3 filtering → Clean audio output
4. **Tray Interface**: Provides a simple menu to start/stop the noise cancellation engine

## Installation

### Prerequisites

- macOS (the native modules are compiled for macOS)
- Node.js (v14 or higher recommended)
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/manadinho/noise-cancellation-electron.git
cd noise-cancellation-electron
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

## Usage

1. **Launch the app**: Run `npm start` - the app will appear in your system tray (menu bar)
2. **Start noise cancellation**: Click the tray icon and select "Start Noise Cancellation"
   - The app will automatically select your physical microphone
   - Noise cancellation will begin immediately
3. **Stop noise cancellation**: Click the tray icon and select "Stop Noise Cancellation"
4. **Quit the app**: Click the tray icon and select "Quit"

### Device Selection Logic

The application uses smart device selection to avoid virtual audio devices:
- Prefers physical microphones over virtual devices (e.g., BlackHole)
- Falls back to the first available device if no physical mic is detected
- Lists all available input devices in the console for debugging

## Technical Details

### Native Module Interface

The `addon.node` module provides the following interface:

- `listDevices()` - Returns an array of available audio input device names
- `start(micIndex, modelPath)` - Starts the noise cancellation engine
  - `micIndex`: Index of the microphone to use
  - `modelPath`: Absolute path to the DeepFilterNet3 model file
- `stop()` - Stops the noise cancellation engine

### Audio Processing Flow

```
Physical Microphone
        ↓
   Audio Input API
        ↓
  Native Module (addon.node)
        ↓
  Noise Engine (libnoise_engine.dylib)
        ↓
  DeepFilterNet3 (libdf.dylib + ONNX model)
        ↓
   Filtered Audio Output
        ↓
Other Applications (Zoom, Teams, etc.)
```

## Development

### Building from Source

The native modules (`addon.node`, `libdf.dylib`, `libnoise_engine.dylib`) are pre-compiled and included in the repository. If you need to rebuild them, you'll need:

- C/C++ compiler (Xcode Command Line Tools)
- Node.js development headers
- ONNX Runtime libraries
- DeepFilterNet source code

### Debugging

Enable console output to see detailed logs:
```bash
npm start
```

The app logs:
- Available input devices
- Selected microphone index
- Model path and existence check
- Start/stop events
- Any errors during operation

## Platform Support

Currently, this application is designed for **macOS only**. The native modules are compiled as `.dylib` files specific to macOS. To support other platforms, you would need to:

- Compile native modules for Windows (`.dll`) or Linux (`.so`)
- Adjust audio API calls for platform-specific audio systems
- Update the Electron packaging configuration

## Troubleshooting

### App fails to start
- Check that all native modules exist in the `native/` directory
- Verify that `DeepFilterNet3_onnx.tar.gz` exists in `native/models/`
- Check console output for detailed error messages

### No audio filtering
- Ensure the correct microphone is selected (check console logs)
- Verify that the model path is correct
- Check that other applications can access the microphone

### Tray icon not showing
- Ensure `iconTemplate.png` exists in the root directory
- Check Electron permissions in System Preferences

## License

ISC

## Credits

- **DeepFilterNet** - For the noise reduction model
- **Electron** - For the desktop application framework

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
