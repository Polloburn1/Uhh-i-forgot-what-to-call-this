/* 
  game_engine.js
  The Core Engine: Handles the main loop, input, rendering, and physics.
  Consolidated from: game_core, game_render, game_physics, game_input
*/

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

        console.log('Input system initialized');
    }
};

// ==========================================
// RENDER SYSTEM
// ==========================================
export const Renderer = {
    ctx: null,
    width: 0,
    height: 0,

    init(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas not found:', canvasId);
            return;
        }
        this.ctx = canvas.getContext('2d');
        this.resize(canvas);
        window.addEventListener('resize', () => this.resize(canvas));
        console.log('Renderer initialized');
    },

    resize(canvas) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        canvas.width = this.width;
        canvas.height = this.height;
    },

    clear() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    drawPlayer(player) {
        if (!this.ctx) return;
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
};

// ==========================================
// PHYSICS SYSTEM
// ==========================================
export const Physics = {
    checkCollision(x, y, mapMask) {
        // Placeholder: Return true if wall
        return false;
    },

    updateMovement(entity, input, dt) {
        const speed = 200 * dt; // pixels per second
        if (input.keys.W) entity.y -= speed;
        if (input.keys.S) entity.y += speed;
        if (input.keys.A) entity.x -= speed;
        if (input.keys.D) entity.x += speed;
    }
};

// ==========================================
// CORE LOOP
// ==========================================
export const Game = {
    lastTime: 0,
    running: false,
    entities: [],

    init() {
        console.log('Game Engine Initializing...');
        Input.init();
        Renderer.init('world-canvas');

        // Test Entity
        this.entities.push({ x: 100, y: 100, color: '#ff0000' });

        this.start();
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
        // Basic test movement for first entity
        if (this.entities.length > 0) {
            Physics.updateMovement(this.entities[0], Input, dt);
        }
    },

    render() {
        Renderer.clear();
        this.entities.forEach(e => Renderer.drawPlayer(e));
    }
};
