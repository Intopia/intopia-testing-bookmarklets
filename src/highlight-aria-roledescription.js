// Highlight aria-roledescription
// Highlights all elements with aria-roledescription.
// Shows the custom role description value. Flags empty values, elements with no
// role, and elements whose role has no semantics (generic, presentation, none).
(function(){
var existing = document.getElementById('a11y-roledescription-overlay');
if (existing) existing.remove();
var overlay = document.createElement('div');
overlay.id = 'a11y-roledescription-overlay';
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);
var flaggedEls = [];

// Roles with no semantics of their own. aria-roledescription must not be used
// on these, so an explicit one counts as no role rather than as a role.
var semanticlessRoles = new Set(['generic', 'presentation', 'none']);

// Elements with meaningful implicit ARIA roles (not generic)
var meaningfulImplicit = new Set([
  'a','button','input','select','textarea','fieldset',
  'nav','main','header','footer','aside','section','form',
  'h1','h2','h3','h4','h5','h6',
  'img','figure','table','tr','th','td','caption',
  'ul','ol','li','dl','dt','dd',
  'article','dialog','details','summary',
  'meter','progress','output','search',
  'blockquote','hr','p','option','optgroup','label','iframe','video','audio'
]);

function hasAccessibleName(el) {
  var labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy && labelledBy.trim()) {
    var text = labelledBy.trim().split(/\s+/).map(function(id) {
      var ref = document.getElementById(id);
      return ref ? ref.textContent.trim() : '';
    }).filter(Boolean).join(' ');
    if (text) return true;
  }
  var ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return true;
  var title = el.getAttribute('title');
  return !!(title && title.trim());
}

// Returns 'ok', 'semanticless' (explicit role with no semantics) or 'none'.
function roleStatus(el) {
  var explicit = el.getAttribute('role');
  if (explicit && explicit.trim() !== '') {
    var role = explicit.trim().toLowerCase().split(/\s+/)[0];
    return semanticlessRoles.has(role) ? 'semanticless' : 'ok';
  }
  var tag = el.tagName.toLowerCase();
  // <section> only maps to region when it has an accessible name.
  // Unnamed, it maps to generic.
  if (tag === 'section') return hasAccessibleName(el) ? 'ok' : 'none';
  return meaningfulImplicit.has(tag) ? 'ok' : 'none';
}

document.querySelectorAll('[aria-roledescription]').forEach(function(el) {
  var value = el.getAttribute('aria-roledescription').trim();
  var status = roleStatus(el);
  var colour, label;

  if (value === '') {
    colour = '#e65100';
    label = 'aria-roledescription: (empty)';
  } else if (status === 'semanticless') {
    colour = '#e65100';
    label = 'aria-roledescription: "' + value + '" (role="' +
      el.getAttribute('role').trim().toLowerCase().split(/\s+/)[0] +
      '" has no semantics \u2014 misuse)';
  } else if (status === 'none') {
    colour = '#e65100';
    label = 'aria-roledescription: "' + value + '" (no role \u2014 possible misuse)';
  } else {
    colour = '#1b5e20';
    label = 'aria-roledescription: "' + value + '"';
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
  msg.textContent = 'No aria-roledescription attributes found on this page.';
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
