// Inspect box model
// Click any element to see how its box is put together.
// A fixed panel reports the parts from the inside out: content area, padding,
// scrollbar gutter, border, outline and margin, plus the box-sizing in effect
// and the total size. Esc to stop, or re-run the bookmarklet to switch off.
//
// While this is active the page is in test mode: pointer activation is blocked,
// so clicking a link or button inspects it instead of following or pressing it.
//
// The companion to Inspect text styles. That one reports what the text inside
// the box looks like; this one reports the box itself.
//
// Two things here are not obvious from the CSS and are the reason the tool is
// worth having:
//
// The scrollbar gutter sits between the inner border edge and the outer padding
// edge, so a scrollbar does not eat into padding. It cannot be read from a CSS
// property, only worked out by subtraction, and on macOS it is usually zero
// because overlay scrollbars float on top and reserve no space at all.
//
// A declared bottom margin is often not the gap you get. Adjacent vertical
// margins collapse in block layout, so the panel measures the real distance to
// the next box and says so when the two disagree.
//
// This is a snapshot, not a verdict. Nothing here passes or fails.
(function () {
  var PANEL_ID = 'a11y-box-model-panel';

  // Re-running switches it off
  if (document.getElementById(PANEL_ID)) {
    teardown();
    return;
  }

  var BLUE = '#0a558c';

  var outlined = null;
  var panel = null;

  // ---- value formatting --------------------------------------------------

  // Trim trailing zeros so 19.20px reads as 19.2px
  function num(n, places) {
    return parseFloat(n.toFixed(places === undefined ? 2 : places)) + '';
  }

  function px(value) {
    var n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function unit(n) {
    return num(n) + 'px';
  }

  // Four sides in CSS order: top, right, bottom, left
  function sides(cs, prefix, suffix) {
    return ['Top', 'Right', 'Bottom', 'Left'].map(function (side) {
      return px(cs[prefix + side + (suffix || '')]);
    });
  }

  // Collapse four values the way the CSS shorthand would
  function shorthand(v) {
    var t = v[0], r = v[1], b = v[2], l = v[3];
    if (t === r && r === b && b === l) return unit(t);
    if (t === b && r === l) return unit(t) + ' ' + unit(r);
    if (r === l) return unit(t) + ' ' + unit(r) + ' ' + unit(b);
    return [t, r, b, l].map(unit).join(' ');
  }

  function allZero(v) {
    return v[0] === 0 && v[1] === 0 && v[2] === 0 && v[3] === 0;
  }

  function describeElement(el) {
    var out = el.tagName.toLowerCase();
    if (el.id) out += '#' + el.id;
    else if (el.className && typeof el.className === 'string' && el.className.trim()) {
      out += '.' + el.className.trim().split(/\s+/)[0];
    }
    var role = el.getAttribute('role');
    if (role) out += '[role="' + role.trim() + '"]';
    return out;
  }

  function isRendered(el) {
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return false;
    return getComputedStyle(el).visibility !== 'hidden';
  }

  // ---- panel -------------------------------------------------------------

  function buildPanel() {
    var p = document.createElement('div');
    p.id = PANEL_ID;
    p.style.cssText = 'position:fixed;top:16px;right:16px;width:340px;' +
      'background:#111;color:#fff;padding:16px 18px;border-radius:8px;' +
      'font-size:16px;font-family:Arial,sans-serif;line-height:1.5;' +
      'z-index:2147483647;box-shadow:0 2px 14px rgba(0,0,0,0.5);' +
      'max-height:90vh;overflow:auto;';
    document.body.appendChild(p);
    return p;
  }

  function row(label, value) {
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;gap:8px;align-items:baseline;' +
      'padding:3px 0;border-top:1px solid #333;';

    var l = document.createElement('span');
    l.textContent = label;
    // 112px fits the longest label, "Scrollbar gutter", on one line at 15px
    l.style.cssText = 'flex:0 0 112px;opacity:0.7;font-size:15px;';

    var v = document.createElement('span');
    v.style.cssText = 'flex:1 1 auto;word-break:break-word;';
    v.appendChild(document.createTextNode(value));

    r.appendChild(l);
    r.appendChild(v);
    return r;
  }

  function note(text) {
    var n = document.createElement('div');
    n.textContent = text;
    n.style.cssText = 'opacity:0.65;font-size:14px;padding:4px 0 0 0;';
    return n;
  }

  // ---- the parts, inside out ---------------------------------------------

  function render(el) {
    var cs = getComputedStyle(el);
    var rect = el.getBoundingClientRect();

    var pad = sides(cs, 'padding');
    var bor = sides(cs, 'border', 'Width');
    var mar = sides(cs, 'margin');

    panel.textContent = '';

    var heading = document.createElement('div');
    heading.textContent = 'Box model';
    heading.style.cssText = 'font-weight:bold;margin-bottom:2px;';
    panel.appendChild(heading);

    var who = document.createElement('div');
    who.textContent = describeElement(el);
    who.style.cssText = 'font-family:monospace;font-size:14px;opacity:0.8;' +
      'margin-bottom:8px;word-break:break-all;';
    panel.appendChild(who);

    // box-sizing decides whether a declared width covers the content alone or
    // the content plus padding and border, so it comes first
    panel.appendChild(row('box-sizing', cs.boxSizing));

    // --- content area ---
    // clientWidth includes padding but excludes border and scrollbar. An inline
    // box reports zero for it, so fall back to the rect minus the known parts.
    var contentW, contentH;
    if (el.clientWidth || el.clientHeight) {
      contentW = el.clientWidth - pad[1] - pad[3];
      contentH = el.clientHeight - pad[0] - pad[2];
    } else {
      contentW = rect.width - pad[1] - pad[3] - bor[1] - bor[3];
      contentH = rect.height - pad[0] - pad[2] - bor[0] - bor[2];
    }
    panel.appendChild(row('Content', unit(contentW) + ' × ' + unit(contentH)));

    // --- padding ---
    panel.appendChild(row('Padding', allZero(pad) ? 'none' : shorthand(pad)));

    // --- scrollbar gutter ---
    // Not a CSS property you can read. The only way to it is subtraction: the
    // space between the inner border edge and the outer padding edge.
    // An inline box reports an offset size but a client size of zero, so the
    // subtraction would produce a nonsense gutter. Inline boxes never have one.
    var hasClientBox = el.clientWidth > 0 || el.clientHeight > 0;
    var gutterV = hasClientBox
      ? el.offsetWidth - el.clientWidth - bor[1] - bor[3] : 0;
    var gutterH = hasClientBox
      ? el.offsetHeight - el.clientHeight - bor[0] - bor[2] : 0;
    var scrollsY = el.scrollHeight > el.clientHeight + 1;
    var scrollsX = el.scrollWidth > el.clientWidth + 1;

    var gutterText;
    if (gutterV > 0 || gutterH > 0) {
      var parts = [];
      if (gutterV > 0) parts.push(unit(gutterV) + ' vertical');
      if (gutterH > 0) parts.push(unit(gutterH) + ' horizontal');
      gutterText = parts.join(', ');
    } else {
      gutterText = 'none';
    }
    panel.appendChild(row('Scrollbar gutter', gutterText));

    // Explain where it sits, but only when there is one. Most elements have no
    // gutter, and a glossary line on every element would be noise.
    if (gutterV > 0 || gutterH > 0) {
      panel.appendChild(note('The space a scrollbar is given. It sits between ' +
        'the inner border edge and the outer padding edge, so it takes from ' +
        'the content area rather than from the padding.'));
    }

    if ((scrollsY || scrollsX) && gutterV <= 0 && gutterH <= 0) {
      panel.appendChild(note('This box scrolls but reserves no gutter, so the ' +
        'scrollbar is an overlay drawn on top. Expect a reserved gutter on ' +
        'Windows, where it would take space from the content.'));
    }
    if (cs.scrollbarGutter && cs.scrollbarGutter !== 'auto') {
      panel.appendChild(note('scrollbar-gutter: ' + cs.scrollbarGutter));
    }

    // --- border ---
    panel.appendChild(row('Border', allZero(bor)
      ? 'none'
      : shorthand(bor) + ' ' + cs.borderTopStyle));

    // --- outline ---
    // Painted outside the border edge and takes no space at all, so it never
    // changes the numbers above or below it
    var ow = px(cs.outlineWidth);
    var ostyle = cs.outlineStyle;
    var ooff = px(cs.outlineOffset);
    if (ostyle === 'none' || ow === 0) {
      panel.appendChild(row('Outline', 'none'));
    } else {
      panel.appendChild(row('Outline', unit(ow) + ' ' + ostyle + ', offset ' + unit(ooff)));
      panel.appendChild(note('Painted outside the border edge and takes no ' +
        'space, so it can sit over a neighbour.' +
        (ooff < 0 ? ' A negative offset pulls it inside the box.' : '')));
    }

    // --- margin ---
    panel.appendChild(row('Margin', allZero(mar) ? 'none' : shorthand(mar)));

    // --- the gap you actually get ---
    // A declared bottom margin is often not the distance to the next box
    var next = el.nextElementSibling;
    while (next && !isRendered(next)) next = next.nextElementSibling;
    if (next) {
      var nextRect = next.getBoundingClientRect();
      var gap = nextRect.top - rect.bottom;
      // Only meaningful when the next box really is below this one
      if (gap >= -1 && nextRect.top >= rect.top) {
        var nextTop = px(getComputedStyle(next).marginTop);
        var declared = mar[2] + nextTop;
        panel.appendChild(row('Gap below', unit(gap)));

        if (Math.abs(gap - declared) > 0.5) {
          var parentDisplay = el.parentElement
            ? getComputedStyle(el.parentElement).display : '';
          if (/flex|grid/.test(parentDisplay)) {
            panel.appendChild(note('Declared ' + unit(mar[2]) + ' + ' +
              unit(nextTop) + ' = ' + unit(declared) + '. This is a ' +
              parentDisplay + ' item, so margins do not collapse and any ' +
              'gap property on the parent is added.'));
          } else if (gap < declared) {
            panel.appendChild(note('Declared ' + unit(mar[2]) + ' + ' +
              unit(nextTop) + ' = ' + unit(declared) + ', but adjacent ' +
              'vertical margins collapse to the larger of the two.'));
          } else {
            panel.appendChild(note('Declared ' + unit(mar[2]) + ' + ' +
              unit(nextTop) + ' = ' + unit(declared) + '. Something else is ' +
              'adding to the gap.'));
          }
        }
      }
    }

    // --- total ---
    // getBoundingClientRect is the border box: content, padding and border,
    // with margin and outline excluded
    panel.appendChild(row('Total', unit(rect.width) + ' × ' + unit(rect.height)));
    panel.appendChild(note('Border box: content, padding and border. Margin ' +
      'and outline are not included.'));

    if (cs.display === 'inline') {
      panel.appendChild(note('Inline box. Vertical padding and margin are ' +
        'drawn but do not push the surrounding lines apart.'));
    }

    var hint = document.createElement('div');
    hint.textContent = 'Click any element. Page activation is blocked. Esc to stop.';
    hint.style.cssText = 'opacity:0.6;font-size:14px;margin-top:10px;' +
      'border-top:1px solid #333;padding-top:8px;';
    panel.appendChild(hint);
  }

  // ---- interaction -------------------------------------------------------

  // The highlight uses a box-shadow rather than an outline. Outline is one of
  // the things this tool measures, so drawing one would sit on top of the
  // page's own and leave no way to tell which ring belongs to the page. A
  // shadow takes no space either, so the numbers are unaffected.
  var prevShadow = '';

  function clearOutline() {
    if (!outlined) return;
    outlined.style.boxShadow = prevShadow;
    outlined = null;
    prevShadow = '';
  }

  function insidePanel(node) {
    return !!(panel && node && panel.contains(node));
  }

  // Pointer activation is suppressed so clicking a link or button inspects it
  // rather than following or pressing it
  function swallow(e) {
    if (insidePanel(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function onClick(e) {
    if (insidePanel(e.target)) return;
    e.preventDefault();
    e.stopPropagation();

    var el = e.target;
    if (!el || el.nodeType !== 1) return;

    clearOutline();
    render(el);

    prevShadow = el.style.boxShadow;
    el.style.boxShadow = '0 0 0 3px ' + BLUE;
    outlined = el;
  }

  function onKey(e) {
    if (e.key === 'Escape') teardown();
  }

  function teardown() {
    var p = document.getElementById(PANEL_ID);
    if (p) p.remove();
    clearOutline();
    document.removeEventListener('mousedown', swallow, true);
    document.removeEventListener('mouseup', swallow, true);
    document.removeEventListener('dblclick', swallow, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey, true);
  }

  panel = buildPanel();

  var intro = document.createElement('div');
  intro.textContent = 'Click any element to inspect its box. ' +
    'Page activation is blocked while this is on. Esc to stop.';
  intro.style.cssText = 'font-size:15px;line-height:1.5;';
  panel.appendChild(intro);

  document.addEventListener('mousedown', swallow, true);
  document.addEventListener('mouseup', swallow, true);
  document.addEventListener('dblclick', swallow, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey, true);
})();
