/**
 * Enhanced Console System with History Tracking and Clipboard Functionality
 * Extends the native console with history management and copy capabilities
 */

class EnhancedConsole {
  constructor() {
    this.history = {
      logs: [],
      warns: [],
      errors: [],
      infos: [],
      debugs: [],
      all: []
    };
    
    this.maxHistorySize = 1000;
    this.startTime = Date.now();
    
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console)
    };
    
    this.initializeEnhancements();
    this.addCustomMethods();
  }
  
  /**
   * Initialize console method overrides
   */
  initializeEnhancements() {
    const self = this;
    
    // Override console.log
    console.log = function(...args) {
      self.originalConsole.log(...args);
      self.addToHistory('log', args);
    };
    
    // Override console.warn
    console.warn = function(...args) {
      self.originalConsole.warn(...args);
      self.addToHistory('warn', args);
    };
    
    // Override console.error
    console.error = function(...args) {
      self.originalConsole.error(...args);
      self.addToHistory('error', args);
    };
    
    // Override console.info
    console.info = function(...args) {
      self.originalConsole.info(...args);
      self.addToHistory('info', args);
    };
    
    // Override console.debug
    console.debug = function(...args) {
      self.originalConsole.debug(...args);
      self.addToHistory('debug', args);
    };
  }
  
  /**
   * Add entry to console history
   */
  addToHistory(type, args) {
    const entry = {
      type,
      timestamp: Date.now(),
      relativeTime: Date.now() - this.startTime,
      args: this.serializeArgs(args),
      message: this.formatMessage(args)
    };
    
    // Add to specific type history
    this.history[type + 's'].push(entry);
    
    // Add to all history
    this.history.all.push(entry);
    
    // Trim history if too large
    this.trimHistory();
  }
  
  /**
   * Serialize console arguments for storage
   */
  serializeArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return '[Circular/Complex Object]';
        }
      }
      return String(arg);
    });
  }
  
  /**
   * Format message for display
   */
  formatMessage(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Object]';
        }
      }
      return String(arg);
    }).join(' ');
  }
  
  /**
   * Trim history to max size
   */
  trimHistory() {
    Object.keys(this.history).forEach(key => {
      if (this.history[key].length > this.maxHistorySize) {
        this.history[key] = this.history[key].slice(-this.maxHistorySize);
      }
    });
  }
  
  /**
   * Add custom console methods
   */
  addCustomMethods() {
    const self = this;
    
    // Copy functionality
    console.ccopy = function(type = 'all', format = 'text') {
      return self.copyToClipboard(type, format);
    };
    
    // Get history
    console.history = function(type = 'all', limit = null) {
      return self.getHistory(type, limit);
    };
    
    // Clear history
    console.clear = function() {
      self.originalConsole.log('%c[Console History Cleared]', 'color: #888;');
      self.clearHistory();
    };
    
    // Show console UI
    console.show = function() {
      self.showConsoleUI();
    };
    
    // Hide console UI
    console.hide = function() {
      self.hideConsoleUI();
    };
    
    // Export history as file
    console.export = function(type = 'all', format = 'json') {
      return self.exportHistory(type, format);
    };
    
    // Filter history
    console.filter = function(query, type = 'all') {
      return self.filterHistory(query, type);
    };
    
    // Get stats
    console.stats = function() {
      return self.getStats();
    };
  }
  
  /**
   * Copy console history to clipboard
   */
  async copyToClipboard(type = 'all', format = 'text') {
    try {
      const history = this.getHistory(type);
      let content = '';
      
      if (format === 'json') {
        content = JSON.stringify(history, null, 2);
      } else if (format === 'csv') {
        content = this.formatAsCSV(history);
      } else {
        content = this.formatAsText(history);
      }
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        this.originalConsole.log(`%c✓ Copied ${history.length} ${type} entries to clipboard (${format} format)`, 'color: green;');
        return true;
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          this.originalConsole.log(`%c✓ Copied ${history.length} ${type} entries to clipboard (${format} format)`, 'color: green;');
        } else {
          this.originalConsole.error('Failed to copy to clipboard');
        }
        
        return success;
      }
    } catch (error) {
      this.originalConsole.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  /**
   * Get console history
   */
  getHistory(type = 'all', limit = null) {
    const historyKey = type === 'all' ? 'all' : type + 's';
    let history = this.history[historyKey] || [];
    
    if (limit && limit > 0) {
      history = history.slice(-limit);
    }
    
    return history;
  }
  
  /**
   * Clear console history
   */
  clearHistory() {
    this.history = {
      logs: [],
      warns: [],
      errors: [],
      infos: [],
      debugs: [],
      all: []
    };
    this.startTime = Date.now();
  }
  
  /**
   * Format history as text
   */
  formatAsText(history) {
    return history.map(entry => {
      const time = new Date(entry.timestamp).toISOString();
      const relTime = `+${entry.relativeTime}ms`;
      return `[${time}] [${relTime}] [${entry.type.toUpperCase()}] ${entry.message}`;
    }).join('\n');
  }
  
  /**
   * Format history as CSV
   */
  formatAsCSV(history) {
    const header = 'Timestamp,Relative Time,Type,Message\n';
    const rows = history.map(entry => {
      const time = new Date(entry.timestamp).toISOString();
      const relTime = entry.relativeTime;
      const message = entry.message.replace(/"/g, '""'); // Escape quotes
      return `"${time}","${relTime}","${entry.type}","${message}"`;
    }).join('\n');
    
    return header + rows;
  }
  
  /**
   * Filter history by query
   */
  filterHistory(query, type = 'all') {
    const history = this.getHistory(type);
    const regex = new RegExp(query, 'i');
    
    return history.filter(entry => 
      regex.test(entry.message) || 
      entry.args.some(arg => regex.test(arg))
    );
  }
  
  /**
   * Get console statistics
   */
  getStats() {
    const stats = {
      total: this.history.all.length,
      logs: this.history.logs.length,
      warns: this.history.warns.length,
      errors: this.history.errors.length,
      infos: this.history.infos.length,
      debugs: this.history.debugs.length,
      sessionDuration: Date.now() - this.startTime,
      firstEntry: this.history.all[0]?.timestamp || null,
      lastEntry: this.history.all[this.history.all.length - 1]?.timestamp || null
    };
    
    return stats;
  }
  
  /**
   * Export history as downloadable file
   */
  exportHistory(type = 'all', format = 'json') {
    try {
      const history = this.getHistory(type);
      let content = '';
      let mimeType = '';
      let filename = '';
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (format === 'json') {
        content = JSON.stringify(history, null, 2);
        mimeType = 'application/json';
        filename = `console-${type}-${timestamp}.json`;
      } else if (format === 'csv') {
        content = this.formatAsCSV(history);
        mimeType = 'text/csv';
        filename = `console-${type}-${timestamp}.csv`;
      } else {
        content = this.formatAsText(history);
        mimeType = 'text/plain';
        filename = `console-${type}-${timestamp}.txt`;
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.originalConsole.log(`%c✓ Exported ${history.length} ${type} entries as ${filename}`, 'color: green;');
      
      return { filename, entries: history.length };
    } catch (error) {
      this.originalConsole.error('Failed to export history:', error);
      return null;
    }
  }
  
  /**
   * Show console UI overlay
   */
  showConsoleUI() {
    if (document.getElementById('enhanced-console-ui')) {
      return; // Already shown
    }
    
    const ui = this.createConsoleUI();
    document.body.appendChild(ui);
  }
  
  /**
   * Hide console UI overlay
   */
  hideConsoleUI() {
    const ui = document.getElementById('enhanced-console-ui');
    if (ui) {
      ui.remove();
    }
  }
  
  /**
   * Create console UI overlay
   */
  createConsoleUI() {
    const overlay = document.createElement('div');
    overlay.id = 'enhanced-console-ui';
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 400px;
      height: 500px;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      z-index: 10000;
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      color: #fff;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 10px;
      background: #333;
      border-bottom: 1px solid #555;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>Enhanced Console</span>
      <button onclick="console.hide()" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 16px;">×</button>
    `;
    
    // Controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      padding: 8px;
      background: #2a2a2a;
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    `;
    
    const buttonStyle = `
      background: #444;
      border: 1px solid #666;
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
    `;
    
    controls.innerHTML = `
      <button style="${buttonStyle}" onclick="console.ccopy('all', 'text')">Copy All</button>
      <button style="${buttonStyle}" onclick="console.ccopy('error', 'text')">Copy Errors</button>
      <button style="${buttonStyle}" onclick="console.ccopy('log', 'text')">Copy Logs</button>
      <button style="${buttonStyle}" onclick="console.export('all', 'json')">Export JSON</button>
      <button style="${buttonStyle}" onclick="console.clear()">Clear</button>
    `;
    
    // Content area
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      font-size: 11px;
      line-height: 1.4;
    `;
    
    // Populate content
    const history = this.getHistory('all', 100); // Last 100 entries
    content.innerHTML = history.map(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const color = this.getTypeColor(entry.type);
      return `<div style="margin-bottom: 4px; color: ${color};">
        <span style="color: #888;">[${time}]</span> 
        <span style="color: #aaa;">[${entry.type.toUpperCase()}]</span> 
        ${entry.message}
      </div>`;
    }).join('');
    
    // Auto-scroll to bottom
    content.scrollTop = content.scrollHeight;
    
    overlay.appendChild(header);
    overlay.appendChild(controls);
    overlay.appendChild(content);
    
    return overlay;
  }
  
  /**
   * Get color for console type
   */
  getTypeColor(type) {
    const colors = {
      log: '#fff',
      warn: '#ffaa00',
      error: '#ff4444',
      info: '#44aaff',
      debug: '#888'
    };
    return colors[type] || '#fff';
  }
}

// Initialize enhanced console
const enhancedConsole = new EnhancedConsole();

// Make it available globally
if (typeof window !== 'undefined') {
  window.enhancedConsole = enhancedConsole;
}

export { EnhancedConsole };