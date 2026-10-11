// Breite eines Textes in Pixeln, wie ihn die Vorschau der Google-Suche setzt: Titel in Arial 20 px, Beschreibung in
// Arial 14 px (AP-18 Nachtrag Meta). Gerechnet wird mit den Vorschüben der Zeichen aus arial.json
// (tools/schrift_breiten.py), ohne Unterschneidung: Das Ergebnis liegt deshalb eher über der echten Breite als
// darunter. Ein Zeichen ohne Eintrag ist ein Fehler, damit keine Breite geschätzt wird.
import arial from './arial.json' with { type: 'json' };

export const GRENZEN = {
  titel: { von: 30, bis: 60, pixel: 580, schrift: 20 },
  beschreibung: { von: 120, bis: 155, pixel: 920, schrift: 14 },
};

// Ausnahme (Nachtrag zu AP-23 Teil A Nr. 4, 11.10.2026): Die Beschreibung von /ueber-foodasu/ ist wörtlich vorgegeben
// und hat 119 Zeichen, eines unter der Grenze. Nur dieser eine Wortlaut darf kürzer sein; ändert er sich, gilt wieder
// die Grenze.
const WOERTLICH_KUERZER = new Set([
  'Wer FoodAsu entwickelt, warum es die App gibt, für wen sie ist und woher die Angaben kommen. Kein Konto, keine Werbung.',
]);

export function breite(text, schrift) {
  let summe = 0;
  for (const zeichen of text) {
    const vorschub = arial.breiten[zeichen];
    if (vorschub == null) throw new Error(`Zeichen ohne Breite in arial.json: „${zeichen}“ in „${text}“`);
    summe += vorschub;
  }
  return Math.round((summe * schrift) / arial.geviert);
}

// Länge in Zeichen und Breite in Pixeln eines Titels oder einer Beschreibung.
export const masse = (text, art) => ({ zeichen: [...text].length, pixel: breite(text, GRENZEN[art].schrift) });

// Liefert die Verstöße gegen die Grenzen als Liste von Sätzen (leer, wenn der Text passt).
export function grenzBefunde(text, art) {
  const grenze = GRENZEN[art];
  const { zeichen, pixel } = masse(text, art);
  const befunde = [];
  if (zeichen < grenze.von && !WOERTLICH_KUERZER.has(text)) befunde.push(`${zeichen} Zeichen, mindestens ${grenze.von}`);
  if (zeichen > grenze.bis) befunde.push(`${zeichen} Zeichen, höchstens ${grenze.bis}`);
  if (pixel > grenze.pixel) befunde.push(`${pixel} Pixel, höchstens ${grenze.pixel}`);
  return befunde;
}
