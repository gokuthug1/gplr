---

# GokuPlr - A Modern HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?version=2.3.4)

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

### v2.3.4
-   **Feature: Media Session API:** Now integrates with OS-level media controls. Play, pause, and seek directly from your keyboard's hardware keys, Windows/Mac media hubs, or mobile lock screens.
-   **Feature: Glassmorphism UI:** A complete visual overhaul introduces `backdrop-filter` blur effects to menus and controls, giving the player a sleek, modern, OS-native aesthetic.
-   **Feature: Loading Spinner:** A modern spinner now appears automatically when the network stalls or the video is buffering.
-   **Feature: Haptic Feedback:** Added subtle vibration feedback for touch interactions (Play, Pause, Seek) on supported mobile devices.
-   **Feature: Smart Double-Tap:** Double-tapping to seek now triggers a visual "Ripple" animation indicating the direction and action.
-   **Optimization:** Significant performance improvements to the Ambient Mode loop, reducing GPU usage when the player is paused or the tab is backgrounded.

### v2.3.0
-   **Feature: Ambient Mode (Ambilight):** A setting that creates a soft, blurred glow around the player that dynamically matches the colors of the video content.
-   **Feature: Share Functionality:** A menu to copy the video URL or copy a link to the video at the current timestamp.
-   **Improvement: High-Performance VTT Thumbnails:** Thumbnail previews are now powered by VTT files, resulting in instant previews without seeking a hidden video element.

### v2.2.0
-   **Feature: Full Mobile & Touch Support:** Optimized for touch devices with tap-to-toggle UI and draggable sliders.
-   **Feature: Double-Tap Gestures:** Double-tap sides to seek; double-tap center for fullscreen.

---

## Features

-   **Glassmorphism Design:** Modern, translucent UI elements with blur effects.
-   **Media Session Integration:** Control playback from your lock screen or hardware keys.
-   **Ambient Mode:** Immersive colored glow matching video content.
-   **Haptic Feedback:** Physical vibration feedback for mobile interactions.
-   **Smart Double-Tap:** Visual ripple indicators when seeking via double-tap.
-   **Buffering Indicators:** Built-in loading spinner for network states.
-   **Video Quality Switching:** Support for multiple `<source>` resolutions.
-   **High-Performance VTT Thumbnails:** Instant hover previews via sprite sheets.
-   **Advanced Captions:** Multi-language support with customizable styling.
-   **Volume Booster:** Boost volume up to 250% via Web Audio API.
-   **Persistent Settings:** Remembers volume, speed, and caption preferences.
-   **No Dependencies:** Pure ES6+ JavaScript.

---

## Quick Start

To use GokuPlr, add the `gplr` (or `goku-player`) class to your `<video>` tag and include the script.

### Full Page Example (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v2.3.4</title>
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
          
          <!-- NEW: VTT Thumbnail track for high-performance previews -->
          <track kind="metadata" label="thumbnails" src="https://archive.org/download/BigBuckBunny_328/BigBuckBunny_328_thumbnails.vtt" />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@2.3.4/plr.js" defer></script>

</body>
</html>
```

---

## Touch Gestures

| Gesture                       | Action                               |
| :---------------------------- | :----------------------------------- |
| Single Tap                    | Toggle Play/Pause or Show UI         |
| Double Tap (Left/Right Side)  | Seek -10s / +10s (with Ripple FX)    |
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
| `↑`            | Increase Volume by 10%                        |
| `↓`            | Decrease Volume by 10%                        |
| `Ctrl` + `Z`   | Toggle Volume Booster                         |

---

## Theming with CSS Variables

**Note: v2.3.4 introduces new variable names.** You can override these in your CSS to match your brand.

```css
:root {
    /* The primary accent color (buttons, progress bar) */
    --gplr-primary: #3ea6ff;
    
    /* Text color for icons and time */
    --gplr-text: #ffffff;
    
    /* The background gradient for the controls bar */
    --gplr-bg-controls: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
    
    /* Background color for menus (Settings, Quality, etc) */
    --gplr-bg-menu: rgba(28, 28, 28, 0.9);
    
    /* The blur intensity for Glassmorphism effects */
    --gplr-glass: blur(10px);
    
    /* Border radius for the player container */
    --gplr-radius: 8px;
    
    /* Font family used in the player */
    --gplr-font: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
