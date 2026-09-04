// Highlight name-prohibited roles
// Highlights elements with `aria-label` or `aria-labelledby` on roles that must not have an author-provided name.
// An explicit role overrides the implicit one, so a <span role="button"> is a
// button and may be named. Only the explicit role is considered when present.
(function () {
  var existing = document.getElementById('a11y-forbidden-roles-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-forbidden-roles-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  // Roles that must not carry an author-provided name.
  // ARIA 1.2 and the ARIA 1.3 draft, per the published spec tables.
  var PROHIBITED_ROLES = new Set([
    'caption', 'code', 'definition', 'deletion', 'emphasis', 'generic',
    'insertion', 'mark', 'none', 'paragraph', 'presentation', 'strong',
    'subscript', 'suggestion', 'superscript', 'term', 'time', 'tooltip'
  ]);

  // Elements whose implicit role is name-prohibited, per HTML-AAM.
  var IMPLICIT_ROLES = {
    caption: 'caption',
    code: 'code',
    del: 'deletion',
    s: 'deletion',
    em: 'emphasis',
    ins: 'insertion',
    p: 'paragraph',
    strong: 'strong',
    sub: 'subscript',
    sup: 'superscript',
    dfn: 'definition',
    mark: 'mark',
    time: 'time',
    // elements mapping to generic
    b: 'generic',
    bdi: 'generic',
    bdo: 'generic',
    data: 'generic',
    div: 'generic',
    i: 'generic',
    pre: 'generic',
    q: 'generic',
    samp: 'generic',
    small: 'generic',
    span: 'generic',
    u: 'generic'
  };

  // An explicit role overrides the implicit one. If it is not itself
  // name-prohibited, the element is fine, whatever its tag would have implied.
  function prohibitedRole(el) {
    var explicit = el.getAttribute('role');
    if (explicit && explicit.trim()) {
      var role = explicit.trim().toLowerCase().split(/\s+/)[0];
      return PROHIBITED_ROLES.has(role) ? role : null;
    }
    return IMPLICIT_ROLES[el.tagName.toLowerCase()] || null;
  }

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  var SELECTOR = Array.prototype.concat.call(
    Array.from(PROHIBITED_ROLES).map(function (r) { return '[role="' + r + '" i]'; }),
    Object.keys(IMPLICIT_ROLES)
  ).join(',');

  document.querySelectorAll(SELECTOR).forEach(function (el) {
    var label = el.getAttribute('aria-label');
    var labelledBy = el.getAttribute('aria-labelledby');
    var hasLabel = label !== null && label.trim() !== '';
    var hasLabelledBy = labelledBy !== null && labelledBy.trim() !== '';
    if (!hasLabel && !hasLabelledBy) return;

    var role = prohibitedRole(el);
    if (!role) return;

    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    el.style.outline = '3px solid #b00020';
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = 'NAME PROHIBITED: ' + role;
    badge.style.position = 'absolute';
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 26) + 'px';
    badge.style.background = '#b00020';
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
    msg.textContent = 'No name-prohibited roles with an author-provided name found on this page.';
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
    flaggedEls.forEach(function (el) { el.style.outline = ''; el.style.outlineOffset = ''; });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
