// Highlight fieldsets
// Highlights `fieldset`, `legend`, `radiogroup` and `group` elements.
// A legend only labels its fieldset when it is the first child. aria-label and
// aria-labelledby override the legend, so a fieldset named that way is not an error.
// radiogroup requires an accessible name; group does not.
// A correctly named group is green whether it is a native fieldset or an ARIA
// role, so the colours never imply that one approach is worse than the other.
(function () {
  var existing = document.getElementById('a11y-fieldset-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-fieldset-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  var GREEN = '#1b5e20';
  var BLUE = '#0a558c';
  var AMBER = '#e65100';
  var RED = '#b00020';

  function flag(el, colour, text, below) {
    el.style.outline = '4px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var rect = el.getBoundingClientRect();
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX) + 'px';
    b.style.top = below
      ? (rect.bottom + window.scrollY + 4) + 'px'
      : (rect.top + window.scrollY - 26) + 'px';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '4px 6px';
    b.style.fontSize = '14px';
    b.style.fontFamily = 'Arial, sans-serif';
    b.style.borderRadius = '4px';
    b.style.whiteSpace = 'nowrap';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '999999';
    overlay.appendChild(b);
  }

  function ariaName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var text = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ');
      if (text) return { name: text, source: 'aria-labelledby' };
    }
    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return { name: ariaLabel.trim(), source: 'aria-label' };
    }
    return null;
  }

  // HTML requires the legend to be the first child of its fieldset. A legend
  // anywhere else, including inside a nested fieldset, does not label this one.
  function ownLegend(fieldset) {
    var first = fieldset.firstElementChild;
    return (first && first.tagName.toLowerCase() === 'legend') ? first : null;
  }

  function isValidLegend(legend) {
    var parent = legend.parentElement;
    return !!parent &&
      parent.tagName.toLowerCase() === 'fieldset' &&
      parent.firstElementChild === legend;
  }

  document.querySelectorAll('fieldset').forEach(function (el) {
    var legend = ownLegend(el);
    if (legend) {
      flag(el, GREEN, 'Fieldset');
      return;
    }

    // aria-label and aria-labelledby override the legend in AccName
    var aria = ariaName(el);
    if (aria) {
      flag(el, GREEN, 'Fieldset (named by ' + aria.source + '): ' + aria.name);
      return;
    }

    // A legend exists somewhere inside, but not where it can label the fieldset
    if (el.querySelector('legend')) {
      flag(el, RED, 'Fieldset (legend is not the first child)');
      return;
    }

    flag(el, RED, 'Fieldset (no legend)');
  });

  document.querySelectorAll('legend').forEach(function (el) {
    var text = el.textContent.trim() || '(empty)';
    if (isValidLegend(el)) {
      flag(el, BLUE, 'Legend: ' + text, true);
    } else {
      flag(el, AMBER, 'Legend: ' + text + ' (not the first child of a fieldset)', true);
    }
  });

  // radiogroup requires an accessible name. group does not, so an unnamed group
  // is worth showing but is not a failure.
  document.querySelectorAll('[role="radiogroup" i], [role="group" i]').forEach(function (el) {
    var role = el.getAttribute('role').trim().toLowerCase();
    var aria = ariaName(el);
    var name = aria ? aria.name : '';

    // A fieldset carrying one of these roles can still be named by its legend
    if (!name && el.tagName.toLowerCase() === 'fieldset') {
      var legend = ownLegend(el);
      if (legend) name = legend.textContent.trim();
    }

    if (name) {
      // A correctly named group is correct, whether it is native or ARIA.
      // Amber here implied the ARIA version was worse than a fieldset.
      flag(el, GREEN, 'role="' + role + '": ' + name);
    } else if (role === 'radiogroup') {
      flag(el, RED, 'role="radiogroup" NO ACCESSIBLE NAME');
    } else {
      // group does not require a name, so this is information, not a caution
      flag(el, BLUE, 'role="group" (no accessible name, not required)');
    }
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No fieldset, legend, radiogroup or group elements found on this page.';
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
