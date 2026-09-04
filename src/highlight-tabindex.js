// Highlight tabindex
// Highlights all `tabindex` attributes.
// Distinguishes between `tabindex="0"` (in natural tab order), `tabindex="-1"` (removed from tab order) and positive values.
// A value that is not a valid integer is ignored by the browser entirely, so the
// element is not focusable at all. That is reported rather than the parsed number.
// Also flags tabindex="0" where it is redundant, and where it creates a focus
// stop on an element with no role and no name.
(function () {
  var existing = document.getElementById('a11y-tabindex-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-tabindex-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  var GREEN = '#1b5e20';
  var AMBER = '#e65100';
  var RED = '#b00020';

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  // HTML integer parsing: an optional sign followed by digits. Number() would
  // accept hex, exponent and decimal forms that the browser rejects.
  function isInteger(value) {
    return /^[-+]?\d+$/.test(value);
  }

  function isNativelyFocusable(el) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'a' || tag === 'area') return el.hasAttribute('href');
    if (tag === 'button' || tag === 'select' || tag === 'textarea') return true;
    if (tag === 'input') return (el.getAttribute('type') || 'text').toLowerCase() !== 'hidden';
    if (tag === 'iframe' || tag === 'summary') return true;
    if (tag === 'audio' || tag === 'video') return el.hasAttribute('controls');
    if (el.isContentEditable) return true;
    return false;
  }

  function hasAccessibleName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy && labelledBy.trim()) {
      var refText = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ');
      if (refText) return true;
    }
    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) return true;
    if (el.getAttribute('title') && el.getAttribute('title').trim()) return true;

    var clone = el.cloneNode(true);
    clone.querySelectorAll('img, area, input[type="image" i]').forEach(function (img) {
      var alt = img.getAttribute('alt');
      img.replaceWith(document.createTextNode(alt && alt.trim() ? ' ' + alt.trim() + ' ' : ''));
    });
    return clone.textContent.trim() !== '';
  }

  function flag(el, colour, text, rect) {
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX) + 'px';
    b.style.top = (rect.top + window.scrollY - 26) + 'px';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '2px 6px';
    b.style.fontSize = '14px';
    b.style.fontFamily = 'Arial, sans-serif';
    b.style.borderRadius = '4px';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '999999';
    b.style.maxWidth = '500px';
    b.style.whiteSpace = 'normal';
    b.style.lineHeight = '1.4';
    overlay.appendChild(b);
  }

  document.querySelectorAll('[tabindex]').forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var raw = el.getAttribute('tabindex');
    var trimmed = raw.trim();

    if (trimmed === '' || !isInteger(trimmed)) {
      flag(el, RED, 'tabindex="' + raw + '" (INVALID \u2014 not an integer, so the attribute is ignored ' +
        'and the element is not focusable)', rect);
      return;
    }

    var value = parseInt(trimmed, 10);

    if (value < -1) {
      flag(el, RED, 'tabindex="' + raw + '" (INVALID \u2014 use -1 or 0)', rect);
      return;
    }

    if (value === -1) {
      flag(el, AMBER, 'tabindex="-1"', rect);
      return;
    }

    if (value > 0) {
      flag(el, RED, 'tabindex="' + raw + '" (AVOID positive values)', rect);
      return;
    }

    // value === 0
    if (isNativelyFocusable(el)) {
      flag(el, AMBER, 'tabindex="0" (redundant \u2014 <' + el.tagName.toLowerCase() +
        '> is already in the tab order)', rect);
      return;
    }

    // A focus stop on something with no role and no name is announced as nothing
    if (!el.getAttribute('role') && !hasAccessibleName(el)) {
      flag(el, AMBER, 'tabindex="0" (focusable, but no role and no accessible name)', rect);
      return;
    }

    flag(el, GREEN, 'tabindex="0"', rect);
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No tabindex attributes found on this page.';
    msg.style.position = 'fixed';
    msg.style.top = '20px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.background = '#333';
    msg.style.color = '#fff';
    msg.style.padding = '10px 16px';
    msg.style.borderRadius = '6px';
    msg.style.fontSize = '16px';
    msg.style.zIndex = '999999';
    msg.style.pointerEvents = 'none';
    overlay.appendChild(msg);
  }

  function onKey(e) {
    if (e.key !== 'Escape') return;
    overlay.remove();
    flaggedEls.forEach(function (el) { el.style.outline = ''; el.style.outlineOffset = ''; });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
