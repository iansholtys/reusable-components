/**
 * Confirm modal — two-action dialog (replacement for `window.confirm()`).
 */
class ConfirmModal extends Modal {
  /** @type {Object} Merged after `Modal.defaults`; override with `ConfirmModal.setDefaults()`. */
  static defaults = {
    maxWidth: '400px',
    closeOnOutsideClick: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
    confirmButtonClasses: ['modal-btn', 'modal-btn-primary'],
    cancelButtonClasses: ['modal-btn', 'modal-btn-secondary']
  };

  /**
   * @param {string} message Body message text.
   * @param {string} [title='Confirm'] Header title.
   * @param {Object} [options={}]
   * @param {string} [options.id] Root element `id`; random if omitted.
   * @param {string|string[]} [options.confirmButtonClasses] Classes for the confirm button.
   * @param {string|string[]} [options.cancelButtonClasses] Classes for the cancel button.
   * @param {() => void} [options.onConfirm]
   * @param {() => void} [options.onCancel]
   */
  constructor(message, title = 'Confirm', options = {}) {
    const opts = Modal.resolveOptions(options, ConfirmModal.defaults);
    super(opts.id || Modal.generateId('confirm-modal'), title, opts);
    this.message = message;
    this.confirmText = opts.confirmText;
    this.cancelText = opts.cancelText;
    this.confirmButtonClasses = Modal.normalizeClasses(
      opts.confirmButtonClasses,
      ConfirmModal.defaults.confirmButtonClasses
    );
    this.cancelButtonClasses = Modal.normalizeClasses(
      opts.cancelButtonClasses,
      ConfirmModal.defaults.cancelButtonClasses
    );
    this.onConfirm = opts.onConfirm || null;
    this.onCancel = opts.onCancel || null;
  }

  /**
   * @returns {JQuery}
   */
  getContent() {
    const $content = $('<div>', { class: 'confirm-content' });

    const $message = $('<p>', {
      class: 'confirm-message',
      text: this.message
    });

    const $actions = $('<div>', { class: 'confirm-actions' });

    this.elements.$cancelButton = $('<button>', {
      type: 'button',
      class: this.cancelButtonClasses.join(' '),
      text: this.cancelText
    });

    this.elements.$confirmButton = $('<button>', {
      type: 'button',
      class: this.confirmButtonClasses.join(' '),
      text: this.confirmText
    });

    $actions.append(this.elements.$cancelButton, this.elements.$confirmButton);
    $content.append($message, $actions);

    return $content;
  }

  /**
   * Bind additional event handlers for confirm
   */
  bindEvents() {
    super.bindEvents();
    this.elements.$confirmButton.on('click', () => this.confirm());
    this.elements.$cancelButton.on('click', () => this.cancel());
  }

  /**
   * @param {JQuery.KeyDownEvent} e
   */
  onKeydown(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      this.confirm();
      return;
    }
    if (this.closeOnEscape && (e.key === 'Escape' || e.keyCode === 27)) {
      this.cancel();
    }
  }

  confirm() {
    const { onConfirm } = this;
    this.hide();
    if (onConfirm) {
      onConfirm();
    }
  }

  cancel() {
    const { onCancel } = this;
    this.hide();
    if (onCancel) {
      onCancel();
    }
  }

  /**
   * Show the confirm modal
   */
  show() {
    super.show();
    // Focus the cancel button for accessibility (safer default)
    setTimeout(() => {
      this.elements.$cancelButton.focus();
    }, 100);
  }

  /**
   * Static (convenience) method to show confirm
   * @param {string} message
   * @param {string} [title='Confirm']
   * @param {Object} [options={}]
   * @returns {ConfirmModal}
   */
  static show(message, title = 'Confirm', options = {}) {
    const confirmModal = new ConfirmModal(message, title, options);
    confirmModal.show();
    return confirmModal;
  }

  /**
   * Static method to show confirm with promise-like interface
   * @param {string} message
   * @param {string} [title='Confirm']
   * @param {Object} [options={}]
   * @returns {Promise<boolean>} Resolves `true` on confirm, `false` on cancel.
   */
  static confirm(message, title = 'Confirm', options = {}) {
    return new Promise((resolve) => {
      const confirmModal = new ConfirmModal(message, title, {
        ...options,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
      confirmModal.show();
    });
  }

  /**
   * @param {Object} partial Options to merge into `ConfirmModal.defaults`.
   */
  static setDefaults(partial) {
    ConfirmModal.defaults = Modal.mergeOptionLayers(ConfirmModal.defaults, partial);
  }
}

window.ConfirmModal = ConfirmModal;
