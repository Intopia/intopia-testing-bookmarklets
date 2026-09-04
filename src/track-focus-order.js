// Track focus order
// Tracks each focusable element on the page.
// Click to activate, then `TAB` through the page.
// Each element is numbered in order, and keeps its number. `ESC` to stop.
// Numbers are assigned on first focus only, so returning to an element by
// clicking or by shift-tabbing shows the number it already had.
// A focus stop on an element that is not rendered is flagged: focus moving
// somewhere invisible is a focus order bug in itself.
(function () {
  if (window._a11yFocusOrderActive) {
    window._a11yFocusOrderCleanup();
    return;
  }
  window._a11yFocusOrderActive = true;

  var DARK = '#111111';
  var RED = '#b00020';

  var counter = 0;
  var tracked = [];

  var overlay = document.createElement('div');
  overlay.id = 'a11y-focus-order-overlay';
  overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;' +
    'pointer-events:none;z-index:999999;';
  document.body.appendChild(overlay);

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  // Text content alone misses an icon button named by an image
  function describe(el) {
    var tag = el.tagName.toLowerCase();
    var id = el.id ? '#' + el.id : '';
    var role = el.getAttribute('role');

    var name = (el.getAttribute('aria-label') || '').trim();
    if (!name) {
      var clone = el.cloneNode(true);
      clone.querySelectorAll('img, area, input[type="image" i]').forEach(function (img) {
        var alt = img.getAttribute('alt');
        img.replaceWith(document.createTextNode(alt && alt.trim() ? ' ' + alt.trim() + ' ' : ''));
      });
      name = clone.textContent.trim().replace(/\s+/g, ' ');
    }
    if (!name) {
      var value = el.getAttribute('value');
      if (value && value.trim()) name = value.trim();
    }
    name = name.slice(0, 40);

    return tag + id + (role ? '[role="' + role + '"]' : '') + (name ? ' "' + name + '"' : '');
  }

  function position(badge, el) {
    var rect = el.getBoundingClientRect();
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 34) + 'px';
  }

  function makeBadge(el, number, hidden) {
    var badge = document.createElement('div');
    badge.textContent = number + '. ' + describe(el) + (hidden ? ' (NOT RENDERED)' : '');
    badge.style.cssText = 'position:absolute;background:' + (hidden ? RED : DARK) + ';color:#fff;' +
      'padding:5px 8px;border-radius:6px;font-size:16px;font-family:Arial, sans-serif;' +
      'white-space:nowrap;pointer-events:none;z-index:999999;';
    overlay.appendChild(badge);
    position(badge, el);
    return badge;
  }

  function onFocusIn(e) {
    var el = e.target;
    if (!el || el === document.body || el === document.documentElement) return;

    // Already numbered: leave the number it was given the first time
    if (el.dataset.a11yFocusOrder) return;

    counter++;
    el.dataset.a11yFocusOrder = counter;

    var rect = el.getBoundingClientRect();
    var hidden = !isRendered(el, rect);
    var colour = hidden ? RED : DARK;

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';

    var badge = makeBadge(el, counter, hidden);
    tracked.push({ el: el, badge: badge });
  }

  function reposition() {
    tracked.forEach(function (entry) {
      position(entry.badge, entry.el);
    });
  }

  function onKeyUp(e) {
    if (e.key === 'Escape') cleanup();
  }

  function cleanup() {
    window._a11yFocusOrderActive = false;
    overlay.remove();
    tracked.forEach(function (entry) {
      entry.el.style.outline = '';
      entry.el.style.outlineOffset = '';
      delete entry.el.dataset.a11yFocusOrder;
    });
    tracked.length = 0;
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('keyup', onKeyUp, true);
    window.removeEventListener('scroll', reposition, true);
    window.removeEventListener('resize', reposition, true);
    delete window._a11yFocusOrderCleanup;
  }

  window._a11yFocusOrderCleanup = cleanup;
  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('keyup', onKeyUp, true);
  window.addEventListener('scroll', reposition, true);
  window.addEventListener('resize', reposition, true);
})();
