// File Overview: js/fileManager.js
// This file is dedicated to handling file-related operations within the application.
// It uses localStorage as a simple file system to save and load user's work.
// Key functionalities include:
// - Initializing event listeners for "Open", "Save", "Save As", and "New" buttons.
// - "Open": Displays a modal dialog listing all files saved in localStorage.
//   Clicking a file name loads its content into the editor, updates the application state
//   (undo stack, current file name), and re-evaluates the content.
// - "Save": If a file is currently open (currentFileName is set), it saves the editor
//   content to that file. Otherwise, it behaves like "Save As".
// - "Save As": Prompts the user for a file name and saves the current editor content
//   to localStorage under that name. Updates `currentFileName`.
// - "New": Checks for unsaved changes in the current editor. If there are unsaved changes,
//   it prompts the user to save them. After handling potential saves, it clears the editor
//   and resets the application state using `domUtils.clearPage()`.
// This module imports functionalities from `domUtils.js` to interact with the editor,
// update application state, and trigger UI refreshes.

// Imports utility functions and shared state from domUtils.js.
// domUtils.editor: Reference to the main textarea editor element.
// domUtils.currentFileName: Tracks the name of the currently open file.
// domUtils.undoStack: Manages the history of editor states for undo functionality.
// domUtils.updateResults: Function to re-evaluate the editor content and update the display.
// domUtils.clearPage: Function to reset the editor and application state to a new, empty state.
// domUtils.defaultInitialContent: The default content for a new editor session.
import * as domUtils from './domUtils.js';

// DOM element selections for file operations are done inside `initializeFileManager`
// to ensure the DOM is fully loaded before trying to access elements.

/**
 * Initializes all file management related event listeners and functionality.
 * This includes setting up "Open", "Save", "Save As", and "New" button handlers,
 * as well as interactions with the file open modal.
 */
