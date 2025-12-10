/* 
  game_engine.js
  The Core Engine: Handles the main loop, input, rendering, and physics.
  Consolidated from: game_core, game_render, game_physics, game_input
*/

import { Debug } from './debug.js';
import { Storage } from './storage.js';

// ==========================================
// INPUT SYSTEM
// ==========================================
export const Input = {
    keys: { W: false, A: false, S: false, D: false },
    mouse: { x: 0, y: 0, down: false },

    init() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            if (this.keys.hasOwnProperty(key)) this.keys[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toUpperCase();
            if (this.keys.hasOwnProperty(key)) this.keys[key] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);

        Debug.log('Input', 'Input system initialized');
    }
};

// ==========================================
// RENDER SYSTEM
// ==========================================
export const Renderer = {
    ctx: null,
    width: 0,
    height: 0,
    camera: { x: 0, y: 0 },

    init(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            Debug.error('Render', 'Canvas not found:', canvasId);
            return;
        }
        this.ctx = canvas.getContext('2d');
        this.resize(canvas);
        window.addEventListener('resize', () => this.resize(canvas));
        Debug.log('Render', 'Renderer initialized');
    },

    resize(canvas) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        canvas.width = this.width;
        canvas.height = this.height;
    },

    clear() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    updateCamera(targetX, targetY, mapWidth, mapHeight) {
        // Center camera on target
        this.camera.x = targetX - this.width / 2;
        this.camera.y = targetY - this.height / 2;

        // Clamp to map bounds (optional, keeps camera inside map)
        if (mapWidth) {
            this.camera.x = Math.max(0, Math.min(this.camera.x, mapWidth - this.width));
            this.camera.y = Math.max(0, Math.min(this.camera.y, mapHeight - this.height));
        }
    },

    drawMap(mapImage) {
        if (!this.ctx || !mapImage) return;
        // Draw map offset by camera
        this.ctx.drawImage(mapImage, -this.camera.x, -this.camera.y);
    },

    drawPlayer(player) {
        if (!this.ctx) return;

        const screenX = player.x - this.camera.x;
        const screenY = player.y - this.camera.y;

        // Shadow
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY + 5, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fill();

        // Body
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = player.color;
        this.ctx.fill();

        // Visor (Amogus style)
        this.ctx.fillStyle = '#a1e4f7'; // Light Blue
        this.ctx.beginPath();
        const facingRight = player.dx >= 0;
        const visorX = facingRight ? screenX + 10 : screenX - 22;
        this.ctx.ellipse(visorX, screenY - 5, 12, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Name tag
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name, screenX, screenY - 30);
    }
};

// ==========================================
// PHYSICS SYSTEM
// ==========================================
export const Physics = {
    SPEED: 250, // Pixels per second

    updateMovement(entity, input, dt, mapWidth, mapHeight) {
        let dx = 0;
        let dy = 0;

        if (input.keys.W) dy -= 1;
        if (input.keys.S) dy += 1;
        if (input.keys.A) dx -= 1;
        if (input.keys.D) dx += 1;

        // Normalize diagonal
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        entity.dx = dx; // Store direction for visor drawing

        const moveX = dx * this.SPEED * dt;
        const moveY = dy * this.SPEED * dt;

        entity.x += moveX;
        entity.y += moveY;

        // Simple Bounds Check
        if (mapWidth) {
            entity.x = Math.max(20, Math.min(entity.x, mapWidth - 20));
            entity.y = Math.max(20, Math.min(entity.y, mapHeight - 20));
        }
    }
};

// ==========================================
// CORE LOOP
// ==========================================
export const Game = {
    lastTime: 0,
    running: false,
    entities: [],
    localPlayer: null,
    mapData: null,
    mapImage: null,

    async init() {
        Debug.log('Game', 'Initializing...');
        Input.init();
        Renderer.init('world-canvas');

        // Load Configuration
        const config = JSON.parse(sessionStorage.getItem('game_config') || '{}');
        const nickname = config.nickname || 'Guest';

        // Create Local Player
        this.localPlayer = {
            id: 'local',
            name: nickname,
            x: 400,
            y: 300,
            color: '#f43f5e', // Default red
            dx: 1
        };
        this.entities.push(this.localPlayer);

        // Load Map (Pick first available for now)
        await this.loadMap();

        this.start();
    },

    async loadMap() {
        try {
            const maps = await Storage.loadAllMaps();
            if (maps && maps.length > 0) {
                // Just load the last edited one for now
                this.mapData = maps[maps.length - 1];
                Debug.log('Game', `Loaded map: ${this.mapData.name}`);

                // Load Image
                const img = new Image();
                img.src = this.mapData.imageUrl;
                img.onload = () => {
                    this.mapImage = img;
                    this.localPlayer.x = this.mapData.spawns[0]?.x || 100;
                    this.localPlayer.y = this.mapData.spawns[0]?.y || 100;

                    // Setup Collision Context
                    const cvs = document.createElement('canvas');
                    cvs.width = img.width;
                    cvs.height = img.height;
                    const ctx = cvs.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    Physics.init(ctx);

                    Debug.log('Game', 'Map collision data ready');
                };
            } else {
                Debug.warn('Game', 'No custom maps found. Using empty void.');
            }
        } catch (e) {
            Debug.error('Game', 'Failed to load maps', e);
        }
    },

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    loop(timestamp) {
        if (!this.running) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    },

    update(dt) {
        const mapW = this.mapImage ? this.mapImage.width : 2000;
        const mapH = this.mapImage ? this.mapImage.height : 2000;

        Physics.updateMovement(this.localPlayer, Input, dt, mapW, mapH);
        Renderer.updateCamera(this.localPlayer.x, this.localPlayer.y, mapW, mapH);
    },

    render() {
        Renderer.clear();
        Renderer.drawMap(this.mapImage);
        this.entities.forEach(e => Renderer.drawPlayer(e));
    }
};

Game.init();
