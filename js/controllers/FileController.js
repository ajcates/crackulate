import { eventBus } from '../core/EventBus.js';

/**
 * File Controller - Manages file operations and modal interactions
 */
export class FileController {
  #state;
  #fileService;
  #modalView;
  #confirmationService;
  #notificationService;
  #unsubscribers = [];
  
  constructor(state, fileService, modalView, confirmationService, notificationService) {
    this.#state = state;
    this.#fileService = fileService;
    this.#modalView = modalView;
    this.#confirmationService = confirmationService;
    this.#notificationService = notificationService;
    this.#bindEvents();
  }
  
  /**
   * Bind events and initialize controller
   */
  #bindEvents() {
    // Bind file operation buttons
    this.#bindFileButtons();
    
    // Bind modal events
    this.#bindModalEvents();
    
    // Subscribe to application events
    this.#unsubscribers.push(
      eventBus.subscribe('file:new', this.#handleNew.bind(this)),
      eventBus.subscribe('file:open', this.#handleOpen.bind(this)),
      eventBus.subscribe('file:save', this.#handleSave.bind(this)),
      this.#state.subscribe(this.#handleStateChange.bind(this))
    );
  }
  
  /**
   * Bind file operation buttons
   */
  #bindFileButtons() {
    const newBtn = document.getElementById('new');
    const openBtn = document.getElementById('open');
    const saveBtn = document.getElementById('save');
    
    if (newBtn) newBtn.addEventListener('click', () => this.#handleNew());
    if (openBtn) openBtn.addEventListener('click', () => this.#handleOpen());
    if (saveBtn) saveBtn.addEventListener('click', () => this.#handleSave());
  }
  
  /**
   * Bind modal view events
   */
  #bindModalEvents() {
    this.#modalView.on('fileOpen', this.#handleFileOpen.bind(this));
    this.#modalView.on('fileDelete', this.#handleFileDelete.bind(this));
    this.#modalView.on('saveConfirm', this.#handleSaveConfirm.bind(this));
    this.#modalView.onSaveConfirm(() => {
      const fileName = this.#modalView.getFileName();
      this.#handleSaveConfirm(fileName);
    });
  }
  
  /**
   * Handle new file operation
   */
  async #handleNew() {
    if (await this.#checkUnsavedChanges()) {
      const confirmed = await this.#confirmationService.confirm(
        'Unsaved Changes',
        'You have unsaved changes. Create new file anyway?'
      );
      
