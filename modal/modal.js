/**
 * Modal component — base overlay dialog with lazy DOM creation.
 *
 * Subclass `Modal` and override `getContent()` for custom body markup.
 * Use lifecycle hooks (`onShow`, `onHide`, `onDestroy`, `onKeydown`) for specialized behavior.
 *
 * A single shared backdrop is used for all open modals so overlapping open/close
 * does not stack dark overlays. Each instance gets a unique `id` for listeners and DOM.
 *
 * Set application-wide defaults once via `Modal.setDefaults({ ... })`, or per-class
 * via `AlertModal.setDefaults` / `ConfirmModal.setDefaults`. Options passed to a
 * specific constructor or `show()` call override those defaults for that modal only.
 *
 * Prefer jQuery `.text()` or `{ text: ... }` for dynamic copy. When building HTML strings,
 * use `Modal.escapeHtml()` on any untrusted interpolated values.
 */
class Modal {
  static backdropId = 'modal-shared-backdrop';
  /** @type {Modal[]} */
  static stack = [];

  /** @type {Object} Merged into every modal; override with `Modal.setDefaults()`. */
  static defaults = {
    width: '90%',
    maxWidth: '500px',
    height: 'auto',
    maxHeight: '80vh',
    closeOnOutsideClick: true,
    closeOnEscape: true,
    classes: []
  };

  /**
   * @param {string} [id] Root element `id`; a random id is generated if omitted.
   * @param {string} [title='Modal'] Header title text.
   * @param {Object} [options={}]
   * @param {string} [options.width='90%'] Inline width on `.modal-content`.
   * @param {string} [options.maxWidth='500px'] Inline max-width on `.modal-content`.
   * @param {string} [options.height='auto'] Inline height on `.modal-content`.
   * @param {string} [options.maxHeight='80vh'] Inline max-height on `.modal-content`.
   * @param {boolean} [options.closeOnOutsideClick=true] Dismiss when the backdrop is clicked (topmost modal only).
   * @param {boolean} [options.closeOnEscape=true] Dismiss on Escape via `onKeydown`.
   * @param {string[]} [options.classes=[]] Extra CSS classes on the modal layer element.
   * @param {string|Object|false} [options.enterAnimation] Enter preset or `{ preset, duration, distance, scale }`; `'none'`/`false` for instant.
   * @param {string|Object|false} [options.exitAnimation] Exit preset or config object.
   * @param {{ enter?: string|Object, exit?: string|Object }} [options.animation] Shorthand for enter/exit when not set separately.
   */
  constructor(id, title = 'Modal', options = {}) {
    const opts = Modal.resolveOptions(options);

    this.id = id || Modal.generateId('modal');
    this.title = title;
    this.classes = opts.classes || [];

    this.width = opts.width;
    this.maxWidth = opts.maxWidth;
    this.height = opts.height;
    this.maxHeight = opts.maxHeight;

    this.closeOnOutsideClick = opts.closeOnOutsideClick;
    this.closeOnEscape = opts.closeOnEscape;

    const anim = opts.animation && typeof opts.animation === 'object' ? opts.animation : {};
    this.enterAnimation = Modal.parseAnimation(
      opts.enterAnimation ?? anim.enter,
      { preset: 'none', duration: 0 }
    );
    this.exitAnimation = Modal.parseAnimation(
      opts.exitAnimation ?? anim.exit,
      { preset: 'slide-up', duration: 300 }
    );

    this.isVisible = false;
    this.domExists = false;
    this.hideTimeout = null;
    this.elements = {};
    this.isInitialized = false;
  }

  /**
   * Initialize the modal. Returns the instance for chaining.
   * @returns {this}
   */
  init() {
    if (this.isInitialized) {
      return this;
    }

    // Call modal-specific initialization
    this.onInit();
    this.isInitialized = true;
    return this;
  }

  /**
   * Modal-specific initialization — override in subclasses.
   */
  onInit() {}

