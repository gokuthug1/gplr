---

# GokuPlr - A Modern HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?version=2.3.2)

GokuPlr is a lightweight, dependency-free JavaScript library that instantly upgrades standard HTML5 `<video>` elements into a beautiful, feature-rich, and mobile-friendly player. It's designed for easy integration, high performance, and extensive customization.

---

## Table of Contents

- [Changelog](#changelog)
- [Features](#features)
- [Quick Start](#quick-start)
- [Touch Gestures](#touch-gestures)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Theming with CSS Variables](#theming-with-css-variables)
- [License](#license)

---

## Changelog

### v2.3.0

-   **Feature: Ambient Mode (Ambilight):** A new setting creates a soft, blurred glow around the player that dynamically matches the colors of the video content, creating a more immersive viewing experience. This can be toggled in the settings menu and is saved between sessions.
-   **Feature: Casting Support:** The player now automatically detects and displays buttons for **AirPlay** (on Safari/iOS) and **Chromecast** (if the Google Cast SDK is present), allowing users to stream content to compatible devices.
-   **Feature: Share Functionality:** A new share button has been added to the controls. Clicking it opens a menu to copy the video URL or copy a link to the video at the current timestamp.
-   **Improvement: High-Performance VTT Thumbnails:** Thumbnail previews on the progress bar are now powered by VTT files (`<track kind="metadata">`). This is significantly more performant than the previous method, resulting in instant, smooth thumbnail previews without seeking a hidden video element.
-   **Refinement: Cleaner UI Feedback:** The central indicator animation for play and pause actions has been removed to reduce visual noise. The indicator still provides essential feedback for seeking and volume changes.

### v2.2.0

-   **Feature: Full Mobile & Touch Support:** The player is now fully responsive and optimized for touch devices.
    -   **Tap to Play/Pause:** A single tap on the video area toggles playback.
    -   **Tap to Show/Hide Controls:** Tapping the video reveals the controls, which auto-hide after a few seconds.
    -   **Draggable Sliders:** The progress and volume sliders are now fully functional with touch-and-drag gestures.
-   **Feature: Double-Tap Gestures:** Inspired by modern mobile video players:
    -   **Double-tap the left or right side** of the video to seek backward or forward by 10 seconds.
    -   **Double-tap the center** of the video to quickly toggle fullscreen mode.
-   **Improvement: Polished Mobile UI:** The user interface has been refined for touch interaction. The volume slider is always visible on mobile (when controls are shown), and the progress bar is thicker for easier scrubbing.
-   **Fix: Updated Quick Start Example:** The HTML example now uses working, direct video links from the Internet Archive.

### v2.1.0

-   **Feature: Expanded Playback Speeds:** Increased the maximum playback speed up to **8x**.
-   **Feature: Volume Memory:** The player now saves your volume and mute settings, restoring them automatically in your next session.
-   **Feature: Central Action Indicator:** A new, non-intrusive icon appears in the center of the player to provide clear visual feedback for actions like play, pause, seek, and volume changes.
-   **Feature: New Keyboard Shortcuts:** Use the **Up/Down Arrow** keys to adjust the volume.
-   **Feature: Double-Click Fullscreen:** You can now double-click the video area to quickly toggle fullscreen mode.

---

## Features

-   **Ambient Mode (Ambilight):** Creates an immersive colored glow around the player that matches the video content.
-   **Full Mobile & Touch Support:** A seamless experience on any device with intuitive tap and drag gestures.
-   **Double-Tap Gestures:** Double-tap to seek forward/backward or to enter fullscreen.
-   **Casting Support:** Automatically shows **AirPlay** and **Chromecast** buttons when available.
-   **Share Functionality:** Easily share a link to the video or a link to a specific timestamp.
-   **High-Performance VTT Thumbnails:** See instant video frame previews when hovering over the progress bar, powered by a VTT sprite sheet.
-   **Video Quality Switching:** Automatically detects `<source>` tags and allows users to switch between qualities (e.g., 1080p, 720p, 480p).
-   **Advanced Captions Support:**
    -   Automatically detects and lists multiple language tracks.
    -   Intuitive menu separates track selection from style customization.
    -   Customize font, size, color, background, and opacity.
-   **Persistent Customization:**
    -   Control playback speed (0.5x to 8x).
    -   Customize the player's primary accent color and caption styles.
    -   All settings are saved in `localStorage` to persist across sessions.
-   **Volume Memory:** Remembers your last volume and mute settings between sessions.
-   **Volume Booster:** Utilizes the Web Audio API to boost volume up to 200%, accessible via a control button or `Ctrl`+`Z`.
-   **Central Action Indicator:** Provides clear visual feedback for seek and volume changes.
-   **Comprehensive Keyboard Shortcuts:** Full control over playback, volume, seeking, fullscreen, speed, and more.
-   **Modern & Dependency-Free:** Written in modern ES6+ JavaScript with no external dependencies.
-   **Native Browser Features:** Full support for Picture-in-Picture and Fullscreen modes.
-   **Simple Integration:** Add it to your site with a single script tag and a CSS class.
-   **Direct Download Button:** A convenient button to download the video source file.

---

## Quick Start

To use GokuPlr, add the `goku-player` class to your `<video>` tag and include the script before your closing `</body>` tag.

### Full Page Example (`index.html`)

This complete example demonstrates video quality switching, multiple caption tracks, and VTT thumbnail previews. Copy this code into an `index.html` file and open it in your browser to see it work instantly.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v2.3.2</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .video-wrapper {
            max-width: 900px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border-radius: 12px;
            overflow: hidden;
        }
    </style>
</head>
<body>

    <div class="video-wrapper">
        <video
          class="goku-player"
          poster="https://archive.org/download/BigBuckBunny-1080p/big_buck_bunny_poster.jpg"
          crossorigin="anonymous"
        >
          <!-- Video quality sources -->
          <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" size="1080" data-label="1080p HD" default>
          <source src="https://archive.org/download/BigBuckBunny-720p/big_buck_bunny_720p_stereo.mp4" type="video/mp4" size="720" data-label="720p">
          <source src="https://archive.org/download/BigBuckBunny-240p/big_buck_bunny_240p_stereo.mp4" type="video/mp4" size="240" data-label="240p">
          
          <!-- Caption tracks -->
          <track kind="captions" srclang="en" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" label="English" default />
          <track kind="captions" srclang="es" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captionses.vtt" label="Español" />

          <!-- NEW: VTT Thumbnail track for high-performance previews -->
          <track kind="metadata" src="https://archive.org/download/BigBuckBunny_328/BigBuckBunny_328_thumbnails.vtt" />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@2.3.2/plr.js" defer></script>

</body>
</html>
```

---

## Touch Gestures

| Gesture                       | Action                               |
| :---------------------------- | :----------------------------------- |
| Single Tap                    | Toggle Play/Pause                    |
| Double Tap (Left/Right Side)  | Seek Backward/Forward 10s            |
| Double Tap (Center)           | Toggle Fullscreen                    |
| Drag on Progress Bar          | Scrub through video                  |
| Drag on Volume Slider         | Adjust volume                        |

---

## Keyboard Shortcuts

| Key            | Action                                        |
| :------------- | :-------------------------------------------- |
| `Space` or `K` | Toggle Play/Pause                             |
| `M`            | Toggle Mute/Unmute                            |
| `F`            | Toggle Fullscreen                             |
| `P`            | Toggle Picture-in-Picture                     |
| `C`            | Toggle Captions                               |
| `L` or `→`     | Seek Forward 10s / 5s                         |
| `J` or `←`     | Seek Backward 10s / 5s                        |
| `↑`            | Increase Volume by 5%                         |
| `↓`            | Decrease Volume by 5%                         |
| `>` or `.`     | Increase Playback Speed                       |
| `<` or `,`     | Decrease Playback Speed                       |
| `0` - `9`      | Seek to 0% - 90% of the video duration        |
| `Ctrl` + `Z`   | Toggle Volume Booster                         |

---

## Theming with CSS Variables

You can easily set a default theme for the player by overriding CSS Custom Properties in your own stylesheet. While users can change these in the settings menu, this defines your site's base look.

```css
/* Example: A red and dark theme with sharp corners */
:root {
  --primary-color: #e74c3c;
  --controls-bg: rgba(15, 15, 15, 0.9);
  --border-radius: 4px;
}
```

### Available Variables

-   `--primary-color`
-   `--text-color`
-   `--controls-bg`
-   `--menu-bg`
-   `--progress-bar-bg`
-   `--border-radius`
-   `--caption-font-family`
-   `--caption-font-size`
-   `--caption-font-color`
-   `--caption-bg-color`

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