      if (!confirmed) return;
    }
    
    await this.#createNewFile();
  }
  
  /**
   * Handle open file operation
   */
  async #handleOpen() {
    try {
      const files = await this.#fileService.listFiles();
      this.#modalView.showFileList(files);
    } catch (error) {
      await this.#notificationService.error(`Failed to load file list: ${error.message}`);
    }
  }
  
  /**
   * Handle save file operation
   */
  async #handleSave() {
    const currentFileName = this.#state.getState('currentFile');
    
    if (currentFileName) {
      // Save to existing file
      await this.#saveToFile(currentFileName);
    } else {
      // Show save as dialog
      this.#modalView.showSaveForm();
    }
  }
  
  /**
   * Handle file open from modal
   */
  async #handleFileOpen(fileName) {
    if (await this.#checkUnsavedChanges()) {
      const confirmed = await this.#confirmationService.confirm(
        'Unsaved Changes',
        `You have unsaved changes. Open "${fileName}" anyway?`
      );
      
      if (!confirmed) return;
    }
    
    await this.#loadFile(fileName);
  }
  
  /**
   * Handle file delete from modal
   */
  async #handleFileDelete(fileName) {
    const confirmed = await this.#confirmationService.confirm(
      'Delete File',
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await this.#fileService.deleteFile(fileName);
      await this.#notificationService.success(`Deleted "${fileName}"`);
      
      // If deleted file is currently open, clear it
      if (this.#state.getState('currentFile') === fileName) {
        await this.#state.setState({ currentFile: null });
      }
      
      // Refresh file list
      const files = await this.#fileService.listFiles();
      this.#modalView.showFileList(files);
      
    } catch (error) {
      await this.#notificationService.error(`Failed to delete file: ${error.message}`);
    }
  }
  
  /**
   * Handle save confirmation from modal
   */
  async #handleSaveConfirm(fileName) {
    if (!fileName) {
      await this.#notificationService.error('Please enter a file name');
      return;
    }
    
    try {
      // Check if file exists and is different from current file
      const fileExists = await this.#fileService.fileExists(fileName);
      const currentFileName = this.#state.getState('currentFile');
      
      if (fileExists && fileName !== currentFileName) {
        this.#modalView.close();
        
        const confirmed = await this.#confirmationService.confirm(
          'File Exists',
          `A file named "${fileName}" already exists. Overwrite it?`
        );
        
        if (!confirmed) {
          this.#modalView.showSaveForm(fileName);
          return;
        }
      }
      
      await this.#saveToFile(fileName);
      
    } catch (error) {
      await this.#notificationService.error(`Error checking file: ${error.message}`);
    }
  }
  
  /**
   * Create new file
   */
  async #createNewFile() {
    await this.#state.setState({
      'editor.content': '',
      currentFile: null,
      variables: {},
      results: [],
      'ui.hasUnsavedChanges': false
    });
    
    await this.#notificationService.success('New file created');
  }
  
  /**
   * Load file content
   */
  async #loadFile(fileName) {
    try {
      const { content } = await this.#fileService.loadFile(fileName);
      
      await this.#state.setState({
        'editor.content': content,
        currentFile: fileName,
        'ui.hasUnsavedChanges': false
      });
      
      this.#modalView.close();
      await this.#notificationService.success(`Opened "${fileName}"`);
      
    } catch (error) {
      await this.#notificationService.error(error.message);
    }
  }
  
  /**
   * Save content to file
   */
  async #saveToFile(fileName) {
    try {
      const content = this.#state.getState('editor.content');
      
      await this.#fileService.saveFile(fileName, content);
      
      await this.#state.setState({
        currentFile: fileName,
        'ui.hasUnsavedChanges': false
      });
      
      this.#modalView.close();
      await this.#notificationService.success(`Saved as "${fileName}"`);
      
    } catch (error) {
      await this.#notificationService.error(error.message);
    }
  }
  
  /**
   * Check if there are unsaved changes
   */
  async #checkUnsavedChanges() {
    const hasUnsavedChanges = this.#state.getState('ui.hasUnsavedChanges');
    const content = this.#state.getState('editor.content');
    
    // If no content, no unsaved changes
    if (!content.trim()) return false;
    
    return hasUnsavedChanges;
  }
  
  /**
   * Handle state changes
   */
  #handleStateChange({ updates }) {
    // Update file name display when current file changes
    if ('currentFile' in updates) {
      this.#updateFileNameDisplay(updates.currentFile);
    }
    
    // Update save status indicator
    if ('ui.hasUnsavedChanges' in updates) {
      this.#updateSaveStatus(updates['ui.hasUnsavedChanges']);
    }
  }
  
  /**
   * Update file name display in header
   */
  #updateFileNameDisplay(fileName) {
    const display = document.getElementById('current-file-name');
    if (display) {
      display.textContent = fileName || 'Untitled';
      display.className = fileName ? 'has-file' : 'no-file';
    }
  }
  
  /**
   * Update save status indicator
   */
  #updateSaveStatus(hasChanges) {
    const status = document.getElementById('save-status');
    if (status) {
      if (hasChanges) {
        status.classList.remove('hidden');
        status.title = 'Unsaved changes';
      } else {
        status.classList.add('hidden');
      }
    }
  }
  
  /**
   * Get current file information
   */
  getFileInfo() {
    return {
      currentFile: this.#state.getState('currentFile'),
      hasUnsavedChanges: this.#state.getState('ui.hasUnsavedChanges'),
      contentLength: this.#state.getState('editor.content').length
    };
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.#unsubscribers.forEach(unsubscribe => unsubscribe());
    this.#unsubscribers = [];
    this.#modalView.destroy();
  }
}