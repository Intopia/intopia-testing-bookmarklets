// Highlight aria-describedby
// Highlights elements with aria-describedby and their targets.
// Shows the concatenated description resolved from referenced IDs.
// Flags missing IDs inline. Note: resolves from hidden elements by design.
(function(){
var existing = document.getElementById('a11y-describedby-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-describedby-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

function makeBadge(text, colour, rect) {
  var b = document.createElement('div');
  b.textContent = text;
  b.style.position = 'absolute';
  b.style.left = (rect.left + window.scrollX) + 'px';
  b.style.top  = (rect.top  + window.scrollY - 26) + 'px';
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

document.querySelectorAll('[aria-describedby]').forEach(function(el) {
  var ids = el.getAttribute('aria-describedby').trim().split(/\s+/);
  var rect = el.getBoundingClientRect();

  var idLabels = [];
  var resolvedTexts = [];

  ids.forEach(function(id) {
    var ref = document.getElementById(id);
    if (!ref) {
      idLabels.push(id + ' (missing)');
    } else {
      var refRect = ref.getBoundingClientRect();
      var isVisible = refRect.width > 0 || refRect.height > 0;
      if (isVisible) {
        ref.style.outline = '4px solid #0a558c';
        makeBadge('ID: ' + id, '#0a558c', refRect);
      }
      flaggedEls.push(ref);
      resolvedTexts.push(ref.textContent.trim());
      idLabels.push(id);
    }
  });

  // One source badge summarising everything
  var concatenated = resolvedTexts.join(' ').trim();
  var sourceBadgeText, sourceBadgeColour;

  if (concatenated === '' && resolvedTexts.length > 0) {
    // Found elements but all empty
    sourceBadgeText = 'aria-describedby: ' + idLabels.join(' ') + ' \u2192 EMPTY TEXT STRING = NO DESCRIPTION';
    sourceBadgeColour = '#b00020';
  } else if (resolvedTexts.length === 0) {
    // All missing
    sourceBadgeText = 'aria-describedby: ' + idLabels.join(' ') + ' \u2192 NO DESCRIPTION';
    sourceBadgeColour = '#b00020';
  } else {
    // At least some resolved
    sourceBadgeText = 'aria-describedby: ' + idLabels.join(' ') + ' \u2192 \u201c' + concatenated + '\u201d';
    sourceBadgeColour = '#1b5e20';
  }

  el.style.outline = '4px solid ' + sourceBadgeColour;
  flaggedEls.push(el);
  makeBadge(sourceBadgeText, sourceBadgeColour, rect);
});

function onKey(e) {
  if (e.key !== 'Escape') return;
  overlay.remove();
  flaggedEls.forEach(function(el) { el.style.outline = ''; });
  document.removeEventListener('keydown', onKey);
}
document.addEventListener('keydown', onKey);
})();
