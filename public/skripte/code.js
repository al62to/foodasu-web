// Seite /c/ (AP-54): liest den Code aus dem Teil der Adresse nach #, zeigt ihn in Vierergruppen und kopiert ihn auf
// Wunsch in die Zwischenablage. Der Teil nach # geht nie an den Server. Das Skript speichert nichts, lädt nichts nach
// und schreibt nur Text (textContent), nie HTML.
(function () {
  var mitCode = document.querySelector('[data-mit-code]');
  var ohneCode = document.querySelector('[data-ohne-code]');
  var feld = document.querySelector('[data-code]');
  var knopf = document.querySelector('[data-kopieren]');
  var play = document.querySelector('[data-fuer-play]');
  var iphone = document.querySelector('[data-fuer-iphone]');

  // Handy erkennen, nur um den passenden Hinweis zu zeigen; ohne Erkennung bleiben beide stehen.
  var kennung = navigator.userAgent || '';
  var istIphone = /iPhone|iPad|iPod/.test(kennung) || (/Macintosh/.test(kennung) && navigator.maxTouchPoints > 1);
  var istPlay = /android/i.test(kennung);
  if (istPlay && iphone) iphone.hidden = true;
  if (istIphone && play) play.hidden = true;

  function zeige() {
    var roh = '';
    try { roh = decodeURIComponent(location.hash.slice(1)); } catch (fehler) { roh = location.hash.slice(1); }
    var code = roh.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 64);
    var gruppen = code.match(/.{1,4}/g) || [];
    var text = gruppen.join('-');
    if (mitCode) mitCode.hidden = !text;
    if (ohneCode) ohneCode.hidden = !!text;
    if (feld) feld.textContent = text;
    if (knopf) knopf.textContent = knopf.getAttribute('data-text');
  }

  function kopiert() {
    knopf.textContent = knopf.getAttribute('data-fertig');
    setTimeout(function () { knopf.textContent = knopf.getAttribute('data-text'); }, 2000);
  }

  if (knopf && feld) {
    knopf.addEventListener('click', function () {
      var text = feld.textContent;
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(kopiert, function () { markiere(); });
      } else {
        markiere();
      }
    });
  }

  // Ohne Zugriff auf die Zwischenablage: den Code markieren, damit er sich von Hand kopieren lässt.
  function markiere() {
    var auswahl = window.getSelection();
    var bereich = document.createRange();
    bereich.selectNodeContents(feld);
    auswahl.removeAllRanges();
    auswahl.addRange(bereich);
  }

  window.addEventListener('hashchange', zeige);
  zeige();
})();
