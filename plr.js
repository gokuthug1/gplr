--- START OF FILE gplr.js ---

/**
 * GokuPlr v2.4.2
 * A modern, feature-rich, and customizable HTML5 video player.
 * Improvements: Fixed Seek SVGs, Organized Settings, Optimized Download.
 * Fixes: Fixed Mobile "Tap to Show" bug by isolating mouse vs touch hover events.
 */

(function() {
    if (window.GokuPlrInitialized) {
        return;
    }
    window.GokuPlrInitialized = true;

    class CustomVideoPlayer {
        // --- Static Properties ---
        static #version = '2.4.2';
        static #PLAYER_SETTINGS_KEY = 'gplr-settings';
        static #PLAYER_VOLUME_KEY = 'gplr-volume';
        static #PLAYER_SPEED_KEY = 'gplr-speed';
        static #audioContext = null;

        // --- Private Instance Fields ---
        #video;
        #container;

        // State
        #controlsTimeout = null;
        #indicatorTimeout = null;
        #animationFrameId = null;
        #isScrubbing = false;
        #isDraggingVolume = false;
        #wasPausedBeforeScrub = true;
        #activeTrackIndex = -1;
        #lastActiveTrackIndex = 0;
        #isTouch = false;
        #vttThumbnails = null;
        #thumbnailSprite = null;

        // Audio Booster
        #mediaSource = null;
        #boosterGainNode = null;
        #isBoosterActive = false;
        
        // Config
        #PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 4, 8];
        #BOOSTER_LEVEL = 2;

        // Elements
        #thumbnailVideo; #thumbnailCanvas; #thumbnailCtx; #playPauseBtn; #bigPlayBtn;
        #muteBtn; #volumeSlider; #volumeFilled; #volumeThumb; #progressBarContainer;
        #progressBarFilled; #fullscreenBtn; #captionsBtn; #pipBtn; #downloadBtn;
        #seekTooltip; #tooltipTime; #currentTimeEl; #totalTimeEl; #videoControls;
        #settingsBtn; #settingsMenu; #menuPanelsWrapper; #speedSlider; #speedDisplay;
        #speedPanelDisplay; #volumeBoosterBtn; #boosterStatus; #captionsMenuBtn;
        #captionsStatus; #captionsTrackList; #captionSettingInputs;
        #qualityMenuBtn; #qualityStatus; #qualityMenuList; #indicator; #indicatorIcon;
        #ambientCanvas; #ambientCtx; #ambientModeToggle; #ambientStatus;
        #airplayBtn; #castBtn;

        // Fixed Icons
        #ICON_PATHS = {
            play: 'M8 5v14l11-7z',
            pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
            volumeUp: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
            volumeDown: 'M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z',
            muted: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
            seekForward: 'M12 5V1L17 6l-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6H20c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z',
            seekBackward: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z'
        };

        #boundHandleScrubbing;
        #boundHandleScrubbingEnd;
        #boundHandleVolumeDrag;
        #boundHandleVolumeDragEnd;

        constructor(videoElement) {
            if (!videoElement || videoElement.dataset.customPlayerInitialized) return;
            this.#video = videoElement;
            this.#video.dataset.customPlayerInitialized = 'true';
            this.#video.controls = false;
            this.#video.crossOrigin = 'anonymous'; 
            this.#isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            this.#injectStyles();
            this.#buildPlayerHtml();
            this.#selectDOMElements();
            this.#bindEventHandlers();
            this.#initializePlayerState();
            this.#attachEventListeners();
        }

        #injectStyles() {
            if (document.getElementById('goku-player-styles')) return;
            const style = document.createElement('style');
            style.id = 'goku-player-styles';
            style.textContent = `
                :root { --primary-color: #ff4081; --text-color: #ffffff; --controls-bg: rgba(15, 15, 15, 0.85); --menu-bg: rgba(25, 25, 25, 0.95); --progress-bar-bg: rgba(255, 255, 255, 0.25); --tooltip-bg: rgba(0, 0, 0, 0.9); --font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; --border-radius: 8px; --transition-speed: 0.2s; }
                .video-player-container { box-sizing: border-box; position: relative; width: 100%; background-color: #000; border-radius: var(--border-radius); overflow: hidden; font-family: var(--font-family); aspect-ratio: 16 / 9; -webkit-tap-highlight-color: transparent; }
                .video-player-container * { box-sizing: border-box; }
                .video-player-container:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
                .video-player-container.no-cursor { cursor: none; }
                .video-player-container.fullscreen { width: 100%; height: 100%; border-radius: 0; aspect-ratio: auto; }
                /* Ensure video is z-index 1 so controls (z-index 10) are always clickable */
                .video-player-container video { width: 100%; height: 100%; display: block; position: relative; z-index: 1; }
                
                /* Ambient Mode - z-index 0 to stay behind video */
                .ambient-canvas { position: absolute; top: -5%; left: -5%; width: 110%; height: 110%; filter: blur(40px) brightness(1.2); opacity: 0; transition: opacity 0.4s ease-in-out; z-index: 0; pointer-events: none; }
                .video-player-container.ambient-mode-on.playing .ambient-canvas { opacity: 0.6; }

                /* Captions */
                .video-player-container video::cue { background-color: var(--caption-bg-color, rgba(0,0,0,0.75)); color: var(--caption-font-color, #fff); font-size: var(--caption-font-size, 22px); font-family: var(--caption-font-family, sans-serif); transition: bottom var(--transition-speed); bottom: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }
                .video-player-container.controls-visible.captions-on video::cue { bottom: 85px; }
                
                /* Controls Overlay - High Z-Index to ensure visibility */
                .video-controls { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px; display: flex; flex-direction: column; background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); opacity: 0; visibility: hidden; transition: opacity var(--transition-speed), visibility var(--transition-speed); z-index: 10; pointer-events: auto; }
                .video-player-container .video-controls.visible { opacity: 1; visibility: visible; }
                .controls-bottom { display: flex; align-items: center; gap: 10px; }
                .controls-left, .controls-right { display: flex; align-items: center; gap: 10px; }
                .controls-right { margin-left: auto; }
                .control-button { background: none; border: none; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background var(--transition-speed), opacity var(--transition-speed); position: relative; }
                .control-button svg { width: 24px; height: 24px; fill: var(--text-color); pointer-events: none; transition: fill var(--transition-speed); shape-rendering: geometricPrecision; }
                .control-button:hover { background: rgba(255, 255, 255, 0.15); }
                .control-button.disabled { opacity: 0.5; pointer-events: none; cursor: not-allowed; }
                .control-button.active svg, .control-button.menu-open svg { fill: var(--primary-color); }
                .airplay-btn, .cast-btn { display: none; }
                
                /* Icons Toggling */
                .play-pause-btn .pause-icon, .video-player-container.playing .play-pause-btn .play-icon { display: none; }
                .video-player-container.playing .play-pause-btn .pause-icon { display: block; }
                .mute-btn svg { display: none; }
                .video-player-container.volume-high:not(.muted) .mute-btn .volume-high-icon { display: block; }
                .video-player-container.volume-medium:not(.muted) .mute-btn .volume-medium-icon { display: block; }
                .video-player-container.volume-low:not(.muted) .mute-btn .volume-low-icon { display: block; }
                .video-player-container.muted .mute-btn .muted-icon { display: block; }
                .fullscreen-btn .exit-fs-icon, .video-player-container.fullscreen .fullscreen-btn .enter-fs-icon { display: none; }
                .fullscreen-btn .enter-fs-icon, .video-player-container.fullscreen .fullscreen-btn .exit-fs-icon { display: block; }
                
                /* Progress Bar */
                .progress-bar-container { width: 100%; height: 16px; display: flex; align-items: center; cursor: pointer; margin-bottom: 0; }
                .progress-bar { width: 100%; height: 4px; background: var(--progress-bar-bg); border-radius: 10px; position: relative; transition: height var(--transition-speed); }
                .progress-bar-filled { height: 100%; background: var(--primary-color); border-radius: 10px; width: 0%; position: relative; }
                .progress-bar-thumb { width: 12px; height: 12px; border-radius: 50%; background: var(--text-color); position: absolute; right: 0; top: 50%; transform: translate(50%, -50%) scale(0); box-shadow: 0 0 10px rgba(0,0,0,0.5); transition: transform var(--transition-speed); }
                .progress-bar-container:hover .progress-bar-thumb { transform: translate(50%, -50%) scale(1); }
                .progress-bar-container:hover .progress-bar { height: 6px; }
                .seek-tooltip { position: absolute; bottom: 45px; left: 0; background: var(--tooltip-bg); border: 1px solid rgba(255, 255, 255, 0.15); padding: 6px; border-radius: var(--border-radius); display: none; transform: translateX(-50%); text-align: center; color: var(--text-color); font-size: 12px; z-index: 15; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
                .seek-tooltip canvas { width: 160px; height: 90px; border-radius: 4px; margin-bottom: 4px; background-color: #111; display: block; }

                /* Volume Slider */
                .volume-container { display: flex; align-items: center; }
                .volume-slider { width: 0; height: 4px; background: var(--progress-bar-bg); border-radius: 10px; cursor: pointer; position: relative; transition: width var(--transition-speed) ease-in-out, opacity var(--transition-speed); margin-left: -8px; opacity: 0; }
                .volume-container:hover .volume-slider { width: 70px; margin-left: 8px; opacity: 1; }
                .volume-filled { height: 100%; background: var(--text-color); width: 100%; position: relative; border-radius: 10px; }
                .volume-thumb { width: 10px; height: 10px; border-radius: 50%; background: var(--text-color); position: absolute; top: 50%; transform: translateY(-50%); left: 100%; margin-left: -5px; opacity: 0; transition: opacity var(--transition-speed); pointer-events: none; }
                .volume-container:hover .volume-thumb { opacity: 1; }
                .time-display { color: var(--text-color); font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; user-select: none; margin-left: 5px; }
                
                /* Big Play & Indicator */
                .big-play-button { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.3); border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: transform 0.1s, opacity 0.2s; opacity: 1; z-index: 5; padding: 20px; border-radius: 50%; }
                .big-play-button:hover { transform: translate(-50%, -50%) scale(1.1); background: rgba(0,0,0,0.5); }
                .big-play-button:hover svg { fill: var(--primary-color); }
                .big-play-button svg { width: 64px; height: 64px; fill: var(--text-color); }
                .video-player-container.playing .big-play-button { opacity: 0; pointer-events: none; }
                .player-indicator { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); background: rgba(20, 20, 20, 0.7); padding: 20px; border-radius: 50%; opacity: 0; transition: opacity 0.2s, transform 0.1s; pointer-events: none; z-index: 20; backdrop-filter: blur(4px); }
                .player-indicator.visible { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                .player-indicator .indicator-icon { width: 40px; height: 40px; fill: #fff; display: block; }

                /* Settings Menu */
                .settings-menu .menu-content { position: absolute; bottom: 100%; right: 0; margin-bottom: 15px; background: var(--menu-bg); border-radius: var(--border-radius); opacity: 0; visibility: hidden; transform: translateY(10px); transition: opacity 0.2s, transform 0.2s, visibility 0.2s; width: 260px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid rgba(255,255,255,0.1); z-index: 25; }
                .settings-menu .menu-content.visible { opacity: 1; visibility: visible; transform: translateY(0); }
                .menu-panels-wrapper { display: flex; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
                .menu-panel { width: 100%; flex-shrink: 0; display: flex; flex-direction: column; }
                .menu-header { display: flex; align-items: center; padding: 10px; font-size: 14px; font-weight: 600; color: #eee; border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255,255,255,0.05); }
                .menu-header span { flex-grow: 1; text-align: center; margin-right: 30px; }
                .menu-back-btn { background: none; border: none; color: #eee; cursor: pointer; padding: 4px; border-radius: 4px; }
                .menu-back-btn:hover { background: rgba(255, 255, 255, 0.1); }
                .menu-back-btn svg { width: 20px; height: 20px; fill: currentColor; }
                
                .menu-panel-content { padding: 6px; display: flex; flex-direction: column; gap: 2px; }
                .menu-item { background: none; border: none; border-radius: 4px; width: 100%; text-align: left; padding: 10px 12px; color: var(--text-color); font-size: 13px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .menu-item:hover { background: rgba(255, 255, 255, 0.1); }
                .menu-item-value { color: #aaa; font-size: 13px; display: flex; align-items: center; }
                .menu-item-value svg { width: 16px; height: 16px; fill: #aaa; margin-left: 6px; }
                .menu-separator { height: 1px; background: rgba(255, 255, 255, 0.1); margin: 6px 0; }
                .menu-section-label { color: #888; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; letter-spacing: 0.5px; margin-top: 4px; }
                
                .menu-list .menu-item.active { background-color: rgba(255, 255, 255, 0.05); }
                .menu-list .menu-item .check-mark { width: 20px; display: inline-block; text-align: left; font-weight: bold; color: var(--primary-color); opacity: 0; margin-right: 5px; }
                .menu-list .menu-item.active .check-mark { opacity: 1; }
                .menu-list .menu-item { justify-content: flex-start; }
                
                .speed-slider-container { padding: 12px 4px; display: flex; align-items: center; gap: 12px; }
                .speed-slider-container .speed-panel-display { color: #ccc; font-size: 14px; min-width: 45px; text-align: right; }
                .caption-settings-grid { display: grid; grid-template-columns: auto 1fr; gap: 12px 15px; align-items: center; padding: 8px 4px; font-size: 13px; color: #eee; }
                .caption-settings-grid select { width: 100%; background: #333; color: white; border: 1px solid #555; padding: 6px; border-radius: 4px; }
                .caption-settings-grid input[type="color"] { width: 30px; height: 30px; border: 1px solid #555; border-radius: 50%; padding: 0; background: none; cursor: pointer; }
                
                input[type=range].goku-slider { -webkit-appearance: none; width: 100%; height: 4px; background: var(--progress-bar-bg); border-radius: 5px; outline: none; cursor: pointer; }
                input[type=range].goku-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--text-color); border-radius: 50%; transition: transform 0.2s; }
                input[type=range].goku-slider:hover::-webkit-slider-thumb { transform: scale(1.2); background: var(--primary-color); }
                
                /* Mobile */
                .touch-device .seek-tooltip { display: none !important; }
                .touch-device .volume-slider { width: 70px; margin-left: 8px; opacity: 1; }
                .touch-device .volume-thumb { opacity: 1; }
                .touch-device .progress-bar { height: 6px; }
                .touch-device .progress-bar-thumb { transform: translate(50%, -50%) scale(1); }
                
                @media (max-width: 600px) { 
                    .volume-slider { width: 50px; } 
                    .time-display { font-size: 12px; } 
                    .control-button svg { width: 22px; height: 22px; } 
                    .video-player-container.controls-visible.captions-on video::cue { bottom: 70px; } 
                }
            `;
            document.head.appendChild(style);
        }

        #buildPlayerHtml() {
            const container = document.createElement('div');
            container.className = 'video-player-container';
            if (this.#isTouch) container.classList.add('touch-device');
            container.tabIndex = 0;
            this.#container = container;
            this.#video.parentNode.insertBefore(container, this.#video);
            
            // FIX: Append video FIRST so it sits behind the controls layer in DOM order.
            // This ensures controls are physically on top for event handling.
            container.appendChild(this.#video);

            const playerHtml = `
                <canvas class="ambient-canvas"></canvas>
                <video class="thumbnail-video" muted playsinline style="display: none;" crossorigin="anonymous"></video>
                <div class="player-indicator"><svg class="indicator-icon" viewBox="0 0 24 24"></svg></div>
                <button class="big-play-button"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></button>
                <div class="video-controls">
                    <div class="progress-bar-container">
                        <div class="seek-tooltip"><canvas class="thumbnail-canvas"></canvas><span class="tooltip-time">00:00</span></div>
                        <div class="progress-bar"><div class="progress-bar-filled"></div><div class="progress-bar-thumb"></div></div>
                    </div>
                    <div class="controls-bottom">
                        <div class="controls-left">
                            <button class="control-button play-pause-btn"><svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5V19L19 12L8 5Z"></path></svg><svg class="pause-icon" viewBox="0 0 24 24"><path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"></path></svg></button>
                            <div class="volume-container">
                                <button class="control-button mute-btn"><svg class="volume-high-icon" viewBox="0 0 24 24"><path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.84 14 18.7V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"></path></svg><svg class="volume-medium-icon" viewBox="0 0 24 24"><path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12Z"></path></svg><svg class="volume-low-icon" viewBox="0 0 24 24"><path d="M3 9H7L12 4V20L7 15H3V9Z"></path></svg><svg class="muted-icon" viewBox="0 0 24 24"><path d="M16.5 12C16.5 10.23 15.54 8.71 14 7.97V10.18L16.45 12.63C16.5 12.43 16.5 12.21 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.62 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 17.84 14.83 18.08 14 18.22V20.29L20 20.28L4.27 3ZM12 4L10.12 5.88L12 7.76V4Z"></path></svg></button>
                                <div class="volume-slider"><div class="volume-filled"></div><div class="volume-thumb"></div></div>
                            </div>
                            <div class="time-display"><span class="current-time">00:00</span> / <span class="total-time">00:00</span></div>
                        </div>
                        <div class="controls-right">
                            <button class="control-button volume-booster-btn"><svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"></path></svg></button>
                            <button class="control-button airplay-btn"><svg viewBox="0 0 24 24"><path d="M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg></button>
                            <button class="control-button cast-btn"><svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"></path></svg></button>
                            <div class="settings-menu">
                                <button class="control-button settings-btn"><svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg></button>
                                <div class="menu-content">
                                    <div class="menu-panels-wrapper">
                                        <!-- Panel 0: Main (Categorized) -->
                                        <div class="menu-panel main-panel">
                                            <div class="menu-panel-content">
                                                <div class="menu-section-label">Playback</div>
                                                <button class="menu-item quality-menu-btn" data-target-panel="quality"><span>Quality</span><span class="menu-item-value quality-status">Auto <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span></button>
                                                <button class="menu-item" data-target-panel="speed"><span>Speed</span><span class="menu-item-value speed-display">1.0×</span></button>
                                                
                                                <div class="menu-separator"></div>
                                                <div class="menu-section-label">Audio</div>
                                                <button class="menu-item volume-booster-toggle"><span>Volume Booster</span><span class="menu-item-value booster-status">Off</span></button>
                                                
                                                <div class="menu-separator"></div>
                                                <div class="menu-section-label">Display</div>
                                                <button class="menu-item captions-menu-btn" data-target-panel="captions-track"><span>Captions</span><span class="menu-item-value captions-status">Off <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span></button>
                                                <button class="menu-item ambient-mode-toggle"><span>Ambient Mode</span><span class="menu-item-value ambient-status">Off</span></button>
                                            </div>
                                        </div>
                                        <!-- Panel 1: Speed -->
                                        <div class="menu-panel speed-panel">
                                            <div class="menu-header"><button class="menu-back-btn" data-target-panel="main"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button><span>Playback Speed</span></div>
                                            <div class="menu-panel-content"><div class="speed-slider-container"><input type="range" class="goku-slider speed-slider" min="0" max="7" value="2" step="1"><span class="speed-panel-display">1.0×</span></div></div>
                                        </div>
                                        <!-- Panel 2: Captions -->
                                        <div class="menu-panel captions-track-panel">
                                            <div class="menu-header"><button class="menu-back-btn" data-target-panel="main"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button><span>Captions</span></div>
                                            <div class="menu-panel-content"><div class="captions-track-list menu-list"></div><div class="menu-separator"></div><button class="menu-item" data-target-panel="captions-style"><span>Settings</span><span class="menu-item-value"><svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span></button></div>
                                        </div>
                                        <!-- Panel 3: Caption Style -->
                                        <div class="menu-panel captions-style-panel">
                                            <div class="menu-header"><button class="menu-back-btn" data-target-panel="captions-track"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button><span>Caption Style</span></div>
                                            <div class="menu-panel-content"><div class="caption-settings-grid"><label>Accent</label><input type="color" class="caption-setting-input" data-setting="primary-color"><label>Font</label><select class="caption-setting-input" data-setting="caption-font-family"><option>Arial</option><option>Verdana</option><option>Helvetica</option><option>Times New Roman</option><option>Courier New</option><option>Georgia</option></select><label>Size</label><input type="range" class="goku-slider caption-setting-input" min="14" max="36" step="1" data-setting="caption-font-size" data-unit="px"><label>Color</label><input type="color" class="caption-setting-input" data-setting="caption-font-color"><label>Bg Color</label><input type="color" id="caption-bg-color" class="caption-setting-input" data-setting="caption-bg-color" data-opacity-input="caption-bg-opacity"><label>Bg Opacity</label><input type="range" id="caption-bg-opacity" class="goku-slider caption-setting-input" min="0" max="100" step="5" data-setting="caption-bg-color" data-is-opacity="true"></div></div>
                                        </div>
                                        <!-- Panel 4: Quality -->
                                        <div class="menu-panel quality-panel">
                                            <div class="menu-header"><button class="menu-back-btn" data-target-panel="main"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button><span>Quality</span></div>
                                            <div class="menu-panel-content"><div class="quality-menu-list menu-list"></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="control-button captions-btn"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"></path></svg></button>
                            <button class="control-button pip-btn"><svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path></svg></button>
                            <button class="control-button fullscreen-btn"><svg class="enter-fs-icon" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg><svg class="exit-fs-icon" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg></button>
                            <button class="control-button download-btn disabled"><svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg></button>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', playerHtml);
        }

        #selectDOMElements() {
            const D = (s) => this.#container.querySelector(s);
            const DA = (s) => this.#container.querySelectorAll(s);
        
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
            this.#captionSettingInputs = DA('.caption-setting-input');
            this.#qualityMenuBtn = D('.quality-menu-btn');
            this.#qualityStatus = D('.quality-status');
            this.#qualityMenuList = D('.quality-menu-list');
            this.#indicator = D('.player-indicator');
            this.#indicatorIcon = D('.indicator-icon');
            this.#ambientCanvas = D('.ambient-canvas');
            this.#ambientCtx = this.#ambientCanvas.getContext('2d');
            this.#ambientModeToggle = D('.ambient-mode-toggle');
            this.#ambientStatus = D('.ambient-status');
            this.#airplayBtn = D('.airplay-btn');
            this.#castBtn = D('.cast-btn');
        }

        #bindEventHandlers() {
            this.#boundHandleScrubbing = this.#handleScrubbing.bind(this);
            this.#boundHandleScrubbingEnd = this.#handleScrubbingEnd.bind(this);
            this.#boundHandleVolumeDrag = this.#handleVolumeDrag.bind(this);
            this.#boundHandleVolumeDragEnd = this.#handleVolumeDragEnd.bind(this);
        }

        #initializePlayerState() {
            this.#loadSettings();
            this.#loadVolume();
            this.#updatePlayPauseIcon();
            this.#updateVolumeUI();
            this.#initializeCasting();
            this.#loadVttThumbnails();
            
            const savedSpeed = parseFloat(localStorage.getItem(CustomVideoPlayer.#PLAYER_SPEED_KEY));
            this.#setSpeed(this.#PLAYBACK_SPEEDS.includes(savedSpeed) ? savedSpeed : 1.0, false); 
            
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
            this.#attachVideoListeners();
            this.#attachControlListeners();
            this.#attachContainerListeners();
            this.#attachGlobalListeners();
        }

        #attachVideoListeners() {
            this.#video.addEventListener('loadedmetadata', this.#handleLoadedMetadata.bind(this));
            this.#video.textTracks.addEventListener('addtrack', this.#handleTrackChange.bind(this));
            this.#video.textTracks.addEventListener('removetrack', this.#handleTrackChange.bind(this));
            this.#video.addEventListener('play', this.#handlePlay.bind(this));
            this.#video.addEventListener('pause', this.#handlePause.bind(this));
            this.#video.addEventListener('ended', () => this.#stopProgressLoop());
            this.#video.addEventListener('timeupdate', () => { if (!this.#isScrubbing) this.#updateTimeDisplay() });
            this.#video.addEventListener('volumechange', this.#handleVolumeChange.bind(this));
            this.#video.addEventListener('enterpictureinpicture', () => this.#pipBtn.classList.add('active'));
            this.#video.addEventListener('leavepictureinpicture', () => this.#pipBtn.classList.remove('active'));
        }

        #attachControlListeners() {
            this.#playPauseBtn.addEventListener('click', () => this.#togglePlay());
            this.#bigPlayBtn.addEventListener('click', () => this.#togglePlay());
            this.#muteBtn.addEventListener('click', this.#toggleMute.bind(this));
            this.#fullscreenBtn.addEventListener('click', this.#toggleFullscreen.bind(this));
            this.#pipBtn.addEventListener('click', this.#togglePip.bind(this));
            this.#captionsBtn.addEventListener('click', this.#toggleCaptions.bind(this));
            this.#settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); this.#toggleMenu(this.#settingsMenu, this.#settingsBtn); });
            this.#downloadBtn.addEventListener('click', this.#handleDownloadVideo.bind(this));
            this.#volumeBoosterBtn.addEventListener('click', this.#toggleVolumeBooster.bind(this));
            this.#speedSlider.addEventListener('input', () => { this.#setSpeed(this.#PLAYBACK_SPEEDS[this.#speedSlider.value]); });
            this.#settingsMenu.addEventListener('click', this.#handleMenuClick.bind(this));
            this.#videoControls.addEventListener('click', e => e.stopPropagation());

            this.#progressBarContainer.addEventListener('mousedown', this.#handleScrubbingStart.bind(this));
            this.#progressBarContainer.addEventListener('touchstart', this.#handleScrubbingStart.bind(this), { passive: false });
            this.#progressBarContainer.addEventListener('mousemove', this.#updateSeekTooltip.bind(this));
            this.#progressBarContainer.addEventListener('mouseleave', () => this.#seekTooltip.style.display = 'none');

            this.#volumeSlider.addEventListener('mousedown', this.#handleVolumeDragStart.bind(this));
            this.#volumeSlider.addEventListener('touchstart', this.#handleVolumeDragStart.bind(this), { passive: false });

            this.#captionSettingInputs.forEach(input => input.addEventListener('input', this.#handleCaptionInputChange.bind(this)));
        }

        #attachContainerListeners() {
            this.#container.addEventListener('keydown', this.#handleKeydown.bind(this));
            
            // FIX: Using pointermove instead of mousemove.
            // Only trigger showControls if the pointer is actually a mouse.
            // This prevents touch "ghost" mousemoves from showing controls immediately before a click,
            // which causes the click handler to think they are already visible and hide them.
            this.#container.addEventListener('pointermove', (e) => {
                if (e.pointerType === 'mouse') this.#showControls();
            });

            this.#container.addEventListener('mouseleave', () => this.#hideControls());
            this.#container.addEventListener('click', this.#handleContainerClick.bind(this));
            this.#container.addEventListener('dblclick', this.#handleDoubleClick.bind(this));
        }

        #attachGlobalListeners() {
            document.addEventListener('click', this.#handleDocumentClick.bind(this));
            this.#thumbnailVideo.addEventListener('seeked', () => { this.#thumbnailCtx.drawImage(this.#thumbnailVideo, 0, 0, this.#thumbnailCanvas.width, this.#thumbnailCanvas.height); });
            ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(e => document.addEventListener(e, this.#updateFullscreenUI.bind(this)));
        }
        
        // --- Core Logic ---

        #togglePlay() { this.#video.paused ? this.#video.play() : this.#video.pause(); }
        #toggleMute() { this.#video.muted = !this.#video.muted; }
        
        #toggleFullscreen() {
            const el = document.fullscreenElement ? document : this.#container;
            const method = el === document ? 'exitFullscreen' : 'requestFullscreen';
            if(el[method]) el[method]();
            else if(el['webkit'+method.charAt(0).toUpperCase() + method.slice(1)]) el['webkit'+method.charAt(0).toUpperCase() + method.slice(1)]();
        }
        
        #togglePip() { document.pictureInPictureElement ? document.exitPictureInPicture() : this.#video.requestPictureInPicture(); }

        #setSpeed(speed, save = true) {
            const newSpeed = parseFloat(speed);
            if (isNaN(newSpeed) || !this.#PLAYBACK_SPEEDS.includes(newSpeed)) return;
            this.#video.playbackRate = newSpeed;
            if (save) localStorage.setItem(CustomVideoPlayer.#PLAYER_SPEED_KEY, newSpeed);
            const speedIndex = this.#PLAYBACK_SPEEDS.indexOf(newSpeed);
            if (speedIndex > -1) this.#speedSlider.value = speedIndex;
            const text = `${(newSpeed % 1 === 0) ? newSpeed.toFixed(1) : newSpeed.toString()}×`;
            this.#speedDisplay.textContent = text;
            if(this.#speedPanelDisplay) this.#speedPanelDisplay.textContent = text;
        }
        
        #changeSpeed(direction) {
            const currentIndex = this.#PLAYBACK_SPEEDS.indexOf(this.#video.playbackRate);
            const newIndex = Math.max(0, Math.min(this.#PLAYBACK_SPEEDS.length - 1, currentIndex + direction));
            this.#setSpeed(this.#PLAYBACK_SPEEDS[newIndex]);
        }

        #updatePlayPauseIcon() { this.#container.classList.toggle('playing', !this.#video.paused); }
        #updateVolumeUI() {
            this.#container.classList.remove('volume-high', 'volume-medium', 'volume-low', 'muted');
            const level = this.#video.muted ? 0 : this.#video.volume;
            if (level === 0) this.#container.classList.add('muted');
            else if (level > 0.66) this.#container.classList.add('volume-high');
            else if (level > 0.33) this.#container.classList.add('volume-medium');
            else this.#container.classList.add('volume-low');
            const pct = level * 100;
            this.#volumeFilled.style.width = `${pct}%`;
            this.#volumeThumb.style.left = `${pct}%`;
        }

        #updateFullscreenUI() {
            this.#container.classList.toggle('fullscreen', !!document.fullscreenElement);
        }

        #updateTimeDisplay() { 
            this.#currentTimeEl.textContent = this.#formatDisplayTime(this.#video.currentTime);
            this.#totalTimeEl.textContent = this.#formatDisplayTime(this.#video.duration);
        }
        #updateProgressBar() { 
            if (isNaN(this.#video.duration)) return;
            const percent = (this.#video.currentTime / this.#video.duration) * 100;
            this.#progressBarFilled.style.width = `${percent}%`;
        }
        
        // --- Event Handlers ---

        #handleLoadedMetadata() {
            this.#updateTimeDisplay();
            if (this.#video.videoWidth > 0 && this.#video.videoHeight > 0) {
                this.#container.style.setProperty('aspect-ratio', this.#video.videoWidth / this.#video.videoHeight);
            }
            this.#updateProgressBar();
            if (this.#video.src && !this.#thumbnailVideo.src) this.#setupVideoSource(this.#video.src);
            this.#handleTrackChange();
            this.#handleQualitySourceChange();
        }

        #handlePlay() { this.#updatePlayPauseIcon(); this.#startProgressLoop(); this.#showControls(); }
        #handlePause() { this.#updatePlayPauseIcon(); this.#stopProgressLoop(); this.#showControls(); }

        #handleVolumeChange() { this.#updateVolumeUI(); this.#saveVolume(); }
        #handleDocumentClick(e) { if (!e.target.closest('.settings-menu')) this.#closeAllMenus(); }
        
        #handleContainerClick(e) {
            if (e.target !== this.#container && e.target !== this.#video) return;
            
            // FIX: Robust Mobile/Touch logic.
            // On Touch: Tap always toggles UI visibility.
            // On Desktop: Click toggles Play/Pause (hover handles visibility).
            // We use the pointermove fix in listeners to ensure logic doesn't conflict.
            if (this.#isTouch) {
                if (this.#videoControls.classList.contains('visible')) {
                    this.#hideControls(true);
                } else {
                    this.#showControls();
                }
            } else {
                this.#togglePlay();
            }
        }

        #handleDoubleClick(e) {
            if (e.target !== this.#container && e.target !== this.#video) return;
            const rect = this.#container.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const third = rect.width / 3;

            if (clickX < third) { this.#video.currentTime -= 10; this.#showIndicator('seekBackward'); } 
            else if (clickX > rect.width - third) { this.#video.currentTime += 10; this.#showIndicator('seekForward'); } 
            else { this.#toggleFullscreen(); }
        }
        
        #handleKeydown(e) {
            if (e.target.matches('input, textarea, select')) return;
            const key = e.key.toLowerCase();
            const num = parseInt(key, 10);

            if (!isNaN(num) && this.#video.duration > 0) {
                e.preventDefault();
                this.#video.currentTime = this.#video.duration * (num / 10);
                return;
            }
            if (e.ctrlKey && key === 'z') { e.preventDefault(); this.#toggleVolumeBooster(); return; }

            const acts = {
                " ": () => this.#togglePlay(),
                "k": () => this.#togglePlay(),
                "m": () => this.#toggleMute(),
                "f": () => this.#toggleFullscreen(),
                "p": () => this.#togglePip(),
                "c": () => this.#toggleCaptions(),
                "arrowleft": () => { this.#video.currentTime -= 5; this.#showIndicator('seekBackward'); },
                "arrowright": () => { this.#video.currentTime += 5; this.#showIndicator('seekForward'); },
                "arrowup": () => { this.#video.muted = false; this.#video.volume = Math.min(1, this.#video.volume + 0.05); this.#showIndicator('volumeUp'); },
                "arrowdown": () => { this.#video.volume = Math.max(0, this.#video.volume - 0.05); this.#showIndicator('volumeDown'); },
                "j": () => { this.#video.currentTime -= 10; this.#showIndicator('seekBackward'); },
                "l": () => { this.#video.currentTime += 10; this.#showIndicator('seekForward'); },
                ",": () => this.#changeSpeed(-1), ".": () => this.#changeSpeed(1)
            };
            if(acts[key]) { e.preventDefault(); acts[key](); }
        }

        // --- Scrubbing & Volume ---

        #handleScrubbing(e) {
            const rect = this.#progressBarContainer.getBoundingClientRect();
            const clientX = this.#getEventX(e);
            const percent = Math.min(Math.max(0, clientX - rect.x), rect.width) / rect.width;
            if (isNaN(this.#video.duration)) return;
            this.#progressBarFilled.style.width = `${percent * 100}%`;
            this.#currentTimeEl.textContent = this.#formatDisplayTime(percent * this.#video.duration);
        }
        #updateSeekTooltip(e) {
            if (this.#isTouch) return;
            const rect = this.#progressBarContainer.getBoundingClientRect();
            const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
            if (isNaN(this.#video.duration)) return;
            
            const seekTime = percent * this.#video.duration;
            this.#seekTooltip.style.display = 'block';
            this.#tooltipTime.textContent = this.#formatDisplayTime(seekTime);
            
            if (this.#vttThumbnails && this.#thumbnailSprite) {
                const cue = this.#vttThumbnails.find(c => seekTime >= c.start && seekTime < c.end);
                if (cue) this.#thumbnailCtx.drawImage(this.#thumbnailSprite, cue.x, cue.y, cue.w, cue.h, 0, 0, this.#thumbnailCanvas.width, this.#thumbnailCanvas.height);
            } else if (this.#thumbnailVideo.src) {
                this.#thumbnailVideo.currentTime = seekTime;
            }

            const w = this.#seekTooltip.offsetWidth;
            const x = Math.max(w / 2, Math.min(rect.width - w / 2, e.x - rect.x));
            this.#seekTooltip.style.left = `${x}px`;
        }
        #handleScrubbingStart(e) {
            if (e.type === 'touchstart') e.preventDefault();
            this.#isScrubbing = true;
            this.#wasPausedBeforeScrub = this.#video.paused;
            this.#stopProgressLoop();
            if (!this.#wasPausedBeforeScrub) this.#video.pause();
            this.#handleScrubbing(e);
            const move = this.#isTouch ? 'touchmove' : 'mousemove';
            const end = this.#isTouch ? 'touchend' : 'mouseup';
            document.addEventListener(move, this.#boundHandleScrubbing);
            document.addEventListener(end, this.#boundHandleScrubbingEnd, { once: true });
        }
        #handleScrubbingEnd(e) {
            this.#isScrubbing = false;
            document.removeEventListener(this.#isTouch ? 'touchmove' : 'mousemove', this.#boundHandleScrubbing);
            const rect = this.#progressBarContainer.getBoundingClientRect();
            const clientX = this.#getEventX(e, true);
            const percent = Math.min(Math.max(0, clientX - rect.x), rect.width) / rect.width;
            this.#video.currentTime = percent * this.#video.duration;
            if (!this.#wasPausedBeforeScrub) this.#video.play();
            this.#seekTooltip.style.display = 'none';
        }
        #handleVolumeDrag(e) {
            const rect = this.#volumeSlider.getBoundingClientRect();
            const clientX = this.#getEventX(e);
            const level = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
            this.#video.volume = level;
            this.#video.muted = level === 0;
        }
        #handleVolumeDragStart(e) {
            if (e.type === 'touchstart') e.preventDefault();
            this.#isDraggingVolume = true;
            this.#handleVolumeDrag(e);
            const move = this.#isTouch ? 'touchmove' : 'mousemove';
            const end = this.#isTouch ? 'touchend' : 'mouseup';
            document.addEventListener(move, this.#boundHandleVolumeDrag);
            document.addEventListener(end, this.#boundHandleVolumeDragEnd, { once: true });
        }
        #handleVolumeDragEnd() {
            this.#isDraggingVolume = false;
            document.removeEventListener(this.#isTouch ? 'touchmove' : 'mousemove', this.#boundHandleVolumeDrag);
        }

        // --- Controls & Animations ---
        
        #startProgressLoop() { 
            this.#stopProgressLoop(); 
            const loop = () => { 
                this.#updateProgressBar(); 
                if (this.#container.classList.contains('ambient-mode-on')) this.#updateAmbientEffect();
                this.#animationFrameId = requestAnimationFrame(loop); 
            }; 
            this.#animationFrameId = requestAnimationFrame(loop); 
        }
        #stopProgressLoop() { cancelAnimationFrame(this.#animationFrameId); }
        
        #showControls() {
            clearTimeout(this.#controlsTimeout);
            this.#container.classList.remove('no-cursor');
            this.#videoControls.classList.add('visible');
            this.#container.classList.add('controls-visible');
            if (!this.#video.paused) this.#controlsTimeout = setTimeout(() => this.#hideControls(), 3000);
        }
        #hideControls(force = false) {
            if (!force && (this.#isScrubbing || this.#settingsMenu.classList.contains('visible') || this.#video.paused)) return;
            this.#videoControls.classList.remove('visible');
            this.#container.classList.remove('controls-visible');
            if (!this.#isTouch) this.#container.classList.add('no-cursor');
        }

        #showIndicator(iconName) {
            clearTimeout(this.#indicatorTimeout);
            const path = this.#ICON_PATHS[iconName];
            if (!path) return;
            this.#indicatorIcon.innerHTML = `<path d="${path}"></path>`;
            this.#indicator.classList.add('visible');
            this.#indicatorTimeout = setTimeout(() => this.#indicator.classList.remove('visible'), 600);
        }

        // --- Features ---

        #handleDownloadVideo() {
            if (!this.#video.currentSrc || this.#downloadBtn.classList.contains('disabled')) return;
            const videoUrl = this.#video.currentSrc;
            const filename = videoUrl.split('/').pop().split('?')[0] || 'video.mp4';
            
            // Replaced fetch logic with safer anchor logic to prevent memory crashes on large files
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = filename;
            a.target = '_blank'; // Fallback for CORS restricted downloads
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => document.body.removeChild(a), 100);
        }

        #handleTrackChange() { 
            const hasTracks = this.#video.textTracks?.length > 0;
            this.#captionsBtn.style.display = hasTracks ? 'flex' : 'none';
            this.#captionsMenuBtn.style.display = hasTracks ? 'flex' : 'none';
            this.#populateCaptionsMenu(); 
        }
        #populateCaptionsMenu() {
            this.#captionsTrackList.innerHTML = '';
            this.#captionsTrackList.appendChild(this.#createMenuItem('Off', -1));
            Array.from(this.#video.textTracks).forEach((track, index) => {
                if (track.kind !== 'metadata') {
                    this.#captionsTrackList.appendChild(this.#createMenuItem(track.label || `Track ${index + 1}`, index, 'trackIndex'));
                    track.mode = 'hidden';
                }
            });
            this.#updateActiveCaptionIndicator();
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
            this.#captionsTrackList.querySelectorAll('.menu-item').forEach(btn => {
                const isOn = parseInt(btn.dataset.trackIndex, 10) === this.#activeTrackIndex;
                btn.classList.toggle('active', isOn);
                btn.querySelector('.check-mark').textContent = isOn ? '✓' : '';
            });
        }
        
        #handleQualitySourceChange() { 
            const hasMulti = this.#video.querySelectorAll('source').length > 1;
            this.#qualityMenuBtn.style.display = hasMulti ? 'flex' : 'none';
            this.#populateQualityMenu(); 
        }
        #populateQualityMenu() {
            this.#qualityMenuList.innerHTML = '';
            Array.from(this.#video.querySelectorAll('source')).forEach((src, idx) => {
                const label = src.dataset.label || `${src.getAttribute('size')}p`;
                this.#qualityMenuList.appendChild(this.#createMenuItem(label, idx, 'qualityIndex'));
            });
            this.#updateActiveQualityIndicator();
        }
        #setQuality(index) {
            const sources = this.#video.querySelectorAll('source');
            const newSrc = sources[parseInt(index, 10)];
            if (!newSrc || this.#video.currentSrc.endsWith(newSrc.getAttribute('src'))) return;
            const curTime = this.#video.currentTime;
            const paused = this.#video.paused;
            this.#video.src = newSrc.getAttribute('src');
            this.#video.load();
            this.#video.currentTime = curTime;
            if (!paused) this.#video.play();
            this.#updateActiveQualityIndicator();
            this.#closeAllMenus();
        }
        #updateActiveQualityIndicator() {
            const sources = Array.from(this.#video.querySelectorAll('source'));
            let activeIdx = sources.findIndex(s => this.#video.currentSrc.endsWith(s.getAttribute('src')));
            this.#qualityMenuList.querySelectorAll('.menu-item').forEach(btn => {
                const isOn = parseInt(btn.dataset.qualityIndex, 10) === activeIdx;
                btn.classList.toggle('active', isOn);
                btn.querySelector('.check-mark').textContent = isOn ? '✓' : '';
            });
            const status = activeIdx > -1 ? (sources[activeIdx].dataset.label || `${sources[activeIdx].getAttribute('size')}p`) : 'Auto';
            this.#qualityStatus.innerHTML = `${status} <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>`;
        }
        
        async #initializeAudioBooster() {
            if (this.#mediaSource) return true;
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return false;
                if (!CustomVideoPlayer.#audioContext) CustomVideoPlayer.#audioContext = new AC();
                if (CustomVideoPlayer.#audioContext.state === 'suspended') await CustomVideoPlayer.#audioContext.resume();
                this.#mediaSource = CustomVideoPlayer.#audioContext.createMediaElementSource(this.#video);
                this.#boosterGainNode = CustomVideoPlayer.#audioContext.createGain();
                this.#boosterGainNode.gain.value = 1;
                this.#mediaSource.connect(this.#boosterGainNode).connect(CustomVideoPlayer.#audioContext.destination);
                return true;
            } catch (e) {
                console.error("Audio Booster error:", e);
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

        #toggleAmbientMode() {
            const isEnabled = this.#container.classList.toggle('ambient-mode-on');
            this.#ambientStatus.textContent = isEnabled ? 'On' : 'Off';
            this.#saveSingleSetting('ambient-mode', isEnabled);
            if (isEnabled && !this.#video.paused) this.#startProgressLoop();
        }

        #updateAmbientEffect() {
            if (this.#ambientCanvas.width !== this.#ambientCanvas.offsetWidth) {
                 this.#ambientCanvas.width = this.#ambientCanvas.offsetWidth;
                 this.#ambientCanvas.height = this.#ambientCanvas.offsetHeight;
            }
            this.#ambientCtx.drawImage(this.#video, 0, 0, this.#ambientCanvas.width, this.#ambientCanvas.height);
        }

        #initializeCasting() {
            if (window.WebKitPlaybackTargetAvailabilityEvent) {
                this.#video.addEventListener('webkitplaybacktargetavailabilitychanged', e => {
                    this.#airplayBtn.style.display = e.availability === 'available' ? 'flex' : 'none';
                    this.#airplayBtn.onclick = () => this.#video.webkitShowPlaybackTargetPicker();
                });
            }
            if (window.chrome && window.chrome.cast) this.#castBtn.style.display = 'flex';
        }

        async #loadVttThumbnails() {
            const track = Array.from(this.#video.textTracks).find(t => t.kind === 'metadata');
            if (!track) return;
            if (track.mode === 'disabled') track.mode = 'hidden'; 
            if (track.cues && track.cues.length === 0) await new Promise(r => track.addEventListener('load', r, { once: true }));
            
            const cues = Array.from(track.cues || []);
            if (cues.length === 0) return;

            const urlRegex = /(.+?)#xywh=(\d+),(\d+),(\d+),(\d+)/;
            const spriteUrl = cues[0].text.match(urlRegex)?.[1];
            if (!spriteUrl) return;

            this.#vttThumbnails = [];
            this.#thumbnailSprite = new Image();
            this.#thumbnailSprite.src = spriteUrl;

            cues.forEach(cue => {
                const m = cue.text.match(urlRegex);
                if (m) this.#vttThumbnails.push({ start: cue.startTime, end: cue.endTime, x: +m[2], y: +m[3], w: +m[4], h: +m[5] });
            });
        }

        // --- Settings & Persistence ---

        #handleMenuClick(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            const target = btn.dataset.targetPanel;
            if (target) this.#navigateMenu(target);
            else if (btn.dataset.trackIndex) this.#setCaptionTrack(btn.dataset.trackIndex);
            else if (btn.dataset.qualityIndex) this.#setQuality(btn.dataset.qualityIndex);
            else if (btn.classList.contains('volume-booster-toggle')) this.#toggleVolumeBooster();
            else if (btn.classList.contains('ambient-mode-toggle')) this.#toggleAmbientMode();
        }

        #toggleMenu(menu, btn) { 
            const visible = menu.classList.toggle('visible'); 
            btn.classList.toggle('menu-open', visible); 
            if (visible) this.#showControls(); else { if (menu === this.#settingsMenu) this.#navigateMenu('main'); this.#hideControls(); } 
        }
        #closeAllMenus() { this.#settingsMenu.classList.remove('visible'); this.#settingsBtn.classList.remove('menu-open'); this.#navigateMenu('main'); }
        #navigateMenu(name) { 
            const idx = { 'main': 0, 'speed': 1, 'captions-track': 2, 'captions-style': 3, 'quality': 4 }[name] || 0;
            this.#menuPanelsWrapper.style.transform = `translateX(-${idx * 100}%)`; 
        }
        #handleCaptionInputChange(e) {
            const input = e.currentTarget;
            const setting = input.dataset.setting;
            let val;
            if (input.id === 'caption-bg-color') {
                val = this.#hexToRgba(input.value, parseInt(this.#container.querySelector('#caption-bg-opacity').value, 10) / 100);
            } else if (input.id === 'caption-bg-opacity') {
                val = this.#hexToRgba(this.#container.querySelector('#caption-bg-color').value, parseInt(input.value, 10) / 100);
            } else {
                val = input.value + (input.dataset.unit || '');
            }
            this.#container.style.setProperty(`--${setting}`, val);
            this.#saveSingleSetting(setting, val);
        }

        #saveSingleSetting(key, val) {
            try {
                const s = JSON.parse(localStorage.getItem(CustomVideoPlayer.#PLAYER_SETTINGS_KEY)) || {};
                s[key] = val;
                localStorage.setItem(CustomVideoPlayer.#PLAYER_SETTINGS_KEY, JSON.stringify(s));
            } catch (e) {}
        }
        #loadSettings() {
            try {
                const saved = JSON.parse(localStorage.getItem(CustomVideoPlayer.#PLAYER_SETTINGS_KEY));
                const defs = { 'primary-color': '#ff4081', 'caption-font-family': 'Arial', 'caption-font-size': '22px', 'caption-font-color': '#ffffff', 'caption-bg-color': 'rgba(0, 0, 0, 0.75)', 'ambient-mode': false };
                const s = { ...defs, ...(saved || {}) };
                for (const k in s) { 
                    if (k === 'ambient-mode') { if (s[k]) this.#toggleAmbientMode(); }
                    else this.#container.style.setProperty(`--${k}`, s[k]); 
                }
                this.#updateSettingsUI(s);
            } catch (e) {}
        }
        #saveVolume() { localStorage.setItem(CustomVideoPlayer.#PLAYER_VOLUME_KEY, JSON.stringify({ volume: this.#video.volume, muted: this.#video.muted })); }
        #loadVolume() {
            try {
                const s = JSON.parse(localStorage.getItem(CustomVideoPlayer.#PLAYER_VOLUME_KEY));
                if (s) { this.#video.volume = s.volume; this.#video.muted = s.muted; }
            } catch (e) {}
        }
        #updateSettingsUI(s) {
            this.#captionSettingInputs.forEach(i => {
                const k = i.dataset.setting;
                let v = s[k];
                if (!v) return;
                if (i.dataset.isOpacity) {
                    const m = v.match(/rgba?\(.+,\s*([\d.]+)\)/);
                    if (m) i.value = Math.round(parseFloat(m[1]) * 100);
                } else if (i.type === 'color' && v.startsWith('rgba')) {
                    const [r, g, b] = v.match(/\d+/g);
                    i.value = `#${[r,g,b].map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
                } else {
                    i.value = v.replace(/px$/, '');
                }
            });
        }

        // --- Helpers ---
        #getEventX(e, isEnd = false) { return (isEnd ? (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) : (e.touches ? e.touches[0].clientX : e.clientX)); }
        #createMenuItem(lbl, idx, attr = 'trackIndex') { const b = document.createElement('button'); b.className = 'menu-item'; b.dataset[attr] = idx; b.innerHTML = `<span class="check-mark"></span> ${lbl}`; return b; }
        #hexToRgba(hex, alpha) { const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16)); return `rgba(${r}, ${g}, ${b}, ${alpha})`; }
        #formatDisplayTime(sec) { if (isNaN(sec)) return '00:00'; const d = new Date(sec * 1000); const s = d.toISOString().slice(11, 19); return (this.#video.duration || 0) >= 3600 ? s : s.slice(3); }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('video.goku-player, video.cvp, video.gplr, video.plr, video.player, video.video, video.vp').forEach(v => new CustomVideoPlayer(v));
    });

})();
