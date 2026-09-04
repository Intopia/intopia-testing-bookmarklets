// Highlight document title
// Displays the document title from the <title> element as a fixed banner.
// Flags missing, empty and duplicate title elements.
// Only HTML <title> elements are counted. An SVG <title> is an accessible name
// for the graphic, not a document title, and must not be mistaken for one.
(function(){
  var BANNER_CLASS = 'a11y-doc-title-banner';

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
      'white-space:normal'
    ].join(';');
    document.body.appendChild(banner);
  }

  // querySelectorAll('title') matches SVG <title> too, which would report a
  // page with icon labels as having several document titles.
  var HTML_NS = 'http://www.w3.org/1999/xhtml';
  var titles = Array.prototype.filter.call(
    document.querySelectorAll('title'),
    function (el) { return el.namespaceURI === HTML_NS; }
  );

  if (titles.length === 0) {
    makeBanner('NO DOCUMENT TITLE \u2014 <title> element is missing', '#b00020');
  } else if (titles.length > 1) {
    var firstTitle = titles[0].textContent.trim();
    var msg = 'Warning: ' + titles.length + ' <title> elements found \u2014 only one is valid.';
    if (firstTitle !== '') {
      msg += ' Browsers use: \u201c' + firstTitle + '\u201d';
    }
    makeBanner(msg, '#e65100');
  } else {
    var titleText = titles[0].textContent.trim();
    if (titleText === '') {
      makeBanner('Document title: (empty) \u2014 <title> element is present but has no content', '#b00020');
    } else {
      makeBanner('Document title: \u201c' + titleText + '\u201d', '#1b5e20');
    }
  }

  document.addEventListener('keydown', function onKey(e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.' + BANNER_CLASS).forEach(function(el) { el.remove(); });
    document.removeEventListener('keydown', onKey);
  });
})();
