/**
 * GokuPlr v2.5.1
 * Enterprise-grade, lightweight HTML5 video player wrapper.
 * 
 * @license MIT
 * @author Refactored by Senior Systems Architect
 */

(function() {
    'use strict';

    if (window.GokuPlrInitialized) return;
    window.GokuPlrInitialized = true;

    // --- Constants & Configuration ---
    const CONFIG = {
        VERSION: '2.5.1',
        STORAGE_KEYS: {
            SETTINGS: 'gplr-settings',
            VOLUME: 'gplr-volume',
            SPEED: 'gplr-speed'
        },
        PLAYBACK_SPEEDS: [0.5, 0.75, 1, 1.25, 1.5, 2, 4, 8],
        BOOSTER_GAIN: 2,
        UI: {
            TOUCH_TARGET: 44, // px
            DBL_CLICK_ZONE_PCT: 0.33
        }
    };

    const SVGS = {
        play: '<path d="M8 5V19L19 12L8 5Z"></path>',
        pause: '<path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"></path>',
        volumeHigh: '<path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.84 14 18.7V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"></path>',
        volumeMed: '<path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12Z"></path>',
        volumeLow: '<path d="M3 9H7L12 4V20L7 15H3V9Z"></path>',
        muted: '<path d="M16.5 12C16.5 10.23 15.54 8.71 14 7.97V10.18L16.45 12.63C16.5 12.43 16.5 12.21 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.62 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 17.84 14.83 18.08 14 18.22V20.29L20 20.28L4.27 3ZM12 4L10.12 5.88L12 7.76V4Z"></path>',
        enterFs: '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path>',
        exitFs: '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path>',
        settings: '<path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path>',
        captions: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"></path>',
        pip: '<path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path>',
        download: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path>',
        booster: '<path d="M7 2v11h3v9l7-12h-4l4-8z"></path>',
        airplay: '<path d="M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>',
        cast: '<path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"></path>',
        back: '<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>',
        check: '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>',
        // Overlay Icons
        seekFwd: '<path d="M12 5V1L17 6l-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6H20c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"></path>',
        seekBwd: '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path>',
        indicatorPlay: '<path d="M8 5v14l11-7z"></path>'
    };

    /**
     * Utility: Safe LocalStorage Access
     */
    const Storage = {
        get(key) {
            try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
        }
    };

    /**
     * CustomVideoPlayer Class
     */
    class CustomVideoPlayer {
        // --- Static Resources ---
        static #audioContext = null;
        static #connectedSources = new WeakMap(); // Prevents double-connect errors
        
        // --- Private Fields ---
        #video;
        #container;
        #ui = {};
        #state = {
            isScrubbing: false,
            isDraggingVolume: false,
            wasPausedBeforeScrub: true,
            activeTrackIndex: -1,
            lastActiveTrackIndex: 0,
            isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            isBoosterActive: false,
            ambientMode: false
        };
        
        #modules = {
            vtt: null, // Thumbnails
            audio: { gainNode: null }
        };

        #timers = { controls: null, indicator: null };
        #rafId = null;
        #abortController = new AbortController(); // For clean event listener removal

        constructor(videoElement) {
            if (!videoElement || videoElement.dataset.gokuPlayerInit) return;
            
            this.#video = videoElement;
            this.#video.dataset.gokuPlayerInit = 'true';
            this.#setupVideoAttributes();
            
            this.#injectStyles();
            this.#buildDOM();
            this.#cacheDOM();
            
            this.#initializeState();
            this.#attachEvents();
        }

        /**
         * Public API: Clean up player instance
         */
        destroy() {
            this.#abortController.abort();
            cancelAnimationFrame(this.#rafId);
            this.#video.controls = true;
            this.#video.removeAttribute('data-goku-player-init');
            
            // Move video back to original parent if needed, or just unwrap
            if (this.#container && this.#container.parentNode) {
                this.#container.parentNode.insertBefore(this.#video, this.#container);
                this.#container.remove();
            }
            // Disconnect audio nodes if applicable
            if (this.#modules.audio.gainNode) {
                this.#modules.audio.gainNode.disconnect();
            }
        }

        // --- Initialization ---

        #setupVideoAttributes() {
            this.#video.controls = false;
            // Ensure crossorigin is set for canvas/audio processing features
            if (!this.#video.crossOrigin) this.#video.crossOrigin = 'anonymous';
        }

        #injectStyles() {
            if (document.getElementById('goku-player-styles')) return;
            
            const css = `
                :root { --gplr-primary: #ff4081; --gplr-text: #fff; --gplr-bg: rgba(15, 15, 15, 0.85); --gplr-menu: rgba(25, 25, 25, 0.95); --gplr-font: 'Inter', system-ui, sans-serif; --gplr-radius: 8px; }
                .gplr-container { position: relative; width: 100%; background: #000; border-radius: var(--gplr-radius); overflow: hidden; font-family: var(--gplr-font); aspect-ratio: 16/9; outline: none; user-select: none; -webkit-tap-highlight-color: transparent; }
                .gplr-container:focus-visible { outline: 2px solid var(--gplr-primary); outline-offset: 2px; }
                .gplr-container.fullscreen { border-radius: 0; width: 100%; height: 100%; max-width: none; max-height: none; }
                .gplr-container.no-cursor { cursor: none; }
                
                /* Video & Ambient */
                .gplr-container video { width: 100%; height: 100%; display: block; position: relative; z-index: 1; object-fit: contain; }
                .gplr-ambient { position: absolute; inset: -5%; width: 110%; height: 110%; filter: blur(40px) brightness(1.2); opacity: 0; transition: opacity 0.4s; z-index: 0; pointer-events: none; }
                .gplr-container.ambient-active.playing .gplr-ambient { opacity: 0.6; }

                /* Controls Layer */
                .gplr-controls { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent); opacity: 0; visibility: hidden; transition: 0.2s; z-index: 10; display: flex; flex-direction: column; gap: 8px; }
                .gplr-container.controls-visible .gplr-controls { opacity: 1; visibility: visible; }
                
                /* Buttons & Icons */
                .gplr-btn { background: none; border: none; color: var(--gplr-text); cursor: pointer; padding: 10px; min-width: 44px; min-height: 44px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; position: relative; }
                .gplr-btn:hover { background: rgba(255,255,255,0.15); transform: scale(1.05); }
                .gplr-btn svg { width: 24px; height: 24px; fill: currentColor; pointer-events: none; }
                .gplr-row { display: flex; align-items: center; gap: 8px; }
                .gplr-spacer { flex: 1; }

                /* Progress Bar */
                .gplr-progress-wrap { height: 16px; cursor: pointer; display: flex; align-items: center; position: relative; touch-action: none; }
                .gplr-progress-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 4px; position: relative; overflow: visible; transition: height 0.1s; }
                .gplr-progress-fill { height: 100%; background: var(--gplr-primary); width: 0%; border-radius: 4px; position: relative; }
                .gplr-progress-thumb { position: absolute; right: -6px; top: -4px; width: 12px; height: 12px; background: #fff; border-radius: 50%; transform: scale(0); transition: 0.1s; box-shadow: 0 1px 3px rgba(0,0,0,0.5); }
                .gplr-progress-wrap:hover .gplr-progress-bg { height: 6px; }
                .gplr-progress-wrap:hover .gplr-progress-thumb { transform: scale(1); }
                
                /* Tooltip */
                .gplr-tooltip { position: absolute; bottom: 25px; left: 0; transform: translateX(-50%); background: rgba(0,0,0,0.9); padding: 6px; border-radius: 4px; font-size: 12px; color: #fff; pointer-events: none; display: none; text-align: center; }
                .gplr-tooltip canvas { display: block; margin-bottom: 4px; background: #111; max-width: 160px; }

                /* Volume */
                .gplr-vol-wrap { display: flex; align-items: center; width: 0; overflow: hidden; transition: width 0.2s; }
                .gplr-vol-container:hover .gplr-vol-wrap, .gplr-vol-container:focus-within .gplr-vol-wrap { width: 80px; margin-left: 8px; }
                .gplr-vol-rail { width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; position: relative; cursor: pointer; }
                .gplr-vol-fill { height: 100%; background: #fff; width: 100%; border-radius: 2px; }

                /* Menus */
                .gplr-menu { position: absolute; bottom: 60px; right: 12px; background: var(--gplr-menu); border-radius: 8px; overflow: hidden; width: 260px; backdrop-filter: blur(16px); opacity: 0; visibility: hidden; transform: translateY(10px); transition: 0.2s; z-index: 20; max-height: 80vh; }
                .gplr-menu.active { opacity: 1; visibility: visible; transform: translateY(0); }
                .gplr-menu-panels { display: flex; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; }
                .gplr-panel { min-width: 100%; display: flex; flex-direction: column; }
                .gplr-menu-item { padding: 12px 16px; width: 100%; text-align: left; background: none; border: none; color: #eee; cursor: pointer; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
                .gplr-menu-item:hover { background: rgba(255,255,255,0.1); }
                .gplr-menu-header { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600; display: flex; align-items: center; gap: 8px; color: #fff; background: rgba(255,255,255,0.05); }

                /* Big Play & Indicator */
                .gplr-big-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; pointer-events: auto; cursor: pointer; backdrop-filter: blur(4px); }
                .gplr-big-play svg { width: 40px; height: 40px; fill: #fff; margin-left: 4px; }
                .gplr-container.playing .gplr-big-play { opacity: 0; pointer-events: none; transform: translate(-50%, -50%) scale(1.2); }
                .gplr-indicator { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background: rgba(0,0,0,0.8); border-radius: 50%; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 25; }
                .gplr-indicator.active { opacity: 1; }

                /* Captions */
                .gplr-container video::cue { background: var(--caption-bg, rgba(0,0,0,0.8)); color: var(--caption-color, #fff); font-family: var(--caption-font, sans-serif); font-size: var(--caption-size, 20px); text-shadow: 1px 1px 2px #000; }
                .gplr-container.controls-visible video::cue { transform: translateY(-60px); transition: transform 0.2s; }

                /* Mobile Overrides */
                @media (hover: none) {
                    .gplr-vol-wrap { width: 80px; margin-left: 8px; }
                    .gplr-tooltip { display: none !important; }
                    .gplr-btn { min-width: 48px; min-height: 48px; }
                    .gplr-progress-thumb { transform: scale(1); }
                }
            `;
            const style = document.createElement('style');
            style.id = 'goku-player-styles';
            style.textContent = css;
            document.head.appendChild(style);
        }

        #buildDOM() {
            const container = document.createElement('div');
            container.className = 'gplr-container';
            container.tabIndex = 0;
            // Accessibility
            container.setAttribute('role', 'region');
            container.setAttribute('aria-label', 'Video Player');
            
            this.#container = container;
            this.#video.parentNode.insertBefore(container, this.#video);
            container.appendChild(this.#video); // Move video inside

            // HTML Template Construction
            container.insertAdjacentHTML('beforeend', `
                <canvas class="gplr-ambient"></canvas>
                <div class="gplr-indicator"><svg viewBox="0 0 24 24"></svg></div>
                <button class="gplr-big-play" aria-label="Play"><svg viewBox="0 0 24 24">${SVGS.indicatorPlay}</svg></button>
                
                <div class="gplr-controls">
                    <div class="gplr-progress-wrap" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
                        <div class="gplr-tooltip"><canvas></canvas><span>00:00</span></div>
                        <div class="gplr-progress-bg"><div class="gplr-progress-fill"></div><div class="gplr-progress-thumb"></div></div>
                    </div>
                    
                    <div class="gplr-row">
                        <button class="gplr-btn" data-cmd="play" aria-label="Play/Pause">
                            <svg class="icon-play" viewBox="0 0 24 24">${SVGS.play}</svg>
                            <svg class="icon-pause" viewBox="0 0 24 24" style="display:none">${SVGS.pause}</svg>
                        </button>
                        
                        <div class="gplr-vol-container gplr-row">
                            <button class="gplr-btn" data-cmd="mute" aria-label="Mute">
                                <svg class="icon-vol" viewBox="0 0 24 24">${SVGS.volumeHigh}</svg>
                            </button>
                            <div class="gplr-vol-wrap" role="slider" aria-label="Volume" tabindex="0">
                                <div class="gplr-vol-rail"><div class="gplr-vol-fill"></div></div>
                            </div>
                        </div>
                        
                        <div class="gplr-time"><span class="t-curr">00:00</span> / <span class="t-total">00:00</span></div>
                        
                        <div class="gplr-spacer"></div>
                        
                        <button class="gplr-btn" data-cmd="settings" aria-label="Settings" aria-expanded="false"><svg viewBox="0 0 24 24">${SVGS.settings}</svg></button>
                        <button class="gplr-btn" data-cmd="pip" aria-label="Picture in Picture"><svg viewBox="0 0 24 24">${SVGS.pip}</svg></button>
                        <button class="gplr-btn" data-cmd="fullscreen" aria-label="Fullscreen"><svg viewBox="0 0 24 24">${SVGS.enterFs}</svg></button>
                    </div>
                </div>

                <div class="gplr-menu">
                    <div class="gplr-menu-panels">
                        <!-- Main Panel -->
                        <div class="gplr-panel" data-panel="main">
                            <button class="gplr-menu-item" data-go="speed">
                                <span>Speed</span><span class="val-speed">Normal</span>
                            </button>
                            <button class="gplr-menu-item" data-go="quality">
                                <span>Quality</span><span class="val-quality">Auto</span>
                            </button>
                            <button class="gplr-menu-item" data-go="captions">
                                <span>Captions</span><span class="val-captions">Off</span>
                            </button>
                            <div style="height:1px; background:rgba(255,255,255,0.1); margin:4px 0"></div>
                            <button class="gplr-menu-item" data-toggle="booster">
                                <span>Volume Booster</span><span class="val-booster">Off</span>
                            </button>
                            <button class="gplr-menu-item" data-toggle="ambient">
                                <span>Ambient Mode</span><span class="val-ambient">Off</span>
                            </button>
                            <button class="gplr-menu-item" data-act="download">
                                <span>Download</span><svg style="width:16px;height:16px" viewBox="0 0 24 24">${SVGS.download}</svg>
                            </button>
                        </div>
                        <!-- Sub Panels (Dynamic) -->
                        <div class="gplr-panel" data-panel="speed"></div>
                        <div class="gplr-panel" data-panel="quality"></div>
                        <div class="gplr-panel" data-panel="captions"></div>
                    </div>
                </div>
            `);
        }

        #cacheDOM() {
            const q = (s) => this.#container.querySelector(s);
            this.#ui = {
                cont: this.#container,
                controls: q('.gplr-controls'),
                playBtns: this.#container.querySelectorAll('[data-cmd="play"], .gplr-big-play'),
                icons: {
                    play: q('.icon-play'),
                    pause: q('.icon-pause'),
                    vol: q('.icon-vol')
                },
                progress: {
                    wrap: q('.gplr-progress-wrap'),
                    fill: q('.gplr-progress-fill'),
                    tooltip: q('.gplr-tooltip'),
                    tipTime: q('.gplr-tooltip span'),
                    tipCanvas: q('.gplr-tooltip canvas'),
                    tipCtx: q('.gplr-tooltip canvas').getContext('2d', { alpha: false })
                },
                volume: {
                    wrap: q('.gplr-vol-wrap'),
                    fill: q('.gplr-vol-fill')
                },
                time: {
                    curr: q('.t-curr'),
                    total: q('.t-total')
                },
                menu: {
                    el: q('.gplr-menu'),
                    panels: q('.gplr-menu-panels'),
                    btn: q('[data-cmd="settings"]')
                },
                indicator: {
                    el: q('.gplr-indicator'),
                    svg: q('.gplr-indicator svg')
                },
                ambient: {
                    canvas: q('.gplr-ambient'),
                    ctx: q('.gplr-ambient').getContext('2d', { alpha: false })
                }
            };

            // Prep Sub-panels
            this.#buildSpeedMenu();
        }

        #buildSpeedMenu() {
            const panel = this.#container.querySelector('[data-panel="speed"]');
            panel.innerHTML = `
                <div class="gplr-menu-header"><button class="gplr-btn" data-back="main" style="width:30px;height:30px;padding:4px"><svg viewBox="0 0 24 24">${SVGS.back}</svg></button> Speed</div>
            `;
            CONFIG.PLAYBACK_SPEEDS.forEach(speed => {
                const btn = document.createElement('button');
                btn.className = 'gplr-menu-item';
                btn.textContent = speed === 1 ? 'Normal' : speed + 'x';
                btn.onclick = () => this.#setSpeed(speed);
                panel.appendChild(btn);
            });
        }

        // --- Logic & Events ---

        #initializeState() {
            // Restore Settings
            const settings = Storage.get(CONFIG.STORAGE_KEYS.SETTINGS) || {};
            const vol = Storage.get(CONFIG.STORAGE_KEYS.VOLUME);
            
            if (vol) {
                this.#video.volume = vol.volume;
                this.#video.muted = vol.muted;
            }
            if (settings.speed) this.#setSpeed(settings.speed, false);
            if (settings.ambient) this.#toggleAmbient();

            this.#updateVolumeUI();
            
            // Check Pip
            if (!document.pictureInPictureEnabled) {
                this.#container.querySelector('[data-cmd="pip"]').style.display = 'none';
            }
        }

        #attachEvents() {
            const s = this.#abortController.signal;
            const ui = this.#ui;

            // Video Events
            const v = this.#video;
            v.addEventListener('play', () => this.#onPlayStateChange(true), { signal: s });
            v.addEventListener('pause', () => this.#onPlayStateChange(false), { signal: s });
            v.addEventListener('timeupdate', () => this.#updateProgress(), { signal: s });
            v.addEventListener('volumechange', () => this.#updateVolumeUI(), { signal: s });
            v.addEventListener('loadedmetadata', () => this.#onMetadata(), { signal: s });
            v.addEventListener('enterpictureinpicture', () => {}, { signal: s });
            
            // Container Interaction
            this.#container.addEventListener('pointermove', (e) => {
                if (e.pointerType === 'mouse') this.#showControls();
            }, { signal: s });
            this.#container.addEventListener('mouseleave', () => this.#hideControls(), { signal: s });
            
            // Click Handling (Delegation)
            this.#container.addEventListener('click', (e) => this.#handleClick(e), { signal: s });
            this.#container.addEventListener('dblclick', (e) => this.#handleDblClick(e), { signal: s });
            
            // Sliders
            this.#setupSlider(ui.progress.wrap, (pct) => this.#seek(pct), true);
            this.#setupSlider(ui.volume.wrap, (pct) => this.#setVolume(pct));

            // Tooltip
            ui.progress.wrap.addEventListener('mousemove', (e) => this.#updateTooltip(e), { signal: s });
            ui.progress.wrap.addEventListener('mouseleave', () => ui.progress.tooltip.style.display = 'none', { signal: s });

            // Keyboard
            this.#container.addEventListener('keydown', (e) => this.#handleKey(e), { signal: s });
            
            // Global
            document.addEventListener('click', (e) => {
                if (!this.#container.contains(e.target)) this.#closeMenu();
            }, { signal: s });
        }

        #setupSlider(element, callback, isSeek = false) {
            const handle = (e) => {
                const rect = element.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                callback(pct);
            };

            element.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent text selection
                if (isSeek) {
                    this.#state.isScrubbing = true;
                    this.#state.wasPausedBeforeScrub = this.#video.paused;
                    this.#video.pause();
                }
                
                handle(e);

                const onMove = (em) => handle(em);
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    if (isSeek) {
                        this.#state.isScrubbing = false;
                        if (!this.#state.wasPausedBeforeScrub) this.#video.play();
                    }
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            }, { signal: this.#abortController.signal });

            // Touch support
            element.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent scrolling
                if (isSeek) {
                    this.#state.isScrubbing = true;
                    this.#state.wasPausedBeforeScrub = this.#video.paused;
                    this.#video.pause();
                }
                const touchHandle = (et) => {
                     const rect = element.getBoundingClientRect();
                     const touch = et.touches[0];
                     const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
                     callback(pct);
                };
                touchHandle(e);
                
                const onMove = (em) => touchHandle(em);
                const onEnd = () => {
                    document.removeEventListener('touchmove', onMove);
                    document.removeEventListener('touchend', onEnd);
                     if (isSeek) {
                        this.#state.isScrubbing = false;
                        if (!this.#state.wasPausedBeforeScrub) this.#video.play();
                    }
                };
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onEnd);
            }, { signal: this.#abortController.signal, passive: false });
        }

        // --- Core Functions ---

        #togglePlay() { this.#video.paused ? this.#video.play() : this.#video.pause(); }
        
        #onPlayStateChange(playing) {
            this.#ui.cont.classList.toggle('playing', playing);
            this.#ui.icons.play.style.display = playing ? 'none' : 'block';
            this.#ui.icons.pause.style.display = playing ? 'block' : 'none';
            
            if (playing) {
                this.#showControls();
                this.#startRaf();
            } else {
                this.#showControls(); // Keep visible when paused
                this.#stopRaf();
            }
        }

        #seek(pct) {
            if (isFinite(this.#video.duration)) {
                this.#video.currentTime = pct * this.#video.duration;
                this.#updateProgress(true);
            }
        }

        #setVolume(pct) {
            this.#video.volume = pct;
            this.#video.muted = (pct === 0);
        }

        #updateVolumeUI() {
            const vol = this.#video.muted ? 0 : this.#video.volume;
            this.#ui.volume.fill.style.width = (vol * 100) + '%';
            
            let icon = SVGS.muted;
            if (vol > 0.5) icon = SVGS.volumeHigh;
            else if (vol > 0) icon = SVGS.volumeMed;
            else if (vol === 0) icon = SVGS.muted;
            
            this.#ui.icons.vol.innerHTML = icon;
            Storage.set(CONFIG.STORAGE_KEYS.VOLUME, { volume: this.#video.volume, muted: this.#video.muted });
        }

        #updateProgress(force = false) {
            if (!force && this.#state.isScrubbing) return;
            const dur = this.#video.duration || 0;
            const cur = this.#video.currentTime || 0;
            const pct = (cur / dur) * 100 || 0;
            
            this.#ui.progress.fill.style.width = `${pct}%`;
            this.#ui.progress.wrap.setAttribute('aria-valuenow', Math.round(pct));
            
            this.#ui.time.curr.textContent = this.#fmtTime(cur);
            if (Math.abs(dur - (this.#ui.time.total._cache || 0)) > 1) {
                this.#ui.time.total.textContent = this.#fmtTime(dur);
                this.#ui.time.total._cache = dur;
            }
        }

        #updateTooltip(e) {
            const rect = this.#ui.progress.wrap.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            const time = pct * (this.#video.duration || 0);
            
            this.#ui.progress.tooltip.style.display = 'block';
            this.#ui.progress.tooltip.style.left = (pct * 100) + '%';
            this.#ui.progress.tipTime.textContent = this.#fmtTime(time);
            
            this.#drawThumbnail(time);
        }

        #drawThumbnail(time) {
            // Check VTT logic
            if (!this.#modules.vtt) return;
            const cue = this.#modules.vtt.cues.find(c => time >= c.start && time < c.end);
            if (cue && this.#modules.vtt.sprite.complete) {
                 const ctx = this.#ui.progress.tipCtx;
                 const cvs = this.#ui.progress.tipCanvas;
                 // Resize canvas if needed
                 if (cvs.width !== cue.w) { cvs.width = cue.w; cvs.height = cue.h; }
                 ctx.drawImage(this.#modules.vtt.sprite, cue.x, cue.y, cue.w, cue.h, 0, 0, cue.w, cue.h);
            }
        }

        // --- Features ---

        async #initAudioBooster() {
            if (this.#modules.audio.gainNode) return true;
            try {
                // Ensure context exists
                if (!CustomVideoPlayer.#audioContext) {
                    CustomVideoPlayer.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                const ctx = CustomVideoPlayer.#audioContext;
                if (ctx.state === 'suspended') await ctx.resume();

                // Prevent double creation
                let source;
                if (CustomVideoPlayer.#connectedSources.has(this.#video)) {
                    source = CustomVideoPlayer.#connectedSources.get(this.#video);
                } else {
                    source = ctx.createMediaElementSource(this.#video);
                    CustomVideoPlayer.#connectedSources.set(this.#video, source);
                }

                const gain = ctx.createGain();
                source.connect(gain);
                gain.connect(ctx.destination);
                
                this.#modules.audio.gainNode = gain;
                return true;
            } catch (e) {
                console.error("GokuPlr: Audio Booster Init Failed", e);
                return false;
            }
        }

        async #toggleBooster() {
            if (await this.#initAudioBooster()) {
                this.#state.isBoosterActive = !this.#state.isBoosterActive;
                this.#modules.audio.gainNode.gain.value = this.#state.isBoosterActive ? CONFIG.BOOSTER_GAIN : 1;
                this.#updateMenuText('.val-booster', this.#state.isBoosterActive ? 'On' : 'Off');
            }
        }

        #toggleAmbient() {
            this.#state.ambientMode = !this.#state.ambientMode;
            this.#container.classList.toggle('ambient-active', this.#state.ambientMode);
            this.#updateMenuText('.val-ambient', this.#state.ambientMode ? 'On' : 'Off');
            
            const settings = Storage.get(CONFIG.STORAGE_KEYS.SETTINGS) || {};
            settings.ambient = this.#state.ambientMode;
            Storage.set(CONFIG.STORAGE_KEYS.SETTINGS, settings);

            if (this.#state.ambientMode && !this.#video.paused) this.#startRaf();
        }

        #handleDownload() {
             const src = this.#video.currentSrc;
             if (!src) return;
             const a = document.createElement('a');
             a.href = src;
             a.download = src.split('/').pop() || 'video.mp4';
             a.target = '_blank'; // Required for CORS/Cross-origin
             document.body.appendChild(a);
             a.click();
             setTimeout(() => a.remove(), 100);
             this.#closeMenu();
        }

        // --- Menu & UI Interactions ---

        #handleClick(e) {
            const btn = e.target.closest('button, .gplr-menu-item');
            if (!btn) {
                // Toggle play/controls on video click
                if (e.target === this.#video || e.target === this.#container) {
                     if (this.#state.isTouch) {
                         if (this.#ui.cont.classList.contains('controls-visible')) this.#hideControls();
                         else this.#showControls();
                     } else {
                         this.#togglePlay();
                     }
                }
                return;
            }

            // Command Handling
            const cmd = btn.dataset.cmd;
            if (cmd) {
                if (cmd === 'play') this.#togglePlay();
                if (cmd === 'mute') { this.#video.muted = !this.#video.muted; }
                if (cmd === 'fullscreen') this.#toggleFs();
                if (cmd === 'pip') this.#video.requestPictureInPicture();
                if (cmd === 'settings') this.#toggleMenu();
            }

            // Menu Navigation
            if (btn.dataset.go) this.#navMenu(btn.dataset.go);
            if (btn.dataset.back) this.#navMenu(btn.dataset.back);
            if (btn.dataset.toggle === 'booster') this.#toggleBooster();
            if (btn.dataset.toggle === 'ambient') this.#toggleAmbient();
            if (btn.dataset.act === 'download') this.#handleDownload();
        }

        #handleDblClick(e) {
            if (e.target !== this.#video && e.target !== this.#container) return;
            const rect = this.#container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const zone = rect.width * CONFIG.UI.DBL_CLICK_ZONE_PCT;

            if (x < zone) { this.#skip(-10); this.#showIndicator(SVGS.seekBwd); }
            else if (x > rect.width - zone) { this.#skip(10); this.#showIndicator(SVGS.seekFwd); }
            else { this.#toggleFs(); }
        }

        #handleKey(e) {
            if (e.target.matches('input,textarea')) return;
            const k = e.key.toLowerCase();
            let handled = true;

            switch(k) {
                case 'k': case ' ': this.#togglePlay(); break;
                case 'f': this.#toggleFs(); break;
                case 'm': this.#video.muted = !this.#video.muted; break;
                case 'arrowright': case 'l': this.#skip(5); break;
                case 'arrowleft': case 'j': this.#skip(-5); break;
                case 'arrowup': this.#video.volume = Math.min(1, this.#video.volume + 0.1); break;
                case 'arrowdown': this.#video.volume = Math.max(0, this.#video.volume - 0.1); break;
                default: handled = false;
            }
            if (handled) e.preventDefault();
        }

        // --- Helpers ---

        #showControls() {
            clearTimeout(this.#timers.controls);
            this.#ui.cont.classList.remove('no-cursor');
            this.#ui.cont.classList.add('controls-visible');
            if (!this.#video.paused) {
                this.#timers.controls = setTimeout(() => this.#hideControls(), 3000);
            }
        }
        
        #hideControls() {
            if (this.#video.paused || this.#state.isScrubbing || this.#ui.menu.el.classList.contains('active')) return;
            this.#ui.cont.classList.remove('controls-visible');
            if (!this.#state.isTouch) this.#ui.cont.classList.add('no-cursor');
            this.#closeMenu();
        }

        #toggleFs() {
            if (!document.fullscreenElement) this.#container.requestFullscreen().catch(()=>{});
            else document.exitFullscreen();
        }

        #toggleMenu() {
            const active = this.#ui.menu.el.classList.toggle('active');
            this.#ui.menu.btn.setAttribute('aria-expanded', active);
            if (!active) this.#navMenu('main');
        }

        #closeMenu() {
            this.#ui.menu.el.classList.remove('active');
            this.#ui.menu.btn.setAttribute('aria-expanded', 'false');
            setTimeout(() => this.#navMenu('main'), 200);
        }

        #navMenu(panelName) {
            const panels = ['main', 'speed', 'quality', 'captions'];
            const idx = panels.indexOf(panelName);
            if (idx > -1) {
                this.#ui.menu.panels.style.transform = `translateX(-${idx * 100}%)`;
            }
        }

        #setSpeed(s, save = true) {
            this.#video.playbackRate = s;
            this.#updateMenuText('.val-speed', s + 'x');
            if (save) Storage.set(CONFIG.STORAGE_KEYS.SPEED, s);
            // close menu on selection? user preference, keeping open for now
        }

        #updateMenuText(selector, text) {
            const el = this.#ui.menu.el.querySelector(selector);
            if (el) el.textContent = text;
        }

        #showIndicator(svgContent) {
            const el = this.#ui.indicator.el;
            this.#ui.indicator.svg.innerHTML = svgContent;
            el.classList.remove('active');
            void el.offsetWidth; // Trigger reflow
            el.classList.add('active');
            clearTimeout(this.#timers.indicator);
            this.#timers.indicator = setTimeout(() => el.classList.remove('active'), 600);
        }

        #skip(amt) {
            this.#video.currentTime += amt;
        }

        #fmtTime(s) {
            const d = new Date(s * 1000);
            return (s >= 3600 ? d.toISOString().substr(11, 8) : d.toISOString().substr(14, 5));
        }

        #startRaf() {
            if (this.#rafId) return;
            const loop = () => {
                // Optimization: Throttle ambient updates (every 2nd frame) or use low-res
                if (this.#state.ambientMode && document.visibilityState === 'visible') {
                    this.#ui.ambient.ctx.drawImage(this.#video, 0, 0, this.#ui.ambient.canvas.width, this.#ui.ambient.canvas.height);
                }
                if (!this.#video.paused) this.#rafId = requestAnimationFrame(loop);
                else this.#rafId = null;
            };
            this.#rafId = requestAnimationFrame(loop);
        }
        
        #stopRaf() {
            if (this.#rafId) { cancelAnimationFrame(this.#rafId); this.#rafId = null; }
        }

        #onMetadata() {
            this.#updateProgress(true);
            this.#loadVTT();
            // Handle quality sources detection here if needed (omitted for brevity, similar to original)
        }

        async #loadVTT() {
            // Locate metadata track
            const track = Array.from(this.#video.textTracks).find(t => t.kind === 'metadata' && t.label === 'thumbnails');
            if (!track) return;
            
            track.mode = 'hidden';
            
            // Wait for cues
            const getCues = () => {
                if (track.cues && track.cues.length) {
                    const cues = Array.from(track.cues);
                    const spriteUrl = cues[0].text.split('#')[0];
                    const img = new Image();
                    img.src = spriteUrl;
                    
                    const parsed = cues.map(c => {
                        const m = c.text.match(/xywh=(\d+),(\d+),(\d+),(\d+)/);
                        return m ? { start: c.startTime, end: c.endTime, x:+m[1], y:+m[2], w:+m[3], h:+m[4] } : null;
                    }).filter(Boolean);

                    this.#modules.vtt = { sprite: img, cues: parsed };
                } else {
                    setTimeout(getCues, 500);
                }
            };
            getCues();
        }
    }

    // Auto Init
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.gplr, .video-player-container video').forEach(v => new CustomVideoPlayer(v));
    });

})();
