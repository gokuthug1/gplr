---

# GokuPlr - A Modern HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?version=2.5.2)

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

### v2.5.2 (Major Refactor)
-   **Performance Overhaul:** Complete architectural refactor resulting in a **40% reduction in file size (~40KB)** while maintaining all features.
-   **Optimization:** Replaced repetitive DOM logic with event delegation and dynamic HTML generation.
-   **Theming System:** Updated CSS variables to use the `--gplr-` prefix to prevent conflicts with host page styles.
-   **Memory Efficiency:** Improved garbage collection for event listeners and canvas elements.
-   **Accessibility:** Enhanced keyboard navigation (`Tab` index) and added ARIA labels for screen readers.

### v2.5.1
-   **UI/UX Enhancement:** Optimized touch target sizes to WCAG AA standards (44×44px minimum).
-   **Visual Upgrade:** Enhanced glassmorphism effects with improved backdrop blur.
-   **Design Improvements:** Better contrast ratios and enhanced progress bar visibility.
-   **Error Handling:** Added robust handling for canvas operations and source setup.

### v2.4.x
-   **v2.4.3:** Mobile settings sizing adjustments.
-   **v2.4.2:** Fixed mobile control visibility logic.
-   **v2.4.1:** Resolved DOM stacking order issues; fixed mobile tap-to-show interactions.
-   **v2.4.0:** Organized Settings Menu (Playback, Audio, Display); reduced file size by stripping redundant ARIA attributes; refactored Download feature.

### v2.3.x
-   **Glassmorphism UI:** Complete visual overhaul.
-   **Ambient Mode:** Immersive glowing background effect.
-   **Volume Booster:** Boost audio up to 200%.
-   **VTT Thumbnails:** High-performance hover previews via sprite sheets.

---

## Features

-   **Ultra Lightweight:** ~40KB (minified), no dependencies.
-   **Glassmorphism Design:** Modern, translucent UI with backdrop filters.
-   **Ambient Mode:** Immersive colored glow matching video content (Ambilight effect).
-   **Volume Booster:** Boost volume up to 200% via Web Audio API.
-   **VTT Thumbnails:** Instant hover previews via sprite sheets.
-   **Accessibility:** WCAG AA compliant touch targets and keyboard navigation.
-   **Mobile First:** Optimized touch gestures, tap-to-toggle UI, and draggable sliders.
-   **Smart Double-Tap:** Double-tap sides to seek; double-tap center for fullscreen.
-   **Video Quality Switching:** Support for multiple `<source>` resolutions.
-   **Advanced Captions:** Multi-language support with customizable styling.
-   **Download Support:** Built-in safe download button (supports local and CORS-enabled remote files).
-   **Persistent Settings:** Remembers volume, speed, and caption preferences.

---

## Quick Start

To use GokuPlr, add the `gplr` class to your `<video>` tag and include the script.

### Full Page Example (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr v2.5.2</title>
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

    <!-- Make sure to use the latest version -->
    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@v2.5.2/plr.js" defer></script>

</body>
</html>
```

---

## Touch Gestures

| Gesture                       | Action                               |
| :---------------------------- | :----------------------------------- |
| Single Tap (Controls Hidden)  | Show Controls                        |
| Single Tap (Controls Visible) | Play/Pause (Desktop) / Hide (Mobile) |
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
| `L` or `→`     | Seek Forward 5s                               |
| `J` or `←`     | Seek Backward 5s                              |
| `↑`            | Increase Volume by 10%                        |
| `↓`            | Decrease Volume by 10%                        |

---

## Theming with CSS Variables

You can override these variables in your CSS to match your brand. Note the updated variable names in v2.5.2.

```css
:root {
    /* The primary accent color (buttons, progress bar, active states) */
    --gplr-primary: #ff4081;
    
    /* Text color for icons and time */
    --gplr-text: #ffffff;
    
    /* The background gradient for the controls bar */
    --gplr-bg: rgba(15, 15, 15, 0.85);
    
    /* Background color for menus (Settings, Quality, etc) */
    --gplr-menu: rgba(25, 25, 25, 0.95);
    
    /* Font family used in the player */
    --gplr-font: 'Inter', system-ui, -apple-system, sans-serif;
    
    /* Border radius for the player container */
    --gplr-radius: 8px;
}
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```
