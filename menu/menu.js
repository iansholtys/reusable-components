/**
 * Menu Component - A list of clickable items.
 *
 * Pass `items` (each with `text`; optional `onClick` for clickable rows). Items without `onClick`
 * are display-only (no hover, do not close the menu). Use `{ type: 'divider' }` for a visual break.
 * Use `{ type: 'group', items, parent?, behavior }` for inline sections (vertical only).
 * `parent` is optional; omit it for a flat always-open segment. Nested items indent via `--menu-depth` on each row.
 * Parented groups use `behavior.open`
 * (`'toggle'` default, `'always'`) and `behavior.defaultOpen` on toggle groups. Parents do not use `onClick`.
 * Set `behavior.dividers` to `true` on a group to draw section borders (CSS handles adjacent groups).
 * Toggle menus use `buttonLabel` for the control (default ⋮; `''` for an empty button).
 * `orientation` is `'vertical'` (default) or `'horizontal'`.
 * `direction` is where the menu opens (`below`, `above`, `left`, `right`); default `below`.
 * `alignment` can be `left`|`center`|`right` when above/below, or `top`|`center`|`bottom` when left/right.
 * `textAlign` overrides inferred item text alignment when omitted.
 *
 * `behavior` is optional and controls interactivity.
 * Groups in horizontal menus are not supported in v1.
 */
