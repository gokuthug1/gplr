# GokuPlr - A Custom HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge?)

A lightweight, modern, and skinnable HTML5 video player that can be added to any website with a single line of code. This project transforms standard `<video>` elements into a beautiful, feature-rich player with a clean, responsive UI and no external dependencies.

---

## Features

- **Modern, Auto-Hiding UI:** Clean controls that disappear during playback for an unobstructed view, even while paused.
- **Advanced Settings Menu:**
    - Live theme color customization.
    - Playback speed control (0.5x to 2x).
    - Comprehensive caption styling: font family, size, color, background color, and background opacity.
    - Settings are saved locally to persist across sessions.
- **Thumbnail Previews:** See a video preview when hovering over the progress bar.
- **Full Keyboard Control:** Shortcuts for play/pause, volume, fullscreen, and seeking.
- **Picture-in-Picture & Fullscreen:** Native browser support for both modes.
- **Responsive & Lightweight:** Looks great on all screen sizes with no external dependencies.
- **Simple Integration:** Add to your site with a single script tag and a CSS class.
- **Download Button:** An optional link to download the video source file.

---

## Quick Start

To use GokuPlr, add the `cvp` class to your `<video>` tag and include the script before your closing `</body>` tag.

### Full Page Example (`index.html`)

Here is a complete, working example. You can copy this code into an `index.html` file and open it in your browser to see the player in action.

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
          <track kind="captions" srclang="en" src="<!DOCTYPE html>
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
          <track kind="captions" srclang="en" src="https://raw.githubusercontent.com/tnb1j/-/refs/heads/main/captions.vtt" label="English" default />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@v1.7/plr.js" defer></script>

</body>
</html>" label="English" default />
        </video>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@v1.7/plr.js" defer></script>

</body>
</html>
```

### Keyboard Shortcuts

| **Key**           | **Action**                  |
|-------------------|-----------------------------|
| `Space` or `K`    | Toggle Play/Pause           |
| `M`               | Toggle Mute/Unmute          |
| `F`               | Toggle Fullscreen           |
| `P`               | Toggle Picture-in-Picture   |
| `→` (Right Arrow) | Seek Forward 5 seconds      |
| `←` (Left Arrow)  | Seek Backward 5 seconds     |

---

## Customization & Theming

Set default styles by overriding CSS Custom Properties in your own stylesheet. While users can change these in the settings menu, this defines your site's base theme.

```css
:root {
  --primary-color: #e74c3c;        /* Red theme */
  --controls-bg: rgba(15, 15, 15, 0.9);
  --border-radius: 4px;           /* Sharper corners */
}
```

### Available Variables:
- `--primary-color`
- `--text-color`
- `--controls-bg`
- `--menu-bg`
- `--progress-bar-bg`
- `--border-radius`
- `--caption-font-family`, `--caption-font-size`, `--caption-font-color`, `--caption-bg-color`

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
