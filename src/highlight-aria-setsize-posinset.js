// Highlight aria-setsize and aria-posinset
// Highlights elements with aria-setsize and/or aria-posinset.
// Shows position within set, and level where present.
// Flags incomplete pairs and non-numeric values.
(function(){
var existing = document.getElementById('a11y-setsize-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-setsize-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

function isNumeric(val) {
  return val !== null && val.trim() !== '' && !isNaN(Number(val.trim()));
}

function isValidSetsize(val) {
  if (!isNumeric(val)) return false;
  var n = Number(val.trim());
  return Number.isInteger(n) && (n === -1 || n >= 0);
}

function isValidPosinset(val) {
  if (!isNumeric(val)) return false;
  var n = Number(val.trim());
  return Number.isInteger(n) && n >= 1;
}

document.querySelectorAll('[aria-setsize],[aria-posinset]').forEach(function(el) {
  var posVal  = el.getAttribute('aria-posinset');
  var sizeVal = el.getAttribute('aria-setsize');
  var levelVal = el.getAttribute('aria-level');

  var posOk   = posVal  !== null && isValidPosinset(posVal);
  var sizeOk  = sizeVal !== null && isValidSetsize(sizeVal);
  var posInvalid  = posVal  !== null && !isValidPosinset(posVal);
  var sizeInvalid = sizeVal !== null && !isValidSetsize(sizeVal);

  var colour;
  if (posInvalid || sizeInvalid) {
    colour = '#b00020';
  } else if (!posOk || !sizeOk) {
    colour = '#e65100';
  } else {
    colour = '#1b5e20';
  }

  // Build badge text
  var parts = [];

  if (levelVal !== null) {
    parts.push('level: ' + levelVal.trim());
  }

  // posinset part
  var posPart;
  if (posVal === null) {
    posPart = 'posinset: (missing)';
  } else if (posInvalid) {
    posPart = 'posinset: "' + posVal + '" (invalid)';
  } else {
    posPart = 'posinset: ' + posVal.trim();
  }

  // setsize part
  var sizePart;
  if (sizeVal === null) {
    sizePart = 'setsize: (missing)';
  } else if (sizeInvalid) {
    sizePart = 'setsize: "' + sizeVal + '" (invalid)';
  } else if (sizeVal.trim() === '-1') {
    sizePart = 'setsize: -1 (unknown total)';
    if (colour === '#1b5e20') colour = '#e65100'; // -1 is valid but worth flagging
  } else {
    sizePart = 'setsize: ' + sizeVal.trim();
  }

  // Combine into readable label
  var posNum  = posOk  ? Number(posVal.trim())  : null;
  var sizeNum = sizeOk ? Number(sizeVal.trim()) : null;
  if (posNum !== null && sizeNum !== null && sizeNum !== -1) {
    parts.push(posNum + ' of ' + sizeNum + '  (' + posPart + '  |  ' + sizePart + ')');
  } else {
    parts.push(posPart + '  |  ' + sizePart);
  }

  var label = parts.join('  |  ');

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
  msg.textContent = 'No aria-setsize or aria-posinset attributes found on this page.';
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
