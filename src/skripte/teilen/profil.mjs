// Anzeige eines geteilten Profils auf der Seite /p/ (AP-114; Vorgabe der PL vom 08.11.2026, 8.1; Format 3.4). Reines
// ES-Modul ohne DOM: läuft im Browser und in Node (tools/teilen/pruefung.mjs). Die Namen der festen Meiden-Einträge,
// die Arten und die Wörter der Stufen kommen aus src/daten/teilen_profil.json (erzeugt aus der App mit
// tools/teilen/website_exportieren.py --profil, nie von Hand). Feste Einträge (ZUTAT, ERNAEHRUNGSFORM, WEITERE) reisen
// nur mit ihrem Schlüssel; eine eigene Zutat (EIGENE_ZUTAT) trägt ihren Namen im Umschlag.

const EIGENE = 'EIGENE_ZUTAT';

// Die Zeilen der Liste aus m (gelesen nach Format 3.5): { zeilen: [{ schluessel, name, stufe, stufeName }], neuer:
// Zahl der Einträge, die diese Seite nicht zeigen kann }.
// - Eine Zeile braucht eine bekannte Art, eine bekannte Stufe und einen Namen: den aus der App, wenn der Schlüssel ein
//   fester Eintrag ist (er geht vor, wie in der App), sonst bei einer eigenen Zutat den aus dem Umschlag.
// - Was fehlt (unbekannte Art, Stufe oder ein Schlüssel ohne Namen), zählt als Eintrag für eine neuere
//   FoodAsu-Version; so übernimmt auch die App beim Empfangen nur bekannte Arten und Stufen.
// - Ein Schlüssel steht höchstens einmal da (der erste gilt).
// - Reihenfolge: die festen Einträge wie in der App (Zutaten nach der LMIV, Ernährungsformen, Weitere), danach die
//   eigenen Zutaten in der Reihenfolge des Umschlags.
export function profilZeilen(m, profil) {
  const fest = new Map(profil.meiden.map((eintrag, stelle) => [eintrag.kennung, { name: eintrag.name, stelle }]));
  const stufen = new Map(profil.stufen.map((stufe) => [stufe.kennung, stufe.name]));
  const arten = new Set(profil.arten);
  const gesehen = new Set();
  const zeilen = [];
  let neuer = 0;
  for (const [art, schluessel, stufe, name] of m) {
    const katalog = fest.get(schluessel);
    const anzeige = katalog ? katalog.name : art === EIGENE && typeof name === 'string' ? name.trim() : '';
    if (!arten.has(art) || !stufen.has(stufe) || !anzeige) { neuer += 1; continue; }
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    zeilen.push({ schluessel, name: anzeige, stufe, stufeName: stufen.get(stufe), stelle: katalog ? katalog.stelle : Infinity, nummer: zeilen.length });
  }
  zeilen.sort((x, y) => (x.stelle - y.stelle) || (x.nummer - y.nummer));
  return { zeilen: zeilen.map(({ schluessel, name, stufe, stufeName }) => ({ schluessel, name, stufe, stufeName })), neuer };
}

// Anfangsbuchstabe im Kreis wie in der App (avatarInitial im Kern): das erste Zeichen, das Buchstabe oder Ziffer ist,
// groß; ohne solches das erste Zeichen; leer bei leerem Namen. Wird ein Zeichen groß zu mehreren (ß), bleibt es.
export function anfangsbuchstabe(anzeigename) {
  const name = String(anzeigename ?? '').trim();
  if (!name) return '';
  for (const zeichen of name) {
    if (/[\p{L}\p{Nd}]/u.test(zeichen)) {
      const gross = zeichen.toUpperCase();
      return [...gross].length === 1 ? gross : zeichen;
    }
  }
  return [...name][0];
}
