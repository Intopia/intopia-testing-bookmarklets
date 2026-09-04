// Highlight aria-label
// Highlights all elements with `aria-label`.
// Flags empty values and use on roles where author-provided names are prohibited.
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
  // ARIA 1.2, plus the roles added in the ARIA 1.3 draft.
  var prohibitedRoles = new Set([
    'caption', 'code', 'deletion', 'emphasis', 'generic', 'insertion',
    'paragraph', 'presentation', 'strong', 'subscript', 'superscript',
    'definition', 'mark', 'none', 'suggestion', 'term', 'time', 'tooltip'
  ]);

  // Implicit roles for elements that map to a name-prohibited role.
  var implicitRoles = new Map([
    ['caption', 'caption'],
    ['code', 'code'],
    ['del', 'deletion'],
    ['s', 'deletion'],
    ['em', 'emphasis'],
    ['div', 'generic'],
    ['span', 'generic'],
    ['ins', 'insertion'],
    ['p', 'paragraph'],
    ['strong', 'strong'],
    ['sub', 'subscript'],
    ['sup', 'superscript'],
    ['dfn', 'definition'],
    ['mark', 'mark'],
    ['time', 'time']
  ]);

  function makeBadge(text, colour, rect) {
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX) + 'px';
    b.style.top = (rect.top + window.scrollY - 26) + 'px';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '2px 5px';
    b.style.fontSize = '14px';
    b.style.fontFamily = 'Arial, sans-serif';
    b.style.borderRadius = '4px';
    b.style.whiteSpace = 'nowrap';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '999999';
    overlay.appendChild(b);
  }

  function flag(el, colour, text) {
    el.style.outline = '3px solid ' + colour;
    flaggedEls.push(el);
    makeBadge(text, colour, el.getBoundingClientRect());
  }

  function getRole(el) {
    var explicit = el.getAttribute('role');
    return explicit || implicitRoles.get(el.tagName.toLowerCase()) || null;
  }

  document.querySelectorAll('[aria-label]').forEach(function (el) {
    var value = el.getAttribute('aria-label').trim();
    var role = getRole(el);

    if (prohibitedRoles.has(role)) {
      flag(el, '#b00020', 'aria-label on prohibited role: ' + role);
    } else if (value === '') {
      flag(el, '#e65100', 'aria-label: (empty)');
    } else {
      flag(el, '#1b5e20', 'aria-label: ' + value);
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
    flaggedEls.forEach(function (el) { el.style.outline = ''; });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
