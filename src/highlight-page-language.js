// Highlight page language
// Highlights the lang attribute on the <html> element and any inline lang attributes.
// Validates values against BCP 47. Flags missing, empty, unrecognised and invalid values.
(function(){
var OVERLAY_ID = 'a11y-lang-overlay';
var existing = document.getElementById(OVERLAY_ID);
if (existing) existing.remove();
var docBanners = [];

var overlay = document.createElement('div');
overlay.id = OVERLAY_ID;
overlay.style.position = 'absolute';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '999999';
document.body.appendChild(overlay);

var flaggedEls = [];

var iso639_1 = new Set([
  'aa','ab','ae','af','ak','am','an','ar','as','av','ay','az',
  'ba','be','bg','bh','bi','bm','bn','bo','br','bs',
  'ca','ce','ch','co','cr','cs','cu','cv','cy',
  'da','de','dv','dz','ee','el','en','eo','es','et','eu',
  'fa','ff','fi','fj','fo','fr','fy','ga','gd','gl','gn','gu','gv',
  'ha','he','hi','ho','hr','ht','hu','hy','hz',
  'ia','id','ie','ig','ii','ik','io','is','it','iu',
  'ja','jv','ka','kg','ki','kj','kk','kl','km','kn','ko','kr','ks','ku','kv','kw','ky',
  'la','lb','lg','li','ln','lo','lt','lu','lv',
  'mg','mh','mi','mk','ml','mn','mr','ms','mt','my',
  'na','nb','nd','ne','ng','nl','nn','no','nr','nv','ny',
  'oc','oj','om','or','os','pa','pi','pl','ps','pt','qu',
  'rm','rn','ro','ru','rw','sa','sc','sd','se','sg','si','sk','sl','sm','sn','so',
  'sq','sr','ss','st','su','sv','sw','ta','te','tg','th','ti','tk','tl','tn','to',
  'tr','ts','tt','tw','ty','ug','uk','ur','uz','va','ve','vi','vo',
  'wa','wo','xh','yi','yo','za','zh','zu'
]);

var iso639_23 = new Set([
  'yue','cmn','nan','hak','gan','wuu','fil','tgl','gsw','als',
  'arz','arb','apc','zho','eng','fra','deu','spa','rus','srd',
  'scn','vec','bos','hrv','srp','jbo','ina','ile','ast','oci',
  'cat','haw','mri','smj','sme','sms','smn','tok'
]);

var suggestions = {
  'english':'en','french':'fr','spanish':'es','german':'de','italian':'it',
  'portuguese':'pt','dutch':'nl','russian':'ru','chinese':'zh','japanese':'ja',
  'korean':'ko','arabic':'ar','hindi':'hi','turkish':'tr','polish':'pl',
  'swedish':'sv','danish':'da','norwegian':'no','finnish':'fi','greek':'el',
  'czech':'cs','hungarian':'hu','romanian':'ro','bulgarian':'bg','croatian':'hr',
  'slovak':'sk','slovenian':'sl','ukrainian':'uk','hebrew':'he','thai':'th',
  'vietnamese':'vi','indonesian':'id','malay':'ms','persian':'fa','farsi':'fa',
  'urdu':'ur','bengali':'bn','punjabi':'pa','tamil':'ta','telugu':'te',
  'marathi':'mr','gujarati':'gu','kannada':'kn','malayalam':'ml',
  'sinhalese':'si','burmese':'my','khmer':'km','lao':'lo','tibetan':'bo',
  'mongolian':'mn','georgian':'ka','armenian':'hy','azerbaijani':'az',
  'kazakh':'kk','uzbek':'uz','catalan':'ca','basque':'eu','galician':'gl',
  'welsh':'cy','irish':'ga','scottish':'gd','latin':'la','esperanto':'eo',
  'afrikaans':'af','swahili':'sw','amharic':'am','somali':'so','hausa':'ha',
  'yoruba':'yo','igbo':'ig','zulu':'zu','xhosa':'xh','icelandic':'is',
  'latvian':'lv','lithuanian':'lt','estonian':'et','serbian':'sr',
  'albanian':'sq','macedonian':'mk','bosnian':'bs','belarusian':'be'
};

var GREEN = '#1b5e20';
var BLUE  = '#0a558c';
var AMBER = '#e65100';
var RED   = '#b00020';

function validateLang(value) {
  if (!value || !value.trim()) {
    return { state: 'empty', message: '(empty)' };
  }
  var raw = value.trim();
  var lower = raw.toLowerCase();
  if (suggestions[lower]) {
    return { state: 'invalid', message: '"' + raw + '" \u2014 did you mean "' + suggestions[lower] + '"?' };
  }
  var parts = raw.split('-');
  if (!/^[a-zA-Z]{2,3}$/.test(parts[0])) {
    return { state: 'invalid', message: '"' + raw + '" \u2014 invalid format' };
  }
  var primary = parts[0].toLowerCase();
  if (!iso639_1.has(primary) && !iso639_23.has(primary)) {
    return { state: 'unrecognised', message: '"' + raw + '" \u2014 unrecognised language code' };
  }
  if (parts.length > 1) {
    if (parts[1].toLowerCase() === 'x') {
      return { state: 'valid', message: raw };
    }
    for (var idx = 1; idx < parts.length; idx++) {
      if (!/^[a-zA-Z0-9]{1,8}$/.test(parts[idx])) {
        return { state: 'invalid', message: '"' + raw + '" \u2014 invalid subtag "' + parts[idx] + '"' };
      }
    }
  }
  return { state: 'valid', message: raw };
}

function isRendered(el) {
  // Skip elements inside collapsed <details>
  var ancestor = el.parentElement;
  while (ancestor) {
    if (ancestor.tagName === 'DETAILS' && !ancestor.open) return false;
    ancestor = ancestor.parentElement;
  }
  // Skip elements with zero dimensions (hidden, display:none, etc.)
  var rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return true;
}

function makeDocBanner(text, colour) {
  var banner = document.createElement('div');
  banner.textContent = text;
  banner.style.position = 'fixed';
  banner.style.top = '20px';
  banner.style.left = '50%';
  banner.style.transform = 'translateX(-50%)';
  banner.style.background = colour;
  banner.style.color = '#ffffff';
  banner.style.padding = '8px 16px';
  banner.style.borderRadius = '6px';
  banner.style.fontSize = '16px';
  banner.style.fontFamily = 'Arial, sans-serif';
  banner.style.zIndex = '999999';
  banner.style.pointerEvents = 'none';
  banner.style.maxWidth = '90vw';
  banner.style.textAlign = 'center';
  banner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  document.body.appendChild(banner);
  docBanners.push(banner);
}

function makeBadge(text, colour, el) {
  var bodyRect = document.body.getBoundingClientRect();
  var rect = el.getBoundingClientRect();
  var badge = document.createElement('div');
  badge.textContent = text;
  badge.style.position = 'absolute';
  badge.style.left = (rect.left - bodyRect.left) + 'px';
  badge.style.top = (rect.top - bodyRect.top - 26) + 'px';
  badge.style.background = colour;
  badge.style.color = '#ffffff';
  badge.style.padding = '2px 6px';
  badge.style.fontSize = '14px';
  badge.style.fontFamily = 'Arial, sans-serif';
  badge.style.borderRadius = '4px';
  badge.style.whiteSpace = 'normal';
  badge.style.lineHeight = '1.4';
  badge.style.pointerEvents = 'none';
  badge.style.zIndex = '999999';
  badge.style.maxWidth = '500px';
  overlay.appendChild(badge);
}

function flagElement(el, colour, label) {
  el.style.outline = '3px solid ' + colour;
  el.style.outlineOffset = '2px';
  flaggedEls.push(el);
  makeBadge(label, colour, el);
}

// --- document lang ---
var htmlEl = document.documentElement;
var langAttr = htmlEl.getAttribute('lang');
var xmlLangAttr = htmlEl.getAttribute('xml:lang');
var effectiveLang = langAttr !== null ? langAttr : xmlLangAttr;

if (effectiveLang === null) {
  makeDocBanner('NO DOCUMENT LANG \u2014 lang attribute missing from <html>', RED);
} else {
  var docResult = validateLang(effectiveLang);
  var attrPrefix = (xmlLangAttr !== null && langAttr === null) ? 'xml:lang: ' : 'lang: ';
  if (docResult.state === 'valid') {
    makeDocBanner('Document ' + attrPrefix + docResult.message, GREEN);
  } else if (docResult.state === 'empty') {
    makeDocBanner('Document lang: (empty) \u2014 lang attribute is present but has no value', AMBER);
  } else if (docResult.state === 'unrecognised') {
    makeDocBanner('Document lang: ' + docResult.message, AMBER);
  } else {
    makeDocBanner('Document lang: ' + docResult.message, RED);
  }
}

if (langAttr !== null && xmlLangAttr !== null && langAttr !== xmlLangAttr) {
  makeDocBanner('Warning: lang="' + langAttr + '" and xml:lang="' + xmlLangAttr + '" differ', AMBER);
}

// --- inline lang attributes ---
document.querySelectorAll('[lang],[xml\\:lang]').forEach(function(el) {
  if (el === htmlEl) return;
  if (!isRendered(el)) return; // skip hidden/collapsed elements
  var langVal = el.getAttribute('lang');
  var xmlVal  = el.getAttribute('xml:lang');
  var attrName = langVal !== null ? 'lang' : 'xml:lang';
  var attrValue = langVal !== null ? langVal : xmlVal;
  var inlineResult = validateLang(attrValue);
  if (inlineResult.state === 'valid') {
    flagElement(el, BLUE, attrName + ': ' + inlineResult.message);
  } else if (inlineResult.state === 'empty') {
    flagElement(el, AMBER, attrName + ': (empty)');
  } else if (inlineResult.state === 'unrecognised') {
    flagElement(el, AMBER, attrName + ': ' + inlineResult.message);
  } else {
    flagElement(el, RED, attrName + ': ' + inlineResult.message);
  }
});

// --- Esc to clear ---
function onKey(e) {
  if (e.key !== 'Escape') return;
  overlay.remove();
  docBanners.forEach(function(b) { b.remove(); });
  flaggedEls.forEach(function(el) {
    el.style.outline = '';
    el.style.outlineOffset = '';
  });
  document.removeEventListener('keydown', onKey);
}
document.addEventListener('keydown', onKey);
})();
