function buildMenuDemoPanel() {
  return $('<div>').append(
    $('<section>', { 'aria-labelledby': 'heading-menus' }).append(
      $('<h2>', { id: 'heading-menus', text: 'Menu component' }),
      $('<p>', { class: 'intro' }).append(
        'Menus default to vertical layout; pass ',
        $('<code>', { text: "orientation: 'horizontal'" }),
        ' for a row of items. ',
        $('<code>', { text: "behavior.open: 'always'" }),
        ' keeps the list visible, ',
        $('<code>', { text: "'toggle'" }),
        ' opens on hover and can be pinned open by clicking the button.'
      ),
      $('<h3>', { class: 'demo-subheading', text: 'Always open' }),
      $('<p>', {
        class: 'intro',
        text: 'Two menus with item groups contents: one is closed by default, and the other is always open.'
      }),
      $('<div>', { class: 'menu-always-demos' }).append(
        $('<div>', { id: 'app-menu-groups' }),
        $('<div>', { id: 'app-menu-simple' })
      ),
      $('<div>', { id: 'app-menu-always-horizontal' }),
      $('<h3>', { class: 'demo-subheading', text: 'Direction and alignment' }),
      $('<p>', {
        class: 'intro',
        text: 'Toggleable menus can be configured to have different directions and alignments:'
      }),
      $('<ul>').append(
        $('<li>').html('<strong>Direction</strong> controls where the menu opens relative to the button.'),
        $('<li>').html('<strong>Alignment</strong> controls the alignment of the menu on the axis perpendicular to the direction.')
      ),
      $('<div>', { class: 'menu-playground-controls', role: 'group', 'aria-label': 'Menu placement options' }).append(
        $('<label>', { class: 'menu-playground-control' }).append(
          $('<span>', { text: 'Type' }),
          $('<select>', { id: 'menu-playground-type' }).append(
            $('<option>', { value: 'vertical', text: 'Vertical', selected: true }),
            $('<option>', { value: 'horizontal', text: 'Horizontal' })
          )
        ),
        $('<label>', { class: 'menu-playground-control' }).append(
          $('<span>', { text: 'Direction' }),
          $('<select>', { id: 'menu-playground-direction' }).append(
            $('<option>', { value: 'default', text: 'Default', selected: true }),
            $('<option>', { value: 'above', text: 'Above' }),
            $('<option>', { value: 'below', text: 'Below' }),
            $('<option>', { value: 'left', text: 'Left' }),
            $('<option>', { value: 'right', text: 'Right' })
          )
        ),
        $('<label>', { class: 'menu-playground-control' }).append(
          $('<span>', { text: 'Alignment' }),
          $('<select>', { id: 'menu-playground-alignment' }).append(
            $('<option>', { value: 'default', text: 'Default', selected: true }),
            $('<option>', { value: 'left', text: 'Left' }),
            $('<option>', { value: 'center', text: 'Center' }),
            $('<option>', { value: 'right', text: 'Right' }),
            $('<option>', { value: 'top', text: 'Top' }),
            $('<option>', { value: 'bottom', text: 'Bottom' })
          )
        ),
        $('<label>', { class: 'menu-playground-control' }).append(
          $('<span>', { text: 'Default state' }),
          $('<select>', { id: 'menu-playground-default-open' }).append(
            $('<option>', { value: 'closed', text: 'Closed', selected: true }),
            $('<option>', { value: 'open', text: 'Open' })
          )
        )
      ),
      $('<div>', { class: 'menu-placement-arena', id: 'menu-placement-arena', 'aria-label': 'Menu placement preview' }).append(
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--top-left', 'data-slot': 'top-left' }),
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--top-center', 'data-slot': 'top-center' }),
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--top-right', 'data-slot': 'top-right' }),
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--middle-left', 'data-slot': 'middle-left' }),
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--middle-right', 'data-slot': 'middle-right' }),
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--bottom-left', 'data-slot': 'bottom-left' }),
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--bottom-center', 'data-slot': 'bottom-center' }),
        $('<div>', { class: 'menu-placement-slot menu-placement-slot--bottom-right', 'data-slot': 'bottom-right' })
      )
    )
  );
}

