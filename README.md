# GokuPlr - A Modern HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?)

GokuPlr is a lightweight, dependency-free JavaScript library that instantly upgrades standard HTML5 `<video>` elements into a beautiful and feature-rich player. It's designed for easy integration, high performance, and extensive customization.

---

## Table of Contents

- [Changelog (v1.8.4)](#changelog-v184)
- [Features](#features)
- [Quick Start](#quick-start)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Theming with CSS Variables](#theming-with-css-variables)
- [License](#license)

---

## Changelog (v1.8.4)

This version includes a major internal refactor to improve performance, maintainability, and user experience.

- **Complete Code Refactor:** Modernized with ES6+ classes, private fields, and best practices.
- **Reworked Settings Menu:** A cleaner, more intuitive multi-panel design for easier navigation.
- **Refined Controls:** Control visibility logic now correctly handles mouse, keyboard, and click interactions.
- **Improved Performance:** More efficient event handling for smoother scrubbing and volume control.
- **New Shortcut:** Press `C` to quickly toggle captions on or off.

---

## Features

- **Sleek, Auto-Hiding UI:** A clean, modern interface that gets out of the way during playback for an immersive viewing experience.
- **Advanced Captions Support:**
    - Automatically detects and lists multiple language tracks.
    - An intuitive menu separates track selection from style customization.
    - Customize font, size, color, background, and opacity.
- **Persistent Customization:**
    - Control playback speed (0.5x to 2x).
    - Customize the player's primary accent color and caption styles.
    - All settings are saved in `localStorage` to persist across sessions.
- **Volume Booster:** Utilizes the Web Audio API to boost volume up to 200%, accessible via a control button or `Ctrl`+`Z`.
- **Thumbnail Previews on Scrub:** See a video frame preview when hovering over the progress bar.
- **Comprehensive Keyboard Shortcuts:** Full control over playback, volume, seeking, fullscreen, and more.
- **Modern & Maintainable Codebase:** Written in modern ES6+ JavaScript with no external dependencies.
- **Native Browser Features:** Full support for Picture-in-Picture and Fullscreen modes.
- **Responsive & Lightweight:** Looks great on all screen sizes.
- **Simple Integration:** Add it to your site with a single script tag and a CSS class.
- **Direct Download Button:** A convenient button to download the video source file.

---

## Quick Start

To use GokuPlr, add the `cvp` class to your `<video>` tag and include the script before your closing `</body>` tag.

### Full Page Example (`index.html`)

This complete example includes multiple caption tracks to demonstrate the player's capabilities. Copy this code into an `index.html` file and open it in your browser.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v1.8.7</title>
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
          class="cvp"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
          crossorigin="anonymous"
        >
          <!-- The player will automatically detect all tracks and build the captions menu -->
          <track kind="captions" srclang="en" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" label="English" default />
          <track kind="captions" srclang="es" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captionses.vtt" label="Español" />
        </video>
    </div>

    <!-- The 'defer' attribute ensures the script runs after the document is parsed -->
    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@v1.8.7/plr.js" defer></script>

</body>
</html>
```
---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` or `K` | Toggle Play/Pause |
| `M` | Toggle Mute/Unmute |
| `F` | Toggle Fullscreen |
| `P` | Toggle Picture-in-Picture |
| `C` | Toggle Captions |
| `L` or `→` | Seek Forward 10s / 5s |
| `J` or `←` | Seek Backward 10s / 5s |
| `Ctrl` + `Z` | Toggle Volume Booster |

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
