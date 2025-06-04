import * as domUtils from './domUtils.js';

// DOM element selections for file operations will be done inside initializeFileManager
// to ensure DOM is loaded.

export function initializeFileManager() {
  const openButton = document.getElementById('open');
  const saveButton = document.getElementById('save');
  const newButton = document.getElementById('new');
  const modal = document.getElementById('files');
  const closeButton = modal.querySelector('.close');
  const fileList = modal.querySelector('#file-list');

  // Open button: Show modal with saved files
  openButton.addEventListener('click', () => {
    fileList.innerHTML = ''; // Clear previous list
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('calcedit_file_')) {
        const fileName = key.slice(14);
        files.push(fileName);
      }
    }
    files.forEach(fileName => {
      const li = document.createElement('li');
      li.textContent = fileName;
      li.addEventListener('click', () => {
        const content = localStorage.getItem('calcedit_file_' + fileName);
        domUtils.editor.value = content;
        domUtils.undoStack = [content]; // Update imported undoStack
        domUtils.currentFileName = fileName; // Update imported currentFileName
        domUtils.updateResults();
        modal.classList.add('hidden');
      });
      fileList.appendChild(li);
    });
    modal.classList.remove('hidden');
  });

  // Close modal button
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Close modal when clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // Save button: Prompt for filename and save to localStorage
  saveButton.addEventListener('click', () => {
    const fileName = prompt('Enter file name for Save As:'); // Changed prompt to be more specific
    if (fileName) {
      localStorage.setItem('calcedit_file_' + fileName, domUtils.editor.value);
      domUtils.currentFileName = fileName; // Update imported currentFileName
      // Optionally, provide feedback to the user that the file was saved.
    }
  });

  // New button
  newButton.addEventListener('click', () => {
    const currentEditorContent = domUtils.editor.value;
    let isEditorUnsaved = false;

    if (currentEditorContent === '') {
      isEditorUnsaved = false;
    } else if (domUtils.currentFileName) {
      const savedFileContent = localStorage.getItem('calcedit_file_' + domUtils.currentFileName);
      if (savedFileContent === null || currentEditorContent !== savedFileContent) {
        isEditorUnsaved = true;
      }
    } else {
      // If no current file name, check against autosaved content or initial default
      const autoSavedContent = localStorage.getItem('calcedit_content');
      // Check if it's different from the initial content (when app loaded)
      // This requires knowing the initial content state.
      // A simple check: if there's content and it's not the default or not the last autosave.
      // This part can be tricky. For simplicity, if no filename and content exists, assume it's unsaved
      // unless it matches the last autosave.
      if (currentEditorContent !== (autoSavedContent || '')) { // if content exists and differs from autosave
         // Let's refine the check for "initial default content" later if necessary.
         // The original code had a static default string.
         const defaultInitialContent = 'foo = 1+1\nfoo\nbar = 1\nfoobar = bar + #2';
         if (currentEditorContent !== defaultInitialContent && currentEditorContent !== (autoSavedContent || defaultInitialContent) ) {
            isEditorUnsaved = true;
         } else if (!autoSavedContent && currentEditorContent !== defaultInitialContent){ // No autosave, and not default
            isEditorUnsaved = true;
         } else if (autoSavedContent && currentEditorContent !== autoSavedContent) { // Has autosave, but different
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
          localStorage.setItem('calcedit_file_' + fileNameToSave, currentEditorContent);
          domUtils.currentFileName = fileNameToSave; // Update current file name
        } else {
          // User cancelled the save prompt, so don't proceed with "new"
          return;
        }
      }
    }
    // Proceed to clear the page
    domUtils.clearPage();
  });
}
