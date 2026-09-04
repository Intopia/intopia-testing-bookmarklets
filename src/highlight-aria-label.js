// Highlight aria-label
// Highlights all elements with `aria-label`.
// Flags empty values and use on roles where author-provided names are prohibited.
// An explicit role overrides the implicit one, so a <span role="button"> is a
// button and may be named.
(function () {
  var existing = document.getElementById('a11y-aria-label-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-aria-label-overlay';
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

  function makeBadge(text, colour, rect) {
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX) + 'px';
    b.style.top = (rect.top + window.scrollY - 26) + 'px';
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

  function flag(el, colour, text, rect) {
    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);
    makeBadge(text, colour, rect);
  }

  document.querySelectorAll('[aria-label]').forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var value = el.getAttribute('aria-label').trim();
    var role = prohibitedRole(el);

    if (role) {
      flag(el, '#b00020', 'aria-label on prohibited role: ' + role, rect);
    } else if (value === '') {
      flag(el, '#e65100', 'aria-label: (empty)', rect);
    } else {
      flag(el, '#1b5e20', 'aria-label: ' + value, rect);
    }
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No aria-label attributes found on this page.';
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
