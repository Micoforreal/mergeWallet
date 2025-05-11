import config from '../config/lightProtocol';

/**
 * StorageService provides persistent storage with IndexedDB and fallback to localStorage
 */
export class StorageService {
  constructor() {
    this.dbName = config.INDEXEDDB_NAME;
    this.dbVersion = config.INDEXEDDB_VERSION;
    this.storeName = config.INDEXEDDB_STORE;
    this.db = null;
    this.isIndexedDBSupported = this._checkIndexedDBSupport();
    this._init();
  }

  /**
   * Check if IndexedDB is supported in the current browser
   * @private
   * @returns {boolean} - True if IndexedDB is supported
   */
  _checkIndexedDBSupport() {
    return window && 'indexedDB' in window;
  }

  /**
   * Initialize the IndexedDB database
   * @private
   */
  _init() {
    if (!this.isIndexedDBSupported) {
      console.warn('IndexedDB is not supported, falling back to localStorage');
      return;
    }

    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      this.isIndexedDBSupported = false;
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'key' });
        console.log(`Created object store: ${this.storeName}`);
      }
    };

    request.onsuccess = (event) => {
      this.db = event.target.result;
      console.log('IndexedDB initialized successfully');
      
      // Migrate localStorage data to IndexedDB if needed
      this._migrateFromLocalStorage();
    };
  }

  /**
   * Migrate data from localStorage to IndexedDB
   * @private
   */
  async _migrateFromLocalStorage() {
    if (!this.isIndexedDBSupported || !this.db) return;

    try {
      // Get all keys that match our prefix
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(config.PREFIX)) {
          keys.push(key);
        }
      }

      if (keys.length === 0) return;

      console.log(`Migrating ${keys.length} items from localStorage to IndexedDB`);

      // Migrate each item
      for (const key of keys) {
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          await this.setItem(key, parsed);
          
          // Keep in localStorage as backup but mark as migrated
          const migratedValue = JSON.stringify({
            ...parsed,
            _migrated: true,
            _migratedAt: new Date().toISOString()
          });
          localStorage.setItem(key, migratedValue);
        } catch (e) {
          console.error(`Error migrating key ${key}:`, e);
        }
      }

      console.log('Migration from localStorage to IndexedDB complete');
    } catch (error) {
      console.error('Error during migration from localStorage:', error);
    }
  }

  /**
   * Get an item from storage
   * @param {string} key - The key to retrieve
   * @returns {Promise<any>} - The stored value or null if not found
   */
  async getItem(key) {
    // Try IndexedDB first
    if (this.isIndexedDBSupported && this.db) {
      try {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);
          const request = store.get(key);

          request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.value : null);
          };

          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.warn('Error reading from IndexedDB, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Set an item in storage
   * @param {string} key - The key to store
   * @param {any} value - The value to store
   * @returns {Promise<boolean>} - True if successful
   */
  async setItem(key, value) {
    // Try to store in IndexedDB
    if (this.isIndexedDBSupported && this.db) {
      try {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.put({ key, value });

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.warn('Error writing to IndexedDB, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key - The key to remove
   * @returns {Promise<boolean>} - True if successful
   */
  async removeItem(key) {
    let success = false;

    // Try to remove from IndexedDB
    if (this.isIndexedDBSupported && this.db) {
      try {
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.delete(key);

          request.onsuccess = () => {
            success = true;
            resolve();
          };

          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.warn('Error removing from IndexedDB:', error);
      }
    }

    // Also remove from localStorage
    try {
      localStorage.removeItem(key);
      success = true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }

    return success;
  }

  /**
   * Clear all items in storage that match our prefix
   * @returns {Promise<boolean>} - True if successful
   */
  async clear() {
    let success = false;

    // Clear from IndexedDB
    if (this.isIndexedDBSupported && this.db) {
      try {
        await new Promise((resolve, reject) => {
          const transaction = this.db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.clear();

          request.onsuccess = () => {
            success = true;
            resolve();
          };

          request.onerror = (event) => {
            reject(event.target.error);
          };
        });
      } catch (error) {
        console.warn('Error clearing IndexedDB:', error);
      }
    }

    // Clear matching items from localStorage
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(config.PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      success = true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }

    return success;
  }
}

// Export a singleton instance
export default new StorageService(); 