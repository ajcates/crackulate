import { DIContainer } from './core/Container.js';
import { AppState } from './core/AppState.js';
import { eventBus } from './core/EventBus.js';

// Controllers
import { EditorController } from './controllers/EditorController.js';
import { FileController } from './controllers/FileController.js';
import { TabController } from './controllers/TabController.js';

// Views
import { EditorView } from './views/EditorView.js';
import { FileModalView } from './views/FileModalView.js';
import { TabView } from './views/TabView.js';

// Services
import { CalculationService } from './services/CalculationService.js';
import { FileService } from './services/FileService.js';
import { NotificationService } from './services/NotificationService.js';
import { ConfirmationService } from './services/ConfirmationService.js';
import { SharingService } from './services/SharingService.js';
import { TabService } from './services/TabService.js';

/**
 * Main Application Class
 * Orchestrates the entire application using dependency injection
 */
export class Application {
  #container = new DIContainer();
  #controllers = [];
  #isInitialized = false;
  
  /**
   * Initialize the application
   */
  async initialize() {
    if (this.#isInitialized) {
      throw new Error('Application already initialized');
    }
    
    try {
      console.log('Initializing Crackulator application...');
      
      await this.#registerServices();
      await this.#loadInitialState();
      await this.#initializeViews();
      await this.#initializeControllers();
      await this.#setupGlobalEventHandlers();
      await this.#registerServiceWorker();
      
      this.#isInitialized = true;
      
      console.log('Crackulator application initialized successfully');
      await eventBus.emit('app:initialized');
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      await this.#handleInitializationError(error);
      throw error;
    }
  }
  
  /**
   * Register all services with the DI container
   */
  async #registerServices() {
    // Import storage first
    const { storage } = await import('./storageUtils.js');

    // Core services
    this.#container.registerSingleton('appState', () => new AppState());
    this.#container.registerSingleton('notificationService', () => new NotificationService());
    this.#container.registerSingleton('confirmationService', () => new ConfirmationService());
    this.#container.registerSingleton('sharingService', () => new SharingService());
    this.#container.registerSingleton('tabService', () => new TabService());

    // Storage service (already imported)
    this.#container.registerInstance('storage', storage);

