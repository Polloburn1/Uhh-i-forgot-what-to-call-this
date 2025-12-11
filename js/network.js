/* 
  network.js
  Handles WebRTC signaling and data transmission.
*/

export const NetState = {
    isHost: false,
    peers: []
};

export function initNetwork(hostMode) {
    NetState.isHost = hostMode;
    console.log('Network initialized. Host mode:', hostMode);
    // WebRTC setup will go here
}
