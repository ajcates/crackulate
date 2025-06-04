import { initializeEditorUI } from './js/domUtils.js';
import { initializeFileManager } from './js/fileManager.js';

// **Service Worker Registration**
// Registers a service worker for offline functionality if supported by the browser
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    console.log('Service Worker registered');
  }).catch(err => {
    console.log('Service Worker registration failed:', err);
  });
}

// Call the initialization function from domUtils.js
initializeEditorUI();
// Call the initialization function from fileManager.js
initializeFileManager();
