/**
 * Table Component - A reusable table with sorting and filtering capabilities.
 *
 * At minimum, provide `columns` and `data` arrays of objects.
 * Each column needs a `title` (header label). Omit `field` to derive it from `title`
 * as camelCase (e.g. "Display Name" → `displayName`). Set `field` when the row
 * property name does not match that inference.
 *
 * Cell values default to `row[column.field]`. A `valueFunction(row, value)` can
 * transform that (second argument is the raw value at `column.field`).
 *
 * By default, the cell value is displayed as a string,
 * however a custom renderFunction can be provided to override this behavior.
 * When renderFunction returns a string it is assigned with `.text()` (safe for untrusted data).
 * Return a jQuery object for buttons and other markup, or set `renderHtml: true` on the column
 * when the string is trusted HTML.
 *
 * Columns can be marked as sortable or searchable.
 * By default, the cell value is used for sorting and searching,
 * however custom sortFunction and searchFunction can be provided.
 * `sortFunction(a, b)` compares assuming ascending order.
 * Columns default to being sortable but not searchable.
 * If any column is searchable, the text search UI shows automatically.
 * Custom filter UI elements can be added with `addFilterRight`.
 *
 * An optional row count next to the filter bar can be enabled with
 * `rowCount: { show: true }`. Customize the noun with `rowCount.noun`
 * (or split via `rowCount.nounSingular` / `rowCount.nounPlural`).
 *
 * By default, data objects are shallow-cloned on load and on each `setData`.
 * With `mutableData: true`, object references are kept, so changes made
 * to objects in the table will affect the original data.
 */
class Table {
  /**
   * @param {Object} [options={}]
   * @param {Array<Object>} [options.columns=[]] Column definitions: required `title`; optional `field`
   *   (inferred from `title` when omitted); `sortable` (default true); `searchable` (default false);
   *   `valueFunction(row, value)`; `sortFunction`; `searchFunction`; `renderFunction(value, row, column)`;
   *   `renderHtml`; `cellClass`; `headerClass`.
   * @param {Array<Object>} [options.data=[]] Row objects; values from `row[field]` or `valueFunction`.
   * @param {boolean} [options.mutableData=false] When true, row references are kept on load and `setData` instead of shallow clones.
   * @param {string} [options.id] Root element `id`; a random id is generated if omitted.
   * @param {string} [options.searchPlaceholder] Placeholder text for the search box when any column is searchable.
   * @param {Object} [options.emptyState] Empty-state values: optional `message`, `icon`, `detailNoData`, `detailFiltered`.
   *   Use `''` to hide any parts, otherwise defaults are used.
   * @param {(rowData: Object, event: JQuery.Event) => void} [options.onRowClick] Called with row data when a body row is clicked.
   * @param {(rowData: Object, column: Object, event: JQuery.Event) => void} [options.onCellClick] Called when a cell is clicked if configured.
   * @param {{ field: string, direction?: 'asc'|'desc' }} [options.defaultSort] Initial sort configuration, `direction` defaults to `'asc'`.
   * @param {Object} [options.rowCount] Row-count display in the filter bar.
   * @param {boolean} [options.rowCount.show=false] Show a row count in the filter bar.
   * @param {string} [options.rowCount.noun] Convenience shortcut used as the default for both singular and plural.
   * @param {string} [options.rowCount.nounSingular='item'] Singular noun (falls back to `noun` or 'item').
   * @param {string} [options.rowCount.nounPlural='items'] Plural noun (falls back to `noun` or 'items').
   */
  constructor(options = {}) {
    this.id = options.id || 'table-' + Math.random().toString(36).substr(2, 9);
    this.columns = this.processColumns(options.columns || []);
    this.mutableData = options.mutableData === true;
    this.data = this.snapshotData(options.data || []);
    this.searchable = this.columns.some(col => col.searchable === true);
    this.searchPlaceholder = options.searchPlaceholder || 'Search...';

    // Use defaults unless overridden.
    this.emptyState = {
      message: 'No data found',
      icon: '📋',
      detailNoData: 'There is no data to display.',
      detailFiltered: 'Try adjusting your search criteria.',
      ...(options.emptyState && typeof options.emptyState === 'object' ? options.emptyState : {})
    };

    this.onRowClick = options.onRowClick || null;
    this.onCellClick = options.onCellClick || null;

    // Row count configuration
    const rcOpts = options.rowCount && typeof options.rowCount === 'object' ? options.rowCount : {};
    this.rowCount = {
      show: rcOpts.show === true,
      nounSingular: rcOpts.nounSingular || rcOpts.noun || 'item',
      nounPlural: rcOpts.nounPlural || rcOpts.noun || 'items'
    };

    // Current state
    this.currentSort = { field: null, direction: 'asc' };
    const ds = options.defaultSort;
    if (ds && typeof ds.field === 'string' && ds.field) {
      const col = this.columns.find(c => c.field === ds.field);
      if (col && col.sortable !== false) {
        this.currentSort.field = ds.field;
        this.currentSort.direction = ds.direction === 'desc' ? 'desc' : 'asc';
      }
    }
    this.searchTerm = '';

    // Custom filter functions
    this.customFilters = [];

    // Elements
    this.elements = {};
  }

