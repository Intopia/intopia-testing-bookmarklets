// Highlight image alternatives
// Highlights images and elements with role="img".
// Distinguishes between meaningful `alt` text, empty `alt` and missing `alt`,
// and shows where aria-label or aria-labelledby override the alt attribute.
// role="presentation" or role="none" removes the image from the accessibility
// tree, so its alt is never announced.
(function () {
  var existing = document.getElementById('a11y-img-alt-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-img-alt-overlay';
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

  function ariaName(el) {
    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      var refText = labelledBy.trim().split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? ref.textContent.trim() : '';
      }).filter(Boolean).join(' ').trim();
      if (refText) return { name: refText, source: 'aria-labelledby' };
    }
    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return { name: ariaLabel.trim(), source: 'aria-label' };
    }
    return null;
  }

  function roleOf(el) {
    var role = el.getAttribute('role');
    return role ? role.trim().toLowerCase().split(/\s+/)[0] : '';
  }

  // An <svg> can be named by a direct <title> child
  function svgTitle(el) {
    if (el.tagName.toLowerCase() !== 'svg') return '';
    for (var i = 0; i < el.children.length; i++) {
      if (el.children[i].tagName.toLowerCase() === 'title') {
        return el.children[i].textContent.trim();
      }
    }
    return '';
  }

  // <area> has no layout box, so there is nowhere to anchor a badge.
  var SELECTOR = 'img, [role="img" i], [role="image" i]';

  var images = document.querySelectorAll(SELECTOR);

  images.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    var isImgElement = el.tagName.toLowerCase() === 'img';
    var role = roleOf(el);
    var aria = ariaName(el);
    var rawAlt = isImgElement ? el.getAttribute('alt') : null;
    var title = el.getAttribute('title');
    var colour, text;

    if (role === 'presentation' || role === 'none') {
      colour = BLUE;
      text = 'Decorative (role="' + role + '")';
    } else if (aria) {
      colour = GREEN;
      text = aria.source + ': ' + aria.name;
      if (rawAlt !== null && rawAlt.trim() !== '') {
        text += ' (overrides alt: "' + rawAlt.trim() + '")';
      }
    } else if (isImgElement && rawAlt === null) {
      if (title && title.trim()) {
        colour = AMBER;
        text = 'title: ' + title.trim() + ' (no alt \u2014 unreliable name source)';
      } else {
        colour = RED;
        text = 'Missing alt';
      }
    } else if (isImgElement && rawAlt.trim() === '') {
      colour = BLUE;
      text = 'Empty alt';
    } else if (isImgElement) {
      colour = GREEN;
      text = 'Alt: ' + rawAlt;
    } else {
      // role="img" on something other than <img>
      var svgName = svgTitle(el);
      if (svgName) {
        colour = GREEN;
        text = 'svg title: ' + svgName;
      } else if (title && title.trim()) {
        colour = AMBER;
        text = 'title: ' + title.trim() + ' (unreliable name source)';
      } else {
        colour = RED;
        text = 'NO ACCESSIBLE NAME';
      }
    }

    if (!isImgElement) text += ' [role="' + (role || 'img') + '"]';

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = text;
    badge.style.position = 'absolute';
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 26) + 'px';
    badge.style.background = colour;
    badge.style.color = '#ffffff';
    badge.style.padding = '2px 6px';
    badge.style.fontSize = '14px';
    badge.style.fontFamily = 'Arial, sans-serif';
    badge.style.borderRadius = '4px';
    badge.style.pointerEvents = 'none';
    badge.style.zIndex = '999999';
    badge.style.maxWidth = '400px';
    badge.style.whiteSpace = 'normal';
    badge.style.lineHeight = '1.4';
    overlay.appendChild(badge);
  });

  if (flaggedEls.length === 0) {
    var msg = document.createElement('div');
    msg.textContent = 'No images found on this page.';
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
