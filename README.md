# GokuPlr - A Custom HTML5 Video Player

![jsDelivr](https://data.jsdelivr.net/v1/package/gh/gokuthug1/gplr/badge?style=flat&label=v1.8.0)

A lightweight, modern, and skinnable HTML5 video player that can be added to any website with a single line of code. This project transforms standard `<video>` elements into a beautiful, feature-rich player with a clean, responsive UI and no external dependencies.

---

## Features

- **Modern, Auto-Hiding UI:** Clean controls that disappear during playback for an unobstructed view.
- **Professional Captions Menu:** Automatically detects and lists multiple language tracks (e.g., English, Spanish). The UI clearly separates track selection from style customization.
- **Volume Booster:** Use the Web Audio API to boost volume up to 200%, accessible via an icon, the settings menu, or a keyboard shortcut.
- **Advanced Settings Menu:**
    - Playback speed control (0.5x to 2x).
    - Customize caption appearance: font, size, color, background, and opacity.
    - Customize the player's primary accent color.
    - Settings are saved locally to persist across sessions.
- **Thumbnail Previews:** See a video preview when hovering over the progress bar.
- **Full Keyboard Control:** Comprehensive shortcuts for play/pause, volume, seeking, fullscreen, and more.
- **Picture-in-Picture & Fullscreen:** Native browser support for both modes.
- **Responsive & Lightweight:** Looks great on all screen sizes with no external dependencies.
- **Simple Integration:** Add to your site with a single script tag and a CSS class.
- **Download Button:** An optional link to download the video source file.

---

## Quick Start

To use GokuPlr, add the `cvp` class to your `<video>` tag and include the script before your closing `</body>` tag.

### Full Page Example (`index.html`)

Here is a complete, working example. This example includes multiple caption tracks to showcase the new captions menu. You can copy this code into an `index.html` file and open it in your browser to see the player in action.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GokuPlr Example</title>
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
            border-radius: 8px;
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
          <track kind="captions" srclang="es" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" label="Español" />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@v1.8.0/plr.js" defer></script>

</body>
</html>