  /**
   * Derive a camelCase identifier from a human-readable column title.
   * @param {string} title
   * @returns {string}
   */
  titleToCamelCase(title) {
    return title
      .toLowerCase()
      .split(/[^a-z0-9]+/) // split on non-alphanumeric characters
      .filter(Boolean) // drop empty segments
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  }

  /**
   * Normalize columns: infer `field` from `title` when missing, default `sortable` to `true`.
   * @param {Array<Object>} columns
   * @returns {Array<Object>} shallow copies; caller-supplied objects are not mutated.
   */
  processColumns(columns) {
    return columns.map(oldColumn => {
      const column = { ...oldColumn };

      // If no field name is provided, generate one from the title
      if (!column.field && column.title) {
        column.field = this.titleToCamelCase(column.title);
      }

      // Default to sortable unless explicitly set to false
      if (column.sortable === undefined) {
        column.sortable = true;
      }

      return column;
    });
  }

  /**
   * Build the table and filter HTML structure. Does not attach events or fill rows.
   * @returns {jQuery} Root `.table-component` element.
   */
  build() {
    const $container = $('<div>', {
      class: 'table-component',
      id: this.id
    });

    // Search filter (if enabled)
    this.elements.$filterLeft = $('<div>', { class: 'filter-left' });
    this.elements.$filterRight = $('<div>', { class: 'filter-right' });

    if (this.searchable) {
      this.elements.$searchInput = $('<input>', {
        type: 'text',
        class: 'search-input',
        name: this.id + '-search',
        placeholder: this.searchPlaceholder
      });

      this.elements.$clearSearchBtn = $('<button>', {
        type: 'button',
        class: 'btn btn-search-clear',
        title: 'Clear search',
        text: '✕'
      }).hide();

      this.elements.$filterLeft.append(
        $('<div>', { class: 'search-container' }).append(
          this.elements.$searchInput,
          this.elements.$clearSearchBtn
        )
      );
    }

    if (this.rowCount.show) {
      this.elements.$rowCount = $('<span>', {
        class: 'table-row-count',
        'aria-live': 'polite'
      });
      this.elements.$filterRight.append(this.elements.$rowCount);
    }

    this.elements.$filterSection = $('<div>', { class: 'table-filter' }).append(
      this.elements.$filterLeft,
      this.elements.$filterRight
    );
    $container.append(this.elements.$filterSection);
    this.updateFilterBarVisibility();

    // Table container
    this.elements.$tableContainer = $('<div>', { class: 'table-container' });

    // Table
    const $table = $('<table>', { class: 'data-table' });

    // Table header
    const $thead = $('<thead>').append(
      $('<tr>').append(
        this.columns.map(column => {
          const { headerClass } = column;
          const isSortable = column.sortable !== false;
          const headerClasses = [];
          if (isSortable) headerClasses.push('sortable');
          if (headerClass) headerClasses.push(headerClass);
          return $('<th>', {
            class: headerClasses.join(' '),
            'data-field': column.field,
            html: column.title + (isSortable ? ' <span class="sort-icon">↕</span>' : '')
          });
        })
      )
    );

    // Table body
    this.elements.$tbody = $('<tbody>');

    $table.append($thead, this.elements.$tbody);
    this.elements.$tableContainer.append($table);

    // Empty state
    const emptyParts = [];
    if (typeof this.emptyState.icon === 'string' && this.emptyState.icon !== '') {
      emptyParts.push($('<div>', { class: 'big-icon', text: this.emptyState.icon }));
    }
    emptyParts.push($('<h4>', { text: this.emptyState.message }));
    this.elements.$emptyStateDetail = $('<p>');
    emptyParts.push(this.elements.$emptyStateDetail);

    this.elements.$emptyState = $('<div>', {
      class: 'table-empty-state',
      style: 'display: none;'
    }).append(emptyParts);

    $container.append(this.elements.$tableContainer, this.elements.$emptyState);

    return $container;
  }

  /**
   * Build DOM, wire `bindEvents`, and `refresh`. Preferred one-shot setup.
   * @returns {jQuery} Same element as {@link Table#build}.
   */
  init() {
    const $container = this.build();
    this.bindEvents();
    this.updateSortIcons();
    this.refresh();
    return $container;
  }

