/**
 * Crackulator Main Entry Point
 * 
 * Modern refactored version using:
 * - Dependency injection for loose coupling
 * - Event-driven architecture for decoupled communication
 * - ES2022+ features (private fields, async/await)
 * - High cohesion with separated concerns
 */

// Initialize enhanced console first for debugging
import './js/utils/EnhancedConsole.js';

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
    console.log('APPLICATION INITIALIZATION FAILED - FALLING BACK TO LEGACY');
    
    // Fallback to legacy initialization if new architecture fails
    console.warn('Falling back to legacy initialization...', 'URL:', window.location.href);
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
    const { SharingService } = await import('./js/services/SharingService.js');
    
    // Check for shared content first
    const sharingService = new SharingService();
    let sharedContent = null;
    
    if (sharingService.hasSharedContent()) {
      try {
        const sharedData = sharingService.parseShareUrl();
        if (sharedData) {
          sharedContent = sharedData.content;
          console.log('Loaded shared content in legacy mode:', sharedData.filename || 'Untitled');
          
          // Clear the URL hash
          // sharingService.clearUrlHash(); // Temporarily disabled for debugging
          
          // Show notification if possible
          if (window.fileManager && window.fileManager.showNotification) {
            window.fileManager.showNotification(
              `Loaded shared calculation${sharedData.filename ? ` "${sharedData.filename}"` : ''}`,
              'success'
            );
          }
        }
      } catch (error) {
        console.error('Failed to load shared content in legacy mode:', error);
      }
    }
    
    initializeEditorUI(sharedContent); // Pass shared content to legacy init
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
