$(function () {
  var $root = $(document.documentElement);
  var themeModes = ['auto', 'light', 'dark'];

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
});
