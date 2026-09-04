// Highlight autocomplete
// Highlights `autocomplete` attributes.
// Flags valid, generic and invalid values with distinct colours.
// Follows the HTML autofill grammar:
//   [section-*] [shipping|billing] [home|work|mobile|fax|pager] field-name [webauthn]
// with `on` and `off` valid only on their own.
(function () {
  var existing = document.getElementById('a11y-autocomplete-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'a11y-autocomplete-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  document.body.appendChild(overlay);

  var flaggedEls = [];

  var FIELD_NAMES = new Set([
    'name', 'honorific-prefix', 'given-name', 'additional-name', 'family-name',
    'honorific-suffix', 'nickname', 'username', 'new-password', 'current-password',
    'one-time-code', 'organization-title', 'organization', 'street-address',
    'address-line1', 'address-line2', 'address-line3',
    'address-level1', 'address-level2', 'address-level3', 'address-level4',
    'country', 'country-name', 'postal-code',
    'cc-name', 'cc-given-name', 'cc-additional-name', 'cc-family-name',
    'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type',
    'transaction-currency', 'transaction-amount', 'language',
    'bday', 'bday-day', 'bday-month', 'bday-year', 'sex',
    'tel', 'tel-country-code', 'tel-national', 'tel-area-code', 'tel-local',
    'tel-local-prefix', 'tel-local-suffix', 'tel-extension',
    'email', 'impp', 'url', 'photo'
  ]);

  // A contact token may only precede a field name in the contact group
  var CONTACT_FIELDS = new Set([
    'tel', 'tel-country-code', 'tel-national', 'tel-area-code', 'tel-local',
    'tel-local-prefix', 'tel-local-suffix', 'tel-extension',
    'email', 'impp'
  ]);

  var CONTACT_TOKENS = new Set(['home', 'work', 'mobile', 'fax', 'pager']);
  var ADDRESS_TYPES = new Set(['shipping', 'billing']);
  var ON_OFF = new Set(['on', 'off']);

  function classify(trimmed) {
    if (trimmed === '') return 'invalid';

    var tokens = trimmed.toLowerCase().split(/\s+/);

    // on and off cannot be combined with any other token
    if (tokens.length === 1 && ON_OFF.has(tokens[0])) return 'generic';
    if (tokens.some(function (t) { return ON_OFF.has(t); })) return 'invalid';

    var i = 0;
    if (tokens[i] && tokens[i].indexOf('section-') === 0) i++;
    if (tokens[i] && ADDRESS_TYPES.has(tokens[i])) i++;

    var hasContactToken = false;
    if (tokens[i] && CONTACT_TOKENS.has(tokens[i])) {
      hasContactToken = true;
      i++;
    }

    var field = tokens[i];
    if (!field || !FIELD_NAMES.has(field)) return 'invalid';
    if (hasContactToken && !CONTACT_FIELDS.has(field)) return 'invalid';
    i++;

    if (tokens[i] === 'webauthn') i++;

    // Exactly one field name, and nothing left over
    return i === tokens.length ? 'valid' : 'invalid';
  }

  document.querySelectorAll('[autocomplete]').forEach(function (el) {
    var trimmed = el.getAttribute('autocomplete').trim();
    var result = classify(trimmed);
    var shown = trimmed === '' ? '(empty)' : trimmed;
    var colour, label;

    if (result === 'valid') {
      colour = '#1b5e20';
      label = 'autocomplete: ' + shown + ' (valid)';
    } else if (result === 'generic') {
      colour = '#0a558c';
      label = 'autocomplete: ' + shown + ' (generic)';
    } else {
      colour = '#b00020';
      label = 'autocomplete: ' + shown + ' (invalid)';
    }

    el.style.outline = '3px solid ' + colour;
    el.style.outlineOffset = '2px';
    flaggedEls.push(el);

    var badge = document.createElement('div');
    badge.textContent = label;
    badge.style.position = 'absolute';
    var rect = el.getBoundingClientRect();
    badge.style.left = (rect.left + window.scrollX) + 'px';
    badge.style.top = (rect.top + window.scrollY - 26) + 'px';
    badge.style.background = colour;
    badge.style.color = '#ffffff';
    badge.style.padding = '2px 6px';
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
    msg.textContent = 'No autocomplete attributes found on this page.';
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