class Menu {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.id] Root element `id`; random id if omitted.
   * @param {'above'|'below'|'left'|'right'} [options.direction='below'] Where the menu opens relative to the button.
   * @param {'left'|'center'|'right'|'top'|'bottom'} [options.alignment] Menu alignment on the axis perpendicular to `direction`.
   * @param {'left'|'center'|'right'} [options.textAlign] Item text alignment; inferred when omitted.
   * @param {'vertical'|'horizontal'} [options.orientation='vertical'] How items are laid out in the list.
   * @param {Object} [options.behavior] Open/close behavior.
   * @param {'always'|'toggle'} [options.behavior.open] Defaults to `toggle`.
   * @param {number} [options.behavior.closeDelay] Integer ms before close on leave; defaults to `300`.
   * @param {boolean} [options.behavior.closeOnItemClick] Defaults to `true`.
   * @param {boolean} [options.behavior.defaultOpen] Toggle menus start open when `true`; defaults to `false`.
   * @param {string} [options.buttonLabel] Toggle button HTML/text. Defaults to `⋮`, can be empty.
   * @param {Array<Object>} [options.items=[]] Leaf items, `{ type: 'divider' }`, or `{ type: 'group', items, parent?, behavior }`.
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
    if (typeof this.behavior.defaultOpen !== 'boolean') {
      this.behavior.defaultOpen = false;
    }

    this.isToggle = this.behavior.open === 'toggle';

    // Validate and normalize direction, alignment and orientation
    const { direction, alignment, orientation, textAlign, buttonLabel, classes } = options;
    this.orientation = ['vertical', 'horizontal'].includes(orientation) ? orientation : 'vertical';
    this.direction = ['above', 'below', 'left', 'right'].includes(direction) ? direction : 'below';
    this.alignment = this.normalizeAlignment(alignment);
    this.textAlign = ['left', 'center', 'right'].includes(textAlign) ? textAlign : this.resolveTextAlign();

    // Validate and normalize button label
    this.hasCustomButtonLabel = typeof buttonLabel === 'string';
    this.buttonLabel = this.hasCustomButtonLabel ? buttonLabel : '\u22EE';

    // Validate and normalize items
    this.items = options.items || [];
    this.classes = Array.isArray(classes) ? classes : [];

    this.isOpen = false;
    this.isPinned = false;
    this.closeTimer = null;
    this._groupIdCounter = 0;
    this.elements = {};
  }

  /**
   * Build the menu DOM. Does not attach events.
   * @returns {jQuery} Root `.menu-component` element.
   */
  build() {
    const rootClasses = [
      'menu-component',
      'menu-component--' + this.orientation,
      'menu-component--direction-' + this.direction,
      'menu-component--align-' + this.alignment,
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

    this._groupIdCounter = 0;
    this.items.forEach((item) => {
      const $node = this.renderItem(item, 0);
      if ($node) {
        this.elements.$list.append($node);
      }
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
    if (this.isToggle && this.behavior.defaultOpen) {
      this.open();
    }
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
    this.elements.$button?.attr('aria-expanded', 'true');
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
    this.elements.$button?.attr('aria-expanded', 'false');
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
    this.isOpen = false;
    this.isPinned = false;
    $(document).off(this.keyNamespace);
    this.elements.$root?.off().remove();
    this.elements = {};
  }

  /**
   * Menu alignment valid for {@link Menu#direction}.
   * @param {string} [alignment] Requested alignment; default values are used if invalid for the current direction.
   * @returns {'left'|'center'|'right'|'top'|'bottom'}
   */
  normalizeAlignment(alignment) {
    if (['below', 'above'].includes(this.direction)) {
      return ['left', 'center', 'right'].includes(alignment) ? alignment : 'left';
    }
    return ['top', 'center', 'bottom'].includes(alignment) ? alignment : 'center';
  }

  /**
   * Infers item `textAlign` when one is not provided.
   * @returns {'left'|'center'|'right'}
   */
  resolveTextAlign() {
    const { orientation, direction, alignment } = this;
    if (orientation === 'horizontal') {
      return 'left';
    }
    if (['below', 'above'].includes(direction)) {
      return alignment;
    }
    if (alignment === 'center') {
      return 'center';
    }
    return direction === 'left' ? 'right' : 'left';
  }

  /**
   * Render one menu entry as an `<li>` (or null if skipped).
   * @param {Object} item
   * @param {number} [depth=0] Indent depth for items (0 = flush with menu edge).
   * @returns {jQuery|null}
   */
  renderItem(item, depth = 0) {
    if (!item || typeof item !== 'object') {
      return null;
    }
    switch (item.type) {
      case 'divider':
        return this.renderDivider();
      case 'group':
        return this.renderGroup(item, depth);
      default:
        return this.renderLeaf(item, depth);
    }
  }

  /**
   * @returns {jQuery}
   */
  renderDivider() {
    return $('<li>', {
      role: 'separator',
      class: 'menu-divider',
      'aria-hidden': 'true'
    });
  }

  /**
   * @param {Object} item
   * @param {number} [depth=0]
   * @returns {jQuery}
   */
  renderLeaf(item, depth = 0) {
    const { text } = item;
    const label = text != null ? String(text) : '';
    let $row;
    if (typeof item.onClick === 'function') {
      $row = $('<button>', {
        type: 'button',
        role: 'menuitem',
        class: 'menu-item',
        text: label
      }).on('click', (e) => {
        e.stopPropagation();
        item.onClick(e);
        if (this.behavior.closeOnItemClick) {
          this.close();
        }
      });
    } else {
      $row = $('<span>', {
        class: 'menu-item menu-item--static',
        text: label
      });
    }

    $row.css('--menu-depth', depth);
    return $('<li>', { role: 'none' }).append($row);
  }

  /**
   * @param {Object} item Group item with `items`, optional `parent`, and optional `behavior`.
   * @param {number} [depth=0]
   * @returns {jQuery|null}
   */
  renderGroup(item, depth = 0) {
    const { parent, items } = item;
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const hasParent = parent != null && typeof parent === 'object';
    const text = hasParent && parent.text != null ? String(parent.text) : '';
    let { open, defaultOpen, dividers } = item.behavior || {};

    if (!hasParent) {
      open = 'always';
      defaultOpen = true;
    } else {
      if (!['always', 'toggle'].includes(open)) {
        open = 'toggle';
      }
      if (typeof defaultOpen !== 'boolean') {
        defaultOpen = false;
      }
    }

    const isToggleGroup = hasParent && open === 'toggle';
    const childDepth = hasParent ? depth + 1 : depth;
    const groupId = this.id + '-group-' + (++this._groupIdCounter);

    const classes = ['menu-group'];
    if (!hasParent) {
      classes.push('menu-group--segment');
    } else if (isToggleGroup) {
      classes.push('menu-group--toggle');
    } else {
      classes.push('menu-group--always');
    }
    if (defaultOpen) {
      classes.push('is-expanded');
    }
    if (dividers === true) {
      classes.push('menu-group--divided');
    }

    const $li = $('<li>', {
      class: classes.join(' '),
      role: 'none'
    });

    if (isToggleGroup) {
      const $parentBtn = $('<button>', {
        type: 'button',
        class: 'menu-item menu-group__parent',
        'aria-expanded': defaultOpen ? 'true' : 'false',
        'aria-controls': groupId
      });
      $parentBtn.css('--menu-depth', depth);
      $parentBtn.append(
        $('<span>', { class: 'menu-group__label', text }),
        $('<span>', { class: 'menu-group__chevron', 'aria-hidden': 'true' })
      );
      $parentBtn.on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const expanded = !$li.hasClass('is-expanded');
        $li.toggleClass('is-expanded', expanded);
        $parentBtn.attr('aria-expanded', expanded ? 'true' : 'false');
      });
      $li.append($parentBtn);
    } else if (hasParent) {
      const $header = $('<div>', {
        class: 'menu-group__parent menu-group__parent--header',
        text
      });
      $header.css('--menu-depth', depth);
      $li.append($header);
    }

    const $childList = $('<ul>', {
      id: groupId,
      class: 'menu-group__list'
    });

    items.forEach((child) => {
      const $child = this.renderItem(child, childDepth);
      if ($child) {
        $childList.append($child);
      }
    });
    $li.append($childList);
    return $li;
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
