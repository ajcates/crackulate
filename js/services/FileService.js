/**
 * File Service - Handles file operations with proper error handling
 * High cohesion: Only responsible for file I/O operations
 */
export class FileService {
  #storage;
  
  constructor(storage) {
    this.#storage = storage;
  }
  
  /**
   * Load file content
   * @param {string} fileName - Name of file to load
   * @returns {Promise<{content: string, fileName: string}>}
   */
  async loadFile(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name provided');
    }
    
    try {
      const content = this.#storage.getItem(`calcedit_file_${fileName}`);
      
      if (content === null) {
        throw new Error(`File "${fileName}" not found`);
      }
      
      return { 
        content, 
        fileName,
        loadedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to load file "${fileName}": ${error.message}`);
    }
  }
  
  /**
   * Save file content
   * @param {string} fileName - Name of file to save
   * @param {string} content - File content
   * @returns {Promise<{fileName: string, saved: boolean, savedAt: string}>}
   */
  async saveFile(fileName, content) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name provided');
    }
    
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
    
    try {
      const success = this.#storage.setItem(`calcedit_file_${fileName}`, content);
      
      if (!success) {
        throw new Error('Storage operation failed - storage may be full');
      }
      
      return { 
        fileName, 
        saved: true,
        savedAt: new Date().toISOString(),
        size: content.length
      };
    } catch (error) {
      throw new Error(`Failed to save file "${fileName}": ${error.message}`);
    }
  }
  
  /**
   * List all available files
   * @returns {Promise<string[]>} Array of file names
   */
  async listFiles() {
    try {
      const files = this.#storage.getKeysWithPrefix('calcedit_file_').map(key => key.slice(14));
      return files.sort((a, b) => a.localeCompare(b));
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
  
  /**
   * Delete a file
   * @param {string} fileName - Name of file to delete
   * @returns {Promise<{fileName: string, deleted: boolean}>}
   */
  async deleteFile(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name provided');
    }
    
    try {
      const success = this.#storage.removeItem(`calcedit_file_${fileName}`);
      
      if (!success) {
        throw new Error('Delete operation failed');
      }
      
      return { 
        fileName, 
        deleted: true,
        deletedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to delete file "${fileName}": ${error.message}`);
    }
  }
  
  /**
   * Check if file exists
   * @param {string} fileName - Name of file to check
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(fileName) {
    try {
      const content = this.#storage.getItem(`calcedit_file_${fileName}`);
      return content !== null;
    } catch {
      return false;
    }
  }
  
  /**
   * Get file metadata
   * @param {string} fileName - Name of file
   * @returns {Promise<{name: string, size: number, exists: boolean}>}
   */
  async getFileInfo(fileName) {
    try {
      const content = this.#storage.getItem(`calcedit_file_${fileName}`);
      
      if (content === null) {
        return { name: fileName, exists: false };
      }
      
      return {
        name: fileName,
        exists: true,
        size: content.length,
        lastModified: new Date().toISOString() // Storage doesn't track this
      };
    } catch (error) {
      throw new Error(`Failed to get file info for "${fileName}": ${error.message}`);
    }
  }
  
  /**
   * Create backup of current content
   * @param {string} content - Content to backup
   * @returns {Promise<string>} Backup file name
   */
  async createBackup(content) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    
    await this.saveFile(backupName, content);
    return backupName;
  }
}