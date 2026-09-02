// Highlight page encoding
// Displays the character encoding declaration as a fixed banner.
// Detects both <meta charset> and http-equiv Content-Type forms.
// Flags missing, empty and non-UTF-8 declarations.
(function(){
  var BANNER_CLASS = 'a11y-encoding-banner';

  document.querySelectorAll('.' + BANNER_CLASS).forEach(function(el) { el.remove(); });

  function makeBanner(text, colour) {
    var banner = document.createElement('div');
    banner.className = BANNER_CLASS;
    banner.textContent = text;
    banner.style.cssText = [
      'position:fixed',
      'top:20px',
      'left:50%',
      'transform:translateX(-50%)',
      'background:' + colour,
      'color:#ffffff',
      'padding:8px 16px',
      'border-radius:6px',
      'font-size:16px',
      'font-family:Arial,sans-serif',
      'z-index:999999',
      'pointer-events:none',
      'max-width:90vw',
      'text-align:center',
      'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
      'white-space:nowrap'
    ].join(';');
    document.body.appendChild(banner);
  }

  // 1. Check for <meta charset="...">
  var metaCharset = document.querySelector('meta[charset]');

  // 2. Check for <meta http-equiv="Content-Type" content="...charset=...">
  var metaHttpEquiv = document.querySelector('meta[http-equiv="Content-Type"]');
  var httpEquivCharset = null;
  if (metaHttpEquiv) {
    var content = metaHttpEquiv.getAttribute('content') || '';
    var match = content.match(/charset=([^\s;]+)/i);
    if (match) httpEquivCharset = match[1];
  }

  // 3. Both present — check for conflict
  if (metaCharset && metaHttpEquiv && httpEquivCharset) {
    var charsetA = metaCharset.getAttribute('charset').trim();
    var charsetB = httpEquivCharset.trim();
    if (charsetA.toLowerCase() !== charsetB.toLowerCase()) {
      makeBanner(
        'Warning: conflicting charset declarations \u2014 meta charset: "' + charsetA +
        '" and http-equiv: "' + charsetB + '"',
        '#e65100'
      );
      return;
    }
  }

  // 4. Evaluate primary declaration
  var value = null;
  var source = null;

  if (metaCharset) {
    value = metaCharset.getAttribute('charset').trim();
    source = '<meta charset>';
  } else if (httpEquivCharset) {
    value = httpEquivCharset.trim();
    source = 'http-equiv Content-Type';
  }

  if (value === null) {
    makeBanner('NO CHARSET DECLARATION \u2014 <meta charset> is missing', '#b00020');
  } else if (value === '') {
    makeBanner('Charset: (empty) \u2014 charset attribute is present but has no value', '#b00020');
  } else if (value.toUpperCase() === 'UTF-8') {
    makeBanner('Charset: "' + value + '" via ' + source, '#1b5e20');
  } else {
    makeBanner('Charset: "' + value + '" via ' + source + ' \u2014 UTF-8 is recommended', '#e65100');
  }

  // 5. Warn if charset is outside <head>
  var checkEl = metaCharset || metaHttpEquiv;
  if (checkEl && !checkEl.closest('head')) {
    makeBanner('Warning: charset declaration found outside <head>', '#e65100');
  }

  document.addEventListener('keydown', function onKey(e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.' + BANNER_CLASS).forEach(function(el) { el.remove(); });
    document.removeEventListener('keydown', onKey);
  });
})();
