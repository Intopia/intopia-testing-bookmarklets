// Highlight buttons
// Highlights all buttons and their accessible names.
// Flags buttons with no accessible name.
(function(){
var existing = document.getElementById('a11y-buttons-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-buttons-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

function getName(el) {
  var labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    var labelText = labelledBy.trim().split(/\s+/).map(function(id) {
      var ref = document.getElementById(id);
      return ref ? ref.textContent.trim() : '';
    }).filter(Boolean).join(' ').trim();
    if (labelText) return { name: labelText, source: 'aria-labelledby' };
  }
  var ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return { name: ariaLabel.trim(), source: 'aria-label' };
  if (el.tagName.toLowerCase() === 'input') {
    var val = el.getAttribute('value');
    if (val && val.trim()) return { name: val.trim(), source: 'value' };
    var type = (el.getAttribute('type') || '').toLowerCase();
    if (type === 'submit') return { name: 'Submit', source: 'default' };
    if (type === 'reset')  return { name: 'Reset',  source: 'default' };
  }
  var text = el.textContent.trim().replace(/\s+/g, ' ');
  if (text) return { name: text, source: 'text content' };
  var title = el.getAttribute('title');
  return (title && title.trim()) ? { name: title.trim(), source: 'title' } : null;
}

document.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]').forEach(function(el) {
  var result = getName(el);
  var colour = result ? '#1b5e20' : '#b00020';
  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);
  var badge = document.createElement('div');
  badge.textContent = result ? result.source + ': ' + result.name : 'NO ACCESSIBLE NAME';
  badge.style.position = 'absolute';
  badge.style.background = colour;
  badge.style.color = '#ffffff';
  badge.style.padding = '4px 6px';
  badge.style.fontSize = '14px';
  badge.style.fontFamily = 'Arial, sans-serif';
  badge.style.borderRadius = '4px';
  badge.style.whiteSpace = 'nowrap';
  badge.style.pointerEvents = 'none';
  badge.style.zIndex = '999999';
  var rect = el.getBoundingClientRect();
  badge.style.left = (rect.left + window.scrollX) + 'px';
  badge.style.top  = (rect.top + window.scrollY - 26) + 'px';
  overlay.appendChild(badge);
});

if (flaggedEls.length === 0) {
  var msg = document.createElement('div');
  msg.textContent = 'No button elements found on this page.';
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
