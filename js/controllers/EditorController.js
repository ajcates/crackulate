import { eventBus } from '../core/EventBus.js';

/**
 * Editor Controller - Coordinates editor view and calculation service
 */
export class EditorController {
  #view;
  #state;
  #calculationService;
  #debounceTimer;
  #unsubscribers = [];
  
  constructor(view, state, calculationService) {
    this.#view = view;
    this.#state = state;
    this.#calculationService = calculationService;
    this.#bindEvents();
  }
  
  /**
   * Bind view events and state subscriptions
   */
  #bindEvents() {
    // Bind view events
    this.#unsubscribers.push(
      this.#view.onInput(this.#handleInput.bind(this)),
      this.#view.onScroll(this.#handleScroll.bind(this))
    );
    
    // Subscribe to state changes
    this.#unsubscribers.push(
      this.#state.subscribe(this.#handleStateChange.bind(this))
    );
    
    // Subscribe to undo events
    this.#unsubscribers.push(
      eventBus.subscribe('editor:undo', this.#handleUndo.bind(this))
    );
    
    // Initialize view with current state
    this.#initializeView();
  }
  
  /**
   * Initialize view with current state
   */
  async #initializeView() {
    const content = this.#state.getState('editor.content');
    const variables = this.#state.getState('variables');
    const history = this.#state.getState('history');
    
    console.log('EditorController.#initializeView() - content from state:', content);
    console.log('EditorController.#initializeView() - variables from state:', variables);
    
    // Initialize history if empty
    if (history.length === 0 && content) {
      await this.#state.setState({
        'history': [content]
      });
    }
    
    console.log('EditorController.#initializeView() - setting content in view:', content);
    this.#view.setContent(content);
    this.#view.updateVariableToolbar(Object.keys(variables));
    
    // Trigger initial calculation if content exists
    if (content && content.trim()) {
      console.log('EditorController.#initializeView() - triggering calculation for:', content);
      await this.#calculateResults(content);
    }
  }
  
  /**
   * Handle editor input with debouncing
   */
  async #handleInput(content) {
    // Add to history for undo functionality
    const currentHistory = this.#state.getState('history');
    const newHistory = [...currentHistory, content];
    
    // Update state immediately for responsive UI
    await this.#state.setState({
      'editor.content': content,
      'ui.hasUnsavedChanges': true,
      'history': newHistory
    });
    
    // Debounce calculations for performance
    clearTimeout(this.#debounceTimer);
    this.#debounceTimer = setTimeout(async () => {
      await this.#calculateResults(content);
    }, 300);
  }
  
  /**
   * Handle editor scroll
   */
  async #handleScroll(scrollTop) {
    await this.#state.setState({
      'editor.scrollTop': scrollTop
    });
  }
  
  /**
   * Handle undo operation
   */
  async #handleUndo() {
    const history = this.#state.getState('history');
    
    if (history.length > 1) {
      // Remove current state and get previous one
      const newHistory = [...history];
      newHistory.pop(); // Remove current state
      const previousContent = newHistory[newHistory.length - 1];
      
      // Update state with previous content
      await this.#state.setState({
        'editor.content': previousContent,
        'history': newHistory,
        'ui.hasUnsavedChanges': true
      });
      
      // Update view
      this.#view.setContent(previousContent);
      
      // Recalculate results
      await this.#calculateResults(previousContent);
    }
  }
  
  /**
   * Calculate results for editor content
   */
  async #calculateResults(content) {
    try {
      const lines = content.split('\n');
      const variables = this.#state.getState('variables');
      
      const { results, updatedVariables } = await this.#calculationService.processLines(
        lines,
        variables
      );
      
      // Update state with results
      await this.#state.setState({
        results,
        variables: updatedVariables
      });
      
      // Update line numbers
      this.#view.updateLineNumbers(lines.length);
      
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }
  
  /**
   * Handle state changes from other parts of the application
   */
  async #handleStateChange({ updates, newState }) {
    // Update view when results change
    if ('results' in updates) {
      this.#view.updateResults(updates.results);
    }
    
    // Update variable toolbar when variables change
    if ('variables' in updates) {
      this.#view.updateVariableToolbar(Object.keys(updates.variables));
    }
    
    // Update editor content when changed externally (e.g., file load)
    if ('editor.content' in updates && updates['editor.content'] !== this.#view.getContent()) {
      this.#view.setContent(updates['editor.content']);
      await this.#calculateResults(updates['editor.content']);
    }
  }
  
  /**
   * Get current editor statistics
   */
  getStatistics() {
    const content = this.#view.getContent();
    const lines = content.split('\n');
    const variables = this.#state.getState('variables');
    const results = this.#state.getState('results');
    
    return {
      lines: lines.length,
      characters: content.length,
      variables: Object.keys(variables).length,
      errors: results.filter(r => r.type === 'error').length
    };
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    // Clear debounce timer
    clearTimeout(this.#debounceTimer);
    
    // Unsubscribe from all events
    this.#unsubscribers.forEach(unsubscribe => unsubscribe());
    this.#unsubscribers = [];
    
    // Clean up view
    this.#view.destroy();
  }
}