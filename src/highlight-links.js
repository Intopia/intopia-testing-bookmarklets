// Highlight links
// Highlights all <a> elements with an href attribute.
// Checks for unique names, duplicate names pointing to different URLs,
// empty href, missing href, title attribute issues, and links named by title only.
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
  // text content
  var textContent = el.textContent.trim().replace(/\s+/g, ' ');
  if (textContent) return { name: textContent, source: 'text' };
  // title
  var title = el.getAttribute('title');
  if (title && title.trim()) return { name: title.trim(), source: 'title' };
  return null;
}

// Collect all links
var links = Array.from(document.querySelectorAll('a'));

// Build name→urls map for duplicate detection
var nameUrlMap = {};
links.forEach(function(el) {
  var nameResult = getAccessibleName(el);
  if (!nameResult) return;
  var name = nameResult.name.toLowerCase();
  var href = (el.getAttribute('href') || '').trim();
  if (!nameUrlMap[name]) nameUrlMap[name] = [];
  if (href && nameUrlMap[name].indexOf(href) === -1) nameUrlMap[name].push(href);
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
  b.style.whiteSpace = 'nowrap';
  b.style.pointerEvents = 'none';
  b.style.zIndex = '999999';
  b.style.maxWidth = '500px';
  b.style.whiteSpace = 'normal';
  b.style.lineHeight = '1.4';
  overlay.appendChild(b);
}

links.forEach(function(el) {
  var href = el.getAttribute('href');
  var hrefVal = href !== null ? href.trim() : null;
  var title = el.getAttribute('title');
  var titleVal = title ? title.trim() : null;
  var nameResult = getAccessibleName(el);
  var rect = el.getBoundingClientRect();
  var colour, label;

  // No href attribute — not a real link
  if (href === null) {
    colour = RED;
    label = '(no href — not a link in the accessibility tree)';
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(label, colour, rect);
    return;
  }

  // Empty href
  if (hrefVal === '') {
    colour = RED;
    label = '(empty href)';
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(label, colour, rect);
    return;
  }

  // No accessible name and no title
  if (!nameResult) {
    colour = RED;
    label = '(no accessible name)';
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(label, colour, rect);
    return;
  }

  var name = nameResult.name;
  var nameLower = name.toLowerCase();

  // Title only as name source
  if (nameResult.source === 'title') {
    colour = AMBER;
    label = '(no name — title only: "' + name + '")';
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(label, colour, rect);
    return;
  }

  // Check for duplicate name pointing to different URLs
  var urls = nameUrlMap[nameLower] || [];
  if (urls.length > 1) {
    colour = RED;
    label = '\u201c' + name + '\u201d (duplicate name, different URL)';
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(label, colour, rect);
    return;
  }

  // Title attribute checks
  if (titleVal) {
    if (titleVal.toLowerCase() === nameLower) {
      colour = AMBER;
      label = '\u201c' + name + '\u201d (title matches — may double-announce)';
    } else {
      colour = AMBER;
      label = '\u201c' + name + '\u201d (title mismatch: "' + titleVal + '" — may double-announce differently)';
    }
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(label, colour, rect);
    return;
  }

  // Pass — unique name, no title issues
  colour = GREEN;
  label = '\u201c' + name + '\u201d';
  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);
  makeBadge(label, colour, rect);
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
