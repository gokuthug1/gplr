---

# GokuPlr - A Modern HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?version=2.4)

GokuPlr is a lightweight, dependency-free JavaScript library that instantly upgrades standard HTML5 `<video>` elements into a beautiful, feature-rich, and mobile-friendly player. It's designed for easy integration, high performance, and extensive customization with a modern **Glassmorphism** design.

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

### v2.3.7
-   **UX Improvement:** The Settings Menu is now organized into logical categories (**Playback**, **Audio**, **Display**) for easier navigation.
-   **Optimization:** Significant file size reduction (~8KB) by stripping ARIA attributes and simplifying DOM logic.
-   **Performance:** Refactored the Download feature to use a lightweight anchor method, fixing memory crashes on large files.
-   **Visual Fix:** Updated `Seek Backward` and `Seek Forward` SVGs to be geometrically symmetrical and sharper.

### v2.3.4 - v2.3.6
-   **Feature: Glassmorphism UI:** A complete visual overhaul introduces `backdrop-filter` blur effects to menus and controls.
-   **Feature: Ambient Mode (Ambilight):** A setting that creates a soft, blurred glow around the player that dynamically matches the colors of the video content.
-   **Feature: Volume Booster:** Boost volume up to 200% via Web Audio API.
-   **Feature: Haptic Feedback:** Added subtle vibration feedback for touch interactions on supported mobile devices.
-   **Optimization:** Significant performance improvements to the Ambient Mode loop.

### v2.3.0
-   **Feature: Share Functionality:** A menu to copy the video URL or copy a link to the video at the current timestamp.
-   **Improvement: High-Performance VTT Thumbnails:** Thumbnail previews are now powered by VTT files (Sprite Sheets).

### v2.2.0
-   **Feature: Full Mobile & Touch Support:** Optimized for touch devices with tap-to-toggle UI and draggable sliders.

---

## Features

-   **Glassmorphism Design:** Modern, translucent UI elements with blur effects.
-   **Categorized Settings:** Organized menu for Quality, Speed, Audio, and Captions.
-   **Ambient Mode:** Immersive colored glow matching video content.
-   **Volume Booster:** Boost volume up to 200% via Web Audio API.
-   **Smart Double-Tap:** Double-tap sides to seek; double-tap center for fullscreen.
-   **Video Quality Switching:** Support for multiple `<source>` resolutions.
-   **High-Performance VTT Thumbnails:** Instant hover previews via sprite sheets.
-   **Advanced Captions:** Multi-language support with customizable styling (Font, Color, Background).
-   **Download Support:** Built-in download button (supports local and CORS-enabled remote files).
-   **Persistent Settings:** Remembers volume, speed, and caption preferences.
-   **No Dependencies:** Pure ES6+ JavaScript.

---

## Quick Start

To use GokuPlr, add the `gplr` (or `goku-player`, `video`, `vp`) class to your `<video>` tag and include the script.

### Full Page Example (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v2.4</title>
    <style>
        body {
            background-color: #111;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .video-wrapper {
            max-width: 900px;
            width: 100%;
            /* Optional: Enforce aspect ratio to prevent layout shift */
            aspect-ratio: 16/9; 
        }
    </style>
</head>
<body>

    <div class="video-wrapper">
        <video
          class="gplr"
          poster="https://archive.org/download/BigBuckBunny-1080p/big_buck_bunny_poster.jpg"
          crossorigin="anonymous"
          playsinline
        >
          <!-- Video quality sources -->
          <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" size="1080" data-label="1080p HD" default>
          
          <!-- Captions -->
          <track kind="subtitles" label="English" srclang="en" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" default>
          <track kind="subtitles" label="Spanish" srclang="es" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captionses.vtt">
          
          <!-- VTT Thumbnail track for high-performance previews -->
          <track kind="metadata" label="thumbnails" src="https://archive.org/download/BigBuckBunny_328/BigBuckBunny_328_thumbnails.vtt" />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@2.4/plr.js" defer></script>

</body>
</html>
```

---

## Touch Gestures

| Gesture                       | Action                               |
| :---------------------------- | :----------------------------------- |
| Single Tap                    | Toggle Play/Pause or Show UI         |
| Double Tap (Left/Right Side)  | Seek -10s / +10s                     |
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
| `L` or `→`     | Seek Forward 5s                               |
| `J` or `←`     | Seek Backward 5s                              |
| `↑`            | Increase Volume by 5%                         |
| `↓`            | Decrease Volume by 5%                         |
| `Ctrl` + `Z`   | Toggle Volume Booster                         |
| `,` / `.`      | Decrease / Increase Speed                     |

---

## Theming with CSS Variables

You can override these standard variables in your CSS to match your brand.

```css
:root {
    /* The primary accent color (buttons, progress bar, checkmarks) */
    --primary-color: #ff4081;
    
    /* Text color for icons and time */
    --text-color: #ffffff;
    
    /* The background gradient for the controls bar */
    --controls-bg: rgba(15, 15, 15, 0.85);
    
    /* Background color for menus (Settings, Quality, etc) */
    --menu-bg: rgba(25, 25, 25, 0.95);
    
    /* Background for the empty part of progress/volume bars */
    --progress-bar-bg: rgba(255, 255, 255, 0.25);
    
    /* Font family used in the player */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    
    /* Border radius for the player container */
    --border-radius: 8px;
}
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
