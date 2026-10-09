// Fremdsprachige Wörter und Namen, die auf allen Seiten ein lang-Attribut bekommen, damit die Sprachausgabe sie in
// der richtigen Sprache liest. Der Bau setzt die Kennzeichnung nach dem Erzeugen der Seiten (tools/sprache_setzen.mjs),
// das Prüfskript meldet jede Stelle ohne Kennzeichnung. Die Marke "FoodAsu" bleibt ohne Kennzeichnung.
import daten from './rezepte.json' with { type: 'json' };

// Namen in lateinischer Umschrift (ko-Latn, ja-Latn, ar-Latn ...): "false" nimmt sie alle aus der Kennzeichnung.
export const umschrift = true;

// Feste Begriffe der Website (Namen von Diensten, Werkzeugen und Lizenzen).
const fest = [
  ['Open Food Facts', 'en'],
  ['Google Play', 'en'],
  ['Play Store', 'en'],
  ['GitHub Pages', 'en'],
  ['GitHub', 'en'],
  ['ML Kit', 'en'],
  ['Meta Platforms Ireland Limited', 'en'],
  ['Meta Platforms, Inc.', 'en'],
  ['Data Privacy Framework', 'en'],
  ['Adobe Firefly', 'en'],
  ['UniTools World Recipes', 'en'],
  ['Creative Commons', 'en'],
  ['SIL Open Font License', 'en'],
  ['MIT License', 'en'],
  ['Standard „no charge“ GSAP License', 'en'],
];

const ausTiteln = daten.rezepte.flatMap((rezept) => rezept.fremd.map((eintrag) => [eintrag.text, eintrag.lang]));

// Längere Begriffe zuerst, damit "Fattet Hummus" vor einem kürzeren Teil greift.
export const begriffe = [...new Map([...fest, ...ausTiteln].map(([text, lang]) => [text, lang]))]
  .filter(([, lang]) => umschrift || !lang.endsWith('-Latn'))
  .map(([text, lang]) => ({ text, lang }))
  .sort((a, b) => b.text.length - a.text.length);
