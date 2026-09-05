// Highlight ARIA table roles
// Highlights ARIA roles relating to tables.
// The colours identify the role and carry no verdict. Green, amber and red are
// not used here, so a role is never mistaken for a pass or a failure.
// Role values are matched case-insensitively.
// Click to activate, then press `1` through `6` in order to step through the role hierarchy from container to cell.
// Press `n` to step through each role type in sequence.
// Note: re-run the bookmarklet after sorting to see updated aria-sort values.
(function () {
  var OVERLAY_ID = 'a11y-aria-table-overlay';
  var LEGEND_ID = 'a11y-aria-table-legend';

  // Remove both pieces of the previous run, not just the overlay
  var oldOverlay = document.getElementById(OVERLAY_ID);
  if (oldOverlay) oldOverlay.remove();
  var oldLegend = document.getElementById(LEGEND_ID);
  if (oldLegend) oldLegend.remove();

  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;pointer-events:none;z-index:999999;';
  document.body.appendChild(overlay);

  // Category colours, not verdicts. This bookmarklet says what role each element
  // has, never whether it is right or wrong, so green, amber and red are
  // deliberately excluded: every cell of a valid grid used to be outlined green
  // and every column header red.
  var COLOURS = {
    container: '#0a558c',
    rowgroup: '#006064',
    row: '#4e342e',
    columnheader: '#880e4f',
    rowheader: '#4a148c',
    cell: '#37474f'
  };

  var groups = {
    container: [], rowgroup: [], row: [], columnheader: [], rowheader: [], cell: []
  };

  var activeGroup = null;
  var groupOrder = ['container', 'rowgroup', 'row', 'columnheader', 'rowheader', 'cell'];

  // Container roles badge above; anything inside a container badges at the
  // bottom so it does not collide with its parent's badge.
  var badgePosition = {
    table: 'above', grid: 'above', treegrid: 'above', rowgroup: 'above',
    row: 'bottom', columnheader: 'bottom', rowheader: 'bottom',
    cell: 'bottom', gridcell: 'bottom'
  };

  var groupOf = {
    table: 'container', grid: 'container', treegrid: 'container',
    rowgroup: 'rowgroup', row: 'row',
    columnheader: 'columnheader', rowheader: 'rowheader',
    cell: 'cell', gridcell: 'cell'
  };

  var CONTAINER_ROLES = { table: true, grid: true, treegrid: true };
  var SORTABLE_ROLES = { columnheader: true, rowheader: true };
  var SORT_VALUES = new Set(['ascending', 'descending', 'none', 'other']);

  function getName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    var name = '';
    if (labelledBy) {
      name = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ');
    }
    if (!name) {
      var ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) name = ariaLabel.trim();
    }
    return name;
  }

  function annotate(el, role) {
    var group = groupOf[role];
    var colour = COLOURS[group];
    var position = badgePosition[role] || 'above';
    var rect = el.getBoundingClientRect();

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';

    var text = 'role="' + role + '"';

    if (CONTAINER_ROLES[role]) {
      var name = getName(el);
      if (name) text += ': ' + name;
    }

    // aria-sort is supported on columnheader and rowheader
    if (SORTABLE_ROLES[role]) {
      var raw = el.getAttribute('aria-sort');
      if (raw !== null) {
        var sort = raw.trim().toLowerCase();
        text += SORT_VALUES.has(sort)
          ? ' (sort: ' + sort + ')'
          : ' (sort: "' + raw.trim() + '" INVALID VALUE)';
      }
    }

    var badge = document.createElement('div');
    badge.textContent = text;
    badge.style.position = 'absolute';
    badge.style.left = (rect.left + window.scrollX + 2) + 'px';
    badge.style.top = position === 'above'
      ? (rect.top + window.scrollY - 26) + 'px'
      : (rect.bottom + window.scrollY - 24) + 'px';
    badge.style.background = colour;
    badge.style.color = '#fff';
    badge.style.padding = '2px 5px';
    badge.style.fontSize = '14px';
    badge.style.fontFamily = 'Arial,sans-serif';
    badge.style.borderRadius = '3px';
    badge.style.whiteSpace = 'nowrap';
    badge.style.pointerEvents = 'none';
    badge.style.zIndex = '999999';
    overlay.appendChild(badge);

    groups[group].push({ el: el, badge: badge, colour: colour });
  }

  // Role values are matched case-insensitively, and only the first token is read
  var selector = Object.keys(badgePosition).map(function (role) {
    return '[role="' + role + '" i]';
  }).join(',');

  function roleOf(el) {
    var raw = el.getAttribute('role');
    return raw ? raw.trim().toLowerCase().split(/\s+/)[0] : '';
  }

  var found = document.querySelectorAll(selector);
  found.forEach(function (el) {
    var role = roleOf(el);
    if (!badgePosition[role]) return;
    annotate(el, role);
  });

  // Legend panel
  var legend = document.createElement('div');
  legend.id = LEGEND_ID;
  legend.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);' +
    'background:#222;color:#fff;padding:8px 14px;border-radius:8px;font-size:14px;' +
    'font-family:Arial,sans-serif;z-index:999999;pointer-events:none;display:flex;' +
    'gap:16px;align-items:center;white-space:nowrap;';

  var legendItems = [
    { key: '1', group: 'container', colour: COLOURS.container, label: 'Table/Grid' },
    { key: '2', group: 'rowgroup', colour: COLOURS.rowgroup, label: 'Rowgroup' },
    { key: '3', group: 'row', colour: COLOURS.row, label: 'Row' },
    { key: '4', group: 'columnheader', colour: COLOURS.columnheader, label: 'Column header' },
    { key: '5', group: 'rowheader', colour: COLOURS.rowheader, label: 'Row header' },
    { key: '6', group: 'cell', colour: COLOURS.cell, label: 'Cell' }
  ];

  legendItems.forEach(function (item) {
    var wrap = document.createElement('span');
    wrap.dataset.key = item.key;
    var swatch = document.createElement('span');
    swatch.style.cssText = 'display:inline-block;width:10px;height:10px;background:' +
      item.colour + ';border-radius:2px;margin-right:5px;';
    var kbd = document.createElement('kbd');
    kbd.textContent = item.key;
    kbd.style.cssText = 'background:#555;color:#fff;padding:1px 5px;border-radius:3px;' +
      'font-size:13px;margin-right:4px;';
    wrap.appendChild(swatch);
    wrap.appendChild(kbd);
    wrap.appendChild(document.createTextNode(item.label));
    legend.appendChild(wrap);
  });

  var hint = document.createElement('span');
  hint.style.opacity = '0.6';
  hint.innerHTML = '<kbd style="background:#555;color:#fff;padding:1px 5px;border-radius:3px;' +
    'font-size:13px">n</kbd> next &nbsp;<kbd style="background:#555;color:#fff;padding:1px 5px;' +
    'border-radius:3px;font-size:13px">Esc</kbd> clear';
  legend.appendChild(hint);
  document.body.appendChild(legend);

  var keyToGroup = {
    1: 'container', 2: 'rowgroup', 3: 'row',
    4: 'columnheader', 5: 'rowheader', 6: 'cell'
  };

  // A number key isolates its group. The same key again restores the default.
  function setFilter(group) {
    activeGroup = (activeGroup === group) ? null : group;

    Object.keys(groups).forEach(function (name) {
      var visible = activeGroup === null || activeGroup === name;
      groups[name].forEach(function (entry) {
        entry.badge.style.display = visible ? '' : 'none';
        entry.el.style.outline = visible ? '3px solid ' + entry.colour : '';
        entry.el.style.outlineOffset = visible ? '2px' : '';
      });
    });

    legend.querySelectorAll('span[data-key]').forEach(function (span) {
      var item = legendItems.find(function (i) { return i.key === span.dataset.key; });
      var isActive = activeGroup !== null && item && item.group === activeGroup;
      span.style.opacity = (activeGroup === null || isActive) ? '1' : '0.4';
    });
  }

  function nextGroup() {
    if (activeGroup === null) {
      setFilter(groupOrder[0]);
    } else {
      var i = groupOrder.indexOf(activeGroup);
      setFilter(i >= groupOrder.length - 1 ? activeGroup : groupOrder[i + 1]);
    }
  }

  if (!found.length) {
    var msg = document.createElement('div');
    msg.textContent = 'No ARIA table roles found on this page.';
    msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
      'background:#333;color:#fff;padding:10px 16px;border-radius:6px;font-size:16px;' +
      'z-index:999999;pointer-events:none;';
    overlay.appendChild(msg);
  }

  function onKey(e) {
    if (keyToGroup[e.key]) {
      setFilter(keyToGroup[e.key]);
    } else if (e.key === 'n' || e.key === 'N') {
      nextGroup();
    } else if (e.key === 'Escape') {
      overlay.remove();
      legend.remove();
      Object.keys(groups).forEach(function (name) {
        groups[name].forEach(function (entry) {
          entry.el.style.outline = '';
          entry.el.style.outlineOffset = '';
        });
      });
      document.removeEventListener('keydown', onKey);
    }
  }
  document.addEventListener('keydown', onKey);
})();
