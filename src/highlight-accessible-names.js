// Highlight accessible names
// Shows the accessible name of each focusable element, and which source it came from.
// Click to activate, then TAB through the page. One badge at a time, on the
// element that has focus. Esc to stop, or re-run the bookmarklet to switch it off.
//
// Source precedence, highest first:
//   aria-labelledby, aria-label, label / implicit label, content, value, alt,
//   default (Submit / Reset), title, placeholder
//
// title and placeholder are amber: both are unreliable name sources. title is not
// shown on touch and is inconsistently announced; placeholder disappears on input.
//
// Note: this walks a simplified version of the accessible name computation. The
// browser's real accessibility tree is not exposed to JavaScript, so this is a
// teaching aid, not an authority. Check anything surprising in a real AT.
(function () {
  var BADGE_ID = 'a11y-names-badge';
  var MSG_ID = 'a11y-names-msg';

  // Re-running switches it off
  if (document.getElementById(BADGE_ID)) {
    teardown();
    return;
  }

  var GREEN = '#1b5e20';
  var AMBER = '#e65100';
  var RED = '#b00020';

  var outlined = null;

  var badge = document.createElement('div');
  badge.id = BADGE_ID;
  badge.style.cssText = 'position:absolute;color:#fff;padding:6px 10px;border-radius:6px;' +
    'font-size:14px;font-family:Arial,sans-serif;line-height:1.4;pointer-events:none;' +
    'z-index:999999;display:none;max-width:500px;white-space:normal;' +
    'box-shadow:0 2px 8px rgba(0,0,0,0.4);';
  document.body.appendChild(badge);

  // Text content with embedded images swapped for their alt text, so an icon
  // button or a logo link is not reported as unnamed
  function contentName(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll('img, area, input[type="image" i]').forEach(function (img) {
      var alt = img.getAttribute('alt');
      img.replaceWith(document.createTextNode(alt && alt.trim() ? ' ' + alt.trim() + ' ' : ''));
    });
    return clone.textContent.trim().replace(/\s+/g, ' ');
  }

  function labelName(el) {
    var id = el.getAttribute('id');
    if (id) {
      var labels = document.querySelectorAll('label[for="' + CSS.escape(id) + '"]');
      if (labels.length) {
        var joined = Array.prototype.map.call(labels, function (label) {
          return label.textContent.trim().replace(/\s+/g, ' ');
        }).filter(Boolean).join(' ');
        if (joined) {
          return {
            name: joined,
            source: labels.length > 1 ? 'label \u00d7' + labels.length : 'label'
          };
        }
      }
    }
    var wrapping = el.closest('label');
    if (wrapping) {
      var clone = wrapping.cloneNode(true);
      clone.querySelectorAll('input,select,textarea,meter,output,progress')
        .forEach(function (field) { field.remove(); });
      var text = clone.textContent.trim().replace(/\s+/g, ' ');
      if (text) return { name: text, source: 'implicit label' };
    }
    return null;
  }

  function accessibleName(el) {
    var tag = el.tagName.toLowerCase();
    var type = tag === 'input' ? (el.getAttribute('type') || 'text').toLowerCase() : '';

    var labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy && labelledBy.trim()) {
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

    if (tag === 'input') {
      if (type === 'image') {
        var alt = el.getAttribute('alt');
        if (alt && alt.trim()) return { name: alt.trim(), source: 'alt' };
      } else if (type === 'submit' || type === 'reset' || type === 'button') {
        var value = el.getAttribute('value');
        if (value && value.trim()) return { name: value.trim(), source: 'value' };
        if (type === 'submit') return { name: 'Submit', source: 'default' };
        if (type === 'reset') return { name: 'Reset', source: 'default' };
      } else {
        var fromLabel = labelName(el);
        if (fromLabel) return fromLabel;
      }
    } else if (tag === 'select' || tag === 'textarea') {
      var selLabel = labelName(el);
      if (selLabel) return selLabel;
    } else if (tag !== 'iframe') {
      // button, a, summary, and any custom control given focus by the author
      var content = contentName(el);
      if (content) return { name: content, source: 'content' };
    }

    var title = el.getAttribute('title');
    if (title && title.trim()) {
      return { name: title.trim(), source: 'title', unreliable: true };
    }

    var placeholder = el.getAttribute('placeholder');
    if (placeholder && placeholder.trim()) {
      return { name: placeholder.trim(), source: 'placeholder', unreliable: true };
    }

    return null;
  }

  function clearOutline() {
    if (!outlined) return;
    outlined.style.outline = '';
    outlined.style.outlineOffset = '';
    outlined = null;
  }

  // Sit above the element, but flip below when there is not enough room, so a
  // control near the top of the page does not push the badge out of view.
  // Also keep the badge inside the viewport horizontally.
  function position(el) {
    var rect = el.getBoundingClientRect();
    var height = badge.offsetHeight || 34;
    var width = badge.offsetWidth || 200;
    var GAP = 6;

    var top = rect.top - height - GAP;
    if (top < 0) top = rect.bottom + GAP;
    badge.style.top = (top + window.scrollY) + 'px';

    var left = rect.left;
    var maxLeft = document.documentElement.clientWidth - width - GAP;
    if (left > maxLeft) left = maxLeft;
    if (left < GAP) left = GAP;
    badge.style.left = (left + window.scrollX) + 'px';
  }

  function onFocusIn(e) {
    var el = e.target;
    if (!el || el === document.body || el === document.documentElement) return;

    clearOutline();

    var result = accessibleName(el);
    var tag = el.tagName.toLowerCase();
    var colour, text;

    if (!result) {
      colour = RED;
      text = '<' + tag + '>  NO ACCESSIBLE NAME';
    } else if (result.unreliable) {
      colour = AMBER;
      text = '<' + tag + '>  ' + result.source + ': ' + result.name +
        '  (unreliable name source)';
    } else {
      colour = GREEN;
      text = '<' + tag + '>  ' + result.source + ': ' + result.name;
    }

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    outlined = el;

    badge.textContent = text;
    badge.style.background = colour;
    badge.style.display = 'block';
    position(el);
  }

  function onFocusOut() {
    clearOutline();
    badge.style.display = 'none';
  }

  function onScroll() {
    if (outlined) position(outlined);
  }

  function onKey(e) {
    if (e.key === 'Escape') teardown();
  }

  function teardown() {
    var b = document.getElementById(BADGE_ID);
    var m = document.getElementById(MSG_ID);
    if (b) b.remove();
    if (m) m.remove();
    if (outlined) {
      outlined.style.outline = '';
      outlined.style.outlineOffset = '';
      outlined = null;
    }
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('focusout', onFocusOut, true);
    document.removeEventListener('keyup', onKey, true);
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', onScroll, true);
  }

  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focusout', onFocusOut, true);
  document.addEventListener('keyup', onKey, true);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('resize', onScroll, true);

  var msg = document.createElement('div');
  msg.id = MSG_ID;
  msg.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
    'background:#333;color:#fff;padding:8px 16px;border-radius:6px;font-size:14px;' +
    'font-family:Arial,sans-serif;z-index:999999;pointer-events:none;white-space:nowrap;';
  msg.textContent = 'Tab through the page to see each accessible name and its source — Esc to stop';
  document.body.appendChild(msg);
  setTimeout(function () { if (msg.parentNode) msg.remove(); }, 5000);
})();
