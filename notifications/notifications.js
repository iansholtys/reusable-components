/**
 * Notifications
 * Provides lightweight, auto-dismissing notifications
 */

class Notifications {
  constructor(options = {}) {
    this.notifications = [];
    this.position = options.position || 'top-right';
    if (!['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(this.position)) {
      this.position = 'top-right';
    }
    this.elements = {};
  }

  /**
   * Initialize the notification container
   */
  init() {
    // Create notification container if it doesn't exist
    if (!this.elements.$container) {
      const containerClasses = ['notifications-component', `position-${this.position}`];
      this.elements.$container = $('<div>', {
        class: containerClasses.join(' '),
        role: 'region',
        'aria-label': 'Notifications'
      });
    }

    return this.elements.$container;
  }

  /**
   * Show a notification
   * @param {string} message - The notification message
   * @param {Object} options - Notification options
   */
  show(message, options = {}) {
    if (!options.type || !['info', 'success', 'warning', 'error'].includes(options.type)) {
      options.type = 'info';
    }
    if (options.duration == null || typeof options.duration !== 'number') {
      options.duration = 3000;
    }

    // Create notification element
    const { type } = options;
    const important = ['error', 'warning'].includes(type);
    const notificationClasses = ['notifications-item', `notifications-item--${type}`];
    const $closeButton = $('<button>', {
      type: 'button',
      class: 'notifications-item-close',
      html: '&times;',
      'aria-label': 'Dismiss notification'
    });
    const $notification = $('<div>', {
      class: notificationClasses.join(' '),
      role: important ? 'alert' : 'status',
      'aria-live': important ? 'assertive' : 'polite',
      'aria-atomic': 'true',
      tabindex: 0
    }).append(
      $('<div>', {class: 'notifications-item-content'}).append(
        $('<span>', {class: 'notifications-item-message', text: message}),
        $closeButton
      )
    );

    // Add to container
    this.elements.$container?.append($notification);
    this.notifications.push($notification);

    // Trigger entrance animation
    setTimeout(() => {
      $notification.addClass('notifications-item--visible');
    }, 10);

    // Bind click events for dismissal
    $notification.on('click', (e) => {
      // Don't trigger if clicking the close button (it has its own handler)
      if (!$(e.target).hasClass('notifications-item-close')) {
        this.hide($notification);
      }
    });

    $notification.on('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.hide($notification);
      }
    });

    // Bind close button events
    $closeButton.on('click', (e) => {
      e.stopPropagation(); // Prevent triggering the notification click
      this.hide($notification);
    });

    // Auto-dismiss
    if (options.duration > 0) {
      setTimeout(() => {
        this.hide($notification);
      }, options.duration);
    }

    return $notification;
  }

  /**
   * Hide a specific notification
   * @param {jQuery} $notification - The notification element to hide
   */
  hide($notification) {
    if (!$notification || !$notification.length) return;

    $notification.removeClass('notifications-item--visible');
    
    setTimeout(() => {
      $notification.remove();
      const index = this.notifications.indexOf($notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300); // Match CSS transition duration
  }

  /**
   * Hide all notifications
   */
  hideAll() {
    this.notifications.forEach(notification => {
      this.hide(notification);
    });
  }

  /**
   * Convenience methods for different notification types
   */
  info(message, options = {}) {
    return this.show(message, { type: 'info', ...options });
  }

  success(message, options = {}) {
    return this.show(message, { type: 'success', ...options });
  }

  warning(message, options = {}) {
    return this.show(message, { type: 'warning', ...options });
  }

  error(message, options = {}) {
    return this.show(message, { type: 'error', ...options });
  }
}
