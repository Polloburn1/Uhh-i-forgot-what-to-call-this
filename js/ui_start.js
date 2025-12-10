/* 
  ui_start.js
  Handles the "Start Experience": Main Menu -> Lobby Setup -> Game Start.
  Replaces: ui_menu.js, ui_lobby.js
*/

import { Debug } from './debug.js';
import { initNetwork } from './network.js';

const View = {
    MENU: 'view-menu',
    LOBBY: 'view-lobby'
};

export function init() {
    Debug.log('UI', 'Initializing Start Screen...');

    // Bind Menu Buttons
    bind('btn-to-lobby', () => switchView(View.LOBBY));
    bind('btn-to-editor', () => window.location.href = 'editor.html');

    // Bind Lobby Buttons
    bind('btn-host', () => startGame(true));
    bind('btn-join', () => startGame(false));
    bind('btn-back', () => switchView(View.MENU));

    // Start at menu
    switchView(View.MENU);
}

function bind(id, action) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', action);
    else Debug.warn(`UI button not found: ${id}`);
}

function switchView(viewId) {
    Debug.log('UI', `Switching to ${viewId}`);
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId)?.classList.remove('hidden');
}

function startGame(isHost) {
    const nickname = document.getElementById('nickname')?.value || 'Player';
    Debug.log('Game', `Starting game. Host: ${isHost}, Name: ${nickname}`);

    // Initialize Network
    initNetwork(isHost);

    // Transition to Game Page (in a real SPA we'd swap views, but for now we redirect)
    // To keep state, we might need to pass params via URL or sessionStorage.
    // For now, let's just save to session storage.
    sessionStorage.setItem('game_config', JSON.stringify({ isHost, nickname }));
    window.location.href = 'game.html';
}

// Auto-run
init();
