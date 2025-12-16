import { eventBus } from '../core/EventBus.js';

/**
 * TabController - Coordinates tab operations
 */
export class TabController {
  #view;
  #state;
  #tabService;
  #unsubscribers = [];
  #TABS_STORAGE_KEY = 'crackulator_tabs';
  #ACTIVE_TAB_STORAGE_KEY = 'crackulator_active_tab_id';

  constructor(view, state, tabService) {
    this.#view = view;
    this.#state = state;
    this.#tabService = tabService;
    this.#bindEvents();
  }

  /**
   * Bind view events and state subscriptions
   */
  #bindEvents() {
    // Bind view events
    this.#unsubscribers.push(
      this.#view.onTabSelect(this.#handleTabSelect.bind(this)),
      this.#view.onTabClose(this.#handleTabClose.bind(this)),
      this.#view.onTabRename(this.#handleTabRename.bind(this)),
      this.#view.onNewTab(this.#handleNewTab.bind(this))
    );

    // Subscribe to state changes
    this.#unsubscribers.push(
      this.#state.subscribe(this.#handleStateChange.bind(this))
    );

    // Subscribe to tab events
    this.#unsubscribers.push(
      eventBus.subscribe('tab:create', this.#handleNewTab.bind(this)),
      eventBus.subscribe('tab:close', ({ tabId }) => this.#handleTabClose(tabId)),
      eventBus.subscribe('tab:switch', ({ tabId }) => this.#handleTabSelect(tabId)),
      eventBus.subscribe('title:changed', ({ tabName }) => this.#handleTitleChange(tabName))
    );

    // Initialize view with current state
    this.#initializeView();
  }

  /**
   * Initialize view with current state
   */
  async #initializeView() {
    let tabs = this.#state.getState('tabs');
    let activeTabId = this.#state.getState('activeTabId');

    // Try to load tabs from localStorage first
    if (tabs.length === 0) {
      const loadedData = this.#loadTabsFromStorage();
      if (loadedData) {
        tabs = loadedData.tabs;
        activeTabId = loadedData.activeTabId;

        // Update state with loaded tabs
        await this.#state.setState({
          tabs: tabs,
          activeTabId: activeTabId,
          'editor.content': loadedData.activeTab?.content || '',
          currentFile: loadedData.activeTab?.name || 'Untitled'
        });
      } else {
        // No saved tabs, create default tab
        const defaultTab = this.#tabService.getDefaultTab();
        await this.#state.setState({
          tabs: [defaultTab],
          activeTabId: defaultTab.id
        });
      }
    } else {
      // Render existing tabs
      this.#view.renderTabs(tabs, activeTabId);
    }
  }

  /**
   * Handle tab selection
   */
  async #handleTabSelect(tabId) {
    const tabs = this.#state.getState('tabs');
    const tab = this.#tabService.findTab(tabs, tabId);

    if (!tab) return;

    const currentActiveTabId = this.#state.getState('activeTabId');

    // Don't animate if selecting the already active tab
    if (currentActiveTabId === tabId) return;

    // Save current tab's content before switching
    if (currentActiveTabId) {
      const currentContent = this.#state.getState('editor.content');
      const updatedTabs = this.#tabService.updateTab(tabs, currentActiveTabId, {
        content: currentContent
      });

      await this.#state.setState({
        tabs: updatedTabs
      });
    }

    // Animate content switch
    await this.#animateContentSwitch(async () => {
      // Switch to new tab during animation
      await this.#state.setState({
        activeTabId: tabId,
        'editor.content': tab.content,
        currentFile: tab.name
      });
    });

    // Emit event for other components
    await eventBus.emit('tab:activated', { tabId, tab });
  }

  /**
   * Animate content crossfade when switching tabs
   * @param {Function} switchCallback - Callback to execute during transition
   * @returns {Promise} Resolves when animation completes
   */
  async #animateContentSwitch(switchCallback) {
    const editorElement = document.querySelector('.editor');
    const resultsElement = document.querySelector('.results');

    if (!editorElement || !resultsElement) {
      // No elements to animate, just execute callback
      await switchCallback();
      return;
    }

    // Fade out current content
    editorElement.classList.add('content-fade-out');
    resultsElement.classList.add('content-fade-out');

    // Wait for fade out (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Execute switch callback (update state with new content)
    await switchCallback();

    // Remove fade-out classes
    editorElement.classList.remove('content-fade-out');
    resultsElement.classList.remove('content-fade-out');

    // Fade in new content
    editorElement.classList.add('content-fade-in');
    resultsElement.classList.add('content-fade-in');

    // Wait for fade in (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Clean up
    editorElement.classList.remove('content-fade-in');
    resultsElement.classList.remove('content-fade-in');
  }

  /**
   * Handle tab close
   */
  async #handleTabClose(tabId) {
    const tabs = this.#state.getState('tabs');
    const activeTabId = this.#state.getState('activeTabId');
    const tab = this.#tabService.findTab(tabs, tabId);

    if (!tab) return;

    // No confirmation needed - auto-save means everything is saved

    // If only one tab, create a new one before closing
    if (tabs.length === 1) {
      const newTab = this.#tabService.createTab();
      await this.#state.setState({
        tabs: [newTab],
        activeTabId: newTab.id,
        'editor.content': newTab.content,
        currentFile: newTab.name
      });
      return;
    }

    // Determine next active tab
    const nextActiveTabId = this.#tabService.getNextActiveTabId(tabs, tabId, activeTabId);

    // Trigger exit animation first (before removing from state)
    await this.#view.animateRemoveTab(tabId);

    // Remove tab from state
    const updatedTabs = this.#tabService.removeTab(tabs, tabId);

    // Switch to next tab if we're closing the active one
    if (tabId === activeTabId && nextActiveTabId) {
      const nextTab = this.#tabService.findTab(updatedTabs, nextActiveTabId);

      // Use content animation if switching tabs
      await this.#animateContentSwitch(async () => {
        await this.#state.setState({
          tabs: updatedTabs,
          activeTabId: nextActiveTabId,
          'editor.content': nextTab?.content || '',
          currentFile: nextTab?.name || 'Untitled'
        });
      });
    } else {
      await this.#state.setState({
        tabs: updatedTabs
      });
    }

    // Emit event
    await eventBus.emit('tab:closed', { tabId });
  }

  /**
   * Handle tab rename
   */
  async #handleTabRename(tabId, newName) {
    if (!this.#tabService.isValidTabName(newName)) {
      return;
    }

    const tabs = this.#state.getState('tabs');
    const updatedTabs = this.#tabService.updateTab(tabs, tabId, {
      name: newName,
      isDirty: false // Auto-save: never dirty
    });

    await this.#state.setState({
      tabs: updatedTabs
    });

    // Update currentFile if this is the active tab
    const activeTabId = this.#state.getState('activeTabId');
    if (tabId === activeTabId) {
      await this.#state.setState({
        currentFile: newName
      });
    }

    // Emit event
    await eventBus.emit('tab:renamed', { tabId, newName });
  }

  /**
   * Handle title change from app bar
   */
  async #handleTitleChange(newName) {
    const activeTabId = this.#state.getState('activeTabId');
    if (!activeTabId) return;

    if (!this.#tabService.isValidTabName(newName)) {
      return;
    }

    const tabs = this.#state.getState('tabs');
    const updatedTabs = this.#tabService.updateTab(tabs, activeTabId, {
      name: newName,
      isDirty: false // Auto-save: never dirty
    });

    await this.#state.setState({
      tabs: updatedTabs,
      currentFile: newName
    });

    // Emit event
    await eventBus.emit('tab:renamed', { tabId: activeTabId, newName });
  }

  /**
   * Handle new tab creation
   */
  async #handleNewTab() {
    const tabs = this.#state.getState('tabs');
    const activeTabId = this.#state.getState('activeTabId');

    // Save current tab's content before creating new one
    if (activeTabId) {
      const currentContent = this.#state.getState('editor.content');
      const updatedTabs = this.#tabService.updateTab(tabs, activeTabId, {
        content: currentContent
      });

      await this.#state.setState({
        tabs: updatedTabs
      });
    }

    // Create new tab with unique name
    const baseName = 'Untitled';
    const uniqueName = this.#tabService.generateUniqueName(
      this.#state.getState('tabs'),
      baseName
    );

    const newTab = this.#tabService.createTab(uniqueName);

    const newTabs = [...this.#state.getState('tabs'), newTab];

    await this.#state.setState({
      tabs: newTabs,
      activeTabId: newTab.id,
      'editor.content': newTab.content,
      currentFile: newTab.name
    });

    // Emit event
    await eventBus.emit('tab:created', { tabId: newTab.id, tab: newTab });
  }

  /**
   * Handle state changes from other parts of the application
   */
  async #handleStateChange({ updates, newState }) {
    // Update view when tabs change
    if ('tabs' in updates || 'activeTabId' in updates) {
      const tabs = newState.tabs;
      const activeTabId = newState.activeTabId;
      this.#view.renderTabs(tabs, activeTabId);

      // Persist tabs to localStorage
      this.#saveTabsToStorage(tabs, activeTabId);
    }

    // Auto-save tab content when editor content changes
    if ('editor.content' in updates) {
      const activeTabId = this.#state.getState('activeTabId');
      if (activeTabId) {
        const tabs = this.#state.getState('tabs');
        const activeTab = this.#tabService.findTab(tabs, activeTabId);

        // Auto-save: update tab content (never mark as dirty)
        if (activeTab && activeTab.content !== updates['editor.content']) {
          const updatedTabs = this.#tabService.updateTab(tabs, activeTabId, {
            content: updates['editor.content'],
            isDirty: false // Always saved, never dirty
          });
          await this.#state.setState({
            tabs: updatedTabs
          });
        }
      }
    }
  }

  /**
   * Get active tab
   * @returns {Object|null} Active tab object
   */
  getActiveTab() {
    const tabs = this.#state.getState('tabs');
    const activeTabId = this.#state.getState('activeTabId');
    return this.#tabService.findTab(tabs, activeTabId);
  }

  /**
   * Get all tabs
   * @returns {Array} All tabs
   */
  getAllTabs() {
    return this.#state.getState('tabs');
  }

  /**
   * Save active tab content
   * Note: With auto-save, this is essentially a no-op but kept for compatibility
   */
  async saveActiveTab() {
    // Auto-save handles this automatically
    // Content is already saved when it changes
  }

  /**
   * Save tabs to localStorage
   */
  #saveTabsToStorage(tabs, activeTabId) {
    try {
      const dataToSave = {
        tabs: tabs,
        activeTabId: activeTabId,
        timestamp: Date.now()
      };
      localStorage.setItem(this.#TABS_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save tabs to localStorage:', error);
    }
  }

  /**
   * Load tabs from localStorage
   */
  #loadTabsFromStorage() {
    try {
      const savedData = localStorage.getItem(this.#TABS_STORAGE_KEY);
      if (!savedData) return null;

      const parsed = JSON.parse(savedData);
      if (!parsed.tabs || !Array.isArray(parsed.tabs) || parsed.tabs.length === 0) {
        return null;
      }

      // Find the active tab
      const activeTab = parsed.tabs.find(tab => tab.id === parsed.activeTabId);

      return {
        tabs: parsed.tabs,
        activeTabId: parsed.activeTabId,
        activeTab: activeTab
      };
    } catch (error) {
      console.error('Failed to load tabs from localStorage:', error);
      return null;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Save tabs before cleanup
    const tabs = this.#state.getState('tabs');
    const activeTabId = this.#state.getState('activeTabId');
    this.#saveTabsToStorage(tabs, activeTabId);

    // Unsubscribe from all events
    this.#unsubscribers.forEach(unsubscribe => unsubscribe());
    this.#unsubscribers = [];

    // Clean up view
    this.#view.destroy();
  }
}
