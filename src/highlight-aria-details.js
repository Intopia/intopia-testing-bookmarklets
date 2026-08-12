// Highlight aria-details
// Highlights elements with aria-details and their targets.
// Shows whether the referenced element exists. Flags missing IDs.
(function(){
var existing = document.getElementById('a11y-details-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-details-overlay';
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

document.querySelectorAll('[aria-details]').forEach(function(el) {
  var ids = el.getAttribute('aria-details').trim().split(/\s+/);
  var rect = el.getBoundingClientRect();

  var idLabels = [];
  var hasMissing = false;

  ids.forEach(function(id) {
    var ref = document.getElementById(id);
    if (!ref) {
      idLabels.push(id + ' (missing)');
      hasMissing = true;
    } else {
      // Blue outline and badge on the referenced element
      var refRect = ref.getBoundingClientRect();
      var isVisible = refRect.width > 0 || refRect.height > 0;
      if (isVisible) {
        ref.style.outline = '3px solid #0a558c';
        ref.style.outlineOffset = '2px';
        makeBadge('ID: ' + id, '#0a558c', refRect);
      }
      flaggedEls.push(ref);
      idLabels.push(id);
    }
  });

  // Source badge
  var sourceBadgeColour = hasMissing && idLabels.every(function(l) { return l.indexOf('(missing)') > -1; })
    ? '#b00020'
    : hasMissing ? '#e65100' : '#1b5e20';
  var sourceBadgeText = 'aria-details: ' + idLabels.join(' ');

  el.style.outline = '3px solid ' + sourceBadgeColour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);
  makeBadge(sourceBadgeText, sourceBadgeColour, rect);
});

if (flaggedEls.length === 0) {
  var msg = document.createElement('div');
  msg.textContent = 'No aria-details attributes found on this page.';
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
