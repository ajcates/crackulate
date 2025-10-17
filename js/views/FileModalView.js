/**
 * File Modal View - Handles file modal UI interactions
 */
export class FileModalView {
  #elements;
  #eventHandlers = new Map();
  #deleteMode = false;
  #escapeHandler;

  constructor() {
    this.#elements = this.#initializeElements();
    this.#bindInternalEvents();
  }
  
  /**
   * Initialize DOM element references
   */
  #initializeElements() {
    const elements = {
      modal: document.getElementById('file-modal'),
      title: document.getElementById('modal-title'),
      closeBtn: document.getElementById('modal-close'),
      fileListSection: document.getElementById('file-list-section'),
      saveFormSection: document.getElementById('save-form-section'),
      fileList: document.getElementById('file-list'),
      emptyMessage: document.getElementById('file-list-empty'),
      fileNameInput: document.getElementById('file-name-input'),
      saveConfirm: document.getElementById('save-confirm'),
      saveCancel: document.getElementById('save-cancel'),
      deleteToggle: document.getElementById('delete-mode-toggle')
    };
    
    // Validate required elements
    Object.entries(elements).forEach(([key, element]) => {
      if (!element) {
        throw new Error(`Required modal element not found: ${key}`);
      }
    });
    
    return elements;
  }
  
  /**
   * Bind internal DOM events
   */
  #bindInternalEvents() {
    // Close modal events
    this.#elements.closeBtn.addEventListener('click', () => this.close());
    this.#elements.modal.addEventListener('click', (e) => {
      if (e.target === this.#elements.modal) this.close();
    });

    // ESC key to close modal
    this.#escapeHandler = (e) => {
      if (e.key === 'Escape' && !this.#elements.modal.classList.contains('hidden')) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.#escapeHandler);

    // Save form events
    this.#elements.saveCancel.addEventListener('click', () => this.close());
    this.#elements.fileNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.#triggerSaveConfirm();
      }
    });

    // Delete mode toggle
    this.#elements.deleteToggle.addEventListener('click', () => {
      this.#toggleDeleteMode();
    });
  }
  
  /**
   * Show file list modal
   */
  showFileList(files) {
    this.#elements.title.textContent = 'Files';
    this.#showFileListSection();
    this.#renderFileList(files);
    this.show();
  }
  
  /**
   * Show save form modal
   */
  showSaveForm(suggestedName = '') {
    this.#elements.title.textContent = 'Save File';
    this.#showSaveFormSection();
    this.#elements.fileNameInput.value = suggestedName;
    this.show();
    
    // Focus input after modal is visible
    setTimeout(() => this.#elements.fileNameInput.focus(), 100);
  }
  
  /**
   * Show the modal
   */
  show() {
    this.#elements.modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
  
  /**
   * Close the modal
   */
  close() {
    this.#elements.modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    this.#resetDeleteMode();
    
    // Trigger close event
    this.#triggerEvent('close');
  }
  
  /**
   * Register event handler
   */
  on(event, callback) {
    if (!this.#eventHandlers.has(event)) {
      this.#eventHandlers.set(event, new Set());
    }
    this.#eventHandlers.get(event).add(callback);
    
    return () => this.#eventHandlers.get(event)?.delete(callback);
  }
  
  /**
   * Show file list section
   */
  #showFileListSection() {
    this.#elements.fileListSection.classList.remove('hidden');
    this.#elements.saveFormSection.classList.add('hidden');
  }
  
  /**
   * Show save form section
   */
  #showSaveFormSection() {
    this.#elements.fileListSection.classList.add('hidden');
    this.#elements.saveFormSection.classList.remove('hidden');
  }
  
  /**
   * Render file list
   */
  #renderFileList(files) {
    if (files.length === 0) {
      this.#elements.emptyMessage.classList.remove('hidden');
      this.#elements.fileList.classList.add('hidden');
      return;
    }
    
    this.#elements.emptyMessage.classList.add('hidden');
    this.#elements.fileList.classList.remove('hidden');
    
    const fileElements = files.sort().map(fileName => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      
      button.className = `file-button${this.#deleteMode ? ' delete-mode' : ''}`;
      button.innerHTML = `
        <span class="material-icons file-icon">description</span>
        <span class="file-name">${this.#escapeHtml(fileName)}</span>
        ${this.#deleteMode ? '<span class="material-icons delete-icon">delete</span>' : ''}
      `;
      
      if (this.#deleteMode) {
        button.addEventListener('click', () => {
          this.#triggerEvent('fileDelete', fileName);
        });
      } else {
        button.addEventListener('click', () => {
          this.#triggerEvent('fileOpen', fileName);
        });
      }
      
      li.appendChild(button);
      return li;
    });
    
    this.#elements.fileList.innerHTML = '';
    fileElements.forEach(el => this.#elements.fileList.appendChild(el));
  }
  
  /**
   * Toggle delete mode
   */
  #toggleDeleteMode() {
    this.#deleteMode = !this.#deleteMode;

    if (this.#deleteMode) {
      this.#elements.deleteToggle.innerHTML = '<span class="material-icons">close</span> Exit';
      this.#elements.deleteToggle.className = 'action-btn cancel-btn';
    } else {
      this.#elements.deleteToggle.innerHTML = '<span class="material-icons">delete</span> Delete';
      this.#elements.deleteToggle.className = 'action-btn delete-btn';
    }

    // Re-render current file list with new delete mode
    this.#triggerEvent('deleteToggle', this.#deleteMode);
  }

  /**
   * Reset delete mode
   */
  #resetDeleteMode() {
    this.#deleteMode = false;
    this.#elements.deleteToggle.innerHTML = '<span class="material-icons">delete</span> Delete';
    this.#elements.deleteToggle.className = 'action-btn delete-btn';
  }
  
  /**
   * Get current file name input value
   */
  getFileName() {
    return this.#elements.fileNameInput.value.trim();
  }
  
  /**
   * Set up save confirm handler
   */
  onSaveConfirm(callback) {
    this.#elements.saveConfirm.addEventListener('click', callback);
  }
  
  /**
   * Trigger save confirm event
   */
  #triggerSaveConfirm() {
    this.#triggerEvent('saveConfirm', this.getFileName());
  }
  
  /**
   * Trigger custom event
   */
  #triggerEvent(event, data) {
    const handlers = this.#eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }
  
  /**
   * Escape HTML characters
   */
  #escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    if (this.#escapeHandler) {
      document.removeEventListener('keydown', this.#escapeHandler);
    }
    this.#eventHandlers.clear();
  }
}