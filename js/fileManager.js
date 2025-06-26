import * as domUtils from './domUtils.js';
import { storage, getFile, saveFile, getFileList, getAutosave, deleteFile } from './storageUtils.js';

class FileManager {
  constructor() {
    this.currentOperation = null;
    this.deleteMode = false;
    this.pendingAction = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateFileNameDisplay();
  }

  bindEvents() {
    // File operation buttons
    document.getElementById('new').addEventListener('click', () => this.handleNew());
    document.getElementById('open').addEventListener('click', () => this.handleOpen());
    document.getElementById('save').addEventListener('click', () => this.handleSave());

    // Modal controls
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('file-modal').addEventListener('click', (e) => {
      if (e.target.id === 'file-modal') this.closeModal();
    });

    // Save form controls
    document.getElementById('save-confirm').addEventListener('click', () => this.confirmSave());
    document.getElementById('save-cancel').addEventListener('click', () => this.closeModal());
    document.getElementById('file-name-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.confirmSave();
    });

    // Delete mode toggle
    document.getElementById('delete-mode-toggle').addEventListener('click', () => this.toggleDeleteMode());

    // Confirmation modal
    document.getElementById('confirm-yes').addEventListener('click', () => this.confirmAction());
    document.getElementById('confirm-no').addEventListener('click', () => this.closeConfirmModal());
    document.getElementById('confirm-modal').addEventListener('click', (e) => {
      if (e.target.id === 'confirm-modal') this.closeConfirmModal();
    });
  }

  handleNew() {
    if (this.hasUnsavedChanges()) {
      this.showConfirmation('Unsaved Changes', 
        'You have unsaved changes. Create new file anyway?', 
        () => this.createNewFile()
      );
    } else {
      this.createNewFile();
    }
  }

  handleOpen() {
    this.currentOperation = 'open';
    this.showFileList();
  }

  handleSave() {
    if (domUtils.currentFileName) {
      // Save to existing file
      this.saveToFile(domUtils.currentFileName);
    } else {
      // Save as new file
      this.currentOperation = 'save';
      this.showSaveForm();
    }
  }

  createNewFile() {
    domUtils.clearPage();
    domUtils.currentFileName = null;
    this.updateFileNameDisplay();
    this.updateSaveStatus(false);
  }

  showFileList() {
    const fileList = document.getElementById('file-list');
    const emptyMessage = document.getElementById('file-list-empty');
    const files = getFileList();

    // Show/hide sections
    document.getElementById('file-list-section').classList.remove('hidden');
    document.getElementById('save-form-section').classList.add('hidden');
    document.getElementById('modal-title').textContent = 'Files';

    fileList.innerHTML = '';

    if (files.length === 0) {
      emptyMessage.classList.remove('hidden');
      fileList.classList.add('hidden');
    } else {
      emptyMessage.classList.add('hidden');
      fileList.classList.remove('hidden');

      files.sort().forEach(fileName => {
        const li = document.createElement('li');
        
        const fileButton = document.createElement('button');
        fileButton.className = 'file-button';
        if (this.deleteMode) {
          fileButton.className += ' delete-mode';
        }
        
        fileButton.innerHTML = `
          <span class="file-icon">📄</span>
          <span class="file-name">${fileName}</span>
          ${this.deleteMode ? '<span class="delete-icon">🗑️</span>' : ''}
        `;

        if (this.deleteMode) {
          fileButton.addEventListener('click', () => this.deleteFile(fileName));
        } else {
          fileButton.addEventListener('click', () => this.openFile(fileName));
        }

        li.appendChild(fileButton);
        fileList.appendChild(li);
      });
    }

    this.showModal();
  }

  showSaveForm(suggestedName = '') {
    document.getElementById('file-list-section').classList.add('hidden');
    document.getElementById('save-form-section').classList.remove('hidden');
    document.getElementById('modal-title').textContent = 'Save File';
    
    const input = document.getElementById('file-name-input');
    input.value = suggestedName;
    
    this.showModal();
    setTimeout(() => input.focus(), 100);
  }

  openFile(fileName) {
    if (this.hasUnsavedChanges()) {
      this.showConfirmation('Unsaved Changes', 
        `You have unsaved changes. Open "${fileName}" anyway?`, 
        () => this.loadFile(fileName)
      );
    } else {
      this.loadFile(fileName);
    }
  }

  loadFile(fileName) {
    const content = getFile(fileName);
    if (content === null) {
      this.showNotification('Error: File could not be loaded', 'error');
      return;
    }

    domUtils.editor.value = content;
    domUtils.undoStack = [content];
    domUtils.currentFileName = fileName;
    domUtils.updateResults();
    
    this.updateFileNameDisplay();
    this.updateSaveStatus(false);
    this.closeModal();
    this.showNotification(`Opened "${fileName}"`, 'success');
  }

  deleteFile(fileName) {
    this.showConfirmation('Delete File', 
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`, 
      () => {
        if (deleteFile(fileName)) {
          this.showNotification(`Deleted "${fileName}"`, 'success');
          if (domUtils.currentFileName === fileName) {
            domUtils.currentFileName = null;
            this.updateFileNameDisplay();
          }
          this.showFileList(); // Refresh the list
        } else {
          this.showNotification('Failed to delete file', 'error');
        }
      }
    );
  }

  confirmSave() {
    const fileName = document.getElementById('file-name-input').value.trim();
    
    if (!fileName) {
      this.showNotification('Please enter a file name', 'error');
      return;
    }

    if (getFile(fileName) !== null && fileName !== domUtils.currentFileName) {
      this.showConfirmation('File Exists', 
        `A file named "${fileName}" already exists. Overwrite it?`, 
        () => this.saveToFile(fileName)
      );
    } else {
      this.saveToFile(fileName);
    }
  }

  saveToFile(fileName) {
    const success = saveFile(fileName, domUtils.editor.value);
    
    if (success) {
      domUtils.currentFileName = fileName;
      this.updateFileNameDisplay();
      this.updateSaveStatus(false);
      this.closeModal();
      this.showNotification(`Saved as "${fileName}"`, 'success');
    } else {
      this.showNotification('Failed to save file. Storage may be full.', 'error');
    }
  }

  toggleDeleteMode() {
    this.deleteMode = !this.deleteMode;
    const toggleButton = document.getElementById('delete-mode-toggle');
    
    if (this.deleteMode) {
      toggleButton.textContent = '❌ Exit';
      toggleButton.className = 'action-btn cancel-btn';
    } else {
      toggleButton.textContent = '🗑️ Delete';
      toggleButton.className = 'action-btn delete-btn';
    }
    
    this.showFileList(); // Refresh to show/hide delete icons
  }

  hasUnsavedChanges() {
    const currentContent = domUtils.editor.value;
    
    if (currentContent === '') return false;
    
    if (domUtils.currentFileName) {
      const savedContent = getFile(domUtils.currentFileName);
      return savedContent === null || currentContent !== savedContent;
    } else {
      const autoSaved = getAutosave();
      const defaultContent = 'foo = 1+1\n5\nbar = 1\nfoobar = foo + bar + #2';
      return currentContent !== (autoSaved || '') && currentContent !== defaultContent;
    }
  }

  updateFileNameDisplay() {
    const display = document.getElementById('current-file-name');
    display.textContent = domUtils.currentFileName || 'Untitled';
    display.className = domUtils.currentFileName ? 'has-file' : 'no-file';
  }

  updateSaveStatus(hasChanges) {
    const status = document.getElementById('save-status');
    if (hasChanges) {
      status.classList.remove('hidden');
      status.title = 'Unsaved changes';
    } else {
      status.classList.add('hidden');
    }
  }

  showModal() {
    document.getElementById('file-modal').classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  closeModal() {
    document.getElementById('file-modal').classList.add('hidden');
    document.body.classList.remove('modal-open');
    this.deleteMode = false;
    document.getElementById('delete-mode-toggle').textContent = '🗑️ Delete';
    document.getElementById('delete-mode-toggle').className = 'action-btn delete-btn';
  }

  showConfirmation(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').classList.remove('hidden');
    this.pendingAction = onConfirm;
  }

  confirmAction() {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.closeConfirmModal();
  }

  closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    this.pendingAction = null;
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  // Method to be called when editor content changes
  onEditorChange() {
    this.updateSaveStatus(this.hasUnsavedChanges());
  }
}

export function initializeFileManager() {
  window.fileManager = new FileManager();
  return window.fileManager;
}