# GokuPlr - Ultimate HTML5 Video Player

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg) ![Size](https://img.shields.io/badge/size-39KB-green.svg) ![License](https://img.shields.io/badge/license-MIT-orange.svg)

**GokuPlr v3.0.0** is the definitive HTML5 video player wrapper. It combines enterprise-grade performance with a stunning Glassmorphism UI. 

By utilizing modern JavaScript architecture (ES6+ classes, event delegation, and template literals), v3.0.0 delivers **more features** than previous versions while cutting the file size by **nearly 50%**.

---

## Table of Contents

- [Changelog](#changelog)
- [Features](#features)
- [Quick Start](#quick-start)
- [Advanced Configuration](#advanced-configuration)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Theming](#theming)
- [License](#license)

---

## Changelog

### v3.0.0 (The Ultimate Update)
-   **Architecture Overhaul:** Merged the robust feature set of v2.5.0 with the high-performance engine of v2.5.2.
-   **Massive Size Reduction:** Reduced file size to **~39KB** by replacing verbose DOM construction with efficient template literals.
-   **New Features:**
    -   **Advanced Caption Styling:** Users can now customize caption color, background, font, and size directly from the player.
    -   **AirPlay & Chromecast:** Native support added (buttons appear when available).
    -   **Audio Booster:** Re-engineered using a Singleton AudioContext to prevent browser resource limits.
    -   **Smart VTT:** Improved thumbnail parsing for sprites.
-   **Performance:** Implemented `AbortController` for zero-memory-leak destruction and throttled `requestAnimationFrame` loops for Ambient Mode to save battery.

### v2.5.2
-   Major refactor focusing on mobile touch targets and event delegation.

---

## Features

-   **🪶 Ultra Lightweight:** Only ~39KB. No dependencies (jQuery-free).
-   **🎨 Glassmorphism UI:** Beautiful, translucent controls with backdrop blur.
-   **🔊 Audio Booster:** Boost volume up to **250%** via Web Audio API.
-   **💡 Ambient Mode:** Ambilight-style glow effect that reacts to video content.
-   **🖼️ VTT Thumbnails:** High-performance hover previews via sprite sheets.
-   **📝 Advanced Captions:** Multi-track support with user-customizable styling (Color, Size, Font).
-   **📺 Casting:** Built-in support for Apple AirPlay and Google Cast.
-   **📱 Mobile Optimized:** 44px+ touch targets, swipe gestures, and passive event listeners.
-   **⚙️ Persistence:** Remembers volume, speed, caption preferences, and styles across sessions.
-   **📥 Download Manager:** Smart download button handling CORS and blob URLs.

---

## Quick Start

Simply add the `gplr` class to your `<video>` tag. The script automatically initializes any video with this class.

### Basic Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v3.0.0</title>
    <style>
        body { background: #000; display: grid; place-items: center; height: 100vh; margin: 0; }
        .player-wrapper { width: 100%; max-width: 900px; aspect-ratio: 16/9; }
    </style>
</head>
<body>

    <div class="player-wrapper">
        <video 
            class="gplr" 
            poster="poster.png" 
            crossorigin="anonymous" 
            playsinline
        >
            <!-- Main Video Source -->
            <source src="2160.mp4" type="video/mp4" data-quality="2160p">
          <source src="1080.mp4" type="video/mp4" data-quality="1080p">
          <source src="480.avi" type="video/avi" data-quality="480p">
            
            <!-- Captions -->
          <track kind="subtitles" label="English" srclang="en" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" default>
          <track kind="subtitles" label="Spanish" srclang="es" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captionses.vtt">
            
            <!-- Thumbnail Preview (VTT) -->
            <track kind="metadata" label="thumbnails" src="https://upload.wikimedia.org/wikipedia/commons/7/70/Big.Buck.Bunny.-.Opening.Screen.png">
        </video>
    </div>

    <!-- Load GokuPlr v3.0.0 -->
    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@v3.0.0/plr.js" defer></script>

</body>
</html>
```

---

## Advanced Configuration

### VTT Thumbnails
To enable hover previews, include a track with `kind="metadata"` and `label="thumbnails"`. The VTT file should follow this format:

```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
thumbs.jpg#xywh=0,0,160,90

00:00:05.000 --> 00:00:10.000
thumbs.jpg#xywh=160,0,160,90
```
*Note: `xywh` stands for x, y, width, height on the sprite sheet.*

### Audio Booster & CORS
For the Audio Booster and Ambient Mode to work, your video server must support CORS, and you must add `crossorigin="anonymous"` to the `<video>` tag.

---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` / `K` | Play / Pause |
| `F` | Toggle Fullscreen |
| `M` | Mute / Unmute |
| `←` / `J` | Seek Backward 5s |
| `→` / `L` | Seek Forward 5s |
| `↑` | Volume Up |
| `↓` | Volume Down |

---

## Theming

GokuPlr v3.0.0 uses simplified CSS variables. You can override these in your own CSS to match your branding.

```css
:root {
    /* Main Accent Color */
    --gplr-primary: #ff4081;
    
    /* Player Background (Glass effect base) */
    --gplr-bg: rgba(20, 20, 20, 0.9);
    
    /* Text Color */
    --gplr-txt: #ffffff;
    
    /* Border Radius */
    --gplr-rad: 8px;
    
    /* Caption Defaults (Users can override these in settings) */
    --cap-color: #ffffff;
    --cap-bg: rgba(0, 0, 0, 0.8);
    --cap-size: 20px;
    --cap-font: sans-serif;
}
```

---

## License

This project is licensed under the MIT License.
