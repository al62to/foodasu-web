// Bereich "So geht's" (AP-15 Teil B2, Karte C, AP-18 Teil E; neu gebaut in AP-19 Teil G): eine Übersicht und eine
// Seite je Bereich der App, dazu die Seite "Zu Hause schreiben, im Laden abhaken". Die Begriffe stehen so da, wie sie
// in der App heißen (Stand 0.14.3); beschrieben ist nur, was die App kann. Wortregeln nach Konzept v4, Abschnitt 1:
// keine Versprechen, im Zweifel der Hinweis auf die Verpackung.
// Pflege-Regel: Jedes Paket mit einer sichtbaren neuen Funktion zieht neben der Einführung in der App auch das
// passende Kapitel hier nach. Vor jeder Änderung läuft "npm run funktionen"; er hält die Funktionsliste der App
// (einkauf-app/docs/Funktionsliste.md) gegen diese Daten. Alle Texte gehen mit "npm run texte" in die Datei
// Website_Texte_SoGehts.md; geändert wird in src/daten/anleitung/.
//
// Die Kapitel stehen je in einer Datei unter src/daten/anleitung/. Ein Abschnitt ("teile") gehört zu einer Funktion
// der App und hat der Reihe nach: "nutzen" (ein bis zwei Sätze), "wo" (der kurze Weg in der App), "fotos" (höchstens
// ein Bildschirmfoto mit Unterschrift), "liste" (Begriff und Erklärung), "absaetze", "verweis" (ein Link auf eine
// andere Stelle der Anleitung) und "extern" (ein Link nach außen). Alles außer Titel und Anker kann fehlen.
// Zuschnitt (Entscheidung vom 10.10.2026): Die Anleitung zeigt, was die App kann und wo man es findet. Sie nennt
// keine nummerierten Schrittfolgen und keine Regeln, nach denen Urteil, Hinweise oder Sortierung entstehen. Bilder
// gibt es nur bei den wichtigen Funktionen, höchstens eines je Abschnitt und höchstens 45 im ganzen Bereich.
//
// Anker: Jeder Abschnitt hat einen festen Anker ("anker"). Ab 0.15 öffnet das Fragezeichen der App die Seite zum
// aktuellen Bildschirm; Adressen und Anker bleiben deshalb gleich, auch wenn sich ein Titel ändert. "alteAnker" nennt
// Sprungmarken aus der Fassung vor AP-19, die weiter ankommen sollen. "funktionen" nennt die Kennungen aus der
// Funktionsliste der App, die der Abschnitt erklärt.
//
// Gestaltung (AP-19 Teil H): "symbol" nennt das Symbol eines Abschnitts oder Kapitels (src/daten/zeichen.mjs).
// "gross: true" macht aus einem Abschnitt mit Bild eine große Karte; je Kapitel gibt es eine oder zwei. Abschnitte mit
// Bild ohne "gross" sind helle Karten, Abschnitte ohne Bild kompakte Karten in einem Raster, Abschnitte ohne Funktion
// (nur Absätze) ruhige Notizen. "leitbild" nennt das Bild eines Kapitels, das seine Karte in der Übersicht zeigt.
// An Texten, Ankern und an der Reihenfolge ändert das nichts.
//
// Bilder: Bildschirmfotos der Play-Fassung mit dem erfundenen Beispielhaushalt (Mia, Jonas, Elif); Namen, Marken und
// Fotos von Produkten sind unkenntlich. Sie liegen unter public/bilder/sogehts und entstehen mit
// tools/sogehts_fotos.py; Maße und Bildbeschreibung stehen in sogehts_fotos.json. "film" nennt eine kurze Schleife
// ohne Ton (WebM, tools/sogehts_bilder.py), die nur mit Bewegung läuft; ohne Bewegung steht ihr Standbild da.
import ersteSchritte from './anleitung/erste-schritte.mjs';
import haushalt from './anleitung/haushalt-und-meiden.mjs';
import scannen from './anleitung/scannen-und-urteil.mjs';
import produktkarte from './anleitung/produktkarte.mjs';
import einkaufslisten from './anleitung/einkaufslisten.mjs';
import zuHause from './anleitung/zu-hause-schreiben-im-laden-abhaken.mjs';
import rezepte from './anleitung/rezepte.mjs';
import deineDaten from './anleitung/deine-daten.mjs';
import fotos from './sogehts_fotos.json' with { type: 'json' };
import { zeichen } from './zeichen.mjs';

