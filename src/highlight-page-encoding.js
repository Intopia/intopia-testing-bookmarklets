// Highlight page encoding
// Displays the character encoding declaration as a fixed banner.
// Detects both <meta charset> and http-equiv Content-Type forms.
// Flags missing, empty, duplicate, conflicting and non-UTF-8 declarations,
// and declarations outside <head>.
// Where more than one message applies, banners stack vertically.
(function(){
  var BANNER_CLASS = 'a11y-encoding-banner';

  document.querySelectorAll('.' + BANNER_CLASS).forEach(function(el) { el.remove(); });

  var GREEN = '#1b5e20';
  var AMBER = '#e65100';
  var RED = '#b00020';

  var bannerCount = 0;

  function makeBanner(text, colour) {
    var banner = document.createElement('div');
    banner.className = BANNER_CLASS;
    banner.textContent = text;
    banner.style.cssText = [
      'position:fixed',
      'top:' + (20 + bannerCount * 56) + 'px',
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
      'white-space:normal'
    ].join(';');
    document.body.appendChild(banner);
    bannerCount++;
  }

  // UTF-8 has several valid labels in the Encoding Standard
  var UTF8_LABELS = ['utf-8', 'utf8', 'unicode-1-1-utf-8'];

  function isUtf8(value) {
    return UTF8_LABELS.indexOf(value.toLowerCase()) !== -1;
  }

  // 1. All <meta charset="..."> declarations
  var metaCharsets = document.querySelectorAll('meta[charset]');
  var metaCharset = metaCharsets[0] || null;

  // 2. <meta http-equiv="Content-Type" content="...charset=...">
  var metaHttpEquiv = document.querySelector('meta[http-equiv="Content-Type"]');
  var httpEquivCharset = null;
  if (metaHttpEquiv) {
    var content = metaHttpEquiv.getAttribute('content') || '';
    var match = content.match(/charset=([^\s;]+)/i);
    if (match) httpEquivCharset = match[1];
  }

  // 3. More than one <meta charset>. The page still works and the first one
  //    wins, so this is a caution rather than a failure.
  if (metaCharsets.length > 1) {
    var values = Array.prototype.map.call(metaCharsets, function (el) {
      return '"' + el.getAttribute('charset').trim() + '"';
    }).join(', ');
    makeBanner('Warning: ' + metaCharsets.length + ' <meta charset> declarations found (' +
      values + ') \u2014 browsers use the first.', AMBER);
  }

  // 4. Both forms present — check for conflict
  var conflicting = false;
  if (metaCharset && httpEquivCharset) {
    var charsetA = metaCharset.getAttribute('charset').trim();
    var charsetB = httpEquivCharset.trim();
    if (charsetA.toLowerCase() !== charsetB.toLowerCase()) {
      conflicting = true;
      makeBanner(
        'Warning: conflicting charset declarations \u2014 meta charset: "' + charsetA +
        '" and http-equiv: "' + charsetB + '"',
        AMBER
      );
    }
  }

  // 5. Evaluate the primary declaration
  if (!conflicting) {
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
      makeBanner('NO CHARSET DECLARATION \u2014 <meta charset> is missing', RED);
    } else if (value === '') {
      makeBanner('Charset: (empty) \u2014 charset attribute is present but has no value', RED);
    } else if (isUtf8(value)) {
      makeBanner('Charset: "' + value + '" via ' + source, GREEN);
    } else {
      makeBanner('Charset: "' + value + '" via ' + source + ' \u2014 UTF-8 is recommended', AMBER);
    }
  }

  // 6. Warn if the declaration sits outside <head>
  var checkEl = metaCharset || metaHttpEquiv;
  if (checkEl && !checkEl.closest('head')) {
    makeBanner('Warning: charset declaration found outside <head>', AMBER);
  }

  document.addEventListener('keydown', function onKey(e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.' + BANNER_CLASS).forEach(function(el) { el.remove(); });
    document.removeEventListener('keydown', onKey);
  });
})();
