/**
 * GokuPlr v2.3.4 (Fixed)
 * A modern, feature-rich HTML5 video player.
 * 
 * Fixes Applied:
 * - Resolved conflict between Play/Pause click and Double-tap seeking.
 * - prevented default browser scrolling on keyboard shortcuts.
 * - Added CORS safety checks for Volume Booster (AudioContext).
 * - Fixed CSS duplication and potential interaction bugs.
 */

(function() {
    if (window.GokuPlrInitialized) return;
    window.GokuPlrInitialized = true;

    class CustomVideoPlayer {
        // --- Static Configuration ---
        static #version = '2.3.4';
        static #KEYS = { SETTINGS: 'gplr-settings', VOLUME: 'gplr-volume', SPEED: 'gplr-speed' };
        static #audioContext = null;

        // --- Private State ---
        #video; #container;
        #controlsTimeout; #indicatorTimeout; #animationFrameId;
        #isScrubbing = false; #isDraggingVolume = false; #wasPausedBeforeScrub = true;
        #isTouch = false; #vttThumbnails = []; #thumbnailSprite = null;
        
        // Audio & Booster
        #mediaSource = null; #boosterGainNode = null; #isBoosterActive = false;
        #BOOSTER_MULTIPLIER = 2.5;

        // DOM Cache
        #elements = {};

        constructor(videoElement) {
            if (!videoElement || videoElement.dataset.gokuInitialized) return;
            
            this.#video = videoElement;
            this.#video.dataset.gokuInitialized = 'true';
            this.#video.controls = false;
            // Try to enable CORS for AudioContext, but don't break if strict
            try { this.#video.crossOrigin = "anonymous"; } catch(e) {} 
            
            this.#isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

            this.#injectStyles();
            this.#buildPlayerHtml();
            this.#cacheElements();
            this.#init();
        }

        // --- 1. Initialization ---

        #injectStyles() {
            if (document.getElementById('gplr-v2-styles')) return;
            const css = `
                :root {
                    --gplr-primary: #3ea6ff;
                    --gplr-text: #f1f1f1;
                    --gplr-bg-controls: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
                    --gplr-bg-menu: rgba(28, 28, 28, 0.9);
                    --gplr-glass: blur(10px);
                    --gplr-radius: 8px;
                    --gplr-font: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                }
                .gplr-container { 
                    position: relative; width: 100%; background: #000; 
                    font-family: var(--gplr-font); overflow: hidden; 
                    aspect-ratio: 16/9; user-select: none; outline: none;
                    -webkit-tap-highlight-color: transparent;
                }
                .gplr-container.fullscreen { width: 100%; height: 100%; border-radius: 0; z-index: 9999; }
                .gplr-container.no-cursor { cursor: none; }
                .gplr-container video { width: 100%; height: 100%; display: block; }

                /* Ambient Mode */
                .gplr-ambient { 
                    position: absolute; top: -10%; left: -10%; width: 120%; height: 120%; 
                    filter: blur(50px) brightness(1.2); opacity: 0; transition: opacity 0.5s; z-index: 0; pointer-events: none;
                }
                .gplr-container.ambient-active .gplr-ambient { opacity: 0.5; }

                /* Loading Spinner */
                .gplr-loader {
                    position: absolute; top: 50%; left: 50%; width: 50px; height: 50px;
                    border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: var(--gplr-primary);
                    animation: gplr-spin 1s ease-in-out infinite; transform: translate(-50%, -50%);
                    display: none; z-index: 5; pointer-events: none;
                }
                .gplr-container.waiting .gplr-loader { display: block; }
                @keyframes gplr-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

                /* Controls Layer */
                .gplr-controls {
                    position: absolute; bottom: 0; left: 0; right: 0; padding: 0 12px 8px;
                    background: var(--gplr-bg-controls); display: flex; flex-direction: column;
                    opacity: 0; visibility: hidden; transition: opacity 0.2s; z-index: 10;
                }
                .gplr-container.controls-visible .gplr-controls, .gplr-controls:hover { opacity: 1; visibility: visible; }
                
                /* Progress Bar */
                .gplr-timeline-container { height: 16px; display: flex; align-items: flex-end; cursor: pointer; margin-bottom: 4px; touch-action: none; }
                .gplr-timeline { width: 100%; height: 4px; background: rgba(255,255,255,0.3); position: relative; transition: height 0.1s; }
                .gplr-timeline-filled { height: 100%; background: var(--gplr-primary); width: 0%; position: absolute; left: 0; top: 0; }
                .gplr-timeline-hover { height: 100%; background: rgba(255,255,255,0.5); width: 0%; position: absolute; left: 0; top: 0; pointer-events: none; }
                .gplr-timeline-thumb { 
                    width: 12px; height: 12px; border-radius: 50%; background: var(--gplr-primary); 
                    position: absolute; top: 50%; transform: translate(50%, -50%) scale(0); right: 0; transition: transform 0.1s; 
                }
                .gplr-timeline-container:hover .gplr-timeline { height: 6px; }
                .gplr-timeline-container:hover .gplr-timeline-thumb { transform: translate(50%, -50%) scale(1); }

                /* Buttons & Layout */
                .gplr-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
                .gplr-left, .gplr-right { display: flex; align-items: center; gap: 8px; }
                .gplr-btn {
                    background: none; border: none; cursor: pointer; color: var(--gplr-text);
                    width: 36px; height: 36px; padding: 6px; border-radius: 4px; display: flex; justify-content: center; align-items: center;
                    transition: background 0.2s; position: relative;
                }
                .gplr-btn:hover { background: rgba(255,255,255,0.15); }
                .gplr-btn svg { width: 100%; height: 100%; fill: currentColor; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }
                .gplr-btn.active svg { fill: var(--gplr-primary); }
                
                /* Volume - Fixed duplicate width issue */
                .gplr-vol-container { display: flex; align-items: center; overflow: hidden; transition: width 0.2s; }
                .gplr-vol-slider { width: 0; height: 4px; background: rgba(255,255,255,0.3); margin-left: 0; overflow: hidden; transition: all 0.2s; cursor: pointer; position: relative; }
                .gplr-vol-container:hover .gplr-vol-slider, .gplr-container.touch .gplr-vol-slider { width: 60px; margin-left: 8px; overflow: visible; }
                .gplr-vol-inner { height: 100%; background: #fff; width: 100%; }

                /* Time */
                .gplr-time { font-size: 13px; color: #ddd; font-variant-numeric: tabular-nums; margin-left: 4px; }

                /* Big Play / Indicator */
                .gplr-center-overlay {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    pointer-events: none; z-index: 5; display: flex; justify-content: center; align-items: center;
                }
                .gplr-big-play { 
                    width: 64px; height: 64px; background: rgba(0,0,0,0.6); border-radius: 50%; 
                    display: flex; justify-content: center; align-items: center; opacity: 0.9; transition: all 0.2s; cursor: pointer; pointer-events: auto;
                }
                .gplr-big-play:hover { transform: scale(1.1); background: var(--gplr-primary); }
                .gplr-big-play svg { width: 32px; height: 32px; fill: #fff; margin-left: 4px; }
                .gplr-container.playing .gplr-big-play { opacity: 0; pointer-events: none; transform: scale(1.5); }
                
                /* Toast Indicator */
                .gplr-toast {
                    position: absolute; top: 20%; left: 50%; transform: translateX(-50%);
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 8px 16px; border-radius: 20px;
                    color: #fff; font-size: 14px; opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 20;
                }
                .gplr-toast.visible { opacity: 1; }

                /* Settings Menu */
                .gplr-settings {
                    position: absolute; bottom: 60px; right: 12px; width: 250px; 
                    background: var(--gplr-bg-menu); backdrop-filter: var(--gplr-glass);
                    border-radius: 12px; overflow: hidden; transform: scale(0.9); transform-origin: bottom right;
                    opacity: 0; visibility: hidden; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); z-index: 20;
                    max-height: 80%;
                }
                .gplr-settings.visible { transform: scale(1); opacity: 1; visibility: visible; }
                .gplr-menu-slider { display: flex; transition: transform 0.25s ease; }
                .gplr-panel { min-width: 100%; padding: 8px 0; display: flex; flex-direction: column; }
                .gplr-menu-item {
                    padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;
                    font-size: 14px; color: #eee; cursor: pointer; background: none; border: none; width: 100%;
                }
                .gplr-menu-item:hover { background: rgba(255,255,255,0.1); }
                .gplr-menu-header { 
                    padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 4px;
                    display: flex; align-items: center; color: #fff; font-weight: 600; font-size: 14px;
                }
                .gplr-menu-back { margin-right: 8px; background: none; border: none; color: #fff; cursor: pointer; padding: 4px; }
                
                /* Tooltip */
                .gplr-tooltip {
                    position: absolute; bottom: 50px; background: rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 4px; padding: 4px; pointer-events: none; display: none; flex-direction: column; align-items: center; z-index: 15;
                }
                .gplr-tooltip canvas { width: 160px; height: 90px; background: #000; margin-bottom: 4px; }
                .gplr-tooltip span { color: #fff; font-size: 12px; font-weight: bold; }

                /* Touch specific */
                .gplr-ripple-box {
                    position: absolute; top: 0; bottom: 0; width: 30%; z-index: 4; display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: opacity 0.3s; pointer-events: none; font-size: 12px; color: #fff; background: rgba(255,255,255,0.1);
                }
                .gplr-ripple-left { left: 0; border-radius: 0 50% 50% 0; }
                .gplr-ripple-right { right: 0; border-radius: 50% 0 0 50%; }
                .gplr-ripple-box.active { opacity: 1; }
                .gplr-ripple-icon { width: 40px; height: 40px; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; justify-content: center; align-items: center; }

                /* Caption Styling Override */
                .gplr-container video::cue { background: rgba(0,0,0,0.75); color: white; font-family: sans-serif; }
            `;
            const style = document.createElement('style');
            style.id = 'gplr-v2-styles';
            style.textContent = css;
            document.head.appendChild(style);
        }

        #buildPlayerHtml() {
            const container = document.createElement('div');
            container.className = 'gplr-container';
            if (this.#isTouch) container.classList.add('touch');
            container.tabIndex = 0; // Make focusable
            
            // SVG Icons
            const ICONS = {
                play: '<path d="M8 5v14l11-7z"/>',
                pause: '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>',
                volHigh: '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>',
                muted: '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>',
                settings: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
                fullscreen: '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>',
                pip: '<path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>',
                back: '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>',
                forward10: '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42-3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="matrix(-1 0 0 1 24 0)"/>',
                rewind10: '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42-3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>',
                cc: '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H7.5v-1.5h-2v3h2V11H11v2H4.5v-4h6.5v2zm6 0h-3.5v-1.5h-2v3h2V11H17v2h-6.5v-4H17v2z"/>',
                download: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>',
                check: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>'
            };
            const mkBtn = (cls, icon, label) => `<button class="gplr-btn ${cls}" title="${label}" aria-label="${label}"><svg viewBox="0 0 24 24">${icon}</svg></button>`;

            container.innerHTML = `
                <canvas class="gplr-ambient"></canvas>
                <div class="gplr-loader"></div>
                <div class="gplr-center-overlay">
                    <div class="gplr-big-play"><svg viewBox="0 0 24 24">${ICONS.play}</svg></div>
                </div>
                <div class="gplr-toast"></div>
                <div class="gplr-ripple-box gplr-ripple-left"><div class="gplr-ripple-icon"><svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#fff">${ICONS.rewind10}</svg></div></div>
                <div class="gplr-ripple-box gplr-ripple-right"><div class="gplr-ripple-icon"><svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#fff">${ICONS.forward10}</svg></div></div>
                
                <div class="gplr-tooltip"><canvas></canvas><span>00:00</span></div>
                <div class="gplr-settings">
                    <div class="gplr-menu-slider">
                        <div class="gplr-panel" data-panel="main">
                            <button class="gplr-menu-item" data-target="speed"><span>Speed</span><span class="val-speed">Normal</span></button>
                            <button class="gplr-menu-item" data-target="quality"><span>Quality</span><span class="val-quality">Auto</span></button>
                            <button class="gplr-menu-item" data-target="captions"><span>Captions</span><span class="val-captions">Off</span></button>
                            <button class="gplr-menu-item" id="gplr-booster"><span>Volume Booster</span><span class="val-booster">Off</span></button>
                            <button class="gplr-menu-item" id="gplr-ambient"><span>Ambient Mode</span><span class="val-ambient">Off</span></button>
                        </div>
                        <div class="gplr-panel" data-panel="speed">
                            <div class="gplr-menu-header"><button class="gplr-menu-back"><svg viewBox="0 0 24 24">${ICONS.back}</svg></button>Speed</div>
                            <div class="gplr-list-speed"></div>
                        </div>
                        <div class="gplr-panel" data-panel="quality">
                            <div class="gplr-menu-header"><button class="gplr-menu-back"><svg viewBox="0 0 24 24">${ICONS.back}</svg></button>Quality</div>
                            <div class="gplr-list-quality"></div>
                        </div>
                         <div class="gplr-panel" data-panel="captions">
                            <div class="gplr-menu-header"><button class="gplr-menu-back"><svg viewBox="0 0 24 24">${ICONS.back}</svg></button>Captions</div>
                            <div class="gplr-list-captions"></div>
                        </div>
                    </div>
                </div>

                <div class="gplr-controls">
                    <div class="gplr-timeline-container">
                        <div class="gplr-timeline">
                            <div class="gplr-timeline-filled"></div>
                            <div class="gplr-timeline-hover"></div>
                            <div class="gplr-timeline-thumb"></div>
                        </div>
                    </div>
                    <div class="gplr-row">
                        <div class="gplr-left">
                            ${mkBtn('play-btn', ICONS.play, 'Play/Pause')}
                            <div class="gplr-vol-container">
                                ${mkBtn('mute-btn', ICONS.volHigh, 'Mute')}
                                <div class="gplr-vol-slider"><div class="gplr-vol-inner"></div></div>
                            </div>
                            <div class="gplr-time"><span class="cur-time">0:00</span> / <span class="tot-time">0:00</span></div>
                        </div>
                        <div class="gplr-right">
                            ${mkBtn('cc-btn', ICONS.cc, 'Captions')}
                            ${mkBtn('settings-btn', ICONS.settings, 'Settings')}
                            ${mkBtn('pip-btn', ICONS.pip, 'Picture-in-Picture')}
                            ${mkBtn('fs-btn', ICONS.fullscreen, 'Fullscreen')}
                            ${mkBtn('dl-btn', ICONS.download, 'Download')}
                        </div>
                    </div>
                </div>
            `;
            
            // Move Video into container
            this.#video.parentNode.insertBefore(container, this.#video);
            container.prepend(this.#video);
            this.#container = container;
        }

        #cacheElements() {
            const $ = (s) => this.#container.querySelector(s);
            this.#elements = {
                playBtn: $('.play-btn'), bigPlay: $('.gplr-big-play'),
                muteBtn: $('.mute-btn'), volSlider: $('.gplr-vol-slider'), volInner: $('.gplr-vol-inner'),
                timeCur: $('.cur-time'), timeTot: $('.tot-time'),
                timeline: $('.gplr-timeline-container'), progress: $('.gplr-timeline-filled'),
                hoverLine: $('.gplr-timeline-hover'), thumb: $('.gplr-timeline-thumb'),
                fsBtn: $('.fs-btn'), pipBtn: $('.pip-btn'), settingsBtn: $('.settings-btn'),
                menu: $('.gplr-settings'), menuSlider: $('.gplr-menu-slider'),
                tooltip: $('.gplr-tooltip'), ttCanvas: $('.gplr-tooltip canvas'), ttText: $('.gplr-tooltip span'),
                ambientCanvas: $('.gplr-ambient'), dlBtn: $('.dl-btn'), ccBtn: $('.cc-btn'),
                rippleLeft: $('.gplr-ripple-left'), rippleRight: $('.gplr-ripple-right')
            };
            
            // Feature Detection
            if (!document.pictureInPictureEnabled) this.#elements.pipBtn.style.display = 'none';
        }

        #init() {
            this.#loadSettings();
            this.#setupEventListeners();
            this.#setupMediaSession();
            if (this.#video.readyState >= 1) this.#handleLoadedMeta();
        }

        // --- 2. Logic & Events ---

        #setupEventListeners() {
            const E = this.#elements;
            const V = this.#video;

            // Video Events
            // REMOVED: V.addEventListener('click', this.#togglePlay.bind(this)); 
            // Fixed: Unified click handling in #setupInputs to prevent double-tap conflict
            
            V.addEventListener('play', this.#handlePlay.bind(this));
            V.addEventListener('pause', this.#handlePause.bind(this));
            V.addEventListener('timeupdate', this.#handleTimeUpdate.bind(this));
            V.addEventListener('volumechange', this.#handleVolumeChange.bind(this));
            V.addEventListener('loadedmetadata', this.#handleLoadedMeta.bind(this));
            V.addEventListener('waiting', () => this.#container.classList.add('waiting'));
            V.addEventListener('playing', () => this.#container.classList.remove('waiting'));
            V.addEventListener('canplay', () => this.#container.classList.remove('waiting'));
            V.addEventListener('ended', () => this.#container.classList.remove('playing'));
            
            // Controls
            E.playBtn.onclick = E.bigPlay.onclick = (e) => { e.stopPropagation(); this.#togglePlay(); };
            E.muteBtn.onclick = (e) => { e.stopPropagation(); this.#toggleMute(); };
            E.fsBtn.onclick = (e) => { e.stopPropagation(); this.#toggleFullscreen(); };
            E.pipBtn.onclick = (e) => { e.stopPropagation(); document.pictureInPictureElement ? document.exitPictureInPicture() : V.requestPictureInPicture(); };
            E.dlBtn.onclick = (e) => { e.stopPropagation(); this.#downloadVideo(); };
            E.ccBtn.onclick = (e) => { e.stopPropagation(); this.#toggleCC(); };

            // Settings Menu
            E.settingsBtn.onclick = (e) => { e.stopPropagation(); this.#toggleMenu(); };
            this.#container.querySelectorAll('.gplr-menu-back').forEach(b => b.onclick = (e) => { e.stopPropagation(); this.#navigateMenu(0); });
            this.#container.querySelector('#gplr-booster').onclick = (e) => { e.stopPropagation(); this.#toggleBooster(); };
            this.#container.querySelector('#gplr-ambient').onclick = (e) => { e.stopPropagation(); this.#toggleAmbient(); };
            
            // Scrubbing
            const handleScrub = (e) => this.#handleScrub(e);
            const endScrub = (e) => {
                this.#isScrubbing = false;
                if(!this.#wasPausedBeforeScrub) V.play();
                document.removeEventListener('mousemove', handleScrub);
                document.removeEventListener('touchmove', handleScrub);
                document.removeEventListener('mouseup', endScrub);
                document.removeEventListener('touchend', endScrub);
            };
            
            E.timeline.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.#isScrubbing = true;
                this.#wasPausedBeforeScrub = V.paused;
                V.pause();
                this.#handleScrub(e);
                document.addEventListener('mousemove', handleScrub);
                document.addEventListener('mouseup', endScrub);
            });
            
            E.timeline.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.#isScrubbing = true;
                this.#wasPausedBeforeScrub = V.paused;
                V.pause();
                this.#handleScrub(e);
                document.addEventListener('touchmove', handleScrub, {passive:false});
                document.addEventListener('touchend', endScrub);
            }, {passive: false});

            E.timeline.addEventListener('mousemove', this.#handleTimelineHover.bind(this));
            E.timeline.addEventListener('mouseleave', () => E.tooltip.style.display = 'none');

            // Volume Slide
            const handleVol = (e) => {
                const rect = E.volSlider.getBoundingClientRect();
                // Fix division by zero if hidden
                if (rect.width === 0) return;
                const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
                V.volume = Math.max(0, Math.min(1, x / rect.width));
                V.muted = V.volume === 0;
            };
            E.volSlider.addEventListener('mousedown', (e) => { 
                e.stopPropagation(); 
                handleVol(e); 
                document.addEventListener('mousemove', handleVol); 
                document.addEventListener('mouseup', () => document.removeEventListener('mousemove', handleVol), {once:true}); 
            });

            // UX Interaction
            this.#container.addEventListener('mousemove', () => this.#showControls());
            this.#container.addEventListener('mouseleave', () => this.#hideControls());
            
            // Double Tap / Keyboard / Click
            this.#setupInputs();
        }

        #setupInputs() {
            // Keyboard
            this.#container.addEventListener('keydown', (e) => {
                if(e.target.closest('input')) return;
                const k = e.key.toLowerCase();
                
                // Prevent default scrolling behavior for player keys
                if([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'k', 'f', 'm'].includes(k)) {
                    e.preventDefault();
                }

                if([' ', 'k'].includes(k)) this.#togglePlay();
                if(k === 'f') this.#toggleFullscreen();
                if(k === 'm') this.#toggleMute();
                if(k === 'arrowright' || k === 'l') this.#seek(5);
                if(k === 'arrowleft' || k === 'j') this.#seek(-5);
                if(k === 'arrowup') this.#video.volume = Math.min(1, this.#video.volume + 0.1);
                if(k === 'arrowdown') this.#video.volume = Math.max(0, this.#video.volume - 0.1);
            });

            // Unified Click & Double Tap Logic
            let lastTap = 0;
            
            const handleTap = (dir) => {
                this.#seek(dir * 10);
                this.#ripple(dir === 1 ? 'right' : 'left');
            };

            this.#container.addEventListener('click', (e) => {
                const target = e.target;
                // Ignore clicks if they originated from specific controls
                if (target.closest('button') || target.closest('.gplr-timeline-container') || target.closest('.gplr-vol-container')) return;

                const width = this.#container.clientWidth;
                const x = e.offsetX;
                const now = new Date().getTime();
                const isDoubleTap = (now - lastTap < 300);
                lastTap = now;

                if (x < width * 0.3) {
                    // Left Zone
                    if (isDoubleTap) handleTap(-1);
                    else this.#showControls();
                } else if (x > width * 0.7) {
                    // Right Zone
                    if (isDoubleTap) handleTap(1);
                    else this.#showControls();
                } else {
                    // Center Zone - Toggle Play
                    this.#togglePlay();
                }
            });
        }

        #setupMediaSession() {
            if (!('mediaSession' in navigator)) return;
            navigator.mediaSession.setActionHandler('play', () => this.#togglePlay());
            navigator.mediaSession.setActionHandler('pause', () => this.#togglePlay());
            navigator.mediaSession.setActionHandler('seekbackward', () => this.#seek(-10));
            navigator.mediaSession.setActionHandler('seekforward', () => this.#seek(10));
        }

        // --- 3. Core Methods ---

        #togglePlay() {
            this.#haptic();
            if (this.#video.paused) this.#video.play();
            else this.#video.pause();
        }

        #handlePlay() {
            this.#container.classList.add('playing');
            this.#elements.playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            this.#showControls();
            this.#loop();
        }

        #handlePause() {
            this.#container.classList.remove('playing');
            this.#elements.playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
            this.#showControls();
            cancelAnimationFrame(this.#animationFrameId);
        }

        #seek(sec) {
            this.#video.currentTime = Math.max(0, Math.min(this.#video.duration, this.#video.currentTime + sec));
            this.#showControls();
            this.#haptic();
        }

        #handleScrub(e) {
            const rect = this.#elements.timeline.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const pct = Math.max(0, Math.min(1, x / rect.width));
            this.#video.currentTime = pct * this.#video.duration;
            this.#elements.progress.style.width = (pct * 100) + '%';
        }

        #handleTimeUpdate() {
            if(this.#isScrubbing) return;
            const pct = (this.#video.currentTime / this.#video.duration) * 100;
            this.#elements.progress.style.width = `${pct}%`;
            this.#elements.timeCur.textContent = this.#fmtTime(this.#video.currentTime);
        }

        #handleLoadedMeta() {
            this.#elements.timeTot.textContent = this.#fmtTime(this.#video.duration);
            this.#loadVttThumbnails();
            this.#populateMenus();
        }

        #handleVolumeChange() {
            const v = this.#video.muted ? 0 : this.#video.volume;
            this.#elements.volInner.style.width = (v * 100) + '%';
            let icon = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'; // High
            if(v === 0) icon = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
            else if(v < 0.5) icon = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
            this.#elements.muteBtn.innerHTML = `<svg viewBox="0 0 24 24">${icon}</svg>`;
            localStorage.setItem(CustomVideoPlayer.#KEYS.VOLUME, JSON.stringify({v, m:this.#video.muted}));
        }

        #toggleFullscreen() {
            this.#haptic();
            const c = this.#container;
            if(!document.fullscreenElement) {
                if(c.requestFullscreen) c.requestFullscreen();
                else if(c.webkitRequestFullscreen) c.webkitRequestFullscreen();
                c.classList.add('fullscreen');
            } else {
                if(document.exitFullscreen) document.exitFullscreen();
                c.classList.remove('fullscreen');
            }
        }

        #toggleMute() {
            this.#video.muted = !this.#video.muted;
        }

        #showControls() {
            this.#container.classList.add('controls-visible');
            this.#container.classList.remove('no-cursor');
            clearTimeout(this.#controlsTimeout);
            if(!this.#video.paused) {
                this.#controlsTimeout = setTimeout(() => {
                    if(!this.#isScrubbing && !this.#container.querySelector('.gplr-settings.visible')) {
                        this.#hideControls();
                    }
                }, 2500);
            }
        }

        #hideControls() {
            this.#container.classList.remove('controls-visible');
            if(!this.#isTouch) this.#container.classList.add('no-cursor');
            this.#elements.menu.classList.remove('visible'); // Close menu on hide
        }

        #loop() {
            if(this.#video.paused) return;
            if(this.#container.classList.contains('ambient-active')) {
                const ctx = this.#elements.ambientCanvas.getContext('2d', {alpha: false});
                ctx.drawImage(this.#video, 0, 0, this.#elements.ambientCanvas.width, this.#elements.ambientCanvas.height);
            }
            this.#animationFrameId = requestAnimationFrame(this.#loop.bind(this));
        }

        #haptic() {
            if(this.#isTouch && navigator.vibrate) navigator.vibrate(15);
        }

        #ripple(side) {
            const el = side === 'left' ? this.#elements.rippleLeft : this.#elements.rippleRight;
            el.classList.remove('active');
            void el.offsetWidth; // trigger reflow
            el.classList.add('active');
            setTimeout(() => el.classList.remove('active'), 500);
        }

        #showToast(msg) {
            const t = this.#container.querySelector('.gplr-toast');
            t.textContent = msg;
            t.classList.add('visible');
            clearTimeout(this.#indicatorTimeout);
            this.#indicatorTimeout = setTimeout(() => t.classList.remove('visible'), 2000);
        }

        // --- 4. Features (Booster, Ambient, Menus) ---

        async #toggleBooster() {
            // Error Handling for CORS/Security restrictions
            if(!this.#mediaSource) {
                try {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    const ctx = CustomVideoPlayer.#audioContext = (CustomVideoPlayer.#audioContext || new AC());
                    if(ctx.state === 'suspended') await ctx.resume();
                    
                    this.#mediaSource = ctx.createMediaElementSource(this.#video);
                    this.#boosterGainNode = ctx.createGain();
                    this.#mediaSource.connect(this.#boosterGainNode).connect(ctx.destination);
                } catch(e) { 
                    console.error("GokuPlr Booster Error:", e);
                    this.#showToast('Booster Error: Security/CORS restriction');
                    return; 
                }
            }
            this.#isBoosterActive = !this.#isBoosterActive;
            if (this.#boosterGainNode) {
                this.#boosterGainNode.gain.value = this.#isBoosterActive ? this.#BOOSTER_MULTIPLIER : 1;
            }
            this.#updateVal('#gplr-booster', this.#isBoosterActive ? 'On' : 'Off');
            this.#showToast(`Volume Booster: ${this.#isBoosterActive ? 'ON' : 'OFF'}`);
        }

        #toggleAmbient() {
            this.#container.classList.toggle('ambient-active');
            const active = this.#container.classList.contains('ambient-active');
            this.#updateVal('#gplr-ambient', active ? 'On' : 'Off');
            if(active && !this.#video.paused) this.#loop(); // Restart loop if needed
        }

        #toggleCC() {
             const tracks = Array.from(this.#video.textTracks).filter(t => t.kind !== 'metadata');
             if (tracks.length === 0) return;
             
             // Simple toggle for main button: If any are showing, turn off. If none, turn on first.
             const anyShowing = tracks.some(t => t.mode === 'showing');
             if (anyShowing) {
                 tracks.forEach(t => t.mode = 'hidden');
                 this.#elements.ccBtn.classList.remove('active');
                 this.#updateVal('[data-target="captions"]', 'Off');
             } else {
                 tracks[0].mode = 'showing';
                 this.#elements.ccBtn.classList.add('active');
                 this.#updateVal('[data-target="captions"]', tracks[0].label || 'On');
             }
        }

        #populateMenus() {
            // Speed
            const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
            const speedList = this.#container.querySelector('.gplr-list-speed');
            speedList.innerHTML = '';
            speeds.forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'gplr-menu-item';
                btn.innerHTML = `<span>${s}x</span>${s===1?'<svg viewBox="0 0 24 24" style="width:16px;fill:var(--gplr-primary)"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>':''}`;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    this.#video.playbackRate = s;
                    this.#updateVal('[data-target="speed"]', s + 'x');
                    this.#navigateMenu(0);
                };
                speedList.appendChild(btn);
            });

            // Captions
            const ccList = this.#container.querySelector('.gplr-list-captions');
            ccList.innerHTML = '';
            const tracks = Array.from(this.#video.textTracks).filter(t => t.kind !== 'metadata');
            
            // Off Button
            const offBtn = document.createElement('button');
            offBtn.className = 'gplr-menu-item';
            offBtn.textContent = 'Off';
            offBtn.onclick = (e) => {
                e.stopPropagation();
                tracks.forEach(t => t.mode = 'hidden');
                this.#updateVal('[data-target="captions"]', 'Off');
                this.#elements.ccBtn.classList.remove('active');
                this.#navigateMenu(0);
            };
            ccList.appendChild(offBtn);

            tracks.forEach((t, i) => {
                const btn = document.createElement('button');
                btn.className = 'gplr-menu-item';
                btn.textContent = t.label || `Track ${i+1}`;
                btn.onclick = (e) => {
                    e.stopPropagation();
                    tracks.forEach(tr => tr.mode = 'hidden');
                    t.mode = 'showing';
                    this.#updateVal('[data-target="captions"]', t.label || 'On');
                    this.#elements.ccBtn.classList.add('active');
                    this.#navigateMenu(0);
                };
                ccList.appendChild(btn);
            });
        }

        #toggleMenu() {
            const m = this.#elements.menu;
            m.classList.toggle('visible');
            if(m.classList.contains('visible')) {
                this.#navigateMenu(0);
                this.#showControls();
            }
        }

        #navigateMenu(idx) {
            const panels = ['main', 'speed', 'quality', 'captions'];
            if(typeof idx === 'string') idx = panels.indexOf(idx);
            this.#elements.menuSlider.style.transform = `translateX(-${idx * 100}%)`;
        }

        #updateVal(selector, val) {
            const el = this.#container.querySelector(selector + ' span:last-child');
            if(el) el.textContent = val;
        }

        // --- 5. VTT Thumbnails & Utilities ---

        async #loadVttThumbnails() {
            const track = Array.from(this.#video.textTracks).find(t => t.kind === 'metadata' && t.label === 'thumbnails');
            if (!track) return;
            if (!track.cues || track.cues.length === 0) await new Promise(r => track.addEventListener('load', r, {once:true}));
            
            const cues = Array.from(track.cues);
            if(!cues.length) return;

            const urlMatch = cues[0].text.match(/(.+?)#xywh=(\d+),(\d+),(\d+),(\d+)/);
            if (!urlMatch) return;
            
            this.#thumbnailSprite = new Image();
            this.#thumbnailSprite.src = urlMatch[1];
            this.#vttThumbnails = cues.map(c => {
                const parts = c.text.split('=')[1].split(',');
                return { s: c.startTime, e: c.endTime, x:+parts[0], y:+parts[1], w:+parts[2], h:+parts[3] };
            });
        }

        #handleTimelineHover(e) {
            const rect = this.#elements.timeline.getBoundingClientRect();
            const pos = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const pct = Math.max(0, Math.min(1, pos / rect.width));
            
            this.#elements.hoverLine.style.width = (pct * 100) + '%';
            this.#elements.tooltip.style.display = 'flex';
            
            const time = pct * this.#video.duration;
            this.#elements.ttText.textContent = this.#fmtTime(time);
            
            // Tooltip positioning
            const ttRect = this.#elements.tooltip.getBoundingClientRect();
            let left = pos - (ttRect.width / 2);
            if(left < 0) left = 0;
            if(left + ttRect.width > rect.width) left = rect.width - ttRect.width;
            this.#elements.tooltip.style.left = left + 'px';

            // Draw Thumbnail
            if (this.#thumbnailSprite && this.#vttThumbnails.length) {
                const cue = this.#vttThumbnails.find(c => time >= c.s && time < c.e);
                if (cue) {
                    const ctx = this.#elements.ttCanvas.getContext('2d');
                    ctx.drawImage(this.#thumbnailSprite, cue.x, cue.y, cue.w, cue.h, 0, 0, this.#elements.ttCanvas.width, this.#elements.ttCanvas.height);
                }
            }
        }

        #downloadVideo() {
            const a = document.createElement('a');
            a.href = this.#video.currentSrc;
            a.download = 'video.mp4';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            this.#showToast('Download started...');
        }

        #fmtTime(s) {
            if (isNaN(s) || !isFinite(s)) return '0:00';
            const date = new Date(s * 1000);
            const str = date.toISOString().substr(11, 8);
            return str.startsWith('00:') ? str.substr(3) : str;
        }
        
        #loadSettings() {
            const vol = JSON.parse(localStorage.getItem(CustomVideoPlayer.#KEYS.VOLUME));
            if(vol) { this.#video.volume = vol.v; this.#video.muted = vol.m; }
            this.#container.querySelectorAll('[data-target]').forEach(btn => {
                btn.onclick = (e) => { e.stopPropagation(); this.#navigateMenu(btn.dataset.target); };
            });
        }
    }

    // Auto-init
    const initAll = () => document.querySelectorAll('video.gplr, video.goku, .video-js video').forEach(v => new CustomVideoPlayer(v));
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();

})();
