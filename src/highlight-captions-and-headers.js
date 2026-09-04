// Highlight captions and headers
// Highlights accessibility features within tables. Flags header cells with and without `scope`,
// invalid `scope` values, and tables missing a `<caption>`.
// Click to activate, then press `1` through `3` in order to step through `table`, `caption` and `th` elements individually.
// Press `n` to step through each element type in sequence.
(function () {
  var OVERLAY_ID = 'a11y-tables-overlay';
  var LEGEND_ID = 'a11y-tables-legend';

  var oldOverlay = document.getElementById(OVERLAY_ID);
  if (oldOverlay) oldOverlay.remove();
  var oldLegend = document.getElementById(LEGEND_ID);
  if (oldLegend) oldLegend.remove();

  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var activeGroup = null;

  var groups = {
    table: { items: [] },
    caption: { items: [] },
    th: { items: [] },
    scope: { items: [] }
  };

  // scope is opt-in: everything else is on by default
  var defaultOn = new Set(['table', 'caption', 'th']);
  var groupOrder = ['table', 'caption', 'th', 'scope'];

  var BLUE = '#0a558c';
  var GREEN = '#1b5e20';
  var RED = '#b00020';
  var AMBER = '#e65100';

  var VALID_SCOPES = new Set(['row', 'col', 'rowgroup', 'colgroup']);

  function makeBadge(text, colour, rect, position, leftOffset) {
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX + (leftOffset || 0)) + 'px';
    b.style.top = position === 'above'
      ? (rect.top + window.scrollY - 26) + 'px'
      : (rect.bottom + window.scrollY - 24) + 'px';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '4px 6px';
    b.style.fontSize = '14px';
    b.style.fontFamily = 'Arial,sans-serif';
    b.style.borderRadius = '4px';
    b.style.whiteSpace = 'nowrap';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '999999';
    overlay.appendChild(b);
    return b;
  }

  function addItem(el, colour, text, position, group, hasOutline, leftOffset) {
    var badge = makeBadge(text, colour, el.getBoundingClientRect(), position, leftOffset);
    if (!defaultOn.has(group)) badge.style.display = 'none';
    if (hasOutline && defaultOn.has(group)) {
      el.style.outline = '4px solid ' + colour;
      el.style.outlineOffset = '2px';
    }
    groups[group].items.push({ el: el, badge: badge, colour: colour, hasOutline: !!hasOutline });
  }

  // A caption must be a direct child of its table. Searching descendants would
  // let an outer table borrow a nested table's caption.
  function ownCaption(table) {
    for (var i = 0; i < table.children.length; i++) {
      if (table.children[i].tagName.toLowerCase() === 'caption') return table.children[i];
    }
    return null;
  }

  // Same problem for header cells: only take the ones this table owns.
  function ownHeaderCells(table) {
    return Array.prototype.filter.call(table.querySelectorAll('th'), function (th) {
      return th.closest('table') === table;
    });
  }

  var tables = document.querySelectorAll('table');

  tables.forEach(function (table, index) {
    var caption = ownCaption(table);

    // A caption is not required, so a missing one is a caution, not a failure
    addItem(
      table,
      caption ? BLUE : AMBER,
      caption ? 'Table ' + (index + 1) : 'Table ' + (index + 1) + ' (no caption)',
      'above',
      'table',
      true
    );

    if (caption) {
      addItem(caption, GREEN, 'Caption: ' + (caption.textContent.trim() || '(empty)'),
        'above', 'caption', true);
    }

    ownHeaderCells(table).forEach(function (th) {
      var text = th.textContent.trim() || '(empty)';
      addItem(th, RED, 'TH: ' + text, 'above', 'th', true);

      var raw = th.getAttribute('scope');
      var scope = raw === null ? null : raw.trim();
      var scopeColour, scopeText;

      if (!scope) {
        scopeColour = RED;
        scopeText = 'no scope';
      } else if (VALID_SCOPES.has(scope.toLowerCase())) {
        scopeColour = AMBER;
        scopeText = 'scope: ' + scope;
      } else {
        scopeColour = RED;
        scopeText = 'scope: "' + scope + '" INVALID VALUE';
      }

      addItem(th, scopeColour, scopeText, 'bottom', 'scope', false);
    });
  });

  // Legend
  var legendItems = [
    { key: '1', group: 'table', colour: BLUE, colour2: AMBER, label: 'Table' },
    { key: '2', group: 'caption', colour: GREEN, label: 'Caption' },
    { key: '3', group: 'th', colour: RED, label: 'TH' },
    { key: '4', group: 'scope', colour: AMBER, colour2: RED, label: 'Scope' }
  ];

  var legend = document.createElement('div');
  legend.id = LEGEND_ID;
  legend.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);' +
    'background:#222;color:#fff;padding:8px 14px;border-radius:8px;font-size:14px;' +
    'font-family:Arial,sans-serif;z-index:999999;pointer-events:none;display:flex;' +
    'gap:16px;align-items:center;white-space:nowrap;';

  legendItems.forEach(function (item) {
    var wrap = document.createElement('span');
    wrap.dataset.group = item.group;

    var swatches = item.colour2 ? [item.colour, item.colour2] : [item.colour];
    swatches.forEach(function (colour, i) {
      var sw = document.createElement('span');
      sw.style.cssText = 'display:inline-block;width:10px;height:10px;background:' + colour +
        ';border-radius:2px;margin-right:' + (i === swatches.length - 1 ? '5px' : '3px') + ';';
      wrap.appendChild(sw);
    });

    var kbd = document.createElement('kbd');
    kbd.textContent = item.key;
    kbd.style.cssText = 'background:#555;color:#fff;padding:1px 5px;border-radius:3px;' +
      'font-size:13px;margin-right:4px;';
    wrap.appendChild(kbd);
    wrap.appendChild(document.createTextNode(item.label));
    wrap.style.opacity = defaultOn.has(item.group) ? '1' : '0.4';
    legend.appendChild(wrap);
  });

  var hint = document.createElement('span');
  hint.style.opacity = '0.6';
  hint.innerHTML = '<kbd style="background:#555;color:#fff;padding:1px 5px;border-radius:3px;' +
    'font-size:13px">n</kbd> next &nbsp;<kbd style="background:#555;color:#fff;padding:1px 5px;' +
    'border-radius:3px;font-size:13px">Esc</kbd> clear';
  legend.appendChild(hint);
  document.body.appendChild(legend);

  var keyToGroup = { 1: 'table', 2: 'caption', 3: 'th', 4: 'scope' };

  function setFilter(group) {
    activeGroup = (activeGroup === group) ? null : group;

    Object.keys(groups).forEach(function (name) {
      var visible = activeGroup === null ? defaultOn.has(name) : activeGroup === name;
      groups[name].items.forEach(function (item) {
        item.badge.style.display = visible ? '' : 'none';
        if (item.hasOutline) {
          item.el.style.outline = visible ? '4px solid ' + item.colour : '';
          item.el.style.outlineOffset = visible ? '2px' : '';
        }
      });
    });

    legendItems.forEach(function (item) {
      var span = legend.querySelector('[data-group="' + item.group + '"]');
      if (!span) return;
      span.style.opacity = activeGroup === null
        ? (defaultOn.has(item.group) ? '1' : '0.4')
        : (activeGroup === item.group ? '1' : '0.4');
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

  function onKey(e) {
    if (keyToGroup[e.key]) {
      setFilter(keyToGroup[e.key]);
    } else if (e.key === 'n' || e.key === 'N') {
      nextGroup();
    } else if (e.key === 'Escape') {
      overlay.remove();
      legend.remove();
      Object.keys(groups).forEach(function (name) {
        groups[name].items.forEach(function (item) {
          if (item.hasOutline) {
            item.el.style.outline = '';
            item.el.style.outlineOffset = '';
          }
        });
      });
      document.removeEventListener('keydown', onKey);
    }
  }

  if (!tables.length) {
    var msg = document.createElement('div');
    msg.textContent = 'No table elements found on this page.';
    msg.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
      'background:#333;color:#fff;padding:10px 16px;border-radius:6px;font-size:16px;' +
      'z-index:999999;pointer-events:none;';
    overlay.appendChild(msg);
  }

  document.addEventListener('keydown', onKey);
})();