export const BEREICH = '/so-gehts/';

export const uebersicht = {
  titel: "So geht's",
  vorspann: 'Acht kurze Kapitel mit Bildschirmfotos aus der App, vom ersten Start bis zum Backup. Die Begriffe stehen hier so, wie sie in der App heißen.',
  kapitelWort: 'Kapitel',
  lesen: 'Kapitel lesen',
  hinweis: 'FoodAsu zeigt, was laut Daten in einem Produkt ist. Daten können fehlen oder veraltet sein. Maßgeblich ist immer die Verpackung.',
  fragen: { vor: 'Kurze Antworten auf häufige Fragen stehen unter ', text: 'Fragen', nach: '.', ziel: '/fragen/' },
};

// Texte, die auf jeder Kapitelseite gleich sind.
export const rahmen = {
  uebersicht: 'Alle Kapitel',
  zurueck: 'Voriges Kapitel',
  weiter: 'Nächstes Kapitel',
  inhalt: 'In diesem Kapitel',
  bilder: 'Bildschirmfotos',
  bild: 'Die Bildschirmfotos zeigen die App mit einem erfundenen Beispielhaushalt. Namen, Marken und Fotos von Produkten sind unkenntlich gemacht.',
  filmHinweis: 'Kurze Schleife ohne Ton.',
  wo: 'In der App',
  mehr: 'Weiterlesen',
};

// Reihenfolge der Kapitel. Die Nummer folgt der Stelle in dieser Liste.
export const kapitel = [ersteSchritte, haushalt, scannen, produktkarte, einkaufslisten, zuHause, rezepte, deineDaten]
  .map((eintrag, stelle) => ({ ...eintrag, nummer: stelle + 1 }));

export const adresse = (eintrag) => `${BEREICH}${eintrag.slug}/`;

// Ein Bildschirmfoto mit Maßen und Bildbeschreibung. Ohne eigene Beschreibung gilt der Satz aus dem Verzeichnis.
// "ausschnitt" heißt: Das Bild zeigt nicht den ganzen Bildschirm (es endet über der Tastatur oder ist ein Teil des
// Bildschirms); sein Handy-Rahmen ist dann unten offen.
export function fotoDaten(eintrag) {
  const angaben = fotos[eintrag.datei];
  if (!angaben) throw new Error(`So geht's: Bild ${eintrag.datei} fehlt in sogehts_fotos.json (python tools/sogehts_fotos.py)`);
  return { ...eintrag, name: eintrag.datei.replaceAll('_', '-'), alt: eintrag.alt ?? angaben.zeigt, breite: angaben.breite, hoehe: angaben.hoehe, ausschnitt: angaben.hoehe / angaben.breite < 1.6 };
}

// Alle Bildschirmfotos eines Kapitels in der Reihenfolge der Seite (für Prüfung und Vorschau).
export const fotosVon = (eintrag) => eintrag.teile.flatMap((teil) => teil.fotos ?? []).map(fotoDaten);

// Das Bild, das die Karte eines Kapitels in der Übersicht zeigt: eines der Bilder des Kapitels.
export const leitbildVon = (eintrag) => fotosVon(eintrag).find((foto) => foto.datei === eintrag.leitbild);

// Die drei Handys im Kopf der Übersicht: links, Mitte, rechts. Es sind Bilder aus den Kapiteln.
export const kopfBilder = ['liste_abhaken_02', 'karte_urteil_01', 'rezepte_ansehen_01'];

// Art eines Abschnitts für die Gestaltung: große Karte, helle Karte mit Bild, kompakte Karte oder Notiz.
export const artVon = (teil) => (teil.fotos?.length ? (teil.gross ? 'gross' : 'mittel') : teil.funktionen ? 'klein' : 'notiz');

