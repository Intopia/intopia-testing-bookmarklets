// Highlight aria-haspopup
// Highlights all elements with aria-haspopup.
// All recognised values are green. Flags empty and unrecognised values.
(function(){
var existing = document.getElementById('a11y-haspopup-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-haspopup-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

var validValues = new Set(['false','true','menu','listbox','tree','grid','dialog']);

document.querySelectorAll('[aria-haspopup]').forEach(function(el) {
  var raw = el.getAttribute('aria-haspopup');
  var trimmed = raw.trim().toLowerCase();
  var colour, label;

  if (raw.trim() === '') {
    colour = '#b00020';
    label = 'aria-haspopup: (empty)';
  } else if (!validValues.has(trimmed)) {
    colour = '#b00020';
    label = 'aria-haspopup: "' + raw.trim() + '" (INVALID VALUE)';
  } else {
    colour = '#1b5e20';
    label = 'aria-haspopup: "' + trimmed + '"';
  }

  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);

  var badge = document.createElement('div');
  badge.textContent = label;
  badge.style.position = 'absolute';
  var rect = el.getBoundingClientRect();
  badge.style.left = (rect.left + window.scrollX) + 'px';
  badge.style.top  = (rect.top  + window.scrollY - 26) + 'px';
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
  msg.textContent = 'No aria-haspopup attributes found on this page.';
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
