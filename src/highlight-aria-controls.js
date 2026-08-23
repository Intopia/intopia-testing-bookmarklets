// Highlight aria-controls
// Highlights elements with aria-controls and their referenced targets.
// Flags missing IDs. Hidden referenced elements are valid and noted silently.
(function(){
var existing = document.getElementById('a11y-controls-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-controls-overlay';
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
  b.style.padding = '2px 6px';
  b.style.fontSize = '14px';
  b.style.fontFamily = 'Arial, sans-serif';
  b.style.borderRadius = '4px';
  b.style.whiteSpace = 'nowrap';
  b.style.pointerEvents = 'none';
  b.style.zIndex = '999999';
  overlay.appendChild(b);
}

document.querySelectorAll('[aria-controls]').forEach(function(el) {
  var raw = el.getAttribute('aria-controls').trim();
  var rect = el.getBoundingClientRect();

  if (raw === '') {
    el.style.outline = '3px solid #b00020';
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge('aria-controls: (empty)', '#b00020', rect);
    return;
  }

  var ids = raw.split(/\s+/);
  var idLabels = [];

  ids.forEach(function(id) {
    var ref = document.getElementById(id);
    if (!ref) {
      idLabels.push(id + ' (missing)');
    } else {
      // Blue badge on referenced element only if visible
      var refRect = ref.getBoundingClientRect();
      if (refRect.width > 0 || refRect.height > 0) {
        ref.style.outline = '3px solid #0a558c';
        ref.style.outlineOffset = '2px';
        makeBadge('ID: ' + id, '#0a558c', refRect);
      }
      flaggedEls.push(ref);
      idLabels.push(id);
    }
  });

  var hasMissing = idLabels.some(function(l) { return l.indexOf('(missing)') > -1; });
  var allMissing = idLabels.every(function(l) { return l.indexOf('(missing)') > -1; });
  var colour = (hasMissing || allMissing) ? '#b00020' : '#1b5e20';

  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);
  makeBadge('aria-controls: ' + idLabels.join(' '), colour, rect);
});

if (flaggedEls.length === 0) {
  var msg = document.createElement('div');
  msg.textContent = 'No aria-controls attributes found on this page.';
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
