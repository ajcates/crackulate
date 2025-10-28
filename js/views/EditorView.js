/**
 * Editor View - Handles DOM interactions for the editor
 * High cohesion: Only responsible for editor UI
 */
export class EditorView {
  #elements;
  #eventHandlers = new Map();
  #savedCursorPosition = null;

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
    // Optimized: Use requestAnimationFrame for smooth 60fps scrolling
    let scrolling = false;
    this.#elements.editor.addEventListener('scroll', () => {
      if (!scrolling) {
        scrolling = true;
        requestAnimationFrame(() => {
          const { scrollTop } = this.#elements.editor;
          this.#elements.results.scrollTop = scrollTop;
          this.#elements.lineNumbers.scrollTop = scrollTop;
          scrolling = false;
        });
      }
    }, { passive: true });

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
    if (this.#elements.editor.value !== content) {
      const cursorPos = this.#elements.editor.selectionStart;
      this.#elements.editor.value = content;
      
      // Restore cursor position if reasonable
      if (cursorPos <= content.length) {
        this.#elements.editor.setSelectionRange(cursorPos, cursorPos);
      }
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
   * Enhanced with better error messages and formatting
   * @param {Array} results - Array of calculation results
   */
  updateResults(results) {
    const resultElements = results.map((result, index) => {
      const div = document.createElement('div');
      div.className = `result ${result.type || 'default'}`;

      if (result.type === 'error') {
        div.textContent = '!';
        // Enhanced error tooltip with more context
        const errorMsg = result.error || 'Calculation error';
        const lineNum = result.line || index + 1;
        div.title = `Error on line ${lineNum}: ${errorMsg}`;
        // Add subtle shake animation on error
        div.style.animation = 'none';
        requestAnimationFrame(() => {
          div.style.animation = 'errorPulse 300ms ease-out';
        });
      } else if (result.type === 'empty') {
        // Use non-breaking space to maintain line height alignment
        div.innerHTML = '&nbsp;';
        div.className = 'result empty';
      } else {
        // Format large numbers with commas for readability
        const formattedValue = this.#formatNumber(result.value);
        div.textContent = formattedValue;
        // Add title with full precision for long numbers
        if (formattedValue !== result.value && result.value) {
          div.title = `Full value: ${result.value}`;
        }
      }

      return div.outerHTML;
    });

    this.#elements.results.innerHTML = resultElements.join('');
  }

  /**
   * Format number with commas for readability
   * @param {string|number} value - Number to format
   * @returns {string} Formatted number
   */
  #formatNumber(value) {
    if (!value || value === '-' || value === '') return value;

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // For large numbers, add thousand separators
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('en-US', {
        maximumFractionDigits: 10,
        useGrouping: true
      });
    }

    return value;
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

    // Clear existing buttons
    this.#elements.variableToolbar.innerHTML = '';

    // Create and append button elements (not HTML strings) to preserve event listeners
    variables.forEach(variable => {
      const button = document.createElement('button');
      button.className = 'variable-btn';
      button.textContent = variable;
      button.addEventListener('click', () => this.#insertVariable(variable));
      this.#elements.variableToolbar.appendChild(button);
    });

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
   * Save current cursor position
   */
  saveCursorPosition() {
    this.#savedCursorPosition = {
      start: this.#elements.editor.selectionStart,
      end: this.#elements.editor.selectionEnd
    };
  }

  /**
   * Insert text at saved cursor position
   * @param {string} text - Text to insert
   */
  insertAtSavedPosition(text) {
    if (!this.#savedCursorPosition) {
      console.warn('No saved cursor position');
      return;
    }

    const editor = this.#elements.editor;
    const value = editor.value;
    const { start, end } = this.#savedCursorPosition;

    const newValue = value.substring(0, start) + text + value.substring(end);
    editor.value = newValue;

    // Position cursor after inserted text
    const newCursorPos = start + text.length;
    editor.setSelectionRange(newCursorPos, newCursorPos);
    editor.focus();

    // Clear saved position
    this.#savedCursorPosition = null;

    // Trigger input event to update calculations
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Register line reference button click handler
   * @param {Function} callback - Click callback function
   * @returns {Function} Cleanup function
   */
  onLineReferenceClick(callback) {
    const button = document.getElementById('line-ref');
    if (!button) {
      console.warn('Line reference button not found');
      return () => {};
    }

    button.addEventListener('click', callback);
    this.#eventHandlers.set('lineRefClick', callback);

    return () => {
      button.removeEventListener('click', callback);
      this.#eventHandlers.delete('lineRefClick');
    };
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