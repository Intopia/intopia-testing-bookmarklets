// Inspect text styles
// Click any element to see the text styles that actually apply to it.
// A fixed panel reports font, size, weight, style, line height, letter spacing,
// word spacing and colour. Esc to stop, or re-run the bookmarklet to switch off.
//
// While this is active the page is in test mode: pointer activation is blocked,
// so clicking a link or button inspects it instead of following or pressing it.
//
// The font row reports the family that is actually rendering, not the stack the
// author wrote. getComputedStyle returns the whole stack even when the first
// choice is not installed, and document.fonts.check does not help: it reports
// true for a missing family because it accounts for fallback. The only reliable
// test is measuring text on a canvas, which this does.
//
// This is a snapshot, not a verdict. No pass or fail is implied: line height,
// letter spacing and word spacing are shown in both px and their derived form
// so the numbers 1.4.12 Text Spacing cares about are readable at a glance, but
// judging them is left to the person.
(function () {
  var PANEL_ID = 'a11y-text-styles-panel';

  // Re-running switches it off
  if (document.getElementById(PANEL_ID)) {
    teardown();
    return;
  }

  var BLUE = '#0a558c';

  var outlined = null;
  var panel = null;

  // ---- font availability -------------------------------------------------

  var GENERIC = {
    'serif': 1, 'sans-serif': 1, 'monospace': 1, 'cursive': 1, 'fantasy': 1,
    'system-ui': 1, 'ui-serif': 1, 'ui-sans-serif': 1, 'ui-monospace': 1,
    'ui-rounded': 1, 'math': 1, 'emoji': 1, 'fangsong': 1
  };

  var PROBE = 'mmmmmmmmmmlliWW@80';
  var ctx = document.createElement('canvas').getContext('2d');

  function measure(spec) {
    ctx.font = '72px ' + spec;
    return ctx.measureText(PROBE).width;
  }

  // A family that is not installed falls through to the generic beside it, so
  // its measured width matches that generic exactly. Testing against three
  // generics avoids a false negative when a real font happens to share metrics
  // with one of them.
  var BASES = ['monospace', 'sans-serif', 'serif'];

  function isInstalled(family) {
    var quoted = '"' + family.replace(/["']/g, '') + '"';
    for (var i = 0; i < BASES.length; i++) {
      if (measure(quoted + ',' + BASES[i]) !== measure(BASES[i])) return true;
    }
    return false;
  }

  function splitStack(stack) {
    return stack.split(',').map(function (part) {
      return part.trim().replace(/^["']|["']$/g, '');
    }).filter(Boolean);
  }

  // Returns the first family in the stack the browser can actually use
  function resolveFont(stack) {
    var families = splitStack(stack);
    for (var i = 0; i < families.length; i++) {
      var name = families[i];
      if (GENERIC[name.toLowerCase()]) {
        return { name: name, index: i, generic: true, families: families };
      }
      if (isInstalled(name)) {
        return { name: name, index: i, generic: false, families: families };
      }
    }
    return { name: null, index: -1, generic: false, families: families };
  }

  // ---- value formatting --------------------------------------------------

  // getComputedStyle normally returns rgb() or rgba(), but a colour authored in
  // a newer colour space can come back as oklch() or color(), where the numbers
  // are not channels that convert to a hex. Only convert what we recognise, and
  // leave anything else to display as its raw computed value.
  function toHex(rgb) {
    if (!/^rgba?\(/i.test(rgb)) return null;
    var m = rgb.match(/-?\d*\.?\d+%?/g);
    if (!m || m.length < 3) return null;
    var hex = '#';
    for (var i = 0; i < 3; i++) {
      if (m[i].slice(-1) === '%') return null;
      var v = Math.max(0, Math.min(255, Math.round(parseFloat(m[i]))));
      hex += ('0' + v.toString(16)).slice(-2);
    }
    return hex.toUpperCase();
  }

  // Alpha is the fourth component where there is one, so the components have to
  // be counted. Matching the last number before the closing bracket instead read
  // the blue channel of rgb(0, 0, 0) and reported pure black as fully
  // transparent.
  function alphaOf(colour) {
    if (!/^rgba?\(/i.test(colour)) return 1;
    var m = colour.match(/-?\d*\.?\d+%?/g);
    if (!m || m.length < 4) return 1;
    var a = m[3];
    return a.slice(-1) === '%' ? parseFloat(a) / 100 : parseFloat(a);
  }

  var WEIGHT_NAMES = {
    '100': 'thin', '200': 'extra light', '300': 'light', '400': 'normal',
    '500': 'medium', '600': 'semibold', '700': 'bold', '800': 'extra bold',
    '900': 'black'
  };

  function px(value) {
    var n = parseFloat(value);
    return isNaN(n) ? null : n;
  }

  // Trim trailing zeros so 19.20px reads as 19.2px
  function num(n, places) {
    return parseFloat(n.toFixed(places === undefined ? 2 : places)) + '';
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

  function row(label, value, swatch) {
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;gap:8px;align-items:baseline;' +
      'padding:3px 0;border-top:1px solid #333;';

    var l = document.createElement('span');
    l.textContent = label;
    l.style.cssText = 'flex:0 0 100px;opacity:0.7;font-size:15px;';

    var v = document.createElement('span');
    v.style.cssText = 'flex:1 1 auto;word-break:break-word;';
    if (swatch) {
      var sw = document.createElement('span');
      // White backing so a semi-transparent colour composites the way it would
      // on a page rather than against this dark panel, and a light border so a
      // dark colour is still visible here.
      sw.style.cssText = 'display:inline-block;width:15px;height:15px;' +
        'border-radius:2px;margin-right:7px;vertical-align:-2px;' +
        'border:1px solid rgba(255,255,255,0.8);background-color:#fff;' +
        'background-image:linear-gradient(' + swatch + ',' + swatch + ');';
      v.appendChild(sw);
    }
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

  function render(el) {
    var cs = getComputedStyle(el);
    panel.textContent = '';

    var heading = document.createElement('div');
    heading.textContent = 'Text styles';
    heading.style.cssText = 'font-weight:bold;margin-bottom:2px;';
    panel.appendChild(heading);

    var who = document.createElement('div');
    who.textContent = describeElement(el);
    who.style.cssText = 'font-family:monospace;font-size:14px;opacity:0.8;' +
      'margin-bottom:8px;word-break:break-all;';
    panel.appendChild(who);

    var size = px(cs.fontSize);

    // Font
    var font = resolveFont(cs.fontFamily);
    var fontText, fontNote = null;
    if (font.name === null) {
      fontText = 'browser default';
      fontNote = 'No family in the stack is available: ' + font.families.join(', ');
    } else {
      fontText = font.name + (font.generic ? ' (generic)' : '');
      if (font.index > 0) {
        fontNote = 'Not available: ' + font.families.slice(0, font.index).join(', ');
      }
    }
    panel.appendChild(row('Font', fontText));
    if (fontNote) panel.appendChild(note(fontNote));

    // Size
    panel.appendChild(row('Size', size === null ? cs.fontSize : num(size) + 'px'));

    // Weight
    var weight = cs.fontWeight;
    var wname = WEIGHT_NAMES[weight];
    panel.appendChild(row('Weight', weight + (wname ? ' (' + wname + ')' : '')));

    // Style. Italic is often applied in CSS rather than with <em> or <i>, so
    // the slant carries no emphasis in the accessibility tree. Reporting the
    // computed value makes that visible without judging it here.
    panel.appendChild(row('Style', cs.fontStyle));

    // Line height, shown as a multiple of the font size as well as px
    var lh = px(cs.lineHeight);
    if (lh === null) {
      panel.appendChild(row('Line height', 'normal'));
    } else if (size) {
      panel.appendChild(row('Line height', num(lh) + 'px (' + num(lh / size) + '× size)'));
    } else {
      panel.appendChild(row('Line height', num(lh) + 'px'));
    }

    // Letter and word spacing, shown in em as well as px
    var ls = px(cs.letterSpacing);
    panel.appendChild(row('Letter sp.',
      ls === null || ls === 0
        ? 'normal (0em)'
        : num(ls) + 'px (' + num(ls / size, 3) + 'em)'));

    var ws = px(cs.wordSpacing);
    panel.appendChild(row('Word sp.',
      ws === null || ws === 0
        ? 'normal (0em)'
        : num(ws) + 'px (' + num(ws / size, 3) + 'em)'));

    // Colour. The rgb value goes underneath rather than alongside, so a long
    // rgba() string does not wrap the row.
    var colour = cs.color;
    var hex = toHex(colour);
    panel.appendChild(row('Colour', hex || colour, colour));
    if (hex) panel.appendChild(note(colour));

    // A hex alone is misleading when the colour is not opaque: what you see is
    // the result of compositing it over whatever sits behind.
    var alpha = alphaOf(colour);
    if (alpha < 1) {
      panel.appendChild(note('Alpha ' + num(alpha, 3) +
        ', so the rendered colour depends on the background.'));
    }

    var hint = document.createElement('div');
    hint.textContent = 'Click any element. Page activation is blocked. Esc to stop.';
    hint.style.cssText = 'opacity:0.6;font-size:14px;margin-top:10px;' +
      'border-top:1px solid #333;padding-top:8px;';
    panel.appendChild(hint);
  }

  // ---- interaction -------------------------------------------------------

  function clearOutline() {
    if (!outlined) return;
    outlined.style.outline = '';
    outlined.style.outlineOffset = '';
    outlined = null;
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
    el.style.outline = '3px solid ' + BLUE;
    el.style.outlineOffset = '2px';
    outlined = el;

    render(el);
  }

  function onKey(e) {
    if (e.key === 'Escape') teardown();
  }

  function teardown() {
    var p = document.getElementById(PANEL_ID);
    if (p) p.remove();
    if (outlined) {
      outlined.style.outline = '';
      outlined.style.outlineOffset = '';
      outlined = null;
    }
    document.removeEventListener('mousedown', swallow, true);
    document.removeEventListener('mouseup', swallow, true);
    document.removeEventListener('dblclick', swallow, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey, true);
  }

  panel = buildPanel();

  var intro = document.createElement('div');
  intro.textContent = 'Click any element to inspect its text styles. ' +
    'Page activation is blocked while this is on. Esc to stop.';
  intro.style.cssText = 'font-size:15px;line-height:1.5;';
  panel.appendChild(intro);

  document.addEventListener('mousedown', swallow, true);
  document.addEventListener('mouseup', swallow, true);
  document.addEventListener('dblclick', swallow, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey, true);
})();
