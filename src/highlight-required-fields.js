// Highlight required fields
// Highlights required form fields.
// Distinguishes between native `required`, `aria-required`, and redundant combinations.
// `required` only applies to <select>, <textarea> and most <input> types. On a
// range, colour picker or button it has no effect at all.
// Note: whether the element's role supports aria-required is not checked here.
(function () {
  var existing = document.getElementById('a11y-required-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-required-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  // Input types where the required attribute does something
  var REQUIRED_INPUT_TYPES = new Set([
    'text', 'search', 'url', 'tel', 'email', 'password',
    'date', 'month', 'week', 'time', 'datetime-local', 'number',
    'checkbox', 'radio', 'file'
  ]);

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  // Returns a reason string when required does nothing here, or null
  function requiredUnsupported(el) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'textarea' || tag === 'select') return null;
    if (tag !== 'input') return '<' + tag + '> does not support required';
    var type = (el.getAttribute('type') || 'text').toLowerCase();
    if (REQUIRED_INPUT_TYPES.has(type)) return null;
    return 'input type="' + type + '" does not support required';
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

  document.querySelectorAll('[required], [aria-required]').forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var hasRequired = el.hasAttribute('required');
    var raw = el.getAttribute('aria-required');
    var hasAria = raw !== null;
    var value = hasAria ? raw.toLowerCase().trim() : null;
    var isTrue = value === 'true';
    var isFalse = value === 'false';
    var isInvalid = hasAria && !isTrue && !isFalse;

    // The attribute is present but does nothing on this element
    var unsupported = hasRequired ? requiredUnsupported(el) : null;
    if (unsupported) {
      badge(el, '#b00020', 'required HAS NO EFFECT: ' + unsupported, rect);
      return;
    }

    if (isInvalid) {
      var label = hasRequired
        ? 'required + INVALID VALUE: aria-required="' + raw + '"'
        : 'INVALID VALUE: aria-required="' + raw + '"';
      badge(el, '#b00020', label, rect);
      return;
    }

    if (hasRequired && isFalse) {
      badge(el, '#b00020',
        'required + aria-required="false" (CONFLICTING \u2014 native required wins)', rect);
      return;
    }

    if (hasRequired && isTrue) {
      badge(el, '#e65100', 'required + aria-required="true" (redundant)', rect);
      return;
    }

    if (hasRequired) {
      badge(el, '#1b5e20', 'required', rect);
      return;
    }

    if (isTrue) {
      badge(el, '#0a558c', 'aria-required="true"', rect);
      return;
    }

    if (isFalse) {
      badge(el, '#e65100', 'aria-required="false" (redundant \u2014 default value)', rect);
    }
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No required or aria-required attributes found on this page.';
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
