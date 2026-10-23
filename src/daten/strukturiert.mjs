// Strukturierte Daten zur App an einer Stelle (AP-35A, Alis Wunsch vom 23.10.2026, 20:13). Die App steht genau einmal
// vollständig da, als MobileApplication auf der Startseite mit der festen Kennung APP_ID. Seiten, die von der App
// handeln (Startseite, So geht's, Fragen, Über FoodAsu, Nutzungsbedingungen), verweisen mit "about" auf diese Kennung
// und wiederholen die App nicht.
// Nicht aufgenommen (Wortregel AP-29 und Auftrag): offers, Preis, aggregateRating, Bewertungen, isAccessibleForFree;
// softwareVersion auch nicht, weil sie mit jedem Update veralten würde. termsOfService gibt es bei schema.org nur für
// Organization und Service, nicht für SoftwareApplication und ihre Unterarten; deshalb steht es nicht in der App.
// Was hier steht, prüft tools/pruefe_seiten.mjs unabhängig nach (Abschnitt „Strukturierte Daten zur App“).
import { seite, store } from './seite.mjs';
import { metaVon } from './meta.mjs';
import { standVon } from './stand.mjs';

export const APP_ID = `${seite.adresse}/#app`;
export const WEBSITE_ID = `${seite.adresse}/#website`;
export const ORGANISATION_ID = `${seite.adresse}/#organisation`;
export const ENTWICKLER_ID = `${seite.adresse}/#ali-tonc`;

export const app = {
  // Wortgleich die Kurzbeschreibung des deutschen Store-Eintrags (foodasu-play/Store_Eintrag.md, Fassung AP-33 vom
  // 22.10.2026; so live bei Google Play am 23.10.2026).
  beschreibung: 'Einkaufsliste und Lebensmittel-Scanner für den ganzen Haushalt. Mit Rezepten.',
  // App-Symbol: dieselbe Datei wie das Logo der Organisation (aus dem App-Symbol gebaut, website_bauen.py).
  symbol: '/apple-touch-icon.png',
  // Bildschirmfotos der App, die auf der Website schon stehen (So geht's), keine neuen: Produktkarte mit dem Urteil,
  // Einkaufsliste nach Warengruppen, Reiter Rezepte, Liste einer Person bei „Meiden“.
  bildschirmfotos: [
    '/bilder/sogehts/karte-urteil-01-720.webp',
    '/bilder/sogehts/liste-warengruppen-01-720.webp',
    '/bilder/sogehts/rezepte-ansehen-01-720.webp',
    '/bilder/sogehts/haushalt-liste-01-720.webp',
  ],
  // Öffentlicher Start bei Google Play (AP-34): 23.10.2026, 17:51 Uhr.
  veroeffentlicht: '2026-10-23',
  // Sprachen der App (strings.xml: de mit de-rCH, en) und Länder des Eintrags in Produktion.
  sprachen: ['de', 'en'],
  laender: ['AT', 'DE', 'CH', 'LI'],
  // Aus dem Repository der App, nur gelesen: minSdk 26 in app/build.gradle.kts ist Android 8.0.
  voraussetzung: 'Android 8.0 oder neuer',
  // Berechtigungen der Play-Fassung 0.15.4: CAMERA, INTERNET und VIBRATE aus app/src/main/AndroidManifest.xml,
  // ACCESS_NETWORK_STATE bringen Bibliotheken mit (im Manifest der App als Kommentar vermerkt, im zusammengeführten
  // Manifest der Fassung enthalten).
  berechtigungen: 'Kamera, Internet, Vibration, Netzwerkstatus',
};

// Die App, vollständig, nur auf der Startseite.
export const appDaten = () => ({
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  '@id': APP_ID,
  name: seite.name,
  operatingSystem: 'Android',
  applicationCategory: 'ShoppingApplication',
  description: app.beschreibung,
  url: `${seite.adresse}/`,
  image: seite.adresse + app.symbol,
  screenshot: app.bildschirmfotos.map((pfad) => seite.adresse + pfad),
  datePublished: app.veroeffentlicht,
  inLanguage: app.sprachen,
  countriesSupported: app.laender,
  softwareRequirements: app.voraussetzung,
  permissions: app.berechtigungen,
  author: { '@id': ENTWICKLER_ID },
  publisher: { '@id': ORGANISATION_ID },
  ...(store.oeffentlich ? { installUrl: store.adresse, sameAs: [store.adresse] } : {}),
});

// Der Entwickler: Person „Ali Tonc“ mit der Entwicklerseite bei Google Play (live erreichbar am 23.10.2026), ohne
// Arbeitgeber, Ort oder weitere Profile. Vor dem öffentlichen Start die Seite „Über FoodAsu“.
export const entwicklerDaten = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': ENTWICKLER_ID,
  name: 'Ali Tonc',
  url: store.oeffentlich ? store.entwickler : `${seite.adresse}/ueber-foodasu/`,
});

// Der Verweis auf die App für eine Seite, die von ihr handelt.
export const ueberApp = { about: { '@id': APP_ID } };

// Eine Seite, die von der App handelt, als eigene Angabe (WebPage oder eine Unterart) mit Verweis auf die App.
// "geaendert": dateModified als Tag der letzten Änderung der Quelldateien (wie lastmod in sitemap.xml).
export function seitenDaten(pfad, { art = 'WebPage', geaendert = false } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': art,
    '@id': `${seite.adresse}${pfad}#seite`,
    url: seite.adresse + pfad,
    name: metaVon(pfad).titel,
    inLanguage: seite.sprache,
    isPartOf: { '@id': WEBSITE_ID },
    ...ueberApp,
    ...(geaendert ? { dateModified: standVon(pfad) } : {}),
  };
}
