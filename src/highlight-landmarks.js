// Highlight landmarks
// Highlights all landmark regions with distinct colours per role.
// Shows accessible name where present.
// Name resolution follows AccName precedence: aria-labelledby before aria-label.
// An explicit non-landmark role (for example role="presentation") excludes the
// element, and role values are matched case-insensitively.
// <form> and <section> only count as landmarks when they have a name.
// Landmarks that are not rendered are skipped.
(function () {
  var existing = document.getElementById('a11y-landmarks-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-landmarks-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  var COLOURS = {
    banner: '#0a558c',
    navigation: '#e65100',
    main: '#1b5e20',
    complementary: '#006064',
    contentinfo: '#4a148c',
    search: '#880e4f',
    region: '#37474f',
    form: '#b00020'
  };

  var LANDMARK_ROLES = Object.keys(COLOURS);

  // AccName precedence: aria-labelledby wins over aria-label.
  // Referenced elements contribute their text even when hidden, per AccName.
  function getName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var text = labelledBy.trim().split(/\s+/).map(function (id) {
        return document.getElementById(id);
      }).filter(Boolean).map(function (ref) {
        return ref.textContent.trim();
      }).filter(Boolean).join(' ');
      if (text) return text;
    }
    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
    return '';
  }

  // header and footer only map to banner and contentinfo at the top level.
  // A nested aside is only complementary when it has an accessible name.
  function isNested(el) {
    return !!el.parentElement && !!el.parentElement.closest('article,aside,main,nav,section');
  }

  function getRole(el) {
    // An explicit role overrides the implicit one, so a non-landmark role means
    // this is not a landmark at all. role="presentation" on a <nav> is the case
    // that matters most.
    var explicit = el.getAttribute('role');
    if (explicit) {
      var role = explicit.trim().toLowerCase().split(/\s+/)[0];
      return LANDMARK_ROLES.indexOf(role) !== -1 ? role : '';
    }

    var tag = el.tagName.toLowerCase();
    if (tag === 'header') return isNested(el) ? '' : 'banner';
    if (tag === 'footer') return isNested(el) ? '' : 'contentinfo';
    if (tag === 'aside') return (isNested(el) && !getName(el)) ? '' : 'complementary';
    if (tag === 'nav') return 'navigation';
    if (tag === 'main') return 'main';
    if (tag === 'search') return 'search';
    // <form> only maps to the form role when it has an accessible name,
    // the same rule <section> follows below.
    if (tag === 'form') return getName(el) ? 'form' : '';
    if (tag === 'section') return getName(el) ? 'region' : '';
    return '';
  }

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // An element is only badged if it is actually rendered. width/height catch
  // display:none; visibility must be checked separately because a hidden element
  // still occupies layout space.
  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  var SELECTOR = [
    'header',
    'nav',
    'main',
    'footer',
    'aside',
    'form',
    'section',
    'search',
    '[role="banner" i]',
    '[role="navigation" i]',
    '[role="main" i]',
    '[role="contentinfo" i]',
    '[role="complementary" i]',
    '[role="form" i]',
    '[role="search" i]',
    '[role="region" i]'
  ].join(',');

  var landmarks = Array.from(document.querySelectorAll(SELECTOR)).filter(function (el) {
    return getRole(el) !== '';
  });

  landmarks.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var role = getRole(el);
    var name = getName(el);
    var colour = COLOURS[role] || '#333333';

    el.style.outline = '4px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = name ? capitalise(role) + ': ' + name : capitalise(role);
    badge.style.position = 'absolute';
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 28) + 'px';
    badge.style.background = colour;
    badge.style.color = '#ffffff';
    badge.style.padding = '4px 6px';
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
    msg.textContent = 'No landmarks found on this page.';
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
    flaggedEls.forEach(function (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
