/**
 * GokuPlr v1.8.0 (Updated)
 * A script to transform standard HTML5 video elements into a custom-styled player.
 * To use, include this script and add the class "cvp" to your <video> tags.
 * Change in v1.8.0:
 * - REFACTORED: Captions UI is now more modern and professional.
 *   - The settings menu now supports selecting from multiple available caption tracks (e.g., English, Spanish).
 *   - Caption track selection is now separate from visual customization ("Options"), creating a clearer user flow.
 *   - The main menu dynamically displays the currently active caption track.
 * - NEW: Added keyboard shortcuts for seeking. Use 'J' to seek backward 10 seconds and 'L' to seek forward 10 seconds.
 * - Refactored caption handling logic to be more robust and extensible.
 */

(function() {
    // This wrapper prevents our code from interfering with other scripts on the page.

    // Check if the script has already been run to avoid re-initializing.
    if (window.customPlayerInitialized) {
        return;
    }
    window.customPlayerInitialized = true;

    // The full, correct class implementation.
    class CustomVideoPlayer {
        // Share a single AudioContext across all player instances on a page.
        static audioContext = null;

        constructor(videoElement) {
            this.video = videoElement;
            if (!this.video) {
                console.error(`Video player error: Could not find video element.`);
                return;
            }
            this.video.controls = false;

            this.injectStyles();
            this.buildPlayerHtml();
            this.selectDOMElements();
            this.initializePlayerState();
            this.loadSettings(); // Load saved settings from localStorage
            this.attachEventListeners();
        }

        injectStyles() {
            const styleId = 'custom-video-player-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                :root { --primary-color: #00a8ff; --menu-highlight-color: #6A5ACD; --text-color: #ffffff; --controls-bg: rgba(20, 20, 20, 0.85); --menu-bg: rgba(30, 30, 30, 0.95); --progress-bar-bg: rgba(255, 255, 255, 0.3); --tooltip-bg: rgba(0, 0, 0, 0.85); --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; --border-radius: 8px; --transition-speed: 0.2s; }
                .video-player-container { --primary-color: #00a8ff; --caption-font-size: 22px; --caption-font-color: #ffffff; --caption-bg-color: rgba(0, 0, 0, 0.75); --caption-font-family: 'Arial', sans-serif; }
                .video-player-container:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
                .time-display, .tooltip-time { -webkit-user-select: none; -ms-user-select: none; user-select: none; }
                .video-player-container { position: relative; width: 100%; background-color: #000; border-radius: var(--border-radius); overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; aspect-ratio: 16 / 9; }
                .video-player-container.no-cursor { cursor: none; }
                .video-player-container.fullscreen { max-width: none; width: 100%; height: 100%; border-radius: 0; aspect-ratio: auto; }
                .video-player-container video { width: 100%; height: 100%; display: block; }

                .video-player-container video::cue { background-color: var(--caption-bg-color); color: var(--caption-font-color); font-size: var(--caption-font-size); font-family: var(--caption-font-family); transition: bottom var(--transition-speed) ease-in-out; bottom: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
                .video-player-container.controls-visible.captions-on video::cue { bottom: 85px; }
                @media (max-width: 600px) { .video-player-container.controls-visible.captions-on video::cue { bottom: 70px; } }

                .video-controls { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px; display: flex; flex-direction: column; background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); opacity: 0; transition: opacity var(--transition-speed) ease-in-out; z-index: 2; }
                .video-player-container .video-controls.visible { opacity: 1; }
                .controls-bottom { display: flex; align-items: center; gap: 12px; }
                .controls-left, .controls-right { display: flex; align-items: center; gap: 12px; }
                .controls-right { margin-left: auto; }
                .control-button { background: none; border: none; padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background var(--transition-speed), opacity var(--transition-speed); }
                .control-button svg { width: 22px; height: 22px; fill: var(--text-color); pointer-events: none; transition: fill var(--transition-speed); }
                .control-button:hover { background: rgba(255, 255, 255, 0.2); }
                .control-button.disabled { opacity: 0.5; pointer-events: none; cursor: not-allowed; }
                .control-button.active svg, .control-button.menu-open svg { fill: var(--primary-color); }
                .play-pause-btn .pause-icon { display: none; }
                .video-player-container.playing .play-pause-btn .play-icon { display: none; }
                .video-player-container.playing .play-pause-btn .pause-icon { display: block; }
                .mute-btn .volume-high-icon, .mute-btn .volume-medium-icon, .mute-btn .volume-low-icon, .mute-btn .muted-icon { display: none; }
                .video-player-container.volume-high:not(.muted) .mute-btn .volume-high-icon { display: block; }
                .video-player-container.volume-medium:not(.muted) .mute-btn .volume-medium-icon { display: block; }
                .video-player-container.volume-low:not(.muted) .mute-btn .volume-low-icon { display: block; }
                .video-player-container.muted .mute-btn .muted-icon { display: block; }
                .fullscreen-btn .enter-fs-icon { display: block; }
                .fullscreen-btn .exit-fs-icon { display: none; }
                .video-player-container.fullscreen .fullscreen-btn .enter-fs-icon { display: none; }
                .video-player-container.fullscreen .fullscreen-btn .exit-fs-icon { display: block; }
                .progress-bar-container { width: 100%; height: 12px; display: flex; align-items: center; cursor: pointer; margin-bottom: 8px; }
                .progress-bar { width: 100%; height: 5px; background: var(--progress-bar-bg); border-radius: 10px; position: relative; transition: height var(--transition-speed); }
                .progress-bar-filled { height: 100%; background: var(--primary-color); border-radius: 10px; width: 0%; position: relative; }
                .progress-bar-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--text-color); position: absolute; right: 0; top: 50%; transform: translate(50%, -50%); opacity: 0; transition: opacity var(--transition-speed); }
                .progress-bar-container:hover .progress-bar-thumb { opacity: 1; }
                .progress-bar-container:hover .progress-bar { height: 8px; }
                .seek-tooltip { position: absolute; bottom: 35px; left: 0; background: var(--tooltip-bg); border: 1px solid rgba(255, 255, 255, 0.2); padding: 5px; border-radius: var(--border-radius); display: none; transform: translateX(-50%); text-align: center; color: var(--text-color); font-size: 12px; z-index: 3; }
                .seek-tooltip canvas { width: 160px; height: 90px; border-radius: 4px; margin-bottom: 4px; }
                .volume-container { display: flex; align-items: center; }
                .volume-slider { width: 0; height: 5px; background: var(--progress-bar-bg); border-radius: 10px; cursor: pointer; position: relative; transition: width var(--transition-speed) ease-in-out, opacity var(--transition-speed); margin-left: -10px; opacity: 0; }
                .volume-container:hover .volume-slider { width: 80px; margin-left: 5px; opacity: 1; }
                .volume-filled { height: 100%; background: var(--text-color); border-radius: 10px; width: 100%; position: relative; }
                .volume-thumb { width: 12px; height: 12px; border-radius: 50%; background: var(--text-color); position: absolute; top: 50%; transform: translateY(-50%); left: 100%; margin-left: -6px; opacity: 0; transition: opacity var(--transition-speed); pointer-events: none; }
                .volume-container:hover .volume-thumb { opacity: 1; }
                .time-display { color: var(--text-color); font-size: 14px; font-variant-numeric: tabular-nums; }
                
                .big-play-button { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: none; border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: transform 0.1s, opacity 0.2s; opacity: 1; z-index: 1; padding: 0; }
                .big-play-button:hover { transform: translate(-50%, -50%) scale(1.1); }
                .big-play-button:hover svg { fill: var(--primary-color); }
                .big-play-button svg { width: 80px; height: 80px; fill: var(--text-color); transition: fill var(--transition-speed); }
                .video-player-container.playing .big-play-button { opacity: 0; pointer-events: none; }

                /* --- REFINED: Settings Menu --- */
                .settings-menu { position: relative; }
                .settings-menu .menu-content { position: absolute; bottom: 100%; right: 0; margin-bottom: 10px; background: var(--menu-bg); border-radius: var(--border-radius); opacity: 0; visibility: hidden; transform: translateY(10px); transition: opacity 0.2s, transform 0.2s, visibility 0.2s; width: 270px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); overflow: hidden; }
                .settings-menu .menu-content.visible { opacity: 1; visibility: visible; transform: translateY(0); }
                .menu-panels-wrapper { display: flex; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
                .menu-panel { width: 100%; flex-shrink: 0; padding: 8px; }
                .menu-header { padding: 8px 12px; font-size: 15px; font-weight: 500; color: #eee; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin: -8px -8px 8px -8px; display: flex; justify-content: space-between; align-items: center; }
                .menu-item { background: none; border: none; border-radius: 4px; width: 100%; text-align: left; padding: 10px 12px; color: var(--text-color); font-size: 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .menu-item:hover { background: rgba(255, 255, 255, 0.1); }
                .menu-item-value { color: #aaa; font-size: 14px; }
                .menu-back-btn { background: none; border: none; color: #eee; font-size: 15px; font-weight: 500; padding: 8px 12px; margin: -8px -8px 8px -8px; width: calc(100% + 16px); text-align: left; cursor: pointer; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
                .menu-back-btn:hover { background: rgba(255, 255, 255, 0.1); }
                
                /* --- NEW: Caption Menu Styles --- */
                .menu-separator { height: 1px; background: rgba(255, 255, 255, 0.1); margin: 8px 0; }
                .captions-track-list .menu-item.active { background-color: rgba(0, 168, 255, 0.15); }
                .captions-track-list .menu-item .check-mark { width: 20px; display: inline-block; text-align: left; font-weight: bold; color: var(--primary-color); opacity: 0; margin-right: 5px; }
                .captions-track-list .menu-item.active .check-mark { opacity: 1; }
                .captions-track-list .menu-item { justify-content: flex-start; }

                .speed-slider-container { padding: 12px; display: flex; align-items: center; gap: 12px; }
                .speed-slider-container .speed-panel-display { color: #ccc; font-size: 14px; font-variant-numeric: tabular-nums; min-width: 45px; text-align: right; }
                .caption-settings-grid { display: grid; grid-template-columns: auto 1fr; gap: 12px 15px; align-items: center; padding: 8px 12px; font-size: 14px; color: #eee; }
                .caption-settings-grid label { white-space: nowrap; justify-self: end; }
                .caption-settings-grid input[type="color"] { width: 28px; height: 28px; border: 1px solid #555; border-radius: 4px; padding: 2px; background: none; cursor: pointer; justify-self: start; }
                .caption-settings-grid select { width: 100%; background: #333; color: white; border: 1px solid #555; border-radius: 4px; padding: 6px; font-size: 14px; }
                .caption-settings-grid .slider-container { display: flex; align-items: center; gap: 8px; width: 100%; }
                input[type=range].goku-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; background: var(--progress-bar-bg); border-radius: 5px; outline: none; cursor: pointer; }
                input[type=range].goku-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 15px; height: 15px; background: var(--text-color); border-radius: 50%; cursor: pointer; margin-top: -5px; transition: background var(--transition-speed); }
                input[type=range].goku-slider:hover::-webkit-slider-thumb, input[type=range].goku-slider:focus::-webkit-slider-thumb { background: var(--primary-color); }
                input[type=range].goku-slider::-moz-range-thumb { width: 15px; height: 15px; background: var(--text-color); border-radius: 50%; cursor: pointer; border: none; transition: background var(--transition-speed); }

                .control-button:focus-visible, .settings-menu button:focus-visible, input[type=range]:focus-visible, select:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
                @media (max-width: 600px) { .volume-container:hover .volume-slider { width: 50px; } .time-display { font-size: 12px; } .control-button svg { width: 20px; height: 20px; } .controls-bottom, .controls-left, .controls-right { gap: 6px; } }
            `;
            document.head.appendChild(style);
        }

        buildPlayerHtml() {
            const container = document.createElement('div');
            container.className = 'video-player-container';
            container.tabIndex = 0;
            this.container = container;
            this.video.parentNode.insertBefore(container, this.video);
            container.appendChild(this.video);

            // REFACTORED: Updated settings menu for the new captions flow.
            const controlsHtml = `
                <video class="thumbnail-video" muted playsinline style="display: none;"></video>
                <button class="big-play-button" aria-label="Play Video"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></button>
                <div class="video-controls">
                    <div class="progress-bar-container">
                        <div class="seek-tooltip"><canvas class="thumbnail-canvas"></canvas><span class="tooltip-time">00:00</span></div>
                        <div class="progress-bar"><div class="progress-bar-filled"></div><div class="progress-bar-thumb"></div></div>
                    </div>
                    <div class="controls-bottom">
                        <div class="controls-left">
                            <button class="control-button play-pause-btn" aria-label="Play/Pause"><svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5V19L19 12L8 5Z"></path></svg><svg class="pause-icon" viewBox="0 0 24 24"><path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"></path></svg></button>
                            <div class="volume-container">
                                <button class="control-button mute-btn" aria-label="Mute/Unmute"><svg class="volume-high-icon" viewBox="0 0 24 24"><path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.84 14 18.7V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"></path></svg><svg class="volume-medium-icon" viewBox="0 0 24 24"><path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12Z"></path></svg><svg class="volume-low-icon" viewBox="0 0 24 24"><path d="M3 9H7L12 4V20L7 15H3V9Z"></path></svg><svg class="muted-icon" viewBox="0 0 24 24"><path d="M16.5 12C16.5 10.23 15.54 8.71 14 7.97V10.18L16.45 12.63C16.5 12.43 16.5 12.21 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.62 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 17.84 14.83 18.08 14 18.22V20.29C14.91 20.13 15.77 19.82 16.55 19.38L18.73 21.56L20 20.28L4.27 3ZM12 4L10.12 5.88L12 7.76V4Z"></path></svg></button>
                                <div class="volume-slider"><div class="volume-filled"></div><div class="volume-thumb"></div></div>
                            </div>
                            <div class="time-display"><span class="current-time">00:00</span> / <span class="total-time">00:00</span></div>
                        </div>
                        <div class="controls-right">
                            <button class="control-button volume-booster-btn" aria-label="Toggle Volume Booster (Ctrl+Z)">
                                <svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"></path></svg>
                            </button>
                            <div class="settings-menu">
                                <button class="control-button settings-btn" aria-label="Settings">
                                    <svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>
                                </button>
                                <div class="menu-content">
                                    <div class="menu-panels-wrapper">
                                        <div class="menu-panel main-panel">
                                            <button class="menu-item volume-booster-toggle"><span>Volume Booster</span><span class="menu-item-value booster-status">Off</span></button>
                                            <button class="menu-item" data-target-panel="speed"><span>Playback Speed</span><span class="menu-item-value speed-display">1.0×</span></button>
                                            <button class="menu-item captions-menu-btn" data-target-panel="captions-track"><span>Captions</span><span class="menu-item-value captions-status">Off ></span></button>
                                        </div>
                                        <div class="menu-panel speed-panel">
                                            <button class="menu-back-btn" data-target-panel="main">< Playback Speed</button>
                                            <div class="speed-slider-container">
                                                <input type="range" class="goku-slider speed-slider" min="0" max="5" value="2" step="1">
                                                <span class="speed-panel-display">1.0×</span>
                                            </div>
                                        </div>
                                        <div class="menu-panel captions-track-panel">
                                            <button class="menu-back-btn" data-target-panel="main">< Captions</button>
                                            <div class="captions-track-list"></div>
                                            <div class="menu-separator"></div>
                                            <button class="menu-item" data-target-panel="captions-style"><span>Options</span><span class="menu-item-value">></span></button>
                                        </div>
                                        <div class="menu-panel captions-style-panel">
                                            <button class="menu-back-btn" data-target-panel="captions-track">< Options</button>
                                            <div class="caption-settings-grid">
                                                <label for="accent-color">Accent</label><input type="color" id="accent-color" class="caption-setting-input" data-setting="primary-color" data-target-prop="style">
                                                <label for="caption-font">Font</label>
                                                <select id="caption-font" class="caption-setting-input" data-setting="caption-font-family">
                                                    <option>Arial</option><option>Verdana</option><option>Helvetica</option><option>Times New Roman</option><option>Courier New</option><option>Georgia</option>
                                                </select>
                                                <label for="caption-font-size">Font Size</label>
                                                <div class="slider-container"><input type="range" id="caption-font-size" class="goku-slider caption-setting-input" min="14" max="36" step="1" data-setting="caption-font-size" data-unit="px"></div>
                                                <label for="caption-font-color">Font Color</label><input type="color" id="caption-font-color" class="caption-setting-input" data-setting="caption-font-color">
                                                <label for="caption-bg-color">BG Color</label><input type="color" id="caption-bg-color" class="caption-setting-input" data-setting="caption-bg-color" data-opacity-input="caption-bg-opacity">
                                                <label for="caption-bg-opacity">BG Opacity</label>
                                                <div class="slider-container"><input type="range" id="caption-bg-opacity" class="goku-slider caption-setting-input" min="0" max="100" step="5" data-setting="caption-bg-color" data-is-opacity="true"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="control-button captions-btn" aria-label="Toggle Captions"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"></path></svg></button>
                            <button class="control-button pip-btn" aria-label="Picture-in-Picture"><svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path></svg></button>
                            <button class="control-button fullscreen-btn" aria-label="Toggle Fullscreen"><svg class="enter-fs-icon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg><svg class="exit-fs-icon" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg></button>
                            <a href="#" class="control-button download-btn disabled" aria-label="Download Video"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg></a>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', controlsHtml);
        }

        selectDOMElements() {
            this.thumbnailVideo = this.container.querySelector('.thumbnail-video');
            this.playPauseBtn = this.container.querySelector('.play-pause-btn');
            this.bigPlayBtn = this.container.querySelector('.big-play-button');
            this.muteBtn = this.container.querySelector('.mute-btn');
            this.volumeSlider = this.container.querySelector('.volume-slider');
            this.volumeFilled = this.container.querySelector('.volume-filled');
            this.volumeThumb = this.container.querySelector('.volume-thumb');
            this.progressBarContainer = this.container.querySelector('.progress-bar-container');
            this.progressBar = this.container.querySelector('.progress-bar');
            this.progressBarFilled = this.container.querySelector('.progress-bar-filled');
            this.currentTimeEl = this.container.querySelector('.current-time');
            this.totalTimeEl = this.container.querySelector('.total-time');
            this.fullscreenBtn = this.container.querySelector('.fullscreen-btn');
            this.captionsBtn = this.container.querySelector('.captions-btn');
            this.pipBtn = this.container.querySelector('.pip-btn');
            this.downloadBtn = this.container.querySelector('.download-btn');
            this.seekTooltip = this.container.querySelector('.seek-tooltip');
            this.tooltipTime = this.container.querySelector('.tooltip-time');
            this.thumbnailCanvas = this.container.querySelector('.thumbnail-canvas');
            this.thumbnailCtx = this.thumbnailCanvas.getContext('2d');
            this.videoControls = this.container.querySelector('.video-controls');

            // --- Settings & Booster Menu Elements ---
            this.settingsBtn = this.container.querySelector('.settings-btn');
            this.settingsMenu = this.container.querySelector('.settings-menu .menu-content');
            this.menuPanelsWrapper = this.container.querySelector('.menu-panels-wrapper');
            this.speedSlider = this.container.querySelector('.speed-slider');
            this.speedDisplay = this.container.querySelector('.speed-display');
            this.speedPanelDisplay = this.container.querySelector('.speed-panel-display');
            this.volumeBoosterBtn = this.container.querySelector('.volume-booster-btn');
            this.boosterStatus = this.container.querySelector('.booster-status');

            // --- REFACTORED: New Caption Menu Elements ---
            this.captionsMenuBtn = this.container.querySelector('.captions-menu-btn');
            this.captionsStatus = this.container.querySelector('.captions-status');
            this.captionsTrackList = this.container.querySelector('.captions-track-list');
            this.captionSettingInputs = this.container.querySelectorAll('.caption-setting-input');
        }

        initializePlayerState() {
            this.PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
            this.BOOSTER_LEVEL = 2; // e.g., 2 = 200% volume
            this.settings = {}; // Will be populated by loadSettings
            this.isScrubbing = false;
            this.isDraggingVolume = false;
            this.wasPaused = true;
            this.video.volume = 1;
            this.controlsTimeout = null;
            this.animationFrameId = null;

            // NEW: State for the refactored captions system
            this.activeTrackIndex = -1; // -1 is "Off"
            this.lastActiveTrackIndex = 0; // Remembers the last used track for easy toggling
            
            // Volume Booster State
            this.mediaSource = null;
            this.boosterGainNode = null;
            this.isBoosterActive = false;
            
            this.handleDocumentMouseUp = this.handleDocumentMouseUp.bind(this);
            this.handleDocumentMouseMove = this.handleDocumentMouseMove.bind(this);

            this.updatePlayPauseIcon();
            this.updateVolumeUI();
            this.setSpeed(1);
            this.captionsBtn.style.display = 'none';
            this.captionsMenuBtn.style.display = 'none';
            if (!document.pictureInPictureEnabled) { this.pipBtn.style.display = 'none'; }
            if (!window.AudioContext && !window.webkitAudioContext) {
                 this.volumeBoosterBtn.style.display = 'none';
                 this.container.querySelector('.volume-booster-toggle').style.display = 'none';
            }

            if (this.video.currentSrc) this.setupVideoSource(this.video.currentSrc);
        }
        
        setupVideoSource(src) {
            this.thumbnailVideo.src = src;
            this.downloadBtn.href = src;
            try {
                const path = new URL(src).pathname;
                this.downloadBtn.download = path.substring(path.lastIndexOf('/') + 1) || 'video.mp4';
            } catch (e) { this.downloadBtn.download = 'video.mp4'; }
            this.downloadBtn.classList.remove('disabled');
        }

        attachEventListeners() {
            this.video.addEventListener('loadedmetadata', this.handleLoadedMetadata.bind(this));
            // REFACTORED: Listen for track changes to update the new captions menu
            this.video.textTracks.addEventListener('addtrack', this.handleTrackChange.bind(this));
            this.video.textTracks.addEventListener('removetrack', this.handleTrackChange.bind(this));
            this.video.addEventListener('play', this.handlePlay.bind(this));
            this.video.addEventListener('pause', this.handlePause.bind(this));
            this.video.addEventListener('ended', () => this.stopProgressLoop());
            this.video.addEventListener('timeupdate', () => { if (!this.isScrubbing) this.updateTimeDisplay();
            if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
                this.container.style.setProperty('aspect-ratio', this.video.videoWidth / this.video.videoHeight);
            }});
            this.video.addEventListener('volumechange', this.updateVolumeUI.bind(this));
            this.video.addEventListener('enterpictureinpicture', () => this.pipBtn.classList.add('active'));
            this.video.addEventListener('leavepictureinpicture', () => this.pipBtn.classList.remove('active'));
            this.thumbnailVideo.addEventListener('seeked', () => { this.thumbnailCtx.drawImage(this.thumbnailVideo, 0, 0, this.thumbnailCanvas.width, this.thumbnailCanvas.height); });
            
            new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                        if (this.video.currentSrc) this.setupVideoSource(this.video.currentSrc);
                    }
                });
            }).observe(this.video, { attributes: true });

            [this.playPauseBtn, this.bigPlayBtn, this.video].forEach(el => el.addEventListener('click', () => this.togglePlay()));
            this.muteBtn.addEventListener('click', this.toggleMute.bind(this));
            this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
            this.pipBtn.addEventListener('click', this.togglePip.bind(this));
            // REFACTORED: The main CC button now uses the new toggle logic
            this.captionsBtn.addEventListener('click', this.toggleCaptions.bind(this));
            this.settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMenu(this.settingsMenu, this.settingsBtn); });

            this.speedSlider.addEventListener('input', () => { const speedValue = this.PLAYBACK_SPEEDS[this.speedSlider.value]; this.setSpeed(speedValue); });
            this.volumeBoosterBtn.addEventListener('click', this.toggleVolumeBooster.bind(this));
            
            // REFACTORED: Unified menu event listener now handles caption track selection
            this.settingsMenu.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                const targetPanel = button.dataset.targetPanel;
                const trackIndex = button.dataset.trackIndex;

                if (targetPanel) {
                    this.navigateMenu(targetPanel);
                } else if (trackIndex !== undefined) {
                    this.setCaptionTrack(trackIndex);
                } else if (button.classList.contains('volume-booster-toggle')) {
                    this.toggleVolumeBooster();
                }
            });

            this.progressBarContainer.addEventListener('mousedown', this.handleScrubbingStart.bind(this));
            this.progressBarContainer.addEventListener('mousemove', this.updateSeekTooltip.bind(this));
            this.progressBarContainer.addEventListener('mouseleave', () => this.seekTooltip.style.display = 'none');
            this.volumeSlider.addEventListener('mousedown', this.handleVolumeDragStart.bind(this));

            document.addEventListener('mousemove', this.handleDocumentMouseMove);
            document.addEventListener('mouseup', this.handleDocumentMouseUp);
            document.addEventListener('fullscreenchange', this.updateFullscreenUI.bind(this));
            document.addEventListener('click', this.handleDocumentClick.bind(this));

            this.container.addEventListener('keydown', this.handleKeydown.bind(this));
            this.container.addEventListener('mousemove', this.showControls.bind(this));
            this.container.addEventListener('mouseleave', this.hideControlsOnLeave.bind(this));
            
            this.captionSettingInputs.forEach(input => {
                input.addEventListener('input', this.handleCaptionInputChange.bind(this));
            });
        }
        
        // --- Core Player & UI Methods ---
        togglePlay() { this.video.paused ? this.video.play() : this.video.pause(); }
        toggleMute() { this.video.muted = !this.video.muted; }
        toggleFullscreen() { if (!document.fullscreenElement) { this.container.requestFullscreen().catch(err => console.error(`Fullscreen Error: ${err.message}`)); } else { document.exitFullscreen(); } }
        togglePip() { if (document.pictureInPictureElement) { document.exitPictureInPicture(); } else if (document.pictureInPictureEnabled) { this.video.requestPictureInPicture(); } }

        setSpeed(speed) {
            const newSpeed = parseFloat(speed);
            if (!this.PLAYBACK_SPEEDS.includes(newSpeed)) return;
            this.video.playbackRate = newSpeed;
            const speedIndex = this.PLAYBACK_SPEEDS.indexOf(newSpeed);
            if (speedIndex > -1) this.speedSlider.value = speedIndex;
            const speedText = newSpeed % 1 === 0 ? newSpeed.toFixed(1) : newSpeed.toString();
            const displayText = `${speedText}×`;
            this.speedDisplay.textContent = displayText;
            if(this.speedPanelDisplay) this.speedPanelDisplay.textContent = displayText;
        }

        updatePlayPauseIcon() { const isPaused = this.video.paused; this.container.classList.toggle('playing', !isPaused); this.container.classList.toggle('paused', isPaused); this.playPauseBtn.setAttribute('aria-label', isPaused ? 'Play' : 'Pause'); }
        updateVolumeUI() { this.container.classList.remove('volume-high', 'volume-medium', 'volume-low', 'muted'); const level = this.video.muted ? 0 : this.video.volume; if (level === 0) { this.container.classList.add('muted'); } else if (level > 0.66) { this.container.classList.add('volume-high'); } else if (level > 0.33) { this.container.classList.add('volume-medium'); } else { this.container.classList.add('volume-low'); } this.volumeFilled.style.width = `${level * 100}%`; this.volumeThumb.style.left = `${level * 100}%`; }
        updateFullscreenUI() { const isFullscreen = !!document.fullscreenElement; this.container.classList.toggle('fullscreen', isFullscreen); this.fullscreenBtn.setAttribute('aria-label', isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'); }
        updateTimeDisplay() { this.currentTimeEl.textContent = this._formatDisplayTime(this.video.currentTime); this.totalTimeEl.textContent = this._formatDisplayTime(this.video.duration); }
        updateProgressBar() { if (isNaN(this.video.duration)) return; this.progressBarFilled.style.width = `${(this.video.currentTime / this.video.duration) * 100}%`; }
        
        handleLoadedMetadata() {
            this.updateTimeDisplay();
            if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
                this.container.style.setProperty('aspect-ratio', this.video.videoWidth / this.video.videoHeight);
            }
            this.updateProgressBar();
            if (this.video.src && !this.thumbnailVideo.src) this.setupVideoSource(this.video.src);
            this.handleTrackChange(); // Populate captions menu on load
        }

        handlePlay() { this.updatePlayPauseIcon(); this.startProgressLoop(); this.hideControls(); }
        handlePause() { this.updatePlayPauseIcon(); this.stopProgressLoop(); this.showControls(); }
        handleScrubbing(e) { const rect = this.progressBarContainer.getBoundingClientRect(); const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width; if (isNaN(this.video.duration)) return; const seekTime = percent * this.video.duration; this.progressBarFilled.style.width = `${percent * 100}%`; this.currentTimeEl.textContent = this._formatDisplayTime(seekTime); }
        updateSeekTooltip(e) { const rect = this.progressBarContainer.getBoundingClientRect(); const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width; if (isNaN(this.video.duration) || !this.thumbnailVideo.src) return; const seekTime = percent * this.video.duration; this.thumbnailVideo.currentTime = seekTime; this.seekTooltip.style.display = 'block'; this.tooltipTime.textContent = this._formatDisplayTime(seekTime); const tooltipWidth = this.seekTooltip.offsetWidth; const containerWidth = this.progressBarContainer.offsetWidth; let tooltipX = e.x - rect.x; tooltipX = Math.max(tooltipWidth / 2, Math.min(containerWidth - tooltipWidth / 2, tooltipX)); this.seekTooltip.style.left = `${tooltipX}px`; }
        handleScrubbingStart(e) { this.isScrubbing = true; this.wasPaused = this.video.paused; this.stopProgressLoop(); if (!this.wasPaused) this.video.pause(); this.handleScrubbing(e); }
        handleVolumeDrag(e) { const rect = this.volumeSlider.getBoundingClientRect(); const level = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1); this.video.volume = level; this.video.muted = level === 0; }
        handleVolumeDragStart(e) { this.isDraggingVolume = true; this.handleVolumeDrag(e); }
        handleDocumentMouseMove(e) { if (this.isScrubbing) this.handleScrubbing(e); if (this.isDraggingVolume) this.handleVolumeDrag(e); }
        handleDocumentMouseUp(e) { if (this.isScrubbing) { this.isScrubbing = false; const rect = this.progressBarContainer.getBoundingClientRect(); const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width; this.video.currentTime = percent * this.video.duration; if (!this.wasPaused) this.video.play(); this.seekTooltip.style.display = 'none'; } if (this.isDraggingVolume) this.isDraggingVolume = false; }
        handleDocumentClick(e) { if (!e.target.closest('.settings-menu')) this.closeAllMenus(); }
        
        handleKeydown(e) {
            const tagName = document.activeElement.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;
            const key = e.key.toLowerCase();
            if (e.ctrlKey && key === 'z') {
                e.preventDefault();
                this.toggleVolumeBooster();
                return;
            }
            // NEW: Added 'j' and 'l' keys for 10-second seeking.
            const actions = {
                " ": this.togglePlay.bind(this),
                "k": this.togglePlay.bind(this),
                "m": this.toggleMute.bind(this),
                "f": this.toggleFullscreen.bind(this),
                "p": this.togglePip.bind(this),
                "arrowleft": () => { this.video.currentTime -= 5; },
                "arrowright": () => { this.video.currentTime += 5; },
                "j": () => { this.video.currentTime -= 10; },
                "l": () => { this.video.currentTime += 10; },
            };
            if (actions[key]) {
                e.preventDefault();
                actions[key]();
            }
        }
        
        startProgressLoop() { this.stopProgressLoop(); const loop = () => { this.updateProgressBar(); this.animationFrameId = requestAnimationFrame(loop); }; this.animationFrameId = requestAnimationFrame(loop); }
        stopProgressLoop() { cancelAnimationFrame(this.animationFrameId); }
        
        showControls(force = false) { clearTimeout(this.controlsTimeout); this.container.classList.remove('no-cursor'); this.videoControls.classList.add('visible'); this.container.classList.add('controls-visible'); if (!force) { this.hideControls(); } }
        hideControls() { if (this.isScrubbing || this.settingsMenu.classList.contains('visible')) { this.showControls(true); return; } this.controlsTimeout = setTimeout(() => { this.videoControls.classList.remove('visible'); this.container.classList.remove('controls-visible'); this.container.classList.add('no-cursor'); }, 2600); }
        hideControlsOnLeave() { if (this.isScrubbing || this.settingsMenu.classList.contains('visible')) return; this.videoControls.classList.remove('visible'); this.container.classList.remove('controls-visible'); }

        // --- REFACTORED: New Caption System Methods ---

        handleTrackChange() {
            this.updateCaptionButtonVisibility();
            this.populateCaptionsMenu();
        }

        updateCaptionButtonVisibility() {
            const hasTracks = this.video.textTracks && this.video.textTracks.length > 0;
            const displayStyle = hasTracks ? 'flex' : 'none';
            this.captionsBtn.style.display = displayStyle;
            this.captionsMenuBtn.style.display = displayStyle;
        }

        populateCaptionsMenu() {
            this.captionsTrackList.innerHTML = '';
            const offButton = document.createElement('button');
            offButton.className = 'menu-item';
            offButton.dataset.trackIndex = -1;
            offButton.innerHTML = `<span class="check-mark"></span> Off`;
            this.captionsTrackList.appendChild(offButton);

            Array.from(this.video.textTracks).forEach((track, index) => {
                const trackButton = document.createElement('button');
                trackButton.className = 'menu-item';
                trackButton.dataset.trackIndex = index;
                const label = track.label || `Track ${index + 1}`;
                trackButton.innerHTML = `<span class="check-mark"></span> ${label}`;
                this.captionsTrackList.appendChild(trackButton);
                track.mode = 'hidden'; // Ensure all tracks start hidden
            });
            this.updateActiveCaptionIndicator();
        }

        toggleCaptions() {
            if (this.video.textTracks.length === 0) return;
            const isCurrentlyActive = this.activeTrackIndex > -1;
            this.setCaptionTrack(isCurrentlyActive ? -1 : this.lastActiveTrackIndex);
        }

        setCaptionTrack(index) {
            const newIndex = parseInt(index, 10);
            if (this.activeTrackIndex === newIndex) return;

            Array.from(this.video.textTracks).forEach(t => t.mode = 'hidden');
            if (newIndex > -1 && this.video.textTracks[newIndex]) {
                this.video.textTracks[newIndex].mode = 'showing';
                this.lastActiveTrackIndex = newIndex;
            }
            this.activeTrackIndex = newIndex;
            this.updateActiveCaptionIndicator();
        }

        updateActiveCaptionIndicator() {
            const isActive = this.activeTrackIndex > -1;
            this.captionsBtn.classList.toggle('active', isActive);
            this.container.classList.toggle('captions-on', isActive);

            if (isActive) {
                const track = this.video.textTracks[this.activeTrackIndex];
                this.captionsStatus.textContent = (track ? track.label : `Track ${this.activeTrackIndex + 1}`) + ' >';
            } else {
                this.captionsStatus.textContent = 'Off >';
            }

            this.captionsTrackList.querySelectorAll('.menu-item').forEach(button => {
                const buttonIndex = parseInt(button.dataset.trackIndex, 10);
                const isButtonActive = buttonIndex === this.activeTrackIndex;
                button.classList.toggle('active', isButtonActive);
                button.querySelector('.check-mark').textContent = isButtonActive ? '✓' : '';
            });
        }


        // --- Volume Booster Methods ---
        async initializeAudioBooster() {
            if (this.mediaSource) return true;
            try {
                if (!window.AudioContext && !window.webkitAudioContext) throw new Error("Web Audio API not supported.");
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!CustomVideoPlayer.audioContext) CustomVideoPlayer.audioContext = new AudioContext();
                if (CustomVideoPlayer.audioContext.state === 'suspended') await CustomVideoPlayer.audioContext.resume();
                this.mediaSource = CustomVideoPlayer.audioContext.createMediaElementSource(this.video);
                this.boosterGainNode = CustomVideoPlayer.audioContext.createGain();
                this.boosterGainNode.gain.value = 1;
                this.mediaSource.connect(this.boosterGainNode);
                this.boosterGainNode.connect(CustomVideoPlayer.audioContext.destination);
                return true;
            } catch (e) {
                console.error("Failed to initialize volume booster:", e.message);
                this.volumeBoosterBtn.style.display = 'none';
                this.container.querySelector('.volume-booster-toggle').style.display = 'none';
                return false;
            }
        }
        
        async toggleVolumeBooster() {
            const isInitialized = await this.initializeAudioBooster();
            if (!isInitialized) return;
            this.isBoosterActive = !this.isBoosterActive;
            this.boosterGainNode.gain.value = this.isBoosterActive ? this.BOOSTER_LEVEL : 1;
            this.volumeBoosterBtn.classList.toggle('active', this.isBoosterActive);
            this.boosterStatus.textContent = this.isBoosterActive ? 'On' : 'Off';
        }

        // --- MENU AND SETTINGS METHODS ---
        toggleMenu(menu, button) { const isVisible = menu.classList.toggle('visible'); button.classList.toggle('menu-open', isVisible); if (isVisible) { this.showControls(true); } else { this.navigateMenu('main'); this.hideControls(); } }
        closeAllMenus() { this.settingsMenu.classList.remove('visible'); this.settingsBtn.classList.remove('menu-open'); this.navigateMenu('main'); }
        // REFACTORED: Panel map updated for the new captions menu structure
        navigateMenu(panelName) { const panelIndex = { 'main': 0, 'speed': 1, 'captions-track': 2, 'captions-style': 3 }; const index = panelIndex[panelName] || 0; this.menuPanelsWrapper.style.transform = `translateX(-${index * 100}%)`; }
        
        handleCaptionInputChange(e) {
            const input = e.currentTarget;
            const setting = input.dataset.setting;
            let value;
            if (input.id === 'caption-bg-color') {
                const opacitySlider = this.container.querySelector('#caption-bg-opacity');
                const opacity = parseInt(opacitySlider.value, 10) / 100;
                value = this.hexToRgba(input.value, opacity);
            } else if (input.id === 'caption-bg-opacity') {
                const colorInput = this.container.querySelector('#caption-bg-color');
                const opacity = parseInt(input.value, 10) / 100;
                value = this.hexToRgba(colorInput.value, opacity);
            } else {
                value = input.value;
                if (input.dataset.unit) value += input.dataset.unit;
            }
            this.settings[setting] = value;
            this.applySettings();
            this.saveSettings();
        }

        hexToRgba(hex, opacity) { const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16)); return `rgba(${r}, ${g}, ${b}, ${opacity})`; }
        applySettings() { for (const key in this.settings) { this.container.style.setProperty(`--${key}`, this.settings[key]); } }

        loadSettings() {
            try {
                const savedSettings = JSON.parse(localStorage.getItem('goku-plr-settings'));
                const defaultSettings = { 'primary-color': '#00a8ff', 'caption-font-family': 'Arial, sans-serif', 'caption-font-size': '22px', 'caption-font-color': '#ffffff', 'caption-bg-color': 'rgba(0, 0, 0, 0.75)' };
                this.settings = { ...defaultSettings, ...(savedSettings || {}) };
                this.applySettings();
                this.updateSettingsUI();
            } catch (e) { console.error("Could not load player settings.", e); }
        }

        updateSettingsUI() {
            this.captionSettingInputs.forEach(input => {
                const setting = input.dataset.setting;
                let value = this.settings[setting];
                if (!value) return;
                if (input.dataset.isOpacity) {
                    const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                    if (rgbaMatch) input.value = Math.round(parseFloat(rgbaMatch[4]) * 100);
                } else if (input.type === 'color' && value.startsWith('rgba')) {
                    const [r, g, b] = value.match(/\d+/g);
                    input.value = `#${(+r).toString(16).padStart(2, '0')}${(+g).toString(16).padStart(2, '0')}${(+b).toString(16).padStart(2, '0')}`;
                } else {
                    input.value = value.replace('px', '');
                }
            });
        }

        saveSettings() { try { localStorage.setItem('goku-plr-settings', JSON.stringify(this.settings)); } catch (e) { console.error("Could not save player settings.", e); } }
        _formatDisplayTime(timeInSeconds) { if (isNaN(timeInSeconds)) return '00:00'; const date = new Date(timeInSeconds * 1000); const timeString = date.toISOString().slice(11, 19); return (this.video.duration || 0) >= 3600 ? timeString : timeString.slice(3); }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const videosToCustomize = document.querySelectorAll('video.cvp');
        videosToCustomize.forEach(videoEl => {
            if (!videoEl.dataset.customPlayerInitialized) {
                new CustomVideoPlayer(videoEl);
                videoEl.dataset.customPlayerInitialized = 'true';
            }
        });
    });

})();
