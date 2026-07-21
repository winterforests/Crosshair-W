# CrosshairW
Free crosshair overlay for Windows.
Made by winter.
## Download
1. Go to [Releases](../../releases)
2. Download `CrosshairW-1.0.0-setup.exe`
3. Install and run
Windows may warn that the app is unsigned. Click **More info** → **Run anyway**.
## Features
- Cross / T / Dot presets
- Full designer (lines, outline, dot, colors, opacity, rotation, blur, scale)
- Custom image crosshairs
- Position offset (arrow keys)
- Hotkey toggle (default `F7`)
- Hide while ADS (right click)
- Multi-monitor support
- Auto-saves your last crosshair
## Usage
1. Pick a preset or make your own in **Crosshair** / **Designer** / **Custom**
2. Hit **Apply**
3. Play in **windowed** or **borderless** mode
Exclusive fullscreen can cover the overlay.
## Build from source
```bash
npm install
npm run dev
```
Build the installer:
```bash
npm run dist
```
Output: `release/CrosshairW-1.0.0-setup.exe`
## License
MIT
