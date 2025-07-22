# GokuPlr - A Custom HTML5 Video Player

![jsDelivr](https://data.jsdelivr.com/v1/package/gh/gokuthug1/gplr/badge)

A lightweight, modern, and skinnable HTML5 video player that can be added to any website with a single line of code. This project transforms standard `<video>` elements into a feature-rich player with a clean, responsive UI and no external dependencies.

---

## Features

- **Custom Controls:** A clean and modern player interface that replaces the browser's default UI.
- **Playback Speed Control:** Easily adjust the video speed from 0.5× to 2×.
- **Thumbnail Previews:** See a video preview when hovering over the progress bar.
- **Keyboard Shortcuts:** Control playback with the keyboard (Space, K, M, F, Arrow Keys).
- **Picture-in-Picture:** Pop the video out into a floating window (if supported by the browser).
- **Fullscreen Mode:** Immersive, full-window viewing experience.
- **Caption Support:** Automatically detects and adds a button for VTT captions.
- **Download Button:** An optional link to download the video source file.
- **Responsive Design:** Looks great on both desktop and mobile devices.
- **Easy to Use:** No dependencies. Just add the script and a CSS class.

---

## Quick Start

Adding GokuPlr to your website is incredibly simple.

### Step 1: Add the Script

Place the following `<script>` tag just before the closing `</body>` tag in your HTML file. This will load the player from a fast, reliable CDN (jsDelivr):

```html
<!-- It's best to link to a specific version for stability -->
<script src="https://cdn.jsdelivr.net/gh/gokuthug1/gplr@v1.4/plr.js" defer></script>
```
## Step 2: Add the CSS Class

To transform a standard video element, simply add the class `cvp` to your `<video>` tag.

---

### Full Example

```html
<video
  class="cvp"
  src="path/to/your/video.mp4"
  poster="path/to/your/poster.jpg"
  width="854"
  height="480"
>
  <!-- Add VTT tracks for captions -->
  <track kind="captions" srclang="en" src="path/to/your/captions.vtt" label="English" default />
</video>
```


### Keyboard Shortcuts

The player can be controlled with the following keyboard shortcuts when it is focused:

| **Key**           | **Action**                  |
|-------------------|-----------------------------|
| `Space` or `K`     | Toggle Play/Pause           |
| `M`               | Toggle Mute/Unmute          |
| `F`               | Toggle Fullscreen           |
| `P`               | Toggle Picture-in-Picture   |
| `→` (Right Arrow) | Seek Forward 5 seconds      |
| `←` (Left Arrow)  | Seek Backward 5 seconds     |

---

## Customization & Theming

You can easily customize the player's appearance by overriding the default **CSS Custom Properties** (variables) in your own stylesheet. Define them within the `:root` selector to apply them globally.

#### Example:

```css
:root {
  --primary-color: #e74c3c;
  --controls-bg: rgba(15, 15, 15, 0.9);
  --text-color: #f1f1f1;
}
```

### Available Variables You Can Override:
- `--primary-color`
- `--menu-highlight-color`
- `--text-color`
- `--controls-bg`
- `--menu-bg`
- `--progress-bar-bg`
- `--tooltip-bg`
- `--border-radius`

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
