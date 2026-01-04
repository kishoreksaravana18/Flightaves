# AeroVis - Global Flight Tracker

A real-time 3D flight visualization application using Globe.gl.

## How to Run

Since this application relies on ES modules and external textures, it is best run with a local web server to avoid browser security restrictions (CORS) related to the `file://` protocol.

### Option 1: VS Code Live Server (Recommended)
1. Open this folder in VS Code.
2. Install the "Live Server" extension if you haven't.
3. Right-click `index.html` and select "Open with Live Server".

### Option 2: Direct Open (Might have limitations)
1. Double click `index.html` to open it in your default browser.
2. **Note**: Some textures or icons may not load correctly due to browser security policies when opening files directly from disk.

## Features
- **Real-time 3D Globe**: Interactive view of the earth.
- **Live Traffic Simulation**: Visualization of thousands of flights with animated paths.
- **Dynamic Lighting**: Day/Night cycle visualization.
- **Glassmorphic UI**: Modern overlay with statistics and controls.

## Tech Stack
- HTML5 / CSS3 (Vanilla)
- JavaScript (ES6+)
- Globe.gl (3D Visualization)
- Three.js (WebGL Engine)