export function initializeFileManager() {
  // Select relevant DOM elements for file operations.
  const openButton = document.getElementById('open'); // Button to trigger the open file modal.
  const saveButton = document.getElementById('save');   // Button to save the current file or "Save As" if no file is open.
  const saveAsButton = document.getElementById('save-as'); // Button to explicitly "Save As" a new file.
  const newButton = document.getElementById('new');     // Button to create a new, empty document.
  const modal = document.getElementById('files');       // The modal dialog for opening files.
  const closeButton = modal.querySelector('.close');    // Button to close the file open modal.
  const fileList = modal.querySelector('#file-list');   // UL element where saved files are listed.

  /**
   * Handles the "Save As" functionality.
   * Prompts the user for a file name, then saves the current editor content
   * to localStorage under the key 'calcedit_file_' + fileName.
   * Updates `domUtils.currentFileName` and the autosave content in localStorage.
   * @returns {string|null} The chosen file name if saved, or null if the prompt was cancelled.
   */
  function performSaveAs() {
    // Prompt user for a file name.
    const fileName = prompt('Enter file name:');
    if (fileName) { // Proceed only if a file name was entered.
      // Save the editor's current value to localStorage, prefixed for identification.
      localStorage.setItem('calcedit_file_' + fileName, domUtils.editor.value);
      // Update the application's current file name state.
      domUtils.currentFileName = fileName;
      // Log success for debugging; a more user-friendly notification could be added.
      console.log(`File saved as: ${fileName}`);
      // Update the 'calcedit_content' (autosave) item in localStorage to match the newly saved file.
      // This ensures consistency if the user reloads or the app auto-saves subsequently.
      localStorage.setItem('calcedit_content', domUtils.editor.value);
    }
    return fileName; // Return the name (or null if prompt was cancelled) for potential further actions.
  }

  // **Event Listener for "Open" button:**
  // When clicked, this button populates and displays a modal (#files) listing all
  // documents saved in localStorage (those with keys prefixed 'calcedit_file_').
  openButton.addEventListener('click', () => {
    fileList.innerHTML = ''; // Clear any existing items from the list.
    const files = [];
    // Iterate through all localStorage keys to find saved files.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('calcedit_file_')) {
        // Extract the actual file name by removing the prefix.
        const fileName = key.slice(14);
        files.push(fileName);
      }
    }

    // Sort file names alphabetically and create list items for each.
    files.sort().forEach(fileName => {
      const li = document.createElement('li');
      li.textContent = fileName;
      // Add event listener to each file item for loading it.
      li.addEventListener('click', () => {
        // Before opening a new file, check if there are unsaved changes in the current editor.
        if (hasUnsavedChanges()) {
          if (confirm("You have unsaved changes. Do you want to save them before opening a new file?")) {
            // If a file is currently open, save it. Otherwise, trigger "Save As".
            if (domUtils.currentFileName) {
              localStorage.setItem('calcedit_file_' + domUtils.currentFileName, domUtils.editor.value);
              localStorage.setItem('calcedit_content', domUtils.editor.value); // also update autosave
              console.log(`File saved: ${domUtils.currentFileName}`);
            } else {
              performSaveAs(); // This will prompt for a name.
            }
            // If performSaveAs was cancelled, the unsaved changes remain.
            // The file open proceeds regardless of save cancellation here, as per user's choice to not save or cancel save.
          }
          // If user clicks "Cancel" on the confirm dialog, they chose not to save. We proceed to open.
        }

        // Retrieve the selected file's content from localStorage.
        const content = localStorage.getItem('calcedit_file_' + fileName);
        // Load the content into the editor.
        domUtils.editor.value = content;
        // Reset the undo stack, starting with the loaded content as the initial state.
        domUtils.undoStack = [content];
        // Update the application's current file name.
        domUtils.currentFileName = fileName;
        // Re-evaluate the content and update the results display.
        domUtils.updateResults();
        // Update the autosave content to match the newly opened file.
        localStorage.setItem('calcedit_content', content);
        // Hide the open file modal.
        modal.classList.add('hidden');
      });
      fileList.appendChild(li);
    });
    // Display the modal.
    modal.classList.remove('hidden');
  });

  // Event Listener for the modal's "Close" (X) button.
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide the modal.
  });

  // Event Listener to close the modal if the user clicks on the modal backdrop (outside content).
  modal.addEventListener('click', (e) => {
    // Check if the click target is the modal background itself, not its children.
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // **Event Listener for "Save" button:**
  // If a file is currently "open" (domUtils.currentFileName is set), this button saves
  // the editor's content to that file directly.
  // Otherwise (no file open), it behaves like "Save As", prompting for a file name.
  saveButton.addEventListener('click', () => {
    if (domUtils.currentFileName) {
      // Current file exists: save directly.
      localStorage.setItem('calcedit_file_' + domUtils.currentFileName, domUtils.editor.value);
      console.log(`File saved: ${domUtils.currentFileName}`);
      // Ensure autosave content is also updated to match this explicit save.
      localStorage.setItem('calcedit_content', domUtils.editor.value);
    } else {
      // No current file: trigger "Save As" behavior.
      performSaveAs();
    }
  });

  // **Event Listener for "Save As" button:**
  // This button always triggers the "Save As" behavior, prompting the user for a
  // new file name regardless of whether a file is currently open.
  saveAsButton.addEventListener('click', () => {
    performSaveAs();
  });

  /**
   * Checks if the current editor content has unsaved changes.
   * Compares against the last saved version of `currentFileName` if a file is open,
   * or against `calcedit_content` (autosave) and default initial content if no file is open.
   * @returns {boolean} True if there are unsaved changes, false otherwise.
   */
  function hasUnsavedChanges() {
    const currentEditorContent = domUtils.editor.value;

    // Scenario 1: A file is currently "open" (domUtils.currentFileName is set).
    // Unsaved if editor content differs from the version stored in localStorage for this file.
    if (domUtils.currentFileName) {
      const savedFileContent = localStorage.getItem('calcedit_file_' + domUtils.currentFileName);
      // Also considered unsaved if the file, for some reason, isn't in localStorage anymore,
      // or if content is different.
      return savedFileContent === null || currentEditorContent !== savedFileContent;
    }
    // Scenario 2: No file is "open" (domUtils.currentFileName is null).
    // Need to compare against autosaved content and the default initial state.
    else {
      const autoSavedContent = localStorage.getItem('calcedit_content');

      // If editor is empty and there's no autosaved content, it's not "unsaved".
      if (currentEditorContent === '' && !autoSavedContent) {
        return false;
      }
      // If editor content is the default initial content, there's no autosave,
      // and no file is "open", it's considered the pristine initial state, so not "unsaved".
      if (currentEditorContent === domUtils.defaultInitialContent && !autoSavedContent && !domUtils.currentFileName) {
        return false;
      }
      // Otherwise (editor has content that's not the default initial state, or there's autosaved content),
      // it's unsaved if the current content differs from the autosaved content.
      // If autoSavedContent is null/undefined, `(autoSavedContent || '')` becomes empty string,
      // so any non-empty editor content would be considered unsaved.
      return currentEditorContent !== (autoSavedContent || '');
    }
  }

  // **Event Listener for "New" button:**
  // Handles creation of a new document.
  // First, it checks for unsaved changes in the current editor. If found, it prompts
  // the user to save them. After handling potential saves (or if no unsaved changes),
  // it clears the editor and resets relevant application state via `domUtils.clearPage()`.
  newButton.addEventListener('click', () => {
    if (hasUnsavedChanges()) {
      if (confirm("You have unsaved changes. Do you want to save them?")) {
        // User chose to save. Attempt to save the current work.
        if (domUtils.currentFileName) {
          // If a file is open, save to it.
          localStorage.setItem('calcedit_file_' + domUtils.currentFileName, domUtils.editor.value);
          localStorage.setItem('calcedit_content', domUtils.editor.value); // Update autosave.
          console.log(`File saved: ${domUtils.currentFileName}`);
        } else {
          // No file open, so perform "Save As".
          const savedFileName = performSaveAs(); // This prompts for name.
          if (!savedFileName) {
            // User cancelled the "Save As" prompt. Abort the "New" operation.
            console.log("Save cancelled. 'New' operation aborted.");
            return; // Exit without clearing the page.
          }
        }
      }
      // If user clicks "Cancel" on "You have unsaved changes...", they chose not to save.
      // The function will proceed to clear the page.
    }
    // Proceed to clear the page (editor, results, state).
    // This is called if there were no unsaved changes, or if the user chose not to save them,
    // or if a save attempt (prompted by unsaved changes) was successful.
    domUtils.clearPage(); // Resets currentFileName, removes 'calcedit_content', clears editor, etc.
  });
}
