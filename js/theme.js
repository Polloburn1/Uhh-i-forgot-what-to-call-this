/**
 * theme.js
 * Handles Theme (Light/Dark) and Background (Image/CSS) preferences.
 * Includes animation logic for the main menu background.
 */
import { Debug } from './debug.js'; // Assuming debug.js exists, otherwise we'll remove import

const THEME_KEY = 'amogus_theme';
const BG_MODE_KEY = 'amogus_bg_mode';

export const ThemeManager = {
    state: {
        isLight: false,
        bgMode: 'image' // 'image' | 'css' | 'none'
    },

    init() {
        // Load preferences
        const savedTheme = localStorage.getItem(THEME_KEY);
        const savedBg = localStorage.getItem(BG_MODE_KEY);

        this.state.isLight = savedTheme === 'light';
        this.state.bgMode = savedBg || 'image';

        this.applyTheme();
        this.initBackground();

        // Expose to window for UI buttons
        window.toggleTheme = () => this.toggleTheme();
        window.toggleBgMode = () => this.cycleBgMode();

        console.log("Theme Manager Initialized", this.state);
    },

    toggleTheme() {
        this.state.isLight = !this.state.isLight;
        localStorage.setItem(THEME_KEY, this.state.isLight ? 'light' : 'dark');
        this.applyTheme();
    },

    cycleBgMode() {
        // Cycle: image -> css -> none -> image
        if (this.state.bgMode === 'image') this.state.bgMode = 'css';
        else if (this.state.bgMode === 'css') this.state.bgMode = 'none';
        else this.state.bgMode = 'image';

        localStorage.setItem(BG_MODE_KEY, this.state.bgMode);
        this.initBackground(); // Re-render
    },

    applyTheme() {
        const doc = document.documentElement;
        if (this.state.isLight) {
            doc.classList.add('light-theme');
        } else {
            doc.classList.remove('light-theme');
        }
    },

    initBackground() {
        const container = document.body;
        // Clean up existing
        const existing = document.querySelectorAll('.bg-anim-layer');
        existing.forEach(el => el.remove());

        if (this.state.bgMode === 'none') return;

        const layer = document.createElement('div');
        layer.className = 'bg-anim-layer';
        container.prepend(layer);

        if (this.state.bgMode === 'image') {
            this.spawnImageElements(layer);
        } else if (this.state.bgMode === 'css') {
            this.spawnCssElements(layer);
        }
    },

    spawnImageElements(layer) {
        // Placeholders as requested
        const images = ['among1.png', 'among2.png', 'among3.png'];

        // Spawn a few random floaters
        for (let i = 0; i < 5; i++) {
            const img = document.createElement('img');
            const src = images[i % images.length];
            img.src = `assets/${src}`; // Will fail if missing -> testing fallback
            img.className = 'anim-floater';

            // Random positioning & delay
            this.randomizeElement(img);

            // FALLBACK: If image fails, remove it (or swap to CSS orb if we wanted)
            img.onerror = () => {
                console.warn(`Background image failed: ${src} (Fallback active)`);
                img.style.display = 'none';
                // Optional: Replace with CSS orb?
                // img.remove(); 
            };

            layer.appendChild(img);
        }
    },

    spawnCssElements(layer) {
        for (let i = 0; i < 6; i++) {
            const div = document.createElement('div');
            div.className = 'anim-orb';
            this.randomizeElement(div);
            layer.appendChild(div);
        }
    },

    randomizeElement(el) {
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = Math.random() * 100 + 'vh';
        el.style.animationDelay = Math.random() * 5 + 's';
        el.style.animationDuration = (10 + Math.random() * 20) + 's';

        // Random scale
        const scale = 0.5 + Math.random() * 1.5;
        el.style.transform = `scale(${scale})`;
    }
};

// Initial run
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
