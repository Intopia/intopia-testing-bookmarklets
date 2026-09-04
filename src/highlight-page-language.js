// Highlight page language
// Highlights the lang attribute on the <html> element and any inline lang attributes.
// Validates against the BCP 47 grammar, which is stable and needs no lists, and
// separately reports whether the primary language subtag is registered.
//
// Two different checks, deliberately kept apart:
//   NOT WELL-FORMED  the tag breaks the BCP 47 syntax. Always an error.
//   UNREGISTERED     the syntax is fine but the primary subtag is not one we know.
// Script, region and variant subtags are checked for well-formedness only.
// Verifying that they are registered would need the IANA registry, which a
// bookmarklet cannot carry, so this tool does not claim to do it.
//
// The code lists below are a convenience snapshot, not authoritative, and will
// drift as the registry changes.
(function(){
var OVERLAY_ID = 'a11y-lang-overlay';
var BANNER_CLASS = 'a11y-lang-banner';

var existing = document.getElementById(OVERLAY_ID);
if (existing) existing.remove();
document.querySelectorAll('.' + BANNER_CLASS).forEach(function(el) { el.remove(); });

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
var bannerCount = 0;

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
  'tr','ts','tt','tw','ty','ug','uk','ur','uz','ve','vi','vo',
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

// Grandfathered tags from BCP 47. All are well-formed but deprecated.
var GRANDFATHERED = new Set([
  'en-gb-oed','i-ami','i-bnn','i-default','i-enochian','i-hak','i-klingon',
  'i-lux','i-mingo','i-navajo','i-pwn','i-tao','i-tay','i-tsu',
  'sgn-be-fr','sgn-be-nl','sgn-ch-de',
  'art-lojban','cel-gaulish','no-bok','no-nyn',
  'zh-guoyu','zh-hakka','zh-min','zh-min-nan','zh-xiang'
]);

var GREEN = '#1b5e20';
var BLUE  = '#0a558c';
var AMBER = '#e65100';
var RED   = '#b00020';

var ALPHA = /^[a-zA-Z]+$/;
var DIGIT = /^[0-9]+$/;
var ALNUM = /^[a-zA-Z0-9]+$/;

// Walks the BCP 47 langtag grammar:
//   language ["-" script] ["-" region] *("-" variant) *("-" extension) ["-" privateuse]
function parseLangtag(tag) {
  var parts = tag.split('-');
  var i = 0;

  var language = parts[i];
  if (!language || !ALPHA.test(language) || language.length < 2 || language.length > 8) {
    return { ok: false, reason: '"' + (language || '') + '" is not a valid primary language subtag' };
  }
  i++;

  // extlang: up to three 3-letter subtags, only after a 2 or 3 letter language
  if (language.length <= 3) {
    var extlangs = 0;
    while (extlangs < 3 && parts[i] && parts[i].length === 3 && ALPHA.test(parts[i])) {
      i++;
      extlangs++;
    }
  }

  var script = null;
  if (parts[i] && parts[i].length === 4 && ALPHA.test(parts[i])) {
    script = parts[i];
    i++;
  }

  var region = null;
  if (parts[i] && ((parts[i].length === 2 && ALPHA.test(parts[i])) ||
                   (parts[i].length === 3 && DIGIT.test(parts[i])))) {
    region = parts[i];
    i++;
  }

  var variants = [];
  while (parts[i] && ((parts[i].length >= 5 && parts[i].length <= 8 && ALNUM.test(parts[i])) ||
                      (parts[i].length === 4 && /^[0-9][a-zA-Z0-9]{3}$/.test(parts[i])))) {
    variants.push(parts[i]);
    i++;
  }

  var tailStart = i;

  // extensions: a singleton other than x, then one or more 2-8 character subtags
  while (parts[i] && parts[i].length === 1 && /^[0-9a-wy-zA-WY-Z]$/.test(parts[i])) {
    var singleton = parts[i];
    i++;
    var extCount = 0;
    while (parts[i] && parts[i].length >= 2 && parts[i].length <= 8 && ALNUM.test(parts[i])) {
      i++;
      extCount++;
    }
    if (extCount === 0) {
      return { ok: false, reason: 'extension "' + singleton + '" has no subtags after it' };
    }
  }

  if (parts[i] && /^[xX]$/.test(parts[i])) {
    i++;
    var privCount = 0;
    while (parts[i] && parts[i].length >= 1 && parts[i].length <= 8 && ALNUM.test(parts[i])) {
      i++;
      privCount++;
    }
    if (privCount === 0) {
      return { ok: false, reason: 'private use "x" has no subtags after it' };
    }
  }

  if (i < parts.length) {
    return { ok: false, reason: 'unexpected subtag "' + parts[i] + '"' };
  }

  return {
    ok: true,
    language: language,
    script: script,
    region: region,
    variants: variants,
    // extension and private use subtags, kept so the conventional form can
    // round-trip the whole tag rather than truncating it
    rest: parts.slice(tailStart)
  };
}

// Conventional casing per BCP 47: language lowercase, script Titlecase,
// region UPPERCASE. Case is not significant, so this is a note, not an error.
function conventionalForm(parsed) {
  var out = [parsed.language.toLowerCase()];
  if (parsed.script) {
    out.push(parsed.script.charAt(0).toUpperCase() + parsed.script.slice(1).toLowerCase());
  }
  if (parsed.region) out.push(parsed.region.toUpperCase());
  parsed.variants.forEach(function (v) { out.push(v.toLowerCase()); });
  (parsed.rest || []).forEach(function (v) { out.push(v.toLowerCase()); });
  return out.join('-');
}

function validateLang(rawValue) {
  if (rawValue === null) return { state: 'missing', message: '' };

  // Do not trim silently: whitespace in the attribute value is itself a fault
  if (rawValue !== rawValue.trim()) {
    if (rawValue.trim() === '') {
      return { state: 'empty', message: '(whitespace only)' };
    }
    return {
      state: 'malformed',
      message: '"' + rawValue + '" \u2014 NOT WELL-FORMED: leading or trailing whitespace'
    };
  }

  var raw = rawValue;
  if (raw === '') return { state: 'empty', message: '(empty)' };

  var lower = raw.toLowerCase();

  if (raw.indexOf('_') > -1) {
    return {
      state: 'malformed',
      message: '"' + raw + '" \u2014 NOT WELL-FORMED: subtags are separated by a hyphen, not an underscore. Did you mean "' +
        raw.replace(/_/g, '-') + '"?'
    };
  }

  if (suggestions[lower]) {
    return {
      state: 'malformed',
      message: '"' + raw + '" \u2014 NOT WELL-FORMED: this is a language name, not a code. Did you mean "' +
        suggestions[lower] + '"?'
    };
  }

  if (GRANDFATHERED.has(lower)) {
    return { state: 'deprecated', message: '"' + raw + '" \u2014 grandfathered tag, well-formed but deprecated' };
  }

  // A private use only tag is well-formed but names no language
  if (/^[xX](-[a-zA-Z0-9]{1,8})+$/.test(raw)) {
    return { state: 'privateuse', message: '"' + raw + '" \u2014 private use only, names no language' };
  }

  var parsed = parseLangtag(raw);
  if (!parsed.ok) {
    return { state: 'malformed', message: '"' + raw + '" \u2014 NOT WELL-FORMED: ' + parsed.reason };
  }

  var primary = parsed.language.toLowerCase();
  if (!iso639_1.has(primary) && !iso639_23.has(primary)) {
    return {
      state: 'unregistered',
      message: '"' + raw + '" \u2014 well-formed, but "' + parsed.language + '" is not a language subtag we recognise'
    };
  }

  var conventional = conventionalForm(parsed);
  if (conventional !== raw) {
    return { state: 'valid', message: raw + ' (conventional form: ' + conventional + ')' };
  }
  return { state: 'valid', message: raw };
}

function colourFor(state) {
  if (state === 'valid') return GREEN;
  if (state === 'malformed') return RED;
  return AMBER;
}

function isRendered(el) {
  var ancestor = el.parentElement;
  while (ancestor) {
    if (ancestor.tagName === 'DETAILS' && !ancestor.open) return false;
    ancestor = ancestor.parentElement;
  }
  var rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  return window.getComputedStyle(el).visibility !== 'hidden';
}

// Banners stack rather than overlapping, so every message stays visible
function makeDocBanner(text, colour) {
  var banner = document.createElement('div');
  banner.className = BANNER_CLASS;
  banner.textContent = text;
  banner.style.position = 'fixed';
  banner.style.top = (20 + bannerCount * 56) + 'px';
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
  bannerCount++;
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
  var attrPrefix = (xmlLangAttr !== null && langAttr === null) ? 'xml:lang' : 'lang';
  makeDocBanner('Document ' + attrPrefix + ': ' + docResult.message, colourFor(docResult.state));
}

if (langAttr !== null && xmlLangAttr !== null && langAttr !== xmlLangAttr) {
  makeDocBanner('Warning: lang="' + langAttr + '" and xml:lang="' + xmlLangAttr + '" differ', AMBER);
}

// --- inline lang attributes ---
document.querySelectorAll('[lang],[xml\\:lang]').forEach(function(el) {
  if (el === htmlEl) return;
  if (!isRendered(el)) return;
  var langVal = el.getAttribute('lang');
  var xmlVal  = el.getAttribute('xml:lang');
  var attrName = langVal !== null ? 'lang' : 'xml:lang';
  var attrValue = langVal !== null ? langVal : xmlVal;
  var inlineResult = validateLang(attrValue);
  var colour = inlineResult.state === 'valid' ? BLUE : colourFor(inlineResult.state);
  flagElement(el, colour, attrName + ': ' + inlineResult.message);
});

// --- Esc to clear ---
function onKey(e) {
  if (e.key !== 'Escape') return;
  overlay.remove();
  document.querySelectorAll('.' + BANNER_CLASS).forEach(function(b) { b.remove(); });
  flaggedEls.forEach(function(el) {
    el.style.outline = '';
    el.style.outlineOffset = '';
  });
  document.removeEventListener('keydown', onKey);
}
document.addEventListener('keydown', onKey);
})();
