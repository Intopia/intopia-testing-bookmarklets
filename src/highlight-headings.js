// Highlight headings
// Highlights all heading levels (H1–H6) with distinct colours.
// Flags empty headings and duplicate `h1` elements.
// A heading whose only content is an image is named by that image's alt text,
// so it is not empty. A heading is only empty when nothing resolves a name.
(function () {
  var existing = document.getElementById('a11y-headings-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-headings-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  var COLOURS = {
    h1: '#0a558c',
    h2: '#1b5e20',
    h3: '#e65100',
    h4: '#006064',
    h5: '#4a148c',
    h6: '#37474f'
  };

  // An element is only badged if it is actually rendered. width/height catch
  // display:none; visibility must be checked separately because a hidden element
  // still occupies layout space.
  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  // Text content alone misses a heading named by an image, which is common for
  // a logo inside an h1. Swap embedded images for their alt text first.
  function contentName(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll('img, area, input[type="image" i]').forEach(function (img) {
      var alt = img.getAttribute('alt');
      img.replaceWith(document.createTextNode(alt && alt.trim() ? ' ' + alt.trim() + ' ' : ''));
    });
    return clone.textContent.trim().replace(/\s+/g, ' ');
  }

  function getName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var refText = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ').trim();
      if (refText) return { name: refText, source: 'aria-labelledby' };
    }

    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return { name: ariaLabel.trim(), source: 'aria-label' };
    }

    var name = contentName(el);
    if (!name) return null;

    // Distinguish a heading you can read on screen from one named only by alt
    var visibleText = el.textContent.trim() !== '';
    return { name: name, source: visibleText ? 'text' : 'image alt' };
  }

  var h1Count = 0;

  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var tag = el.tagName.toLowerCase();
    var result = getName(el);
    var colour, text;

    if (!result) {
      colour = '#b00020';
      text = tag.toUpperCase() + ': (empty heading)';
    } else {
      var shown = result.name;
      if (result.source !== 'text') shown += ' (from ' + result.source + ')';

      if (tag === 'h1') {
        h1Count++;
        if (h1Count > 1) {
          colour = '#b00020';
          text = 'H1: ' + shown + ' (avoid more than one H1)';
        } else {
          colour = COLOURS.h1;
          text = 'H1: ' + shown;
        }
      } else {
        colour = COLOURS[tag];
        text = tag.toUpperCase() + ': ' + shown;
      }
    }

    el.style.outline = '4px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = text;
    badge.style.position = 'absolute';
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 26) + 'px';
    badge.style.background = colour;
    badge.style.color = '#ffffff';
    badge.style.padding = '4px 6px';
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
    msg.textContent = 'No headings found on this page.';
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