function buildModalDemoPanel() {
  return $('<div>').append(
    $('<section>', { 'aria-labelledby': 'heading-modals' }).append(
      $('<h2>', { id: 'heading-modals', text: 'Modal component' }),
      $('<p>', {
        class: 'intro',
        text: 'Alert and confirm dialogs share one backdrop while open. Default motion: instant enter, slide-up exit.'
      }),
      $('<div>', { class: 'demo-toolbar' }).append(
        $('<button>', { type: 'button', id: 'btn-modal-alert', text: 'Show alert' }),
        $('<button>', { type: 'button', id: 'btn-modal-confirm', text: 'Show confirm' })
      ),
      $('<h3>', { class: 'demo-subheading', text: 'Alert enter / exit presets' }),
      $('<p>', {
        class: 'intro',
        text: 'Each button uses the same preset for open and close (300ms). Dismiss the alert to see the exit animation. The default alert above uses instant enter and slide-up exit only.'
      }),
      $('<div>', { class: 'demo-toolbar', id: 'alert-animation-toolbar' })
    )
  );
}

function buildTableDemoPanel() {
  return $('<div>').append(
    $('<section>', { 'aria-labelledby': 'heading-tables' }).append(
      $('<h2>', { id: 'heading-tables', text: 'Table component' }),
      $('<p>', { class: 'intro' }).append(
        'Demos of the ',
        $('<code>', { text: 'Table' }),
        ' component.'
      )
    ),
    $('<section>', { 'aria-labelledby': 'heading-ledger' }).append(
      $('<h2>', { id: 'heading-ledger', text: 'Minimal table' }),
      $('<p>', {
        class: 'intro',
        text: 'A simple table displaying basic object data with no searching or filtering.'
      }),
      $('<div>', { id: 'app-ledger' })
    ),
    $('<section>', { 'aria-labelledby': 'heading-search' }).append(
      $('<h2>', { id: 'heading-search', text: 'Complex table' }),
      $('<p>', { class: 'intro', text: 'A table demonstrating more complex features:' }),
      $('<ul>').append(
        $('<li>').append(
          'Text search against ',
          $('<code>', { text: 'searchable: true' }),
          ' columns (SKU, category, status).'
        ),
        $('<li>').append(
          'A custom field name so column headers can be customized separately from data property names.'
        ),
        $('<li>').append(
          "Custom value, render and sort functions for the 'status' column to allow it to be driven by the 'quantity' column."
        ),
        $('<li>').append('A custom filter UI element and function to allow filtering by status.'),
        $('<li>').append('Action buttons to modify properties of each row to see re-rendering (including sorting and filtering).'),
        $('<li>').append('A custom row click handler which logs data to the browser console.'),
        $('<li>').append(
          $('<code>', { text: 'defaultSort' }),
          ' so the table opens sorted by computed status.'
        )
      ),
      $('<div>', { class: 'demo-toolbar' }).append(
        $('<button>', { type: 'button', id: 'btn-restore', text: 'Restore sample data' }),
        $('<button>', { type: 'button', id: 'btn-clear', text: 'Clear table' })
      ),
      $('<div>', { id: 'app-search' })
    ),
    $('<section>', { 'aria-labelledby': 'heading-mutable' }).append(
      $('<h2>', { id: 'heading-mutable', text: 'Mutable tables' }),
      $('<p>', { class: 'intro' }).append(
        'With ',
        $('<code>', { text: 'mutableData: false' }),
        " (default), each row is shallow-cloned into the table's internal array. With ",
        $('<code>', { text: 'mutableData: true' }),
        ', object references remain intact, so changes can affect the original data.'
      ),
      $('<p>', { class: 'intro' }).append(
        'Below is a live ',
        $('<code>', { text: 'JSON.stringify' }),
        ' of data passed into two Table components. Only the mutableData: true table should change when the "+1" button is clicked.'
      ),
      $('<div>', { class: 'mutable-demo-grid' }).append(
        $('<div>', { class: 'mutable-demo-panel' }).append(
          $('<h3>').append($('<code>', { text: 'mutableData: false' }), ' — cloned row objects'),
          $('<pre>', { class: 'mutable-json', id: 'json-mutable-false', 'aria-live': 'polite' }),
          $('<div>', { id: 'app-mutable-false' })
        ),
        $('<div>', { class: 'mutable-demo-panel' }).append(
          $('<h3>').append($('<code>', { text: 'mutableData: true' }), ' — same row objects'),
          $('<pre>', { class: 'mutable-json', id: 'json-mutable-true', 'aria-live': 'polite' }),
          $('<div>', { id: 'app-mutable-true' })
        )
      )
    )
  );
}

