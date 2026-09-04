// Highlight aria-controls
// Highlights elements with aria-controls and their referenced targets.
// Flags missing IDs and self-references inline, and flags an empty attribute value.
// Where only some IDs are missing the badge is amber; where all are missing it is red.
// Referenced elements that are not rendered (display:none, visibility:hidden) are
// valid and noted silently, with no badge or outline of their own.
// Note: an element inserted into the DOM only on first activation will be flagged
// as missing until it exists. That is correct — it reflects what AT sees at that
// moment. Re-run after triggering to confirm the reference resolves.
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

// An element is only badged if it is actually rendered. width/height catch
// display:none; visibility must be checked separately because a hidden element
// still occupies layout space.
function isRendered(el, rect) {
  if (rect.width === 0 && rect.height === 0) return false;
  return window.getComputedStyle(el).visibility !== 'hidden';
}

var sources = document.querySelectorAll('[aria-controls]');

sources.forEach(function(el) {
  var raw = el.getAttribute('aria-controls').trim();
  var rect = el.getBoundingClientRect();

  // Empty or whitespace-only attribute value
  if (raw === '') {
    el.style.outline = '3px solid #b00020';
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge('aria-controls: (empty)', '#b00020', rect);
    return;
  }

  var ids = raw.split(/\s+/);
  var idLabels = [];
  var missingCount = 0;

  ids.forEach(function(id) {
    var ref = document.getElementById(id);
    if (!ref) {
      idLabels.push(id + ' (missing)');
      missingCount++;
    } else {
      var refRect = ref.getBoundingClientRect();
      if (isRendered(ref, refRect)) {
        ref.style.outline = '3px solid #0a558c';
        ref.style.outlineOffset = '2px';
        makeBadge('ID: ' + id + (ref === el ? ' (self)' : ''), '#0a558c', refRect);
      }
      flaggedEls.push(ref);
      idLabels.push(ref === el ? id + ' (self)' : id);
    }
  });

  // Partial is amber, total is red: one stale reference is not the same as a
  // relationship that resolves to nothing.
  var colour;
  if (missingCount === 0) {
    colour = '#1b5e20';
  } else if (missingCount === ids.length) {
    colour = '#b00020';
  } else {
    colour = '#e65100';
  }

  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);
  makeBadge('aria-controls: ' + idLabels.join(' '), colour, rect);
});

if (sources.length === 0) {
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
