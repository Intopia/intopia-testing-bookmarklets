// Reviewer notes
// Personal workflow bookmarklet for the HTML email accessibility tester.
// Click a test card to add a reviewer note. Esc to deactivate.
// Not part of the public bookmarklet suite.
(function(){
  var ACTIVE_ID = 'a11y-reviewer-active';

  // Toggle off if already running
  if (document.getElementById(ACTIVE_ID)) {
    cleanup();
    return;
  }

  // Indicator banner
  var banner = document.createElement('div');
  banner.id = ACTIVE_ID;
  banner.textContent = 'Reviewer notes active — click any test card to add a note. Esc to stop.';
  banner.style.cssText = [
    'position:fixed',
    'bottom:0',
    'left:0',
    'right:0',
    'background:#4a148c',
    'color:#fff',
    'font-family:Arial,sans-serif',
    'font-size:14px',
    'padding:8px 16px',
    'text-align:center',
    'z-index:999999',
    'pointer-events:none'
  ].join(';');
  document.body.appendChild(banner);

  function addNote(card) {
    var heading = card.querySelector('h3,h2,h4');
    var cardName = heading ? heading.textContent.trim() : 'this card';
    var text = prompt('Add reviewer note for: ' + cardName);
    if (!text || !text.trim()) return;

    // Remove any existing note on this card
    var existing = card.querySelector('.reviewer-note-box');
    if (existing) existing.remove();

    var header = card.querySelector('.test-card__header');
    if (!header) return;

    var box = document.createElement('div');
    box.className = 'reviewer-note-box';
    box.style.cssText = [
      'margin:8px 0 4px 0',
      'padding:10px 14px',
      'border:2px dashed #b45309',
      'border-radius:4px',
      'background:#fffbeb',
      'font-family:Arial,sans-serif',
      'font-size:14px',
      'line-height:1.5',
      'color:#1c1c1c'
    ].join(';');

    var label = document.createElement('span');
    label.textContent = 'Reviewer note: ';
    label.style.cssText = 'font-weight:bold;color:#b45309;';

    var noteText = document.createTextNode(text.trim());

    box.appendChild(label);
    box.appendChild(noteText);
    header.insertAdjacentElement('afterend', box);
  }

  function onClick(e) {
    var card = e.target.closest('.test-card');
    if (!card) return;
    e.preventDefault();
    e.stopPropagation();
    addNote(card);
  }

  function cleanup() {
    var b = document.getElementById(ACTIVE_ID);
    if (b) b.remove();
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') cleanup();
  }

  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey);
})();
