// Highlight aria-labelledby
// Highlights elements with aria-labelledby and their targets.
// Shows the concatenated accessible name resolved from referenced IDs.
// Flags missing and self-referencing IDs.
// Note: aria-labelledby resolves names from hidden elements by design.
(function(){
var existing = document.getElementById('a11y-labelledby-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-labelledby-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

function makeBadge(text, colour) {
  var b = document.createElement('div');
  b.textContent = text;
  b.style.position = 'absolute';
  b.style.background = colour;
  b.style.color = '#ffffff';
  b.style.padding = '2px 5px';
  b.style.fontSize = '14px';
  b.style.fontFamily = 'Arial, sans-serif';
  b.style.borderRadius = '3px';
  b.style.whiteSpace = 'nowrap';
  b.style.pointerEvents = 'none';
  b.style.zIndex = '999999';
  overlay.appendChild(b);
  return b;
}

document.querySelectorAll('[aria-labelledby]').forEach(function(el) {
  el.style.outline = '5px solid #0a558c';
  flaggedEls.push(el);

  var ids = el.getAttribute('aria-labelledby').trim().split(/\s+/);
  var rect = el.getBoundingClientRect();
  var top  = rect.top  + window.scrollY;
  var left = rect.left + window.scrollX;

  // Source badge
  var sourceBadge = makeBadge('aria-labelledby: ' + ids.join(' '), '#0a558c');
  sourceBadge.style.top  = top + 'px';
  sourceBadge.style.left = left + 'px';

  var idLabels = [];
  var resolvedTexts = [];
  var missingOffset = 0;

  ids.forEach(function(id) {
    var ref = document.getElementById(id);
    if (!ref) {
      var mb = makeBadge('Missing ID: ' + id, '#b00020');
      mb.style.top  = (top + 28 + 24 * missingOffset) + 'px';
      mb.style.left = left + 'px';
      missingOffset++;
    } else {
      ref.style.outline = '5px solid #1b5e20';
      flaggedEls.push(ref);
      resolvedTexts.push(ref.textContent.trim());
      idLabels.push(ref === el ? id + ' (self)' : id);
    }
  });

  if (resolvedTexts.length > 0) {
    var concatenated = resolvedTexts.join(' ').trim();
    var cb;
    if (concatenated === '') {
      // All referenced elements resolved to empty — no accessible name
      cb = makeBadge('ID: ' + idLabels.join(' ') + ' \u2192 EMPTY TEXT STRING = NO NAME', '#b00020');
    } else {
      cb = makeBadge('ID: ' + idLabels.join(' ') + ' \u2192 \u201c' + concatenated + '\u201d', '#1b5e20');
    }
    cb.style.top  = (top + 28 + 24 * missingOffset) + 'px';
    cb.style.left = left + 'px';
  }
});

function onKey(e) {
  if (e.key !== 'Escape') return;
  overlay.remove();
  flaggedEls.forEach(function(el) { el.style.outline = ''; });
  document.removeEventListener('keydown', onKey);
}
document.addEventListener('keydown', onKey);
})();
