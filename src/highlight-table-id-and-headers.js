// Highlight table id and headers
// Highlights the relationship between headers and ids within complex tables.
// Click to activate, then press `TAB` or `n` to move through each cell.
// Related header cells are outlined and numbered, and the numbers are repeated
// on the focused cell's badge so the relationship is explicit.
// Flags header references that are missing, and references that point at
// something which is not a table cell.
// Re-run the bookmarklet to switch it off.
(function () {
  var BADGE_ID = 'a11y-table-nav-badge';
  var MSG_ID = 'a11y-table-nav-msg';
  var NUM_CLASS = 'a11y-table-nav-num';

  // Running it a second time switches it off
  if (document.getElementById(BADGE_ID)) {
    teardown();
    return;
  }

  var BLUE = '#0a558c';
  var GREEN = '#1b5e20';
  var AMBER = '#e65100';

  var cells = [];
  var outlined = [];

  var badge = document.createElement('div');
  badge.id = BADGE_ID;
  badge.style.cssText = 'position:absolute;background:#111;color:#fff;padding:6px 10px;' +
    'border-radius:6px;font-size:14px;font-family:Arial,sans-serif;line-height:1.5;' +
    'pointer-events:none;z-index:999999;display:none;max-width:400px;white-space:normal;' +
    'box-shadow:0 2px 8px rgba(0,0,0,0.4);';
  document.body.appendChild(badge);

  function clearHighlights() {
    outlined.forEach(function (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    outlined.length = 0;
    document.querySelectorAll('.' + NUM_CLASS).forEach(function (el) { el.remove(); });
  }

  // Small numbered marker on a related header, matching the number in the badge
  function numberMarker(el, number, colour) {
    var rect = el.getBoundingClientRect();
    var marker = document.createElement('div');
    marker.className = NUM_CLASS;
    marker.textContent = number;
    marker.style.cssText = 'position:absolute;background:' + colour + ';color:#fff;' +
      'font-family:Arial,sans-serif;font-size:12px;font-weight:bold;line-height:18px;' +
      'width:18px;height:18px;text-align:center;border-radius:3px;pointer-events:none;' +
      'z-index:999999;';
    marker.style.left = (rect.left + window.scrollX - 4) + 'px';
    marker.style.top = (rect.top + window.scrollY - 4) + 'px';
    document.body.appendChild(marker);
  }

  function positionBadge(el) {
    var rect = el.getBoundingClientRect();
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 56) + 'px';
  }

  function isCell(el) {
    var tag = el.tagName.toLowerCase();
    return tag === 'th' || tag === 'td';
  }

  function onFocusIn(e) {
    var target = e.target;
    if (!target || (target.tagName !== 'TH' && target.tagName !== 'TD')) return;

    clearHighlights();

    var tag = target.tagName.toLowerCase();
    var text = target.textContent.trim().replace(/\s+/g, ' ').slice(0, 50) || '(empty)';
    var id = target.getAttribute('id');
    var headers = target.getAttribute('headers');

    var parts = [tag.toUpperCase() + ': ' + text];
    if (id) parts.push('id: ' + id);

    target.style.outline = '3px solid ' + BLUE;
    target.style.outlineOffset = '2px';
    outlined.push(target);

    if (headers !== null) {
      var raw = headers.trim();
      if (raw === '') {
        parts.push('headers: (empty)');
      } else {
        var ids = raw.split(/\s+/);
        var labels = [];
        ids.forEach(function (headerId, index) {
          var number = index + 1;
          var ref = document.getElementById(headerId);

          if (!ref) {
            labels.push('[' + number + '] ' + headerId + ' (missing)');
            return;
          }

          if (!isCell(ref)) {
            // headers must reference a th or td, so this relationship does not exist
            labels.push('[' + number + '] ' + headerId + ' (not a table cell)');
            ref.style.outline = '3px solid ' + AMBER;
            ref.style.outlineOffset = '2px';
            outlined.push(ref);
            numberMarker(ref, number, AMBER);
            return;
          }

          labels.push('[' + number + '] ' + headerId);
          ref.style.outline = '3px solid ' + GREEN;
          ref.style.outlineOffset = '2px';
          outlined.push(ref);
          numberMarker(ref, number, GREEN);
        });
        parts.push('headers: ' + labels.join('  '));
      }
    }

    badge.textContent = parts.join('  |  ');
    badge.style.display = 'block';
    requestAnimationFrame(function () { positionBadge(target); });
  }

  function onFocusOut(e) {
    var target = e.target;
    if (!target || (target.tagName !== 'TH' && target.tagName !== 'TD')) return;
    var next = e.relatedTarget;
    if (next && (next.tagName === 'TH' || next.tagName === 'TD')) return;
    clearHighlights();
    badge.style.display = 'none';
  }

  function onScroll() {
    var active = document.activeElement;
    if (!active || (active.tagName !== 'TH' && active.tagName !== 'TD')) return;
    positionBadge(active);
    // Redraw the number markers so they stay on their headers
    var headers = active.getAttribute('headers');
    if (!headers) return;
    document.querySelectorAll('.' + NUM_CLASS).forEach(function (el) { el.remove(); });
    headers.trim().split(/\s+/).forEach(function (headerId, index) {
      var ref = document.getElementById(headerId);
      if (!ref) return;
      numberMarker(ref, index + 1, isCell(ref) ? GREEN : AMBER);
    });
  }

  function nextCell() {
    var active = document.activeElement;
    var index = cells.indexOf(active);
    var target = index === -1 ? cells[0] : cells[(index + 1) % cells.length];
    if (target) target.focus();
  }

  function onKey(e) {
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      nextCell();
    } else if (e.key === 'Escape') {
      teardown();
    }
  }

  function teardown() {
    var b = document.getElementById(BADGE_ID);
    var m = document.getElementById(MSG_ID);
    if (b) b.remove();
    if (m) m.remove();
    document.querySelectorAll('.' + NUM_CLASS).forEach(function (el) { el.remove(); });
    document.querySelectorAll('[data-a11y-orig-tabindex]').forEach(function (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
      var original = el.dataset.a11yOrigTabindex;
      if (original === '') {
        el.removeAttribute('tabindex');
      } else {
        el.setAttribute('tabindex', original);
      }
      delete el.dataset.a11yOrigTabindex;
    });
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('focusout', onFocusOut, true);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('scroll', onScroll, true);
  }

  document.querySelectorAll('table th, table td').forEach(function (el) {
    el.dataset.a11yOrigTabindex = el.hasAttribute('tabindex') ? el.getAttribute('tabindex') : '';
    el.setAttribute('tabindex', '0');
    cells.push(el);
  });

  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focusout', onFocusOut, true);
  document.addEventListener('keydown', onKey);
  window.addEventListener('scroll', onScroll, true);

  var msg = document.createElement('div');
  msg.id = MSG_ID;
  msg.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
    'background:#333;color:#fff;padding:8px 16px;border-radius:6px;font-size:14px;' +
    'font-family:Arial,sans-serif;z-index:999999;pointer-events:none;white-space:nowrap;';
  msg.textContent = cells.length + ' table cells focusable — Tab or n to navigate — Esc to stop';
  document.body.appendChild(msg);
  setTimeout(function () { if (msg.parentNode) msg.remove(); }, 4000);
})();
