// Highlight readonly fields
// Highlights native `readonly` and `aria-readonly` for teaching purposes.
// Native `readonly` is browser-enforced and implicitly sets aria-readonly="true" in
// the accessibility tree. `aria-readonly="true"` alone only affects the AT announcement —
// it does not stop the user from typing unless the field is also restricted some other way.
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

  function badge(el, colour, text) {
    el.style.outline = '5px solid ' + colour;
    flaggedEls.push(el);
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '2px 5px';
    b.style.fontSize = '16px';
    b.style.zIndex = '1000';
    b.style.pointerEvents = 'none';
    var rect = el.getBoundingClientRect();
    b.style.top = (rect.top + window.scrollY) + 'px';
    b.style.left = (rect.left + window.scrollX) + 'px';
    overlay.appendChild(b);
  }

  document.querySelectorAll('[readonly], [aria-readonly]').forEach(function(el) {
    var hasReadonly = el.hasAttribute('readonly');
    var raw = el.getAttribute('aria-readonly');
    var hasAria = raw !== null;
    var value = hasAria ? raw.toLowerCase().trim() : null;
    var isTrue = value === 'true';
    var isFalse = value === 'false';
    var isInvalid = hasAria && !isTrue && !isFalse;

    if (isInvalid) {
      var label = hasReadonly
        ? 'readonly + INVALID VALUE: aria-readonly="' + raw + '"'
        : 'INVALID VALUE: aria-readonly="' + raw + '"';
      badge(el, '#b00020', label);
      return;
    }

    if (hasReadonly && isFalse) {
      badge(el, '#b00020', 'readonly + aria-readonly="false" (CONFLICTING — native readonly wins)');
      return;
    }

    if (hasReadonly && isTrue) {
      badge(el, '#e65100', 'readonly + aria-readonly="true" (redundant)');
      return;
    }

    if (hasReadonly) {
      badge(el, '#1b5e20', 'readonly');
      return;
    }

    if (isTrue) {
      badge(el, '#0a558c', 'aria-readonly="true"');
      return;
    }

    if (isFalse) {
      badge(el, '#e65100', 'aria-readonly="false" (redundant — default value)');
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
    flaggedEls.forEach(function(el) { el.style.outline = ''; });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
