// File Overview: js/fileManager.js
// Handles file operations: saving, loading, creating new files, and managing the open file modal.
// Uses localStorage for file storage.
// Refactored for improved modal functionality including search, delete, and better UI.

import * as domUtils from './domUtils.js';

const FILE_PREFIX = 'calcedit_file_';
const LAST_MODIFIED_PREFIX = 'calcedit_meta_'; // For storing last modified dates

// Helper function to get all saved file names and their metadata
function getSavedFiles() {
  const files = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(FILE_PREFIX)) {
      const fileName = key.slice(FILE_PREFIX.length);
      const lastModified = localStorage.getItem(LAST_MODIFIED_PREFIX + fileName) || null;
      files.push({ name: fileName, lastModified: lastModified ? new Date(parseInt(lastModified)) : null });
    }
  }
  // Sort files by name by default
  files.sort((a, b) => a.name.localeCompare(b.name));
  return files;
}

// Helper function to update the file count in the modal footer
function updateFileCount(count) {
  const fileCountElement = document.getElementById('file-count');
  if (fileCountElement) {
    fileCountElement.textContent = `${count} file${count === 1 ? '' : 's'}`;
  }
}

// Function to populate the file list in the modal
function populateFileList(fileListElement, filesToDisplay, modalElement) {
  fileListElement.innerHTML = ''; // Clear existing list
  if (filesToDisplay.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No files found.';
    li.classList.add('no-files-message'); // For potential specific styling
    fileListElement.appendChild(li);
    updateFileCount(0);
    return;
  }

  filesToDisplay.forEach(fileData => {
    const li = document.createElement('li');
    li.dataset.filename = fileData.name;

    const fileNameSpan = document.createElement('span');
    fileNameSpan.className = 'file-name';
    fileNameSpan.textContent = fileData.name;

    const fileMetadataSpan = document.createElement('span');
    fileMetadataSpan.className = 'file-metadata';
    fileMetadataSpan.textContent = fileData.lastModified
      ? `Modified: ${fileData.lastModified.toLocaleDateString()} ${fileData.lastModified.toLocaleTimeString()}`
      : 'Modified: N/A';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-file-button';
    deleteButton.innerHTML = '🗑️'; // Trash can icon
    deleteButton.setAttribute('aria-label', `Delete ${fileData.name}`);

    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent li click event from firing
      if (confirm(`Are you sure you want to delete "${fileData.name}"? This action cannot be undone.`)) {
        localStorage.removeItem(FILE_PREFIX + fileData.name);
        localStorage.removeItem(LAST_MODIFIED_PREFIX + fileData.name); // Remove metadata too
        // Refresh the list
        const currentSearchTerm = document.getElementById('file-search-input').value;
        const updatedFiles = getSavedFiles();
        const filteredFiles = currentSearchTerm
          ? updatedFiles.filter(f => f.name.toLowerCase().includes(currentSearchTerm.toLowerCase()))
          : updatedFiles;
        populateFileList(fileListElement, filteredFiles, modalElement);

        // If the deleted file was the currently open one, update state
        if (domUtils.currentFileName === fileData.name) {
          domUtils.currentFileName = null;
          // Optionally, you could clear the editor or load a default state here
          // For now, just updating the currentFileName to reflect it's no longer "open"
        }
      }
    });

    li.appendChild(fileNameSpan);
    li.appendChild(fileMetadataSpan);
    li.appendChild(deleteButton);

    li.addEventListener('click', () => {
      const content = localStorage.getItem(FILE_PREFIX + fileData.name);
      domUtils.editor.value = content;
      domUtils.undoStack = [content];
      domUtils.currentFileName = fileData.name;
      domUtils.updateResults();
      modalElement.classList.add('hidden');
      document.getElementById('file-search-input').value = ''; // Clear search on open
    });
    fileListElement.appendChild(li);
  });
  updateFileCount(filesToDisplay.length);
}


export function initializeFileManager() {
  const openButton = document.getElementById('open');
  const saveButton = document.getElementById('save');
  const newButton = document.getElementById('new');
  const modal = document.getElementById('files');
  const closeButton = modal.querySelector('.close-button'); // Updated class name
  const fileListElement = modal.querySelector('#file-list');
  const searchInput = document.getElementById('file-search-input');

  openButton.addEventListener('click', () => {
    const allFiles = getSavedFiles();
    populateFileList(fileListElement, allFiles, modal);
    modal.classList.remove('hidden');
    searchInput.value = ''; // Clear search on open
    searchInput.focus(); // Focus search input when modal opens
  });

  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const allFiles = getSavedFiles();
    const filteredFiles = allFiles.filter(fileData => fileData.name.toLowerCase().includes(searchTerm));
    populateFileList(fileListElement, filteredFiles, modal);
  });

  saveButton.addEventListener('click', () => {
    const fileName = prompt('Enter file name for Save As:');
    if (fileName) {
      const content = domUtils.editor.value;
      localStorage.setItem(FILE_PREFIX + fileName, content);
      localStorage.setItem(LAST_MODIFIED_PREFIX + fileName, Date.now().toString()); // Store timestamp
      domUtils.currentFileName = fileName;
      // Consider adding a visual confirmation of save
    }
  });

  newButton.addEventListener('click', () => {
    const currentEditorContent = domUtils.editor.value;
    let isEditorUnsaved = false;

    if (currentEditorContent === '') {
      isEditorUnsaved = false;
    } else if (domUtils.currentFileName) {
      const savedFileContent = localStorage.getItem(FILE_PREFIX + domUtils.currentFileName);
      if (savedFileContent === null || currentEditorContent !== savedFileContent) {
        isEditorUnsaved = true;
      }
    } else {
      const autoSavedContent = localStorage.getItem('calcedit_content'); // Assuming this is your autosave key
      const defaultInitialContent = 'foo = 1+1\nfoo\nbar = 1\nfoobar = bar + #2'; // From original code
      if (currentEditorContent !== (autoSavedContent || '')) {
          if (currentEditorContent !== defaultInitialContent || (autoSavedContent && currentEditorContent === defaultInitialContent && currentEditorContent !== autoSavedContent) ) {
            isEditorUnsaved = true;
          }
      }
    }

    if (isEditorUnsaved) {
      if (confirm("You have unsaved changes. Do you want to save them?")) {
        let fileNameToSave = domUtils.currentFileName;
        if (!fileNameToSave) {
          fileNameToSave = prompt('Enter file name to save:');
        }
        if (fileNameToSave) {
          localStorage.setItem(FILE_PREFIX + fileNameToSave, currentEditorContent);
          localStorage.setItem(LAST_MODIFIED_PREFIX + fileNameToSave, Date.now().toString()); // Store timestamp
          domUtils.currentFileName = fileNameToSave;
        } else {
          return; // User cancelled save prompt
        }
      }
    }
    domUtils.clearPage();
    // After clearing, currentFileName should also be reset if it's not handled by clearPage
    domUtils.currentFileName = null;
  });
}
