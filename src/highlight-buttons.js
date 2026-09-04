// Highlight buttons
// Highlights native buttons and elements with role="button", and their accessible names.
// Covers <button>, input types submit, reset, button and image, and role="button".
// Flags buttons with no accessible name, and names that come from title alone.
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

// An element is only badged if it is actually rendered. width/height catch
// display:none; visibility must be checked separately because a hidden element
// still occupies layout space.
function isRendered(el, rect) {
  if (rect.width === 0 && rect.height === 0) return false;
  return window.getComputedStyle(el).visibility !== 'hidden';
}

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
    var type = (el.getAttribute('type') || '').toLowerCase();
    // An image button takes its name from alt, not from value
    if (type === 'image') {
      var alt = el.getAttribute('alt');
      if (alt && alt.trim()) return { name: alt.trim(), source: 'alt' };
    } else {
      var val = el.getAttribute('value');
      if (val && val.trim()) return { name: val.trim(), source: 'value' };
      if (type === 'submit') return { name: 'Submit', source: 'default' };
      if (type === 'reset')  return { name: 'Reset',  source: 'default' };
    }
  }

  var text = el.textContent.trim().replace(/\s+/g, ' ');
  if (text) return { name: text, source: 'text content' };
  var title = el.getAttribute('title');
  return (title && title.trim()) ? { name: title.trim(), source: 'title' } : null;
}

function isNativeButton(el) {
  var tag = el.tagName.toLowerCase();
  if (tag === 'button') return true;
  if (tag !== 'input') return false;
  var type = (el.getAttribute('type') || '').toLowerCase();
  return type === 'submit' || type === 'reset' || type === 'button' || type === 'image';
}

var SELECTOR = 'button, input[type="submit" i], input[type="reset" i], ' +
  'input[type="button" i], input[type="image" i], [role="button" i]';

var buttons = document.querySelectorAll(SELECTOR);

buttons.forEach(function(el) {
  var rect = el.getBoundingClientRect();
  if (!isRendered(el, rect)) return;

  var result = getName(el);
  var colour, text;

  if (!result) {
    colour = '#b00020';
    text = 'NO ACCESSIBLE NAME';
  } else if (result.source === 'title') {
    // title is an unreliable name source: not shown on touch, not always announced
    colour = '#e65100';
    text = 'title: ' + result.name + ' (unreliable \u2014 title only)';
  } else {
    colour = '#1b5e20';
    text = result.source + ': ' + result.name;
  }

  // Make custom buttons distinguishable from native ones
  if (!isNativeButton(el)) {
    text += ' [role="button"]';
  }

  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);

  var badge = document.createElement('div');
  badge.textContent = text;
  badge.style.position = 'absolute';
  badge.style.background = colour;
  badge.style.color = '#ffffff';
  badge.style.padding = '2px 6px';
  badge.style.fontSize = '14px';
  badge.style.fontFamily = 'Arial, sans-serif';
  badge.style.borderRadius = '4px';
  badge.style.whiteSpace = 'nowrap';
  badge.style.pointerEvents = 'none';
  badge.style.zIndex = '999999';
  badge.style.left = (rect.left + window.scrollX) + 'px';
  badge.style.top  = (rect.top + window.scrollY - 26) + 'px';
  overlay.appendChild(badge);
});

if (flaggedEls.length === 0) {
  var msg = document.createElement('div');
  msg.textContent = 'No buttons found on this page.';
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
