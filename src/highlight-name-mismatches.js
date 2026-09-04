// Highlight name mismatches
// Highlights links and buttons where the visible label and accessible name don't match.
// WCAG 2.5.3 Label in Name requires the accessible name to contain the visible
// label text. A name that starts with the visible label also satisfies the
// speech input use case; one that merely contains it does not.
// Where there is no visible text label, 2.5.3 does not apply.
(function () {
  var existing = document.getElementById('a11y-mismatch-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-mismatch-overlay';
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

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  // Visible text includes image alt, because an image is a visible label.
  // An <svg><title> is not rendered, so it counts towards the accessible name
  // but not towards the visible label.
  function contentText(el, includeSvgTitle) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll('img, area, input[type="image" i]').forEach(function (img) {
      var alt = img.getAttribute('alt');
      img.replaceWith(document.createTextNode(alt && alt.trim() ? ' ' + alt.trim() + ' ' : ''));
    });
    if (!includeSvgTitle) {
      clone.querySelectorAll('svg title').forEach(function (t) { t.remove(); });
    }
    return clone.textContent.trim().replace(/\s+/g, ' ');
  }

  function accessibleName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var refText = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ').trim();
      if (refText) return refText;
    }
    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
    return contentText(el, true);
  }

  document.querySelectorAll('a, button, [role="button" i], [role="link" i]').forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var visible = contentText(el, false);
    var name = accessibleName(el);
    var v = visible.toLowerCase();
    var n = name.toLowerCase();
    var colour, text;

    if (visible === '') {
      // No visible text label, so there is nothing for 2.5.3 to compare against
      colour = BLUE;
      text = name
        ? 'NO VISIBLE TEXT \u2014 2.5.3 does not apply: ' + name
        : 'NO VISIBLE TEXT AND NO ACCESSIBLE NAME';
      if (!name) colour = RED;
    } else if (n === v) {
      colour = GREEN;
      text = 'MATCH: ' + name;
    } else if (n.indexOf(v) === 0) {
      colour = BLUE;
      text = 'MODIFIED: ' + name;
    } else if (n.indexOf(v) > -1) {
      // Passes 2.5.3, but speech input users cannot say the visible label first
      colour = AMBER;
      text = 'CONTAINS: ' + name + ' (visible label not at start: "' + visible + '")';
    } else {
      colour = RED;
      text = 'MISMATCH: ' + name + ' (visible: "' + visible + '")';
    }

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = text;
    badge.style.position = 'absolute';
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 26) + 'px';
    badge.style.background = colour;
    badge.style.color = '#ffffff';
    badge.style.padding = '2px 6px';
    badge.style.fontSize = '14px';
    badge.style.fontFamily = 'Arial, sans-serif';
    badge.style.borderRadius = '4px';
    badge.style.pointerEvents = 'none';
    badge.style.zIndex = '999999';
    badge.style.maxWidth = '500px';
    badge.style.whiteSpace = 'normal';
    badge.style.lineHeight = '1.4';
    overlay.appendChild(badge);
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No links or buttons found on this page.';
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
