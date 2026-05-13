(function () {
  var root = document.documentElement;

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    ['theme-auto', 'theme-light', 'theme-dark'].forEach(function (id) {
      var btn = document.getElementById(id);
      var active = (mode === 'auto' && id === 'theme-auto') ||
        (mode === 'light' && id === 'theme-light') ||
        (mode === 'dark' && id === 'theme-dark');
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  document.getElementById('theme-auto').addEventListener('click', function () {
    setTheme('auto');
  });
  document.getElementById('theme-light').addEventListener('click', function () {
    setTheme('light');
  });
  document.getElementById('theme-dark').addEventListener('click', function () {
    setTheme('dark');
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
  var jsonMutableFalse = document.getElementById('json-mutable-false');
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
    jsonMutableFalse.textContent = JSON.stringify(hostFrozen, null, 2);
  }

  $('#app-mutable-false').append(tableFrozen.init());
  syncMutableJsonFalse();

  var hostLive = [{ label: 'One row', count: 0 }];
  var jsonMutableTrue = document.getElementById('json-mutable-true');
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
    jsonMutableTrue.textContent = JSON.stringify(hostLive, null, 2);
  }

  $('#app-mutable-true').append(tableLive.init());
  syncMutableJsonTrue();
})();
