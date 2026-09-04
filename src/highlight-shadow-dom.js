// Highlight shadow DOM
// Reconnaissance for auditors: before running an extension-based tool on a page,
// find out whether shadow DOM will hide content from it.
// Walks into open shadow roots recursively and reports how much of the page sits
// inside them. Closed shadow roots cannot be detected by anything, including this
// bookmarklet, so a custom element with no open root is reported as unconfirmed.
(function () {
  var existing = document.getElementById('a11y-shadow-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-shadow-overlay';
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
  var RED = '#b00020';

  var openHosts = 0;
  var maxDepth = 0;
  var elementsInShadow = 0;
  var unconfirmed = 0;
  var undefinedCustom = 0;

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  function describe(el) {
    var tag = el.tagName.toLowerCase();
    if (el.id) return tag + '#' + el.id;
    if (el.className && typeof el.className === 'string' && el.className.trim()) {
      return tag + '.' + el.className.trim().split(/\s+/)[0];
    }
    return tag;
  }

  function badge(el, colour, text) {
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;

    el.style.outline = '4px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.left = (rect.left + window.scrollX) + 'px';
    b.style.top = (rect.top + window.scrollY - 26) + 'px';
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

  // Walks a root, then walks into any open shadow roots it finds.
  // Elements inside a shadow root are counted but not badged: the count is what
  // matters here, and badging every node would bury the page.
  function walk(root, depth) {
    if (depth > maxDepth) maxDepth = depth;

    root.querySelectorAll('*').forEach(function (el) {
      if (depth > 0) elementsInShadow++;

      var tag = el.tagName.toLowerCase();
      var isCustom = tag.indexOf('-') > -1;

      if (el.shadowRoot) {
        openHosts++;
        badge(el, GREEN, 'Open shadow root: ' + describe(el) +
          (depth > 0 ? ' (nested, depth ' + (depth + 1) + ')' : ''));
        walk(el.shadowRoot, depth + 1);
        return;
      }

      if (!isCustom) return;

      // A registered custom element with no open root may have a closed one.
      // Nothing can tell the difference from outside.
      if (window.customElements && window.customElements.get(tag)) {
        unconfirmed++;
        badge(el, AMBER, 'Custom element: ' + describe(el) + ' (shadow DOM unconfirmed)');
      } else {
        undefinedCustom++;
        badge(el, RED, 'Undefined custom element: ' + describe(el) +
          ' (script may not have loaded)');
      }
    });
  }

  walk(document, 0);

  // The report is the point of this bookmarklet. The badges are supporting detail.
  var panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.bottom = '20px';
  panel.style.left = '50%';
  panel.style.transform = 'translateX(-50%)';
  panel.style.background = '#222';
  panel.style.color = '#fff';
  panel.style.padding = '12px 18px';
  panel.style.borderRadius = '8px';
  panel.style.fontSize = '14px';
  panel.style.fontFamily = 'Arial, sans-serif';
  panel.style.lineHeight = '1.6';
  panel.style.zIndex = '999999';
  panel.style.pointerEvents = 'none';
  panel.style.maxWidth = '90vw';
  panel.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';

  function line(text, colour) {
    var row = document.createElement('div');
    row.textContent = text;
    if (colour) {
      row.style.borderLeft = '4px solid ' + colour;
      row.style.paddingLeft = '8px';
    }
    panel.appendChild(row);
  }

  var heading = document.createElement('div');
  heading.textContent = 'Shadow DOM report';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '6px';
  panel.appendChild(heading);

  if (openHosts === 0 && unconfirmed === 0 && undefinedCustom === 0) {
    line('No shadow DOM or custom elements found.', GREEN);
    line('Extension-based tools should see the whole page.');
  } else {
    if (openHosts > 0) {
      line(openHosts + ' open shadow root' + (openHosts > 1 ? 's' : '') +
        ', nested ' + maxDepth + ' level' + (maxDepth > 1 ? 's' : '') + ' deep', GREEN);
      line(elementsInShadow.toLocaleString() + ' element' + (elementsInShadow === 1 ? '' : 's') +
        ' inside shadow DOM \u2014 many extensions will not see these');
    }
    if (unconfirmed > 0) {
      line(unconfirmed + ' custom element' + (unconfirmed > 1 ? 's' : '') +
        ' with no open shadow root \u2014 may be closed, cannot be confirmed', AMBER);
    }
    if (undefinedCustom > 0) {
      line(undefinedCustom + ' undefined custom element' + (undefinedCustom > 1 ? 's' : '') +
        ' \u2014 script may not have loaded', RED);
    }
  }

  var hint = document.createElement('div');
  hint.textContent = 'Esc to clear';
  hint.style.opacity = '0.6';
  hint.style.marginTop = '6px';
  panel.appendChild(hint);

  overlay.appendChild(panel);

  function onKey(e) {
    if (e.key !== 'Escape') return;
    overlay.remove();
    flaggedEls.forEach(function (el) { el.style.outline = ''; el.style.outlineOffset = ''; });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
