/**
 * TabView - Manages tab bar UI with editable tab names
 */
export class TabView {
  #container;
  #eventHandlers = new Map();

  constructor(container) {
    if (!container) {
      throw new Error('Tab container element required');
    }
    this.#container = container;
    this.#setupContainer();
  }

  /**
   * Setup container structure
   */
  #setupContainer() {
    this.#container.className = 'tab-bar';
    this.#container.innerHTML = `
      <div class="tabs-container"></div>
      <button class="tab-add-btn" title="New tab">+</button>
    `;
  }

  /**
   * Get tabs container element
   * @returns {HTMLElement} Tabs container
   */
  #getTabsContainer() {
    return this.#container.querySelector('.tabs-container');
  }

  /**
   * Get add tab button
   * @returns {HTMLElement} Add button
   */
  #getAddButton() {
    return this.#container.querySelector('.tab-add-btn');
  }

  /**
   * Register callback for tab selection
   * @param {Function} callback - Called with tab ID
   * @returns {Function} Cleanup function
   */
  onTabSelect(callback) {
    const handler = (e) => {
      const tabElement = e.target.closest('.tab');
      if (tabElement && !e.target.closest('.tab-close')) {
        const tabId = tabElement.dataset.tabId;
        if (tabId) callback(tabId);
      }
    };

    this.#getTabsContainer().addEventListener('click', handler);
    this.#eventHandlers.set('tabSelect', handler);

    return () => {
      this.#getTabsContainer().removeEventListener('click', handler);
      this.#eventHandlers.delete('tabSelect');
    };
  }

  /**
   * Register callback for tab close
   * @param {Function} callback - Called with tab ID
   * @returns {Function} Cleanup function
   */
  onTabClose(callback) {
    const handler = (e) => {
      const closeBtn = e.target.closest('.tab-close');
      if (closeBtn) {
        e.stopPropagation();
        const tabElement = closeBtn.closest('.tab');
        const tabId = tabElement?.dataset.tabId;
        if (tabId) callback(tabId);
      }
    };

    this.#getTabsContainer().addEventListener('click', handler);
    this.#eventHandlers.set('tabClose', handler);

    return () => {
      this.#getTabsContainer().removeEventListener('click', handler);
      this.#eventHandlers.delete('tabClose');
    };
  }

  /**
   * Register callback for tab rename
   * @param {Function} callback - Called with (tabId, newName)
   * @returns {Function} Cleanup function
   */
  onTabRename(callback) {
    const handler = (e) => {
      const nameElement = e.target.closest('.tab-name');
      if (nameElement && e.target.classList.contains('tab-name')) {
        e.stopPropagation();
        this.#makeNameEditable(nameElement, callback);
      }
    };

    this.#getTabsContainer().addEventListener('dblclick', handler);
    this.#eventHandlers.set('tabRename', handler);

    return () => {
      this.#getTabsContainer().removeEventListener('dblclick', handler);
      this.#eventHandlers.delete('tabRename');
    };
  }

  /**
   * Register callback for new tab
   * @param {Function} callback - Called when add button clicked
   * @returns {Function} Cleanup function
   */
  onNewTab(callback) {
    const handler = () => callback();

    this.#getAddButton().addEventListener('click', handler);
    this.#eventHandlers.set('newTab', handler);

    return () => {
      this.#getAddButton().removeEventListener('click', handler);
      this.#eventHandlers.delete('newTab');
    };
  }

  /**
   * Make tab name editable
   * @param {HTMLElement} nameElement - Name element to make editable
   * @param {Function} onRename - Callback when rename completes
   */
  #makeNameEditable(nameElement, onRename) {
    const tabElement = nameElement.closest('.tab');
    const tabId = tabElement.dataset.tabId;
    const currentName = nameElement.textContent;

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tab-name-input';
    input.value = currentName;
    input.maxLength = 50;

    // Replace name with input
    nameElement.style.display = 'none';
    nameElement.parentElement.insertBefore(input, nameElement);

    // Focus and select text
    input.focus();
    input.select();

    // Handle save
    const save = () => {
      const newName = input.value.trim();
      if (newName && newName !== currentName) {
        onRename(tabId, newName);
      }
      // Clean up
      input.remove();
      nameElement.style.display = '';
    };

    // Handle cancel
    const cancel = () => {
      input.remove();
      nameElement.style.display = '';
    };

    // Event handlers
    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    });

    // Stop propagation to prevent tab selection
    input.addEventListener('click', (e) => e.stopPropagation());
  }

  /**
   * Render tabs
   * @param {Array} tabs - Array of tab objects
   * @param {string} activeTabId - ID of active tab
   */
  renderTabs(tabs, activeTabId) {
    const tabsContainer = this.#getTabsContainer();
    tabsContainer.innerHTML = '';

    tabs.forEach(tab => {
      const tabElement = this.#createTabElement(tab, tab.id === activeTabId);
      tabsContainer.appendChild(tabElement);
    });
  }

  /**
   * Create tab element
   * @param {Object} tab - Tab object
   * @param {boolean} isActive - Whether tab is active
   * @returns {HTMLElement} Tab element
   */
  #createTabElement(tab, isActive) {
    const tabEl = document.createElement('div');
    tabEl.className = `tab ${isActive ? 'active' : ''}${tab.isDirty ? ' dirty' : ''}`;
    tabEl.dataset.tabId = tab.id;

    const nameEl = document.createElement('span');
    nameEl.className = 'tab-name';
    nameEl.textContent = tab.name;
    nameEl.title = 'Double-click to rename';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close tab';

    tabEl.appendChild(nameEl);
    tabEl.appendChild(closeBtn);

    return tabEl;
  }

  /**
   * Update single tab
   * @param {string} tabId - Tab ID
   * @param {Object} updates - Tab updates
   */
  updateTab(tabId, updates) {
    const tabElement = this.#container.querySelector(`[data-tab-id="${tabId}"]`);
    if (!tabElement) return;

    if ('name' in updates) {
      const nameElement = tabElement.querySelector('.tab-name');
      if (nameElement) nameElement.textContent = updates.name;
    }

    if ('isDirty' in updates) {
      tabElement.classList.toggle('dirty', updates.isDirty);
    }
  }

  /**
   * Set active tab
   * @param {string} tabId - Tab ID to activate
   */
  setActiveTab(tabId) {
    // Remove active class from all tabs
    this.#container.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Add active class to specified tab
    const activeTab = this.#container.querySelector(`[data-tab-id="${tabId}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }

  /**
   * Show tab bar
   */
  show() {
    this.#container.style.display = 'flex';
  }

  /**
   * Hide tab bar
   */
  hide() {
    this.#container.style.display = 'none';
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    for (const [event, handler] of this.#eventHandlers) {
      if (event === 'tabSelect' || event === 'tabClose' || event === 'tabRename') {
        this.#getTabsContainer().removeEventListener('click', handler);
      } else if (event === 'newTab') {
        this.#getAddButton().removeEventListener('click', handler);
      }
    }
    this.#eventHandlers.clear();
  }
}
