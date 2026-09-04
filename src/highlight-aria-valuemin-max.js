// Highlight aria-valuemin and aria-valuemax
// Highlights elements with aria-valuemin and/or aria-valuemax.
// Flags missing values from the pair, non-numeric values, an inverted range
// where valuemin exceeds valuemax, and an empty range where the two are equal.
(function(){
var existing = document.getElementById('a11y-valuerange-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-valuerange-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

// ARIA number type. HTML's rules for parsing floating-point numbers allow an
// optional sign, decimals and exponent notation (1e2), but not hex (0x10) or
// Infinity — both of which Number() would happily accept.
var NUMBER_PATTERN = /^[-+]?(\d+(\.\d+)?|\.\d+)([eE][-+]?\d+)?$/;

function isNumeric(val) {
  return val !== null && NUMBER_PATTERN.test(val.trim());
}

function toNum(val) {
  return parseFloat(val.trim());
}

function formatAttr(name, val) {
  if (val === null) return name + ': (missing)';
  if (!isNumeric(val)) return name + ': "' + val + '" (invalid)';
  return name + ': ' + val.trim();
}

document.querySelectorAll('[aria-valuemin],[aria-valuemax]').forEach(function(el) {
  var minVal = el.getAttribute('aria-valuemin');
  var maxVal = el.getAttribute('aria-valuemax');

  var minOk = minVal !== null && isNumeric(minVal);
  var maxOk = maxVal !== null && isNumeric(maxVal);
  var minInvalid = minVal !== null && !minOk;
  var maxInvalid = maxVal !== null && !maxOk;

  var minNum = minOk ? toNum(minVal) : null;
  var maxNum = maxOk ? toNum(maxVal) : null;

  // An inverted range is incoherent; an empty one cannot be adjusted
  var inverted = minNum !== null && maxNum !== null && minNum > maxNum;
  var equal = minNum !== null && maxNum !== null && minNum === maxNum;

  var colour;
  if (minInvalid || maxInvalid || inverted) {
    colour = '#b00020';
  } else if (!minOk || !maxOk || equal) {
    colour = '#e65100';
  } else {
    colour = '#1b5e20';
  }

  var label = formatAttr('aria-valuemin', minVal) + '  |  ' + formatAttr('aria-valuemax', maxVal);
  if (inverted) {
    label += '  |  valuemin exceeds valuemax';
  } else if (equal) {
    label += '  |  empty range (min equals max)';
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
  msg.textContent = 'No aria-valuemin or aria-valuemax attributes found on this page.';
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
