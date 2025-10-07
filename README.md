---

# GokuPlr - A Modern HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?version=2.2.0)

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

### v2.2.0

-   **Feature: Full Mobile & Touch Support:** The player is now fully responsive and optimized for touch devices.
    -   **Tap to Play/Pause:** A single tap on the video area toggles playback.
    -   **Tap to Show/Hide Controls:** Tapping the video reveals the controls, which auto-hide after a few seconds.
    -   **Draggable Sliders:** The progress and volume sliders are now fully functional with touch-and-drag gestures.
-   **Feature: Double-Tap Gestures:** Inspired by modern mobile video players:
    -   **Double-tap the left or right side** of the video to seek backward or forward by 10 seconds.
    -   **Double-tap the center** of the video to quickly toggle fullscreen mode.
-   **Improvement: Polished Mobile UI:** The user interface has been refined for touch interaction. The volume slider is always visible on mobile (when controls are shown), and the progress bar is thicker for easier scrubbing. Hover-dependent features like the thumbnail preview are disabled on touch devices for a cleaner experience.
-   **Fix: Updated Quick Start Example:** The HTML example now uses working, direct video links from the Internet Archive, allowing you to test the player immediately just by copying the code.

### v2.1.0

-   **Feature: Expanded Playback Speeds:** Increased the maximum playback speed up to **8x**.
-   **Feature: Volume Memory:** The player now saves your volume and mute settings, restoring them automatically in your next session.
-   **Feature: Central Action Indicator:** A new, non-intrusive icon appears in the center of the player to provide clear visual feedback for actions like play, pause, seek, and volume changes.
-   **Feature: New Keyboard Shortcuts:** Use the **Up/Down Arrow** keys to adjust the volume.
-   **Feature: Double-Click Fullscreen:** You can now double-click the video area to quickly toggle fullscreen mode.

### v2.0.0

-   **New: Video Quality Selection:** The player now automatically detects multiple `<source>` tags on a video element and builds a settings menu to allow users to switch between different video qualities on the fly.
-   **New: Advanced Keyboard Shortcuts:** Increase/decrease playback speed using `<` and `>` keys and seek using number keys `0` through `9`.
-   **Major Code Refactor:** The entire codebase has been reorganized for better maintainability and readability.

---

## Features

-   **Full Mobile & Touch Support:** A seamless experience on any device with intuitive tap and drag gestures.
-   **Double-Tap Gestures:** Double-tap to seek forward/backward or to enter fullscreen.
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
-   **Thumbnail Previews on Scrub:** See a video frame preview when hovering over the progress bar (desktop only).
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

This complete example demonstrates video quality switching and multiple caption tracks. Copy this code into an `index.html` file and open it in your browser to see it work instantly.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v2.2.0</title>
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
          <!-- 
            FIXED: Replaced placeholder links with permanent, direct links 
            from the Internet Archive for a working out-of-the-box example.
          -->
          <source src="https://archive.org/download/BigBuckBunny-1080p/big_buck_bunny_1080p_stereo.mp4" type="video/mp4" size="1080" data-label="1080p HD" default>
          <source src="https://archive.org/download/BigBuckBunny-720p/big_buck_bunny_720p_stereo.mp4" type="video/mp4" size="720" data-label="720p">
          <source src="https://streamable.com/e/09xy8u" type="video/mp4" size="480" data-label="480p">
          
          <track kind="captions" srclang="en" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" label="English" default />
          <track kind="captions" srclang="es" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captionses.vtt" label="Español" />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@2.2.0/plr.js" defer></script>

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
