// Highlight target size
// Flags pointer targets smaller than 24 x 24 CSS pixels, for WCAG 2.2
// 2.5.8 Target Size (Minimum), Level AA.
//
// Warnings only: targets that already meet 24 x 24 are not badged. The summary
// panel reports how many were measured, so nothing is silently skipped.
//
// Nothing here is a pass or a fail. 2.5.8 has exceptions that need human
// judgement, and this tool cannot evaluate any of them:
//   - inline links inside a sentence or block of text
//   - the same function available through another control that is large enough
//   - controls whose size is set by the browser and not modified by the author
//
// It measures the clickable region, not the visible icon, and includes the
// associated <label> where clicking that label activates the control.
//
// Undersized targets inside the viewport then get their real hit area measured
// by hit testing. A 16 x 16 button with a ::before overlay stretching 8px past
// every edge is genuinely 32 x 32 to a pointer, and reading the CSS cannot tell
// you that. Probing with elementFromPoint can, and it gets pointer-events: none
// right for free, which reading the pseudo-element's geometry would not. It also
// catches hit areas extended any other way: transparent padding, a wrapper, an
// overlapping sibling.
//
// Limits worth knowing:
//   - hit testing uses viewport coordinates, so targets scrolled out of view
//     cannot be probed. Those keep their CSS measurement and say so. Scroll and
//     re-run to measure them.
//   - a target whose centre is covered by something else, such as a sticky
//     header or a cookie banner, cannot be probed either. That is reported
//     separately, since scrolling will not help: the cover has to go.
//   - controls that appear dynamically (menus, dialogs, toolbars, popovers)
//     must be open when the bookmarklet runs. Re-run with them open.
//   - only inline onclick is detectable. A <div> wired up with addEventListener
//     is a real pointer target to a user and invisible to this tool, because
//     listeners cannot be enumerated from script. Nothing can fix that from a
//     bookmarklet, so a page built that way will under-report.
(function () {
  var OVERLAY_ID = 'a11y-target-size-overlay';
  var PANEL_ID = 'a11y-target-size-panel';

  // Each run has to undo the previous one. Removing the overlay and panel was
  // not enough: outlines stayed on elements that are no longer flagged, and
  // every run added another Esc listener. The teardown is parked on window so
  // the next run can find it whether or not Esc was pressed.
  if (typeof window.__a11yTargetSize === 'function') {
    try { window.__a11yTargetSize(); } catch (e) {}
  }

  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;' +
    'pointer-events:none;z-index:999999;';
  document.body.appendChild(overlay);

  var BLUE = '#0a558c';
  var AMBER = '#e65100';
  var RED = '#b00020';

  var MIN = 24;
  var RADIUS = MIN / 2;

  var flaggedEls = [];

  var SELECTOR = [
    'a[href]', 'area[href]', 'button', 'input', 'select', 'textarea', 'summary',
    '[role="button" i]', '[role="link" i]', '[role="checkbox" i]', '[role="radio" i]',
    '[role="switch" i]', '[role="tab" i]', '[role="menuitem" i]',
    '[role="menuitemcheckbox" i]', '[role="menuitemradio" i]', '[role="option" i]',
    '[role="treeitem" i]', '[onclick]'
  ].join(',');

  function isRendered(el, rect) {
    if (rect.width === 0 && rect.height === 0) return false;
    return window.getComputedStyle(el).visibility !== 'hidden';
  }

  // A disabled control does not accept a pointer action, so it is not a target.
  // :disabled rather than el.disabled, because a control inside a
  // <fieldset disabled> is disabled without its own property being set. The
  // selector also gets the exception right: a control in the fieldset's first
  // <legend> stays enabled.
  function isDisabled(el) {
    if (el.matches(':disabled')) return true;
    var ariaDisabled = el.getAttribute('aria-disabled');
    return ariaDisabled !== null && ariaDisabled.trim().toLowerCase() === 'true';
  }

  // Nothing inside an inert subtree can be clicked at all, so none of it is a
  // pointer target. Setting el.inert reflects to the attribute, so this catches
  // both the markup and the scripted form.
  function isInert(el) {
    return !!el.closest('[inert]');
  }

  // The visually-hidden pattern clips a focusable element to a pixel so it only
  // appears on focus. A skip link measured in that state is 1 x 1, which is true
  // and useless: in the state a pointer user can reach it, it is a normal size.
  function isVisuallyHidden(el, rect) {
    if (rect.width > 1.5 || rect.height > 1.5) return false;
    var cs = window.getComputedStyle(el);
    return cs.position === 'absolute' || cs.position === 'fixed' ||
      cs.clipPath !== 'none' || (cs.clip && cs.clip !== 'auto');
  }

  // Clicking an associated label activates the control, so the label is part of
  // the target. Only union when the two are adjacent, so a label placed far from
  // its control does not inflate the measurement.
  function unionWithLabels(el, rect) {
    if (!el.labels || !el.labels.length) return rect;
    var box = { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    Array.prototype.forEach.call(el.labels, function (label) {
      var lr = label.getBoundingClientRect();
      if (lr.width === 0 && lr.height === 0) return;
      var gapX = Math.max(0, Math.max(box.left - lr.right, lr.left - box.right));
      var gapY = Math.max(0, Math.max(box.top - lr.bottom, lr.top - box.bottom));
      if (gapX > 12 || gapY > 12) return;
      box.left = Math.min(box.left, lr.left);
      box.top = Math.min(box.top, lr.top);
      box.right = Math.max(box.right, lr.right);
      box.bottom = Math.max(box.bottom, lr.bottom);
    });
    box.width = box.right - box.left;
    box.height = box.bottom - box.top;
    return box;
  }

  // A link inside a sentence has text sitting directly beside it. Comparing the
  // parent's total text is not enough: an icon link whose parent is <body> would
  // match on any page with text elsewhere.
  function isInlineTextLink(el) {
    if (el.tagName.toLowerCase() !== 'a') return false;
    function adjacentText(node) {
      return !!node && node.nodeType === 3 && node.textContent.trim() !== '';
    }
    return adjacentText(el.previousSibling) || adjacentText(el.nextSibling);
  }

  function isNativeControl(el) {
    var tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'select' || tag === 'textarea';
  }

  function circleIntersectsRect(cx, cy, r, box) {
    var nearestX = Math.max(box.left, Math.min(cx, box.right));
    var nearestY = Math.max(box.top, Math.min(cy, box.bottom));
    var dx = cx - nearestX;
    var dy = cy - nearestY;
    return (dx * dx + dy * dy) < (r * r);
  }

  // Collect every pointer target and its measured box
  var targets = [];
  document.querySelectorAll(SELECTOR).forEach(function (el) {
    if (el.tagName.toLowerCase() === 'input' &&
        (el.getAttribute('type') || 'text').toLowerCase() === 'hidden') return;
    if (isDisabled(el) || isInert(el)) return;
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;
    var hidden = isVisuallyHidden(el, rect);
    var box = unionWithLabels(el, rect);
    targets.push({
      el: el,
      box: box,
      cx: box.left + box.width / 2,
      cy: box.top + box.height / 2,
      hidden: hidden,
      // A visually hidden control is not a pointer target in this state, so it
      // is reported on its own terms rather than counted as a tiny one
      undersized: !hidden && (box.width < MIN || box.height < MIN)
    });
  });

  // ---- real hit area, measured rather than inferred ----------------------

  var VIEW_W = document.documentElement.clientWidth;
  var VIEW_H = document.documentElement.clientHeight;

  // We only need to know whether the hit area reaches 24, so there is no point
  // searching further than that past each edge
  var MAX_REACH = MIN;

  function inViewport(x, y) {
    return x >= 0 && y >= 0 && x < VIEW_W && y < VIEW_H;
  }

  // A hit on the element, on anything inside it, or on a label that activates
  // it, all mean the pointer would reach this target
  function isOwnTarget(hit, t) {
    if (!hit) return false;
    if (hit === t.el || t.el.contains(hit)) return true;
    if (t.el.labels) {
      for (var i = 0; i < t.el.labels.length; i++) {
        var l = t.el.labels[i];
        if (hit === l || l.contains(hit)) return true;
      }
    }
    return false;
  }

  // Hit testing snaps to device pixels, so a point a fraction of a pixel outside
  // an element still lands on it. Probing at fractional distances therefore gave
  // every target about a pixel of phantom reach and marked it as extended.
  // Whole-pixel probes with a 2px floor keep that rounding out of the numbers.
  var SLOP = 2;

  // How far the hit area extends past one edge. Binary search, since stepping a
  // pixel at a time across every undersized target on a page adds up. This
  // assumes the hit area is contiguous, which is true of the patterns it is
  // meant to catch; a hit area with a hole in it would read as the near edge.
  function reach(t, dx, dy) {
    var lo = 0, hi = MAX_REACH;
    while (lo < hi) {
      // Probe the far edge of the nth pixel, not its middle. Rounding bleeds
      // outward by up to a pixel on the top and left edges, so probing the
      // middle over-reported and could have cleared a 23px target as 24px. This
      // way the measurement is short by up to a pixel instead, which at worst
      // leaves a warning in place on something that passes.
      var mid = Math.ceil((lo + hi) / 2);
      var x = dx === 0 ? t.cx : (dx > 0 ? t.box.right + mid : t.box.left - mid);
      var y = dy === 0 ? t.cy : (dy > 0 ? t.box.bottom + mid : t.box.top - mid);
      // Outside the viewport we cannot know, so treat it as not reaching. That
      // under-reports rather than over-reports, which is the safe direction.
      if (!inViewport(x, y) || !isOwnTarget(document.elementFromPoint(x, y), t)) {
        hi = mid - 1;
      } else {
        lo = mid;
      }
    }
    return lo < SLOP ? 0 : lo;
  }

  // Returns true when the hit area could actually be measured. The two reasons
  // it cannot are recorded separately, because they call for different actions:
  // an off-screen target needs scrolling, a covered one needs the cover moved.
  function measureHitArea(t) {
    if (!inViewport(t.cx, t.cy)) {
      t.offscreen = true;
      return false;
    }
    // If the centre does not hit the target, something is covering it and any
    // probe result would describe that something instead
    var atCentre = document.elementFromPoint(t.cx, t.cy);
    if (!isOwnTarget(atCentre, t)) {
      t.covered = true;
      t.coveredBy = atCentre;
      return false;
    }

    var up = reach(t, 0, -1);
    var right = reach(t, 1, 0);
    var down = reach(t, 0, 1);
    var left = reach(t, -1, 0);

    if (up + right + down + left > 0) {
      t.box = {
        left: t.box.left - left,
        top: t.box.top - up,
        right: t.box.right + right,
        bottom: t.box.bottom + down,
        width: t.box.width + left + right,
        height: t.box.height + up + down
      };
      t.cx = t.box.left + t.box.width / 2;
      t.cy = t.box.top + t.box.height / 2;
      t.extended = true;
    }
    t.verified = true;
    return true;
  }

  // Measure before anything is drawn, so the overlay cannot be hit tested, and
  // before spacing is calculated, so conflicts use the real boxes
  var clearedCount = 0;
  var offscreenCount = 0;
  var coveredCount = 0;

  targets.forEach(function (t) {
    if (!t.undersized) return;
    if (!measureHitArea(t)) {
      if (t.offscreen) offscreenCount++; else coveredCount++;
      return;
    }
    if (t.box.width >= MIN && t.box.height >= MIN) {
      t.undersized = false;
      clearedCount++;
    }
  });

  // Nested targets share a region, so they are not spacing conflicts
  function isNested(a, b) {
    return a.el.contains(b.el) || b.el.contains(a.el);
  }

  function spacingConflicts(t) {
    var hits = 0;
    targets.forEach(function (other) {
      if (other === t || isNested(t, other)) return;
      if (other.undersized) {
        // two undersized targets conflict when their 24px circles overlap
        var dx = t.cx - other.cx;
        var dy = t.cy - other.cy;
        if (Math.sqrt(dx * dx + dy * dy) < MIN) hits++;
      } else if (circleIntersectsRect(t.cx, t.cy, RADIUS, other.box)) {
        hits++;
      }
    });
    return hits;
  }

  function drawCircle(t, colour) {
    var circle = document.createElement('div');
    circle.style.cssText = 'position:absolute;width:' + MIN + 'px;height:' + MIN + 'px;' +
      'border:2px dashed ' + colour + ';border-radius:50%;box-sizing:border-box;' +
      'pointer-events:none;z-index:999998;';
    circle.style.left = (t.cx - RADIUS + window.scrollX) + 'px';
    circle.style.top = (t.cy - RADIUS + window.scrollY) + 'px';
    overlay.appendChild(circle);
  }

  function badge(t, colour, text) {
    var b = document.createElement('div');
    b.textContent = text;
    b.style.position = 'absolute';
    b.style.background = colour;
    b.style.color = '#ffffff';
    b.style.padding = '2px 6px';
    b.style.fontSize = '14px';
    b.style.fontFamily = 'Arial, sans-serif';
    b.style.borderRadius = '4px';
    b.style.pointerEvents = 'none';
    b.style.zIndex = '999999';
    b.style.maxWidth = '420px';
    b.style.whiteSpace = 'normal';
    b.style.lineHeight = '1.4';
    overlay.appendChild(b);

    // Sit above the target, or below when there is no room
    var height = b.offsetHeight || 24;
    var top = t.box.top - height - 6;
    if (top < 0) top = t.box.bottom + 6;
    b.style.top = (top + window.scrollY) + 'px';
    var left = t.box.left;
    var maxLeft = document.documentElement.clientWidth - (b.offsetWidth || 200) - 6;
    if (left > maxLeft) left = maxLeft;
    if (left < 6) left = 6;
    b.style.left = (left + window.scrollX) + 'px';
  }

  function size(t) {
    return Math.round(t.box.width) + ' \u00d7 ' + Math.round(t.box.height);
  }

  // Naming what is covering a target is the difference between a reader
  // shrugging and a reader knowing which element to go and look at
  function describe(el) {
    if (!el || el.nodeType !== 1) return 'something else';
    var out = '<' + el.tagName.toLowerCase() + '>';
    if (el.id) out = '<' + el.tagName.toLowerCase() + ' id="' + el.id + '">';
    else if (el.className && typeof el.className === 'string' && el.className.trim()) {
      out = '<' + el.tagName.toLowerCase() + ' class="' +
        el.className.trim().split(/\s+/)[0] + '">';
    }
    return out;
  }

  var undersizedCount = 0;
  var conflictCount = 0;
  var hiddenCount = 0;

  // Visually hidden focusable elements get their own badge rather than a
  // warning. Blue is the informational colour: this is not a 2.5.8 finding, it
  // is a note that the tool cannot measure the state a pointer user would see.
  targets.forEach(function (t) {
    if (!t.hidden) return;
    hiddenCount++;
    t.el.style.outline = '3px solid ' + BLUE;
    t.el.style.outlineOffset = '2px';
    flaggedEls.push(t.el);
    badge(t, BLUE, 'Visually hidden until focused, so its size cannot be ' +
      'measured here. Tab to it and re-run.');
  });

  targets.forEach(function (t) {
    if (!t.undersized) return;
    undersizedCount++;

    var hits = spacingConflicts(t);
    var colour = hits > 0 ? RED : AMBER;
    if (hits > 0) conflictCount++;

    var text = size(t) + ' \u2014 under ' + MIN + ' \u00d7 ' + MIN;
    text += hits > 0
      ? '. 24px circle overlaps ' + hits + ' other target' + (hits > 1 ? 's' : '')
      : '. Spacing clear';

    if (isInlineTextLink(t.el)) {
      text += '. Inline text link, exception may apply';
    } else if (isNativeControl(t.el)) {
      text += '. Native control, check whether the author changed its size';
    }

    // Say where the number came from, so an unverified warning is not mistaken
    // for a measured one. The two failures need different actions from the
    // reader, so they must not share a message.
    if (t.offscreen) {
      text += '. Hit area not measured: scroll it into view and re-run';
    } else if (t.covered) {
      text += '. Covered by ' + describe(t.coveredBy) + ' at its centre, so ' +
        'the hit area was not measured';
    } else if (t.extended) {
      text += '. Hit area measured, larger than the visible box';
    }

    t.el.style.outline = '3px solid ' + colour;
    t.el.style.outlineOffset = '2px';
    flaggedEls.push(t.el);

    drawCircle(t, colour);
    badge(t, colour, text);
  });

  // Summary panel. The total matters: it shows nothing was silently skipped.
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
    'background:#222;color:#fff;padding:12px 18px;border-radius:8px;font-size:14px;' +
    'font-family:Arial,sans-serif;line-height:1.6;z-index:999999;pointer-events:none;' +
    'max-width:90vw;box-shadow:0 2px 12px rgba(0,0,0,0.4);';

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
  heading.textContent = 'Target size (2.5.8) \u2014 warnings only';
  heading.style.fontWeight = 'bold';
  heading.style.marginBottom = '6px';
  panel.appendChild(heading);

  line(targets.length + ' pointer target' + (targets.length === 1 ? '' : 's') + ' measured');

  if (clearedCount > 0) {
    line(clearedCount + ' reached ' + MIN + ' \u00d7 ' + MIN +
      ' once the real hit area was measured, so ' +
      (clearedCount === 1 ? 'it is' : 'they are') + ' not flagged');
  }

  if (undersizedCount === 0) {
    line('None under ' + MIN + ' \u00d7 ' + MIN);
  } else {
    var clear = undersizedCount - conflictCount;
    line(undersizedCount + ' under ' + MIN + ' \u00d7 ' + MIN +
      ', of which ' + clear + (clear === 1 ? ' has' : ' have') +
      ' clear spacing', AMBER);
    if (conflictCount > 0) {
      line(conflictCount + ' with a 24px circle overlapping another target', RED);
    }
  }

  if (offscreenCount > 0) {
    line(offscreenCount + ' outside the viewport, measured from CSS only. ' +
      'Scroll ' + (offscreenCount === 1 ? 'it' : 'them') + ' into view and re-run.');
  }

  if (coveredCount > 0) {
    line(coveredCount + ' covered by something else at ' +
      (coveredCount === 1 ? 'its' : 'their') + ' centre, measured from CSS ' +
      'only. Scrolling will not help: close or move whatever is on top.');
  }

  if (hiddenCount > 0) {
    line(hiddenCount + ' visually hidden until focused, so ' +
      (hiddenCount === 1 ? 'its size was' : 'their sizes were') +
      ' not measured', BLUE);
  }

  var note = document.createElement('div');
  note.textContent = 'Warnings, not failures. Exceptions need human judgement. ' +
    'Hit areas are measured inside the viewport only. ' +
    'Re-run with menus and dialogs open, and after scrolling. Esc to clear.';
  note.style.opacity = '0.7';
  note.style.marginTop = '8px';
  note.style.fontSize = '13px';
  panel.appendChild(note);

  document.body.appendChild(panel);

  // One teardown, used by Esc and by the next run. Leaving it on window is what
  // lets a second run clear the first one's outlines and listener.
  function teardown() {
    overlay.remove();
    panel.remove();
    flaggedEls.forEach(function (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    flaggedEls.length = 0;
    document.removeEventListener('keydown', onKey);
    if (window.__a11yTargetSize === teardown) delete window.__a11yTargetSize;
  }

  function onKey(e) {
    if (e.key === 'Escape') teardown();
  }

  document.addEventListener('keydown', onKey);
  window.__a11yTargetSize = teardown;
})();
