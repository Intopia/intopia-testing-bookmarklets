// Highlight readonly fields
// Highlights native `readonly` and `aria-readonly` for teaching purposes.
// Native `readonly` is browser-enforced and implicitly sets aria-readonly="true" in
// the accessibility tree. `aria-readonly="true"` alone only affects the AT announcement —
// it does not stop the user from typing unless the field is also restricted some other way.
// `readonly` only applies to <textarea> and text-like <input> types. On a <select>,
// a checkbox, a radio, or anything else it has no effect at all.
// `aria-readonly` is only supported on the roles listed below.
(function() {
  var existing = document.getElementById('a11y-readonly-overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = 'a11y-readonly-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);
  var flaggedEls = [];

  // Input types where the readonly attribute does something
  var READONLY_INPUT_TYPES = new Set([
    'text', 'search', 'url', 'tel', 'email', 'password',
    'date', 'month', 'week', 'time', 'datetime-local', 'number'
  ]);

  // Roles that support aria-readonly
  var ARIA_READONLY_ROLES = new Set([
    'checkbox', 'combobox', 'grid', 'gridcell', 'listbox', 'radiogroup',
    'slider', 'spinbutton', 'textbox', 'columnheader', 'rowheader', 'treegrid'
  ]);

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  // Returns a reason string when readonly does nothing here, or null
  function readonlyUnsupported(el) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'textarea') return null;
    if (tag !== 'input') return '<' + tag + '> does not support readonly';
    var type = (el.getAttribute('type') || 'text').toLowerCase();
    if (READONLY_INPUT_TYPES.has(type)) return null;
    return 'input type="' + type + '" does not support readonly';
  }

  // Native form controls carry an implicit role that supports aria-readonly
  function ariaReadonlySupported(el) {
    var explicit = el.getAttribute('role');
    if (explicit && explicit.trim()) {
      return ARIA_READONLY_ROLES.has(explicit.trim().toLowerCase().split(/\s+/)[0]);
    }
    var tag = el.tagName.toLowerCase();
    if (tag === 'textarea' || tag === 'select') return true;
    if (tag !== 'input') return false;
    var type = (el.getAttribute('type') || 'text').toLowerCase();
    return READONLY_INPUT_TYPES.has(type) || type === 'checkbox' || type === 'radio' || type === 'range';
  }

  function badge(el, colour, text, rect) {
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
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
    b.style.top = (rect.top + window.scrollY - 26) + 'px';
    b.style.left = (rect.left + window.scrollX) + 'px';
    overlay.appendChild(b);
  }

  document.querySelectorAll('[readonly], [aria-readonly]').forEach(function(el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var hasReadonly = el.hasAttribute('readonly');
    var raw = el.getAttribute('aria-readonly');
    var hasAria = raw !== null;
    var value = hasAria ? raw.toLowerCase().trim() : null;
    var isTrue = value === 'true';
    var isFalse = value === 'false';
    var isInvalid = hasAria && !isTrue && !isFalse;

    // The attribute is present but does nothing on this element
    var unsupported = hasReadonly ? readonlyUnsupported(el) : null;
    if (unsupported) {
      badge(el, '#b00020', 'readonly HAS NO EFFECT: ' + unsupported, rect);
      return;
    }

    if (hasAria && !ariaReadonlySupported(el)) {
      badge(el, '#b00020',
        'aria-readonly="' + raw + '" HAS NO EFFECT: this role does not support aria-readonly', rect);
      return;
    }

    if (isInvalid) {
      var label = hasReadonly
        ? 'readonly + INVALID VALUE: aria-readonly="' + raw + '"'
        : 'INVALID VALUE: aria-readonly="' + raw + '"';
      badge(el, '#b00020', label, rect);
      return;
    }

    if (hasReadonly && isFalse) {
      badge(el, '#b00020', 'readonly + aria-readonly="false" (CONFLICTING — native readonly wins)', rect);
      return;
    }

    if (hasReadonly && isTrue) {
      badge(el, '#e65100', 'readonly + aria-readonly="true" (redundant)', rect);
      return;
    }

    if (hasReadonly) {
      badge(el, '#1b5e20', 'readonly', rect);
      return;
    }

    if (isTrue) {
      badge(el, '#0a558c', 'aria-readonly="true"', rect);
      return;
    }

    if (isFalse) {
      badge(el, '#e65100', 'aria-readonly="false" (redundant — default value)', rect);
    }
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No readonly or aria-readonly attributes found on this page.';
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
    flaggedEls.forEach(function(el) { el.style.outline = ''; el.style.outlineOffset = ''; });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
