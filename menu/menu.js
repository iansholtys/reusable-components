/**
 * Menu Component - A vertical list of clickable items.
 *
 * Pass `items` (each with `text`; optional `onClick`).
 * Toggle menus use `buttonLabel` for the control (default ⋮; `''` for an empty button).
 * Placement comes from `preset` (`top-left`, `bottom-center`, etc.).
 * Text alignment comes from `textAlign` or preset alignment.
 *
 * `behavior` is optional and controls interactivity.
 */
class Menu {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.id] Root element `id`; random id if omitted.
   * @param {string} [options.preset='top-left'] Placement preset (`top-left`, `top-center`, etc.).
   * @param {'left'|'center'|'right'} [options.textAlign] Item text alignment; overrides preset alignment.
   * @param {Object} [options.behavior] Open/close behavior.
   * @param {'always'|'toggle'} [options.behavior.open] Defaults to `toggle`.
   * @param {number} [options.behavior.closeDelay] Integer ms before close on leave; defaults to `300`.
   * @param {boolean} [options.behavior.closeOnItemClick] Defaults to `true`.
   * @param {string} [options.buttonLabel] Toggle button HTML/text. Defaults to `⋮`, can be empty.
   * @param {Array<{ text: string, onClick?: (event: JQuery.Event) => void }>} [options.items=[]]
   * @param {string[]} [options.classes=[]] Extra classes on `.menu-component`.
   */
  constructor(options = {}) {
    this.id = options.id || 'menu-' + Math.random().toString(36).substr(2, 9);

    // Validate and normalize behavior options
    this.behavior = options.behavior || {};
    if (!['always', 'toggle'].includes(this.behavior.open)) {
      this.behavior.open = 'toggle';
    }
    if (!Number.isInteger(this.behavior.closeDelay)) {
      this.behavior.closeDelay = 300;
    }
    if (typeof this.behavior.closeOnItemClick !== 'boolean') {
      this.behavior.closeOnItemClick = true;
    }

    this.isToggle = this.behavior.open === 'toggle';

    // Validate and normalize preset
    const { preset, textAlign } = options;
    const [placement, align] = String(preset || 'top-left').toLowerCase().split('-');
    this.placement = ['top', 'bottom'].includes(placement) ? placement : 'top';
    this.align = ['left', 'center', 'right'].includes(align) ? align : 'left';
    this.textAlign = ['left', 'center', 'right'].includes(textAlign) ? textAlign : this.align;

    // Validate and normalize button label
    this.hasCustomButtonLabel = typeof options.buttonLabel === 'string';
    this.buttonLabel = this.hasCustomButtonLabel ? options.buttonLabel : '\u22EE';

    // Validate and normalize items
    this.items = options.items || [];
    this.classes = Array.isArray(options.classes) ? options.classes : [];

    this.isOpen = false;
    this.isPinned = false;
    this.closeTimer = null;
    this.elements = {};
  }

  /**
   * Build the menu DOM. Does not attach events.
   * @returns {jQuery} Root `.menu-component` element.
   */
  build() {
    const rootClasses = [
      'menu-component',
      'menu-component--vertical',
      'menu-component--placement-' + this.placement,
      'menu-component--align-' + this.align,
      'menu-component--text-' + this.textAlign,
      ...this.classes
    ];
    if (this.isToggle) {
      rootClasses.push('menu-component--toggle');
    } else {
      rootClasses.push('menu-component--always-open');
    }

    this.elements.$root = $('<div>', {
      id: this.id,
      class: rootClasses.join(' ')
    });

    if (this.isToggle) {
      const buttonClasses = ['menu-button'];
      if (this.hasCustomButtonLabel) {
        buttonClasses.push('menu-button--labeled');
      }
      this.elements.$button = $('<button>', {
        type: 'button',
        class: buttonClasses.join(' '),
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        'aria-controls': this.id + '-list'
      });
      if (this.buttonLabel !== '') {
        this.elements.$button.html(this.buttonLabel);
      }
      this.elements.$root.append(this.elements.$button);
    }

    this.elements.$list = $('<ul>', {
      id: this.id + '-list',
      class: 'menu-list',
      role: 'menu'
    });

    const self = this;
    this.items.forEach((item) => {
      const $btn = $('<button>', {
        type: 'button',
        role: 'menuitem',
        class: 'menu-item',
        text: item.text != null ? String(item.text) : ''
      });
      if (typeof item.onClick === 'function' || this.behavior.closeOnItemClick) {
        $btn.on('click', function (e) {
          e.stopPropagation();
          if (typeof item.onClick === 'function') {
            item.onClick(e);
          }
          if (self.behavior.closeOnItemClick) {
            self.close();
          }
        });
      }
      this.elements.$list.append($('<li>', { role: 'none' }).append($btn));
    });

    this.elements.$root.append(this.elements.$list);
    return this.elements.$root;
  }

  /**
   * Build DOM, binds events, and returns the root node. Preferred one-shot setup.
   * @returns {jQuery} Same element as {@link Menu#build}.
   */
  init() {
    const $root = this.build();
    this.bindEvents();
    return $root;
  }

  /**
   * Opens the menu. Clears pending close timer.
   */
  open() {
    if (!this.isToggle || this.isOpen) {
      return;
    }
    this.cancelScheduledClose();
    this.isOpen = true;
    this.elements.$root.addClass('is-open');
    if (this.elements.$button) {
      this.elements.$button.attr('aria-expanded', 'true');
    }
  }

  /**
   * Closes the menu. Clears pin state and pending close timer.
   */
  close() {
    if (!this.isToggle || !this.isOpen) {
      return;
    }
    this.cancelScheduledClose();
    this.isOpen = false;
    this.unpin();
    this.elements.$root.removeClass('is-open');
    if (this.elements.$button) {
      this.elements.$button.attr('aria-expanded', 'false');
    }
  }

  /**
   * Pins the menu open. Allows it to remain open when the pointer leaves.
   */
  pin() {
    this.isPinned = true;
  }

  /**
   * Unpins the menu. Allows it to close on mouse leave again.
   */
  unpin() {
    this.isPinned = false;
  }

  /**
   * Schedule {@link Menu#close} after `behavior.closeDelay`.
   */
  scheduleClose() {
    this.cancelScheduledClose();
    this.closeTimer = setTimeout(() => this.close(), this.behavior.closeDelay);
  }

  /**
   * Cancels any pending {@link Menu#scheduleClose} timeout.
   */
  cancelScheduledClose() {
    if (this.closeTimer != null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  /**
   * Attach hover, click, and document Escape handlers for toggle menus.
   * Requires `build()` first (via `init()`).
   */
  bindEvents() {
    if (!this.isToggle) {
      return;
    }

    const { $root, $button } = this.elements;

    $root.on('mouseenter', () => this.open());

    $root.on('mouseleave', () => {
      if (!this.isPinned) {
        this.scheduleClose();
      }
    });

    $button.on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!this.isOpen || !this.isPinned) {
        this.open();
        this.pin();
        return;
      }

      this.unpin();
      if (!$root.is(':hover')) {
        this.close();
      }
    });

    $(document).on(this.keyNamespace, (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Remove timers, listeners, delegated handlers, and the root element from the DOM.
   */
  destroy() {
    this.cancelScheduledClose();
    $(document).off(this.keyNamespace);
    this.elements?.$root.off().remove();
    this.elements = {};
  }

  /**
   * Event namespace for this instance's document `keydown` listener (Escape to close).
   * Used by `destroy()` to remove only this instance's handler.
   * @returns {string} e.g. `keydown.menu-abc123`
   */
  get keyNamespace() {
    return 'keydown.menu-' + this.id;
  }
}

window.Menu = Menu;