  /**
   * Build and append the modal DOM (lazy, on first `show`).
   */
  createModalElement() {
    // Only create if modal doesn't exist
    if (this.domExists && this.elements.$root?.length > 0) {
      return;
    }

    // Create modal container with base class and additional classes
    const layerClasses = ['modal-layer', ...this.classes].join(' ');
    this.elements.$root = $('<div>', {
      id: this.id,
      class: layerClasses,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': this.id + '-title'
    });

    // Create modal content
    this.elements.$content = $('<div>', { class: 'modal-content' }).css({
      width: this.width,
      height: this.height,
      'max-width': this.maxWidth,
      'max-height': this.maxHeight
    });

    // Create modal header
    this.applyAnimationVars(this.elements.$content, this.enterAnimation, 'enter');
    this.elements.$content.attr('data-enter', this.enterAnimation.preset);
    this.elements.$content.attr('data-exit', this.exitAnimation.preset);

    const $modalHeader = $('<div>', { class: 'modal-header' });

    const $modalTitle = $('<h2>', {
      id: this.id + '-title',
      class: 'modal-title',
      text: this.title
    });

    const $closeButton = $('<span>', {
      class: 'close',
      html: '&times;',
      role: 'button',
      tabindex: 0,
      'aria-label': 'Close'
    });

    this.elements.$body = $('<div>', { class: 'modal-body' });
    this.fillBody(this.getContent());

    // Assemble the modal structure
    $modalHeader.append($modalTitle, $closeButton);
    this.elements.$content.append($modalHeader, this.elements.$body);
    this.elements.$root.append(this.elements.$content);

    // Append to body
    $('body').append(this.elements.$root);
    this.domExists = true;
  }

  /**
   * @param {JQuery} $content
   * @param {{ preset: string, duration: number, distance: string, scale: number|null }} anim
   * @param {'enter'|'exit'} phase
   */
  applyAnimationVars($content, anim, phase) {
    const prefix = '--modal-' + phase;
    $content.css(prefix + '-duration', anim.duration + 'ms');
    $content.css(prefix + '-distance', anim.distance);
    if (anim.scale != null) {
      $content.css(prefix + '-scale', String(anim.scale));
    }
  }

  /**
   * Body HTML or jQuery content. Override in subclasses.
   * @returns {string|JQuery}
   */
  getContent() {
    return '';
  }

  /**
   * @param {string|JQuery} content
   */
  fillBody(content) {
    if (!this.elements.$body?.length) {
      return;
    }

    this.elements.$body.empty();
    if (content && typeof content === 'object' && content.jquery) {
      this.elements.$body.append(content);
      return;
    }
    this.elements.$body.html(content || '');
  }

  /**
   * Attach instance-scoped handlers on the modal root and document.
   */
  bindEvents() {
    // Close button
    this.elements.$root.find('.close').on('click', () => this.hide());

    // Keyboard (Escape, Enter in subclasses, etc.).
    $(document).on(this.keyNamespace, (e) => {
      if (!this.isVisible) return;
      this.onKeydown(e);
    });
  }

  /**
   * Handle keydown while visible. Override in subclasses for Enter, etc.
   * @param {JQuery.KeyDownEvent} e
   */
  onKeydown(e) {
    if (this.closeOnEscape && (e.key === 'Escape' || e.keyCode === 27)) {
      this.hide();
    }
  }

  /**
   * Show the modal (creates DOM and binds events on first call).
   */
  show() {
    if (this.isVisible || this.hideTimeout) {
      return;
    }

    if (!this.domExists) {
      this.createModalElement();
      this.bindEvents();
    }

    let depth = Modal.stack.indexOf(this) + 1;
    if (depth === 0) {
      depth = Modal.push(this);
    }
    this.elements.$root.css('z-index', 1000 + depth);

    this.applyAnimationVars(this.elements.$content, this.enterAnimation, 'enter');
    this.applyAnimationVars(this.elements.$content, this.exitAnimation, 'exit');
    this.elements.$content.attr('data-enter', this.enterAnimation.preset);
    this.elements.$content.attr('data-exit', this.exitAnimation.preset);
    this.elements.$content.removeClass('is-exiting');
    this.elements.$root.removeClass('is-closing');

    const startEnter = () => {
      this.elements.$root[0].offsetHeight;
      this.elements.$root.addClass('show').removeClass('is-opening');
      this.isVisible = true;
      this.onShow();
    };

    if (this.enterAnimation.preset === 'none' || this.enterAnimation.duration === 0) {
      startEnter();
    } else {
      // Layer visible (flex) but not .show yet so enter-from styles apply, then transition.
      this.elements.$root.addClass('is-opening');
      requestAnimationFrame(() => requestAnimationFrame(startEnter));
    }
  }

