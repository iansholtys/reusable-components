/**
 * Alert modal — single-action dialog (replacement for `window.alert()`).
 */
class AlertModal extends Modal {
  /** @type {Object} Merged after `Modal.defaults`; override with `AlertModal.setDefaults()`. */
  static defaults = {
    maxWidth: '400px',
    okText: 'OK',
    okButtonClasses: ['modal-btn', 'modal-btn-primary']
  };

  /**
   * @param {string} message Body message text.
   * @param {string} [title='Alert'] Header title.
   * @param {Object} [options={}]
   * @param {string} [options.id] Root element `id`; random if omitted.
   * @param {string} [options.okText='OK'] Primary button label.
   * @param {string|string[]} [options.okButtonClasses] Classes for the OK button.
   * @param {() => void} [options.callback] Called after the user dismisses the alert.
   */
  constructor(message, title = 'Alert', options = {}) {
    const opts = Modal.resolveOptions(options, AlertModal.defaults);
    super(opts.id || Modal.generateId('alert-modal'), title, opts);
    this.message = message;
    this.okText = opts.okText;
    this.okButtonClasses = Modal.normalizeClasses(
      opts.okButtonClasses,
      AlertModal.defaults.okButtonClasses
    );
    this.callback = opts.callback || null;
  }

  /**
   * Get modal content for alert
   * @returns {JQuery}
   */
  getContent() {
    const $content = $('<div>', { class: 'alert-content' });

    const $message = $('<p>', {
      class: 'alert-message',
      text: this.message
    });

    const $actions = $('<div>', { class: 'alert-actions' });

    this.elements.$okButton = $('<button>', {
      type: 'button',
      class: this.okButtonClasses.join(' '),
      text: this.okText
    });

    $actions.append(this.elements.$okButton);
    $content.append($message, $actions);

    return $content;
  }

  /**
   * Bind additional event handlers for alert
   */
  bindEvents() {
    super.bindEvents();
    this.elements.$okButton.on('click', () => this.dismiss());
  }

  /**
   * @param {JQuery.KeyDownEvent} e
   */
  onKeydown(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      this.dismiss();
      return;
    }
    super.onKeydown(e);
  }

  dismiss() {
    const { callback } = this;
    this.hide();
    if (callback) {
      callback();
    }
  }

  /**
   * Show the alert modal
   */
  show() {
    super.show();
    // Focus the OK button for accessibility
    setTimeout(() => {
      this.elements.$okButton.focus();
    }, 100);
  }

  /**
   * Static (convenience) method to show alert
   * @param {string} message
   * @param {string} [title='Alert']
   * @param {(() => void)|Object} [callbackOrOptions] Callback function or options object.
   * @returns {AlertModal}
   */
  static show(message, title = 'Alert', callbackOrOptions = null) {
    const options = typeof callbackOrOptions === 'function'
      ? { callback: callbackOrOptions }
      : (callbackOrOptions && typeof callbackOrOptions === 'object' ? callbackOrOptions : {});
    const alertModal = new AlertModal(message, title, options);
    alertModal.show();
    return alertModal;
  }

  /**
   * @param {Object} partial Options to merge into `AlertModal.defaults`.
   */
  static setDefaults(partial) {
    AlertModal.defaults = Modal.mergeOptionLayers(AlertModal.defaults, partial);
  }
}

window.AlertModal = AlertModal;