    // File service
    this.#container.register('fileService', (container) => {
      return new FileService(container.resolve('storage'));
    });

    // Calculation service with legacy parser/evaluator
    this.#container.register('calculationService', () => {
      return new CalculationService(null, null); // Will use dynamic imports
    });
  }
  
  /**
   * Initialize view components
   */
  async #initializeViews() {
    // Editor view
    const editorContainer = document.querySelector('.main-content');
    if (!editorContainer) {
      throw new Error('Editor container not found');
    }

    const editorView = new EditorView(editorContainer);
    this.#container.registerInstance('editorView', editorView);

    // Tab view
    const tabContainer = document.querySelector('.tab-container');
    if (!tabContainer) {
      throw new Error('Tab container not found');
    }

    const tabView = new TabView(tabContainer);
    this.#container.registerInstance('tabView', tabView);

    // File modal view
    const fileModalView = new FileModalView();
    this.#container.registerInstance('fileModalView', fileModalView);
  }
  
  /**
   * Initialize controllers
   */
  async #initializeControllers() {
    // Tab controller (initialize first since editor depends on tabs)
    const tabController = new TabController(
      this.#container.resolve('tabView'),
      this.#container.resolve('appState'),
      this.#container.resolve('tabService')
    );
    this.#controllers.push(tabController);

    // Editor controller
    const editorController = new EditorController(
      this.#container.resolve('editorView'),
      this.#container.resolve('appState'),
      this.#container.resolve('calculationService')
    );
    this.#controllers.push(editorController);

    // File controller
    const fileController = new FileController(
      this.#container.resolve('appState'),
      this.#container.resolve('fileService'),
      this.#container.resolve('fileModalView'),
      this.#container.resolve('confirmationService'),
      this.#container.resolve('notificationService')
    );
    this.#controllers.push(fileController);

    // Register controllers for global access if needed
    this.#container.registerInstance('tabController', tabController);
    this.#container.registerInstance('editorController', editorController);
    this.#container.registerInstance('fileController', fileController);
  }
  
  /**
   * Setup global event handlers
   */
  async #setupGlobalEventHandlers() {
    // Handle undo button
    const undoBtn = document.getElementById('undo');
    if (undoBtn) {
      undoBtn.addEventListener('click', async () => {
        await eventBus.emit('editor:undo');
      });
    }
    
    // Handle share button
    const shareBtn = document.getElementById('share');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        await this.#handleShare();
      });
    }
    
    // Handle global keyboard shortcuts
    document.addEventListener('keydown', async (e) => {
      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        await eventBus.emit('file:save');
      }
      
      // Ctrl/Cmd + O for open
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        await eventBus.emit('file:open');
      }
      
      // Ctrl/Cmd + N for new
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        await eventBus.emit('file:new');
      }
    });
    
    // Handle auto-save
    this.#setupAutoSave();
  }
  
  /**
   * Setup auto-save functionality
   */
  #setupAutoSave() {
    let autoSaveTimer;
    
    eventBus.subscribe('state:changed', async ({ updates }) => {
      if ('editor.content' in updates) {
        clearTimeout(autoSaveTimer);
        
        autoSaveTimer = setTimeout(async () => {
          try {
            const storage = this.#container.resolve('storage');
            const content = updates['editor.content'];
            storage.setItem('calcedit_content', content);
          } catch (error) {
            console.warn('Auto-save failed:', error);
          }
        }, 300);
      }
    });
  }
  
  /**
   * Register service worker for PWA functionality
   */
  async #registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        await eventBus.emit('sw:registered', { registration });
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }
  
  /**
   * Handle share button click
   */
  async #handleShare() {
    try {
      const appState = this.#container.resolve('appState');
      const sharingService = this.#container.resolve('sharingService');
      const notificationService = this.#container.resolve('notificationService');
      
      const content = appState.getState('editor.content');
      const currentFile = appState.getState('currentFile');
      
      if (!content || content.trim().length === 0) {
        await notificationService.show('Nothing to share - editor is empty', 'warning');
        return;
      }
      
      // Validate content can be shared
      const validation = sharingService.validateSharingContent(content);
      if (!validation.valid) {
        await notificationService.show(`Cannot share: ${validation.reason}`, 'error');
        return;
      }
      
      // Create and copy share URL
      const result = await sharingService.shareCalculation(content, currentFile);
      
      if (result.copied) {
        const stats = sharingService.getSharingStats(content);
        await notificationService.show(
          `Share URL copied to clipboard! (${stats.estimatedSavings} compression)`, 
          'success'
        );
      } else {
        await notificationService.show('Share URL created but failed to copy to clipboard', 'warning');
        console.log('Share URL:', result.url);
      }
      
    } catch (error) {
      console.error('Share error:', error);
      const notificationService = this.#container.resolve('notificationService');
      await notificationService.show('Failed to create share URL', 'error');
    }
  }
  
  /**
   * Load initial application state
   */
  async #loadInitialState() {
    try {
      const storage = this.#container.resolve('storage');
      const appState = this.#container.resolve('appState');
      const sharingService = this.#container.resolve('sharingService');
      const notificationService = this.#container.resolve('notificationService');
      
      let contentToLoad = null;
      let filename = null;
      
      // First, check if there's shared content in the URL
      if (sharingService.hasSharedContent()) {
        try {
          const sharedData = sharingService.parseShareUrl();
          if (sharedData) {
            contentToLoad = sharedData.content;
            filename = sharedData.filename || 'Shared Calculation';
            
            // Show notification about loaded shared content
            try {
              await notificationService.show(
                `Loaded shared calculation${filename ? ` "${filename}"` : ''}`, 
                'success'
              );
            } catch (notifyError) {
              console.warn('Failed to show notification:', notifyError);
            }
            
            // Clear the URL hash to make the URL cleaner
            sharingService.clearUrlHash();
          }
        } catch (error) {
          console.error('Failed to load shared content:', error);
          await notificationService.show('Failed to load shared content from URL', 'error');
        }
      }
      
      // If no shared content, try to load auto-saved content
      if (!contentToLoad) {
        const autoSavedContent = storage.getItem('calcedit_content');
        if (autoSavedContent) {
          contentToLoad = autoSavedContent;
          filename = 'Untitled';
        }
      }
      
      // If still no content, use default
      if (!contentToLoad) {
        contentToLoad = 'foo = 1+1\n5\nbar = 1\nfoobar = foo + bar + #2';
        filename = 'Untitled';
      }
      
      // Set initial state
      await appState.setState({
        'editor.content': contentToLoad,
        'currentFile': filename
      });
      
    } catch (error) {
      console.warn('Failed to load initial state:', error);
      
      // Fall back to default state
      const appState = this.#container.resolve('appState');
      await appState.setState({
        'editor.content': 'foo = 1+1\n5\nbar = 1\nfoobar = foo + bar + #2',
        'currentFile': 'Untitled'
      });
    }
  }
  
  /**
   * Handle initialization errors
   */
  async #handleInitializationError(error) {
    // Show error to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'init-error';
    errorDiv.innerHTML = `
      <h2>Application Error</h2>
      <p>Failed to initialize Crackulator: ${error.message}</p>
      <button onclick="location.reload()">Reload Page</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Log detailed error for debugging
    console.error('Initialization error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Clean shutdown of the application
   */
  async shutdown() {
    if (!this.#isInitialized) return;
    
    console.log('Shutting down application...');
    
    try {
      // Clean up controllers
      this.#controllers.forEach(controller => {
        if (controller.destroy) {
          controller.destroy();
        }
      });
      
      // Clear event bus
      eventBus.clear();
      
      // Clear container
      this.#container.clear();
      
      this.#isInitialized = false;
      
      console.log('Application shutdown complete');
      
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }
  
  /**
   * Check if application is initialized
   */
  isInitialized() {
    return this.#isInitialized;
  }
}