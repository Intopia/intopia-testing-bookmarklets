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

  // Leftover space from a subtraction of rounded integers against fractional
  // borders, so it arrives with sub-pixel noise, and page zoom adds more.
  // Anything under a pixel is that noise rather than reserved space.
  function spare(n) {
    return n < 1 ? 0 : Math.round(n);
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

  // The four directions, in CSS shorthand order. "mine" indexes this element's
  // margin array; "theirs" is the neighbour's facing margin.
  var DIRS = [
    { key: 'above', label: 'Gap above', mine: 'marginTop', theirs: 'marginBottom',
      vertical: true, mineName: 'top', theirsName: 'bottom', neighbour: 'the element above' },
    { key: 'right', label: 'Gap right', mine: 'marginRight', theirs: 'marginLeft',
      vertical: false },
    { key: 'below', label: 'Gap below', mine: 'marginBottom', theirs: 'marginTop',
      vertical: true, mineName: 'bottom', theirsName: 'top', neighbour: 'the element below' },
    { key: 'left', label: 'Gap left', mine: 'marginLeft', theirs: 'marginRight',
      vertical: false }
  ];

  // Which margin wins a collapse depends on the signs, not simply on which is
  // larger. Two positives collapse to the larger, two negatives collapse to the
  // MORE NEGATIVE, and a mixed pair is added. "The larger wins" is the rule
  // everybody remembers and it is only right for the first of those three.
  function collapsed(a, b) {
    if (a >= 0 && b >= 0) return Math.max(a, b);
    if (a < 0 && b < 0) return Math.min(a, b);
    return a + b;
  }

  function collapseNote(mine, theirs, gap, d) {
    var a = 'this element\'s ' + d.mineName + ' margin (' + unit(mine) + ')';
    var b = d.neighbour + '\'s ' + d.theirsName + ' margin (' + unit(theirs) + ')';
    var text;

    if (mine >= 0 && theirs >= 0) {
      text = 'Adjacent vertical margins collapse. Both are positive, so the larger wins: ';
      text += mine === theirs
        ? 'they are equal at ' + unit(mine) + '.'
        : (mine > theirs ? a + ' beats ' + b + '.' : b + ' beats ' + a + '.');
    } else if (mine < 0 && theirs < 0) {
      text = 'Both margins are negative, so they collapse to the more negative ' +
        'of the two rather than the larger: ';
      text += mine === theirs
        ? 'they are equal at ' + unit(mine) + '.'
        : (mine < theirs ? a + ' wins.' : b + ' wins.');
    } else {
      text = 'One margin is negative, so the two are added rather than one ' +
        'winning: ' + unit(mine) + ' + ' + unit(theirs) + ' = ' + unit(mine + theirs) + '.';
    }

    // Collapsing explains the usual case. When the measurement disagrees with
    // it, something else is in play and the note should not pretend otherwise.
    if (Math.abs(gap - collapsed(mine, theirs)) > 0.5) {
      text += ' The measured gap is ' + unit(gap) +
        ', so something else is contributing as well.';
    }
    return text;
  }

  // Nearest rendered sibling in one direction. The box must also overlap on the
  // perpendicular axis, so a sibling sitting in another row or column is not
  // mistaken for a neighbour.
  //
  // A neighbour counts as being in a direction when it STARTS further that way,
  // not when it clears this box entirely. Requiring it to clear the box meant a
  // sibling pulled up by a negative margin, and so overlapping, was reported as
  // no neighbour at all. It is now found and its gap comes out negative, which
  // is the honest description of two boxes that overlap.
  function nearest(el, rect, dir) {
    var sibs = el.parentElement ? el.parentElement.children : [];
    var best = null, bestEdge = 0;

    for (var i = 0; i < sibs.length; i++) {
      var s = sibs[i];
      // The panel is appended to document.body, so it is a sibling of anything
      // at the top level of the page. Measuring the gap to our own panel would
      // be both wrong and hard to spot.
      if (s === el || s === panel || !isRendered(s)) continue;
      var r = s.getBoundingClientRect();
      var edge, closer;

      if (dir === 'above' || dir === 'below') {
        if (r.right <= rect.left + 0.5 || r.left >= rect.right - 0.5) continue;
        if (dir === 'above') {
          if (r.bottom >= rect.bottom - 0.5) continue;
          edge = r.bottom;
          closer = best === null || edge > bestEdge;
        } else {
          if (r.top <= rect.top + 0.5) continue;
          edge = r.top;
          closer = best === null || edge < bestEdge;
        }
      } else {
        if (r.bottom <= rect.top + 0.5 || r.top >= rect.bottom - 0.5) continue;
        if (dir === 'left') {
          if (r.right >= rect.right - 0.5) continue;
          edge = r.right;
          closer = best === null || edge > bestEdge;
        } else {
          if (r.left <= rect.left + 0.5) continue;
          edge = r.left;
          closer = best === null || edge < bestEdge;
        }
      }

      if (closer) { best = s; bestEdge = edge; }
    }

    if (!best) return null;
    var gap = dir === 'above' ? rect.top - bestEdge
            : dir === 'below' ? bestEdge - rect.bottom
            : dir === 'left' ? rect.left - bestEdge
            : bestEdge - rect.right;
    return { el: best, gap: gap };
  }

  // An only child has no siblings to measure against, but the spacing usually
  // lives on an ancestor: a nav link inside its own <li> is the everyday case,
  // where the margin sits on the li and the <a> fills it exactly.
  //
  // Walk up only while the ancestor still occupies the same span on the axis
  // being measured. That way the number reported really is the gap beside this
  // element, rather than some wider wrapper's gap borrowed and mislabelled. A
  // <span> inside a full-width <p> fails the test and gets no row, which is the
  // honest answer.
  function gapFor(el, rect, dir) {
    var node = el, nodeRect = rect, horizontal = (dir === 'left' || dir === 'right');

    // Only a true only child borrows from an ancestor. An element that has
    // siblings but none in this particular direction is at the end of its row
    // or column, and the honest answer there is no row at all rather than a
    // wrapper's gap reported as its own.
    var onlyChild = !!el.parentElement && el.parentElement.children.length === 1;

    for (var depth = 0; depth < 5; depth++) {
      var found = nearest(node, nodeRect, dir);
      if (found) {
        return { el: found.el, gap: found.gap, from: node === el ? null : node };
      }
      if (!onlyChild) return null;
      var parent = node.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) {
        return null;
      }
      var pr = parent.getBoundingClientRect();
      var aligned = horizontal
        ? Math.abs(pr.left - nodeRect.left) < 1 && Math.abs(pr.right - nodeRect.right) < 1
        : Math.abs(pr.top - nodeRect.top) < 1 && Math.abs(pr.bottom - nodeRect.bottom) < 1;
      if (!aligned) return null;
      node = parent;
      nodeRect = pr;
    }
    return null;
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

    // --- scrollbar gutter, or whatever else is holding the space ---
    // Not a CSS property you can read. The only way to it is subtraction: the
    // space between the inner border edge and the outer padding edge.
    // An inline box reports an offset size but a client size of zero, so the
    // subtraction would produce a nonsense figure. Inline boxes never have one.
    var hasClientBox = el.clientWidth > 0 || el.clientHeight > 0;
    var gutterV = hasClientBox
      ? spare(el.offsetWidth - el.clientWidth - bor[1] - bor[3]) : 0;
    var gutterH = hasClientBox
      ? spare(el.offsetHeight - el.clientHeight - bor[0] - bor[2]) : 0;
    var scrollsY = el.scrollHeight > el.clientHeight + 1;
    var scrollsX = el.scrollWidth > el.clientWidth + 1;

    // A box can overflow and still never show a scrollbar. A text input is the
    // everyday example: its overflow computes to clip, so it scrolls as you
    // type without ever drawing a bar. Calling the leftover space a scrollbar
    // gutter there is a claim the tool cannot support, and reading "16px" next
    // to the words "Scrollbar gutter" is exactly how it misleads. So the label
    // itself, not just the note underneath, depends on whether a scrollbar
    // could appear at all.
    var canShowBar = /auto|scroll/.test(cs.overflowY) || /auto|scroll/.test(cs.overflowX);

    var gutterText;
    if (gutterV > 0 || gutterH > 0) {
      var parts = [];
      if (gutterV > 0) parts.push(unit(gutterV) + ' vertical');
      if (gutterH > 0) parts.push(unit(gutterH) + ' horizontal');
      gutterText = parts.join(', ');
    } else {
      gutterText = 'none';
    }
    panel.appendChild(row(canShowBar ? 'Scrollbar gutter' : 'Reserved space',
      gutterText));

    // Explain it, but only when there is some. Most elements have none, and a
    // glossary line on every element would be noise.
    if (gutterV > 0 || gutterH > 0) {
      if (canShowBar) {
        panel.appendChild(note('The space a scrollbar is given. It sits between ' +
          'the inner border edge and the outer padding edge, so it takes from ' +
          'the content area rather than from the padding.'));
      } else {
        // Measured, but it cannot be a scrollbar gutter. Chrome reserves this
        // inside a text input on a system set to always show scrollbars.
        panel.appendChild(note('Not a scrollbar gutter: overflow is "' +
          cs.overflowX + '", so no scrollbar can appear here. The browser or ' +
          'the platform is holding this space for something else.'));
      }
    }

    if ((scrollsY || scrollsX) && gutterV <= 0 && gutterH <= 0) {
      if (canShowBar) {
        panel.appendChild(note('This box scrolls but reserves no gutter, so the ' +
          'scrollbar is an overlay drawn on top. Expect a reserved gutter on ' +
          'Windows, and on macOS when "Show scroll bars" is set to Always.'));
      } else {
        panel.appendChild(note('The content overflows and the box scrolls, but ' +
          'overflow is "' + cs.overflowX + '", so no scrollbar is drawn and no ' +
          'gutter is reserved. This is how a text input behaves.'));
      }
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

    // --- the gaps you actually get, in CSS shorthand order ---
    // A declared margin is often not the distance to the neighbour: vertical
    // margins collapse, and a gap property on a flex or grid parent produces
    // space that appears in no margin at all.
    var anyGap = false;
    var flexNoteShown = false;
    var walkNoted = false;

    DIRS.forEach(function (d) {
      var found = gapFor(el, rect, d.key);
      if (!found) return;
      anyGap = true;
      panel.appendChild(row(d.label, unit(found.gap)));

      // Margins come from whichever element's siblings were actually measured
      var measured = found.from || el;
      if (found.from && !walkNoted) {
        walkNoted = true;
        panel.appendChild(note('<' + el.tagName.toLowerCase() + '> is an only ' +
          'child, so the gaps are measured from <' + found.from.tagName.toLowerCase() +
          '>, the nearest ancestor that has siblings and fills the same box.'));
      }

      var mine = px(getComputedStyle(measured)[d.mine]);
      var theirs = px(getComputedStyle(found.el)[d.theirs]);
      var declared = mine + theirs;

      var mp = measured.parentElement;
      var parentDisplay = mp ? getComputedStyle(mp).display : '';

      if (/flex|grid/.test(parentDisplay)) {
        if (Math.abs(found.gap - declared) <= 0.5) return;
        // The same explanation applies to every direction here, so say it once
        if (flexNoteShown) return;
        flexNoteShown = true;
        panel.appendChild(note('This is a ' + parentDisplay + ' item, so margins ' +
          'do not collapse and any gap property on the parent is added. The ' +
          'space measured here comes from that gap, not from a margin.'));
        return;
      }

      // Two vertical margins meeting is a contest worth narrating, so explain it
      // whenever both are in play, not only when the result surprises
      if (d.vertical && mine !== 0 && theirs !== 0) {
        panel.appendChild(note(collapseNote(mine, theirs, found.gap, d)));
        return;
      }

      if (Math.abs(found.gap - declared) > 0.5) {
        panel.appendChild(note('Declared ' + unit(mine) + ' + ' + unit(theirs) +
          ' = ' + unit(declared) + '. Something else is adding to the gap.'));
      }
    });

    if (anyGap) {
      panel.appendChild(note('Gaps are measured to the nearest sibling in each ' +
        'direction. A neighbour in a different container is not a sibling, so ' +
        'it is not measured here.'));
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
