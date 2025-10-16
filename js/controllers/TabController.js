import { eventBus } from '../core/EventBus.js';

/**
 * TabController - Coordinates tab operations
 */
export class TabController {
  #view;
  #state;
  #tabService;
  #unsubscribers = [];

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
      eventBus.subscribe('tab:switch', ({ tabId }) => this.#handleTabSelect(tabId))
    );

    // Initialize view with current state
    this.#initializeView();
  }

  /**
   * Initialize view with current state
   */
  async #initializeView() {
    const tabs = this.#state.getState('tabs');
    const activeTabId = this.#state.getState('activeTabId');

    // If no tabs exist, create a default tab
    if (tabs.length === 0) {
      const defaultTab = this.#tabService.getDefaultTab();
      await this.#state.setState({
        tabs: [defaultTab],
        activeTabId: defaultTab.id
      });
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

    // Switch to new tab
    await this.#state.setState({
      activeTabId: tabId,
      'editor.content': tab.content,
      currentFile: tab.name
    });

    // Emit event for other components
    await eventBus.emit('tab:activated', { tabId, tab });
  }

  /**
   * Handle tab close
   */
  async #handleTabClose(tabId) {
    const tabs = this.#state.getState('tabs');
    const activeTabId = this.#state.getState('activeTabId');
    const tab = this.#tabService.findTab(tabs, tabId);

    if (!tab) return;

    // Check if tab has unsaved changes
    if (tab.isDirty) {
      const confirmed = confirm(`Tab "${tab.name}" has unsaved changes. Close anyway?`);
      if (!confirmed) return;
    }

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

    // Remove tab
    const updatedTabs = this.#tabService.removeTab(tabs, tabId);

    // Switch to next tab if we're closing the active one
    if (tabId === activeTabId && nextActiveTabId) {
      const nextTab = this.#tabService.findTab(updatedTabs, nextActiveTabId);
      await this.#state.setState({
        tabs: updatedTabs,
        activeTabId: nextActiveTabId,
        'editor.content': nextTab?.content || '',
        currentFile: nextTab?.name || 'Untitled'
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
      isDirty: true
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
    }

    // Mark active tab as dirty when content changes
    if ('editor.content' in updates) {
      const activeTabId = this.#state.getState('activeTabId');
      if (activeTabId) {
        const tabs = this.#state.getState('tabs');
        const activeTab = this.#tabService.findTab(tabs, activeTabId);

        // Only mark dirty if content actually changed
        if (activeTab && activeTab.content !== updates['editor.content']) {
          const updatedTabs = this.#tabService.markDirty(tabs, activeTabId);
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
   */
  async saveActiveTab() {
    const activeTabId = this.#state.getState('activeTabId');
    if (!activeTabId) return;

    const tabs = this.#state.getState('tabs');
    const content = this.#state.getState('editor.content');

    const updatedTabs = this.#tabService.updateTab(tabs, activeTabId, {
      content,
      isDirty: false
    });

    await this.#state.setState({
      tabs: updatedTabs
    });
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Unsubscribe from all events
    this.#unsubscribers.forEach(unsubscribe => unsubscribe());
    this.#unsubscribers = [];

    // Clean up view
    this.#view.destroy();
  }
}
