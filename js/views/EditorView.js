/**
 * Editor View - Handles DOM interactions for the editor
 * High cohesion: Only responsible for editor UI
 */
export class EditorView {
  #elements;
  #eventHandlers = new Map();
  
  constructor(container) {
    this.#elements = this.#initializeElements(container);
    this.#bindInternalEvents();
  }
  
  /**
   * Initialize DOM element references
   * @param {HTMLElement} container - Container element
   * @returns {Object} Element references
   */
  #initializeElements(container) {
    const elements = {
      editor: container.querySelector('.editor'),
      results: container.querySelector('.results'),
      lineNumbers: container.querySelector('.line-numbers'),
      variableToolbar: document.querySelector('#variable-toolbar')
    };
    
    // Validate required elements exist
    Object.entries(elements).forEach(([key, element]) => {
      if (!element) {
        throw new Error(`Required element not found: ${key}`);
      }
    });
    
    return elements;
  }
  
  /**
   * Bind internal DOM events
   */
  #bindInternalEvents() {
    // Auto-sync scrolling between editor, results, and line numbers
    this.#elements.editor.addEventListener('scroll', () => {
      const { scrollTop } = this.#elements.editor;
      this.#elements.results.scrollTop = scrollTop;
      this.#elements.lineNumbers.scrollTop = scrollTop;
    });
    
    // Handle mobile keyboard visibility
    if (this.#isMobile()) {
      this.#setupMobileKeyboardHandling();
    }
  }
  
  /**
   * Set up mobile keyboard handling
   */
  #setupMobileKeyboardHandling() {
    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = initialViewportHeight - currentHeight;
      
      if (heightDiff > 150) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }
  }
  
  /**
   * Register input event handler
   * @param {Function} callback - Input callback function
   * @returns {Function} Cleanup function
   */
  onInput(callback) {
    const handler = (e) => callback(e.target.value, e);
    this.#elements.editor.addEventListener('input', handler);
    this.#eventHandlers.set('input', handler);
    
    return () => {
      this.#elements.editor.removeEventListener('input', handler);
      this.#eventHandlers.delete('input');
    };
  }
  
  /**
   * Register scroll event handler
   * @param {Function} callback - Scroll callback function
   * @returns {Function} Cleanup function
   */
  onScroll(callback) {
    const handler = (e) => callback(e.target.scrollTop, e);
    this.#elements.editor.addEventListener('scroll', handler);
    this.#eventHandlers.set('scroll', handler);
    
    return () => {
      this.#elements.editor.removeEventListener('scroll', handler);
      this.#eventHandlers.delete('scroll');
    };
  }
  
  /**
   * Register keydown event handler
   * @param {Function} callback - Keydown callback function
   * @returns {Function} Cleanup function
   */
  onKeyDown(callback) {
    const handler = (e) => callback(e.key, e);
    this.#elements.editor.addEventListener('keydown', handler);
    this.#eventHandlers.set('keydown', handler);
    
    return () => {
      this.#elements.editor.removeEventListener('keydown', handler);
      this.#eventHandlers.delete('keydown');
    };
  }
  
  /**
   * Update editor content
   * @param {string} content - New content
   */
  setContent(content) {
    console.log('EditorView.setContent() - received content:', content);
    console.log('EditorView.setContent() - current editor value:', this.#elements.editor.value);
    
    if (this.#elements.editor.value !== content) {
      const cursorPos = this.#elements.editor.selectionStart;
      console.log('EditorView.setContent() - setting editor value to:', content);
      this.#elements.editor.value = content;
      
      // Restore cursor position if reasonable
      if (cursorPos <= content.length) {
        this.#elements.editor.setSelectionRange(cursorPos, cursorPos);
      }
      
      console.log('EditorView.setContent() - editor value after setting:', this.#elements.editor.value);
    } else {
      console.log('EditorView.setContent() - content unchanged, skipping update');
    }
  }
  
  /**
   * Get current editor content
   * @returns {string} Editor content
   */
  getContent() {
    return this.#elements.editor.value;
  }
  
  /**
   * Update calculation results display
   * @param {Array} results - Array of calculation results
   */
  updateResults(results) {
    const resultElements = results.map(result => {
      const div = document.createElement('div');
      div.className = `result ${result.type || 'default'}`;
      
      if (result.type === 'error') {
        div.textContent = 'e';
        div.title = result.error || 'Calculation error';
      } else {
        div.textContent = result.value ?? '';
      }
      
      return div.outerHTML;
    });
    
    this.#elements.results.innerHTML = resultElements.join('');
  }
  
  /**
   * Update line numbers display
   * @param {number} lineCount - Number of lines
   */
  updateLineNumbers(lineCount) {
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => 
      `<div class="line-number">${i + 1}</div>`
    );
    
    this.#elements.lineNumbers.innerHTML = lineNumbers.join('');
  }
  
  /**
   * Update variable toolbar
   * @param {string[]} variables - Array of variable names
   */
  updateVariableToolbar(variables) {
    if (variables.length === 0) {
      this.#elements.variableToolbar.innerHTML = '';
      this.#elements.variableToolbar.style.display = 'none';
      return;
    }
    
    const variableButtons = variables.map(variable => {
      const button = document.createElement('button');
      button.className = 'variable-btn';
      button.textContent = variable;
      button.addEventListener('click', () => this.#insertVariable(variable));
      return button.outerHTML;
    });
    
    this.#elements.variableToolbar.innerHTML = variableButtons.join('');
    this.#elements.variableToolbar.style.display = 'flex';
  }
  
  /**
   * Insert variable name at cursor position
   * @param {string} variable - Variable name to insert
   */
  #insertVariable(variable) {
    const editor = this.#elements.editor;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;
    
    const newValue = value.substring(0, start) + variable + value.substring(end);
    editor.value = newValue;
    
    // Position cursor after inserted variable
    const newCursorPos = start + variable.length;
    editor.setSelectionRange(newCursorPos, newCursorPos);
    editor.focus();
    
    // Trigger input event to update calculations
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  /**
   * Focus the editor
   */
  focus() {
    this.#elements.editor.focus();
  }
  
  /**
   * Check if running on mobile device
   * @returns {boolean} True if mobile
   */
  #isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Get current cursor position
   * @returns {Object} Cursor position info
   */
  getCursorPosition() {
    return {
      start: this.#elements.editor.selectionStart,
      end: this.#elements.editor.selectionEnd
    };
  }
  
  /**
   * Set cursor position
   * @param {number} start - Start position
   * @param {number} end - End position (optional)
   */
  setCursorPosition(start, end = start) {
    this.#elements.editor.setSelectionRange(start, end);
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    for (const [event, handler] of this.#eventHandlers) {
      this.#elements.editor.removeEventListener(event, handler);
    }
    this.#eventHandlers.clear();
  }
}