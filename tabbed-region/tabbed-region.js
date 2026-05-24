/**
 * Tabbed Region Component — tabs that show one content panel at a time.
 *
 * Chain `addTab()` for each tab before `init()`.
 * `content` may be a CSS selector string, DOM node, or jQuery object (nodes are moved into the panel).
 * `activeTab` is a tab index or tab `id`. Optional `onTabChange` receives `{ tabIndex, tab }`.
 * The root also fires jQuery `tabChanged` with the same detail object.
 */
class TabbedRegion {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.id] Root element `id`; a random id is generated if omitted.
   * @param {number|string} [options.activeTab=0] Initial tab index or tab `id`.
   * @param {string} [options.ariaLabel] Accessible name for the tab list (`role="tablist"`).
   * @param {(detail: { tabIndex: number, tab: Object }) => void} [options.onTabChange]
   */
  constructor(options = {}) {
    this.id = options.id || 'tabbed-region-' + Math.random().toString(36).substr(2, 9);
    this.options = {
      activeTab: options.activeTab ?? 0,
      ...options
    };
    this.onTabChange = options.onTabChange || null;

    this.tabs = [];
    this.activeTabIndex = 0;
    this.elements = {};
    this.isInitialized = false;
  }

  /**
   * @param {number|string} activeTab
   * @returns {number}
   */
  resolveActiveTabIndex(activeTab) {
    if (typeof activeTab === 'string') {
      const idx = this.tabs.findIndex((t) => t.id === activeTab);
      return idx >= 0 ? idx : 0;
    }
    const index = Number(activeTab);
    if (Number.isInteger(index) && index >= 0 && index < this.tabs.length) {
      return index;
    }
    return 0;
  }

  /**
   * Add a tab to the region
   * @param {string} id - Unique identifier for the tab
   * @param {string} label - Display text for the tab
   * @param {jQuery|HTMLElement|string} content - Content to show when tab is active
   * @param {Object} options - Additional options for the tab
   */
  addTab(id, label, content, options = {}) {
    const tab = {
      id,
      label,
      content: typeof content === 'string' ? $(content) : $(content),
      options: {
        icon: options.icon || '',
        disabled: options.disabled || false,
        ...options
      }
    };

    this.tabs.push(tab);
    return this;
  }

  /**
   * Initialize the tabbed region
   */
  init() {
    if (this.isInitialized) {
      return this.elements.$root;
    }

    this.activeTabIndex = this.resolveActiveTabIndex(this.options.activeTab);
    this.elements.$root = this.build();
    this.bindEvents();
    this.showTab(this.activeTabIndex);
    this.isInitialized = true;

    return this.elements.$root;
  }

  /**
   * Build the tabbed region HTML
   */
  build() {
    const $container = $('<div>', {
      class: 'tabbed-region-component',
      id: this.id
    });

    // Build tabs
    const $tabsContainer = this.elements.$tabsContainer = $('<div>', { class: 'tabbed-region-tabs', role: 'tablist' });
    if (this.options.ariaLabel) {
      $tabsContainer.attr('aria-label', this.options.ariaLabel);
    }

    this.tabs.forEach((tab, index) => {
      tab.tabBtnId = this.id + '-tab-' + tab.id;
      tab.panelId = this.id + '-panel-' + tab.id;
      const { tabBtnId, panelId } = tab;

      const $tab = $('<button>', {
        type: 'button',
        role: 'tab',
        class: 'tabbed-region-tab',
        id: tabBtnId,
        'aria-controls': panelId,
        'aria-selected': 'false',
        tabindex: -1,
        'data-tab-index': index,
        'data-tab-id': tab.id,
        html: tab.options.icon ? `${tab.options.icon} ${tab.label}` : tab.label,
        disabled: tab.options.disabled
      });

      $tabsContainer.append($tab);
    });

    // Build content container with wrapper divs for each tab
    this.elements.$contentContainer = $('<div>', { class: 'tabbed-region-content' });

    // Create wrapper divs for each tab's content
    this.tabs.forEach((tab, index) => {
      const $tabWrapper = $('<div>', {
        role: 'tabpanel',
        class: 'tabbed-region-tab-wrapper',
        id: tab.panelId,
        'aria-labelledby': tab.tabBtnId,
        'aria-hidden': 'true',
        'data-tab-index': index,
        'data-tab-id': tab.id
      });

      $tabWrapper.append(tab.content);
      this.elements.$contentContainer.append($tabWrapper);
    });

    $container.append($tabsContainer, this.elements.$contentContainer);
    return $container;
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    this.elements.$root.on('click', '.tabbed-region-tab', (e) => {
      const $tab = $(e.currentTarget);
      const tabIndex = parseInt($tab.data('tab-index'));
      
      if (!$tab.prop('disabled')) {
        this.showTab(tabIndex);
      }
    });

    this.elements.$tabsContainer.on('keydown', '.tabbed-region-tab', (e) => {
      this.handleTabKeydown(e);
    });
  }

  /**
   * Keyboard navigation for the tab list (WAI-ARIA tabs pattern).
   * @param {JQuery.KeyDownEvent} e
   */
  handleTabKeydown(e) {
    const $enabledTabs = this.elements.$root.find('.tabbed-region-tab:not(:disabled)');
    if ($enabledTabs.length === 0) {
      return;
    }

    const $current = $(e.currentTarget);
    let currentIdx = $enabledTabs.index($current);
    if (currentIdx < 0) {
      currentIdx = 0;
    }

    let nextIdx = currentIdx;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIdx = (currentIdx + 1) % $enabledTabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIdx = (currentIdx - 1 + $enabledTabs.length) % $enabledTabs.length;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = $enabledTabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const $nextTab = $enabledTabs.eq(nextIdx);
    const tabIndex = parseInt($nextTab.data('tab-index'), 10);
    this.showTab(tabIndex);
    $nextTab.focus();
  }

  /**
   * Show a specific tab
   * @param {number} tabIndex - Index of the tab to show
   */
  showTab(tabIndex) {
    if (tabIndex < 0 || tabIndex >= this.tabs.length) {
      console.warn(`Tab index ${tabIndex} is out of range`);
      return;
    }

    // Update active tab index
    this.activeTabIndex = tabIndex;

    // Update tab button states
    this.elements.$root.find('.tabbed-region-tab').each((i, el) => {
      const $tab = $(el);
      const selected = i === tabIndex;
      $tab.toggleClass('active', selected);
      $tab.attr('aria-selected', selected ? 'true' : 'false');
      $tab.attr('tabindex', selected ? '0' : '-1');
    });

    // Hide all tab content wrappers and show the selected one
    this.elements.$root.find('.tabbed-region-tab-wrapper').each((i, el) => {
      const $panel = $(el);
      const selected = i === tabIndex;
      $panel.attr('aria-hidden', selected ? 'false' : 'true');
    });

    const detail = {
      tabIndex,
      tab: this.tabs[tabIndex]
    };

    // Trigger custom event (array form so handlers receive a single detail object)
    this.elements.$root.trigger('tabChanged', [detail]);

    if (this.onTabChange) {
      this.onTabChange(detail);
    }
  }

  /**
   * Show tab by stable id (no-op if id is missing)
   * @param {string} tabId
   */
  showTabById(tabId) {
    const idx = this.tabs.findIndex((t) => t.id === tabId);
    if (idx >= 0) {
      this.showTab(idx);
    }
  }

  /**
   * Get the currently active tab index
   */
  getActiveTabIndex() {
    return this.activeTabIndex;
  }

  /**
   * Get the currently active tab
   */
  getActiveTab() {
    return this.tabs[this.activeTabIndex];
  }

  /**
   * Enable or disable a specific tab
   * @param {number} tabIndex - Index of the tab to update
   * @param {boolean} [enabled=true] - Whether the tab should be enabled
   */
  enableTab(tabIndex, enabled = true) {
    if (!this.tabs[tabIndex]) {
      return;
    }
    this.tabs[tabIndex].options.disabled = !enabled;
    if (this.isInitialized) {
      this.elements.$root
        .find(`.tabbed-region-tab[data-tab-index="${tabIndex}"]`)
        .prop('disabled', !enabled);
    }
  }

  /**
   * Disable a specific tab
   * @param {number} tabIndex - Index of the tab to disable
   */
  disableTab(tabIndex) {
    this.enableTab(tabIndex, false);
  }

  /**
   * Update tab label
   * @param {number} tabIndex - Index of the tab to update
   * @param {string} newLabel - New label for the tab
   */
  updateTabLabel(tabIndex, newLabel) {
    if (this.tabs[tabIndex]) {
      this.tabs[tabIndex].label = newLabel;
      const $tab = this.elements.$root.find(`.tabbed-region-tab[data-tab-index="${tabIndex}"]`);
      const icon = this.tabs[tabIndex].options.icon;
      $tab.html(icon ? `${icon} ${newLabel}` : newLabel);
    }
  }

  /**
   * Remove a tab
   * @param {number} tabIndex - Index of the tab to remove
   */
  removeTab(tabIndex) {
    if (tabIndex < 0 || tabIndex >= this.tabs.length) {
      return;
    }

    // Remove the tab from the array
    this.tabs.splice(tabIndex, 1);

    // Rebuild the component if it's already initialized
    if (this.isInitialized) {
      const wasActive = tabIndex === this.activeTabIndex;
      const $newRoot = this.build();
      this.elements.$root.replaceWith($newRoot);
      this.elements.$root = $newRoot;
      this.bindEvents();

      // Adjust active tab if necessary
      if (wasActive && this.tabs.length > 0) {
        this.showTab(Math.min(tabIndex, this.tabs.length - 1));
      } else if (this.tabs.length > 0) {
        this.showTab(this.activeTabIndex);
      }
    }
  }

  /**
   * Get the root element
   */
  getElement() {
    return this.elements.$root;
  }

  /**
   * Remove listeners and the root element from the DOM.
   */
  destroy() {
    this.elements.$root?.off();
    this.elements.$tabsContainer?.off();
    this.elements.$root?.remove();
    this.elements = {};
    this.isInitialized = false;
  }
}

window.TabbedRegion = TabbedRegion;
