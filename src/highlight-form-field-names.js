// Highlight form field names
// Highlights form fields and their accessible names.
// Flags fields with no name, and fields where the name comes from an unreliable source.
// This includes `placeholder` or `title`.
// Button-like inputs (submit, reset, button, image) are covered by the buttons
// bookmarklet, not here.
(function () {
  var existing = document.getElementById('a11y-form-names-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-form-names-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  var SELECTOR = [
    'input:not([type="hidden" i]):not([type="submit" i]):not([type="reset" i])' +
      ':not([type="button" i]):not([type="image" i])',
    'select',
    'textarea'
  ].join(',');

  // An element is only badged if it is actually rendered. width/height catch
  // display:none; visibility must be checked separately because a hidden element
  // still occupies layout space.
  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  function getName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var refText = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ').trim();
      if (refText) return { name: refText, source: 'aria-labelledby', quality: 'good' };
    }

    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return { name: ariaLabel.trim(), source: 'aria-label', quality: 'good' };
    }

    // A control can have more than one associated label. AccName joins them all.
    var id = el.getAttribute('id');
    if (id) {
      var labels = document.querySelectorAll('label[for="' + CSS.escape(id) + '"]');
      if (labels.length) {
        var joined = Array.prototype.map.call(labels, function (label) {
          return label.textContent.trim().replace(/\s+/g, ' ');
        }).filter(Boolean).join(' ');
        if (joined) {
          return {
            name: joined,
            source: labels.length > 1 ? 'label \u00d7' + labels.length : 'label',
            quality: 'good'
          };
        }
      }
    }

    var wrapping = el.closest('label');
    if (wrapping) {
      var clone = wrapping.cloneNode(true);
      clone.querySelectorAll('input,select,textarea').forEach(function (field) { field.remove(); });
      var text = clone.textContent.trim().replace(/\s+/g, ' ');
      if (text) return { name: text, source: 'implicit label', quality: 'good' };
    }

    var title = el.getAttribute('title');
    if (title && title.trim()) return { name: title.trim(), source: 'title', quality: 'poor' };

    var placeholder = el.getAttribute('placeholder');
    if (placeholder && placeholder.trim()) {
      return { name: placeholder.trim(), source: 'placeholder', quality: 'poor' };
    }

    return null;
  }

  document.querySelectorAll(SELECTOR).forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var result = getName(el);
    var colour, text;

    if (!result) {
      colour = '#b00020';
      text = 'NO ACCESSIBLE NAME';
    } else if (result.quality === 'poor') {
      colour = '#e65100';
      text = result.source + ': ' + result.name;
    } else {
      colour = '#1b5e20';
      text = result.source + ': ' + result.name;
    }

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = text;
    badge.style.position = 'absolute';
    badge.style.background = colour;
    badge.style.color = '#ffffff';
    badge.style.padding = '2px 6px';
    badge.style.fontSize = '14px';
    badge.style.fontFamily = 'Arial, sans-serif';
    badge.style.borderRadius = '4px';
    badge.style.whiteSpace = 'nowrap';
    badge.style.pointerEvents = 'none';
    badge.style.zIndex = '999999';
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 26) + 'px';
    overlay.appendChild(badge);
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No form fields found on this page.';
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
