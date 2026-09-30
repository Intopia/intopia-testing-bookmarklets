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
// Limits worth knowing:
//   - a hit area extended by a ::before or ::after overlay is not measurable,
//     so those read as undersized when they may not be
//   - controls that appear dynamically (menus, dialogs, toolbars, popovers)
//     must be open when the bookmarklet runs. Re-run with them open.
(function () {
  var OVERLAY_ID = 'a11y-target-size-overlay';
  var PANEL_ID = 'a11y-target-size-panel';

  var oldOverlay = document.getElementById(OVERLAY_ID);
  if (oldOverlay) oldOverlay.remove();
  var oldPanel = document.getElementById(PANEL_ID);
  if (oldPanel) oldPanel.remove();

  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;' +
    'pointer-events:none;z-index:999999;';
  document.body.appendChild(overlay);

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

  // A disabled control does not accept a pointer action, so it is not a target
  function isDisabled(el) {
    if (el.disabled) return true;
    var ariaDisabled = el.getAttribute('aria-disabled');
    return ariaDisabled !== null && ariaDisabled.trim().toLowerCase() === 'true';
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
      while (node) {
        if (node.nodeType === 3 && node.textContent.trim() !== '') return true;
        if (node.nodeType === 1) return false;
        node = node.nodeType === 3 ? null : node;
        break;
      }
      return false;
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
    if (isDisabled(el)) return;
    var rect = el.getBoundingClientRect();
    if (!isRendered(el, rect)) return;
    var box = unionWithLabels(el, rect);
    targets.push({
      el: el,
      box: box,
      cx: box.left + box.width / 2,
      cy: box.top + box.height / 2,
      undersized: box.width < MIN || box.height < MIN
    });
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

  var undersizedCount = 0;
  var conflictCount = 0;

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

  if (undersizedCount === 0) {
    line('None under ' + MIN + ' \u00d7 ' + MIN + ' CSS pixels');
  } else {
    line(undersizedCount + ' under ' + MIN + ' \u00d7 ' + MIN +
      ', of which ' + (undersizedCount - conflictCount) + ' have clear spacing', AMBER);
    if (conflictCount > 0) {
      line(conflictCount + ' with a 24px circle overlapping another target', RED);
    }
  }

  var note = document.createElement('div');
  note.textContent = 'Warnings, not failures. Exceptions need human judgement. ' +
    'Re-run with menus and dialogs open. Esc to clear.';
  note.style.opacity = '0.7';
  note.style.marginTop = '8px';
  note.style.fontSize = '13px';
  panel.appendChild(note);

  document.body.appendChild(panel);

  function onKey(e) {
    if (e.key !== 'Escape') return;
    overlay.remove();
    panel.remove();
    flaggedEls.forEach(function (el) {
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    document.removeEventListener('keydown', onKey);
  }
  document.addEventListener('keydown', onKey);
})();
