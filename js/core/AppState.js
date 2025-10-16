import { eventBus } from './EventBus.js';

/**
 * Centralized application state management with validation
 * Implements reactive updates through event bus
 */
export class AppState {
  #state = {
    editor: {
      content: '',
      cursor: 0,
      scrollTop: 0
    },
    variables: {},
    currentFile: null,
    results: [],
    history: [],
    tabs: [],
    activeTabId: null,
    ui: {
      isModalOpen: false,
      hasUnsavedChanges: false
    }
  };
  
  #validators = new Map();
  #middlewares = [];
  
  constructor() {
    this.#setupValidators();
  }
  
  /**
   * Setup default state validators
   */
  #setupValidators() {
    this.registerValidator('editor', (editor) => {
      return editor && typeof editor.content === 'string';
    });

    this.registerValidator('variables', (variables) => {
      return variables && typeof variables === 'object';
    });

    this.registerValidator('results', (results) => {
      return Array.isArray(results);
    });

    this.registerValidator('tabs', (tabs) => {
      return Array.isArray(tabs);
    });

    this.registerValidator('activeTabId', (activeTabId) => {
      return activeTabId === null || typeof activeTabId === 'string';
    });
  }
  
  /**
   * Register validator for state property
   * @param {string} key - State property key
   * @param {Function} validator - Validation function
   */
  registerValidator(key, validator) {
    this.#validators.set(key, validator);
  }
  
  /**
   * Add middleware for state changes
   * @param {Function} middleware - Middleware function
   */
  addMiddleware(middleware) {
    this.#middlewares.push(middleware);
  }
  
  /**
   * Get state value by key path
   * @param {string} keyPath - Dot-separated key path (e.g., 'editor.content')
   * @returns {*} State value
   */
  getState(keyPath) {
    if (!keyPath) return { ...this.#state };
    
    return keyPath.split('.').reduce((obj, key) => obj?.[key], this.#state);
  }
  
  /**
   * Set state with validation and event emission
   * @param {Object} updates - State updates object
   */
  async setState(updates) {
    const oldState = { ...this.#state };
    const newState = { ...this.#state };
    
    // Apply updates with nested key support
    for (const [keyPath, value] of Object.entries(updates)) {
      this.#setNestedValue(newState, keyPath, value);
    }
    
    // Validate changes
    for (const [key, validator] of this.#validators) {
      if (key in newState && !validator(newState[key])) {
        throw new Error(`Invalid state for ${key}`);
      }
    }
    
    // Apply middlewares
    for (const middleware of this.#middlewares) {
      await middleware(newState, oldState);
    }
    
    // Update state
    this.#state = newState;
    
    // Emit change event
    await eventBus.emit('state:changed', {
      updates,
      oldState,
      newState: { ...this.#state }
    });
  }
  
  /**
   * Set nested property value using dot notation
   * @param {Object} obj - Target object
   * @param {string} keyPath - Dot-separated key path
   * @param {*} value - Value to set
   */
  #setNestedValue(obj, keyPath, value) {
    const keys = keyPath.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }
  
  /**
   * Subscribe to state changes
   * @param {Function} callback - Change callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    return eventBus.subscribe('state:changed', callback);
  }
  
  /**
   * Reset state to initial values
   */
  async reset() {
    await this.setState({
      'editor.content': '',
      'editor.cursor': 0,
      'editor.scrollTop': 0,
      variables: {},
      currentFile: null,
      results: [],
      history: [],
      tabs: [],
      activeTabId: null,
      'ui.isModalOpen': false,
      'ui.hasUnsavedChanges': false
    });
  }
}