function buildNotificationsDemoPanel() {
  return $('<div>').append(
    $('<section>', { 'aria-labelledby': 'heading-notifications' }).append(
      $('<h2>', { id: 'heading-notifications', text: 'Notifications component' }),
      $('<p>', { class: 'intro' }).append(
        'Quick smoke-test controls for the starter notification styles and behavior.'
      ),
      $('<div>', { class: 'demo-toolbar', role: 'group', 'aria-label': 'Notification type demos' }).append(
        $('<button>', { type: 'button', id: 'btn-notification-info', text: 'Info' }),
        $('<button>', { type: 'button', id: 'btn-notification-success', text: 'Success' }),
        $('<button>', { type: 'button', id: 'btn-notification-warning', text: 'Warning' }),
        $('<button>', { type: 'button', id: 'btn-notification-error', text: 'Error' }),
        $('<button>', { type: 'button', id: 'btn-notification-persistent', text: 'Persistent' }),
        $('<button>', { type: 'button', id: 'btn-notification-clear', text: 'Clear all' })
      ),
      $('<p>', {
        class: 'intro',
        text: 'Type buttons auto-dismiss after 3s. Persistent stays open until clicked or manually cleared.'
      })
    )
  );
}

$(function () {
  var $root = $(document.documentElement);
  var themeModes = ['auto', 'light', 'dark'];
  window.services = window.services || {};
  window.services.notifications = new Notifications();
  $('body').append(window.services.notifications.init());

  function setTheme(mode) {
    $root.attr('data-theme', mode);
    themeModes.forEach(function (themeMode) {
      $('#theme-' + themeMode).attr('aria-pressed', mode === themeMode ? 'true' : 'false');
    });
  }

  themeModes.forEach(function (mode) {
    $('#theme-' + mode).on('click', function () {
      setTheme(mode);
    });
  });

  var demoTabs = new TabbedRegion({ ariaLabel: 'Component demos' });
  demoTabs
    .addTab('menu', 'Menu', buildMenuDemoPanel())
    .addTab('modal', 'Modal', buildModalDemoPanel())
    .addTab('table', 'Table', buildTableDemoPanel())
    .addTab('notifications', 'Notifications', buildNotificationsDemoPanel());
  $('#app-demo-tabs').append(demoTabs.init());

  $('#btn-modal-alert').on('click', function () {
    AlertModal.show('Sample alert message for the demo.', 'Alert');
  });

  $('#btn-modal-confirm').on('click', function () {
    ConfirmModal.confirm('Proceed with this action?', 'Confirm').then(function (ok) {
      if (ok) {
        AlertModal.show('You chose OK.', 'Result');
      }
    });
  });

  var alertAnimationDemos = [
    { label: 'Fade', enter: 'fade', exit: 'fade' },
    { label: 'Slide up', enter: 'slide-up', exit: 'slide-up' },
    { label: 'Slide down', enter: 'slide-down', exit: 'slide-down' },
    { label: 'Slide left', enter: 'slide-left', exit: 'slide-left' },
    { label: 'Slide right', enter: 'slide-right', exit: 'slide-right' },
    { label: 'Scale up', enter: 'scale-up', exit: 'scale-up', scale: 0.9 },
    { label: 'Scale down', enter: 'scale-down', exit: 'scale-down', scale: 1.1 }
  ];

  var $alertAnimToolbar = $('#alert-animation-toolbar');
  alertAnimationDemos.forEach(function (demo) {
    $('<button>', { type: 'button', text: demo.label })
      .on('click', function () {
        var enter = { preset: demo.enter, duration: 300 };
        var exit = { preset: demo.exit, duration: 300 };
        if (demo.scale != null) {
          enter.scale = demo.scale;
          exit.scale = demo.scale;
        }
        AlertModal.show(
          'Enter: ' + demo.enter + ' · Exit: ' + demo.exit,
          demo.label,
          { enterAnimation: enter, exitAnimation: exit }
        );
      })
      .appendTo($alertAnimToolbar);
  });

  var tableLedger = new Table({
    columns: [
      { field: 'ref', title: 'Reference' },
      { title: 'Channel' },
      { field: 'delta', title: 'Amount' },
      { title: 'Note' }
    ],
    data: [
      { ref: 'TX-900114', channel: 'Wholesale', delta: -1420.5, note: 'Credit memo' },
      { ref: 'TX-900115', channel: 'Retail', delta: 88.0, note: 'POS batch' },
      { ref: 'TX-900116', channel: 'Wholesale', delta: 12040.0, note: 'Invoice' },
      { ref: 'TX-900117', channel: 'Online', delta: -32.99, note: 'Refund' }
    ],
    defaultSort: { field: 'ref' }
  });

  $('#app-ledger').append(tableLedger.init());

  var inventoryData = [
    { sku: 'SKU-10442', category: 'Fasteners', qty: 240, defaultQty: 240 },
    { sku: 'SKU-88201', category: 'Electrical', qty: 18, defaultQty: 72 },
    { sku: 'SKU-33019', category: 'Fasteners', qty: 0, defaultQty: 120 },
    { sku: 'SKU-77104', category: 'HVAC', qty: 64, defaultQty: 64 },
    { sku: 'SKU-22008', category: 'Electrical', qty: 10, defaultQty: 100 }
  ];

  function stockFraction(item) {
    var max = item.defaultQty;
    if (max == null || max <= 0) return 0;
    return item.qty / max;
  }

  var tableSearch = new Table({
    id: 'demo-inventory-table',
    rowCount: { show: true },
    columns: [
      { title: 'SKU', searchable: true },
      { title: 'Category', searchable: true },
      {
        title: 'Status',
        searchable: true,
        valueFunction: function (item) {
          var f = stockFraction(item);
          if (f <= 0) return 'Backordered';
          if (f <= 0.25) return 'Low stock';
          return 'In stock';
        },
        sortFunction: function (a, b) {
          return stockFraction(a) - stockFraction(b);
        },
        renderFunction: function (value) {
          var cls = value === 'In stock' ? 'demo-badge demo-badge--ok' : 'demo-badge';
          return $('<span>', { class: cls, text: value });
        }
      },
      { field: 'qty', title: 'Quantity' },
      {
        title: 'Actions',
        sortable: false,
        cellClass: 'actions-cell demo-actions-cell',
        renderFunction: function (_value, item) {
          var $wrap = $('<div>', { class: 'demo-actions' });
          var $restock = $('<button>', {
            type: 'button',
            class: 'demo-action demo-action--primary',
            text: 'Restock'
          });
          var $reduce = $('<button>', {
            type: 'button',
            class: 'demo-action',
            text: 'Reduce stock'
          });
          $restock.on('click', function (e) {
            e.stopPropagation();
            item.qty = item.defaultQty;
            tableSearch.setData(tableSearch.data);
          });
          $reduce.on('click', function (e) {
            e.stopPropagation();
            var cut = Math.round((item.defaultQty || 0) * 0.2);
            item.qty = Math.max(0, item.qty - cut);
            tableSearch.setData(tableSearch.data);
          });
          return $wrap.append($restock, $reduce);
        }
      }
    ],
    data: inventoryData,
    defaultSort: { field: 'status', direction: 'desc' },
    searchPlaceholder: 'Filter by SKU, category, or status…',
    onRowClick: function (row) {
      console.log('Row clicked:', row);
    }
  });

  $('#app-search').append(tableSearch.init());

  var statusSelectId = tableSearch.id + '-status-filter';
  var $statusSelect = $('<select>', {
    id: statusSelectId,
    name: statusSelectId
  }).append(
    $('<option>', { value: 'all', text: 'All availability' }),
    $('<option>', { value: 'in-stock', text: 'In stock only' }),
    $('<option>', { value: 'out-of-stock', text: 'Out of stock only' })
  );
  $statusSelect.on('change', function () {
    var v = $(this).val();
    if (v === 'all') {
      tableSearch.customFilter('stock-availability', null);
    } else if (v === 'in-stock') {
      tableSearch.customFilter('stock-availability', function (row) {
        return stockFraction(row) > 0;
      });
    } else {
      tableSearch.customFilter('stock-availability', function (row) {
        return stockFraction(row) <= 0;
      });
    }
  });
  var $statusLabel = $('<label>', { for: statusSelectId, text: 'Status filter' });
  tableSearch.addFilterRight(
    $('<div>', { class: 'demo-inline-filter' }).append($statusLabel, $statusSelect)
  );

  $('#btn-restore').on('click', function () {
    $statusSelect.val('all');
    tableSearch.customFilter('stock-availability', null);
    tableSearch.setData(inventoryData);
  });

  $('#btn-clear').on('click', function () {
    tableSearch.clearData();
  });

  $('#btn-notification-info').on('click', function () {
    window.services.notifications.info('Info: this is a test notification.');
  });

  $('#btn-notification-success').on('click', function () {
    window.services.notifications.success('Success: action completed successfully.');
  });

  $('#btn-notification-warning').on('click', function () {
    window.services.notifications.warning('Warning: please double-check your input.');
  });

  $('#btn-notification-error').on('click', function () {
    window.services.notifications.error('Error: something went wrong.');
  });

  $('#btn-notification-persistent').on('click', function () {
    window.services.notifications.info('Persistent notification (duration: 0).', { duration: 0 });
  });

  $('#btn-notification-clear').on('click', function () {
    window.services.notifications.hideAll();
  });

  var hostFrozen = [{ label: 'One row', count: 0 }];
  var $jsonMutableFalse = $('#json-mutable-false');
  var tableFrozen = new Table({
    id: 'demo-mutable-false',
    columns: [
      { title: 'Label' },
      { title: 'Count' },
      {
        title: 'Action',
        sortable: false,
        renderFunction: function (_v, item) {
          var $btn = $('<button>', {
            type: 'button',
            class: 'demo-action demo-action--primary',
            text: '+1'
          });
          $btn.on('click', function (e) {
            e.stopPropagation();
            item.count += 1;
            tableFrozen.setData(tableFrozen.data);
            syncMutableJsonFalse();
          });
          return $btn;
        }
      }
    ],
    data: hostFrozen
  });

  function syncMutableJsonFalse() {
    $jsonMutableFalse.text(JSON.stringify(hostFrozen, null, 2));
  }

  $('#app-mutable-false').append(tableFrozen.init());
  syncMutableJsonFalse();

  var hostLive = [{ label: 'One row', count: 0 }];
  var $jsonMutableTrue = $('#json-mutable-true');
  var tableLive = new Table({
    id: 'demo-mutable-true',
    mutableData: true,
    columns: [
      { title: 'Label' },
      { title: 'Count' },
      {
        title: 'Action',
        sortable: false,
        renderFunction: function (_v, item) {
          var $btn = $('<button>', {
            type: 'button',
            class: 'demo-action demo-action--primary',
            text: '+1'
          });
          $btn.on('click', function (e) {
            e.stopPropagation();
            item.count += 1;
            tableLive.setData(tableLive.data);
            syncMutableJsonTrue();
          });
          return $btn;
        }
      }
    ],
    data: hostLive
  });

  function syncMutableJsonTrue() {
    $jsonMutableTrue.text(JSON.stringify(hostLive, null, 2));
  }

  $('#app-mutable-true').append(tableLive.init());
  syncMutableJsonTrue();

  const menuDemoItems = [
    { text: 'Profile', onClick: () => AlertModal.show('Profile selected.', 'Menu') },
    { text: 'Settings', onClick: () => AlertModal.show('Settings selected.', 'Menu') },
    { type: 'divider' },
    { text: 'Sign out', onClick: () => AlertModal.show('Sign out selected.', 'Menu') }
  ];

  const menuGroupsDemoItems = [
    {
      type: 'group',
      parent: { text: 'Advanced' },
      behavior: { open: 'toggle' },
      items: [
        { text: 'Export data', onClick: () => AlertModal.show('Export data selected.', 'Menu') },
        { text: 'Import data', onClick: () => AlertModal.show('Import data selected.', 'Menu') },
        {
          type: 'group',
          parent: { text: 'Danger zone' },
          behavior: { open: 'toggle' },
          items: [
            { text: 'Reset cache', onClick: () => AlertModal.show('Reset cache selected.', 'Menu') },
            { text: 'Delete account', onClick: () => AlertModal.show('Delete account selected.', 'Menu') }
          ]
        }
      ]
    }
  ];

  const menuSimpleDemoItems = [
    { text: 'Dashboard', onClick: () => AlertModal.show('Dashboard selected.', 'Menu') },
    {
      type: 'group',
      parent: { text: 'Pinned' },
      behavior: { open: 'always' },
      items: [
        { text: 'Documentation', onClick: () => AlertModal.show('Documentation selected.', 'Menu') },
        { text: 'Release notes', onClick: () => AlertModal.show('Release notes selected.', 'Menu') }
      ]
    },
    { type: 'divider' },
    { text: 'Signed in as john@doe.com' },
    { text: 'Profile', onClick: () => AlertModal.show('Profile selected.', 'Menu') },
    { text: 'Sign out', onClick: () => AlertModal.show('Sign out selected.', 'Menu') }
  ];

  var menuGroups = new Menu({
    behavior: { open: 'always' },
    items: menuGroupsDemoItems
  });
  $('#app-menu-groups').append(menuGroups.init());

  var menuSimple = new Menu({
    behavior: { open: 'always' },
    items: menuSimpleDemoItems
  });
  $('#app-menu-simple').append(menuSimple.init());

  var menuAlwaysHorizontal = new Menu({
    orientation: 'horizontal',
    behavior: { open: 'always' },
    items: menuDemoItems
  });
  $('#app-menu-always-horizontal').append(menuAlwaysHorizontal.init());

  var menuPlaygroundSlots = [
    { id: 'top-left', defaultDirection: 'below', defaultAlignment: 'left' },
    { id: 'top-center', defaultDirection: 'below', defaultAlignment: 'center' },
    { id: 'top-right', defaultDirection: 'below', defaultAlignment: 'right' },
    { id: 'middle-left', defaultDirection: 'right', defaultAlignment: 'center' },
    { id: 'middle-right', defaultDirection: 'left', defaultAlignment: 'center' },
    { id: 'bottom-left', defaultDirection: 'above', defaultAlignment: 'left' },
    { id: 'bottom-center', defaultDirection: 'above', defaultAlignment: 'center' },
    { id: 'bottom-right', defaultDirection: 'above', defaultAlignment: 'right' }
  ];
  var menuPlaygroundInstances = {};

  function getMenuPlaygroundControls() {
    return {
      type: $('#menu-playground-type').val(),
      direction: $('#menu-playground-direction').val(),
      alignment: $('#menu-playground-alignment').val(),
      defaultOpen: $('#menu-playground-default-open').val() === 'open'
    };
  }

  function resolvePlaygroundDefaultAlignment(slot, direction) {
    if (slot.id === 'middle-left' && (direction === 'above' || direction === 'below')) {
      return 'left';
    }
    if (slot.id === 'middle-right' && (direction === 'above' || direction === 'below')) {
      return 'right';
    }
    return slot.defaultAlignment;
  }

  function resolveMenuPlaygroundOptions(slot, controls) {
    var options = {
      behavior: {
        closeDelay: 0,
        defaultOpen: controls.defaultOpen
      },
      items: menuDemoItems
    };

    options.orientation = controls.type === 'horizontal' ? 'horizontal' : 'vertical';

    options.direction =
      controls.direction === 'default' ? slot.defaultDirection : controls.direction;
    options.alignment =
      controls.alignment === 'default'
        ? resolvePlaygroundDefaultAlignment(slot, options.direction)
        : controls.alignment;

    if (options.orientation === 'vertical') {
      if (slot.id === 'middle-left') {
        options.textAlign = 'left';
      } else if (slot.id === 'middle-right') {
        options.textAlign = 'right';
      }
    }

    return options;
  }

  function rebuildMenuPlayground() {
    var controls = getMenuPlaygroundControls();
    var $arena = $('#menu-placement-arena');

    menuPlaygroundSlots.forEach(function (slot) {
      var $mount = $arena.find('[data-slot="' + slot.id + '"]');
      if (menuPlaygroundInstances[slot.id]) {
        menuPlaygroundInstances[slot.id].destroy();
      }
      var menu = new Menu(resolveMenuPlaygroundOptions(slot, controls));
      menuPlaygroundInstances[slot.id] = menu;
      $mount.empty().append(menu.init());
    });
  }

  $('#menu-playground-type, #menu-playground-direction, #menu-playground-alignment, #menu-playground-default-open')
    .on('change', rebuildMenuPlayground);
  rebuildMenuPlayground();
});
