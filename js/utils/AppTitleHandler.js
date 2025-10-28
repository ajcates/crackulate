import { eventBus } from '../core/EventBus.js';

/**
 * App Title Handler - Makes app title editable and syncs with active tab
 * High cohesion: Only responsible for app title interaction
 */
export class AppTitleHandler {
  #titleElement;
  #storageKey = 'crackulator_app_title';
  #defaultTitle = 'Crackulator';
  #isEditing = false;
  #appState = null;
  #unsubscribers = [];

  constructor(appState) {
    this.#appState = appState;
    this.#initializeTitle();
    this.#subscribeToTabChanges();
  }

  /**
   * Initialize title element and load saved title
   */
  #initializeTitle() {
    this.#titleElement = document.getElementById('app-title');

    if (!this.#titleElement) {
      console.warn('App title element not found');
      return;
    }

    // Load saved title
    const savedTitle = this.#loadTitle();
    if (savedTitle) {
      this.#titleElement.textContent = savedTitle;
    }

    // Bind events
    this.#bindEvents();
  }

  /**
   * Bind title interaction events
   */
  #bindEvents() {
    // Click to edit
    this.#titleElement.addEventListener('click', () => {
      if (!this.#isEditing) {
        this.#startEditing();
      }
    });

    // Save on Enter key
    this.#titleElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.#finishEditing();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.#cancelEditing();
      }
    });

    // Save on blur (clicking outside)
    this.#titleElement.addEventListener('blur', () => {
      if (this.#isEditing) {
        this.#finishEditing();
      }
    });
  }

  /**
   * Start editing the title
   */
  #startEditing() {
    this.#isEditing = true;
    this.#titleElement.contentEditable = 'true';
    this.#titleElement.focus();

    // Select all text for easy replacement
    const range = document.createRange();
    range.selectNodeContents(this.#titleElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Finish editing and save the title
   */
  async #finishEditing() {
    this.#isEditing = false;
    this.#titleElement.contentEditable = 'false';

    // Get and sanitize the new title
    let newTitle = this.#titleElement.textContent.trim();

    // If empty, restore default
    if (!newTitle) {
      newTitle = this.#defaultTitle;
      this.#titleElement.textContent = newTitle;
    }

    // Save to localStorage
    this.#saveTitle(newTitle);

    // Update the active tab's name if we have appState
    if (this.#appState) {
      const activeTabId = this.#appState.getState('activeTabId');
      const tabs = this.#appState.getState('tabs');

      if (activeTabId && tabs && tabs.length > 0) {
        // Emit event to update the active tab's name
        await eventBus.emit('title:changed', { tabName: newTitle });
      }
    }

    // Remove selection
    window.getSelection().removeAllRanges();
  }

  /**
   * Cancel editing and restore previous value
   */
  #cancelEditing() {
    this.#isEditing = false;
    this.#titleElement.contentEditable = 'false';

    // Restore saved or default title
    const savedTitle = this.#loadTitle() || this.#defaultTitle;
    this.#titleElement.textContent = savedTitle;

    // Remove selection
    window.getSelection().removeAllRanges();
  }

  /**
   * Save title to localStorage
   */
  #saveTitle(title) {
    try {
      localStorage.setItem(this.#storageKey, title);
    } catch (error) {
      console.error('Failed to save app title:', error);
    }
  }

  /**
   * Load title from localStorage
   */
  #loadTitle() {
    try {
      return localStorage.getItem(this.#storageKey);
    } catch (error) {
      console.error('Failed to load app title:', error);
      return null;
    }
  }

  /**
   * Get current title
   */
  getTitle() {
    return this.#titleElement?.textContent || this.#defaultTitle;
  }

  /**
   * Set title programmatically
   */
  setTitle(title) {
    if (this.#titleElement && title) {
      this.#titleElement.textContent = title;
      this.#saveTitle(title);
    }
  }

  /**
   * Reset title to default
   */
  resetTitle() {
    this.setTitle(this.#defaultTitle);
  }

  /**
   * Subscribe to tab change events to sync title
   */
  #subscribeToTabChanges() {
    if (!this.#appState) return;

    // Subscribe to tab activation events
    this.#unsubscribers.push(
      eventBus.subscribe('tab:activated', ({ tab }) => {
        if (tab && !this.#isEditing) {
          this.#updateTitleFromTab(tab.name);
        }
      })
    );

    // Subscribe to state changes to update title
    this.#unsubscribers.push(
      eventBus.subscribe('state:changed', ({ updates, newState }) => {
        if ('activeTabId' in updates && !this.#isEditing) {
          const tabs = newState.tabs || [];
          const activeTabId = newState.activeTabId;
          const activeTab = tabs.find(tab => tab.id === activeTabId);
          if (activeTab) {
            this.#updateTitleFromTab(activeTab.name);
          }
        }
      })
    );
  }

  /**
   * Update title from tab name without saving to localStorage
   * @param {string} tabName - Tab name to display
   */
  #updateTitleFromTab(tabName) {
    if (this.#titleElement && tabName && !this.#isEditing) {
      this.#titleElement.textContent = tabName;
    }
  }

  /**
   * Clean up event subscriptions
   */
  destroy() {
    this.#unsubscribers.forEach(unsubscribe => unsubscribe());
    this.#unsubscribers = [];
  }
}
