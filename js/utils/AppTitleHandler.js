/**
 * App Title Handler - Makes app title editable and persists changes
 * High cohesion: Only responsible for app title interaction
 */
export class AppTitleHandler {
  #titleElement;
  #storageKey = 'crackulator_app_title';
  #defaultTitle = 'Crackulator';
  #isEditing = false;

  constructor() {
    this.#initializeTitle();
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
  #finishEditing() {
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
}
