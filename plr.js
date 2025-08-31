/**
 * GokuPlr v1.8.6
 * A script to transform standard HTML5 video elements into a custom-styled player.
 * To use, include this script and add the class "cvp" to your <video> tags.
 *
 * Changelog v1.8.5:
 * - FIX: Corrected a bug in the settings loader that prevented caption background opacity from being restored correctly.
 * - REFINED: Updated the settings button SVG icon for a cleaner look.
 *
 * Changelog v1.8.4:
 * - REFACTOR: Complete rewrite for enhanced readability, maintainability, and performance.
 * - MODERNIZED: Adopted modern JavaScript (ES6+ classes, private fields) and CSS (Flexbox/Grid layouts).
 * - REWORKED: Settings menu UI has been completely redesigned for a cleaner look and more intuitive navigation.
 * - REFINED: Video control visibility logic is now more robust and aligns with standard player behavior,
 *   correctly handling mouse, keyboard (space, 'k'), and click interactions for play/pause.
 * - ENHANCED: Event listeners for scrubbing and volume control are now managed more efficiently,
 *   only active during drag operations.
 * - IMPROVED: Keyboard navigation and accessibility have been enhanced with better focus management.
 */

(function() {
    // This wrapper prevents our code from interfering with other scripts on the page.

    // Check if the script has already been run to avoid re-initializing.
    if (window.customPlayerInitialized) {
        return;
    }
    window.customPlayerInitialized = true;

    const PLAYER_SETTINGS_KEY = 'gplr-settings';
    const PLAYER_SPEED_KEY = 'gplr-speed';

    class CustomVideoPlayer {
        // Share a single AudioContext across all player instances for efficiency.
        static #audioContext = null;

        // Private fields for internal state and DOM elements
        #video;
        #container;
        #controlsTimeout = null;
        #animationFrameId = null;
        #isScrubbing = false;
        #isDraggingVolume = false;
        #wasPausedBeforeScrub = true;
        #activeTrackIndex = -1;
        #lastActiveTrackIndex = 0;

        // Volume Booster State
        #mediaSource = null;
        #boosterGainNode = null;
        #isBoosterActive = false;
        
        // Configuration
        #PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
        #BOOSTER_LEVEL = 2; // 200% volume

        // DOM elements
        #thumbnailVideo; #thumbnailCanvas; #thumbnailCtx; #playPauseBtn; #bigPlayBtn;
        #muteBtn; #volumeSlider; #volumeFilled; #volumeThumb; #progressBarContainer;
        #progressBarFilled; #currentTimeEl; #totalTimeEl; #fullscreenBtn;
        #captionsBtn; #pipBtn; #downloadBtn; #seekTooltip; #tooltipTime;
        #videoControls; #settingsBtn; #settingsMenu; #menuPanelsWrapper;
        #speedSlider; #speedDisplay; #speedPanelDisplay; #volumeBoosterBtn; #boosterStatus;
        #captionsMenuBtn; #captionsStatus; #captionsTrackList; #captionSettingInputs;

        // Bound event handlers for dynamic attachment/detachment
        #boundHandleScrubbing;
        #boundHandleScrubbingEnd;
        #boundHandleVolumeDrag;
        #boundHandleVolumeDragEnd;

        constructor(videoElement) {
            if (!videoElement || videoElement.dataset.customPlayerInitialized) {
                return;
            }
            this.#video = videoElement;
            this.#video.dataset.customPlayerInitialized = 'true';
            this.#video.controls = false;

            this.#injectStyles();
            this.#buildPlayerHtml();
            this.#selectDOMElements();
            this.#bindEventHandlers();
            this.#initializePlayerState();
            this.#attachEventListeners();
        }

        #injectStyles() {
            const styleId = 'custom-video-player-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                :root { --primary-color: #00a8ff; --text-color: #ffffff; --controls-bg: rgba(20, 20, 20, 0.85); --menu-bg: rgba(30, 30, 30, 0.95); --progress-bar-bg: rgba(255, 255, 255, 0.3); --tooltip-bg: rgba(0, 0, 0, 0.85); --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; --border-radius: 8px; --transition-speed: 0.2s; }
                .video-player-container { --caption-font-size: 22px; --caption-font-color: #ffffff; --caption-bg-color: rgba(0, 0, 0, 0.75); --caption-font-family: 'Arial', sans-serif; }
                .video-player-container, .video-player-container * { box-sizing: border-box; }
                .video-player-container:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
                .time-display, .tooltip-time { user-select: none; }
                .video-player-container { position: relative; width: 100%; background-color: #000; border-radius: var(--border-radius); overflow: hidden; font-family: var(--font-family); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; aspect-ratio: 16 / 9; }
                .video-player-container.no-cursor { cursor: none; }
                .video-player-container.fullscreen { width: 100%; height: 100%; border-radius: 0; aspect-ratio: auto; }
                .video-player-container video { width: 100%; height: 100%; display: block; }
                .video-player-container video::cue { background-color: var(--caption-bg-color); color: var(--caption-font-color); font-size: var(--caption-font-size); font-family: var(--caption-font-family); transition: bottom var(--transition-speed) ease-in-out; bottom: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
                .video-player-container.controls-visible.captions-on video::cue { bottom: 85px; }
                .video-controls { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px; display: flex; flex-direction: column; background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); opacity: 0; visibility: hidden; transition: opacity var(--transition-speed), visibility var(--transition-speed); z-index: 2; }
                .video-player-container .video-controls.visible { opacity: 1; visibility: visible; }
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
                .fullscreen-btn .enter-fs-icon, .video-player-container.fullscreen .fullscreen-btn .exit-fs-icon { display: block; }
                .fullscreen-btn .exit-fs-icon, .video-player-container.fullscreen .fullscreen-btn .enter-fs-icon { display: none; }
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

                /* --- REWORKED: Settings Menu --- */
                .settings-menu { position: relative; }
                .settings-menu .menu-content { position: absolute; bottom: 100%; right: 0; margin-bottom: 10px; background: var(--menu-bg); border-radius: var(--border-radius); opacity: 0; visibility: hidden; transform: translateY(10px); transition: opacity 0.2s, transform 0.2s, visibility 0.2s; width: 280px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); overflow: hidden; }
                .settings-menu .menu-content.visible { opacity: 1; visibility: visible; transform: translateY(0); }
                .menu-panels-wrapper { display: flex; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
                .menu-panel { width: 100%; flex-shrink: 0; display: flex; flex-direction: column; }
                .menu-header { display: flex; align-items: center; padding: 8px 4px 8px 8px; font-size: 15px; font-weight: 500; color: #eee; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
                .menu-header span { flex-grow: 1; text-align: center; margin-right: 36px; /* Balance the back button */ }
                .menu-back-btn { background: none; border: none; color: #eee; cursor: pointer; padding: 6px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
                .menu-back-btn:hover { background: rgba(255, 255, 255, 0.1); }
                .menu-back-btn svg { width: 24px; height: 24px; fill: currentColor; }
                .menu-panel-content { padding: 8px; display: flex; flex-direction: column; gap: 4px; }
                .menu-item { background: none; border: none; border-radius: 4px; width: 100%; text-align: left; padding: 10px 12px; color: var(--text-color); font-size: 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .menu-item:hover { background: rgba(255, 255, 255, 0.1); }
                .menu-item-value { color: #aaa; font-size: 14px; }
                .menu-item-value svg { width: 16px; height: 16px; fill: #aaa; margin-left: 4px; }
                .menu-separator { height: 1px; background: rgba(255, 255, 255, 0.1); margin: 4px 8px; }
                .captions-track-list .menu-item.active { background-color: rgba(0, 168, 255, 0.15); }
                .captions-track-list .menu-item .check-mark { width: 20px; display: inline-block; text-align: left; font-weight: bold; color: var(--primary-color); opacity: 0; margin-right: 5px; }
                .captions-track-list .menu-item.active .check-mark { opacity: 1; }
                .captions-track-list .menu-item { justify-content: flex-start; }
                .speed-slider-container { padding: 12px 4px; display: flex; align-items: center; gap: 12px; }
                .speed-slider-container .speed-panel-display { color: #ccc; font-size: 14px; font-variant-numeric: tabular-nums; min-width: 45px; text-align: right; }
                .caption-settings-grid { display: grid; grid-template-columns: auto 1fr; gap: 12px 15px; align-items: center; padding: 8px 4px; font-size: 14px; color: #eee; }
                .caption-settings-grid label { white-space: nowrap; justify-self: end; }
                .caption-settings-grid input[type="color"] { width: 28px; height: 28px; border: 1px solid #555; border-radius: 4px; padding: 2px; background: none; cursor: pointer; justify-self: start; }
                .caption-settings-grid select { width: 100%; background: #333; color: white; border: 1px solid #555; border-radius: 4px; padding: 6px; font-size: 14px; }
                .caption-settings-grid .slider-container { display: flex; align-items: center; gap: 8px; width: 100%; }
                input[type=range].goku-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; background: var(--progress-bar-bg); border-radius: 5px; outline: none; cursor: pointer; }
                input[type=range].goku-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 15px; height: 15px; background: var(--text-color); border-radius: 50%; cursor: pointer; margin-top: -5px; transition: background var(--transition-speed); }
                input[type=range].goku-slider:hover::-webkit-slider-thumb, input[type=range].goku-slider:focus::-webkit-slider-thumb { background: var(--primary-color); }
                .control-button:focus-visible, .settings-menu button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; border-radius: 4px; }
                @media (max-width: 600px) { .volume-container:hover .volume-slider { width: 50px; } .time-display { font-size: 12px; } .control-button svg { width: 20px; height: 20px; } .controls-bottom, .controls-left, .controls-right { gap: 6px; } .video-player-container.controls-visible.captions-on video::cue { bottom: 70px; } }
            `;
            document.head.appendChild(style);
        }

        #buildPlayerHtml() {
            const container = document.createElement('div');
            container.className = 'video-player-container';
            container.tabIndex = 0;
            this.#container = container;
            this.#video.parentNode.insertBefore(container, this.#video);
            container.appendChild(this.#video);
        
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
                                <button class="control-button mute-btn" aria-label="Mute/Unmute"><svg class="volume-high-icon" viewBox="0 0 24 24"><path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.84 14 18.7V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"></path></svg><svg class="volume-medium-icon" viewBox="0 0 24 24"><path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12Z"></path></svg><svg class="volume-low-icon" viewBox="0 0 24 24"><path d="M3 9H7L12 4V20L7 15H3V9Z"></path></svg><svg class="muted-icon" viewBox="0 0 24 24"><path d="M16.5 12C16.5 10.23 15.54 8.71 14 7.97V10.18L16.45 12.63C16.5 12.43 16.5 12.21 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.62 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 17.84 14.83 18.08 14 18.22V20.29L20 20.28L4.27 3ZM12 4L10.12 5.88L12 7.76V4Z"></path></svg></button>
                                <div class="volume-slider"><div class="volume-filled"></div><div class="volume-thumb"></div></div>
                            </div>
                            <div class="time-display"><span class="current-time">00:00</span> / <span class="total-time">00:00</span></div>
                        </div>
                        <div class="controls-right">
                            <button class="control-button volume-booster-btn" aria-label="Toggle Volume Booster (Ctrl+Z)"><svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"></path></svg></button>
                            <div class="settings-menu">
                                <button class="control-button settings-btn" aria-label="Settings"><svg viewBox="0 0 24 24"><path d="M19.4 12.9C19.5 12.6 19.5 12.3 19.5 12S19.5 11.4 19.4 11.1L21 9.9C21.2 9.7 21.2 9.4 21.1 9.2L19.3 6.3C19.2 6.1 18.9 6 18.7 6.1L16.9 6.8C16.4 6.4 15.9 6.1 15.4 5.9L15.1 4C15.1 3.8 14.8 3.5 14.5 3.5H9.5C9.2 3.5 8.9 3.8 8.9 4L8.6 5.9C8.1 6.1 7.6 6.4 7.1 6.8L5.3 6.1C5.1 6 4.8 6.1 4.7 6.3L2.9 9.2C2.8 9.4 2.8 9.7 3 9.9L4.6 11.1C4.5 11.4 4.5 11.7 4.5 12S4.5 12.6 4.6 12.9L3 14.1C2.8 14.3 2.8 14.6 2.9 14.8L4.7 17.7C4.8 17.9 5.1 18 5.3 17.9L7.1 17.2C7.6 17.6 8.1 17.9 8.6 18.1L8.9 20C8.9 20.2 9.2 20.5 9.5 20.5H14.5C14.8 20.5 15.1 20.2 15.1 20L15.4 18.1C15.9 17.9 16.4 17.6 16.9 17.2L18.7 17.9C18.9 18 19.2 17.9 19.3 17.7L21.1 14.8C21.2 14.6 21.2 14.3 21 14.1L19.4 12.9ZM12 15.5C10.1 15.5 8.5 13.9 8.5 12C8.5 10.1 10.1 8.5 12 8.5C13.9 8.5 15.5 10.1 15.5 12C15.5 13.9 13.9 15.5 12 15.5Z"></path></svg></button>
                                <div class="menu-content">
                                    <div class="menu-panels-wrapper">
                                        <div class="menu-panel main-panel">
                                            <div class="menu-panel-content">
                                                <button class="menu-item volume-booster-toggle"><span>Volume Booster</span><span class="menu-item-value booster-status">Off</span></button>
                                                <button class="menu-item" data-target-panel="speed"><span>Playback Speed</span><span class="menu-item-value speed-display">1.0×</span></button>
                                                <button class="menu-item captions-menu-btn" data-target-panel="captions-track"><span>Captions</span><span class="menu-item-value captions-status">Off <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span></button>
                                            </div>
                                        </div>
                                        <div class="menu-panel speed-panel">
                                            <div class="menu-header"><button class="menu-back-btn" data-target-panel="main"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button><span>Playback Speed</span></div>
                                            <div class="menu-panel-content">
                                                <div class="speed-slider-container"><input type="range" class="goku-slider speed-slider" min="0" max="5" value="2" step="1"><span class="speed-panel-display">1.0×</span></div>
                                            </div>
                                        </div>
                                        <div class="menu-panel captions-track-panel">
                                            <div class="menu-header"><button class="menu-back-btn" data-target-panel="main"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button><span>Captions</span></div>
                                            <div class="menu-panel-content">
                                                <div class="captions-track-list"></div><div class="menu-separator"></div>
                                                <button class="menu-item" data-target-panel="captions-style"><span>Options</span><span class="menu-item-value"><svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span></button>
                                            </div>
                                        </div>
                                        <div class="menu-panel captions-style-panel">
                                            <div class="menu-header"><button class="menu-back-btn" data-target-panel="captions-track"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button><span>Caption Options</span></div>
                                            <div class="menu-panel-content">
                                                <div class="caption-settings-grid">
                                                    <label for="accent-color">Accent</label><input type="color" id="accent-color" class="caption-setting-input" data-setting="primary-color">
                                                    <label for="caption-font">Font</label><select id="caption-font" class="caption-setting-input" data-setting="caption-font-family"><option>Arial</option><option>Verdana</option><option>Helvetica</option><option>Times New Roman</option><option>Courier New</option><option>Georgia</option></select>
                                                    <label for="caption-font-size">Font Size</label><div class="slider-container"><input type="range" id="caption-font-size" class="goku-slider caption-setting-input" min="14" max="36" step="1" data-setting="caption-font-size" data-unit="px"></div>
                                                    <label for="caption-font-color">Font Color</label><input type="color" id="caption-font-color" class="caption-setting-input" data-setting="caption-font-color">
                                                    <label for="caption-bg-color">BG Color</label><input type="color" id="caption-bg-color" class="caption-setting-input" data-setting="caption-bg-color" data-opacity-input="caption-bg-opacity">
                                                    <label for="caption-bg-opacity">BG Opacity</label><div class="slider-container"><input type="range" id="caption-bg-opacity" class="goku-slider caption-setting-input" min="0" max="100" step="5" data-setting="caption-bg-color" data-is-opacity="true"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="control-button captions-btn" aria-label="Toggle Captions"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"></path></svg></button>
                            <button class="control-button pip-btn" aria-label="Picture-in-Picture"><svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path></svg></button>
                            <button class="control-button fullscreen-btn" aria-label="Enter Fullscreen"><svg class="enter-fs-icon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg><svg class="exit-fs-icon" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg></button>
                            <button class="control-button download-btn disabled" aria-label="Download Video"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg></button>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', controlsHtml);
        }

        #selectDOMElements() {
            const D = (selector) => this.#container.querySelector(selector);
            const DAll = (selector) => this.#container.querySelectorAll(selector);
        
            this.#thumbnailVideo = D('.thumbnail-video');
            this.#playPauseBtn = D('.play-pause-btn');
            this.#bigPlayBtn = D('.big-play-button');
            this.#muteBtn = D('.mute-btn');
            this.#volumeSlider = D('.volume-slider');
            this.#volumeFilled = D('.volume-filled');
            this.#volumeThumb = D('.volume-thumb');
            this.#progressBarContainer = D('.progress-bar-container');
            this.#progressBarFilled = D('.progress-bar-filled');
            this.#currentTimeEl = D('.current-time');
            this.#totalTimeEl = D('.total-time');
            this.#fullscreenBtn = D('.fullscreen-btn');
            this.#captionsBtn = D('.captions-btn');
            this.#pipBtn = D('.pip-btn');
            this.#downloadBtn = D('.download-btn');
            this.#seekTooltip = D('.seek-tooltip');
            this.#tooltipTime = D('.tooltip-time');
            this.#thumbnailCanvas = D('.thumbnail-canvas');
            this.#thumbnailCtx = this.#thumbnailCanvas.getContext('2d');
            this.#videoControls = D('.video-controls');
            this.#settingsBtn = D('.settings-btn');
            this.#settingsMenu = D('.settings-menu .menu-content');
            this.#menuPanelsWrapper = D('.menu-panels-wrapper');
            this.#speedSlider = D('.speed-slider');
            this.#speedDisplay = D('.speed-display');
            this.#speedPanelDisplay = D('.speed-panel-display');
            this.#volumeBoosterBtn = D('.volume-booster-btn');
            this.#boosterStatus = D('.booster-status');
            this.#captionsMenuBtn = D('.captions-menu-btn');
            this.#captionsStatus = D('.captions-status');
            this.#captionsTrackList = D('.captions-track-list');
            this.#captionSettingInputs = DAll('.caption-setting-input');
        }

        #bindEventHandlers() {
            this.#boundHandleScrubbing = this.#handleScrubbing.bind(this);
            this.#boundHandleScrubbingEnd = this.#handleScrubbingEnd.bind(this);
            this.#boundHandleVolumeDrag = this.#handleVolumeDrag.bind(this);
            this.#boundHandleVolumeDragEnd = this.#handleVolumeDragEnd.bind(this);
        }

        #initializePlayerState() {
            this.#loadSettings();
            this.#updatePlayPauseIcon();
            this.#updateVolumeUI();
            
            const savedSpeed = parseFloat(localStorage.getItem(PLAYER_SPEED_KEY));
            this.#setSpeed(this.#PLAYBACK_SPEEDS.includes(savedSpeed) ? savedSpeed : 1, false); 
            
            this.#captionsBtn.style.display = 'none';
            this.#captionsMenuBtn.style.display = 'none';
            if (!document.pictureInPictureEnabled) this.#pipBtn.style.display = 'none';
            if (!window.AudioContext && !window.webkitAudioContext) {
                 this.#volumeBoosterBtn.style.display = 'none';
                 this.#container.querySelector('.volume-booster-toggle').style.display = 'none';
            }

            if (this.#video.currentSrc) this.#setupVideoSource(this.#video.currentSrc);
        }
        
        #setupVideoSource(src) {
            this.#thumbnailVideo.src = src;
            this.#downloadBtn.classList.remove('disabled');
        }

        #attachEventListeners() {
            // Video Element Events
            this.#video.addEventListener('loadedmetadata', this.#handleLoadedMetadata.bind(this));
            this.#video.textTracks.addEventListener('addtrack', this.#handleTrackChange.bind(this));
            this.#video.textTracks.addEventListener('removetrack', this.#handleTrackChange.bind(this));
            this.#video.addEventListener('play', this.#handlePlay.bind(this));
            this.#video.addEventListener('pause', this.#handlePause.bind(this));
            this.#video.addEventListener('ended', () => this.#stopProgressLoop());
            this.#video.addEventListener('timeupdate', () => { if (!this.#isScrubbing) this.#updateTimeDisplay() });
            this.#video.addEventListener('volumechange', this.#updateVolumeUI.bind(this));
            this.#video.addEventListener('enterpictureinpicture', () => this.#pipBtn.classList.add('active'));
            this.#video.addEventListener('leavepictureinpicture', () => this.#pipBtn.classList.remove('active'));
            
            // Player Controls
            [this.#playPauseBtn, this.#bigPlayBtn, this.#video].forEach(el => el?.addEventListener('click', () => this.#togglePlay()));
            this.#muteBtn.addEventListener('click', this.#toggleMute.bind(this));
            this.#fullscreenBtn.addEventListener('click', this.#toggleFullscreen.bind(this));
            this.#pipBtn.addEventListener('click', this.#togglePip.bind(this));
            this.#captionsBtn.addEventListener('click', this.#toggleCaptions.bind(this));
            this.#settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); this.#toggleMenu(this.#settingsMenu, this.#settingsBtn); });
            this.#downloadBtn.addEventListener('click', this.#handleDownloadVideo.bind(this));
            this.#volumeBoosterBtn.addEventListener('click', this.#toggleVolumeBooster.bind(this));
            this.#speedSlider.addEventListener('input', () => { this.#setSpeed(this.#PLAYBACK_SPEEDS[this.#speedSlider.value]); });
            
            // Settings Menu
            this.#settingsMenu.addEventListener('click', this.#handleMenuClick.bind(this));

            // Scrubbing and Volume
            this.#progressBarContainer.addEventListener('mousedown', this.#handleScrubbingStart.bind(this));
            this.#progressBarContainer.addEventListener('mousemove', this.#updateSeekTooltip.bind(this));
            this.#progressBarContainer.addEventListener('mouseleave', () => this.#seekTooltip.style.display = 'none');
            this.#volumeSlider.addEventListener('mousedown', this.#handleVolumeDragStart.bind(this));

            // Global / Container Events
            document.addEventListener('fullscreenchange', this.#updateFullscreenUI.bind(this));
            document.addEventListener('click', this.#handleDocumentClick.bind(this));
            this.#container.addEventListener('keydown', this.#handleKeydown.bind(this));
            this.#container.addEventListener('mousemove', this.#showControls.bind(this));
            this.#container.addEventListener('mouseleave', () => this.#hideControls());
            
            // Caption Settings
            this.#captionSettingInputs.forEach(input => input.addEventListener('input', this.#handleCaptionInputChange.bind(this)));

            // Thumbnail generation
            this.#thumbnailVideo.addEventListener('seeked', () => { this.#thumbnailCtx.drawImage(this.#thumbnailVideo, 0, 0, this.#thumbnailCanvas.width, this.#thumbnailCanvas.height); });
        }
        
        // --- Core Player & UI Methods ---
        #togglePlay() { this.#video.paused ? this.#video.play() : this.#video.pause(); }
        #toggleMute() { this.#video.muted = !this.#video.muted; }
        #toggleFullscreen() { document.fullscreenElement ? document.exitFullscreen() : this.#container.requestFullscreen().catch(err => console.error(`Fullscreen Error: ${err.message}`)); }
        #togglePip() { document.pictureInPictureElement ? document.exitPictureInPicture() : document.pictureInPictureEnabled && this.#video.requestPictureInPicture(); }

        #setSpeed(speed, save = true) {
            const newSpeed = parseFloat(speed);
            if (isNaN(newSpeed) || !this.#PLAYBACK_SPEEDS.includes(newSpeed)) return;
            this.#video.playbackRate = newSpeed;
            if (save) {
                try { localStorage.setItem(PLAYER_SPEED_KEY, newSpeed); } 
                catch (e) { console.error("Could not save player speed.", e); }
            }
            const speedIndex = this.#PLAYBACK_SPEEDS.indexOf(newSpeed);
            if (speedIndex > -1) this.#speedSlider.value = speedIndex;
            const speedText = `${(newSpeed % 1 === 0) ? newSpeed.toFixed(1) : newSpeed.toString()}×`;
            this.#speedDisplay.textContent = speedText;
            if(this.#speedPanelDisplay) this.#speedPanelDisplay.textContent = speedText;
        }

        #updatePlayPauseIcon() { 
            const isPaused = this.#video.paused; 
            this.#container.classList.toggle('playing', !isPaused);
            this.#playPauseBtn.setAttribute('aria-label', isPaused ? 'Play' : 'Pause');
        }
        #updateVolumeUI() {
            this.#container.classList.remove('volume-high', 'volume-medium', 'volume-low', 'muted');
            const level = this.#video.muted ? 0 : this.#video.volume;
            if (level === 0) { this.#container.classList.add('muted'); } 
            else if (level > 0.66) { this.#container.classList.add('volume-high'); } 
            else if (level > 0.33) { this.#container.classList.add('volume-medium'); }
            else { this.#container.classList.add('volume-low'); } 
            this.#volumeFilled.style.width = `${level * 100}%`;
            this.#volumeThumb.style.left = `${level * 100}%`;
        }
        #updateFullscreenUI() { 
            const isFullscreen = !!document.fullscreenElement;
            this.#container.classList.toggle('fullscreen', isFullscreen);
            this.#fullscreenBtn.setAttribute('aria-label', isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen');
        }
        #updateTimeDisplay() { 
            this.#currentTimeEl.textContent = this.#formatDisplayTime(this.#video.currentTime);
            this.#totalTimeEl.textContent = this.#formatDisplayTime(this.#video.duration);
        }
        #updateProgressBar() { 
            if (isNaN(this.#video.duration)) return;
            this.#progressBarFilled.style.width = `${(this.#video.currentTime / this.#video.duration) * 100}%`;
        }
        
        #handleLoadedMetadata() {
            this.#updateTimeDisplay();
            if (this.#video.videoWidth > 0 && this.#video.videoHeight > 0) {
                this.#container.style.setProperty('aspect-ratio', this.#video.videoWidth / this.#video.videoHeight);
            }
            this.#updateProgressBar();
            if (this.#video.src && !this.#thumbnailVideo.src) this.#setupVideoSource(this.#video.src);
            this.#handleTrackChange(); // Populate captions menu
        }

        #handlePlay() { this.#updatePlayPauseIcon(); this.#startProgressLoop(); this.#showControls(); }
        #handlePause() { this.#updatePlayPauseIcon(); this.#stopProgressLoop(); this.#showControls(); }

        #handleScrubbing(e) {
            const rect = this.#progressBarContainer.getBoundingClientRect();
            const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
            if (isNaN(this.#video.duration)) return;
            const seekTime = percent * this.#video.duration;
            this.#progressBarFilled.style.width = `${percent * 100}%`;
            this.#currentTimeEl.textContent = this.#formatDisplayTime(seekTime);
        }
        #updateSeekTooltip(e) {
            const rect = this.#progressBarContainer.getBoundingClientRect();
            const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
            if (isNaN(this.#video.duration) || !this.#thumbnailVideo.src) return;
            const seekTime = percent * this.#video.duration;
            this.#thumbnailVideo.currentTime = seekTime;
            this.#seekTooltip.style.display = 'block';
            this.#tooltipTime.textContent = this.#formatDisplayTime(seekTime);
            const tooltipWidth = this.#seekTooltip.offsetWidth;
            let tooltipX = e.x - rect.x;
            tooltipX = Math.max(tooltipWidth / 2, Math.min(rect.width - tooltipWidth / 2, tooltipX));
            this.#seekTooltip.style.left = `${tooltipX}px`;
        }
        #handleScrubbingStart(e) {
            e.preventDefault();
            this.#isScrubbing = true;
            this.#wasPausedBeforeScrub = this.#video.paused;
            this.#stopProgressLoop();
            if (!this.#wasPausedBeforeScrub) this.#video.pause();
            this.#handleScrubbing(e);
            document.addEventListener('mousemove', this.#boundHandleScrubbing);
            document.addEventListener('mouseup', this.#boundHandleScrubbingEnd, { once: true });
        }
        #handleScrubbingEnd(e) {
            this.#isScrubbing = false;
            document.removeEventListener('mousemove', this.#boundHandleScrubbing);
            const rect = this.#progressBarContainer.getBoundingClientRect();
            const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
            this.#video.currentTime = percent * this.#video.duration;
            if (!this.#wasPausedBeforeScrub) this.#video.play();
            this.#seekTooltip.style.display = 'none';
        }
        #handleVolumeDrag(e) {
            const rect = this.#volumeSlider.getBoundingClientRect();
            const level = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
            this.#video.volume = level;
            this.#video.muted = level === 0;
        }
        #handleVolumeDragStart(e) {
            e.preventDefault();
            this.#isDraggingVolume = true;
            this.#handleVolumeDrag(e);
            document.addEventListener('mousemove', this.#boundHandleVolumeDrag);
            document.addEventListener('mouseup', this.#boundHandleVolumeDragEnd, { once: true });
        }
        #handleVolumeDragEnd() {
            this.#isDraggingVolume = false;
            document.removeEventListener('mousemove', this.#boundHandleVolumeDrag);
        }
        #handleDocumentClick(e) { if (!e.target.closest('.settings-menu')) this.#closeAllMenus(); }
        
        #handleKeydown(e) {
            if (e.target.matches('input, textarea, select')) return;
            const key = e.key.toLowerCase();
            e.preventDefault();

            if (e.ctrlKey && key === 'z') { this.#toggleVolumeBooster(); return; }

            const actions = {
                " ": () => this.#togglePlay(),
                "k": () => this.#togglePlay(),
                "m": () => this.#toggleMute(),
                "f": () => this.#toggleFullscreen(),
                "p": () => this.#togglePip(),
                "c": () => this.#toggleCaptions(),
                "arrowleft": () => { this.#video.currentTime -= 5; },
                "arrowright": () => { this.#video.currentTime += 5; },
                "j": () => { this.#video.currentTime -= 10; },
                "l": () => { this.#video.currentTime += 10; },
            };
            actions[key]?.();
        }
        
        #startProgressLoop() { this.#stopProgressLoop(); const loop = () => { this.#updateProgressBar(); this.#animationFrameId = requestAnimationFrame(loop); }; this.#animationFrameId = requestAnimationFrame(loop); }
        #stopProgressLoop() { cancelAnimationFrame(this.#animationFrameId); }
        
        #showControls() {
            clearTimeout(this.#controlsTimeout);
            this.#container.classList.remove('no-cursor');
            this.#videoControls.classList.add('visible');
            this.#container.classList.add('controls-visible');

            if (!this.#video.paused) {
                this.#controlsTimeout = setTimeout(() => this.#hideControls(), 2600);
            }
        }

        #hideControls() {
            if (this.#isScrubbing || this.#settingsMenu.classList.contains('visible') || this.#video.paused) return;
            this.#videoControls.classList.remove('visible');
            this.#container.classList.remove('controls-visible');
            this.#container.classList.add('no-cursor');
        }

        async #handleDownloadVideo() {
            if (!this.#video.currentSrc || this.#downloadBtn.classList.contains('disabled')) return;
            const videoUrl = this.#video.currentSrc;
            let filename = videoUrl.split('/').pop().split('?')[0] || 'video.mp4';
            if (!filename.includes('.')) filename += '.mp4';

            try {
                const response = await fetch(videoUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const videoBlob = await response.blob();
                const blobUrl = window.URL.createObjectURL(videoBlob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                a.remove();
            } catch (error) {
                console.error("Failed to download video:", error);
                alert(`Failed to download video. This might be due to server configuration (CORS) or network issues.`);
            }
        }

        // --- Caption System Methods ---
        #handleTrackChange() { this.#updateCaptionButtonVisibility(); this.#populateCaptionsMenu(); }
        #updateCaptionButtonVisibility() {
            const hasTracks = this.#video.textTracks?.length > 0;
            const displayStyle = hasTracks ? 'flex' : 'none';
            this.#captionsBtn.style.display = displayStyle;
            this.#captionsMenuBtn.style.display = displayStyle;
        }
        #populateCaptionsMenu() {
            this.#captionsTrackList.innerHTML = '';
            const offButton = this.#createCaptionMenuItem('Off', -1);
            this.#captionsTrackList.appendChild(offButton);
            Array.from(this.#video.textTracks).forEach((track, index) => {
                const label = track.label || `Track ${index + 1}`;
                this.#captionsTrackList.appendChild(this.#createCaptionMenuItem(label, index));
                track.mode = 'hidden';
            });
            this.#updateActiveCaptionIndicator();
        }
        #createCaptionMenuItem(label, index) {
            const button = document.createElement('button');
            button.className = 'menu-item';
            button.dataset.trackIndex = index;
            button.innerHTML = `<span class="check-mark"></span> ${label}`;
            return button;
        }
        #toggleCaptions() {
            if (this.#video.textTracks.length === 0) return;
            this.#setCaptionTrack(this.#activeTrackIndex > -1 ? -1 : this.#lastActiveTrackIndex);
        }
        #setCaptionTrack(index) {
            const newIndex = parseInt(index, 10);
            if (this.#activeTrackIndex === newIndex) return;
            Array.from(this.#video.textTracks).forEach(t => t.mode = 'hidden');
            if (newIndex > -1 && this.#video.textTracks[newIndex]) {
                this.#video.textTracks[newIndex].mode = 'showing';
                this.#lastActiveTrackIndex = newIndex;
            }
            this.#activeTrackIndex = newIndex;
            this.#updateActiveCaptionIndicator();
        }
        #updateActiveCaptionIndicator() {
            const isActive = this.#activeTrackIndex > -1;
            this.#captionsBtn.classList.toggle('active', isActive);
            this.#container.classList.toggle('captions-on', isActive);
            const statusText = isActive ? (this.#video.textTracks[this.#activeTrackIndex]?.label || `Track ${this.#activeTrackIndex + 1}`) : 'Off';
            this.#captionsStatus.innerHTML = `${statusText} <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>`;
            this.#captionsTrackList.querySelectorAll('.menu-item').forEach(button => {
                const isButtonActive = parseInt(button.dataset.trackIndex, 10) === this.#activeTrackIndex;
                button.classList.toggle('active', isButtonActive);
                button.querySelector('.check-mark').textContent = isButtonActive ? '✓' : '';
            });
        }

        // --- Volume Booster Methods ---
        async #initializeAudioBooster() {
            if (this.#mediaSource) return true;
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) throw new Error("Web Audio API not supported.");
                if (!CustomVideoPlayer.#audioContext) CustomVideoPlayer.#audioContext = new AudioContext();
                if (CustomVideoPlayer.#audioContext.state === 'suspended') await CustomVideoPlayer.#audioContext.resume();
                this.#mediaSource = CustomVideoPlayer.#audioContext.createMediaElementSource(this.#video);
                this.#boosterGainNode = CustomVideoPlayer.#audioContext.createGain();
                this.#boosterGainNode.gain.value = 1;
                this.#mediaSource.connect(this.#boosterGainNode).connect(CustomVideoPlayer.#audioContext.destination);
                return true;
            } catch (e) {
                console.error("Failed to initialize volume booster:", e.message);
                this.#volumeBoosterBtn.style.display = 'none';
                this.#container.querySelector('.volume-booster-toggle').style.display = 'none';
                return false;
            }
        }
        async #toggleVolumeBooster() {
            if (!(await this.#initializeAudioBooster())) return;
            this.#isBoosterActive = !this.#isBoosterActive;
            this.#boosterGainNode.gain.value = this.#isBoosterActive ? this.#BOOSTER_LEVEL : 1;
            this.#volumeBoosterBtn.classList.toggle('active', this.#isBoosterActive);
            this.#boosterStatus.textContent = this.#isBoosterActive ? 'On' : 'Off';
        }

        // --- Menu and Settings Methods ---
        #handleMenuClick(e) {
            const button = e.target.closest('button');
            if (!button) return;
            const targetPanel = button.dataset.targetPanel;
            const trackIndex = button.dataset.trackIndex;
            if (targetPanel) { this.#navigateMenu(targetPanel); } 
            else if (trackIndex !== undefined) { this.#setCaptionTrack(trackIndex); } 
            else if (button.classList.contains('volume-booster-toggle')) { this.#toggleVolumeBooster(); }
        }
        #toggleMenu(menu, button) { const isVisible = menu.classList.toggle('visible'); button.classList.toggle('menu-open', isVisible); if (isVisible) { this.#showControls(); } else { this.#navigateMenu('main'); this.#hideControls(); } }
        #closeAllMenus() { this.#settingsMenu.classList.remove('visible'); this.#settingsBtn.classList.remove('menu-open'); this.#navigateMenu('main'); }
        #navigateMenu(panelName) { const panelIndex = { 'main': 0, 'speed': 1, 'captions-track': 2, 'captions-style': 3 }; const index = panelIndex[panelName] || 0; this.#menuPanelsWrapper.style.transform = `translateX(-${index * 100}%)`; }
        #handleCaptionInputChange(e) {
            const input = e.currentTarget;
            const setting = input.dataset.setting;
            let value;
            if (input.id === 'caption-bg-color') {
                const opacity = parseInt(this.#container.querySelector('#caption-bg-opacity').value, 10) / 100;
                value = this.#hexToRgba(input.value, opacity);
            } else if (input.id === 'caption-bg-opacity') {
                const opacity = parseInt(input.value, 10) / 100;
                value = this.#hexToRgba(this.#container.querySelector('#caption-bg-color').value, opacity);
            } else {
                value = input.value + (input.dataset.unit || '');
            }
            this.#container.style.setProperty(`--${setting}`, value);
            this.#saveSingleSetting(setting, value);
        }

        // --- Settings Persistence ---
        #saveSingleSetting(key, value) {
            try {
                const settings = JSON.parse(localStorage.getItem(PLAYER_SETTINGS_KEY)) || {};
                settings[key] = value;
                localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settings));
            } catch (e) { console.error("Could not save player setting.", e); }
        }
        #loadSettings() {
            try {
                const savedSettings = JSON.parse(localStorage.getItem(PLAYER_SETTINGS_KEY));
                const defaultSettings = { 'primary-color': '#00a8ff', 'caption-font-family': 'Arial', 'caption-font-size': '22px', 'caption-font-color': '#ffffff', 'caption-bg-color': 'rgba(0, 0, 0, 0.75)' };
                const settings = { ...defaultSettings, ...(savedSettings || {}) };
                for (const key in settings) { this.#container.style.setProperty(`--${key}`, settings[key]); }
                this.#updateSettingsUI(settings);
            } catch (e) { console.error("Could not load player settings.", e); }
        }
        #updateSettingsUI(settings) {
            this.#captionSettingInputs.forEach(input => {
                const settingKey = input.dataset.setting;
                let value = settings[settingKey];
                if (!value) return;
                if (input.dataset.isOpacity) {
                    const rgbaMatch = value.match(/rgba?\(.+,\s*([\d.]+)\)/);
                    if (rgbaMatch) input.value = Math.round(parseFloat(rgbaMatch[1]) * 100);
                } else if (input.type === 'color' && value.startsWith('rgba')) {
                    const [r, g, b] = value.match(/\d+/g);
                    input.value = `#${[r,g,b].map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
                } else {
                    input.value = value.replace(/px$/, '');
                }
            });
        }

        // --- Helper Methods ---
        #hexToRgba(hex, opacity) { const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16)); return `rgba(${r}, ${g}, ${b}, ${opacity})`; }
        #formatDisplayTime(timeInSeconds) { if (isNaN(timeInSeconds)) return '00:00'; const date = new Date(timeInSeconds * 1000); const timeString = date.toISOString().slice(11, 19); return (this.#video.duration || 0) >= 3600 ? timeString : timeString.slice(3); }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('video.cvp').forEach(videoEl => new CustomVideoPlayer(videoEl));
    });

})();
