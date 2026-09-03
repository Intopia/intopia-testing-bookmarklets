// Highlight aria-checked
// Highlights all 'aria-checked' attributes on custom widgets.
// Distinguishes between `true`, `false` and `mixed` states.
// `undefined` is also valid per the tristate value type.
// Re-run after interacting with a widget to see updated values.
(function () {
  var existing = document.getElementById('a11y-checked-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-checked-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  document.querySelectorAll('[aria-checked]').forEach(function (el) {
    var value = el.getAttribute('aria-checked').trim().toLowerCase();
    var colour, label;

    if (value === 'true') {
      colour = '#1b5e20';
      label = 'aria-checked="true"';
    } else if (value === 'false') {
      colour = '#e65100';
      label = 'aria-checked="false"';
    } else if (value === 'mixed') {
      colour = '#0a558c';
      label = 'aria-checked="mixed"';
    } else if (value === 'undefined') {
      // Valid per the tristate value type (true/false/mixed/undefined). Means
      // the element is not checkable, the same as omitting it.
      colour = '#1b5e20';
      label = 'aria-checked="undefined"';
    } else {
      colour = '#b00020';
      label = 'aria-checked="' + el.getAttribute('aria-checked') + '" (INVALID VALUE)';
    }

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = label;
    badge.style.position = 'absolute';
    var rect = el.getBoundingClientRect();
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 26) + 'px';
    badge.style.background = colour;
    badge.style.color = '#ffffff';
    badge.style.padding = '2px 6px';
    badge.style.fontSize = '14px';
    badge.style.fontFamily = 'Arial, sans-serif';
    badge.style.borderRadius = '4px';
    badge.style.whiteSpace = 'nowrap';
    badge.style.pointerEvents = 'none';
    badge.style.zIndex = '999999';
    overlay.appendChild(badge);
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No aria-checked attributes found on this page.';
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
    flaggedEls.forEach(function (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
