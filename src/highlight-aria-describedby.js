// Highlight aria-describedby
// Highlights elements with aria-describedby and their targets.
// Shows the concatenated description resolved from referenced IDs.
// Flags missing IDs and self-references inline, and flags an empty attribute value.
// Note: resolves text from hidden elements by design, per AccName. Referenced
// elements that are not rendered get no badge or outline of their own.
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

// An element is only badged if it is actually rendered. width/height catch
// display:none; visibility must be checked separately because a hidden element
// still occupies layout space.
function isRendered(el, rect) {
  if (rect.width === 0 && rect.height === 0) return false;
  return window.getComputedStyle(el).visibility !== 'hidden';
}

var sources = document.querySelectorAll('[aria-describedby]');

sources.forEach(function(el) {
  var raw = el.getAttribute('aria-describedby').trim();
  var rect = el.getBoundingClientRect();

  // Empty or whitespace-only attribute value
  if (raw === '') {
    el.style.outline = '4px solid #b00020';
    flaggedEls.push(el);
    makeBadge('aria-describedby: (empty) \u2192 NO DESCRIPTION', '#b00020', rect);
    return;
  }

  var ids = raw.split(/\s+/);
  var idLabels = [];
  var resolvedTexts = [];

  ids.forEach(function(id) {
    var ref = document.getElementById(id);
    if (!ref) {
      idLabels.push(id + ' (missing)');
    } else {
      var refRect = ref.getBoundingClientRect();
      if (isRendered(ref, refRect)) {
        ref.style.outline = '4px solid #0a558c';
        makeBadge('ID: ' + id + (ref === el ? ' (self)' : ''), '#0a558c', refRect);
      }
      flaggedEls.push(ref);
      resolvedTexts.push(ref.textContent.trim());
      idLabels.push(ref === el ? id + ' (self)' : id);
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

if (sources.length === 0) {
  var msg = document.createElement('div');
  msg.textContent = 'No aria-describedby attributes found on this page.';
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
  flaggedEls.forEach(function(el) { el.style.outline = ''; });
  document.removeEventListener('keydown', onKey);
}
document.addEventListener('keydown', onKey);
})();