  /**
   * Attach delegated handlers for search, sort, and optional row/cell clicks. Requires `build()` first.
   */
  bindEvents() {
    if (this.searchable) {
      // Search functionality
      this.elements.$searchInput.on('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.refresh();
        this.updateClearButton();
      });

      // Clear search button functionality
      this.elements.$clearSearchBtn.on('click', () => {
        this.elements.$searchInput.val('');
        this.searchTerm = '';
        this.refresh();
        this.updateClearButton();
      });
    }

    // Sort functionality
    this.elements.$tableContainer.on('click', '.data-table th.sortable', (e) => {
      const field = $(e.currentTarget).data('field');
      this.setSort(field);
    });

    // Row click functionality
    if (this.onRowClick) {
      this.elements.$tableContainer.on('click', '.data-table tbody tr', (e) => {
        const rowData = $(e.currentTarget).data('row-data');
        if (rowData) {
          this.onRowClick(rowData, e);
        }
      });
    }

    // Cell click functionality
    if (this.onCellClick) {
      this.elements.$tableContainer.on('click', '.data-table tbody td', (e) => {
        const $cell = $(e.currentTarget);
        const rowData = $cell.closest('tr').data('row-data');
        const field = $cell.data('field');
        const columnConfig = this.columns.find(col => col.field === field);
        if (rowData && columnConfig) {
          this.onCellClick(rowData, columnConfig, e);
        }
      });
    }
  }

  /**
   * Set active sort column (toggle asc/desc when the same field is chosen again) and re-render.
   * @param {string} field - Column `field` value (`data-field` on the header).
   */
  setSort(field) {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'asc';
    }
    this.updateSortIcons();
    this.refresh();
  }

  /**
   * Only show the filter bar when filterLeft or filterRight has content.
   */
  updateFilterBarVisibility() {
    const hasRight = this.elements.$filterRight.children().length > 0;
    this.elements.$filterSection.toggle(this.searchable || hasRight);
  }

  /**
   * Append custom filter controls to the right side of the filter row and show the row if needed.
   * @param {jQuery} $content - One or more elements to append (ignored if empty).
   */
  addFilterRight($content) {
    if (!$content?.length) return;
    this.elements.$filterRight.append($content);
    this.updateFilterBarVisibility();
  }

  /**
   * Replace row data (via {@link Table#snapshotData}) and re-render.
   * @param {Array<Object|*>} data
   */
  setData(data) {
    this.data = this.snapshotData(data);
    this.refresh();
  }

  /**
   * Creates a new array of data objects. Object references are retained
   * if `mutableData` is true, otherwise each object is shallow-cloned.
   *
   * @param {Array<*>} data
   * @returns {Array<*>}
   */
  snapshotData(data) {
    if (!Array.isArray(data)) {
      return [];
    }
    const next = [...data];
    if (this.mutableData) {
      return next;
    }
    return next.map(row =>
      row !== null && typeof row === 'object' && !Array.isArray(row) ? { ...row } : row
    );
  }

  /**
   * Clear all data and re-render (shows empty state if applicable).
   */
  clearData() {
    this.data = [];
    this.refresh();
  }

  /**
   * Register or remove a named row predicate. Each active filter must pass.
   * @param {string} id - Stable id. Reuse replaces the previous filter. Allows filter behavior to change at runtime.
   * @param {Function|null} filterFunction - `(item) => boolean`; omit or pass a falsy value to remove the filter.
   */
  customFilter(id, filterFunction) {
    // Remove existing filter with this ID
    this.customFilters = this.customFilters.filter(f => f.id !== id);

    // Add new filter if function is provided
    if (filterFunction) {
      this.customFilters.push({ id, filterFunction });
    }

    // Refresh the table when filters change
    this.refresh();
  }

  /**
   * Re-render the table, applying filters, searching, and sorting before rendering.
   */
  refresh() {
    let filteredData = [...this.data];

    // Apply custom filters
    this.customFilters.forEach(({ filterFunction }) => {
      filteredData = filteredData.filter(filterFunction);
    });

    // Apply search filter
    if (this.searchTerm && this.searchable) {
      filteredData = filteredData.filter(item => this.matchesSearch(item, this.searchTerm));
    }

    // Apply sorting
    const { field, direction } = this.currentSort;
    if (field) {
      filteredData.sort((a, b) => {
        const column = this.columns.find(col => col.field === field);
        if (!column) return 0;

        // sortFunction compares ascending; we flip the result for desc.
        if (typeof column.sortFunction === 'function') {
          const cmp = column.sortFunction(a, b);
          return direction === 'asc' ? cmp : -cmp;
        }

        let aValue = this.getFieldValue(a, column);
        let bValue = this.getFieldValue(b, column);

        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        const cmp = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return direction === 'asc' ? cmp : -cmp;
      });
    }

    this.renderRows(filteredData);
    this.updateRowCount(filteredData.length);
  }

  /**
   * Resolve the cell value for a row and column.
   * @param {Object} item
   * @param {Object} column
   * @returns {*}
   */
  getFieldValue(item, column) {
    const raw = item[column.field];
    if (column.valueFunction) {
      return column.valueFunction(item, raw);
    }
    return raw;
  }

  /**
   * Whether any `searchable` column matches `searchTerm`
   * (assumed to be already lowercased and trimmed by the caller).
   *
   * @param {Object} item
   * @param {string} searchTerm
   * @returns {boolean}
   */
  matchesSearch(item, searchTerm) {
    return this.columns.some(column => {
      // Only search columns that are explicitly marked as searchable
      if (column.searchable !== true) {
        return false;
      }

      const value = this.getFieldValue(item, column);
      if (column.searchFunction) {
        return column.searchFunction(item, searchTerm);
      }
      return value && value.toString().toLowerCase().includes(searchTerm);
    });
  }

  /**
   * Replace tbody contents. Shows empty state when `data` is empty.
   * Stores each row object on the `tr` as jQuery `.data('row-data', item)` for click handlers.
   * @param {Array<Object>} data — filtered and sorted rows to display.
   */
  renderRows(data) {
    this.elements.$tbody.empty();

    if (data.length === 0) {
      const detailText = this.data.length === 0
        ? this.emptyState.detailNoData
        : this.emptyState.detailFiltered;
      if (detailText) {
        this.elements.$emptyStateDetail.text(detailText).show();
      } else {
        this.elements.$emptyStateDetail.empty().hide();
      }
      this.elements.$emptyState.show();
      this.elements.$tableContainer.hide();
      return;
    }

    this.elements.$emptyState.hide();
    this.elements.$tableContainer.show();

    data.forEach(item => {
      const $row = $('<tr>').data('row-data', item);

      this.columns.forEach(column => {
        const value = this.getFieldValue(item, column);
        const $cell = $('<td>');

        // Add the field name if needed for cell click lookups
        if (this.onCellClick) {
          $cell.attr('data-field', column.field);
        }

        // Apply custom cell class if specified
        if (column.cellClass) {
          $cell.addClass(column.cellClass);
        }

        if (column.renderFunction) {
          const rendered = column.renderFunction(value, item, column);
          if (rendered && typeof rendered === 'object' && rendered.jquery) {
            $cell.append(rendered);
          } else if (column.renderHtml === true) {
            $cell.append(rendered !== undefined && rendered !== null ? rendered : '');
          } else {
            $cell.text(rendered !== undefined && rendered !== null ? rendered : '');
          }
        } else {
          $cell.text(value !== undefined && value !== null ? value : '');
        }

        $row.append($cell);
      });

      this.elements.$tbody.append($row);
    });
  }

  /**
   * Reset all sortable headers, then set the active column icon appropriately.
   */
  updateSortIcons() {
    const sortableColumns = this.elements.$tableContainer.find('.data-table th.sortable');
    sortableColumns.find('.sort-icon').text('↕');
    const { field, direction } = this.currentSort;
    if (!field) return;

    sortableColumns.filter((_, el) => $(el).data('field') === field)
      .find('.sort-icon')
      .text(direction === 'asc' ? '↑' : '↓');
  }

  /**
   * Return the correct singular/plural noun.
   * @param {number} count
   * @returns {string}
   */
  rowCountLabel(count) {
    return count === 1 ? this.rowCount.nounSingular : this.rowCount.nounPlural;
  }

  /**
   * Update the optional row count in the filter bar.
   * Shows `"N items"` normally, or `"Showing N of M items"` when data is filtered.
   * @param {number} filteredCount - Number of rows currently rendered.
   */
  updateRowCount(filteredCount) {
    if (!this.rowCount.show) return;

    const total = this.data.length;
    if (filteredCount === total) {
      this.elements.$rowCount.text(`${filteredCount} ${this.rowCountLabel(filteredCount)}`);
      return;
    }

    this.elements.$rowCount.text(`Showing ${filteredCount} of ${total} ${this.rowCountLabel(total)}`);
  }

  /**
   * Show or hide the search clear control based on whether the input contains text.
   */
  updateClearButton() {
    if (!this.searchable) return;

    const searchValue = this.elements.$searchInput.val();
    if (searchValue !== '') {
      this.elements.$clearSearchBtn.show();
    } else {
      this.elements.$clearSearchBtn.hide();
    }
  }
}

// Make Table class globally available
window.Table = Table;
