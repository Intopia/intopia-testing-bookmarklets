// Highlight lists
// Highlights native list elements and ARIA list roles with distinct colours per type.
// An explicit role="presentation" or role="none" removes list semantics, so the
// element is flagged as not a list.
// List items are flagged when they sit outside a list they can belong to.
(function () {
  var existing = document.getElementById('a11y-lists-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-lists-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  var GREEN = '#1b5e20';
  var BLUE = '#0a558c';
  var AMBER = '#e65100';
  var RED = '#b00020';

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  function roleOf(el) {
    var role = el.getAttribute('role');
    return role ? role.trim().toLowerCase().split(/\s+/)[0] : '';
  }

  function isPresentational(el) {
    var role = roleOf(el);
    return role === 'presentation' || role === 'none';
  }

  function flag(el, colour, text, position) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX + 2) + 'px';
    b.style.top = position === 'above'
      ? (rect.top + window.scrollY - 24) + 'px'
      : (rect.bottom + window.scrollY - 22) + 'px';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '4px 6px';
    b.style.fontSize = '14px';
    b.style.fontFamily = 'Arial, sans-serif';
    b.style.borderRadius = '4px';
    b.style.whiteSpace = 'nowrap';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '999999';
    overlay.appendChild(b);
  }

  // A list item only counts when its direct parent is a list. A wrapper element
  // between the two breaks the relationship in the accessibility tree.
  function parentIsNativeList(el) {
    var parent = el.parentElement;
    if (!parent) return false;
    var tag = parent.tagName.toLowerCase();
    if (tag !== 'ul' && tag !== 'ol' && tag !== 'menu') return false;
    return !isPresentational(parent);
  }

  function parentIsAriaList(el) {
    var parent = el.parentElement;
    return !!parent && roleOf(parent) === 'list';
  }

  // Native lists
  document.querySelectorAll('ul, ol, menu').forEach(function (el) {
    var tag = el.tagName.toLowerCase();
    if (isPresentational(el)) {
      flag(el, RED, '<' + tag + '> role="' + roleOf(el) + '" (not a list)', 'above');
    } else {
      flag(el, GREEN, '<' + tag + '>', 'above');
    }
  });

  document.querySelectorAll('dl').forEach(function (el) {
    if (isPresentational(el)) {
      flag(el, RED, '<dl> role="' + roleOf(el) + '" (not a list)', 'above');
    } else {
      flag(el, BLUE, '<dl>', 'above');
    }
  });

  document.querySelectorAll('li').forEach(function (el) {
    if (isPresentational(el)) {
      flag(el, RED, '<li> role="' + roleOf(el) + '" (not a list item)', 'bottom');
    } else if (!parentIsNativeList(el) && !parentIsAriaList(el)) {
      flag(el, RED, '<li> (not in a list)', 'bottom');
    } else {
      flag(el, GREEN, '<li>', 'bottom');
    }
  });

  document.querySelectorAll('dt').forEach(function (el) { flag(el, BLUE, '<dt>', 'bottom'); });
  document.querySelectorAll('dd').forEach(function (el) { flag(el, BLUE, '<dd>', 'bottom'); });

  // ARIA list roles, on elements that are not already native lists
  document.querySelectorAll('[role="list" i]').forEach(function (el) {
    var tag = el.tagName.toLowerCase();
    if (tag === 'ul' || tag === 'ol' || tag === 'menu') return;
    flag(el, AMBER, 'role="list"', 'above');
  });

  document.querySelectorAll('[role="listitem" i]').forEach(function (el) {
    if (el.tagName.toLowerCase() === 'li') return;
    if (!parentIsAriaList(el) && !parentIsNativeList(el)) {
      flag(el, RED, 'role="listitem" (not in a list)', 'bottom');
    } else {
      flag(el, AMBER, 'role="listitem"', 'bottom');
    }
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No list elements found on this page.';
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
