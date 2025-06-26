// File Overview: js/storageUtils.js
// This file provides centralized localStorage operations with comprehensive error handling.
// It wraps all localStorage operations to handle common storage exceptions gracefully.

/**
 * Safe localStorage wrapper with comprehensive error handling
 */
class StorageManager {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if localStorage is available and functional
   * @returns {boolean} True if localStorage is available
   */
  checkAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e.message);
      return false;
    }
  }

  /**
   * Safely get an item from localStorage
   * @param {string} key - The key to retrieve
   * @param {*} defaultValue - Default value if key doesn't exist or error occurs
   * @returns {*} The stored value or default value
   */
  getItem(key, defaultValue = null) {
    if (!this.isAvailable) {
      console.warn(`Storage unavailable, returning default for key: ${key}`);
      return defaultValue;
    }

    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      console.error(`Error getting item '${key}' from localStorage:`, e);
      return defaultValue;
    }
  }

  /**
   * Safely set an item in localStorage
   * @param {string} key - The key to set
   * @param {string} value - The value to store
   * @returns {boolean} True if successful, false otherwise
   */
  setItem(key, value) {
    if (!this.isAvailable) {
      console.warn(`Storage unavailable, cannot set key: ${key}`);
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error(`Error setting item '${key}' in localStorage:`, e);
      
      if (e.name === 'QuotaExceededError') {
        // Try to free up space by removing old autosave content
        this.clearAutosave();
        // Try again after cleanup
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error(`Failed to set '${key}' even after cleanup:`, retryError);
        }
      }
      
      return false;
    }
  }

  /**
   * Safely remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  removeItem(key) {
    if (!this.isAvailable) {
      console.warn(`Storage unavailable, cannot remove key: ${key}`);
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing item '${key}' from localStorage:`, e);
      return false;
    }
  }

  /**
   * Get all keys matching a prefix
   * @param {string} prefix - The prefix to match
   * @returns {string[]} Array of matching keys
   */
  getKeysWithPrefix(prefix) {
    if (!this.isAvailable) {
      console.warn('Storage unavailable, returning empty array');
      return [];
    }

    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage keys:', e);
    }
    
    return keys;
  }

  /**
   * Clear autosave content to free up space
   */
  clearAutosave() {
    try {
      localStorage.removeItem('calcedit_content');
      console.info('Cleared autosave content to free up storage space');
    } catch (e) {
      console.error('Error clearing autosave content:', e);
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Object with usage statistics
   */
  getUsageInfo() {
    if (!this.isAvailable) {
      return { available: false };
    }

    try {
      const usage = JSON.stringify(localStorage).length;
      const fileCount = this.getKeysWithPrefix('calcedit_file_').length;
      
      return {
        available: true,
        totalBytes: usage,
        fileCount: fileCount,
        hasAutosave: localStorage.getItem('calcedit_content') !== null
      };
    } catch (e) {
      console.error('Error getting storage usage info:', e);
      return { available: true, error: e.message };
    }
  }
}

// Create and export a singleton instance
export const storage = new StorageManager();

// Convenience functions for common operations
export const getFile = (fileName) => storage.getItem(`calcedit_file_${fileName}`);
export const saveFile = (fileName, content) => storage.setItem(`calcedit_file_${fileName}`, content);
export const deleteFile = (fileName) => storage.removeItem(`calcedit_file_${fileName}`);
export const getFileList = () => storage.getKeysWithPrefix('calcedit_file_').map(key => key.slice(14));
export const getAutosave = () => storage.getItem('calcedit_content');
export const saveAutosave = (content) => storage.setItem('calcedit_content', content);
export const clearAutosave = () => storage.removeItem('calcedit_content');