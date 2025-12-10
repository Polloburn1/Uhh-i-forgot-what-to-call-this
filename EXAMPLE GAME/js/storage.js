/* 
  storage.js
  Handles IndexedDB interactions for storing custom maps.
*/
import { Debug } from './debug.js';

const DB_NAME = 'SocialDeductionGameDB';
const DB_VERSION = 1;
const STORE_MAPS = 'custom_maps';

let db = null;

export const Storage = {

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        Debug.error('DB', 'Failed to open IndexedDB', event);
        reject('DB Error');
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create an objectStore for this database
        if (!db.objectStoreNames.contains(STORE_MAPS)) {
          db.createObjectStore(STORE_MAPS, { keyPath: 'id' });
          Debug.log('DB', `Created object store: ${STORE_MAPS}`);
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        Debug.log('DB', 'Storage initialized successfully');
        resolve(db);
      };
    });
  },

  async saveMap(mapData) {
    if (!db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MAPS], 'readwrite');
      const store = transaction.objectStore(STORE_MAPS);

      // Ensure ID exists
      if (!mapData.id) mapData.id = Date.now().toString();
      mapData.lastModified = Date.now();

      const request = store.put(mapData);

      request.onsuccess = () => {
        Debug.log('DB', `Map saved: ${mapData.name} (${mapData.id})`);
        resolve(mapData.id);
      };

      request.onerror = (e) => {
        Debug.error('DB', 'Error saving map', e);
        reject(e);
      };
    });
  },

  async loadAllMaps() {
    if (!db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_MAPS], 'readonly');
      const store = transaction.objectStore(STORE_MAPS);
      const request = store.getAll();

      request.onsuccess = () => {
        Debug.log('DB', `Loaded ${request.result.length} maps`);
        resolve(request.result);
      };

      request.onerror = (e) => {
        Debug.error('DB', 'Error loading maps', e);
        reject(e);
      };
    });
  }

};

// Auto-init on load
Storage.init().catch(err => console.error(err));
