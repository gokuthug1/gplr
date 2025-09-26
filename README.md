---

# GokuPlr - A Modern HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?version=2.1.0)

GokuPlr is a lightweight, dependency-free JavaScript library that instantly upgrades standard HTML5 `<video>` elements into a beautiful and feature-rich player. It's designed for easy integration, high performance, and extensive customization.

---

## Table of Contents

- [Changelog](#changelog)
- [Features](#features)
- [Quick Start](#quick-start)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Theming with CSS Variables](#theming-with-css-variables)
- [License](#license)

---

## Changelog

### v2.1.0

-   **Feature: Expanded Playback Speeds:** Increased the maximum playback speed up to **8x**.
-   **Feature: Volume Memory:** The player now saves your volume and mute settings, restoring them automatically in your next session.
-   **Feature: Central Action Indicator:** A new, non-intrusive icon appears in the center of the player to provide clear visual feedback for actions like play, pause, seek, and volume changes.
-   **Feature: New Keyboard Shortcuts:** Use the **Up/Down Arrow** keys to adjust the volume.
-   **Feature: Double-Click Fullscreen:** You can now double-click the video area to quickly toggle fullscreen mode.

### v2.0.0

This version introduced significant new features and internal improvements for a more powerful and robust player.

-   **New: Video Quality Selection:** The player now automatically detects multiple `<source>` tags on a video element and builds a settings menu to allow users to switch between different video qualities on the fly.
-   **New: Advanced Keyboard Shortcuts:**
    -   Increase/decrease playback speed using `<` and `>` keys.
    -   Instantly seek to a specific part of the video using number keys `0` through `9` (e.g., `5` seeks to 50%).
-   **Major Code Refactor:** The entire codebase has been reorganized for better maintainability and readability. Monolithic functions have been broken down into smaller, focused methods.
-   **UI/UX Polish:** The Volume Booster button now has a distinct visual "active" state, and the download button is temporarily disabled during a download to prevent issues.

---

## Features

-   **Sleek, Auto-Hiding UI:** A clean, modern interface that gets out of the way for an immersive viewing experience.
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
-   **Central Action Indicator:** Provides clear visual feedback for play, pause, seek, and volume changes.
-   **Double-Click Fullscreen:** Quickly toggle fullscreen by double-clicking the video.
-   **Thumbnail Previews on Scrub:** See a video frame preview when hovering over the progress bar.
-   **Comprehensive Keyboard Shortcuts:** Full control over playback, volume, seeking, fullscreen, speed, and more.
-   **Modern & Dependency-Free:** Written in modern ES6+ JavaScript with no external dependencies.
-   **Native Browser Features:** Full support for Picture-in-Picture and Fullscreen modes.
-   **Responsive & Lightweight:** Looks great on all screen sizes.
-   **Simple Integration:** Add it to your site with a single script tag and a CSS class.
-   **Direct Download Button:** A convenient button to download the video source file.

---

## Quick Start

To use GokuPlr, add the `goku-player` class to your `<video>` tag and include the script before your closing `</body>` tag.

### Full Page Example (`index.html`)

This complete example demonstrates video quality switching and multiple caption tracks. Copy this code into an `index.html` file and open it in your browser.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF--8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v2.1.0</title>
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
          poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
          crossorigin="anonymous"
        >
          <!-- 
            FIXED: Google Drive "sharing" links were converted to direct-access links.
            The format is: https://drive.google.com/uc?export=view&id=FILE_ID
          -->
          <source src="https://drive.google.com/uc?export=view&id=1UsRjbUIf1MkgxG8mFt6aMCaDgRzI-d6D" type="video/mp4" size="1080" data-label="1080p HD" default>
          <source src="https://drive.google.com/uc?export=view&id=1HfXI4xWbDNldOwIEaff4T6DYdw7W13nv" type="video/mp4" size="2160" data-label="4K UHD">
          
          <!-- 
            FIXED: Changed type="video/avi" to "video/mp4" for browser compatibility.
            The actual file on Google Drive MUST be an MP4 for this to work.
          -->
          <source src="https://drive.google.com/uc?export=view&id=1gvKMEKGwVS2DklsrIgKdoeN49m5bRZ-h" type="video/mp4" size="480" data-label="480p SD">
          
          <!-- The player will also detect all tracks and build the captions menu -->
          <track kind="captions" srclang="en" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" label="English" default />
          <track kind="captions" srclang="es" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captionses.vtt" label="Español" />
        </video>
    </div>

    <!-- The 'defer' attribute ensures the script runs after the document is parsed -->
    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@2.1.0/plr.js" defer></script>

</body>
</html>
```

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