// ---- Prüfung beim Laden: Jeder Verstoß bricht den Bau ab. ----
const fehler = [];
const slugs = new Set();
for (const eintrag of kapitel) {
  if (slugs.has(eintrag.slug)) fehler.push(`Kapitel doppelt: ${eintrag.slug}`);
  slugs.add(eintrag.slug);
  const anker = new Set();
  for (const teil of eintrag.teile) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(teil.anker ?? '')) fehler.push(`${eintrag.slug}: Abschnitt „${teil.titel}“ ohne gültigen Anker`);
    for (const marke of [teil.anker, ...(teil.alteAnker ?? [])]) {
      if (anker.has(marke)) fehler.push(`${eintrag.slug}: Anker doppelt: ${marke}`);
      anker.add(marke);
    }
    for (const kennung of teil.funktionen ?? []) if (!/^[A-Z]+-\d\d$/.test(kennung)) fehler.push(`${eintrag.slug}#${teil.anker}: Kennung „${kennung}“ hat nicht die Form der Funktionsliste`);
    if (teil.funktionen && !(teil.nutzen && teil.wo)) fehler.push(`${eintrag.slug}#${teil.anker}: Eine Funktion braucht „nutzen“ und „wo“`);
    if ((teil.fotos ?? []).length > 1) fehler.push(`${eintrag.slug}#${teil.anker}: höchstens ein Bild je Abschnitt`);
    for (const feld of ['schritte', 'tipp', 'einleitung']) if (teil[feld]) fehler.push(`${eintrag.slug}#${teil.anker}: Feld „${feld}“ gibt es nicht mehr`);
    if (!zeichen[teil.symbol]) fehler.push(`${eintrag.slug}#${teil.anker}: Symbol „${teil.symbol}“ gibt es nicht (src/daten/zeichen.mjs)`);
    if (teil.gross && !(teil.fotos ?? []).length) fehler.push(`${eintrag.slug}#${teil.anker}: Eine große Karte braucht ein Bild`);
  }
  if (eintrag.bilder) fehler.push(`${eintrag.slug}: Bilder neben dem Text gibt es nicht mehr`);
  if (!zeichen[eintrag.symbol]) fehler.push(`${eintrag.slug}: Symbol „${eintrag.symbol}“ gibt es nicht (src/daten/zeichen.mjs)`);
  const grosse = eintrag.teile.filter((teil) => teil.gross).length;
  if (grosse < 1 || grosse > 2) fehler.push(`${eintrag.slug}: eine oder zwei große Karten je Kapitel, gefunden: ${grosse}`);
  if (!eintrag.teile.some((teil) => (teil.fotos ?? []).some((foto) => foto.datei === eintrag.leitbild))) fehler.push(`${eintrag.slug}: Leitbild „${eintrag.leitbild}“ ist kein Bild des Kapitels`);
}
// Höchstens 45 Bilder im ganzen Bereich, die Schleifen mitgezählt.
export const BILDER_HOECHSTENS = 45;
export const bilderZahl = kapitel.reduce((summe, eintrag) => summe + eintrag.teile.reduce((zahl, teil) => zahl + (teil.fotos ?? []).length, 0) + (eintrag.film ? 1 : 0), 0);
if (bilderZahl > BILDER_HOECHSTENS) fehler.push(`${bilderZahl} Bilder, höchstens ${BILDER_HOECHSTENS}`);
// Verweise innerhalb der Anleitung müssen auf ein Kapitel und, mit Anker, auf einen Abschnitt zeigen.
const ziele = new Set(kapitel.flatMap((eintrag) => [adresse(eintrag), ...eintrag.teile.map((teil) => `${adresse(eintrag)}#${teil.anker}`)]));
for (const eintrag of kapitel) {
  const verweise = [...(eintrag.verweise ?? []), ...eintrag.teile.flatMap((teil) => (teil.verweis ? [teil.verweis] : []))];
  for (const verweis of verweise) {
    if (verweis.ziel.startsWith(BEREICH) && verweis.ziel !== BEREICH && !ziele.has(verweis.ziel)) fehler.push(`${eintrag.slug}: Verweis ins Leere: ${verweis.ziel}`);
  }
}
if (fehler.length) throw new Error(`So geht's (src/daten/anleitung):\n- ${fehler.join('\n- ')}`);