  /**
   * Hide the modal and schedule DOM teardown after the exit animation finishes.
   */
  hide() {
    if (!this.isVisible) return;

    this.applyAnimationVars(this.elements.$content, this.exitAnimation, 'exit');
    this.elements.$content.addClass('is-exiting');
    this.elements.$root.addClass('is-closing').removeClass('show');
    this.elements.$root[0].offsetHeight;
    this.isVisible = false;
    this.onHide();

    // Fade backdrop with the panel when this is the only modal in the stack.
    if (Modal.stack.length === 1 && Modal.stack[0] === this) {
      Modal.hideBackdrop(this.exitAnimation);
    }

    const delay = this.exitAnimation.preset === 'none' ? 0 : this.exitAnimation.duration;

    // Schedule DOM destruction after the exit transition
    this.hideTimeout = setTimeout(() => {
      this.destroy();
    }, delay);
  }

  /**
   * Remove DOM and detach all listeners for this instance.
   */
  destroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.domExists) {
      // Remove event handlers
      $(document).off(this.keyNamespace);
      this.elements.$root.off();
      this.elements.$root.removeClass('show is-opening is-closing');
      this.elements.$root.remove();
      this.domExists = false;
    }

    // Clear element references
    Modal.remove(this);
    this.elements = {};
    this.onDestroy();
  }

  /**
   * Update modal title
   * @param {string} title
   */
  setTitle(title) {
    this.title = title;
    if (this.domExists) {
      this.elements.$root.find('.modal-title').text(title);
    }
  }

  /**
   * Update modal content
   * @param {string|JQuery} content
   */
  setContent(content) {
    if (this.domExists) {
      this.fillBody(content);
    }
  }

  /** 
   * Lifecycle hooks - can be overridden by subclasses
   */
  /** 
   * Called when the modal is shown
   */
  onShow() {}

  /** 
   * Called when the modal is hidden
   */
  onHide() {}

  /** 
   * Called when the modal DOM is destroyed
   */
  onDestroy() {}

  /**
   * Escape text for safe inclusion in HTML strings (e.g. before `.html()`).
   * @param {*} value
   * @returns {string}
   */
  static escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => {
      switch (character) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#039;';
        default:
          return character;
      }
    });
  }

  /**
   * @param {string} [prefix='modal']
   * @returns {string}
   */
  static generateId(prefix = 'modal') {
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * jQuery event namespace for this instance's document key handlers.
   * @returns {string}
   */
  get keyNamespace() {
    return 'keydown.modal-' + this.id;
  }

  /**
   * @param {Object} partial Options to merge into `Modal.defaults`.
   */
  static setDefaults(partial) {
    Modal.defaults = Modal.mergeOptionLayers(Modal.defaults, partial);
  }

  /**
   * Normalize button (or other) class lists from a string, array, or undefined.
   * @param {string|string[]|undefined} value
   * @param {string[]} fallback
   * @returns {string[]}
   */
  static normalizeClasses(value, fallback) {
    if (Array.isArray(value)) {
      return value.map(function (c) {
        return String(c).trim();
      }).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
      return value.trim().split(/\s+/).filter(Boolean);
    }
    return fallback.slice();
  }

  /**
   * @param {Object} base
   * @param {Object} over
   * @returns {Object}
   */
  static mergeOptionLayers(base, over) {
    if (!over || typeof over !== 'object') {
      return { ...base };
    }
    const merged = { ...base, ...over };
    if (base.animation || over.animation) {
      merged.animation = { ...(base.animation || {}), ...(over.animation || {}) };
    }
    ['enterAnimation', 'exitAnimation'].forEach(function (key) {
      const fromBase = base[key];
      const fromOver = over[key];
      if (fromBase && typeof fromBase === 'object' && fromOver && typeof fromOver === 'object') {
        merged[key] = { ...fromBase, ...fromOver };
      }
    });
    return merged;
  }

  /**
   * @param {Object} [options={}] Per-instance options.
   * @param {Object} [classDefaults={}] e.g. `AlertModal.defaults`.
   * @returns {Object}
   */
  static resolveOptions(options = {}, classDefaults = {}) {
    return Modal.mergeOptionLayers(
      Modal.mergeOptionLayers({ ...Modal.defaults }, classDefaults),
      options
    );
  }

  /**
   * @param {string|Object|false|undefined} value
   * @param {Object} defaults
   * @returns {{ preset: string, duration: number, distance: string, scale: number|null }}
   */
  static parseAnimation(value, defaults) {
    const base = {
      preset: 'slide-up',
      duration: 300,
      distance: '20px',
      scale: null,
      ...defaults
    };
    if (value === false || value === 'none') {
      return { preset: 'none', duration: 0, distance: '0', scale: null };
    }
    if (typeof value === 'string') {
      return { ...base, preset: value };
    }
    if (value && typeof value === 'object') {
      return {
        ...base,
        ...value,
        preset: value.preset || base.preset
      };
    }
    return base;
  }

  /**
   * @returns {Modal|null}
   */
  static topmost() {
    return Modal.stack.length ? Modal.stack[Modal.stack.length - 1] : null;
  }

  static ensureBackdrop() {
    let $backdrop = $('#' + Modal.backdropId);
    if (!$backdrop.length) {
      $backdrop = $('<div>', {
        id: Modal.backdropId,
        class: 'modal-backdrop',
        'aria-hidden': 'true'
      });
      $('body').append($backdrop);
      Modal.bindBackdropEvents($backdrop);
    }
    return $backdrop;
  }

  /**
   * @param {JQuery} $backdrop
   */
  static bindBackdropEvents($backdrop) {
    // Outside "click": both press and release must be on the backdrop. A lone
    // `click` can still target the overlay after mousedown inside the panel
    // (e.g. dragging to select text), which wrongly dismissed the modal.
    let armed = false;
    $backdrop.on('mousedown.modal-backdrop', (e) => {
      if (e.button !== 0) return;
      armed = true;
    });
    $backdrop.on('mouseup.modal-backdrop', (e) => {
      if (e.button !== 0) {
        armed = false;
        return;
      }
      if (!armed) return;
      armed = false;
      const top = Modal.topmost();
      if (top && top.isVisible && top.closeOnOutsideClick) {
        top.hide();
      }
    });
  }

  /**
   * @param {Modal} modal
   * @returns {number} Stack depth (1-based), for z-index.
   */
  static push(modal) {
    Modal.ensureBackdrop();
    const wasEmpty = Modal.stack.length === 0;
    Modal.stack.push(modal);
    if (wasEmpty) {
      Modal.showBackdrop(modal.enterAnimation);
    } else {
      // e.g. confirm closes then alert opens before destroy — keep dimming, no re-fade
      Modal.keepBackdropVisible();
    }
    return Modal.stack.length;
  }

  /**
   * @param {{ preset: string, duration: number }} anim
   */
  static applyBackdropTiming(anim) {
    const $backdrop = $('#' + Modal.backdropId);
    if (!$backdrop.length) return;
    const ms = anim.preset === 'none' ? 0 : (anim.duration || 300);
    $backdrop.css('--modal-backdrop-duration', ms + 'ms');
  }

  /**
   * @param {{ preset: string, duration: number }} anim
   */
  static showBackdrop(anim) {
    const $backdrop = $('#' + Modal.backdropId);
    Modal.applyBackdropTiming(anim);
    $backdrop.addClass('show').attr('aria-hidden', 'false');
  }

  /**
   * Restore backdrop when another modal opens while the previous one is still tearing down.
   */
  static keepBackdropVisible() {
    const $backdrop = $('#' + Modal.backdropId);
    if (!$backdrop.length || $backdrop.hasClass('show')) {
      return;
    }
    $backdrop.css('--modal-backdrop-duration', '0ms');
    $backdrop.addClass('show').attr('aria-hidden', 'false');
    requestAnimationFrame(function () {
      $backdrop.css('--modal-backdrop-duration', '');
    });
  }

  /**
   * @param {{ preset: string, duration: number }} anim
   */
  static hideBackdrop(anim) {
    const $backdrop = $('#' + Modal.backdropId);
    if (!$backdrop.length) return;
    Modal.applyBackdropTiming(anim);
    $backdrop.removeClass('show').attr('aria-hidden', 'true');
  }

  /**
   * @param {Modal} modal
   */
  static remove(modal) {
    const index = Modal.stack.indexOf(modal);
    if (index !== -1) {
      Modal.stack.splice(index, 1);
    }
    Modal.syncBackdrop();
  }

  static syncBackdrop() {
    const $backdrop = $('#' + Modal.backdropId);
    if (!$backdrop.length) return;
    if (Modal.stack.length > 0) {
      Modal.keepBackdropVisible();
    } else if ($backdrop.hasClass('show')) {
      $backdrop.removeClass('show').attr('aria-hidden', 'true');
    }
  }
}

window.Modal = Modal;
