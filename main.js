// File Overview: main.js
// This file serves as the main entry point for the application's JavaScript logic.
// Its primary responsibilities are:
// 1. Importing necessary initialization functions from other modules.
//    - `initializeEditorUI` from `domUtils.js`: Sets up the main editor interface,
//      event listeners for input, undo, etc.
//    - `initializeFileManager` from `fileManager.js`: Sets up event listeners for
//      file operations like open, save, and new.
// 2. Registering a Service Worker (`sw.js`):
//    - If the browser supports service workers, this script attempts to register
//      `sw.js`. Service workers can enable offline capabilities, background syncing,
//      and push notifications, though its specific use here would depend on the
//      contents of `sw.js` (e.g., caching assets for offline use).
// 3. Executing the initialization functions:
//    - It calls `initializeEditorUI()` and `initializeFileManager()` to ensure that
//      all UI elements and event handlers are set up when the application loads.
// This script is typically one of the last scripts loaded by `index.html` or is loaded
// with `type="module"` to allow ES6 module syntax.

import { initializeEditorUI } from './js/domUtils.js';
import { initializeFileManager } from './js/fileManager.js';

// **Service Worker Registration**
// Checks if the browser supports service workers.
// Service workers run in the background and can intercept network requests,
// enabling features like offline caching of application assets.
if ('serviceWorker' in navigator) {
  // Attempt to register the service worker script located at 'sw.js'.
  // The registration is asynchronous and returns a Promise.
  navigator.serviceWorker.register('sw.js')
    .then(registration => {
      // Log a success message to the console if registration is successful.
      // The `registration` object contains information about the service worker.
      console.log('Service Worker registered successfully. Scope:', registration.scope);
    })
    .catch(error => {
      // Log an error message to the console if registration fails.
      console.log('Service Worker registration failed:', error);
    });
}

// **Initialize Application UI and Functionality**

// Call the initialization function from `domUtils.js`.
// This sets up the editor, results display, event listeners for typing, undo,
// and other core UI interactions.
initializeEditorUI();

// Call the initialization function from `fileManager.js`.
// This sets up event listeners for file operation buttons (Open, Save As, New)
// and related modal interactions.
initializeFileManager();
