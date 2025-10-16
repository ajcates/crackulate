/**
 * TabService - Manages tabs for multiple open calculations
 */
export class TabService {
  #nextTabId = 1;

  /**
   * Create a new tab
   * @param {string} name - Tab name
   * @param {string} content - Tab content
   * @returns {Object} New tab object
   */
  createTab(name = 'Untitled', content = '') {
    return {
      id: `tab_${this.#nextTabId++}`,
      name,
      content,
      isDirty: false,
      createdAt: Date.now()
    };
  }

  /**
   * Get default initial tab
   * @returns {Object} Default tab
   */
  getDefaultTab() {
    return this.createTab('Example', 'foo = 1+1\n5\nbar = 1\nfoobar = foo + bar + #2');
  }

  /**
   * Find tab by ID
   * @param {Array} tabs - Array of tabs
   * @param {string} tabId - Tab ID to find
   * @returns {Object|null} Found tab or null
   */
  findTab(tabs, tabId) {
    return tabs.find(tab => tab.id === tabId) || null;
  }

  /**
   * Update tab by ID
   * @param {Array} tabs - Array of tabs
   * @param {string} tabId - Tab ID to update
   * @param {Object} updates - Fields to update
   * @returns {Array} New tabs array
   */
  updateTab(tabs, tabId, updates) {
    return tabs.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    );
  }

  /**
   * Remove tab by ID
   * @param {Array} tabs - Array of tabs
   * @param {string} tabId - Tab ID to remove
   * @returns {Array} New tabs array
   */
  removeTab(tabs, tabId) {
    return tabs.filter(tab => tab.id !== tabId);
  }

  /**
   * Check if tab name is valid
   * @param {string} name - Tab name
   * @returns {boolean} True if valid
   */
  isValidTabName(name) {
    return name && name.trim().length > 0 && name.trim().length <= 50;
  }

  /**
   * Generate unique tab name
   * @param {Array} tabs - Existing tabs
   * @param {string} baseName - Base name for new tab
   * @returns {string} Unique tab name
   */
  generateUniqueName(tabs, baseName = 'Untitled') {
    const existingNames = tabs.map(tab => tab.name);

    if (!existingNames.includes(baseName)) {
      return baseName;
    }

    let counter = 1;
    while (existingNames.includes(`${baseName} ${counter}`)) {
      counter++;
    }

    return `${baseName} ${counter}`;
  }

  /**
   * Reorder tabs
   * @param {Array} tabs - Array of tabs
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Destination index
   * @returns {Array} Reordered tabs array
   */
  reorderTabs(tabs, fromIndex, toIndex) {
    const result = [...tabs];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  }

  /**
   * Get next tab ID after closing a tab
   * @param {Array} tabs - Array of tabs
   * @param {string} closedTabId - ID of closed tab
   * @param {string} currentActiveId - Current active tab ID
   * @returns {string|null} Next tab ID to activate
   */
  getNextActiveTabId(tabs, closedTabId, currentActiveId) {
    if (tabs.length === 0) return null;
    if (closedTabId !== currentActiveId) return currentActiveId;

    const closedIndex = tabs.findIndex(tab => tab.id === closedTabId);
    if (closedIndex === -1) return tabs[0].id;

    // Select tab to the right, or to the left if at the end
    if (closedIndex < tabs.length - 1) {
      return tabs[closedIndex + 1].id;
    } else if (closedIndex > 0) {
      return tabs[closedIndex - 1].id;
    }

    return tabs[0]?.id || null;
  }

  /**
   * Check if there are unsaved changes in any tab
   * @param {Array} tabs - Array of tabs
   * @returns {boolean} True if any tab has unsaved changes
   */
  hasUnsavedChanges(tabs) {
    return tabs.some(tab => tab.isDirty);
  }

  /**
   * Mark tab as dirty (has unsaved changes)
   * @param {Array} tabs - Array of tabs
   * @param {string} tabId - Tab ID
   * @returns {Array} Updated tabs array
   */
  markDirty(tabs, tabId) {
    return this.updateTab(tabs, tabId, { isDirty: true });
  }

  /**
   * Mark tab as clean (saved)
   * @param {Array} tabs - Array of tabs
   * @param {string} tabId - Tab ID
   * @returns {Array} Updated tabs array
   */
  markClean(tabs, tabId) {
    return this.updateTab(tabs, tabId, { isDirty: false });
  }
}
