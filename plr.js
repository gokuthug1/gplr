/**
 * GokuPlr v3.0.8 (Stable Edition)
 * The definitive HTML5 video player wrapper.
 *
 * Updates v3.0.8:
 * - FIX: Play/Pause icon in control bar now updates correctly (Selector specificity fix).
 * - FIX: Quality menu now reads 'data-quality' attribute to prevent "nullp" labels.
 */

(function() {
    'use strict';

    if (window.GokuPlrInitialized) return;
    window.GokuPlrInitialized = true;

    // --- Configuration & Constants ---
    const CONFIG = {
        VERSION: '3.0.8',
        STORAGE_KEY: 'gplr-state-v3.0.8',
        PLAYBACK_SPEEDS: [0.5, 0.75, 1, 1.25, 1.5, 2, 4, 8], 
        BOOSTER_GAIN: 2.5,
        DEFAULT_COLOR: '#ff4081',
        DEFAULT_UI: {
            captions: true,
            booster: false, 
            pip: true,
            download: true,
            cast: true 
        }
    };

    // Helper to wrap paths in a standard 24x24 SVG
    const mkSvg = (path) => `<svg viewBox="0 0 24 24" fill="currentColor">${path}</svg>`;

    const SVGS = {
        play: mkSvg('<path d="M8 5V19L19 12L8 5Z"></path>'),
        pause: mkSvg('<path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"></path>'),
        volHigh: mkSvg('<path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.84 14 18.7V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"></path>'),
        volMed: mkSvg('<path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.54 8.71 14 7.97V16.02C15.54 15.29 16.5 13.77 16.5 12Z"></path>'),
        volLow: mkSvg('<path d="M3 9H7L12 4V20L7 15H3V9Z"></path>'),
        muted: mkSvg('<path d="M16.5 12C16.5 10.23 15.54 8.71 14 7.97V10.18L16.45 12.63C16.5 12.43 16.5 12.21 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.62 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 17.84 14.83 18.08 14 18.22V20.29L20 20.28L4.27 3ZM12 4L10.12 5.88L12 7.76V4Z"></path>'),
        fullscreen: mkSvg('<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path>'),
        exitFullscreen: mkSvg('<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path>'),
        settings: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>',
        captions: mkSvg('<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"></path>'),
        download: mkSvg('<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path>'),
        back: mkSvg('<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>'),
        check: mkSvg('<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>'),
        indicatorPlay: mkSvg('<path d="M8 5v14l11-7z"></path>'),
        seekFwd: mkSvg('<path d="M12 5V1L17 6l-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6H20c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"></path>'),
        seekBwd: mkSvg('<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path>'),
        booster: mkSvg('<path d="M7 2v11h3v9l7-12h-4l4-8z"></path>'),
        arrowRight: mkSvg('<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>'),
        pip: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path></svg>',
        cast: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"></path></svg>',
        airplay: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 22h12l-6-6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg>'
    };

    const Store = {
        get() { try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || {}; } catch { return {}; } },
        set(data) { try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({ ...this.get(), ...data })); } catch {} }
    };

    class GokuPlr {
        static #audioCtx = null;
        static #connectedVideos = new WeakSet();

        #video;
        #container;
        #ui = {};
        #state = { scrubbing: false, pausedBeforeScrub: true, touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0, booster: false, ambient: false, track: -1, captionsVisible: false };
        #modules = { vtt: null, audioGain: null };
        #timers = {};
        #raf = null;
        #abort = new AbortController();

        constructor(videoEl) {
            if (!videoEl || videoEl.dataset.gplrInit) return;
            this.#video = videoEl;
            this.#video.dataset.gplrInit = 'true';
            this.#video.controls = false;
            if (!this.#video.crossOrigin) this.#video.crossOrigin = 'anonymous';

            this.#injectCSS();
            this.#buildDOM();
            this.#cacheDOM();
            this.#restoreState();
            this.#initEvents();
            
            if (this.#video.readyState >= 1) this.#onMeta();
            if (this.#video.paused) this.#showCtrl(true);
        }

        destroy() {
            this.#abort.abort();
            cancelAnimationFrame(this.#raf);
            if (this.#modules.audioGain) this.#modules.audioGain.disconnect();
            this.#video.controls = true;
            this.#container.replaceWith(this.#video);
        }

        #injectCSS() {
            if (document.getElementById('gplr-css')) return;
            const css = `
                :root { --gplr-primary: #ff4081; --gplr-bg: rgba(20,20,20,0.95); --gplr-txt: #fff; --gplr-rad: 8px; }
                .gplr { position: relative; width: 100%; background: #000; border-radius: var(--gplr-rad); overflow: hidden; font-family: system-ui, sans-serif; aspect-ratio: 16/9; user-select: none; -webkit-tap-highlight-color: transparent; }
                .gplr:focus-visible { outline: 2px solid var(--gplr-primary); }
                .gplr.fullscreen { border-radius: 0; width: 100%; height: 100%; max-width: none; }
                .gplr.hide-cursor { cursor: none; }
                .gplr video { width: 100%; height: 100%; display: block; position: relative; z-index: 1; object-fit: contain; }
                
                /* Ambient */
                .gplr-ambient { position: absolute; inset: -10%; width: 120%; height: 120%; filter: blur(40px) brightness(1.2); opacity: 0; transition: opacity 0.5s; z-index: 0; pointer-events: none; }
                .gplr.ambient-on.playing .gplr-ambient { opacity: 0.5; }
                
                /* Captions */
                .gplr video::cue { background: var(--cap-bg, rgba(0,0,0,0.8)) !important; color: var(--cap-color, #fff) !important; font-family: var(--cap-font, sans-serif) !important; font-size: var(--cap-size, 20px) !important; text-shadow: 1px 1px 2px black; }
                .gplr.ctrl-active video::cue { transform: translateY(-70px); transition: transform 0.2s; }

                /* UI Layer */
                .gplr-ctrl { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); z-index: 10; opacity: 0; visibility: hidden; transition: 0.2s; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
                .gplr.ctrl-active .gplr-ctrl { opacity: 1; visibility: visible; pointer-events: auto; }

                /* Buttons */
                .gplr-btn { background: none; border: none; color: #eee; cursor: pointer; width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.1s; position: relative; }
                .gplr-btn:hover { background: rgba(255,255,255,0.15); color: #fff; transform: scale(1.05); }
                .gplr-btn.active { color: var(--gplr-primary); }
                .gplr-btn svg { width: 24px; height: 24px; pointer-events: none; }
                .gplr-row { display: flex; align-items: center; gap: 6px; }
                .gplr-grow { flex: 1; }

                /* Progress */
                .gplr-prog { height: 16px; cursor: pointer; position: relative; display: flex; align-items: center; touch-action: none; }
                .gplr-prog-track { width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 4px; position: relative; }
                .gplr-prog-fill { height: 100%; background: var(--gplr-primary); width: 0; border-radius: 4px; position: relative; box-shadow: 0 0 10px var(--gplr-primary); }
                .gplr-prog-thumb { position: absolute; right: -6px; top: -4px; width: 12px; height: 12px; background: #fff; border-radius: 50%; transform: scale(0); transition: 0.1s; }
                .gplr-prog:hover .gplr-prog-track { height: 6px; }
                .gplr-prog:hover .gplr-prog-thumb { transform: scale(1); }
                .gplr-tip { position: absolute; bottom: 25px; background: rgba(0,0,0,0.9); padding: 5px; border-radius: 4px; font-size: 12px; color: #fff; pointer-events: none; display: none; transform: translateX(-50%); text-align: center; border: 1px solid rgba(255,255,255,0.2); }
                .gplr-tip canvas { display: block; margin-bottom: 4px; max-width: 160px; background: #000; }

                /* Volume */
                .gplr-vol-wrap { width: 0; overflow: hidden; transition: width 0.2s; display: flex; align-items: center; }
                .gplr-vol-cont:hover .gplr-vol-wrap { width: 80px; margin-left: 8px; }
                .gplr-vol-track { width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; position: relative; cursor: pointer; }
                .gplr-vol-fill { height: 100%; background: #fff; border-radius: 2px; }

                /* Settings Menu */
                .gplr-menu { position: absolute; bottom: 65px; right: 12px; width: 260px; background: var(--gplr-bg); backdrop-filter: blur(12px); border-radius: 8px; overflow: hidden; opacity: 0; visibility: hidden; transform: translateY(10px); transition: 0.2s; z-index: 20; border: 1px solid rgba(255,255,255,0.1); max-height: calc(100% - 80px); overflow-y: auto; }
                .gplr-menu.active { opacity: 1; visibility: visible; transform: translateY(0); }
                .gplr-panels { display: flex; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); align-items: flex-start; }
                .gplr-panel { min-width: 100%; width: 100%; display: flex; flex-direction: column; }
                
                /* Menu Items */
                .gplr-item { padding: 12px 14px; background: none; border: none; color: #eee; cursor: pointer; text-align: left; font-size: 13px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); width: 100%; }
                .gplr-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .gplr-item svg { width: 18px; height: 18px; fill: #ccc; flex-shrink: 0; margin-left: 8px; }
                .gplr-item:hover svg { fill: #fff; }
                .gplr-item .chk svg { fill: var(--gplr-primary); }

                /* Switches for Customize Menu */
                .gplr-switch { width: 34px; height: 18px; background: rgba(255,255,255,0.2); border-radius: 10px; position: relative; transition: .2s; margin-left: auto; }
                .gplr-switch::after { content:''; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: .2s; }
                .gplr-item.active .gplr-switch { background: var(--gplr-primary); }
                .gplr-item.active .gplr-switch::after { transform: translateX(16px); }

                /* Headers & Grids */
                .gplr-head { padding: 10px; background: rgba(255,255,255,0.08); color: #fff; font-weight: 600; display: flex; align-items: center; gap: 10px; font-size: 14px; width: 100%; }
                .gplr-val { color: var(--gplr-primary); font-size: 12px; display: flex; align-items: center; gap: 5px; }
                .gplr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; }
                .gplr-input-grp label { font-size: 11px; color: #aaa; display: block; margin-bottom: 4px; }
                .gplr-input { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px; padding: 4px; font-size: 12px; }
                input[type=color] { height: 30px; padding: 0; border: none; cursor: pointer; }
                
                /* Color Picker specific */
                .gplr-color-pick { width: 40px; height: 24px; border: 1px solid rgba(255,255,255,0.5); border-radius: 4px; padding: 0; overflow: hidden; }

                /* Big Play & Indicators */
                .gplr-big-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; background: rgba(0,0,0,0.6); border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s; backdrop-filter: blur(4px); z-index: 5; }
                .gplr-big-play svg { width: 32px; height: 32px; fill: #fff; margin-left: 4px; }
                .gplr.playing .gplr-big-play { opacity: 0; pointer-events: none; transform: translate(-50%, -50%) scale(1.5); }
                .gplr-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); padding: 20px; border-radius: 50%; opacity: 0; transition: opacity 0.2s; pointer-events: none; z-index: 6; }
                .gplr-overlay.active { opacity: 1; }
                .gplr-overlay svg { width: 32px; height: 32px; fill: #fff; display: block; }

                @media (hover: none) {
                    .gplr-vol-wrap { width: 80px; margin-left: 8px; }
                    .gplr-tip { display: none !important; }
                    .gplr-btn { width: 44px; height: 44px; }
                }
            `;
            const s = document.createElement('style');
            s.id = 'gplr-css';
            s.textContent = css;
            document.head.appendChild(s);
        }

        #buildDOM() {
            const el = document.createElement('div');
            el.className = 'gplr';
            el.tabIndex = 0;
            el.setAttribute('role', 'region');
            el.setAttribute('aria-label', 'Video Player');
            
            this.#container = el;
            this.#video.parentNode.insertBefore(el, this.#video);
            el.appendChild(this.#video);

            el.insertAdjacentHTML('beforeend', `
                <canvas class="gplr-ambient"></canvas>
                <div class="gplr-overlay"></div>
                <div class="gplr-big-play" role="button" aria-label="Play" data-act="play">${SVGS.indicatorPlay}</div>
                
                <div class="gplr-ctrl">
                    <div class="gplr-prog" role="slider" aria-label="Seek">
                        <div class="gplr-tip"><canvas></canvas><span>00:00</span></div>
                        <div class="gplr-prog-track"><div class="gplr-prog-fill"></div><div class="gplr-prog-thumb"></div></div>
                    </div>
                    
                    <div class="gplr-row">
                        <button class="gplr-btn" data-act="play">${SVGS.play}</button>
                        
                        <div class="gplr-vol-cont gplr-row">
                            <button class="gplr-btn" data-act="mute">${SVGS.volHigh}</button>
                            <div class="gplr-vol-wrap" role="slider"><div class="gplr-vol-track"><div class="gplr-vol-fill"></div></div></div>
                        </div>
                        
                        <div class="gplr-time" style="font-size:12px; color:#ddd; margin-left:8px">
                            <span class="t-cur">00:00</span> / <span class="t-dur">00:00</span>
                        </div>
                        
                        <div class="gplr-grow"></div>
                        
                        <!-- Extra Toggable Buttons -->
                        <button class="gplr-btn" data-tog="booster" data-ui="booster" style="display:none" title="Audio Booster">${SVGS.booster}</button>
                        <button class="gplr-btn" data-act="caption-tog" data-ui="captions" title="Toggle Captions">${SVGS.captions}</button>
                        
                        <!-- Cast / Airplay (Icon set by JS) -->
                        <button class="gplr-btn cast-btn" data-ui="cast" style="display:none"></button>
                        
                        <button class="gplr-btn" data-act="download" data-ui="download" style="display:none" title="Download">${SVGS.download}</button>

                        <button class="gplr-btn" data-act="settings" title="Settings">${SVGS.settings}</button>
                        <button class="gplr-btn pip-btn" data-act="pip" data-ui="pip">${SVGS.pip}</button>
                        <button class="gplr-btn" data-act="fullscreen" title="Fullscreen">${SVGS.fullscreen}</button>
                    </div>
                </div>

                <div class="gplr-menu">
                    <div class="gplr-panels">
                        <div class="gplr-panel" data-id="main">
                            <div class="gplr-head">Settings</div>
                            <button class="gplr-item" data-go="speed"><span>Speed</span><span class="gplr-val val-speed">Normal ${SVGS.arrowRight}</span></button>
                            <button class="gplr-item" data-go="quality" style="display:none"><span>Quality</span><span class="gplr-val val-qual">Auto ${SVGS.arrowRight}</span></button>
                            <button class="gplr-item" data-go="captions"><span>Captions</span><span class="gplr-val val-cap">Off ${SVGS.arrowRight}</span></button>
                            <button class="gplr-item" data-go="customize"><span>Customize UI</span><span class="gplr-val">${SVGS.arrowRight}</span></button>
                            <button class="gplr-item" data-tog="ambient"><span>Ambient Mode</span><span class="gplr-val val-amb">Off</span></button>
                        </div>
                        
                        <div class="gplr-panel" data-id="speed"></div>
                        <div class="gplr-panel" data-id="quality"></div>
                        <div class="gplr-panel" data-id="captions"></div>
                        <div class="gplr-panel" data-id="customize"></div>

                        <div class="gplr-panel" data-id="capstyle">
                            <div class="gplr-head"><button class="gplr-btn" data-back="captions">${SVGS.back}</button> Style</div>
                            <div class="gplr-grid">
                                <div class="gplr-input-grp"><label>Color</label><input type="color" data-css="--cap-color" value="#ffffff"></div>
                                <div class="gplr-input-grp"><label>Background</label><input type="color" data-css="--cap-bg" value="#000000"></div>
                                <div class="gplr-input-grp"><label>Font</label><select class="gplr-input" data-css="--cap-font">
                                    <option value="sans-serif">Sans-Serif</option><option value="serif">Serif</option>
                                    <option value="monospace">Monospace</option><option value="cursive">Cursive</option>
                                </select></div>
                                <div class="gplr-input-grp"><label>Size</label><select class="gplr-input" data-css="--cap-size">
                                    <option value="16px">Small</option><option value="20px" selected>Medium</option>
                                    <option value="26px">Large</option><option value="32px">Huge</option>
                                </select></div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }

        #cacheDOM() {
            const Q = (s) => this.#container.querySelector(s);
            const QAll = (s) => this.#container.querySelectorAll(s);
            this.#ui = {
                cont: this.#container,
                ctrl: Q('.gplr-ctrl'),
                // FIXED: More specific selector to avoid grabbing the big play button
                playBtn: Q('.gplr-ctrl [data-act="play"]'),
                muteBtn: Q('[data-act="mute"]'),
                prog: { el: Q('.gplr-prog'), fill: Q('.gplr-prog-fill'), tip: Q('.gplr-tip'), tipTxt: Q('.gplr-tip span'), ctx: Q('.gplr-tip canvas').getContext('2d') },
                vol: { el: Q('.gplr-vol-track'), fill: Q('.gplr-vol-fill') },
                time: { cur: Q('.t-cur'), dur: Q('.t-dur') },
                menu: { el: Q('.gplr-menu'), panels: Q('.gplr-panels') },
                amb: { cvs: Q('.gplr-ambient'), ctx: Q('.gplr-ambient').getContext('2d', { alpha: false }) },
                overlay: Q('.gplr-overlay'),
                pip: Q('.pip-btn'),
                cast: Q('.cast-btn'),
                capBtn: Q('[data-act="caption-tog"]'),
                uiButtons: QAll('[data-ui]')
            };
        }

        #restoreState() {
            const s = Store.get();
            // Defaults
            const uiPref = { ...CONFIG.DEFAULT_UI, ...(s.ui || {}) };

            if (s.vol !== undefined) { this.#video.volume = s.vol; this.#video.muted = s.muted; }
            if (s.ambient) this.#toggleAmbient();
            
            // Restore Styles & Theme
            if (s.styles) Object.entries(s.styles).forEach(([k,v]) => {
                this.#container.style.setProperty(k, v);
                const inp = this.#container.querySelector(`[data-css="${k}"]`);
                if(inp) inp.value = v;
            });
            if (s.theme) {
                this.#container.style.setProperty('--gplr-primary', s.theme);
            }

            // Restore UI Buttons visibility
            Object.entries(uiPref).forEach(([k, v]) => this.#toggleUiElement(k, v));

            this.#updateVolUI();
            if (!document.pictureInPictureEnabled) this.#ui.pip.style.display = 'none';
        }

        #initEvents() {
            const s = { signal: this.#abort.signal };
            const v = this.#video;

            v.addEventListener('play', () => this.#onPlay(true), s);
            v.addEventListener('pause', () => this.#onPlay(false), s);
            v.addEventListener('timeupdate', () => this.#onTime(), s);
            v.addEventListener('volumechange', () => this.#updateVolUI(), s);
            v.addEventListener('loadedmetadata', () => this.#onMeta(), s);
            v.addEventListener('waiting', () => this.#ui.cont.classList.add('buffering'), s);
            v.addEventListener('playing', () => this.#ui.cont.classList.remove('buffering'), s);

            this.#setupSlider(this.#ui.prog.el, (p) => { if (isFinite(v.duration)) v.currentTime = p * v.duration; }, true);
            this.#setupSlider(this.#ui.vol.el.parentElement, (p) => { v.volume = p; v.muted = (p === 0); });

            this.#ui.cont.addEventListener('click', (e) => this.#onClick(e), s);
            this.#ui.cont.addEventListener('dblclick', (e) => this.#onDblClick(e), s);
            this.#ui.cont.addEventListener('keydown', (e) => this.#onKey(e), s);
            this.#ui.cont.addEventListener('pointermove', (e) => { if(e.pointerType === 'mouse') this.#showCtrl(); }, s);
            this.#ui.cont.addEventListener('mouseleave', () => this.#hideCtrl(), s);

            this.#ui.prog.el.addEventListener('mousemove', (e) => this.#updateTip(e), s);
            this.#ui.prog.el.addEventListener('mouseleave', () => this.#ui.prog.tip.style.display = 'none', s);
            
            // Style & Theme Change Listeners
            this.#ui.menu.el.addEventListener('change', (e) => {
                if (e.target.dataset.css) this.#updateStyle(e.target);
                if (e.target.dataset.theme) this.#updateTheme(e.target.value);
            });

            document.addEventListener('click', (e) => { if (!this.#container.contains(e.target)) this.#toggleMenu(false); }, s);
            document.addEventListener('fullscreenchange', () => { this.#ui.cont.classList.toggle('fullscreen', !!document.fullscreenElement); }, s);
        }

        // --- Core Logic ---

        #setupSlider(el, cb, isSeek) {
            const handle = (e, isEnd) => {
                const rect = el.getBoundingClientRect();
                const x = (e.touches ? e.touches[0].clientX : e.clientX);
                const pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
                cb(pct);
                if (isSeek) this.#updateTip(e, pct);
            };

            const start = (e) => {
                if (isSeek) {
                    this.#state.scrubbing = true;
                    this.#state.pausedBeforeScrub = this.#video.paused;
                    this.#video.pause();
                }
                handle(e);
                const move = (ev) => handle(ev);
                const end = (ev) => {
                    handle(ev, true);
                    document.removeEventListener(e.type === 'touchstart' ? 'touchmove' : 'mousemove', move);
                    if (isSeek) {
                        this.#state.scrubbing = false;
                        if (!this.#state.pausedBeforeScrub) this.#video.play();
                    }
                };
                document.addEventListener(e.type === 'touchstart' ? 'touchmove' : 'mousemove', move, { passive: false });
                document.addEventListener(e.type === 'touchstart' ? 'touchend' : 'mouseup', end, { once: true });
            };

            el.addEventListener('mousedown', start);
            el.addEventListener('touchstart', start, { passive: false });
        }

        #onPlay(isPlaying) {
            this.#ui.cont.classList.toggle('playing', isPlaying);
            // This now targets the correct button because of cacheDOM fix
            this.#ui.playBtn.innerHTML = isPlaying ? SVGS.pause : SVGS.play;
            if (isPlaying) { this.#showCtrl(); this.#loop(); }
            else { this.#showCtrl(true); cancelAnimationFrame(this.#raf); }
        }

        #onTime() {
            if (this.#state.scrubbing) return;
            const cur = this.#video.currentTime;
            const dur = this.#video.duration || 1;
            this.#ui.prog.fill.style.width = `${(cur/dur)*100}%`;
            this.#ui.time.cur.textContent = this.#fmt(cur);
        }

        #onMeta() {
            this.#ui.time.dur.textContent = this.#fmt(this.#video.duration);
            this.#initVTT();
            this.#buildSpeedMenu();
            this.#buildQualityMenu();
            this.#buildCaptionMenu();
            this.#buildCustomizeMenu(); 
            this.#checkCast();

            // Restore Speed if stored
            const saved = Store.get();
            if (saved.speed) this.#setSpeed(saved.speed);
        }

        // --- Features ---

        #toggleBoost() {
            if (!GokuPlr.#audioCtx) GokuPlr.#audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = GokuPlr.#audioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            if (!GokuPlr.#connectedVideos.has(this.#video)) {
                const src = ctx.createMediaElementSource(this.#video);
                const gain = ctx.createGain();
                src.connect(gain).connect(ctx.destination);
                this.#modules.audioGain = gain;
                GokuPlr.#connectedVideos.add(this.#video);
            }

            this.#state.booster = !this.#state.booster;
            this.#modules.audioGain.gain.value = this.#state.booster ? CONFIG.BOOSTER_GAIN : 1;
            
            const btn = this.#container.querySelector('[data-tog="booster"]');
            if(btn) btn.classList.toggle('active', this.#state.booster);
        }

        #toggleAmbient() {
            this.#state.ambient = !this.#state.ambient;
            this.#ui.cont.classList.toggle('ambient-on', this.#state.ambient);
            this.#ui.menu.el.querySelector('.val-amb').textContent = this.#state.ambient ? 'On' : 'Off';
            Store.set({ ambient: this.#state.ambient });
            if (this.#state.ambient && !this.#video.paused) this.#loop();
        }

        #buildSpeedMenu() {
            const p = this.#ui.menu.panels.querySelector('[data-id="speed"]');
            let html = `<div class="gplr-head"><button class="gplr-btn" data-back="main">${SVGS.back}</button> Speed</div>`;
            CONFIG.PLAYBACK_SPEEDS.forEach(r => {
                html += `<button class="gplr-item" data-spd="${r}"><span>${r===1?'Normal':r+'x'}</span><span class="chk">${r===this.#video.playbackRate?SVGS.check:''}</span></button>`;
            });
            p.innerHTML = html;
        }

        #setSpeed(s) {
            this.#video.playbackRate = s;
            this.#ui.menu.el.querySelector('.val-speed').innerHTML = (s === 1 ? 'Normal ' : s + 'x ') + SVGS.arrowRight;
            this.#updateCheck('[data-id="speed"]', s, 'spd');
            Store.set({ speed: s });
        }

        #buildCaptionMenu() {
            const panel = this.#ui.menu.panels.querySelector('[data-id="captions"]');
            const tracks = Array.from(this.#video.textTracks).filter(t => t.kind !== 'metadata');
            
            let html = `<div class="gplr-head"><button class="gplr-btn" data-back="main">${SVGS.back}</button> Captions</div>`;
            
            tracks.forEach((t, i) => {
                t.mode = 'hidden'; 
                html += `<button class="gplr-item" data-trk="${i}"><span>${t.label||`Track ${i+1}`}</span><span class="chk"></span></button>`;
            });
            html += `<div style="border-top:1px solid rgba(255,255,255,0.1);margin:5px 0"></div>
                     <button class="gplr-item" data-go="capstyle"><span>Caption Style</span>${SVGS.arrowRight}</button>`;
            panel.innerHTML = html;
        }

        #buildCustomizeMenu() {
            const panel = this.#ui.menu.panels.querySelector('[data-id="customize"]');
            const items = [
                { k: 'captions', l: 'Captions Button' },
                { k: 'booster', l: 'Audio Booster' },
                { k: 'pip', l: 'Picture in Picture' },
                { k: 'download', l: 'Download Button' },
                { k: 'cast', l: 'Cast/AirPlay' }, 
            ];
            const s = Store.get();
            const uiPref = { ...CONFIG.DEFAULT_UI, ...(s.ui || {}) };
            const curTheme = s.theme || CONFIG.DEFAULT_COLOR;

            let html = `<div class="gplr-head"><button class="gplr-btn" data-back="main">${SVGS.back}</button> Customize UI</div>`;
            
            // Theme Picker
            html += `
                <div class="gplr-item" style="cursor:default">
                    <span>Theme Color</span>
                    <input type="color" class="gplr-color-pick" data-theme="primary" value="${curTheme}">
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.1);margin:5px 0"></div>
            `;

            items.forEach(i => {
                const isActive = uiPref[i.k] !== false; 
                html += `<button class="gplr-item ${isActive?'active':''}" data-ui-tog="${i.k}">
                            <span>${i.l}</span><div class="gplr-switch"></div>
                         </button>`;
            });
            panel.innerHTML = html;
        }

        #updateTheme(color) {
            this.#container.style.setProperty('--gplr-primary', color);
            Store.set({ theme: color });
        }

        #toggleUiSwitch(btn) {
            const key = btn.dataset.uiTog;
            const isNowActive = !btn.classList.contains('active');
            btn.classList.toggle('active', isNowActive);
            
            this.#toggleUiElement(key, isNowActive);

            const s = Store.get();
            const ui = s.ui || { ...CONFIG.DEFAULT_UI };
            ui[key] = isNowActive;
            Store.set({ ui });
        }

        #toggleUiElement(key, show) {
            const el = this.#container.querySelector(`.gplr-ctrl [data-ui="${key}"]`);
            if (el) {
                if (key === 'pip' && !document.pictureInPictureEnabled) return;
                if (key === 'cast' && el.style.display === 'none' && !el.dataset.detected) return; 
                el.style.display = show ? '' : 'none';
            }
        }

        #toggleCaptions() {
            const tracks = Array.from(this.#video.textTracks).filter(t => t.kind !== 'metadata');
            if (tracks.length === 0) return;

            this.#state.captionsVisible = !this.#state.captionsVisible;
            if (this.#state.captionsVisible && this.#state.track === -1) {
                this.#state.track = 0;
            }

            tracks.forEach((t, i) => {
                t.mode = (this.#state.captionsVisible && i === this.#state.track) ? 'showing' : 'hidden';
            });

            this.#ui.capBtn.classList.toggle('active', this.#state.captionsVisible);
            
            const label = this.#state.captionsVisible 
                ? (tracks[this.#state.track]?.label || `Track ${this.#state.track + 1}`) 
                : 'Off';
            
            this.#ui.menu.el.querySelector('.val-cap').innerHTML = label + ' ' + SVGS.arrowRight;
            this.#updateCheck('[data-id="captions"]', this.#state.track, 'trk');
        }

        #setCaption(idx) {
            this.#state.track = idx;
            this.#state.captionsVisible = true;
            
            const tracks = Array.from(this.#video.textTracks).filter(t => t.kind !== 'metadata');
            tracks.forEach((t, i) => t.mode = (i === idx) ? 'showing' : 'hidden');
            
            const label = tracks[idx].label || `Track ${idx+1}`;
            
            this.#ui.capBtn.classList.add('active');
            this.#ui.menu.el.querySelector('.val-cap').innerHTML = label + ' ' + SVGS.arrowRight;
            this.#updateCheck('[data-id="captions"]', idx, 'trk');
            this.#nav('main');
        }

        #buildQualityMenu() {
            const srcs = this.#video.querySelectorAll('source');
            if (srcs.length < 2) return;
            
            const panel = this.#ui.menu.panels.querySelector('[data-id="quality"]');
            this.#ui.menu.el.querySelector('[data-go="quality"]').style.display = 'flex';
            
            let html = `<div class="gplr-head"><button class="gplr-btn" data-back="main">${SVGS.back}</button> Quality</div>`;
            srcs.forEach((s, i) => {
                // FIXED: Now specifically looks for data-quality, data-label, or generic size
                const lbl = s.dataset.quality || s.dataset.label || (s.getAttribute('size') ? s.getAttribute('size') + 'p' : `Source ${i+1}`);
                html += `<button class="gplr-item" data-src="${i}"><span>${lbl}</span><span class="chk">${i===0?SVGS.check:''}</span></button>`;
            });
            panel.innerHTML = html;
        }

        #setQual(idx) {
            const srcs = this.#video.querySelectorAll('source');
            const next = srcs[idx];
            if (!next || next.src === this.#video.currentSrc) return;
            
            const time = this.#video.currentTime;
            const paused = this.#video.paused;
            this.#video.src = next.src;
            this.#video.load();
            this.#video.currentTime = time;
            if (!paused) this.#video.play();
            
            // FIXED: Updated label logic here too
            const lbl = next.dataset.quality || next.dataset.label || (next.getAttribute('size') ? next.getAttribute('size') + 'p' : `Source ${idx+1}`);
            this.#ui.menu.el.querySelector('.val-qual').innerHTML = lbl + ' ' + SVGS.arrowRight;
            this.#updateCheck('[data-id="quality"]', idx, 'src');
            this.#nav('main');
        }

        #initVTT() {
            const trk = Array.from(this.#video.textTracks).find(t => t.kind === 'metadata' && t.label === 'thumbnails');
            if (!trk) return;
            trk.mode = 'hidden';
            
            const load = () => {
                if (trk.cues && trk.cues.length) {
                    const c = trk.cues[0];
                    const url = c.text.split('#')[0];
                    this.#modules.vtt = { img: new Image(), cues: Array.from(trk.cues) };
                    this.#modules.vtt.img.src = url;
                } else setTimeout(load, 500);
            };
            load();
        }

        #checkCast() {
            const btn = this.#ui.cast;
            if (window.WebKitPlaybackTargetAvailabilityEvent) {
                this.#video.addEventListener('webkitplaybacktargetavailabilitychanged', e => {
                    if (e.availability === 'available') {
                        btn.innerHTML = SVGS.airplay;
                        btn.title = "AirPlay";
                        btn.dataset.detected = "true";
                        const s = Store.get().ui || {};
                        if (s.cast !== false) btn.style.display = 'flex';
                        btn.onclick = () => this.#video.webkitShowPlaybackTargetPicker();
                    }
                });
            } else if (this.#video.remote && window.RemotePlayback) {
                 this.#video.remote.watchAvailability((avail) => {
                    if (avail) {
                        btn.innerHTML = SVGS.cast;
                        btn.title = "Cast";
                        btn.dataset.detected = "true";
                        const s = Store.get().ui || {};
                        if (s.cast !== false) btn.style.display = 'flex';
                        btn.onclick = () => this.#video.remote.prompt();
                    }
                }).catch(() => {});
            }
        }

        #onClick(e) {
            const btn = e.target.closest('.gplr-btn, .gplr-item, .gplr-big-play');
            
            if (!btn) {
                if (this.#ui.menu.el.classList.contains('active')) return this.#toggleMenu(false);
                if (this.#container.contains(e.target) && !this.#ui.ctrl.contains(e.target)) {
                    if (this.#state.touch) this.#ui.cont.classList.contains('ctrl-active') ? this.#hideCtrl() : this.#showCtrl();
                    else this.#video.paused ? this.#video.play() : this.#video.pause();
                }
                return;
            }

            const act = btn.dataset.act;
            if (act === 'play') this.#video.paused ? this.#video.play() : this.#video.pause();
            if (act === 'mute') this.#video.muted = !this.#video.muted;
            if (act === 'fullscreen') document.fullscreenElement ? document.exitFullscreen() : this.#container.requestFullscreen();
            if (act === 'pip') document.pictureInPictureElement ? document.exitPictureInPicture() : this.#video.requestPictureInPicture();
            if (act === 'settings') this.#toggleMenu();
            if (act === 'download') this.#download();
            if (act === 'caption-tog') this.#toggleCaptions();

            if (btn.dataset.go) this.#nav(btn.dataset.go);
            if (btn.dataset.back) this.#nav(btn.dataset.back);
            if (btn.dataset.tog === 'booster') this.#toggleBoost();
            if (btn.dataset.tog === 'ambient') this.#toggleAmbient();
            if (btn.dataset.spd) this.#setSpeed(parseFloat(btn.dataset.spd));
            if (btn.dataset.trk !== undefined) this.#setCaption(parseInt(btn.dataset.trk));
            if (btn.dataset.src !== undefined) this.#setQual(parseInt(btn.dataset.src));
            if (btn.dataset.uiTog) this.#toggleUiSwitch(btn);
        }

        #onDblClick(e) {
            if (e.target.closest('.gplr-ctrl') || this.#ui.menu.el.classList.contains('active')) return;
            const rect = this.#container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const zone = rect.width * CONFIG.DBL_CLICK_ZONE;
            
            if (x < zone) { this.#video.currentTime -= 10; this.#flash(SVGS.seekBwd); }
            else if (x > rect.width - zone) { this.#video.currentTime += 10; this.#flash(SVGS.seekFwd); }
            else { document.fullscreenElement ? document.exitFullscreen() : this.#container.requestFullscreen(); }
        }

        #onKey(e) {
            if (e.target.matches('input,select')) return;
            const k = e.key.toLowerCase();
            const v = this.#video;
            
            if (['k',' '].includes(k)) v.paused ? v.play() : v.pause();
            else if (k === 'f') document.fullscreenElement ? document.exitFullscreen() : this.#container.requestFullscreen();
            else if (k === 'm') v.muted = !v.muted;
            else if (['arrowright','l'].includes(k)) { 
                const t = Number(v.currentTime);
                v.currentTime = Math.min(v.duration || t, t + 5); 
                this.#flash(SVGS.seekFwd); 
            }
            else if (['arrowleft','j'].includes(k)) { 
                const t = Number(v.currentTime);
                v.currentTime = Math.max(0, t - 5); 
                this.#flash(SVGS.seekBwd); 
            }
            else if (k === 'arrowup') v.volume = Math.min(1, v.volume + 0.1);
            else if (k === 'arrowdown') v.volume = Math.max(0, v.volume - 0.1);
            else return;
            
            e.preventDefault();
            this.#showCtrl();
        }

        #updateTip(e, pct) {
            const rect = this.#ui.prog.el.getBoundingClientRect();
            const p = pct !== undefined ? pct : (e.clientX - rect.left) / rect.width;
            const t = p * this.#video.duration;
            
            this.#ui.prog.tip.style.display = 'block';
            this.#ui.prog.tip.style.left = `${Math.max(0, Math.min(100, p * 100))}%`;
            this.#ui.prog.tipTxt.textContent = this.#fmt(t);
            
            if (this.#modules.vtt && this.#modules.vtt.img.complete) {
                const cue = this.#modules.vtt.cues.find(c => t >= c.startTime && t < c.endTime);
                if (cue) {
                    const [x,y,w,h] = cue.text.split('xywh=')[1].split(',').map(Number);
                    this.#ui.prog.ctx.canvas.width = w;
                    this.#ui.prog.ctx.canvas.height = h;
                    this.#ui.prog.ctx.drawImage(this.#modules.vtt.img, x, y, w, h, 0, 0, w, h);
                }
            }
        }

        #loop() {
            if (this.#state.ambient && !this.#video.paused) {
                this.#ui.amb.ctx.drawImage(this.#video, 0, 0, this.#ui.amb.cvs.width, this.#ui.amb.cvs.height);
            }
            if (!this.#video.paused) this.#raf = requestAnimationFrame(() => this.#loop());
        }

        #updateVolUI() {
            const v = this.#video.muted ? 0 : this.#video.volume;
            this.#ui.vol.fill.style.width = (v*100)+'%';
            this.#ui.muteBtn.innerHTML = v > 0.5 ? SVGS.volHigh : v > 0 ? SVGS.volMed : v === 0 ? SVGS.muted : SVGS.volLow;
            Store.set({ vol: this.#video.volume, muted: this.#video.muted });
        }

        #toggleMenu(force) {
            const a = force !== undefined ? force : !this.#ui.menu.el.classList.contains('active');
            this.#ui.menu.el.classList.toggle('active', a);
            if (!a) setTimeout(() => this.#nav('main'), 200);
        }

        #nav(id) {
            const panels = ['main', 'speed', 'quality', 'captions', 'customize', 'capstyle'];
            const idx = panels.indexOf(id);
            if (idx > -1) this.#ui.menu.panels.style.transform = `translateX(-${idx * 100}%)`;
        }

        #updateCheck(panelSel, val, dataAttr) {
            this.#ui.menu.panels.querySelector(panelSel).querySelectorAll('.gplr-item').forEach(b => {
                b.querySelector('.chk').innerHTML = (String(b.dataset[dataAttr]) === String(val)) ? SVGS.check : '';
            });
        }

        #updateStyle(input) {
            const k = input.dataset.css;
            const v = input.value;
            this.#container.style.setProperty(k, v);
            const current = Store.get();
            const s = current.styles || {};
            s[k] = v;
            Store.set({ styles: s });
        }

        #showCtrl(force) {
            clearTimeout(this.#timers.ctrl);
            this.#ui.cont.classList.add('ctrl-active');
            this.#ui.cont.classList.remove('hide-cursor');
            if (!force && !this.#video.paused) {
                this.#timers.ctrl = setTimeout(() => this.#hideCtrl(), 3000);
            }
        }

        #hideCtrl() {
            if (this.#video.paused || this.#ui.menu.el.classList.contains('active')) return;
            this.#ui.cont.classList.remove('ctrl-active');
            if (!this.#state.touch) this.#ui.cont.classList.add('hide-cursor');
            this.#toggleMenu(false);
        }

        #flash(svg) {
            this.#ui.overlay.innerHTML = svg;
            this.#ui.overlay.classList.remove('active');
            void this.#ui.overlay.offsetWidth;
            this.#ui.overlay.classList.add('active');
            setTimeout(() => this.#ui.overlay.classList.remove('active'), 500);
        }

        #download() {
            const a = document.createElement('a');
            a.href = this.#video.currentSrc;
            a.download = '';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            a.remove();
        }

        #fmt(s) {
            const d = new Date(s * 1000);
            return s >= 3600 ? d.toISOString().substr(11, 8) : d.toISOString().substr(14, 5);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('video.gplr, .video-player-container video').forEach(v => new GokuPlr(v));
    });

})();
