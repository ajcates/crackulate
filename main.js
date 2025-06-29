/**
 * Crackulator Main Entry Point
 * 
 * Modern refactored version using:
 * - Dependency injection for loose coupling
 * - Event-driven architecture for decoupled communication
 * - ES2022+ features (private fields, async/await)
 * - High cohesion with separated concerns
 */

import { Application } from './js/Application.js';

/**
 * Initialize and start the application
 */
async function startApplication() {
  try {
    const app = new Application();
    await app.initialize();
    
    // Make app instance available globally for debugging
    if (typeof window !== 'undefined') {
      window.__crackulator = app;
    }
    
    // Handle page unload cleanup
    window.addEventListener('beforeunload', async () => {
      await app.shutdown();
    });
    
  } catch (error) {
    console.error('Failed to start Crackulator:', error);
    
    // Fallback to legacy initialization if new architecture fails
    console.warn('Falling back to legacy initialization...');
    await fallbackToLegacy();
  }
}

/**
 * Fallback to legacy initialization
 */
async function fallbackToLegacy() {
  try {
    const { initializeEditorUI } = await import('./js/domUtils.js');
    const { initializeFileManager } = await import('./js/fileManager.js');
    
    initializeEditorUI();
    initializeFileManager();
    
    console.log('Legacy initialization completed');
  } catch (error) {
    console.error('Even legacy initialization failed:', error);
    
    // Show critical error to user
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: monospace;">
        <h1>Crackulator - Critical Error</h1>
        <p>Unable to initialize the application.</p>
        <p>Please refresh the page or check the console for details.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px;">
          Reload Page
        </button>
      </div>
    `;
  }
}

// Start the application
startApplication().catch(error => {
  console.error('Critical startup error:', error);
});
