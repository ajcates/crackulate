// File Overview: js/fileManager.js
// This file is dedicated to handling file-related operations within the application.
// It uses localStorage as a simple file system to save and load user's work.
// Key functionalities include:
// - Initializing event listeners for "Open", "Save As", and "New" buttons.
// - "Open": Displays a modal dialog listing all files saved in localStorage.
//   Clicking a file name loads its content into the editor, updates the application state
//   (undo stack, current file name), and re-evaluates the content.
// - "Save As": Prompts the user for a file name and saves the current editor content
//   to localStorage under that name. Updates the `currentFileName`.
// - "New": Checks for unsaved changes in the current editor. If there are unsaved changes,
//   it prompts the user to save them. After handling potential saves, it clears the editor
//   and resets the application state using `domUtils.clearPage()`.
// This module imports functionalities from `domUtils.js` to interact with the editor,
// update application state, and trigger UI refreshes.

import * as domUtils from './domUtils.js';

// DOM element selections for file operations are done inside `initializeFileManager`
// to ensure the DOM is fully loaded before trying to access elements.

export function initializeFileManager() {
  // Select relevant DOM elements for file operations.
  const openButton = document.getElementById('open');
  const saveButton = document.getElementById('save'); // "Save As" functionality
  const newButton = document.getElementById('new');
  const modal = document.getElementById('files'); // The modal dialog for opening files.
  const closeButton = modal.querySelector('.close'); // Button to close the modal.
  const fileList = modal.querySelector('#file-list'); // UL element to list saved files.

  // Event Listener for "Open" button:
  // Fetches all saved "files" (keys starting with 'calcedit_file_') from localStorage,
  // populates them in the modal, and makes them clickable to load content.
  openButton.addEventListener('click', () => {
    fileList.innerHTML = ''; // Clear any previously listed files.
    const files = [];
    // Iterate through all items in localStorage to find saved files.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('calcedit_file_')) {
        const fileName = key.slice(14); // Extract file name from the localStorage key.
        files.push(fileName);
      }
    }

    // For each found file, create a list item and add an event listener.
    files.sort().forEach(fileName => { // Sort files alphabetically for better UX.
      const li = document.createElement('li');
      li.textContent = fileName;
      li.addEventListener('click', () => {
        // When a file name is clicked:
        const content = localStorage.getItem('calcedit_file_' + fileName);
        domUtils.editor.value = content; // Load content into the editor.
        // Reset the undo stack with the loaded content as the initial state.
        domUtils.undoStack = [content]; // Accessing exported variable from domUtils.
        // Update the current file name in the application state.
        domUtils.currentFileName = fileName; // Accessing exported variable from domUtils.
        domUtils.updateResults(); // Re-evaluate and display results for the loaded content.
        modal.classList.add('hidden'); // Hide the modal.
      });
      fileList.appendChild(li);
    });
    modal.classList.remove('hidden'); // Show the modal.
  });

  // Event Listener for the modal's "Close" button.
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide the modal.
  });

  // Event Listener to close the modal if the user clicks outside of its content area.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { // Check if the click target is the modal background itself.
      modal.classList.add('hidden');
    }
  });

  // Event Listener for "Save As" button:
  // Prompts the user for a file name and saves the current editor content to localStorage.
  saveButton.addEventListener('click', () => {
    // The prompt suggests "Save As" to clarify its behavior, distinct from a potential "Save"
    // that would overwrite the current file without prompting if `currentFileName` is set.
    const fileName = prompt('Enter file name for Save As:');
    if (fileName) { // Proceed if the user entered a file name (didn't cancel the prompt).
      localStorage.setItem('calcedit_file_' + fileName, domUtils.editor.value);
      domUtils.currentFileName = fileName; // Update the current file name.
      // Optionally, provide feedback to the user that the file was saved (e.g., a status message).
    }
  });

  // Event Listener for "New" button:
  // Checks for unsaved changes. If changes exist, prompts to save. Then clears the editor.
  newButton.addEventListener('click', () => {
    const currentEditorContent = domUtils.editor.value;
    let isEditorUnsaved = false;

    // Determine if there are unsaved changes.
    if (currentEditorContent === '') {
      // If the editor is empty, it's considered not unsaved.
      isEditorUnsaved = false;
    } else if (domUtils.currentFileName) {
      // If a file is currently "open" (currentFileName is set),
      // compare editor content with the saved version of that file.
      const savedFileContent = localStorage.getItem('calcedit_file_' + domUtils.currentFileName);
      if (savedFileContent === null || currentEditorContent !== savedFileContent) {
        // Unsaved if the file isn't in localStorage (shouldn't happen if opened correctly)
        // or if content differs.
        isEditorUnsaved = true;
      }
    } else {
      // If no file is "open" (currentFileName is null),
      // compare with autosaved content or the initial default content.
      const autoSavedContent = localStorage.getItem('calcedit_content');
      const defaultInitialContent = 'foo = 1+1\nfoo\nbar = 1\nfoobar = bar + #2'; // Default content from domUtils

      // This logic checks if the current content is different from what might be considered "saved"
      // (either via autosave or if it's still the pristine default content).
      if (currentEditorContent !== (autoSavedContent || '')) { // Prioritize checking against autosave.
          // If it differs from autosave (or empty string if no autosave), it might be unsaved.
          // Further check against default content if it's not the autosaved one.
          if (currentEditorContent !== defaultInitialContent) {
            // If it's not the autosaved content AND not the default content, it's likely unsaved.
            // This handles the case where autosave might be null but editor has default content (not unsaved),
            // or autosave exists but editor has been changed from it.
            isEditorUnsaved = true;
          } else if (autoSavedContent && currentEditorContent === defaultInitialContent && currentEditorContent !== autoSavedContent) {
            // Edge case: editor is default, but autosave was something else. Treat as unsaved from autosave's perspective.
            isEditorUnsaved = true;
          }
      }
    }

    // If unsaved changes are detected, confirm with the user if they want to save.
    if (isEditorUnsaved) {
      if (confirm("You have unsaved changes. Do you want to save them?")) {
        let fileNameToSave = domUtils.currentFileName;
        // If there's no current file name, prompt for one (acts like "Save As").
        if (!fileNameToSave) {
          fileNameToSave = prompt('Enter file name to save:');
        }
        if (fileNameToSave) {
          // Save the content to localStorage.
          localStorage.setItem('calcedit_file_' + fileNameToSave, currentEditorContent);
          domUtils.currentFileName = fileNameToSave; // Update current file name.
        } else {
          // User cancelled the save prompt (either for new name or existing file).
          // In this case, do not proceed with creating a "new" page, as the save was aborted.
          return;
        }
      }
      // If user clicks "Cancel" on "You have unsaved changes...", they chose not to save.
      // The page will still be cleared in the next step.
    }
    // Proceed to clear the page (editor, results, state) by calling the utility from domUtils.
    domUtils.clearPage();
  });
}
