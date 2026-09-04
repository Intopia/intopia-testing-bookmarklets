// Highlight links
// Highlights <a> elements and elements with role="link".
// Checks for unique names, duplicate names pointing to different URLs,
// empty href, missing href, title attribute issues, and links named by title only.
// A link containing only an image is named by that image's alt text.
(function(){
var existing = document.getElementById('a11y-links-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-links-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

var GREEN = '#1b5e20';
var AMBER = '#e65100';
var RED   = '#b00020';

// An element is only badged if it is actually rendered. width/height catch
// display:none; visibility must be checked separately because a hidden element
// still occupies layout space.
function isRendered(el, rect) {
  if (rect.width === 0 && rect.height === 0) return false;
  return window.getComputedStyle(el).visibility !== 'hidden';
}

// Text content alone misses a link named by an image, which is common for a
// logo or icon link. Swap embedded images for their alt text first.
function contentName(el) {
  var clone = el.cloneNode(true);
  clone.querySelectorAll('img, area, input[type="image" i]').forEach(function(img) {
    var alt = img.getAttribute('alt');
    img.replaceWith(document.createTextNode(alt && alt.trim() ? ' ' + alt.trim() + ' ' : ''));
  });
  return clone.textContent.trim().replace(/\s+/g, ' ');
}

function getAccessibleName(el) {
  // aria-labelledby
  var labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    var text = labelledBy.trim().split(/\s+/).map(function(id) {
      var ref = document.getElementById(id);
      return ref ? ref.textContent.trim() : '';
    }).filter(Boolean).join(' ').trim();
    if (text) return { name: text, source: 'labelledby' };
  }
  // aria-label
  var ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return { name: ariaLabel.trim(), source: 'aria-label' };
  // content, including image alt text
  var content = contentName(el);
  if (content) return { name: content, source: 'text' };
  // title
  var title = el.getAttribute('title');
  if (title && title.trim()) return { name: title.trim(), source: 'title' };
  return null;
}

function isAnchor(el) {
  return el.tagName.toLowerCase() === 'a';
}

// Collect links
var links = Array.from(document.querySelectorAll('a, [role="link" i]'));

// Build name→urls map for duplicate detection. Compare resolved URLs, since
// /page and ./page point at the same place but differ as attribute strings.
var nameUrlMap = {};
links.forEach(function(el) {
  if (!isAnchor(el)) return;
  var raw = el.getAttribute('href');
  if (raw === null || raw.trim() === '') return;
  var nameResult = getAccessibleName(el);
  if (!nameResult) return;
  var name = nameResult.name.toLowerCase();
  var resolved = el.href;
  if (!nameUrlMap[name]) nameUrlMap[name] = [];
  if (nameUrlMap[name].indexOf(resolved) === -1) nameUrlMap[name].push(resolved);
});

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
  b.style.pointerEvents = 'none';
  b.style.zIndex = '999999';
  b.style.maxWidth = '500px';
  b.style.whiteSpace = 'normal';
  b.style.lineHeight = '1.4';
  overlay.appendChild(b);
}

function flag(el, colour, label, suffix) {
  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);
  makeBadge(label + (suffix || ''), colour, el.getBoundingClientRect());
}

links.forEach(function(el) {
  var rect = el.getBoundingClientRect();
  if (!isRendered(el, rect)) return;

  var anchor = isAnchor(el);
  var suffix = anchor ? '' : ' [role="link"]';
  var href = el.getAttribute('href');
  var hrefVal = href !== null ? href.trim() : null;
  var title = el.getAttribute('title');
  var titleVal = title ? title.trim() : null;
  var nameResult = getAccessibleName(el);

  // href checks only apply to <a>. A role="link" element is activated by script.
  if (anchor && href === null) {
    flag(el, RED, '(no href \u2014 not a link in the accessibility tree)', suffix);
    return;
  }

  if (anchor && hrefVal === '') {
    flag(el, RED, '(empty href)', suffix);
    return;
  }

  if (!nameResult) {
    flag(el, RED, '(no accessible name)', suffix);
    return;
  }

  var name = nameResult.name;
  var nameLower = name.toLowerCase();

  // Title only as name source
  if (nameResult.source === 'title') {
    flag(el, AMBER, '(no name \u2014 title only: "' + name + '")', suffix);
    return;
  }

  // Duplicate name pointing to different URLs
  var urls = nameUrlMap[nameLower] || [];
  if (urls.length > 1) {
    flag(el, RED, '\u201c' + name + '\u201d (duplicate name, different URL)', suffix);
    return;
  }

  // Title attribute checks
  if (titleVal) {
    if (titleVal.toLowerCase() === nameLower) {
      flag(el, AMBER, '\u201c' + name + '\u201d (title matches \u2014 may double-announce)', suffix);
    } else {
      flag(el, AMBER, '\u201c' + name + '\u201d (title mismatch: "' + titleVal +
        '" \u2014 may double-announce differently)', suffix);
    }
    return;
  }

  flag(el, GREEN, '\u201c' + name + '\u201d', suffix);
});

if (flaggedEls.length === 0) {
  var msg = document.createElement('div');
  msg.textContent = 'No links found on this page.';
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
