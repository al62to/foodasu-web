// Prüft die gebaute Website in dist/: Kopfdaten und Aufbau jeder Seite, Links, fremde Adressen, Speicher im Browser,
// strukturierte Daten, Sitemap und die Wortlisten (gesperrte Wörter, Bezahl- und Fristwörter wie in
// texte_pruefen.py, dazu die Wendungen aus dem Nachtrag SEO, Punkt 7). Aufruf nach dem Bau: node tools/pruefe_seiten.mjs
// Mit "--meta <Datei>" schreibt der Lauf dazu die Tabelle aller Titel und Beschreibungen (AP-18 Nachtrag Meta).
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { begriffe } from '../src/daten/sprachen.mjs';
import { AUSDRUCK, durchlaufe } from './sprache_setzen.mjs';
import { muster as nurMuster } from '../src/daten/auswahl.mjs';
import { BEREICH, adresse as kapitelAdresse, fotosVon, kapitel } from '../src/daten/sogehts.mjs';
import { einblick, schritte as startSchritte, zahlen as startZahlen } from '../src/daten/startseite.mjs';
import { EINTRAEGE } from '../src/daten/rezeptseiten.mjs';
import { store, storeLink, STORE_ORTE, KURZLINKS } from '../src/daten/seite.mjs';
import { GRENZEN, grenzBefunde, masse } from '../src/daten/breite.mjs';
import { alleRezepte, zutatenBefunde } from './zutaten_pruefen.mjs';
import { sogehtsLinks } from './sogehts_links.mjs';
import { preisaussagen } from './preisaussagen.mjs';

// Der Ordner der gebauten Website; mit der Umgebungsvariable DIST prüft der Lauf einen anderen Ordner (Vorschau).
const DIST = process.env.DIST ?? 'dist';
const HOST = 'https://foodasu.com';
const OHNE_EINGANG = new Set(['/', '/404.html']);
// Rechtstexte laufen wie in texte_pruefen.py nur durch die Bezahl- und Fristlisten.
const RECHTSTEXTE = new Set(['/datenschutz.html', '/nutzungsbedingungen.html']);
// Nutzungsbedingungen (AP-35A, 23.10.2026; Text wortgleich aus foodasu-play/Nutzungsbedingungen_1.0.md, Alis Ja vom
// 22.10.2026). Wie in texte_pruefen.py: In drei Wortlauten meint „Kauf“ den Einkauf von Lebensmitteln oder das
// UN-Kaufrecht, nicht FoodAsu; nur auf dieser Seite ausgenommen. „Allergien“ steht nur im Satz zum Medizinprodukt
// (wie im Store-Eintrag); steht es anderswo, ist es ein Befund.
const NUTZUNG = '/nutzungsbedingungen.html';
const NUTZUNG_KAUF = ['Lies vor dem Kauf', 'die du tatsächlich kaufst', 'UN-Kaufrechts'];
const NUTZUNG_MEDIZIN = 'FoodAsu ist kein Medizinprodukt und ersetzt bei Allergien oder Unverträglichkeiten keine ärztliche Beratung.';
// Strukturierte Daten zur App (AP-35A, Alis Wunsch vom 23.10.2026, 20:13): Die App steht nur auf der Startseite
// vollständig (MobileApplication mit der Kennung /#app); diese Seiten verweisen mit "about" auf sie, je mit der Art
// ihrer Angabe. Kapitel von "So geht's" kommen unten dazu (Article).
const APP_ID = 'https://foodasu.com/#app';
const SEITEN_DER_APP = new Map([['/', 'WebPage'], ['/so-gehts/', 'CollectionPage'], ['/fragen/', 'FAQPage'], ['/ueber-foodasu/', 'AboutPage'], [NUTZUNG, 'WebPage']]);
const artDerAppSeite = (adresse) => SEITEN_DER_APP.get(adresse) ?? (/^\/so-gehts\/[a-z0-9-]+\/$/.test(adresse) ? 'Article' : null);
// Quelle, Urheber, Lizenz und Änderungen je Rezept (nicht im Index, im Fuß verlinkt).
const QUELLEN = '/quellen-und-lizenzen/';
// Rezepte, die es in der App noch nicht gibt (AP-25): Rezepte aus alten Kochbüchern und neue Rezepte. Gelesen wird die
// Datei selbst, nicht src/daten/rezeptseiten.mjs: Die Prüfung zählt unabhängig vom Bau.
const ZUSATZ = new Map(JSON.parse(readFileSync('src/daten/rezepte_zusatz.json', 'utf8')).rezepte.map((rezept) => [rezept.slug, rezept]));
// Überschrift des Kastens am Ende dieser Rezeptseiten, ohne Punkt wie „Dieses Rezept in FoodAsu“ (Ali, 11.10.2026).
const SPAETER = 'Dieses Rezept kommt später in die App';
const ALTE = '/alte-rezepte/';
// Zeiträume der Rezepte aus alten Kochbüchern in der Reihenfolge des Zeitstrahls und des Filters "Zeit".
const ZEITRAEUME = ['1500er', '1600er und 1700er', '1800er', '1900 bis 1955'];
// Zahlen der App (Projektleitung, 11.10.2026): Auf der Website steht keine Zahl von Rezepten oder Ländern von Hand.
// Gelesen wird src/daten/rezepte.json selbst, nicht src/daten/app_zahlen.mjs: Die Prüfung rechnet unabhängig vom Bau.
// Im Fließtext steht "über N": die Zahl der Rezepte der App, abgerundet auf volle 50 und immer kleiner als die echte
// Zahl (306 ergibt 300, 376 ergibt 350, 350 ergibt 300).
const APP = JSON.parse(readFileSync('src/daten/rezepte.json', 'utf8')).zahlen;
// Einträge zum Meiden der öffentlich verfügbaren Fassung der App (feste Vorgabe, Ali, 14.10.2026): gelesen wird
// src/daten/app_fassung.json selbst (tools/app_fassung_exportieren.py aus dem Repository der App).
const FASSUNG = JSON.parse(readFileSync('src/daten/app_fassung.json', 'utf8'));
const EINTRAEGE_FEST = FASSUNG.eintraegeFest;
const EINTRAEGE_ALLE = FASSUNG.eintraegeFest + FASSUNG.weitereLebensmittel;
const UEBER = Math.floor((APP.gesamt - 1) / 50) * 50;
let spaeterSeiten = 0;

const VOR = '(?<![\\p{L}\\p{N}_])(?:';
const NACH = ')(?![\\p{L}\\p{N}_])';
const muster = (quelle, zeichen = 'giu') => new RegExp(quelle, zeichen);
const GESPERRT = [
  'sicher', 'unbedenklich', 'vertr[aä]glich', 'vertr[aä]gt', 'ges[uü]nd', 'allergi', 'allergen', 'halal-konform',
  'halal-sicher', 'garantiert', 'tracking',
].map((wort) => ['GESPERRT', muster(wort)]);
const BEZAHL_UND_FRIST = [
  ['BEZAHL-WORT', muster(`${VOR}(?:jahres|monats|probe)?abos?|kauf(?:s|es)?|kaufen|käufen?|pricing|for\\s+free|free\\s+of\\s+charge${NACH}`)],
  ['BEZAHL-WORT', muster('premium|abonn|kostenpflichtig|kostenlos|kostenfrei|gratis|gründer|einführungsangebot|rabatt|freischalt|freigeschalt|vollversion|testversion|testphase|probezeit|upgrad|subscri|purchas')],
  ['BEZAHL-WORT', muster(`${VOR}Pro|PRO${NACH}`, 'gu')],
  ['BEZAHL-WORT', muster('(?<!produkt)preis|bezahl|zahlung|entgelt|kost(?:et|en)(?!los|pflichtig|frei)|€')],
  ['BEZAHL-WORT', muster(`${VOR}(?:ge)?k[aä]uf)|${VOR}euros?|cents?${NACH}`)],
  ['BEZAHL-WORT', muster(`${VOR}EUR|CHF${NACH}`, 'gu')],
  ['FRIST-WORT', muster(`${VOR}derzeit(?:ig[\\p{L}]*)?|vorerst|zurzeit|momentan[\\p{L}]*|vorläufig[\\p{L}]*|bis\\s+auf\\s+weiteres${NACH}`)],
];
const BETA = [['BETA-WORT', muster('testfassung')]];
const WENDUNGEN = [
  'heutigen\\s+schnelllebigen', 'tauche\\s+ein', 'entdecke\\s+die\\s+welt', 'nahtlos', 'revolutionär', 'ganzheitlich',
  'egal\\s+ob', 'hier\\s+klicken',
  // AP-25: Die Rezepte aus alten Kochbüchern sind heutige Fassungen nach dem Buch; keine Seite behauptet mehr.
  'nachgekocht',
].map((wort) => ['WENDUNG', muster(wort)]);
// Der Satz zum Medizinprodukt (AP-22 Teil 1 Nr. 6, wörtlich von der Projektleitung) enthält "gesundheitlichen". Nur
// dieser eine Satz ist von der Wortliste ausgenommen; er steht in src/daten/fragen.mjs.
const MEDIZIN = 'FoodAsu ist kein Medizinprodukt und ersetzt keine ärztliche Beratung. Maßgeblich ist immer die Verpackung. Bei gesundheitlichen Fragen wende dich an Fachleute.';
const AUSNAHMEN = ['Pro Portion', 'Pro Stück', 'Bei gesundheitlichen Fragen wende dich an Fachleute.'];
const SPEICHER = /document\.cookie|localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest|\bfetch\(/;
// Die eine Ausnahme (AP-18 Teil C): Der Schalter für helle und dunkle Darstellung liest und schreibt genau einen
// Eintrag "darstellung" im Speicher des Browsers, mit dem Wert "hell" oder "dunkel". Jeder andere Zugriff auf den
// Speicher bleibt ein Befund. Was der Browser wirklich speichert, misst tools/nachweise.mjs.
// Der gebaute Quelltext schreibt Zeichenketten je nach Stelle mit einfachen, doppelten oder schrägen Anführungszeichen.
const DARSTELLUNG_LESEN = /localStorage\.getItem\(\s*(["'`])darstellung\1\s*\)/g;
const DARSTELLUNG_SCHREIBEN = /localStorage\.setItem\(\s*(["'`])darstellung\1\s*,([^()]*)\)/g;
const NUR_HELL_ODER_DUNKEL = /^[\s\w$!?:]*(["'`])(?:dunkel|hell)\1[\s?:]*(["'`])(?:dunkel|hell)\2\s*$/;
// Liefert den Befund eines Skripts zum Speicher oder null. Erlaubt sind nur die beiden Zugriffe des Schalters.
const speicherBefund = (skript) => {
  for (const [, , wert] of skript.matchAll(DARSTELLUNG_SCHREIBEN)) {
    if (!NUR_HELL_ODER_DUNKEL.test(wert)) return `Eintrag "darstellung" mit anderem Wert als "hell" oder "dunkel": ${wert.trim()}`;
  }
  const rest = skript.replace(DARSTELLUNG_LESEN, ' ').replace(DARSTELLUNG_SCHREIBEN, ' ');
  return SPEICHER.test(rest) ? `Speicher oder Anfrage im Skript: ${rest.match(SPEICHER)[0]}` : null;
};

// Knopf "Rezept teilen" (AP-18 Nacharbeiten Teil J): auf jeder Rezeptseite genau einer, sonst nirgends. Geteilt wird
// über das Gerät; Knöpfe, Links oder Skripte von Diensten zum Teilen stehen auf keiner Seite.
const TEILEN_KNOPF = /<button\b([^>]*\bdata-teilen\b[^>]*)>([\s\S]*?)<\/button>/g;
const TEILEN_NAME = 'Rezept teilen';
const TEILEN_DIENSTE = /facebook\.com\/(?:sharer|share|dialog|plugins)|connect\.facebook\.net|wa\.me\/|api\.whatsapp\.com|whatsapp:\/\/|(?:twitter|x)\.com\/(?:intent|share)|t\.me\/share|telegram\.me\/share|pinterest\.[a-z.]+\/pin\/create|linkedin\.com\/(?:shareArticle|sharing)|addthis|sharethis|addtoany/gi;
const IST_REZEPT = /<script type="application\/ld\+json">[^<]*"@type":"Recipe"/;
let teilenKnoepfe = 0;

const fehler = [];
const hinweise = [];
const melde = (ort, text) => fehler.push(`${ort}: ${text}`);

const dateien = [];
(function lauf(ordner) {
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) lauf(pfad);
    else dateien.push(pfad);
  }
})(DIST);

const adresseVon = (datei) => {
  const pfad = '/' + relative(DIST, datei).split(sep).join('/');
  return pfad.endsWith('/index.html') ? pfad.slice(0, -'index.html'.length) : pfad;
};
const seiten = new Map(dateien.filter((d) => d.endsWith('.html')).map((d) => [adresseVon(d), readFileSync(d, 'utf8')]));
const vorhanden = new Set([...seiten.keys(), ...dateien.map((d) => '/' + relative(DIST, d).split(sep).join('/'))]);
// Kurzlinks (AP-45): /fb/, /ig/ und /app/ sind reine Weiterleitungen ohne Kopfdaten einer Seite, ohne Kopf und Fuß. Sie
// laufen nicht durch die Prüfungen der Seiten (Beschreibung, Open Graph, Überschriften ...), sondern durch eigene unten
// (Abschnitt "Kurzlinks") und durch die Prüfung der Links zu Google Play.
const weiterleitungen = new Map();
for (const kurzlink of KURZLINKS) {
  if (seiten.has(kurzlink.pfad)) { weiterleitungen.set(kurzlink.pfad, seiten.get(kurzlink.pfad)); seiten.delete(kurzlink.pfad); }
}
const eingang = new Map([...seiten.keys()].map((adresse) => [adresse, 0]));

const alle = (text, ausdruck) => [...text.matchAll(ausdruck)];
const entschluesselt = (text) =>
  text
    .replace(/&#(\d+);/g, (_, zahl) => String.fromCodePoint(Number(zahl)))
    .replace(/&#x([0-9a-f]+);/gi, (_, zahl) => String.fromCodePoint(parseInt(zahl, 16)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const sichtbar = (html) => {
  let text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ');
  // Auch Texte in Attributen zählen: Beschreibungen für Bildschirmleser und die Kopfdaten.
  const attribute = alle(text, /(?:aria-label|alt|title|content|data-titel|data-text|data-kopiert|data-fehler)="([^"]*)"/g).map((m) => m[1]).join(' \n ');
  text = entschluesselt(text.replace(/<[^>]+>/g, ' ') + ' ' + attribute);
  for (const wendung of AUSNAHMEN) text = text.replaceAll(wendung, ' '.repeat(wendung.length));
  return text;
};

// AP-23 Teil E Nr. 2: Was eine ItemList nennt, steht sichtbar im HTML der Seite: jedes Rezept als Karte mit Link, ohne
// Auswahl und ohne Nachladen, und kein Knopf "mehr anzeigen" vor Inhalten. Die Filtergruppen der Übersicht zählen dabei
// nicht: Dort blendet "Weitere ... anzeigen" nur weitere Möglichkeiten zum Ankreuzen ein, keine Rezepte.
function listeSichtbar(adresse, html, ziele) {
  const inhalt = (html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '').replace(/<div class="f-blatt"[\s\S]*?<div class="f-haupt">/, ' ');
  const nichtGezeigt = ziele.filter((ziel) => !inhalt.includes(`href="${ziel.replace(HOST, '')}"`));
  if (nichtGezeigt.length) melde(adresse, `ItemList nennt ${nichtGezeigt.length} Rezepte, die auf der Seite nicht als Link stehen`);
  const karten = alle(inhalt, /<li\b[^>]*\bclass="r-karte[^"]*"[^>]*>/g).map(([marke]) => marke);
  if (karten.length < ziele.length) melde(adresse, `ItemList nennt ${ziele.length} Rezepte, die Seite zeigt ${karten.length} Karten`);
  if (karten.some((marke) => /\shidden\b|display:\s*none/.test(marke))) melde(adresse, 'eine Rezeptkarte ist im HTML ausgeblendet (ohne Auswahl sind alle Rezepte sichtbar)');
  if (/(?:mehr|weitere)\s+(?:anzeigen|laden)/i.test(sichtbar(inhalt))) melde(adresse, 'Knopf „mehr anzeigen“ vor Inhalten (alle Rezepte stehen sichtbar auf der Seite)');
}

// Kopfdaten je Seite (AP-18 Nachtrag Meta): Titel und Beschreibung vorhanden, eindeutig, in den Grenzen (Zeichen und
// Pixel wie in der Vorschau der Suche, src/daten/breite.mjs) und ohne Wort aus den Wortlisten; kanonische Adresse;
// noindex nur auf den drei genannten Seiten und auf den kleinen Themenseiten (siehe unten), sonst keine Robots-Angabe;
// genau eine h1 und keine Sprünge in der Reihenfolge der Überschriften; Open Graph und Twitter-Karte vollständig, mit einem Bild 1200 x 630 von dieser
// Website. Die Prüfung liest nur die gebauten Seiten, nicht src/daten/meta.mjs.
const OHNE_INDEX = new Set(['/offenlegung/', '/quellen-und-lizenzen/', '/404.html']);
// Themenseiten der Rezepte (AP-22 Teil 1 Nr. 2): Im Index steht eine Themenseite nur mit mindestens sechs Rezepten und
// einem eigenen Einleitungstext. Jede andere trägt "noindex, follow" und fehlt in sitemap.xml und llms.txt; für
// Besucher bleibt sie. Gelesen wird beides aus der gebauten Seite: die Zahl aus der ItemList, der Text aus dem Absatz
// über den Karten. Seiten "Rezepte ohne ..." nennen im Text "als Zutat laut Zutatenliste".
const INDEX_AB = 6;
const EINLEITUNG = /<p class="s-teil t-einleitung">([\s\S]*?)<\/p>/;
const themenSeiten = { imIndex: [], ohneIndex: [] };
const einleitungen = new Map();
for (const [adresse, html] of seiten) {
  if (!adresse.startsWith('/rezepte/') || adresse === '/rezepte/' || IST_REZEPT.test(html)) continue;
  const liste = alle(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
    .map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } })
    .find((block) => block['@type'] === 'ItemList');
  const zahl = liste?.itemListElement?.length ?? 0;
  const text = entschluesselt(html.match(EINLEITUNG)?.[1].replace(/<[^>]+>/g, '').trim() ?? '');
  if (zahl >= INDEX_AB && text) {
    themenSeiten.imIndex.push(adresse);
    if (text.length < 120) melde(adresse, `Einleitungstext zu kurz (${text.length} Zeichen)`);
    if (einleitungen.has(text)) melde(adresse, `Einleitungstext doppelt, auch auf ${einleitungen.get(text)}`);
    einleitungen.set(text, adresse);
    if (/^\/rezepte\/ohne-/.test(adresse) && !text.includes('als Zutat laut Zutatenliste')) melde(adresse, 'Einleitungstext ohne „als Zutat laut Zutatenliste“');
  } else {
    OHNE_INDEX.add(adresse);
    themenSeiten.ohneIndex.push(adresse);
    if (zahl >= INDEX_AB) hinweise.push(`${adresse}: ${zahl} Rezepte, aber kein Einleitungstext; die Seite steht deshalb auf noindex`);
    if (text) melde(adresse, 'Einleitungstext auf einer Seite mit weniger als sechs Rezepten');
  }
}
const TITEL_ZEICHEN = /^[\p{L}\p{N} :|()'-]+$/u;
// Auftrag SEO 1 neu (Projektleitung, 14.10.2026): Der Titel der Startseite beginnt mit "Einkaufslisten-App" und bleibt
// in diesem Wortlaut ohne Marke, obwohl er 67 Zeichen und 628 Pixel hat. Nur genau dieser Titel auf genau dieser Seite
// ist von den Grenzen ausgenommen; die Prüfung wertet ihn nicht als Fehler. Den Namen tragen og:site_name und
// WebSite.name (beides unten geprüft).
const TITEL_START = 'Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt';
const META_WORTE = [['LADEN-WORT', muster('herunterladen|herunter\\s+laden|download|jetzt\\s+laden|jetzt\\s+holen')]];
const TEILEN = { breite: 1200, hoehe: 630, gemeinsam: '/bilder/foodasu-teilen.jpg' };
const inhaltVon = (html, name) => {
  const treffer = alle(html, new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`, 'g'));
  return treffer.length === 1 ? entschluesselt(treffer[0][1]) : null;
};
// Maße einer JPEG-Datei aus ihrem Rahmen-Abschnitt (SOF), oder null.
const jpegMasse = (daten) => {
  if (daten[0] !== 0xff || daten[1] !== 0xd8) return null;
  for (let ort = 2; ort + 9 < daten.length;) {
    if (daten[ort] !== 0xff) return null;
    const art = daten[ort + 1];
    if (art >= 0xc0 && art <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(art)) return { hoehe: daten.readUInt16BE(ort + 5), breite: daten.readUInt16BE(ort + 7) };
    ort += 2 + daten.readUInt16BE(ort + 2);
  }
  return null;
};
const gesehen = { titel: new Map(), beschreibung: new Map() };
const metaZeilen = [];

for (const [adresse, html] of seiten) {
  const titelTreffer = alle(html, /<title>([^<]*)<\/title>/g);
  const titel = titelTreffer.length === 1 ? entschluesselt(titelTreffer[0][1]) : '';
  if (!titel.trim()) melde(adresse, 'genau ein Titel erwartet');
  const beschreibung = inhaltVon(html, 'description') ?? '';
  if (!beschreibung.trim()) melde(adresse, 'genau eine Beschreibung erwartet');
  for (const [art, text] of [['titel', titel], ['beschreibung', beschreibung]]) {
    if (!text.trim()) continue;
    const ausnahme = art === 'titel' && adresse === '/' && text === TITEL_START;
    if (!ausnahme) for (const befund of grenzBefunde(text, art)) melde(adresse, `${art === 'titel' ? 'Titel' : 'Beschreibung'} „${text}“: ${befund}`);
    if (gesehen[art].has(text)) melde(adresse, `${art === 'titel' ? 'Titel' : 'Beschreibung'} doppelt, auch auf ${gesehen[art].get(text)}`);
    gesehen[art].set(text, adresse);
    // Auch die Kopfdaten der Rechtstexte laufen durch alle Wortlisten.
    for (const [sorte, ausdruck] of [...GESPERRT, ...BEZAHL_UND_FRIST, ...BETA, ...WENDUNGEN, ...META_WORTE]) {
      for (const fund of alle(text, ausdruck)) melde(adresse, `${sorte} in ${art === 'titel' ? 'Titel' : 'Beschreibung'}: ${fund[0]}`);
    }
  }
  if (titel && !TITEL_ZEICHEN.test(titel)) melde(adresse, `Titel mit einem Zeichen, das nicht erlaubt ist: „${titel}“`);
  if (beschreibung.includes('"')) melde(adresse, 'Beschreibung mit geradem Anführungszeichen');
  if (beschreibung && !/[.?!]$/.test(beschreibung)) melde(adresse, 'Beschreibung endet nicht mit einem Satzzeichen');
  if (/^\/rezepte\/(ohne-|vegetarisch|vegan)/.test(adresse) && !(beschreibung.includes('laut Zutatenliste') && beschreibung.includes('Verpackung'))) {
    melde(adresse, 'Beschreibung ohne „laut Zutatenliste“ oder ohne den Hinweis auf die Verpackung');
  }
  const kanonisch = alle(html, /<link rel="canonical" href="([^"]*)"/g);
  if (kanonisch.length !== 1 || kanonisch[0][1] !== HOST + adresse) melde(adresse, `kanonische Adresse erwartet: ${HOST + adresse}`);
  const robots = alle(html, /<meta name="robots" content="([^"]*)"/g);
  if (OHNE_INDEX.has(adresse)) {
    if (robots.length !== 1 || robots[0][1] !== 'noindex, follow') melde(adresse, 'Robots-Angabe "noindex, follow" erwartet');
  } else if (robots.length > 0) melde(adresse, `Robots-Angabe gehört nicht auf diese Seite: ${robots[0][1]}`);
  if (alle(html, /<h1[\s>]/g).length !== 1) melde(adresse, 'genau eine Überschrift h1 erwartet');
  // Überschrift mit Suchwort (AP-22, Wunsch Ali vom 10.10.2026): Auf jeder Seite im Index hat die h1 mindestens drei
  // Wörter; ein einzelnes Wort wie "Rezepte" reicht nicht. Rezeptseiten tragen dazu die Vorzeile "Rezept".
  const h1Text = entschluesselt((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  if (!OHNE_INDEX.has(adresse) && !RECHTSTEXTE.has(adresse) && adresse !== '/lizenzen/' && h1Text.split(' ').length < 3) melde(adresse, `Überschrift h1 ohne Suchwort (weniger als drei Wörter): „${h1Text}“`);
  if (IST_REZEPT.test(html) && !h1Text.startsWith('Rezept : ') && !h1Text.startsWith('Rezept: ')) melde(adresse, `Überschrift h1 der Rezeptseite ohne die Vorzeile „Rezept“: „${h1Text}“`);
  const stufen = alle(html, /<h([1-6])[\s>]/g).map((treffer) => Number(treffer[1]));
  if (stufen[0] !== 1) melde(adresse, 'die erste Überschrift der Seite ist nicht die h1');
  stufen.forEach((stufe, nummer) => {
    if (nummer > 0 && stufe - stufen[nummer - 1] > 1) melde(adresse, `Sprung in den Überschriften: h${stufen[nummer - 1]} vor h${stufe}`);
  });
  if (!/<html lang="de"/.test(html)) melde(adresse, 'lang="de" fehlt');

  // Open Graph und Twitter-Karte
  const istRezept = IST_REZEPT.test(html);
  const bildPfad = istRezept ? `/bilder/rezepte/${adresse.split('/').at(-2)}-teilen.jpg` : TEILEN.gemeinsam;
  const teilen = {
    'og:type': istRezept ? 'article' : 'website', 'og:site_name': 'FoodAsu', 'og:locale': 'de_DE', 'og:title': titel,
    'og:description': beschreibung, 'og:url': HOST + adresse, 'og:image': HOST + bildPfad,
    'og:image:width': String(TEILEN.breite), 'og:image:height': String(TEILEN.hoehe),
    'twitter:card': 'summary_large_image', 'twitter:title': titel, 'twitter:description': beschreibung, 'twitter:image': HOST + bildPfad,
  };
  for (const [name, wert] of Object.entries(teilen)) {
    if (inhaltVon(html, name) !== wert) melde(adresse, `${name}: erwartet „${wert}“, gefunden „${inhaltVon(html, name)}“`);
  }
  for (const name of ['og:image:alt', 'twitter:image:alt']) if (!inhaltVon(html, name)?.trim()) melde(adresse, `${name} fehlt`);
  // Sprache ohne Region (Nachtrag zu AP-23 Teil A Nr. 10): de_DE, dazu de_AT und de_CH als gleichwertige Angaben.
  const weitereSprachen = alle(html, /<meta property="og:locale:alternate" content="([^"]*)"/g).map(([, wert]) => wert);
  if (weitereSprachen.join(' ') !== 'de_AT de_CH') melde(adresse, `og:locale:alternate: „de_AT“ und „de_CH“ erwartet, gefunden „${weitereSprachen.join(' ')}“`);
  if (!vorhanden.has(bildPfad)) melde(adresse, `Bild zum Teilen fehlt: ${bildPfad}`);
  else {
    const groesse = jpegMasse(readFileSync(join(DIST, bildPfad)));
    if (!groesse || groesse.breite !== TEILEN.breite || groesse.hoehe !== TEILEN.hoehe) melde(adresse, `Bild zum Teilen ist kein JPEG mit ${TEILEN.breite} x ${TEILEN.hoehe}: ${bildPfad}`);
  }
  metaZeilen.push({ adresse, titel, beschreibung, robots: OHNE_INDEX.has(adresse) ? 'noindex, follow' : 'keine Angabe (im Index)' });

  // Fremde Adressen: Erlaubt sind nur einfache Links (<a href>), die kanonische Adresse und og:url.
  for (const [, marke, adr] of alle(html, /<(script|img|iframe|source|video|audio|embed|object|link)\b[^>]*?(?:src|href|data)="((?:https?:)?\/\/[^"]*)"/g)) {
    if (marke === 'link' && adr === HOST + adresse) continue;
    melde(adresse, `fremde Adresse in <${marke}>: ${adr}`);
  }

  // Links: jedes interne Ziel muss es geben, auch die Sprungmarke.
  for (const [, ziel] of alle(html, /<a\b[^>]*?href="([^"]*)"/g)) {
    if (/^(https?:|mailto:|&#109;)/.test(ziel)) continue;
    const [pfadTeil, marke] = ziel.split('#');
    const pfad = pfadTeil === '' ? adresse : pfadTeil;
    if (!pfad.startsWith('/')) { melde(adresse, `Link ohne Schrägstrich am Anfang: ${ziel}`); continue; }
    if (!vorhanden.has(pfad)) { melde(adresse, `toter Link: ${ziel}`); continue; }
    if (marke && !new RegExp(`id="${marke}"`).test(seiten.get(pfad) ?? '')) melde(adresse, `Sprungmarke fehlt: ${ziel}`);
    if (pfad !== adresse && eingang.has(pfad)) eingang.set(pfad, eingang.get(pfad) + 1);
  }

  // Bilder: Beschreibung und Maße an jedem Bild; jede Bilddatei muss es geben, auch das Bild für Open Graph.
  for (const [marke] of alle(html, /<(?:img|source)\b[^>]*>/g)) {
    if (marke.startsWith('<img')) {
      if (!/\balt="[^"]+"/.test(marke)) melde(adresse, `Bild ohne Beschreibung: ${marke.slice(0, 90)}`);
      if (!/\bwidth="\d+"/.test(marke) || !/\bheight="\d+"/.test(marke)) melde(adresse, `Bild ohne Maße: ${marke.slice(0, 90)}`);
    }
    for (const [, liste] of alle(marke, /\b(?:src|srcset)="([^"]*)"/g)) {
      for (const teil of liste.split(',')) {
        const pfad = teil.trim().split(/\s+/)[0];
        if (pfad && !vorhanden.has(pfad)) melde(adresse, `Bilddatei fehlt: ${pfad}`);
      }
    }
  }
  for (const angabe of ['og:image', 'twitter:image']) {
    const bild = html.match(new RegExp(`="${angabe}" content="([^"]*)"`));
    if (!bild || !bild[1].startsWith(HOST) || !vorhanden.has(bild[1].slice(HOST.length))) melde(adresse, `${angabe} fehlt oder zeigt auf keine Datei`);
  }

  // Strukturierte Daten
  const arten = [];
  for (const [, roh] of alle(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const daten = JSON.parse(roh);
      if (daten['@context'] !== 'https://schema.org' || !daten['@type']) melde(adresse, 'JSON-LD ohne @context oder @type');
      arten.push(daten['@type']);
      if (roh.includes('aggregateRating')) melde(adresse, 'aggregateRating ist nicht erlaubt');
    } catch {
      melde(adresse, 'JSON-LD ist kein gültiges JSON');
    }
  }
  const erwartet = adresse === '/' ? ['WebSite', 'Organization', 'Person', 'MobileApplication', 'VideoObject', 'FAQPage', 'WebPage'] : OHNE_EINGANG.has(adresse) ? [] : ['BreadcrumbList', ...(artDerAppSeite(adresse) ? [artDerAppSeite(adresse)] : [])];
  for (const art of erwartet) if (!arten.includes(art)) melde(adresse, `strukturierte Daten fehlen: ${art}`);
  // Verweis auf die App (AP-35A): Auf jeder Seite, die von der App handelt, verweist die Angabe ihrer Art mit "about"
  // genau auf die Kennung der App; keine andere Seite verweist auf sie.
  {
    const bloecke = alle(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } });
    const verweise = bloecke.filter((block) => block.about?.['@id'] === APP_ID);
    const art = artDerAppSeite(adresse);
    if (art && !verweise.some((block) => block['@type'] === art)) melde(adresse, `strukturierte Daten: ${art} ohne about mit der Kennung der App`);
    if (!art && verweise.length) melde(adresse, 'strukturierte Daten: Verweis auf die App auf einer Seite, die nicht von ihr handelt');
    if (art && bloecke.some((block) => block.about && block.about['@id'] !== APP_ID)) melde(adresse, 'strukturierte Daten: about zeigt nicht auf die Kennung der App');
  }
  // Software-App: seit dem Auftrag SEO 1 neu (14.10.2026) genau eine App-Angabe, seit AP-34 (23.10.2026) als
  // MobileApplication (Unterart von SoftwareApplication), nur auf der Startseite (ohne
  // Angebot, Preis und Bewertung; die Einzelheiten prüft der Abschnitt zur Startseite unten). Sie ist Pflicht und wird
  // nicht entfernt (Nachtrag der PL vom 14.10.2026, 13:10); AP-29 betrifft nur Preisangaben. Jede andere Art, die auf
  // "Application" endet, und jede Software-App auf einer anderen Seite bleibt ein Befund (AP-22, Ali, 10.10.2026).
  for (const art of arten.flat()) {
    if (/Application$/.test(art) && !(adresse === '/' && art === 'MobileApplication')) melde(adresse, `strukturierte Daten: ${art} ist nicht vorgesehen`);
  }
  if (adresse === '/' && arten.flat().filter((art) => art === 'MobileApplication').length !== 1) melde(adresse, 'strukturierte Daten: genau eine MobileApplication erwartet');
  // Brotkrumen: Die strukturierten Daten nennen dieselben Stufen wie die sichtbare Zeile, die letzte ist die Seite.
  const krumenZeile = html.match(/<nav class="krumen[\s\S]*?<\/nav>/)?.[0];
  if (krumenZeile) {
    const sichtbareStufen = alle(krumenZeile, /<li[^>]*>([\s\S]*?)<\/li>/g).map((treffer) => entschluesselt(treffer[1].replace(/<[^>]+>/g, '')).trim());
    const liste = alle(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
      .map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } })
      .find((block) => block['@type'] === 'BreadcrumbList');
    const stufenDaten = (liste?.itemListElement ?? []).map((punkt) => punkt.name);
    if (sichtbareStufen.join(' > ') !== stufenDaten.join(' > ')) melde(adresse, `Brotkrumen: sichtbar „${sichtbareStufen.join(' > ')}“, in den Daten „${stufenDaten.join(' > ')}“`);
    if (liste && liste.itemListElement.at(-1)?.item !== HOST + adresse) melde(adresse, 'Brotkrumen: Die letzte Stufe zeigt nicht auf die Seite selbst');
    if (liste && liste.itemListElement.some((punkt, nummer) => punkt.position !== nummer + 1 || !String(punkt.item).startsWith(HOST))) melde(adresse, 'Brotkrumen: position oder item fehlt');
  }

  // Übersicht der Rezepte: Alle Rezepte der ItemList stehen sichtbar im HTML (AP-23 Teil E Nr. 2).
  if (adresse === '/rezepte/') {
    const uebersicht = alle(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } }).find((block) => block['@type'] === 'ItemList');
    if (!uebersicht) melde(adresse, 'ItemList fehlt in den strukturierten Daten');
    else listeSichtbar(adresse, html, (uebersicht.itemListElement ?? []).map((punkt) => punkt.url));
    // Kopf der Übersicht: Vorspann als reiner Text, kein Link zur Rubrik (Ali, 11.10.2026); sie steht am Ende der
    // Seite unter "Rezepte nach Thema".
    const kopf = html.slice(html.indexOf('<main'), html.indexOf('<form class="f-seite"'));
    if (kopf.includes(`href="${ALTE}"`) || /<p\b[^>]*>(?:(?!<\/p>)[\s\S])*Auf der Website stehen(?:(?!<\/p>)[\s\S])*<a\b/.test(kopf)) melde(adresse, 'Kopf der Übersicht: Link im Vorspann oder zur Rubrik „Aus alten Kochbüchern“');
    const themenTeil = html.match(/<section class="f-themen"[\s\S]*?<\/section>/)?.[0] ?? '';
    if (!themenTeil.includes(`href="${ALTE}"`)) melde(adresse, `„Rezepte nach Thema“ ohne Link auf ${ALTE}`);
    // Zeile "Nach Zeit" (Projektleitung, 11.10.2026): nach der Rubrik je Zeitraum mit Rezepten ein Chip, der zu
    // seiner Überschrift am Zeitstrahl der Sammelseite springt.
    {
      const mitRezepten = ZEITRAEUME.filter((zeitraum) => [...ZUSATZ.values()].some(({ paket, original }) => paket === 'historisch' && original.zeitraum === zeitraum));
      const soll = [`Aus alten Kochbüchern > ${ALTE}`, ...mitRezepten.map((zeitraum) => `${zeitraum} > ${ALTE}#${zeitraum.replaceAll(' ', '-')}`)].join(', ');
      const zeile = themenTeil.match(/<dt>Nach Zeit<\/dt>[\s\S]*?<\/dd>/)?.[0] ?? '';
      const ist = alle(zeile, /<a class="chip" href="([^"]+)"[^>]*>([^<]+)<\/a>/g).map(([, ziel, name]) => `${name} > ${ziel}`).join(', ');
      if (ist !== soll) melde(adresse, `„Rezepte nach Thema“, Zeile „Nach Zeit“: erwartet „${soll}“, gefunden „${ist}“`);
      const sammelseite = seiten.get(ALTE) ?? '';
      for (const zeitraum of mitRezepten) {
        if (!sammelseite.includes(`<h3 id="${zeitraum.replaceAll(' ', '-')}">${zeitraum}</h3>`)) melde(adresse, `Chip „${zeitraum}“: Die Überschrift mit dieser Sprungmarke fehlt am Zeitstrahl von ${ALTE}`);
      }
    }
    // Filter: vier Gruppen in fester Reihenfolge. "Zeit" nennt die Zeiträume der Rezepte aus alten Kochbüchern mit
    // ihrer Anzahl, gezählt aus src/daten/rezepte_zusatz.json; genau diese Karten tragen ihren Zeitraum.
    const gruppen = alle(html, /<div class="f-gruppe[^"]*" data-gruppe="([a-z]+)"/g).map((treffer) => treffer[1]);
    if (gruppen.join() !== 'passt,kategorie,land,zeit') melde(adresse, `Filtergruppen: passt, kategorie, land, zeit erwartet, gefunden: ${gruppen.join(', ')}`);
    const zeit = html.match(/<div class="f-gruppe[^"]*" data-gruppe="zeit"[\s\S]*?<\/fieldset>/)?.[0] ?? '';
    if (!zeit.includes('<legend>Zeit<span class="vh">, </span><small>aus alten Kochbüchern</small></legend>')) melde(adresse, 'Filter „Zeit“: Titel oder Unterzeile „aus alten Kochbüchern“ fehlt');
    // Im Blatt am Handy steht die Unterzeile im Knopf der Gruppe (Projektleitung, 11.10.2026): bei "Passt für" und
    // "Zeit", bei "Kategorie" und "Land" keine.
    const knoepfe = alle(html, /<span class="f-knopf-name"><span data-knopf-text>([^<]+)<\/span>(?:<span class="vh">, <\/span><small>([^<]+)<\/small>)?<\/span>/g).map(([, name, unterzeile]) => (unterzeile ? `${name}: ${unterzeile}` : name)).join(', ');
    if (knoepfe !== 'Passt für: laut Zutatenliste, Kategorie, Land, Zeit: aus alten Kochbüchern') melde(adresse, `Knöpfe der Filtergruppen im Blatt: gefunden „${knoepfe}“`);
    const jeZeitraum = new Map(ZEITRAEUME.map((zeitraum) => [zeitraum, 0]));
    for (const { paket, original } of ZUSATZ.values()) if (paket === 'historisch') jeZeitraum.set(original.zeitraum, (jeZeitraum.get(original.zeitraum) ?? 0) + 1);
    const erwartet = [...jeZeitraum].filter(([, zahl]) => zahl > 0).map(([zeitraum, zahl]) => `${zeitraum}: ${zahl}`).join(', ');
    const gefunden = alle(zeit, /<input type="checkbox" name="zeit" value="[^"]+" data-wort="([^"]+)"><span>([^<]+)<\/span><span class="f-anzahl">(\d+)<\/span>/g).map(([, wort, sichtbar, zahl]) => `${wort === sichtbar ? wort : `${wort}/${sichtbar}`}: ${zahl}`).join(', ');
    if (gefunden !== erwartet) melde(adresse, `Filter „Zeit“: erwartet „${erwartet}“, gefunden „${gefunden}“`);
    for (const karte of alle(html, /<li class="r-karte"[^>]*\bdata-karte\b[^>]*>[\s\S]*?<\/li>/g).map((treffer) => treffer[0])) {
      const slug = karte.match(/href="\/rezepte\/([^"/]+)\/"/)?.[1];
      const soll = ZUSATZ.get(slug)?.original?.zeitraum?.replaceAll(' ', '-') ?? null;
      const ist = karte.match(/^<li[^>]*\bdata-zeit="([^"]*)"/)?.[1] ?? null;
      if (soll !== ist) melde(adresse, `Karte ${slug}: Zeitraum „${ist ?? 'keiner'}“, erwartet „${soll ?? 'keiner'}“`);
    }
  }

  // Rezept- und Themenseiten: Pflichtfelder der strukturierten Daten, Bilder in drei Seitenverhältnissen,
  // FoodAsu-eigener Teil, Lizenzzeile.
  if (adresse.startsWith('/rezepte/') && adresse !== '/rezepte/') {
    const bloecke = alle(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } });
    const rezept = bloecke.find((block) => block['@type'] === 'Recipe');
    const liste = bloecke.find((block) => block['@type'] === 'ItemList');
    if (!rezept && !liste) melde(adresse, 'weder Recipe noch ItemList in den strukturierten Daten');
    if (rezept) {
      for (const feld of ['name', 'image', 'description', 'author', 'datePublished', 'recipeCategory', 'recipeCuisine', 'keywords', 'recipeIngredient', 'recipeInstructions']) {
        if (rezept[feld] == null || rezept[feld].length === 0) melde(adresse, `Recipe ohne ${feld}`);
      }
      if (!rezept.totalTime && !(rezept.prepTime && rezept.cookTime)) hinweise.push(`${adresse}: Recipe ohne Zeitangabe (im Rezeptpaket nicht vorhanden)`);
      if (Boolean(rezept.prepTime) !== Boolean(rezept.cookTime)) melde(adresse, 'prepTime und cookTime nur gemeinsam');
      if (rezept.nutrition && !rezept.recipeYield) melde(adresse, 'nutrition.calories ohne recipeYield');
      const verhaeltnisse = new Set();
      for (const bild of rezept.image ?? []) {
        const pfad = bild.replace(HOST, '');
        const masse = pfad.match(/-(16x9|4x3|1x1)-1200\.webp$/);
        if (!vorhanden.has(pfad) || !masse) melde(adresse, `Bild der strukturierten Daten fehlt oder hat kein bekanntes Format: ${bild}`);
        else verhaeltnisse.add(masse[1]);
      }
      if (verhaeltnisse.size !== 3) melde(adresse, 'Bilder in 16:9, 4:3 und 1:1 erwartet');
      for (const [nummer, schritt] of (rezept.recipeInstructions ?? []).entries()) {
        if (schritt['@type'] !== 'HowToStep' || !schritt.text || !schritt.name) melde(adresse, `Schritt ${nummer + 1} unvollständig`);
        if (/^Schritt\s+\d/.test(schritt.text ?? '')) melde(adresse, `Schritt ${nummer + 1} beginnt mit "Schritt"`);
        if (!html.includes(`id="${(schritt.url ?? '').split('#')[1]}"`)) melde(adresse, `Sprungmarke zu Schritt ${nummer + 1} fehlt`);
      }
      for (const teil of ['id="passt"', 'id="hinweise"', 'id="naehrwerte"', 'Maßgeblich ist die Verpackung.', 'Symbolbild']) {
        if (!html.includes(teil)) melde(adresse, `Pflichtteil der Rezeptseite fehlt: ${teil}`);
      }
      // Knopf "Rezept teilen": ein echter Knopf mit diesem Namen, oben im Kopfbereich bei den Angaben zum Rezept. Er
      // trägt die kanonische Adresse der Seite ohne Zusätze, den Titel des Rezepts und einen Satz; daneben steht die
      // Zeile für "Link kopiert". Ob ein Klick etwas überträgt oder speichert, misst tools/nachweise.mjs.
      const knoepfe = alle(html, TEILEN_KNOPF);
      if (knoepfe.length !== 1) melde(adresse, `genau ein Knopf „${TEILEN_NAME}“ erwartet, gefunden: ${knoepfe.length}`);
      else {
        teilenKnoepfe++;
        const [ganz, angaben, innen] = knoepfe[0];
        const wert = (name) => entschluesselt(angaben.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? '');
        const name = entschluesselt(innen.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
        if (name !== TEILEN_NAME) melde(adresse, `der Knopf heißt „${name}“ statt „${TEILEN_NAME}“`);
        if (!/\btype="button"/.test(angaben)) melde(adresse, `Knopf „${TEILEN_NAME}“ ohne type="button"`);
        if (/\b(?:disabled|tabindex="-1"|aria-hidden="true")/.test(angaben)) melde(adresse, `Knopf „${TEILEN_NAME}“ ist nicht bedienbar`);
        if (wert('data-adresse') !== HOST + adresse || wert('data-adresse') !== kanonisch[0]?.[1]) melde(adresse, `Knopf „${TEILEN_NAME}“: Adresse „${wert('data-adresse')}“ ist nicht die kanonische Adresse`);
        if (/[?#&=]/.test(wert('data-adresse'))) melde(adresse, `Knopf „${TEILEN_NAME}“: Adresse mit Zusatz oder Parameter`);
        if (wert('data-titel') !== rezept.name) melde(adresse, `Knopf „${TEILEN_NAME}“: Titel „${wert('data-titel')}“ ist nicht der Titel des Rezepts`);
        if (!/^[^.!?]{3,}: [^.!?]{10,}\.$/.test(wert('data-text')) || /https?:|"/.test(wert('data-text'))) melde(adresse, `Knopf „${TEILEN_NAME}“: Satz fehlt oder ist kein einzelner Satz: „${wert('data-text')}“`);
        if (wert('data-kopiert') !== 'Link kopiert') melde(adresse, `Knopf „${TEILEN_NAME}“: Meldung „Link kopiert“ fehlt`);
        if (!/<span\b[^>]*\brole="status"[^>]*\bdata-teilen-status\b[^>]*><\/span>/.test(html)) melde(adresse, `Zeile für die Meldung neben dem Knopf „${TEILEN_NAME}“ fehlt oder ist nicht leer`);
        const stelle = html.indexOf(ganz);
        if (stelle < html.indexOf('class="r-angaben"') || stelle > html.indexOf('class="s-inhalt')) melde(adresse, `Knopf „${TEILEN_NAME}“ steht nicht im Kopfbereich nach den Angaben zum Rezept`);
      }
      // Quelle und Lizenz stehen auf der Seite "Quellen und Lizenzen": Die Rezeptseite verlinkt ihren Abschnitt, und
      // der Abschnitt nennt Lizenz und Änderungsvermerk. Bei einem Rezept aus einem alten Kochbuch nennt er das Buch,
      // Jahr und Ort, die Stelle im Buch, Digitalisat oder Abschrift und die eigene Fassung (AP-25 Teil C Nr. 6).
      const kennung = adresse.split('/').at(-2);
      const zusatz = ZUSATZ.get(kennung);
      const alt = zusatz?.original;
      const klar = (teil) => entschluesselt(teil.replace(/<span lang="[a-z-]+">([^<]*)<\/span>/g, '$1'));
      if (!html.includes(`href="${QUELLEN}#${kennung}"`)) melde(adresse, `Link auf ${QUELLEN}#${kennung} fehlt`);
      const abschnitt = (seiten.get(QUELLEN) ?? '').split(/<section /).find((teil) => teil.includes(`id="${kennung}"`));
      const teile = alt
        ? [alt.buch, `${alt.jahr}, ${alt.ort}`, alt.fundstelle, `href="${alt.digitalisat ?? alt.abschrift}"`, alt.abschrift ? `href="${alt.abschrift}"` : 'Eigene Abschrift aus dem Digitalisat.', 'eigene Fassung von FoodAsu']
        : ['rel="license', 'Für FoodAsu verändert.', rezept.license, rezept.isBasedOn];
      if (!abschnitt) melde(QUELLEN, `Abschnitt zu ${kennung} fehlt`);
      else for (const teil of teile) {
        if (typeof teil !== 'string' || !klar(abschnitt).includes(teil)) melde(QUELLEN, `Abschnitt ${kennung}: ${teil} fehlt`);
      }
      // AP-25 Teil H Nr. 4 und 5: "Dieses Rezept kommt später in die App" (ohne Punkt) ist die Überschrift des Kastens am
      // Ende der Seite (sonst "Dieses Rezept in FoodAsu"), und zwar auf genau den Rezepten, die es in der App noch
      // nicht gibt. Der Kopf der Seite bleibt, wie ihn die Vorlage vorgibt.
      const kasten = html.match(/<section class="r-teil r-app[\s\S]*?<\/section>/)?.[0] ?? '';
      const imKasten = entschluesselt(kasten.match(/<h2 id="app">([^<]*)<\/h2>/)?.[1] ?? '') === SPAETER;
      if (zusatz) {
        spaeterSeiten++;
        if (!imKasten) melde(adresse, `der Satz „${SPAETER}“ ist nicht die Überschrift des Kastens am Ende der Seite`);
        if (html.slice(0, html.indexOf('class="r-sprung"')).replace(/<script[\s\S]*?<\/script>/g, ' ').includes(SPAETER)) melde(adresse, `der Satz „${SPAETER}“ steht im Kopf der Seite (die Vorlage bleibt dort unverändert)`);
      } else if (sichtbar(html).includes(SPAETER)) melde(adresse, `der Satz „${SPAETER}“ gehört nur auf Rezepte, die es in der App noch nicht gibt`);
      // AP-25 Teil C Nr. 2 und Teil H Nr. 4: Block "Aus dem Original" direkt nach dem Kopf, ein Lavendel-Kasten mit
      // Buch, Verfasser und Jahr als Überzeile, dem Auszug in der alten Schreibweise (mit Sprachangabe, höchstens drei
      // Sätze) und in heutigem Deutsch, den vollen Angaben zum Buch und dem Link zum Digitalisat oder zur Abschrift
      // als Textlink. Die Sprungleiste nennt ihn "Original". Die strukturierten Daten nennen das Buch; die Adresse
      // endet mit dem Jahr.
      const block = html.match(/<section class="r-teil r-original[\s\S]*?<\/section>/)?.[0];
      if (Boolean(alt) !== Boolean(block)) melde(adresse, alt ? 'Block „Aus dem Original“ fehlt' : 'Block „Aus dem Original“ gehört nur auf Rezepte aus alten Kochbüchern');
      if (alt && block) {
        const quelle = alt.digitalisat ?? alt.abschrift;
        for (const teil of [`<p class="ueberzeile">${alt.buch_kurz} · ${alt.jahr}</p>`, '<h2 id="original">Aus dem Original</h2>', alt.buch, alt.verfasser, `${alt.ort} ${alt.jahr}`, alt.auszug_alt, alt.auszug_heute, `<blockquote lang="${alt.sprache_kennung}"`, `href="${quelle}"`, `href="${ALTE}"`]) {
          if (!klar(block).includes(teil)) melde(adresse, `Block „Aus dem Original“: ${teil.slice(0, 80)} fehlt`);
        }
        if (!adresse.endsWith(`-${alt.jahr}/`)) melde(adresse, `die Adresse endet nicht mit dem Jahr ${alt.jahr}`);
        const saetze = alt.auszug_alt.split(/(?<=[.!?])\s+(?=\p{Lu})/u).length;
        if (saetze > 3) melde(adresse, `der Auszug aus dem Buch hat ${saetze} Sätze (höchstens drei)`);
        if (/<img\b/.test(block)) melde(adresse, 'Block „Aus dem Original“ zeigt ein Seitenbild (vorgesehen ist nur der Link)');
        if (/class="knopf/.test(block)) melde(adresse, 'Block „Aus dem Original“: Der Link zum Digitalisat ist ein Textlink, kein Knopf');
        if (!html.includes('<li><a href="#original">Original</a></li>')) melde(adresse, 'Sprungleiste ohne den Eintrag „Original“');
        if (html.indexOf(block) > html.indexOf('id="passt"')) melde(adresse, 'Block „Aus dem Original“ steht nicht direkt nach dem Kopf');
        const buch = rezept.isBasedOn;
        if (buch?.['@type'] !== 'Book' || buch.name !== alt.buch || buch.datePublished !== String(alt.jahr) || buch.url !== quelle) melde(adresse, 'isBasedOn nennt nicht das Buch mit Titel, Jahr und Adresse');
        if (Boolean(alt.todesjahr) !== (buch?.author?.name === alt.verfasser)) melde(adresse, 'isBasedOn: Verfasserin oder Verfasser stimmt nicht mit den Angaben zum Buch überein');
        if (alt.gleiches_gericht && !html.includes(`href="/rezepte/${alt.gleiches_gericht}/"`)) melde(adresse, `Link zur heutigen Fassung /rezepte/${alt.gleiches_gericht}/ fehlt`);
        if (alt.gleiches_gericht && !(seiten.get(`/rezepte/${alt.gleiches_gericht}/`) ?? '').includes(`href="${adresse}"`)) melde(`/rezepte/${alt.gleiches_gericht}/`, `Link zur Fassung aus dem alten Kochbuch ${adresse} fehlt`);
      }
    }
    if (liste) {
      const ziele = (liste.itemListElement ?? []).map((punkt) => punkt.url);
      if (ziele.length === 0 || liste.itemListElement.some((punkt, nummer) => punkt.position !== nummer + 1 || !punkt.url?.startsWith(HOST))) melde(adresse, 'ItemList: position oder url fehlt');
      if (new Set(ziele).size !== ziele.length) melde(adresse, 'ItemList: Adresse doppelt');
      const ohneSeite = ziele.filter((ziel) => !seiten.has(ziel.replace(HOST, '')));
      if (ohneSeite.length && !nurMuster) melde(adresse, `ItemList nennt ${ohneSeite.length} Adressen ohne Seite`);
      else if (ohneSeite.length) hinweise.push(`${adresse}: ItemList nennt ${ohneSeite.length} Adressen, deren Seiten erst nach der Freigabe der Muster entstehen`);
      if (!html.includes('laut Zutatenliste') && /ohne-|vegetarisch|vegan/.test(adresse)) melde(adresse, '"laut Zutatenliste" fehlt');
      listeSichtbar(adresse, html, ziele);
    }
  }

  if (!istRezept && /\bdata-teilen\b/.test(html)) melde(adresse, `Knopf „${TEILEN_NAME}“ gehört nur auf Rezeptseiten`);
  for (const fund of alle(html, TEILEN_DIENSTE)) melde(adresse, `Dienst zum Teilen im Quelltext: ${fund[0]}`);

  // Linktexte: derselbe Text darf nicht zu verschiedenen Zielen führen (Navigation und Fuß ausgenommen).
  const inhalt = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
  const texteZuZiel = new Map();
  for (const [, ziel, innen] of alle(inhalt, /<a\b[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const text = innen.replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    if (texteZuZiel.has(text) && texteZuZiel.get(text) !== ziel.replace(/&(?:amp;)?referrer=[^"]*$/, '')) melde(adresse, `Linktext "${text}" führt zu verschiedenen Zielen`);
    texteZuZiel.set(text, ziel.replace(/&(?:amp;)?referrer=[^"]*$/, ''));
  }

  // Sprache: Kein Begriff aus src/daten/sprachen.mjs darf ohne lang-Attribut im sichtbaren Text stehen.
  durchlaufe(html, (text) => {
    for (const fund of text.match(AUSDRUCK) ?? []) melde(adresse, `fremdsprachiger Begriff ohne lang-Attribut: ${fund}`);
  });
  for (const [, sprache] of alle(html, /<span lang="([^"]+)">/g)) {
    if (!begriffe.some((begriff) => begriff.lang === sprache)) melde(adresse, `unbekanntes lang-Attribut: ${sprache}`);
  }

  // Wortlisten
  let text = sichtbar(html);
  if (adresse === NUTZUNG) {
    for (const wortlaut of NUTZUNG_KAUF) {
      if (!text.includes(wortlaut)) melde(adresse, `Wortlaut der Ausnahme fehlt (Liste NUTZUNG_KAUF nachziehen): „${wortlaut}“`);
      text = text.replaceAll(wortlaut, ' '.repeat(wortlaut.length));
    }
    if (!text.includes(NUTZUNG_MEDIZIN)) melde(adresse, 'Satz zum Medizinprodukt fehlt oder weicht ab');
    for (const fund of alle(text.replaceAll(NUTZUNG_MEDIZIN, ' '), muster('allergi|allergen'))) melde(adresse, `GESPERRT außerhalb des Satzes zum Medizinprodukt: ${fund[0]}`);
  }
  const listen = RECHTSTEXTE.has(adresse) ? BEZAHL_UND_FRIST : [...GESPERRT, ...BEZAHL_UND_FRIST, ...BETA, ...WENDUNGEN];
  for (const [art, ausdruck] of listen) for (const fund of alle(text, ausdruck)) melde(adresse, `${art}: ${fund[0]}`);
}

for (const [adresse, zahl] of eingang) {
  if (zahl === 0 && !OHNE_EINGANG.has(adresse)) melde(adresse, 'kein eingehender Link von einer anderen Seite');
}

// Skripte und Stile: keine fremden Adressen, kein Speicher im Browser, keine Anfragen aus dem Skript.
for (const datei of dateien.filter((d) => /\.(js|css)$/.test(d))) {
  const inhalt = readFileSync(datei, 'utf8');
  const name = adresseVon(datei);
  for (const fund of alle(inhalt, /(?:url\(|@import\s*|["'`])\s*((?:https?:)?\/\/[^"'`)\s]+)/g)) {
    if (!/^https?:\/\/(www\.w3\.org|schema\.org)\//.test(fund[1])) melde(name, `fremde Adresse: ${fund[1]}`);
  }
  if (datei.endsWith('.js') && speicherBefund(inhalt)) melde(name, speicherBefund(inhalt));
  for (const fund of alle(inhalt, TEILEN_DIENSTE)) melde(name, `Dienst zum Teilen: ${fund[0]}`);
}
// Knopf "Rezept teilen": Jede Seite mit einem Rezept in den strukturierten Daten hat ihn.
const rezeptSeiten = [...seiten.values()].filter((html) => IST_REZEPT.test(html)).length;
if (teilenKnoepfe !== rezeptSeiten || rezeptSeiten === 0) melde('/rezepte/', `Knopf „${TEILEN_NAME}“ auf ${teilenKnoepfe} von ${rezeptSeiten} Rezeptseiten`);
// Rezepte, die es in der App noch nicht gibt (AP-25): Jedes hat seine Seite. Die Sammelseite "Aus alten Kochbüchern"
// zeigt am Zeitstrahl genau die Rezepte aus alten Kochbüchern, je Karte mit Bild, Titel, Jahr und Buch; ihre ItemList
// nennt nur, was auf der Seite steht. Titel, Beschreibung und Text tragen die drei Suchbegriffe. Die Startseite und
// die Übersicht der Rezepte verlinken die Seite (der Fuß jeder Seite auch: FUSS_LINKS).
for (const slug of ZUSATZ.keys()) if (!IST_REZEPT.test(seiten.get(`/rezepte/${slug}/`) ?? '')) melde(`/rezepte/${slug}/`, 'Rezeptseite fehlt');
// Im Menü "Rezepte" jeder Seite steht der Link zur Rubrik direkt nach "Alle ... Rezepte", in derselben Form: ein
// einfacher Link ohne Abzeichen (Ali, 11.10.2026).
for (const [adresse, html] of seiten) {
  const eintraege = alle(html.match(/<div class="mega-gruppen">[\s\S]*?<div class="mega-gruppe">/)?.[0] ?? '', /<p class="alle"><a href="([^"]*)"[^>]*>\s*([^<]*?)\s*<svg/g).map(([, ziel, name]) => `${entschluesselt(name)} > ${ziel}`);
  if (eintraege.length !== 2 || !/^Alle \d+ Rezepte > \/rezepte\/$/.test(eintraege[0]) || eintraege[1] !== `Aus alten Kochbüchern > ${ALTE}`) melde(adresse, `Menü „Rezepte“: „Alle … Rezepte“ und danach „Aus alten Kochbüchern“ erwartet, gefunden: ${eintraege.join(' | ') || 'nichts'}`);
}
// "Zum Ausprobieren" im Menü (Ali, 11.10.2026): Im HTML jeder Seite steht eine eigene feste Auswahl, am Laptop und im
// Handy-Menü dieselbe: drei Rezepte der Website aus drei Ländern, nie das Rezept der Seite selbst, je mit Bild, das
// erst beim Öffnen lädt, und dem alt-Text "Symbolbild: Titel". Dazu steht in der Seite die Liste aller Rezeptseiten
// für die zufällige Auswahl im Browser (Name in der Adresse, Titel, Land), ohne fremde Adressen.
const probeWahlen = new Set();
for (const [adresse, html] of seiten) {
  const bloecke = alle(html, /<div class="mega-probe[^"]*">[\s\S]*?<\/ul>/g).map(([block]) =>
    alle(block, /<li><a href="([^"]+)"><picture><source type="image\/avif" srcset="([^"]+)"><img src="([^"]+)" alt="([^"]*)" width="360" height="270" loading="lazy" decoding="async"><\/picture><span class="mega-probe-text"><b>([\s\S]*?)<\/b><span>([^<]*)<\/span><\/span><\/a><\/li>/g)
      .map(([, ziel, avif, webp, alt, titel, land]) => ({ ziel, avif, webp, alt: entschluesselt(alt), titel: entschluesselt(titel.replace(/<[^>]+>/g, '')), land })));
  const [breit, mobil] = bloecke;
  if (bloecke.length !== 2 || breit.length !== 3 || mobil.length !== 3) { melde(adresse, '„Zum Ausprobieren“: zwei Blöcke mit je drei Rezepten erwartet'); continue; }
  if (breit.map((rezept) => rezept.ziel).join() !== mobil.map((rezept) => rezept.ziel).join()) melde(adresse, '„Zum Ausprobieren“: am Laptop und im Handy-Menü stehen verschiedene Rezepte');
  if (new Set(breit.map((rezept) => rezept.ziel)).size !== 3) melde(adresse, '„Zum Ausprobieren“: ein Rezept steht doppelt da');
  if (new Set(breit.map((rezept) => rezept.land)).size !== 3) melde(adresse, `„Zum Ausprobieren“: nicht drei verschiedene Länder (${breit.map((rezept) => rezept.land).join(', ')})`);
  if (breit.some((rezept) => rezept.ziel === adresse)) melde(adresse, '„Zum Ausprobieren“ zeigt das Rezept der Seite selbst');
  for (const rezept of breit) {
    const slug = rezept.ziel.match(/^\/rezepte\/([^/]+)\/$/)?.[1];
    if (!slug || !IST_REZEPT.test(seiten.get(rezept.ziel) ?? '')) melde(adresse, `„Zum Ausprobieren“: ${rezept.ziel} ist keine Rezeptseite`);
    if (rezept.avif !== `/bilder/rezepte/${slug}-karte-360.avif` || rezept.webp !== `/bilder/rezepte/${slug}-karte-360.webp` || !vorhanden.has(rezept.avif) || !vorhanden.has(rezept.webp)) melde(adresse, `„Zum Ausprobieren“: Bild zu ${rezept.ziel} fehlt oder gehört zu einem anderen Rezept`);
    if (rezept.alt !== `Symbolbild: ${rezept.titel}` || !rezept.land) melde(adresse, `„Zum Ausprobieren“: alt-Text oder Land fehlt bei ${rezept.ziel}`);
  }
  probeWahlen.add(breit.map((rezept) => rezept.ziel).join());
  const roh = html.match(/<script type="application\/json" data-probe-liste>([\s\S]*?)<\/script>/)?.[1];
  let liste = null;
  try { liste = JSON.parse(roh); } catch { /* unten gemeldet */ }
  if (!liste || liste.alt !== 'Symbolbild' || !Array.isArray(liste.rezepte) || !Array.isArray(liste.laender)) { melde(adresse, '„Zum Ausprobieren“: Liste für den Browser fehlt oder ist nicht lesbar'); continue; }
  if (liste.rezepte.length !== rezeptSeiten || new Set(liste.rezepte.map(([slug]) => slug)).size !== rezeptSeiten) melde(adresse, `„Zum Ausprobieren“: Die Liste nennt ${liste.rezepte.length} Rezepte, die Website hat ${rezeptSeiten} Rezeptseiten`);
  for (const [slug, titel, land] of liste.rezepte) {
    if (!IST_REZEPT.test(seiten.get(`/rezepte/${slug}/`) ?? '') || !vorhanden.has(`/bilder/rezepte/${slug}-karte-360.avif`) || !vorhanden.has(`/bilder/rezepte/${slug}-karte-360.webp`) || !titel || !liste.laender[land]) melde(adresse, `„Zum Ausprobieren“: Eintrag ${slug} der Liste ohne Seite, Bild, Titel oder Land`);
  }
  if (/https?:|\/\//.test(roh)) melde(adresse, '„Zum Ausprobieren“: Die Liste nennt eine Adresse außerhalb der Website');
}
if (probeWahlen.size <= seiten.size / 2) melde('/', `„Zum Ausprobieren“: nur ${probeWahlen.size} verschiedene Auswahlen auf ${seiten.size} Seiten`);
if (spaeterSeiten !== ZUSATZ.size) melde('/rezepte/', `der Satz „${SPAETER}“ ist auf ${spaeterSeiten} von ${ZUSATZ.size} Seiten geprüft`);
const alteSeite = seiten.get(ALTE);
const alteSlugs = [...ZUSATZ.values()].filter((rezept) => rezept.original).map((rezept) => rezept.slug);
if (!alteSeite) melde(ALTE, 'Seite fehlt');
else {
  const sammlung = alle(alteSeite, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } }).find((block) => block['@type'] === 'ItemList');
  const ziele = (sammlung?.itemListElement ?? []).map((punkt) => punkt.url);
  if (!sammlung) melde(ALTE, 'ItemList fehlt in den strukturierten Daten');
  else {
    if ([...ziele].sort().join(' ') !== alteSlugs.map((slug) => `${HOST}/rezepte/${slug}/`).sort().join(' ')) melde(ALTE, `ItemList nennt nicht genau die ${alteSlugs.length} Rezepte aus alten Kochbüchern`);
    if (sammlung.numberOfItems !== ziele.length || sammlung.itemListElement.some((punkt, nummer) => punkt.position !== nummer + 1)) melde(ALTE, 'ItemList: Anzahl oder position stimmt nicht');
    listeSichtbar(ALTE, alteSeite, ziele);
  }
  const karten = alle(alteSeite, /<li\b[^>]*\bclass="r-karte[^"]*"[^>]*>[\s\S]*?<\/li>/g).map(([karte]) => karte);
  for (const slug of alteSlugs) {
    const { titel, original } = ZUSATZ.get(slug);
    const karte = karten.find((eine) => eine.includes(`href="/rezepte/${slug}/"`));
    const text = entschluesselt((karte ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
    if (!karte) melde(ALTE, `Karte für ${slug} fehlt`);
    else for (const teil of [titel.replace(/\s*\(\d{4}\)$/, ''), `${original.jahr} · ${original.buch_kurz}`]) if (!text.includes(teil)) melde(ALTE, `Karte ${slug}: ${teil} fehlt`);
    if (karte && !/<img\b/.test(karte)) melde(ALTE, `Karte ${slug} ohne Bild`);
  }
  if (!/<ol class="stationen a-zeitstrahl">/.test(alteSeite)) melde(ALTE, 'Zeitstrahl fehlt');
  for (const zeitraum of new Set(alteSlugs.map((slug) => ZUSATZ.get(slug).original.zeitraum))) {
    if (!new RegExp(`<h3 id="[^"]+">${zeitraum}</h3>`).test(alteSeite)) melde(ALTE, `Zeitraum „${zeitraum}“ fehlt am Zeitstrahl`);
  }
  const kopfdaten = `${alteSeite.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''} ${inhaltVon(alteSeite, 'description') ?? ''} ${sichtbar(alteSeite.match(/<main[\s\S]*<\/main>/)?.[0] ?? '')}`.toLowerCase();
  for (const begriff of ['alte rezepte', 'historische rezepte', 'kochbüchern']) if (!kopfdaten.includes(begriff)) melde(ALTE, `Suchbegriff „${begriff}“ fehlt in Titel, Beschreibung und Text`);
  for (const adresse of ['/', '/rezepte/']) if (!(seiten.get(adresse)?.match(/<main[\s\S]*<\/main>/)?.[0] ?? '').includes(`href="${ALTE}"`)) melde(adresse, `Link auf ${ALTE} fehlt im Inhalt der Seite`);
}
// Schalter für helle und dunkle Darstellung (AP-18 Teil C): Jede Seite liest die gemerkte Wahl schon im Kopf, vor dem
// ersten Zeichnen, und hat genau einen Schalter (ein echter Knopf mit der Rolle Schalter und einem Namen). Der
// Eintrag wird auf jeder Seite höchstens an einer Stelle geschrieben. Die Farben hängen nur noch an data-modus, nie
// mehr an der Einstellung des Geräts.
const SCHALTER = /<button\b[^>]*\bdata-modus-schalter\b[^>]*>/g;
for (const [adresse, html] of seiten) {
  const skripte = alle(html, /<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g).map((treffer) => treffer[1]);
  for (const skript of skripte) {
    if (speicherBefund(skript)) melde(adresse, speicherBefund(skript));
  }
  const kopf = html.slice(0, html.indexOf('</head>'));
  const imKopf = alle(kopf, /<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g).map((treffer) => treffer[1]).join('\n');
  if (alle(imKopf, DARSTELLUNG_LESEN).length !== 1 || !/data-modus/.test(imKopf)) melde(adresse, 'das Skript im Kopf liest die gemerkte Darstellung nicht (genau einmal erwartet)');
  if (alle(imKopf, DARSTELLUNG_SCHREIBEN).length > 0) melde(adresse, 'das Skript im Kopf schreibt in den Speicher');
  const schalter = alle(html, SCHALTER);
  if (schalter.length !== 1) melde(adresse, `genau ein Schalter für die Darstellung erwartet, gefunden: ${schalter.length}`);
  else if (!/\btype="button"/.test(schalter[0][0]) || !/\brole="switch"/.test(schalter[0][0]) || !/\baria-checked="false"/.test(schalter[0][0])) {
    melde(adresse, 'der Schalter für die Darstellung ist kein Knopf mit der Rolle Schalter (aus)');
  }
}
const schreibStellen = dateien.filter((d) => d.endsWith('.js')).map((d) => alle(readFileSync(d, 'utf8'), DARSTELLUNG_SCHREIBEN).length)
  .concat([...seiten.values()].slice(0, 1).map((html) => alle(html, DARSTELLUNG_SCHREIBEN).length));
if (schreibStellen.reduce((summe, zahl) => summe + zahl, 0) < 1) melde('Skripte', 'der Schalter schreibt seine Wahl nirgends');
for (const datei of dateien.filter((d) => d.endsWith('.css'))) {
  if (/prefers-color-scheme/.test(readFileSync(datei, 'utf8'))) melde(adresseVon(datei), 'Farben folgen der Einstellung des Geräts (prefers-color-scheme); hell ist der Standard');
}
for (const [adresse, html] of seiten) {
  if (/prefers-color-scheme/.test(html)) melde(adresse, 'Farben folgen der Einstellung des Geräts (prefers-color-scheme); hell ist der Standard');
}

// Links zum Eintrag bei Google Play mit Kennung des Kanals (AP-44, 25.10.2026): Jeder Link im HTML zum Eintrag trägt
// referrer=utm_source%3Dwebsite%26utm_medium%3Dlink%26utm_campaign%3D<ort> mit einem Ort aus STORE_ORTE. Ohne Kennung
// bleiben die strukturierten Daten (JSON-LD), llms.txt, die Sitemap und die vier Seiten mit Rechtstexten
// (PLAY_OHNE_KENNUNG, dort auch die Fußzeile). Die Entwicklerseite (/store/apps/dev) ist kein Link zum Eintrag der App.
const PLAY_OHNE_KENNUNG = new Set(['/datenschutz.html', '/nutzungsbedingungen.html', '/offenlegung/', '/lizenzen/']);
const PLAY_MIT_KENNUNG = new Set(STORE_ORTE.map((ort) => storeLink(ort)));
let playLinks = 0;
let playOhneKennung = 0;
for (const [adresse, html] of [...seiten, ...weiterleitungen]) {
  const ohneDaten = html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, ' ');
  // AP-45: Auch das Ziel einer Weiterleitung (meta refresh) ist ein Link zu Google Play und trägt die Kennung.
  const ziele = [
    ...alle(ohneDaten, /\bhref\s*=\s*"(https?:\/\/play\.google\.com\/store\/apps\/details[^"]*)"/g),
    ...alle(ohneDaten, /http-equiv="refresh"\s+content="\d+;\s*url=(https?:\/\/play\.google\.com\/store\/apps\/details[^"]*)"/g),
  ];
  for (const [, roh] of ziele) {
    const ziel = roh.replaceAll('&amp;', '&');
    playLinks += 1;
    if (PLAY_MIT_KENNUNG.has(ziel)) continue;
    if (KURZLINKS.some((kurzlink) => kurzlink.pfad === adresse && kurzlink.ziel === ziel)) continue; // Kurzlink: nur auf seiner eigenen Seite
    if (ziel === store.adresse && PLAY_OHNE_KENNUNG.has(adresse)) { playOhneKennung += 1; continue; }
    melde(adresse, `Link zu Google Play ohne gültige Kennung des Kanals (erwartet utm_source=website, utm_medium=link, utm_campaign=${STORE_ORTE.join('|')}): ${ziel}`);
  }
  // Schreibweisen ohne doppelte Anführungszeichen oder mit Großbuchstaben im Schema würden die Suche oben umgehen.
  const schreibweise = ohneDaten.replace(/\bhref\s*=\s*"https?:\/\/play\.google\.com\/store\/apps\/details[^"]*"/g, ' ').replace(/http-equiv="refresh"\s+content="\d+;\s*url=https?:\/\/play\.google\.com\/store\/apps\/details[^"]*"/g, ' ');
  if (/play\.google\.com\/store\/apps\/details/i.test(schreibweise.replace(/<(?:svg|style)[\s\S]*?<\/(?:svg|style)>/g, ' '))) melde(adresse, 'Verweis auf den Eintrag bei Google Play außerhalb eines href in doppelten Anführungszeichen');
}
for (const datei of dateien.filter((d) => /\.(txt|xml)$/.test(d))) {
  // llms.txt und Sitemap bleiben ohne Kennung (Ausnahme aus AP-44); eine Kennung dort wäre ein Befund.
  if (/play\.google\.com[^\s"]*utm_/.test(readFileSync(datei, 'utf8'))) melde(adresseVon(datei), 'Kennung des Kanals (utm_) gehört nicht in llms.txt oder die Sitemap');
}

// Kurzlinks (AP-45, 25.10.2026): Genau drei Weiterleitungen /fb/, /ig/ und /app/ auf den Eintrag bei Google Play mit
// Kennung (utm_campaign=kurzlink). Je Seite: meta refresh "0; url=<Ziel>", noindex, genau ein Link mit dem Ziel und dem
// Text "Weiter zu FoodAsu bei Google Play", kein Skript, kein Rahmen, kein Formular, kein Bild von Dritten, keine
// Kopf- oder Fußzeile; als Text nur der Name und der Link. Dazu: in keiner Sitemap, nicht in llms.txt, von keiner
// anderen Seite verlinkt, in robots.txt nicht gesperrt (sonst sieht Google das noindex nicht).
const KURZ_LINKTEXT = 'Weiter zu FoodAsu bei Google Play';
const KURZ_ERLAUBT = ['/fb/', '/ig/', '/app/'];
const KURZ_KENNUNG = /^https:\/\/play\.google\.com\/store\/apps\/details\?id=at\.tonc\.einkauf&referrer=utm_source%3D(facebook|instagram|nachricht)%26utm_medium%3D(social|persoenlich)%26utm_campaign%3Dkurzlink$/;
if (KURZLINKS.map((k) => k.pfad).join() !== KURZ_ERLAUBT.join()) melde('Kurzlinks', `erwartet ${KURZ_ERLAUBT.join(', ')}, gefunden ${KURZLINKS.map((k) => k.pfad).join(', ')}`);
const robotsDatei = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (/^\s*Disallow:\s*\S/im.test(robotsDatei)) melde('/robots.txt', 'Disallow gefunden: Die Kurzlinks dürfen nicht gesperrt sein (Google sähe sonst das noindex nicht)');
for (const kurzlink of KURZLINKS) {
  const html = weiterleitungen.get(kurzlink.pfad);
  if (html === undefined) { melde(kurzlink.pfad, 'Weiterleitung fehlt im Bau'); continue; }
  if (!KURZ_KENNUNG.test(kurzlink.ziel)) melde(kurzlink.pfad, `Ziel ohne die erwartete Kennung (utm_campaign=kurzlink): ${kurzlink.ziel}`);
  const refresh = alle(html, /<meta\b[^>]*http-equiv="refresh"[^>]*>/gi);
  const inhalt = entschluesselt(refresh[0]?.[0].match(/content="([^"]*)"/)?.[1] ?? '');
  if (refresh.length !== 1 || inhalt !== `0; url=${kurzlink.ziel}`) melde(kurzlink.pfad, `genau eine Weiterleitung "0; url=<Ziel>" erwartet, gefunden: ${inhalt || 'keine'}`);
  if (!/<meta name="robots" content="noindex, follow">/.test(html)) melde(kurzlink.pfad, 'noindex fehlt');
  if (/<(?:script|iframe|form|img|video|audio|object|embed|link\b[^>]*rel="(?:preload|prefetch|preconnect|dns-prefetch|stylesheet)[^>]*href="https?:)/i.test(html)) melde(kurzlink.pfad, 'Skript, Rahmen, Formular, Bild oder Verbindung zu Dritten gefunden (erlaubt ist nur die Weiterleitung und ein Link)');
  if (/<(?:header|footer|nav)\b/.test(html)) melde(kurzlink.pfad, 'Kopf, Fuß oder Navigation gehören nicht auf eine Weiterleitung');
  if (/\bcanonical\b/.test(html)) melde(kurzlink.pfad, 'kanonische Adresse gehört nicht auf eine Weiterleitung');
  const links = alle(html, /<a\b[^>]*>([\s\S]*?)<\/a>/g);
  const linkZiele = alle(html, /<a\b[^>]*\bhref="([^"]*)"/g).map(([, ziel]) => entschluesselt(ziel));
  if (links.length !== 1 || linkZiele[0] !== kurzlink.ziel || links[0][1].replace(/<[^>]+>/g, '').trim() !== KURZ_LINKTEXT) melde(kurzlink.pfad, `genau ein Link „${KURZ_LINKTEXT}“ mit dem Ziel erwartet`);
  const text = entschluesselt(html.replace(/<(?:script|style|svg)[\s\S]*?<\/(?:script|style|svg)>/g, ' ').replace(/<head>[\s\S]*?<\/head>/, ' ').replace(/<[^>]+>/g, ' ').replace(/(?:aria-label)="[^"]*"/g, ' ')).replace(/\s+/g, ' ').trim();
  if (text !== KURZ_LINKTEXT) melde(kurzlink.pfad, `als sichtbarer Text nur den Link erwartet, gefunden: ${text}`);
  if (!/<h1\b[^>]*aria-label="FoodAsu"/.test(html)) melde(kurzlink.pfad, 'Überschrift mit dem Namen FoodAsu fehlt');
  for (const [adresse, andere] of seiten) if (andere.includes(`href="${kurzlink.pfad}"`) || andere.includes(`href="${kurzlink.pfad.slice(0, -1)}"`) || andere.includes(`href="${HOST}${kurzlink.pfad}`)) melde(adresse, `verlinkt den Kurzlink ${kurzlink.pfad} (er steht in keiner Navigation und auf keiner Seite)`);
  for (const datei of ['sitemap.xml', 'llms.txt']) {
    const inDatei = existsSync(join(DIST, datei)) ? readFileSync(join(DIST, datei), 'utf8') : '';
    if (inDatei.includes(`${HOST}${kurzlink.pfad}`) || inDatei.includes(`${HOST}${kurzlink.pfad.slice(0, -1)}\n`)) melde(`/${datei}`, `nennt den Kurzlink ${kurzlink.pfad}`);
  }
}
for (const [adresse, html] of seiten) {
  if (/http-equiv="refresh"/i.test(html)) melde(adresse, 'Weiterleitung (meta refresh) gehört nur auf die Kurzlinks');
  if (KURZ_ERLAUBT.includes(adresse)) melde(adresse, 'Kurzlink läuft durch die Prüfung der Seiten');
}

// Fußzeile A (AP-18 Teil D): auf jeder Seite Logo mit Satz und Hinweis, drei Spalten mit ihren Links, die schmale
// Zeile mit dem Vermerk. Facebook und Instagram sind einfache Links; eingebettet wird nichts.
const FUSS_LINKS = ['/datenschutz.html', '/nutzungsbedingungen.html', '/offenlegung/', '/lizenzen/', '/quellen-und-lizenzen/', '/so-gehts/', '/rezepte/', ALTE, '/fragen/', '/daten-und-quellen/', '/ueber-foodasu/'];
const FUSS_TEXTE = [
  'Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt.', 'Maßgeblich ist die Verpackung.', 'Rechtliches', 'Folge uns',
  'Von Anfang an dabei sein.', '© 2026 FoodAsu · Eine App von Ali',
];
for (const [adresse, html] of seiten) {
  const fuss = alle(html, /<footer class="fuss"[\s\S]*?<\/footer>/g);
  if (fuss.length !== 1) { melde(adresse, 'genau eine Fußzeile erwartet'); continue; }
  const inhalt = fuss[0][0];
  // Fließtext der Fußzeile: Auszeichnungen innerhalb einer Zeile (etwa die Sprachangabe um ein englisches Wort)
  // trennen keine Wörter.
  const text = entschluesselt(
    inhalt.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<\/?(?:span|b|i|em|strong)\b[^>]*>/g, '').replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ');
  for (const ziel of FUSS_LINKS) if (!inhalt.includes(`href="${ziel}"`)) melde(adresse, `Fußzeile ohne Link auf ${ziel}`);
  // AP-35A: In der Spalte „Rechtliches“ steht „Nutzungsbedingungen“ direkt unter „Datenschutz“.
  const recht = inhalt.match(/aria-labelledby="fuss-recht">[\s\S]*?<\/nav>/)?.[0] ?? '';
  const rechtLinks = alle(recht, /<a href="([^"]+)"[^>]*>([^<]*)<\/a>/g).map(([, ziel, wort]) => `${wort.trim()} ${ziel}`);
  if (rechtLinks.slice(0, 2).join(' | ') !== 'Datenschutz /datenschutz.html | Nutzungsbedingungen /nutzungsbedingungen.html') melde(adresse, `Fußzeile, Rechtliches: „Nutzungsbedingungen“ direkt unter „Datenschutz“ erwartet, gefunden ${rechtLinks.join(', ')}`);
  for (const satz of FUSS_TEXTE) if (!text.includes(satz)) melde(adresse, `Fußzeile ohne den Text „${satz}“`);
  if (alle(inhalt, /<h2\b/g).length !== 3) melde(adresse, 'Fußzeile: drei Spalten mit Überschrift erwartet');
  if (!/href="mailto:|href="&#/.test(inhalt)) melde(adresse, 'Fußzeile ohne Kontakt per E-Mail');
  for (const dienst of ['facebook.com', 'instagram.com']) {
    if (!new RegExp(`<a class="fuss-knopf" href="https://www\\.${dienst.replace('.', '\\.')}/[^"]*" rel="me noopener">\\s*<svg`).test(inhalt)) melde(adresse, `Fußzeile: Knopf mit Symbol für ${dienst} fehlt`);
  }
  // Seit AP-34 steht im Fuß genau ein Bild: das offizielle Abzeichen von Google Play, lokal, als Link zum Eintrag.
  const abzeichen = alle(inhalt, /<img\b[^>]*>/g);
  if (abzeichen.length !== (store.oeffentlich ? 1 : 0) || abzeichen.some((tag) => !/src="\/bilder\/google-play-abzeichen-de\.png"/.test(tag) || !/alt="Jetzt bei Google Play"/.test(tag))) melde(adresse, 'Fußzeile: erwartet genau das Abzeichen von Google Play als einziges Bild');
  // AP-44: Das Abzeichen führt mit der Kennung des Kanals (utm_campaign=fuss) zum Eintrag; nur auf den Seiten der
  // Rechtstexte (PLAY_OHNE_KENNUNG) bleibt die Adresse ohne Kennung.
  const abzeichenZiel = (PLAY_OHNE_KENNUNG.has(adresse) ? store.adresse : storeLink('fuss')).replaceAll('&', '&amp;');
  if (store.oeffentlich && !new RegExp(`<a class="fuss-abzeichen" href="${abzeichenZiel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" rel="me noopener">\\s*<img\\b`).test(inhalt)) melde(adresse, 'Fußzeile: Abzeichen nicht als Link zum Eintrag bei Google Play (mit Kennung utm_campaign=fuss, auf Seiten mit Rechtstexten ohne)');
  if (/<(?:iframe|script|link)\b/.test(inhalt)) melde(adresse, 'Fußzeile bettet etwas ein (erlaubt sind nur Links, Zeichnungen im Quelltext und das Abzeichen)');
  if (!text.includes('Bald im Play Store') && !inhalt.includes('play.google.com')) melde(adresse, 'Fußzeile ohne Hinweis auf den Play Store');
  if (store.oeffentlich && text.includes('Bald im Play Store')) melde(adresse, 'Fußzeile: „Bald im Play Store“ nach dem öffentlichen Start');
}

// Symbolbilder sind mit Adobe Firefly erzeugt: Jede Datei trägt die IPTC-Angabe DigitalSourceType =
// TrainedAlgorithmicMedia (tools/bilder_bauen.py).
const symbolbilder = dateien.filter((d) => d.includes(join(DIST, 'bilder', 'rezepte')));
if (symbolbilder.length === 0) melde('/bilder/rezepte/', 'keine Symbolbilder gefunden');
for (const datei of symbolbilder) {
  if (!readFileSync(datei).includes('digitalsourcetype/trainedAlgorithmicMedia')) melde(adresseVon(datei), 'IPTC-Angabe DigitalSourceType fehlt');
}

// Bewegung: GSAP steht in keiner Seite als Skript oder Vorab-Laden, sondern wird vom Skript der Startseite
// nachgeladen, und nur ohne "Bewegung reduzieren". Jede CSS-Animation liegt in einer Abfrage "no-preference".
const start = seiten.get('/') ?? '';
const gsapDateien = dateien.filter((d) => d.endsWith('.js') && /ScrollTrigger/.test(readFileSync(d, 'utf8')));
if (gsapDateien.length !== 1) melde('/', `genau eine Datei mit GSAP erwartet, gefunden: ${gsapDateien.length}`);
for (const [adresse, html] of seiten) {
  for (const datei of gsapDateien) if (html.includes(adresseVon(datei))) melde(adresse, 'GSAP ist fest eingebunden (soll erst nach dem ersten Zeichnen geladen werden)');
}
const startSkripte = alle(start, /<script[^>]*\bsrc="([^"]+)"/g).map(([, pfad]) => readFileSync(join(DIST, pfad), 'utf8'));
startSkripte.push(...alle(start, /<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g).map(([, inhalt]) => inhalt));
if (!startSkripte.some((inhalt) => /prefers-reduced-motion: reduce/.test(inhalt) && /import\(/.test(inhalt))) {
  melde('/', 'Skript der Startseite: Nachladen mit Abfrage "prefers-reduced-motion" nicht gefunden');
}
for (const datei of dateien.filter((d) => d.endsWith('.css'))) {
  // Abfragen "no-preference" samt Inhalt entfernen; was an "animation" übrig bleibt, liefe auch mit "Bewegung reduzieren".
  let rest = readFileSync(datei, 'utf8');
  for (let ort = rest.indexOf('@media (prefers-reduced-motion:no-preference)'); ort >= 0; ort = rest.indexOf('@media (prefers-reduced-motion:no-preference)')) {
    let tiefe = 0;
    let ende = rest.indexOf('{', ort);
    do { if (rest[ende] === '{') tiefe++; else if (rest[ende] === '}') tiefe--; ende++; } while (tiefe > 0 && ende < rest.length);
    rest = rest.slice(0, ort) + rest.slice(ende);
  }
  const frei = rest.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '').match(/[^{}]*\{[^{}]*\b(?:animation|transition)\s*:[^{}]*\}/);
  if (frei) melde(adresseVon(datei), `Animation außerhalb der Abfrage "no-preference": ${frei[0].trim().slice(0, 100)}`);
}

// Offenlegung (AP-17 Teil E1): eigene Seite mit noindex und dem Satz zur grundlegenden Richtung; auf der Startseite
// steht kein Block mehr, nur der Link im Fuß mit id="offenlegung", damit alte Verweise auf /#offenlegung ankommen.
const RICHTUNG = 'Grundlegende Richtung: Diese Website stellt die App FoodAsu vor, zeigt eine Auswahl an Rezepten mit Hinweisen zu den Zutaten und enthält die Datenschutzerklärung der App.';
const offenlegung = seiten.get('/offenlegung/');
if (!offenlegung) melde('/offenlegung/', 'Seite fehlt');
else {
  if (!/<meta name="robots" content="noindex/.test(offenlegung)) melde('/offenlegung/', 'noindex fehlt');
  if (!sichtbar(offenlegung).includes(RICHTUNG)) melde('/offenlegung/', 'Satz zur grundlegenden Richtung fehlt oder weicht ab');
}
for (const [adresse, html] of seiten) {
  if (!html.includes('href="/offenlegung/"')) melde(adresse, 'Link auf die Offenlegung fehlt');
  const marken = alle(html, /<([a-z0-9]+)\b[^>]*\bid="offenlegung"[^>]*>/g);
  if (adresse === '/') {
    if (marken.length !== 1 || marken[0][1] !== 'a' || !marken[0][0].includes('href="/offenlegung/"')) melde('/', 'im Fuß fehlt der Link mit id="offenlegung"');
    if (sichtbar(html).includes('Grundlegende Richtung')) melde('/', 'die Offenlegung steht noch auf der Startseite');
  } else if (marken.length > 0) melde(adresse, 'id="offenlegung" gehört nur auf die Startseite');
}
// "So geht's" (Karte C, AP-18 Teil E; neu gebaut in AP-19 Teil G): Übersicht und acht Kapitel, alle im Index (die
// Sitemap prüft der nächste Abschnitt). Die Übersicht verlinkt jedes Kapitel. Jedes Kapitel hat seine Abschnitte, jeder
// mit seinem festen Anker aus den Daten; eine Funktion steht mit ihrem Nutzen und dem Weg in der App da, ohne
// nummerierte Schrittfolge. Das Kapitel zeigt genau die Bildschirmfotos aus den Daten (höchstens eines je Abschnitt,
// höchstens 45 im ganzen Bereich: Das prüfen die Daten beim Laden), jedes mit Beschreibung, Maßen und, bis auf das
// erste Foto und das Standbild der Schleife, erst beim Scrollen geladen; jedes steht im Handy-Rahmen und ist oberhalb
// der Tasten von Android abgeschnitten (AP-19 Teil H); es führt zum vorigen und zum nächsten
// Kapitel und zurück zur Übersicht. Die 404-Seite führt mit ihrem Knopf zur Anleitung, und llms.txt
// nennt die Übersicht und alle Kapitel.
const KAPITEL_ZAHL = 8;
const soGehts = seiten.get(BEREICH);
if (!soGehts) melde(BEREICH, 'Seite fehlt');
else {
  if (soGehts.includes('noindex')) melde(BEREICH, 'steht noch auf noindex');
  for (const eintrag of kapitel) if (!soGehts.includes(`href="${kapitelAdresse(eintrag)}"`)) melde(BEREICH, `Kachel für „${eintrag.titel}“ fehlt`);
}
if (kapitel.length !== KAPITEL_ZAHL) melde(BEREICH, `${KAPITEL_ZAHL} Kapitel erwartet, gefunden: ${kapitel.length}`);
kapitel.forEach((eintrag, stelle) => {
  const adresse = kapitelAdresse(eintrag);
  const html = seiten.get(adresse);
  if (!html) { melde(adresse, 'Seite fehlt'); return; }
  if (html.includes('noindex')) melde(adresse, 'steht auf noindex');
  const text = sichtbar(html);
  for (const teil of eintrag.teile) {
    if (!text.includes(teil.titel)) melde(adresse, `Abschnitt „${teil.titel}“ fehlt`);
    if (!new RegExp(`<h2 id="${teil.anker}"`).test(html)) melde(adresse, `Anker fehlt: #${teil.anker}`);
    if ((teil.funktionen ?? []).length > 0 && !(teil.nutzen && teil.wo)) melde(adresse, `Abschnitt „${teil.titel}“ ohne Nutzen oder ohne Weg in der App`);
  }
  const wege = eintrag.teile.filter((teil) => teil.wo).length;
  if (alle(html, /<p class="g-wo"/g).length !== wege) melde(adresse, `Weg in der App: ${wege} erwartet`);
  // Die Krümel im Kopf sind die einzige nummerierte Liste der Seite.
  if (alle(html, /<ol[ >]/g).length > 1) melde(adresse, 'nummerierte Schrittfolge gefunden; die Anleitung nennt nur Nutzen und Weg');
  const bilder = alle(html, /<img\b[^>]*src="\/bilder\/sogehts\/([^"]+)"[^>]*>/g);
  const erwartet = fotosVon(eintrag).map((foto) => `${foto.name}-720.webp`);
  const gezeigt = bilder.map(([, datei]) => datei).filter((datei) => !datei.startsWith('film-'));
  if ([...gezeigt].sort().join(' ') !== [...erwartet].sort().join(' ')) melde(adresse, `Bildschirmfotos passen nicht zu den Daten: erwartet ${erwartet.length}, gefunden ${gezeigt.length}`);
  if (gezeigt.length < 1) melde(adresse, 'mindestens ein Bildschirmfoto erwartet');
  for (const [marke, datei] of bilder) {
    if (!vorhanden.has(`/bilder/sogehts/${datei}`)) melde(adresse, `Bild fehlt: ${datei}`);
    if (!/\balt="[^"]{20,}"/.test(marke)) melde(adresse, `Bild ohne Beschreibung: ${datei}`);
    if (/original/.test(datei)) melde(adresse, `Bild aus dem Ordner der Originale: ${datei}`);
    // AP-19 Teil H: Ein Bild in voller Höhe (720 x 1491) zeigt unten die Tasten von Android.
    if (/\bheight="1491"/.test(marke)) melde(adresse, `Bild in voller Höhe, mit den Tasten von Android: ${datei}`);
  }
  // Jedes Bild steht im Handy-Rahmen (AP-19 Teil H).
  if (alle(html, /<div class="geraet-rahmen"/g).length !== bilder.length) melde(adresse, `Handy-Rahmen: ${bilder.length} erwartet, einer je Bild`);
  const sofort = bilder.filter(([marke]) => !/\bloading="lazy"/.test(marke)).length;
  if (sofort > 2) melde(adresse, `höchstens zwei Bilder laden sofort, gefunden: ${sofort}`);
  const film = html.match(/data-film="([^"]+)"/);
  if (Boolean(film) !== Boolean(eintrag.film)) melde(adresse, 'Schleife passt nicht zu den Daten');
  if (film && !vorhanden.has(film[1])) melde(adresse, `Schleife fehlt: ${film[1]}`);
  if (/<video\b|autoplay/.test(html)) melde(adresse, 'Die Schleife steht fest im Quelltext; sie darf nur mit Bewegung per Skript entstehen');
  const nachbarn = [kapitel[stelle - 1], kapitel[stelle + 1]].filter(Boolean).map(kapitelAdresse);
  for (const ziel of [BEREICH, ...nachbarn]) if (!html.includes(`href="${ziel}"`)) melde(adresse, `Link fehlt: ${ziel}`);
});
// Jedes Bild im Ordner gehört zu einer Seite: Was keine Seite zeigt, liegt nicht auf der Website.
const gebraucht = new Set([...kapitel.flatMap((eintrag) => fotosVon(eintrag).map((foto) => foto.name)), ...einblick.karten.map((karte) => karte.datei.replaceAll('_', '-'))]);
for (const datei of [...vorhanden].filter((pfad) => pfad.startsWith('/bilder/sogehts/') && pfad.endsWith('.webp') && !pfad.includes('/film-'))) {
  const name = datei.slice('/bilder/sogehts/'.length).replace(/-\d+\.webp$/, '');
  if (!gebraucht.has(name)) melde(BEREICH, `Bild ohne Seite: ${datei}`);
}
// Startseite, Abschnitt "FoodAsu im Bild" (AP-19 Teil G): fünf bis sechs Bildschirmfotos, jedes mit einem Link auf
// eine Stelle der Anleitung, die es gibt (die Sprungmarke prüft die Linkprüfung oben).
const startseite = seiten.get('/') ?? '';
if (einblick.karten.length < 5 || einblick.karten.length > 6) melde('/', `Abschnitt „${einblick.ueberschrift}“: fünf bis sechs Bilder erwartet, gefunden: ${einblick.karten.length}`);
for (const karte of einblick.karten) {
  if (!karte.ziel.startsWith(BEREICH)) melde('/', `Abschnitt „${einblick.ueberschrift}“: Ziel außerhalb der Anleitung: ${karte.ziel}`);
  if (!startseite.includes(`href="${karte.ziel}"`)) melde('/', `Abschnitt „${einblick.ueberschrift}“: Link fehlt: ${karte.ziel}`);
  if (!startseite.includes(`/bilder/sogehts/${karte.datei.replaceAll('_', '-')}-720.webp`)) melde('/', `Abschnitt „${einblick.ueberschrift}“: Bild fehlt: ${karte.datei}`);
}
const einblickTeil = startseite.match(/<section class="einblick" id="einblick">[\s\S]*?<\/section>/)?.[0] ?? '';
if (alle(einblickTeil, /<div class="geraet-rahmen"/g).length !== einblick.karten.length) melde('/', `Abschnitt „${einblick.ueberschrift}“: jedes Bild im Handy-Rahmen erwartet`);
// Auftrag SEO 1 neu, Teil 1 Nr. 9 und Teil 2 Nr. 12: am Handy eine Zeitleiste, je Karte der Link „In der Anleitung“
// mit einem Zusatz nur für Bildschirmleser, der das Ziel nennt; kein seitliches Wischen mehr.
for (const karte of einblick.karten) {
  if (!new RegExp(`<a href="${karte.ziel}"><span class="mehr-wort">${einblick.mehr}</span><span class="vh"> zu „${karte.titel.replace(/[?]/g, '\\?')}“</span>`).test(einblickTeil)) melde('/', `„${einblick.ueberschrift}“: Link „${einblick.mehr}“ mit Zusatz für Bildschirmleser fehlt bei „${karte.titel}“`);
}
if (!/<span class="einblick-linie" aria-hidden="true">/.test(einblickTeil)) melde('/', `„${einblick.ueberschrift}“: Linie der Zeitleiste fehlt oder ist für Bildschirmleser nicht ausgeblendet`);
if (kapitel.filter((eintrag) => eintrag.film).length > 3) melde(BEREICH, 'höchstens drei Schleifen (Karte C)');
// Kein Link nach außen in "So geht's" (Ali, 11.10.2026; AP-27 Teil B): dieselbe Sperre wie am Ende des Baus
// (tools/sogehts_links.mjs). Erlaubt sind relative Links, Anker und Links auf https://foodasu.com/.
{
  const sperre = sogehtsLinks(DIST);
  if (sperre.seiten !== kapitel.length + 1) melde(BEREICH, `Sperre gegen Links nach außen: ${sperre.seiten} Seiten geprüft, erwartet ${kapitel.length + 1}`);
  for (const fund of sperre.funde) melde(fund.seite, `Link nach außen in „So geht's“${fund.ort === 'Fußzeile' ? ' (Fußzeile)' : ''}: ${fund.link}`);
}
// Keine Preisaussage (Ali und Projektleitung, 11.10.2026; AP-29): dieselbe Sperre wie am Ende des Baus
// (tools/preisaussagen.mjs), über jede Datei des Baus. Auf der Website steht keine Aussage zum Preis von FoodAsu,
// auch nicht über Code oder Metadaten; die Bezahl-Liste oben prüft daneben wie bisher den sichtbaren Text der Seiten.
const preisSperre = preisaussagen(DIST);
if (preisSperre.dateien !== dateien.length) melde('/', `Sperre gegen Preisaussagen: ${preisSperre.dateien} Dateien durchsucht, im Bau liegen ${dateien.length}`);
for (const fund of preisSperre.funde) melde(fund.datei, `Preisaussage: „${fund.wort}“ steht im Bau („… ${fund.umgebung} …“)`);
const nichtGefunden = seiten.get('/404.html') ?? '';
if (!/<a class="knopf hell" href="\/so-gehts\/"/.test(nichtGefunden)) melde('/404.html', "der Knopf „So geht's“ führt nicht zur Anleitung");
const llms = existsSync(join(DIST, 'llms.txt')) ? readFileSync(join(DIST, 'llms.txt'), 'utf8') : '';
for (const ziel of [BEREICH, ...kapitel.map(kapitelAdresse)]) if (!llms.includes(`(${HOST}${ziel})`)) melde('llms.txt', `Eintrag fehlt: ${ziel}`);
// llms.txt nennt jede Seite im Index mit ihrer Beschreibung und keine Seite mit noindex (AP-18 Nachtrag Meta).
const llmsZeilen = llms.split('\n');
for (const { adresse, beschreibung } of metaZeilen) {
  const zeile = llmsZeilen.find((eine) => eine.includes(`](${HOST}${adresse})`));
  if (OHNE_INDEX.has(adresse)) { if (zeile) melde('llms.txt', `Seite mit noindex ist genannt: ${adresse}`); continue; }
  if (!zeile) melde('llms.txt', `Seite fehlt: ${adresse}`);
  else if (!zeile.endsWith(`: ${beschreibung}`)) melde('llms.txt', `Beschreibung weicht von der Seite ab: ${adresse}`);
}

// Sitemap und robots.txt
for (const datei of ['sitemap.xml', 'robots.txt', '404.html']) if (!existsSync(join(DIST, datei))) melde(datei, 'fehlt');
if (existsSync(join(DIST, 'sitemap.xml'))) {
  const karte = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  const eintraege = alle(karte, /<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g);
  if (eintraege.length !== alle(karte, /<url>/g).length) melde('sitemap.xml', 'Eintrag ohne lastmod');
  for (const [, ort] of eintraege) {
    const adresse = ort.replace(HOST, '');
    if (!seiten.has(adresse)) melde('sitemap.xml', `Seite fehlt: ${ort}`);
    else if (seiten.get(adresse).includes('noindex')) melde('sitemap.xml', `Seite mit noindex: ${ort}`);
  }
  // Die Sitemap enthält genau die Seiten im Index: jede ohne noindex, keine der drei Seiten mit noindex.
  for (const adresse of seiten.keys()) {
    const eingetragen = karte.includes(`<loc>${HOST + adresse}</loc>`);
    if (OHNE_INDEX.has(adresse) && eingetragen) melde('sitemap.xml', `Seite mit noindex ist eingetragen: ${adresse}`);
    if (!OHNE_INDEX.has(adresse) && !eingetragen) melde('sitemap.xml', `Seite nicht eingetragen: ${adresse}`);
  }
  if (eintraege.length !== seiten.size - OHNE_INDEX.size) melde('sitemap.xml', `${eintraege.length} Einträge, erwartet ${seiten.size - OHNE_INDEX.size}`);
}
if (!seiten.get('/')?.includes('facebook.com')) hinweise.push('Fuß: Adresse der Facebook-Seite fehlt (src/daten/seite.mjs)');
// sitemap.xml (AP-22 Teil 1 Nr. 1): Der Tag der letzten Änderung kommt aus Git und liegt nie in der Zukunft; die
// Anleitung steht mit Übersicht und allen Kapiteln in der Datei.
if (existsSync(join(DIST, 'sitemap.xml'))) {
  const karte = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  // Ein Tag Spielraum: Git nennt den Tag in der Zeitzone des Commits, der Bau bei GitHub läuft in Weltzeit.
  const morgen = new Date(Date.now() + 86400000).toLocaleDateString('sv-SE');
  for (const [, ort, tag] of alle(karte, /<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)) {
    if (tag > morgen || tag < '2026-10-01') melde('sitemap.xml', `Tag der letzten Änderung unplausibel: ${ort} ${tag}`);
  }
  for (const ziel of [BEREICH, ...kapitel.map(kapitelAdresse)]) if (!karte.includes(`<loc>${HOST}${ziel}</loc>`)) melde('sitemap.xml', `Seite der Anleitung fehlt: ${ziel}`);
}
// robots.txt (AP-22 Teil 1 Nr. 4): alles erlaubt, die Bots der großen Anbieter ausdrücklich genannt, die Zeile zur
// Sitemap bleibt.
const ROBOTS_BOTS = [
  'Googlebot', 'Googlebot-Image', 'Google-Extended', 'bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot',
  'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Applebot', 'Applebot-Extended', 'CCBot',
  'facebookexternalhit', 'meta-externalagent', 'meta-externalfetcher',
];
if (existsSync(join(DIST, 'robots.txt'))) {
  const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8').split(/\r?\n/).map((zeile) => zeile.trim());
  const regeln = robots.filter((zeile) => zeile && !zeile.startsWith('#'));
  if (regeln.some((zeile) => /^disallow\s*:/i.test(zeile))) melde('robots.txt', 'enthält eine Sperre (Disallow); alles soll erlaubt sein');
  if (regeln.some((zeile) => !/^(user-agent\s*:\s*\S+|allow\s*:\s*\/|sitemap\s*:\s*\S+)$/i.test(zeile))) melde('robots.txt', 'enthält eine Zeile, die weder User-agent, Allow: / noch Sitemap ist');
  if (!regeln.includes('User-agent: *')) melde('robots.txt', 'Block für alle Bots fehlt');
  if (!regeln.includes(`Sitemap: ${HOST}/sitemap.xml`)) melde('robots.txt', 'Zeile zur Sitemap fehlt');
  for (const bot of ROBOTS_BOTS) if (!regeln.includes(`User-agent: ${bot}`)) melde('robots.txt', `Bot nicht genannt: ${bot}`);
  // Jeder Block endet mit "Allow: /": Nach der letzten Zeile "User-agent" eines Blocks folgt die Erlaubnis.
  regeln.forEach((zeile, nummer) => {
    if (/^user-agent/i.test(zeile) && !/^(user-agent|allow)/i.test(regeln[nummer + 1] ?? '')) melde('robots.txt', `Block ohne Allow: ${zeile}`);
  });
}
// Seite "Daten und Quellen" (AP-22 Teil 1 Nr. 5) und der Satz zum Medizinprodukt (Nr. 6): Der Satz steht wörtlich auf
// der Startseite, unter /fragen/ und auf "Daten und Quellen"; der frühere Satz steht nirgends mehr. Die neue Seite
// verlinkt die Einzelnachweise und steht im Index.
const textVon = (adresse) => entschluesselt((seiten.get(adresse) ?? '').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
for (const adresse of ['/', '/fragen/', '/daten-und-quellen/']) {
  if (!seiten.has(adresse)) { melde(adresse, 'Seite fehlt'); continue; }
  if (!textVon(adresse).includes(MEDIZIN)) melde(adresse, 'Satz zum Medizinprodukt fehlt oder weicht ab');
}
for (const [adresse, html] of seiten) if (/medizinisches Hilfsmittel/.test(html)) melde(adresse, 'der frühere Satz zum medizinischen Hilfsmittel steht noch da');
const datenInhalt = (seiten.get('/daten-und-quellen/') ?? '').match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
for (const ziel of ['/quellen-und-lizenzen/', '/lizenzen/', '/datenschutz.html']) if (!datenInhalt.includes(`href="${ziel}"`)) melde('/daten-und-quellen/', `Link fehlt: ${ziel}`);
for (const wort of ['Open Food Facts', 'BLS 4.0', 'Adobe Firefly', 'laut Daten', 'Maßgeblich ist immer die Verpackung.']) if (!textVon('/daten-und-quellen/').includes(wort)) melde('/daten-und-quellen/', `Angabe fehlt: ${wort}`);
if (OHNE_INDEX.has('/daten-und-quellen/')) melde('/daten-und-quellen/', 'steht auf noindex');
// Satz zur Beschreibung (AP-22 Teil 2 Nr. 1; Wortlaut seit dem Nachtrag zu AP-23 in der Fassung der Änderung vom
// 11.10.2026): wörtlich und sichtbar auf der Startseite und auf "Über FoodAsu", dazu als Beschreibung in Organization
// und WebSite. Die Einkaufswoche behält den Anker #schritte und verlinkt die Seite
// "Zu Hause schreiben, im Laden abhaken"; beschrieben ist nur, was 0.14.3 kann.
const KERNSATZ = 'FoodAsu verbindet Einkaufsliste und Lebensmittel-Scanner in einer App für den ganzen Haushalt.';
const BESCHREIBUNG = `${KERNSATZ} Beim Scannen zeigt die App für jede Person einzeln, ob laut den Angaben zum Produkt etwas drin ist, das sie meidet. Dazu kommen über ${UEBER} Rezepte. Ohne Konto, ohne Werbung.`;
for (const adresse of ['/ueber-foodasu/']) {
  if (!seiten.has(adresse)) { melde(adresse, 'Seite fehlt'); continue; }
  if (!textVon(adresse).includes(BESCHREIBUNG)) melde(adresse, 'Satz zur Beschreibung fehlt oder weicht ab');
}
const startDaten = alle(startseite, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } });
for (const art of ['Organization', 'WebSite']) {
  const block = startDaten.find((einer) => einer['@type'] === art);
  if (block?.description !== BESCHREIBUNG) melde('/', `${art}: Beschreibung fehlt oder weicht ab`);
  if (block && JSON.stringify(block).includes('address')) melde('/', `${art}: Anschrift gehört nicht in die strukturierten Daten`);
}
const organisation = startDaten.find((einer) => einer['@type'] === 'Organization');
if (!organisation?.logo || !(organisation.sameAs ?? []).some((ziel) => ziel.includes('facebook.com')) || !(organisation.sameAs ?? []).some((ziel) => ziel.includes('instagram.com'))) melde('/', 'Organization: Logo oder Links zu Facebook und Instagram fehlen');
const wochenTeil = startseite.match(/<section class="schritte" id="schritte">[\s\S]*?<\/section>/)?.[0] ?? '';
if (!wochenTeil) melde('/', 'Abschnitt mit dem Anker #schritte fehlt');
else {
  // Auftrag SEO 1 neu, Teil 1 Nr. 5: drei Schritte (bis dahin vier).
  if (alle(wochenTeil, /<li class="schritt">/g).length !== 3) melde('/', 'Einkaufswoche: drei Schritte erwartet');
  if (alle(wochenTeil, /<h3>[^<]+<\/h3>/g).length !== 3) melde('/', 'Einkaufswoche: je Schritt ein Titel als h3 erwartet');
  if (!wochenTeil.includes('href="/so-gehts/zu-hause-schreiben-im-laden-abhaken/')) melde('/', 'Einkaufswoche: Link auf „Zu Hause schreiben, im Laden abhaken“ fehlt');
  for (const schritt of startSchritte.liste) {
    if (!schritt.ziel.startsWith(BEREICH)) melde('/', `Einkaufswoche: „${schritt.titel}“ führt nicht in die Anleitung`);
    if (!wochenTeil.includes(`<a href="${schritt.ziel}"><span class="mehr-wort">${startSchritte.mehr}</span><span class="vh"> ${schritt.ort}</span>`)) melde('/', `Einkaufswoche: Link „${startSchritte.mehr}“ mit Zusatz für Bildschirmleser fehlt bei „${schritt.titel}“`);
  }
  if (!entschluesselt(wochenTeil).includes(`<p class="unterzeile">${startSchritte.unterzeile}</p>`) || !/Einkaufslisten-App/.test(startSchritte.unterzeile)) melde('/', 'Einkaufswoche: Unterzeile mit „Einkaufslisten-App“ fehlt');
  if (!wochenTeil.includes('href="/so-gehts/"')) melde('/', 'Einkaufswoche: Knopf zur ganzen Anleitung fehlt');
  if (alle(wochenTeil, /<div class="geraet-rahmen"/g).length !== 3) melde('/', 'Einkaufswoche: je Schritt ein Bildschirmfoto im Handy-Rahmen erwartet');
  if (!/<span class="weg-linie" aria-hidden="true"><i data-linie="schritte"><\/i><\/span>/.test(wochenTeil)) melde('/', 'Einkaufswoche: Linie der Zeitleiste fehlt');
}
// Nichts aus dem Fahrplan: kein Abhaken beim Scannen, kein Teilen von Rezepten in der App.
for (const adresse of ['/', '/ueber-foodasu/']) {
  for (const fund of alle(textVon(adresse), /beim Scannen ab(?:ge)?hak|Scannen hakt|hakt beim Scannen|Rezepte? (?:in der App )?teilen/gi)) melde(adresse, `beschreibt etwas aus dem Fahrplan: ${fund[0]}`);
}
if (!/als Text teilen/.test(textVon('/'))) melde('/', 'die Karte zur Einkaufsliste nennt „als Text teilen“ nicht');
// Entscheidungen Ali vom 10.10.2026 (AP-22 Teil 2). Nr. 2: In der Antwort "Ersetzt FoodAsu die Verpackung?" steht
// "Maßgeblich ist immer die Verpackung." nur einmal (im Satz zum Medizinprodukt). Nr. 5: Schritt 3 der Einkaufswoche
// nennt "Warum?". Nr. 9: Einkaufsliste im Alltag auf der Startseite und auf "Über FoodAsu", ohne Namen anderer
// Dienste. Nr. 4: "Über FoodAsu" nennt Ali Tonc und verlinkt "Daten und Quellen".
for (const adresse of ['/', '/fragen/']) {
  if (/Daten können fehlen oder veraltet sein\. Maßgeblich ist immer die Verpackung\. FoodAsu ist kein Medizinprodukt/.test(textVon(adresse))) melde(adresse, 'Antwort „Ersetzt FoodAsu die Verpackung?“: „Maßgeblich ist immer die Verpackung.“ steht doppelt');
}
// Seit dem Auftrag SEO 1 neu nennt der kurze Satz der Karte „Scannen und sofort sehen“ das „Warum?“ (Entscheidung 5 vom
// 10.10.2026: Die Startseite erklärt, dass „Warum?“ die Zutat oder Spurenangabe zeigt).
const funktionTeil = startseite.match(/<section class="mehr" id="funktionen">[\s\S]*?<\/section>/)?.[0] ?? '';
if (!entschluesselt(funktionTeil).includes('„Warum?“')) melde('/', 'Funktionen: die Karte zum Scannen nennt „Warum?“ nicht');
for (const adresse of ['/', '/ueber-foodasu/']) {
  for (const wort of ['bleib', 'Erledigt', 'schon einmal aufgeschrieben', 'laut Daten']) if (!textVon(adresse).includes(wort)) melde(adresse, `Einkaufsliste im Alltag: Angabe fehlt: ${wort}`);
  for (const fund of alle(textVon(adresse), /whatsapp|telegram|signal|messenger|threema/gi)) melde(adresse, `nennt einen anderen Dienst: ${fund[0]}`);
}
const ueberInhalt = (seiten.get('/ueber-foodasu/') ?? '').match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
if (!ueberInhalt.includes('href="/daten-und-quellen/"')) melde('/ueber-foodasu/', 'Link auf „Daten und Quellen“ fehlt');
if (!textVon('/ueber-foodasu/').includes('Ali Tonc')) melde('/ueber-foodasu/', 'der Name Ali Tonc fehlt');

// AP-23 (Website neu gestalten), Teil B Nr. 10: Farbprüfung. Jede Farbe kommt aus den Variablen in
// src/styles/basis.css. In den anderen Stildateien, in den Stilen der Komponenten und im gebauten HTML steht kein
// fester Farbwert (kein Hex-Wert, kein rgb() oder hsl() mit Zahlen, kein Farbname). Ausgenommen ist nur
// src/styles/geraet.css mit den Abbildungen der App im Handy-Rahmen. In basis.css steht ein fester Farbwert nur in der
// Festlegung einer Variable. Grün (Teil B Nr. 4) und die Variablen --mint, --on-mint und --strich stehen nirgends,
// auch nicht in den beiden ausgenommenen Dateien; ebenso nicht das dunkle Indigo der früheren Flächen.
const STILORDNER = 'src/styles';
const FARBEN_FEST = new Set(['basis.css', 'geraet.css']);
const FARBNAMEN = [
  'white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey', 'silver', 'navy',
  'teal', 'aqua', 'cyan', 'magenta', 'lime', 'maroon', 'olive', 'fuchsia', 'indigo', 'violet', 'lavender', 'gold',
  'brown', 'beige', 'ivory', 'crimson', 'coral', 'salmon', 'khaki', 'plum', 'orchid', 'tan', 'turquoise', 'mintcream',
  'whitesmoke', 'ghostwhite', 'snow', 'linen', 'gainsboro', 'dimgray', 'dimgrey', 'slategray', 'slategrey',
  'lightgray', 'lightgrey', 'darkgray', 'darkgrey', 'rebeccapurple',
];
const FESTE_FARBE = new RegExp(`#[0-9a-f]{3,8}(?![0-9a-z_-])|\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\(\\s*[-+.\\d]|\\bcolor\\(|(?<![\\w-])(?:${FARBNAMEN.join('|')})(?![\\w-])`, 'i');
const GRUEN = /#?(?:b8f0d2|00382a|c9f3dd|1f6f54|1c3a34)\b|184[\s,]+240[\s,]+210|63[\s,]+191[\s,]+143|--(?:on-)?mint\b|--strich\b/i;
const DUNKLE_FLAECHE = /#16123f/i;
// Festlegungen einer Stildatei als Liste aus { name, wert }. Kommentare zählen nicht.
const festlegungen = (css) => {
  const ohneKommentar = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
  return alle(ohneKommentar, /\{([^{}]*)\}/g).flatMap(([, block]) =>
    block.split(';').map((teil) => teil.match(/^\s*([\w-]+)\s*:\s*([\s\S]+)$/)).filter(Boolean).map(([, name, wert]) => ({ name, wert: wert.trim() })));
};
// Ein Wert ohne die Verweise auf Variablen: Was übrig bleibt, darf keine Farbe nennen.
const ohneVariablen = (wert) => wert.replace(/var\(--[\w-]+\)/g, ' ');
const farbBefund = (wert) => ohneVariablen(wert).match(FESTE_FARBE)?.[0];
const stilDateien = existsSync(STILORDNER) ? readdirSync(STILORDNER).filter((name) => name.endsWith('.css')) : [];
if (stilDateien.length === 0) melde(STILORDNER, 'Farbprüfung: Stildateien nicht gefunden (der Lauf braucht den Quelltext unter src/styles)');
for (const name of stilDateien) {
  const css = readFileSync(join(STILORDNER, name), 'utf8');
  if (GRUEN.test(css)) melde(`${STILORDNER}/${name}`, `Farbprüfung: Grün oder eine entfallene Variable steht in der Datei: ${css.match(GRUEN)[0]}`);
  if (DUNKLE_FLAECHE.test(css)) melde(`${STILORDNER}/${name}`, 'Farbprüfung: das dunkle Indigo der früheren Flächen (#16123f) steht in der Datei');
  if (name === 'geraet.css') continue;
  for (const { name: eigenschaft, wert } of festlegungen(css)) {
    const fund = farbBefund(wert);
    if (!fund) continue;
    // In basis.css legt eine Variable ihre Farbe fest; überall sonst ist ein fester Farbwert ein Befund.
    if (name === 'basis.css' && eigenschaft.startsWith('--')) continue;
    melde(`${STILORDNER}/${name}`, `Farbprüfung: fester Farbwert „${fund}“ in „${eigenschaft}: ${wert.slice(0, 80)}“${FARBEN_FEST.has(name) ? ' (in basis.css nur in der Festlegung einer Variable erlaubt)' : ''}`);
  }
}
// Stile in den Komponenten und Seiten (style-Blöcke im Quelltext).
const quellDateien = (ordner) => existsSync(ordner)
  ? readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    return statSync(pfad).isDirectory() ? quellDateien(pfad) : [pfad];
  })
  : [];
for (const datei of quellDateien('src').filter((pfad) => pfad.endsWith('.astro'))) {
  const quelle = readFileSync(datei, 'utf8');
  for (const [, css] of alle(quelle, /<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const { name: eigenschaft, wert } of festlegungen(css)) {
      const fund = farbBefund(wert);
      if (fund) melde(datei.split(sep).join('/'), `Farbprüfung: fester Farbwert „${fund}“ in „${eigenschaft}: ${wert.slice(0, 80)}“`);
    }
  }
}
// Gebautes HTML: Stile an Elementen und Farbangaben an SVG-Elementen.
const FARB_ATTRIBUT = /\s(fill|stroke|color|stop-color|flood-color|lighting-color|bgcolor|background)="([^"]*)"/g;
const FARBE_ERLAUBT = /^(?:none|currentcolor|transparent|inherit|var\(--[\w-]+\)|url\(#[\w-]+\))$/i;
let farbStellen = 0;
for (const [adresse, html] of seiten) {
  const ohneSkript = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
  for (const [, stil] of alle(ohneSkript, /\sstyle="([^"]*)"/g)) {
    farbStellen++;
    for (const teil of entschluesselt(stil).split(';')) {
      const fund = farbBefund(teil.slice(teil.indexOf(':') + 1));
      if (fund) melde(adresse, `Farbprüfung: fester Farbwert „${fund}“ im Stil eines Elements: ${teil.trim().slice(0, 80)}`);
    }
  }
  for (const [, name, wert] of alle(ohneSkript.replace(/<meta[^>]*>/g, ' '), FARB_ATTRIBUT)) {
    farbStellen++;
    if (!FARBE_ERLAUBT.test(wert.trim())) melde(adresse, `Farbprüfung: fester Farbwert im Attribut ${name}="${wert}"`);
  }
}
// Grün und das dunkle Indigo im ganzen Bau (HTML, Stile, Skripte, Vektorbilder).
// Einzige Ausnahme von „kein Grün, nirgends“ (Ali, 23.10.2026, AP-34 Fortsetzung): das offizielle Abzeichen von Google
// Play, public/bilder/google-play-abzeichen-de.png (Bild von Google, Farben dürfen nicht geändert werden). Es ist eine
// PNG und liegt damit außerhalb dieser Prüfung, die nur Textdateien liest; keine andere Datei ist ausgenommen.
for (const datei of dateien.filter((pfad) => /\.(?:html|css|js|svg|txt|xml)$/.test(pfad))) {
  const inhalt = readFileSync(datei, 'utf8');
  const name = '/' + relative(DIST, datei).split(sep).join('/');
  if (GRUEN.test(inhalt)) melde(name, `Farbprüfung: Grün oder eine entfallene Variable steht im Bau: ${inhalt.match(GRUEN)[0]}`);
  if (DUNKLE_FLAECHE.test(inhalt)) melde(name, 'Farbprüfung: das dunkle Indigo der früheren Flächen (#16123f) steht im Bau');
}

// AP-23, Teil A, C und D: Texte und Aufbau.
// Startseite: der Absatz mit Unterschrift im Wortlaut der Projektleitung (ohne Doppelpunkt), darunter die Unterschrift
// und der Link auf "Über FoodAsu"; die Bänder stehen still (kein laufendes Band); der Tisch und die kleine
// Einkaufsliste schmücken nur; die Anker #schritte und #fragen bleiben.
// Wortlaut seit dem Auftrag SEO 1 neu (14.10.2026, Teil 1 Nr. 3): kürzer wie im Entwurf, mit dem Satz zum
// Einkaufszettel aus dem Vorschlag; "laut den Angaben" bleibt. Je Satz ein Absatz (am Handy höchstens drei Zeilen).
const ABSATZ_START = [
  'Ehrlich gesagt war mir die Einkaufsliste jede Woche eine Qual.',
  'Mit FoodAsu bleiben meine Listen gespeichert, und beim Scannen sehe ich, was laut den Angaben im Produkt ist.',
  'Den Einkaufszettel aus Papier brauche ich dafür nicht mehr.',
];
// Die wechselnden Wörter nach "Einkaufen ohne", in dieser Reihenfolge; die letzten zwei sind keine Einträge zum Meiden.
const WORT_MARKEN = ['Nüsse', 'Gluten', 'Eier', 'Alkohol', 'Palmöl', 'Sesam', 'Milch', 'Zettel', 'Rätselraten'];
const wortTeil = startseite.match(/<section class="wort" id="ohne">[\s\S]*?<\/section>/)?.[0] ?? '';
if (!wortTeil) melde('/', 'Abschnitt „Einkaufen ohne …“ fehlt');
else {
  const wortText = entschluesselt(wortTeil.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  for (const absatz of ABSATZ_START) if (!wortText.includes(absatz)) melde('/', `Absatz mit Unterschrift weicht vom Wortlaut ab: ${absatz.slice(0, 50)} …`);
  if (!/Ali Tonc,\s*Entwickler von FoodAsu/.test(wortText)) melde('/', 'Unterschrift „Ali Tonc, Entwickler von FoodAsu“ fehlt');
  if (!/<a\b[^>]*href="\/ueber-foodasu\/#warum"[^>]*>\s*Warum es FoodAsu gibt/.test(wortTeil)) melde('/', 'Link „Warum es FoodAsu gibt“ auf /ueber-foodasu/#warum fehlt');
  // Nachtrag zu AP-23 Teil B Nr. 6: Die Wörter stehen als Chips neben der Unterschrift; "Eier" statt "Schweinefleisch".
  if (/Schweinefleisch/.test(entschluesselt(wortTeil))) melde('/', 'im Abschnitt mit Alis Unterschrift steht „Schweinefleisch“ (Chips und Absatz; seit dem Nachtrag zu AP-23 „Eier“)');
  const wortMarken = alle(wortTeil, /<li[^>]*\bdata-wortmarke\b[^>]*>([^<]*)<\/li>/g).map(([, marke]) => entschluesselt(marke));
  if (wortMarken.join(' | ') !== WORT_MARKEN.join(' | ')) melde('/', `„Einkaufen ohne …“: Wörter „${WORT_MARKEN.join(', ')}“ erwartet, gefunden „${wortMarken.join(', ')}“`);
  // Der Absatz selbst (die Absätze vor der Unterschrift): genau der Wortlaut, kein Doppelpunkt, kein Strichpunkt.
  const wortAbsaetze = alle(wortTeil, /<p>([\s\S]*?)<\/p>/g).map(([, absatz]) => entschluesselt(absatz.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim());
  if (wortAbsaetze.join(' | ') !== ABSATZ_START.join(' | ')) melde('/', 'neben der Unterschrift stehen nicht genau die drei Absätze des Wortlauts');
  if (wortAbsaetze.some((absatz) => /[:;]/.test(absatz))) melde('/', 'der Absatz mit Unterschrift enthält einen Doppelpunkt oder Strichpunkt');
}
if (/data-band\b|band-spur/.test(startseite)) melde('/', 'die Bänder der Startseite laufen noch (sie stehen seit AP-23 still, als Chips in Reihen)');
if (!/id="fragen"/.test(startseite)) melde('/', 'Abschnitt mit dem Anker #fragen fehlt');
// Auftrag SEO 1 neu (14.10.2026): Der Abschnitt „Wenn nicht alle dasselbe essen“ ist ersatzlos entfallen (Alis Ja); er
// zieht auf keine andere Seite um, und kein Link zeigt mehr auf seinen Anker #alltag (die Linkprüfung oben meldet
// jede fehlende Sprungmarke).
if (/id="alltag"|class="tisch"|class="lage|Wenn nicht alle dasselbe essen/.test(startseite)) melde('/', 'der Abschnitt „Wenn nicht alle dasselbe essen“ steht noch auf der Startseite');
for (const [adresse, html] of seiten) if (/href="\/#alltag"/.test(html)) melde(adresse, 'Link auf den entfallenen Anker /#alltag');
// Nachtrag zu AP-23 (Ali, 11.10.2026): FoodAsu tritt ohne regionale Herkunft auf (kein Ort, keine Region, kein Land als
// Herkunft) und wird ohne Plattform beschrieben. Geprüft wird der fertige Bau, nicht der Quelltext: jede HTML-, TXT-,
// XML- und JSON-Datei als Ganzes, also auch Titel, Beschreibungen, Open Graph, Twitter-Karte, strukturierte Daten,
// Bildbeschreibungen, Sprungmarken, llms.txt, sitemap.xml und robots.txt; Skripte, Stile und Vektorbilder dazu auf die
// Wörter zur Herkunft. Erlaubt bleiben genau diese Stellen:
// - Datenschutzerklärung und Offenlegung: der Rechtstext selbst (Anschrift und Behörde sind Pflicht), nicht die
//   Kopfdaten und der Rahmen der Seite;
// - die Länder der Rezepte: "aus Österreich" auf den Seiten unter /rezepte/ und in llms.txt in der Zeile einer solchen
//   Seite; seit AP-25 ebenso die Länder und Orte der alten Kochbücher auf /alte-rezepte/ und unter "Quellen und
//   Lizenzen";
// - og:locale:alternate "de_AT" (Sprache ohne Region: de_DE, dazu de_AT und de_CH als gleichwertige Angaben);
// - der Satz zur Verfügbarkeit, der als einziger die Plattform nennt;
// - die Adresse des Eintrags bei Google Play (der Paketname at.tonc.einkauf lässt sich nicht ändern);
// - technische Hinweise zu Android: im Text der Datenschutzerklärung, und in der Anleitung die Abschnitte
//   "Installieren", "Backup von Android" und "Feedback geben" mit genau den Wortlauten unten (die Beschreibung des
//   Kapitels "Einstellungen und deine Daten" nennt das Backup und steht deshalb auch in llms.txt).
// "Bald im Play Store" enthält keines der Wörter. Jeder andere Treffer ist ein Befund und bricht den Bau ab.
const GANZES_WORT = (wort) => new RegExp(`(?<![\\p{L}\\p{N}_])${wort}(?![\\p{L}\\p{N}_])`, 'gu');
const HERKUNFT = [
  ['Vorarlberg', /Vorarlberg/giu], ['Bodensee', /Bodensee/giu], ['Höchst', GANZES_WORT('Höchst')],
  ['aus Österreich', /aus\s+Österreich/giu], ['Made in Austria', /made\s+in\s+austria/giu],
  ['de_AT', /de_AT/g], ['de-AT', /de-AT/g],
];
const PLATTFORM = [['Android', /Android/giu]];
const VERFUEGBAR = 'FoodAsu gibt es für Android im Play Store. Die Version fürs iPhone folgt.';
const STAND = `FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. ${VERFUEGBAR}`;
const PLAY_EINTRAG = 'https://play.google.com/store/apps/details?id=at.tonc.einkauf';
// GEO-Satz (Auftrag SEO 1 neu, Teil 2 Nr. 6; seit Alis Entscheidung vom 14.10.2026 ohne Plattform, die Regel vom
// 11.10.2026 gilt ohne Ausnahme). Nur auf der Startseite steht die Angabe "operatingSystem" der SoftwareApplication.
// Die Zahl der Rezepte kommt aus den Daten.
const GEO = `FoodAsu ist eine Einkaufslisten-App mit Lebensmittel-Scanner: Einkaufsliste, über ${UEBER} Rezepte und ein Scanner, der für jede Person im Haushalt zeigt, ob laut den Angaben zum Produkt etwas drin ist, das sie meidet.`;
const BETRIEBSSYSTEM = '"operatingSystem":"Android"';
// Seit AP-35A nennt die App-Angabe der Startseite die kleinste Version (minSdk 26 der App). Nur genau diese Angabe.
const MINDESTVERSION = '"softwareRequirements":"Android 8.0 oder neuer"';
// Beschreibung der App in den strukturierten Daten (AP-35A): wortgleich die Kurzbeschreibung des deutschen
// Store-Eintrags (foodasu-play/Store_Eintrag.md, Fassung AP-33, live seit dem öffentlichen Start).
const APP_KURZ = 'Einkaufsliste und Lebensmittel-Scanner für den ganzen Haushalt. Mit Rezepten.';
// Video der Startseite (Stufe 2, Projektleitung, 14.10.2026, 13:45): Name und Beschreibung wörtlich aus dem Auftrag,
// die Dateien unter /bilder/start (je Format WebM, MP4 und das Poster in 360 und 720).
const VIDEO_NAME = 'Vom Einkaufszettel zur Einkaufsliste mit FoodAsu';
const VIDEO_BESCHREIBUNG = 'Kurzes Video ohne Ton: Ein handgeschriebener Einkaufszettel mit Tomaten, Mozzarella, Basilikum und Keksen wird zur Einkaufsliste in FoodAsu, die Einträge ordnen sich nach Warengruppen, danach zeigt ein Scan, für wen ein Produkt laut den Angaben nicht passt.';
const VIDEO_ORT = '/bilder/start/zettel-zur-app';
const VIDEO_GRENZE = 1.5 * 1024 * 1024;
const WEITERE_SPRACHE = /<meta property="og:locale:alternate" content="de_AT"\s*\/?>/g;
const ANLEITUNG_ANDROID = [
  'Backup von Android', 'backup-von-android', 'Android kann ein Backup deiner App-Daten anlegen',
  'Mit geht die Version der App und von Android, sonst nichts.',
];
const RECHT_MIT_ANSCHRIFT = new Set(['/datenschutz.html', '/offenlegung/', '/nutzungsbedingungen.html']);
// Sprachangaben um ein fremdes Wort (tools/sprache_setzen.mjs) trennen einen Wortlaut nicht.
const ohneSprachangabe = (html) => html.replace(/<span lang="[a-z-]+">([^<]*)<\/span>/g, '$1');
const fliesstext = (adresse) => entschluesselt(ohneSprachangabe(seiten.get(adresse) ?? '').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
let herkunftDateien = 0;
for (const datei of dateien.filter((pfad) => /\.(?:html|txt|xml|json|webmanifest|js|css|svg)$/.test(pfad))) {
  const name = '/' + relative(DIST, datei).split(sep).join('/');
  const adresse = name.endsWith('.html') ? adresseVon(datei) : name;
  const nurHerkunft = /\.(?:js|css|svg)$/.test(name);
  let inhalt = readFileSync(datei, 'utf8');
  if (RECHT_MIT_ANSCHRIFT.has(adresse)) inhalt = inhalt.replace(/<main[\s\S]*<\/main>/, ' ');
  herkunftDateien++;
  // llms.txt Zeile für Zeile: Jede Zeile nennt eine Seite, und die Ausnahme hängt an der Seite.
  for (const roh of name === '/llms.txt' ? inhalt.split('\n') : [inhalt]) {
    let teil = entschluesselt(ohneSprachangabe(roh)).replace(/\s+/g, ' ');
    teil = teil.replaceAll(VERFUEGBAR, ' ').replaceAll(PLAY_EINTRAG, ' ').replace(WEITERE_SPRACHE, ' ');
    if (adresse === '/') teil = teil.replaceAll(BETRIEBSSYSTEM, ' ').replaceAll(MINDESTVERSION, ' ');
    const inAnleitung = adresse.startsWith(BEREICH) || (name === '/llms.txt' && teil.includes(`](${HOST}${BEREICH}`));
    if (inAnleitung) for (const wortlaut of ANLEITUNG_ANDROID) teil = teil.replaceAll(wortlaut, ' ');
    const beiRezepten = adresse.startsWith('/rezepte/') || adresse === ALTE || adresse === QUELLEN || (name === '/llms.txt' && (teil.includes(`](${HOST}/rezepte/`) || teil.includes(`](${HOST}${ALTE}`)));
    for (const [wort, ausdruck] of nurHerkunft ? HERKUNFT : [...HERKUNFT, ...PLATTFORM]) {
      if (wort === 'aus Österreich' && beiRezepten) continue;
      for (const fund of alle(teil, ausdruck)) {
        melde(name, `Herkunft oder Plattform: „${fund[0]}“ steht im Bau („… ${teil.slice(Math.max(0, fund.index - 50), fund.index + fund[0].length + 50).trim()} …“)`);
      }
    }
  }
}
// Die neuen Wortlaute (Nachtrag zu AP-23 Teil A in der Fassung der Änderung vom 11.10.2026).
// Satz zur Verfügbarkeit: gleich auf der Startseite, unter /fragen/ (auch in FAQPage) und auf "Über FoodAsu".
for (const adresse of ['/', '/fragen/', '/ueber-foodasu/']) if (!fliesstext(adresse).includes(STAND)) melde(adresse, 'Satz zur Verfügbarkeit fehlt oder weicht ab');
for (const [adresse, html] of seiten) if (/iPhone ist geplant|iPhone ist in Arbeit/.test(html)) melde(adresse, 'der frühere Satz zum iPhone steht noch da');
// llms.txt: Kernsatz, dann der Satz mit der Plattform; der Absatz darunter wiederholt ihn nicht.
// Seit dem Auftrag SEO 1 neu (Teil 3 Nr. 3): zuerst der GEO-Satz als Zitat, darunter der Absatz mit dem Kernsatz, dem
// Hinweis zur Beta und dem Satz zur Verfügbarkeit; der Link zum Eintrag bei Google Play erst mit dem öffentlichen Start.
{
  const zeilen = llms.split('\n');
  if (zeilen[2] !== `> ${GEO}`) melde('llms.txt', 'Einleitung: der GEO-Satz als erstes Zitat erwartet');
  if (!(zeilen[4] ?? '').startsWith(`${KERNSATZ} `) || !(zeilen[4] ?? '').includes(` ${VERFUEGBAR} `)) melde('llms.txt', 'Einleitung: der Absatz mit dem Kernsatz und dem Satz zur Verfügbarkeit erwartet');
  if (!store.oeffentlich && llms.includes('play.google.com')) melde('llms.txt', 'Link zum Eintrag bei Google Play vor dem öffentlichen Start');
  for (const ziel of ['/', BEREICH, '/fragen/', '/datenschutz.html']) if (!llms.includes(`(${HOST}${ziel})`)) melde('llms.txt', `Link fehlt: ${ziel}`);
}
if (llms.split(VERFUEGBAR).length !== 2) melde('llms.txt', 'der Satz zur Plattform steht nicht genau einmal in der Datei');
// Titel der Startseite, Überschrift von "Über FoodAsu", Satz der Fußzeile als Beschreibung des Bildes zum Teilen.
if (!startseite.includes(`<title>${TITEL_START}</title>`)) melde('/', `Titel „${TITEL_START}“ erwartet`);
if (!fliesstext('/ueber-foodasu/').includes(' Über FoodAsu: Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt ') || !/<h1[^>]*>Über FoodAsu: /.test(seiten.get('/ueber-foodasu/') ?? '')) melde('/ueber-foodasu/', 'Überschrift „Über FoodAsu: Lebensmittel-Scanner und Einkaufsliste für den ganzen Haushalt“ fehlt');
if (inhaltVon(startseite, 'og:image:alt') !== 'FoodAsu: Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt.') melde('/', 'Beschreibung des Bildes zum Teilen: der Satz der Fußzeile erwartet');
// /favicon.ico (Nachtrag zu AP-23 Teil C): eine ICO-Datei mit 16, 32 und 48 Pixeln (tools/favicon_bauen.mjs); die
// Angaben im Kopf jeder Seite bleiben.
const ico = existsSync(join(DIST, 'favicon.ico')) ? readFileSync(join(DIST, 'favicon.ico')) : null;
if (!ico || ico.length < 22) melde('/favicon.ico', 'fehlt');
else {
  const groessen = Array.from({ length: ico.readUInt16LE(4) }, (_, nummer) => ico[6 + 16 * nummer] || 256).sort((a, b) => a - b);
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1 || groessen.join(' ') !== '16 32 48') melde('/favicon.ico', `ICO-Datei mit 16, 32 und 48 Pixeln erwartet, gefunden: ${groessen.join(', ')}`);
}
for (const [adresse, html] of seiten) {
  for (const angabe of ['<link rel="icon" href="/favicon.svg" type="image/svg+xml">', '<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">']) {
    if (!html.includes(angabe)) melde(adresse, `Angabe zum Symbol der Seite fehlt: ${angabe}`);
  }
}
// "Über FoodAsu": sechs Stationen mit ihren Ankern, die Unterschrift im Wortlaut, die Adresse des Kontakts weiter aus
// HTML-Entitäten.
for (const anker of ['warum', 'fuer-wen', 'angaben', 'bei-dir', 'stand', 'kontakt']) if (!new RegExp(`<h2 id="${anker}">`).test(ueberInhalt)) melde('/ueber-foodasu/', `Abschnitt mit dem Anker #${anker} fehlt`);
if (alle(ueberInhalt, /<li class="station"/g).length !== 6) melde('/ueber-foodasu/', 'sechs Stationen erwartet');
if (!/Ali Tonc,\s*Entwickler von FoodAsu/.test(entschluesselt(ueberInhalt.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' '))) melde('/ueber-foodasu/', 'Unterschrift „Ali Tonc, Entwickler von FoodAsu“ fehlt');
if (!/<a class="knopf voll" href="(?:&#\d+;)+">/.test(ueberInhalt)) melde('/ueber-foodasu/', 'Knopf „E-Mail schreiben“: Adresse aus HTML-Entitäten erwartet');
if (/mailto:/.test(ueberInhalt)) melde('/ueber-foodasu/', 'die Adresse des Kontakts steht im Klartext');
// Startseite nach dem Auftrag SEO 1 neu (Projektleitung, 14.10.2026) und dem von Ali freigegebenen Entwurf.
{
  const s = startseite;
  const daten = alle(s, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } });
  const block = (art) => daten.find((einer) => einer['@type'] === art);
  // H1 in drei Teilen, ein einziges Element; Pflichtstellen des Fokus-Keywords (Teil 2 Nr. 2).
  const h1 = entschluesselt((s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  if (h1 !== 'Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt') melde('/', `H1 „Einkaufslisten-App und Lebensmittel-Scanner für den ganzen Haushalt“ erwartet, gefunden „${h1}“`);
  if (alle(s.match(/<h1[^>]*>[\s\S]*?<\/h1>/)?.[0] ?? '', /<span class="h-/g).length !== 3) melde('/', 'H1: drei Teile erwartet');
  if (!(inhaltVon(s, 'description') ?? '').startsWith('Einkaufslisten-App')) melde('/', 'Beschreibung beginnt nicht mit „Einkaufslisten-App“');
  if (inhaltVon(s, 'og:site_name') !== 'FoodAsu' || block('WebSite')?.name !== 'FoodAsu') melde('/', 'Websitename „FoodAsu“ fehlt in og:site_name oder WebSite.name');
  // Satz im Kopf: höchstens 15 Wörter, mit "Einkaufsliste"; die Vorzeile von früher ist entfallen.
  const satz = entschluesselt((s.match(/<p class="held-satz">([\s\S]*?)<\/p>/)?.[1] ?? '').replace(/<[^>]+>/g, '')).trim();
  if (!satz || satz.split(/\s+/).length > 15 || !satz.includes('Einkaufsliste')) melde('/', `Satz im Kopf: höchstens 15 Wörter mit „Einkaufsliste“ erwartet, gefunden „${satz}“`);
  if (/held-vorzeile|held-vorspann/.test(s)) melde('/', 'Vorzeile oder langer Absatz im Kopf stehen noch da');
  // Knöpfe im Kopf wie bisher; der Hinweis zu Beta und Verfügbarkeit unter den Knöpfen (am Laptop) und im Abschluss.
  if (!/<a class="knopf voll" href="#schritte">/.test(s)) melde('/', 'Knopf „Eine Einkaufswoche“ zu #schritte fehlt');
  if (!new RegExp(`<p class="held-stand">${STAND}</p>`).test(entschluesselt(ohneSprachangabe(s)))) melde('/', 'Hinweis zu Beta und Verfügbarkeit unter den Knöpfen fehlt');
  // Schwebende Begriffe ohne "Schweinefleisch" (Teil 1 Nr. 2e).
  const begriffe = alle(s, /<span class="chip ruht schwebt s\d"[^>]*><i><\/i>([^<]+)<\/span>/g).map(([, wort]) => entschluesselt(wort));
  if (begriffe.join(', ') !== 'Nüsse, Gluten, Palmöl') melde('/', `Begriffe am Handy im Kopf: „Nüsse, Gluten, Palmöl“ erwartet, gefunden „${begriffe.join(', ')}“`);
  // Video (Teil 1 Nr. 6; Stufe 2 vom 14.10.2026): Bis zum Scrollen steht das Poster mit festen Maßen, spätem Laden und
  // der Beschreibung; das Video entsteht nur per Skript (nie fest im Quelltext, nie autoplay). Je Format (handy, laptop)
  // WebM und MP4 unter 1,5 MB und das Poster in 360 und 720 Pixel Breite.
  const videoTeil = s.match(/<figure class="video-feld[^"]*" data-video>[\s\S]*?<\/figure>/)?.[0] ?? '';
  const poster = videoTeil.match(/<img\b[^>]*>/)?.[0] ?? '';
  if (!/width="\d+"/.test(poster) || !/height="\d+"/.test(poster) || !/loading="lazy"/.test(poster)) melde('/', 'Video: Poster mit festen Maßen und spätem Laden fehlt');
  if (entschluesselt(poster.match(/alt="([^"]*)"/)?.[1] ?? '') !== VIDEO_BESCHREIBUNG) melde('/', 'Video: Beschreibung am Poster fehlt oder weicht ab');
  const filmOrt = poster.match(/data-film="([^"]+)"/)?.[1];
  if (filmOrt !== VIDEO_ORT) melde('/', `Video: data-film „${filmOrt}“ statt „${VIDEO_ORT}“`);
  if (!videoTeil.includes(`<source media="(min-width: 56rem)" srcset="${VIDEO_ORT}-laptop-360.webp 360w, ${VIDEO_ORT}-laptop-720.webp 720w"`)) melde('/', 'Video: Poster für den Laptop (ab 56rem) fehlt');
  for (const format of ['handy', 'laptop']) {
    for (const endung of ['webm', 'mp4']) {
      const datei = `${VIDEO_ORT}-${format}.${endung}`;
      if (!vorhanden.has(datei)) { melde('/', `Video: Datei fehlt: ${datei}`); continue; }
      const groesse = statSync(join(DIST, datei)).size;
      if (groesse >= VIDEO_GRENZE) melde('/', `Video: ${datei} hat ${(groesse / 1048576).toFixed(2)} MB (Grenze 1,5 MB)`);
    }
    for (const breite of [360, 720]) if (!vorhanden.has(`${VIDEO_ORT}-${format}-${breite}.webp`)) melde('/', `Video: Poster fehlt: ${VIDEO_ORT}-${format}-${breite}.webp`);
  }
  if (/<video\b|autoplay/.test(s)) melde('/', 'Video: steht fest im Quelltext oder spielt von selbst');
  // VideoObject (Stufe 2, Strukturierte Daten Nr. 1 und 2): alle Pflichtfelder, Poster 720 und MP4 des Laptops im Bau,
  // Dauer, Tag der Veröffentlichung mit Zeitzone, Sprache, Verweis auf die Organization über @id; kein Preis, keine
  // Bewertung.
  const film = block('VideoObject');
  if (!film) melde('/', 'strukturierte Daten: VideoObject fehlt');
  else {
    const PFLICHT = ['name', 'description', 'thumbnailUrl', 'contentUrl', 'duration', 'uploadDate', 'inLanguage', 'publisher'];
    const fehlt = PFLICHT.filter((feld) => film[feld] == null || film[feld] === '' || (Array.isArray(film[feld]) && film[feld].length === 0));
    if (fehlt.length) melde('/', `VideoObject: Pflichtfelder fehlen: ${fehlt.join(', ')}`);
    if (film.name !== VIDEO_NAME || film.description !== VIDEO_BESCHREIBUNG) melde('/', 'VideoObject: Name oder Beschreibung weicht vom Auftrag ab');
    const vorschau = [film.thumbnailUrl].flat()[0];
    if (vorschau !== `${HOST}${VIDEO_ORT}-laptop-720.webp` || film.contentUrl !== `${HOST}${VIDEO_ORT}-laptop.mp4`) melde('/', 'VideoObject: thumbnailUrl (Poster 720) oder contentUrl (MP4 Laptop) weicht ab');
    for (const ziel of [vorschau, film.contentUrl]) if (typeof ziel === 'string' && ziel.startsWith(HOST) && !vorhanden.has(ziel.slice(HOST.length))) melde('/', `VideoObject: ${ziel} fehlt im Bau`);
    if (film.duration !== 'PT14S') melde('/', `VideoObject: duration „${film.duration}“ statt PT14S`);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(film.uploadDate ?? '')) melde('/', `VideoObject: uploadDate „${film.uploadDate}“ ohne Uhrzeit und Zeitzone`);
    if (film.inLanguage !== 'de') melde('/', 'VideoObject: inLanguage „de“ erwartet');
    if (film.publisher?.['@id'] !== `${HOST}/#organisation` || block('Organization')?.['@id'] !== `${HOST}/#organisation`) melde('/', 'VideoObject: publisher verweist nicht über @id auf die Organization');
    if (/offers|price|aggregateRating|review|isAccessibleForFree/i.test(JSON.stringify(film))) melde('/', 'VideoObject: Preis oder Bewertung gehören nicht hinein');
  }
  if (daten.filter((einer) => einer['@type'] === 'VideoObject').length !== 1) melde('/', 'strukturierte Daten: genau ein VideoObject erwartet');
  // "Mehr als ein Einkaufszettel" (Teil 1 Nr. 7): sechs Karten zum Aufklappen, die erste offen, Titel als h3.
  const karten = alle(funktionTeil, /<details class="funktion"( open)?>/g);
  if (karten.length !== 6 || !karten[0][1] || karten.slice(1).some((karte) => karte[1])) melde('/', 'Funktionen: sechs Karten zum Aufklappen erwartet, nur die erste offen');
  if (alle(funktionTeil, /<summary>[\s\S]*?<h3>[^<]+<\/h3>[\s\S]*?<\/summary>/g).length !== 6) melde('/', 'Funktionen: je Karte ein Titel (h3) im Kopf der Karte erwartet');
  if (!/<h2 class="titel">Mehr als ein Einkaufszettel<\/h2>/.test(funktionTeil)) melde('/', 'Überschrift „Mehr als ein Einkaufszettel“ fehlt');
  // Vergleich (Teil 1 Nr. 8): echte Tabelle mit vier Zeilen und dem Satz darunter, keine Namen anderer Apps.
  const vergleichTeil = s.match(/<section class="vergleich" id="vergleich">[\s\S]*?<\/section>/)?.[0] ?? '';
  if (alle(vergleichTeil, /<tr>\s*<th scope="row">/g).length !== 4 || !/<table class="vergleich-tabelle" aria-labelledby="vergleich-titel">/.test(vergleichTeil)) melde('/', 'Vergleich: Tabelle mit vier Zeilen erwartet');
  if (!/reicht eine einfache Liste/.test(vergleichTeil)) melde('/', 'Vergleich: Satz, wann eine einfache Liste reicht, fehlt');
  for (const fund of alle(textVon('/'), /\b(?:Bring|Listonic|OurGroceries|Yuka|CodeCheck|AnyList|Todoist|Keep)\b/g)) melde('/', `nennt eine andere App: ${fund[0]}`);
  // Fragen (Teil 1 Nr. 12 und Teil 2 Nr. 9): sieben Fragen in fester Reihenfolge, FAQPage wortgleich.
  const fragenTeil = s.match(/<section class="faq" id="fragen">[\s\S]*?<\/section>/)?.[0] ?? '';
  const FRAGEN = ['Was kann die Einkaufslisten-App FoodAsu?', 'Ist FoodAsu auch eine Einkaufszettel-App?', 'Brauche ich ein Konto?', 'Wie kommt ein Rezept auf die Einkaufsliste?', 'Woher weiß die App, was im Produkt steckt?', 'Funktioniert FoodAsu ohne Internet?', 'Gibt es FoodAsu fürs iPhone?'];
  if (!/<h2 class="titel mittig">Fragen zur Einkaufslisten-App<\/h2>/.test(fragenTeil)) melde('/', 'Überschrift „Fragen zur Einkaufslisten-App“ fehlt');
  const sichtbareFragen = alle(fragenTeil, /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>\s*<\/details>/g).map(([, frage, antwort]) => ({
    frage: entschluesselt(ohneSprachangabe(frage).replace(/<[^>]+>/g, '')).trim(),
    antwort: alle(antwort, /<p>([\s\S]*?)<\/p>/g).map(([, absatz]) => entschluesselt(ohneSprachangabe(absatz).replace(/<[^>]+>/g, '')).trim()).join(' '),
  }));
  if (sichtbareFragen.map((eintrag) => eintrag.frage).join(' | ') !== FRAGEN.join(' | ')) melde('/', `Fragen: Reihenfolge oder Wortlaut weicht ab: ${sichtbareFragen.map((eintrag) => eintrag.frage).join(' | ')}`);
  const faq = block('FAQPage');
  const faqTexte = (faq?.mainEntity ?? []).map((eintrag) => ({ frage: eintrag.name, antwort: eintrag.acceptedAnswer?.text }));
  if (JSON.stringify(faqTexte) !== JSON.stringify(sichtbareFragen)) melde('/', 'FAQPage gibt die sichtbaren Fragen und Antworten nicht wortgleich wieder');
  if (!sichtbareFragen[0]?.antwort.startsWith(GEO)) melde('/', 'die erste Antwort beginnt nicht mit dem GEO-Satz');
  const woher = sichtbareFragen.find((eintrag) => eintrag.frage.startsWith('Woher weiß'))?.antwort ?? '';
  if (!/fehlen oder veraltet/.test(woher) || !woher.includes('Maßgeblich ist immer die Verpackung.')) melde('/', 'Antwort „Woher weiß die App …“: fehlende oder veraltete Daten und die Verpackung als Maßstab fehlen');
  if (!(sichtbareFragen.find((eintrag) => eintrag.frage === 'Gibt es FoodAsu fürs iPhone?')?.antwort ?? '').startsWith(VERFUEGBAR)) melde('/', 'Antwort „Gibt es FoodAsu fürs iPhone?“ beginnt nicht mit dem Satz zur Verfügbarkeit');
  // Absätze der Antworten und der aufgeklappten Texte der Funktionen: je ein oder zwei Sätze (Alis Entscheidung vom
  // 14.10.2026). Ein Satz endet mit Punkt, Fragezeichen oder Ausrufezeichen vor einem Leerzeichen oder am Ende.
  const saetze = (absatz) => alle(absatz.trim(), /[.?!](?=\s|$)/g).length;
  const absaetze = [
    ...alle(fragenTeil, /<details>\s*<summary>[\s\S]*?<\/summary>\s*<div>([\s\S]*?)<\/div>/g).flatMap(([, antwort]) => alle(antwort, /<p>([\s\S]*?)<\/p>/g)),
    ...alle(funktionTeil, /<div class="funktion-text">([\s\S]*?)<\/div>/g).flatMap(([, text]) => alle(text, /<p>([\s\S]*?)<\/p>/g)),
  ].map(([, absatz]) => entschluesselt(ohneSprachangabe(absatz).replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim());
  if (absaetze.length < 13) melde('/', `Absätze der Fragen und Funktionen: nur ${absaetze.length} gefunden (die Prüfung liest nichts)`);
  for (const absatz of absaetze) if (saetze(absatz) < 1 || saetze(absatz) > 2) melde('/', `Absatz mit ${saetze(absatz)} Sätzen (erwartet ein oder zwei): „${absatz.slice(0, 80)}“`);
  if (!/Einkaufsapp/.test(fragenTeil)) melde('/', 'eine Antwort nennt „Einkaufsapp“ nicht');
  // MobileApplication und Person (Teil 3 Nr. 1; seit AP-34 MobileApplication mit installUrl).
  const app = block('MobileApplication');
  if (app) {
    // Seit AP-35A: feste Kennung, Beschreibung wortgleich die Kurzbeschreibung des deutschen Store-Eintrags (nicht mehr
    // der GEO-Satz; der steht weiter sichtbar auf der Seite und in llms.txt).
    if (app['@id'] !== APP_ID || app.operatingSystem !== 'Android' || app.applicationCategory !== 'ShoppingApplication' || app.description !== APP_KURZ || app.url !== `${HOST}/` || app.name !== 'FoodAsu') melde('/', 'MobileApplication: Kennung, Name, Betriebssystem, Kategorie, Beschreibung (Kurzbeschreibung des Store-Eintrags) oder Adresse weicht ab');
    if (app.author?.['@id'] !== `${HOST}/#ali-tonc` || block('Person')?.['@id'] !== `${HOST}/#ali-tonc`) melde('/', 'MobileApplication: der Entwickler (author, Person „Ali Tonc“) fehlt');
    if (/offers|price|aggregateRating|review|isAccessibleForFree/i.test(JSON.stringify(app))) melde('/', 'MobileApplication: Angebot, Preis oder Bewertung gehören nicht hinein');
    if (!store.oeffentlich && JSON.stringify(app).includes('play.google.com')) melde('/', 'MobileApplication: Eintrag bei Google Play vor dem öffentlichen Start');
    if (store.oeffentlich && app.installUrl !== store.adresse) melde('/', 'MobileApplication: installUrl fehlt oder ist nicht der Eintrag bei Google Play');
    // AP-35A: Symbol und Bildschirmfotos als Dateien auf foodasu.com, die es im Bau gibt; Datum, Sprachen, Länder,
    // kleinste Version und Berechtigungen wie im Auftrag; keine Version der App (veraltet sonst), kein termsOfService
    // (gibt es bei schema.org für diese Art nicht).
    const bilder = [app.image, ...[app.screenshot ?? []].flat()];
    if (!app.image || ![app.screenshot ?? []].flat().length) melde('/', 'MobileApplication: image oder screenshot fehlt');
    for (const bild of bilder) if (typeof bild !== 'string' || !bild.startsWith(`${HOST}/`) || !vorhanden.has(bild.slice(HOST.length))) melde('/', `MobileApplication: Bild ist keine Datei auf foodasu.com: ${bild}`);
    if (app.image !== `${HOST}/apple-touch-icon.png`) melde('/', 'MobileApplication: image ist nicht das App-Symbol');
    if (app.datePublished !== '2026-10-23') melde('/', 'MobileApplication: datePublished 2026-10-23 erwartet');
    if (JSON.stringify(app.inLanguage) !== '["de","en"]') melde('/', 'MobileApplication: inLanguage de und en erwartet');
    if (JSON.stringify(app.countriesSupported) !== '["AT","DE","CH","LI"]') melde('/', 'MobileApplication: countriesSupported AT, DE, CH, LI erwartet');
    if (app.softwareRequirements !== 'Android 8.0 oder neuer') melde('/', 'MobileApplication: softwareRequirements „Android 8.0 oder neuer“ erwartet (minSdk 26)');
    if (app.permissions !== 'Kamera, Internet, Vibration, Netzwerkstatus') melde('/', 'MobileApplication: permissions weichen von den Berechtigungen der App ab');
    for (const feld of ['softwareVersion', 'termsOfService']) if (feld in app) melde('/', `MobileApplication: ${feld} gehört nicht hinein`);
  }
  const person = block('Person');
  if (person && (person.name !== 'Ali Tonc' || Object.keys(person).some((schluessel) => !['@context', '@type', '@id', 'name', 'url'].includes(schluessel)))) melde('/', 'Person: nur Name und Website von Ali Tonc erwartet');
  // AP-35A: url der Person ist die Entwicklerseite bei Google Play (nur nach dem öffentlichen Start).
  if (person && store.oeffentlich && person.url !== store.entwickler) melde('/', 'Person: url ist nicht die Entwicklerseite bei Google Play');
  if (person && !/^https:\/\/play\.google\.com\/store\/apps\/dev\?id=\d+$/.test(store.entwickler ?? '')) melde('/', 'Person: Adresse der Entwicklerseite bei Google Play hat nicht die erwartete Form');
  // Die Startseite selbst als WebPage mit Verweis auf die App (der Verweis wird oben für alle Seiten geprüft).
  if (block('WebPage')?.url !== `${HOST}/`) melde('/', 'WebPage der Startseite: url fehlt oder weicht ab');
  // Pflichtstellen des Fokus-Keywords (Teil 2 Nr. 2): Titel, H1, Beschreibung, Unterzeile, H2 der Fragen, Fragen, ein
  // Bild; dazu "Einkaufszettel" in der H2 der Funktionen, in Alis Absatz und in einer Frage (Teil 2 Nr. 3).
  if (!alle(s, /<img\b[^>]*alt="[^"]*Einkaufslisten-App[^"]*"/g).length) melde('/', 'kein Bild mit „Einkaufslisten-App“ in der Beschreibung');
  if (!/Einkaufszettel/.test(wortTeil)) melde('/', 'Alis Absatz nennt den Einkaufszettel nicht');
  // Abschluss (Teil 1 Nr. 13) und Leiste unten am Handy (Teil 1 Nr. 15).
  const schlussTeil = s.match(/<section class="abschluss" id="abschluss">[\s\S]*?<\/section>/)?.[0] ?? '';
  if (!/<h2>Passt es für alle\? Schau einfach nach\.<\/h2>/.test(schlussTeil) || !entschluesselt(ohneSprachangabe(schlussTeil)).includes(VERFUEGBAR) || !/class="bald"/.test(schlussTeil)) melde('/', 'Abschluss: Überschrift, Satz zur Verfügbarkeit oder Knopf fehlt');
  if (store.oeffentlich && (alle(s, /<a class="bald" href="https:\/\/play\.google\.com\/store\/apps\/details\?id=at\.tonc\.einkauf&amp;referrer=utm_source%3Dwebsite%26utm_medium%3Dlink%26utm_campaign%3D(?:kopf|abschluss)" rel="noopener">/g).length !== 2 || !/<a class="bald" href="[^"]*utm_campaign%3Dkopf"/.test(s.split('<section class="abschluss"')[0]) || !/utm_campaign%3Dabschluss"/.test(schlussTeil) || /Bald im Play Store/.test(entschluesselt(ohneSprachangabe(s.replace(/<script[\s\S]*?<\/script>/g, ' ')))))) melde('/', 'Startseite: Knöpfe im Kopf und im Abschluss nicht als Link zum Eintrag bei Google Play, oder „Bald im Play Store“ steht noch da');
  const leiste = s.match(/<aside class="kurzleiste"[^>]*>[\s\S]*?<\/aside>/)?.[0] ?? '';
  if (!/<aside class="kurzleiste" aria-label="[^"]+" data-kurzleiste hidden>/.test(leiste) || alle(leiste, /<a\b[^>]*href="[^"]+"/g).length !== 2) melde('/', 'Leiste unten: Bereich mit Namen, zwei Links und anfangs ausgeblendet erwartet');
  if (/herunterladen|download/i.test(textVon('/'))) melde('/', 'Aufforderung zum Herunterladen auf der Startseite');
}
// 404-Seite: Karte im Wortlaut der Projektleitung, keine Handys mehr, die Null als Zitronenscheibe.
if (!sichtbar(nichtGefunden).includes('Einkaufsliste und Lebensmittel-Scanner in einer App: Du scannst beim Einkauf und siehst sofort, ob laut den Angaben etwas drin ist, das du meidest.')) melde('/404.html', 'Karte „Was ist FoodAsu?“ weicht vom Wortlaut ab');
if (/<img\b/.test(nichtGefunden.match(/<main[\s\S]*<\/main>/)?.[0] ?? '')) melde('/404.html', 'die Handys stehen noch auf der Seite');
if (!/<div class="nf-zahl" aria-hidden="true">\s*4\s*<svg/.test(nichtGefunden)) melde('/404.html', 'die Zahl mit der Zitronenscheibe fehlt oder ist für Bildschirmleser nicht ausgeblendet');
// Fragen: drei Gruppen (h2), jede Frage eine h3 mit Sprungmarke; FAQPage nennt die Fragen in der Reihenfolge der Seite.
const fragenSeite = seiten.get('/fragen/') ?? '';
const fragenInhalt = fragenSeite.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
const gruppenTitel = alle(fragenInhalt, /<h2 class="ueberzeile" id="[^"]+">([^<]*)<\/h2>/g).map(([, titel]) => entschluesselt(titel));
if (gruppenTitel.join(' | ') !== 'Die Daten | Deine Angaben | Die App') melde('/fragen/', `Gruppen: „Die Daten“, „Deine Angaben“, „Die App“ erwartet, gefunden: ${gruppenTitel.join(' | ')}`);
const fragenTitel = alle(fragenInhalt, /<h3 id="[^"]+">([\s\S]*?)<\/h3>/g).map(([, titel]) => entschluesselt(titel.replace(/<[^>]+>/g, '')));
const faqDaten = alle(fragenSeite, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } }).find((einer) => einer['@type'] === 'FAQPage');
const faqNamen = (faqDaten?.mainEntity ?? []).map((eintrag) => eintrag.name);
if (fragenTitel.length !== 7 || fragenTitel.join(' | ') !== faqNamen.join(' | ')) melde('/fragen/', `FAQPage folgt nicht der Reihenfolge der Seite: Seite „${fragenTitel.join(' | ')}“, Daten „${faqNamen.join(' | ')}“`);
if ((faqDaten?.mainEntity ?? []).find((eintrag) => eintrag.name === 'Wo bekomme ich FoodAsu?')?.acceptedAnswer?.text !== STAND) melde('/fragen/', 'FAQPage: Die Antwort auf „Wo bekomme ich FoodAsu?“ ist nicht der Satz zur Verfügbarkeit');
if (!/<p class="kasten">FoodAsu ist kein Medizinprodukt/.test(fragenInhalt)) melde('/fragen/', 'der Satz zum Medizinprodukt steht nicht als Lavendel-Kasten da');
if (/<details/.test(fragenInhalt)) melde('/fragen/', 'eine Antwort ist zugeklappt (auf dieser Seite stehen alle Antworten offen)');
for (const [adresse, html] of seiten) {
  if (adresse !== '/fragen/' && adresse !== '/' && /"@type":\s*"FAQPage"/.test(html)) melde(adresse, 'FAQPage gehört nur auf /fragen/ und auf die Startseite');
}
// Daten und Quellen: zwei Gruppen (h2), die Abschnitte als h3 mit ihren Ankern, die Nachweise am Ende.
const gruppenDaten = alle(datenInhalt, /<h2 class="ueberzeile" id="[^"]+">([^<]*)<\/h2>/g).map(([, titel]) => entschluesselt(titel));
if (gruppenDaten.join(' | ') !== 'Woher die Angaben kommen | Was die Angaben bedeuten') melde('/daten-und-quellen/', `Gruppen: „Woher die Angaben kommen“ und „Was die Angaben bedeuten“ erwartet, gefunden: ${gruppenDaten.join(' | ')}`);
for (const anker of ['produkte', 'rezepte', 'naehrwerte', 'bilder', 'laut-daten', 'luecken', 'verpackung']) if (!new RegExp(`<h3[^>]* id="${anker}">`).test(datenInhalt)) melde('/daten-und-quellen/', `Abschnitt (h3) mit dem Anker #${anker} fehlt`);
if (!/<h2[^>]* id="nachweise">/.test(datenInhalt)) melde('/daten-und-quellen/', 'Abschnitt mit dem Anker #nachweise fehlt');
// Rechtstexte: Die Datenschutzerklärung behält ihre Anker (die App verlinkt die Adresse), das Inhaltsverzeichnis steht
// an der Seite; die Offenlegung hat keine Leiste.
const datenschutz = seiten.get('/datenschutz.html') ?? '';
for (let nummer = 1; nummer <= 26; nummer++) if (!datenschutz.includes(`<h2 id="abschnitt-${nummer}">`)) melde('/datenschutz.html', `Abschnitt mit dem Anker #abschnitt-${nummer} fehlt`);
for (const teil of ['teil-a', 'teil-b', 'teil-c', 'teil-d']) if (!datenschutz.includes(`<h2 id="${teil}">`)) melde('/datenschutz.html', `Überschrift mit dem Anker #${teil} fehlt`);
if (alle(datenschutz, /<nav class="s-toc"/g).length !== 1) melde('/datenschutz.html', 'Inhaltsverzeichnis an der Seite: genau eines erwartet');
// Nutzungsbedingungen (AP-35A): Kurzfassung und Abschnitte 1 bis 18 mit Anker, Verzeichnis an der Seite, Zeile mit dem
// Stand, Kontakt nur als HTML-Entitäten; die Seite als WebPage mit Verweis auf die App und dateModified gleich lastmod
// in sitemap.xml; Link in llms.txt.
{
  const nb = seiten.get(NUTZUNG) ?? '';
  if (!nb) melde(NUTZUNG, 'Seite fehlt');
  for (const anker of ['das-wichtigste', ...Array.from({ length: 18 }, (_, i) => `abschnitt-${i + 1}`)]) if (!nb.includes(`<h2 id="${anker}">`)) melde(NUTZUNG, `Abschnitt mit dem Anker #${anker} fehlt`);
  if (alle(nb, /<h2 id="/g).length !== 19) melde(NUTZUNG, '19 Abschnitte mit Anker erwartet');
  if (alle(nb, /<nav class="s-toc"/g).length !== 1 || alle(nb, /<li><a href="#(?:das-wichtigste|abschnitt-\d+)">/g).length !== 19) melde(NUTZUNG, 'Inhaltsverzeichnis an der Seite mit 19 Einträgen erwartet');
  if (!/<p class="s-stand">Stand: \d{1,2}\. [A-ZÄÖÜ][a-zä]+ 20\d\d<\/p>/.test(nb)) melde(NUTZUNG, 'Zeile mit dem Stand fehlt');
  if (alle(nb, /<h1[^>]*>Nutzungsbedingungen für FoodAsu<\/h1>/g).length !== 1) melde(NUTZUNG, 'Überschrift „Nutzungsbedingungen für FoodAsu“ fehlt');
  if (/mailto:[a-z]/i.test(nb) || /\{\{[A-Z_]+\}\}/.test(nb)) melde(NUTZUNG, 'Adresse im Klartext oder offener Platzhalter');
  const nbDaten = alle(nb, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map(([, roh]) => { try { return JSON.parse(roh); } catch { return {}; } });
  const seite = nbDaten.find((block) => block['@type'] === 'WebPage');
  const lastmod = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8').match(/<loc>https:\/\/foodasu\.com\/nutzungsbedingungen\.html<\/loc><lastmod>([\d-]+)<\/lastmod>/)?.[1] : null;
  if (!seite || seite.url !== HOST + NUTZUNG || seite.about?.['@id'] !== APP_ID) melde(NUTZUNG, 'WebPage mit url und about auf die App fehlt');
  else if (!lastmod || seite.dateModified !== lastmod) melde(NUTZUNG, `WebPage: dateModified „${seite.dateModified}“ ungleich lastmod in sitemap.xml „${lastmod}“`);
  if (nbDaten.some((block) => /Application$/.test(block['@type']))) melde(NUTZUNG, 'die App steht nur auf der Startseite vollständig');
  if (!llms.includes(`(${HOST}${NUTZUNG})`)) melde('llms.txt', `Link fehlt: ${NUTZUNG}`);
}
if (/<nav class="s-toc"/.test(seiten.get('/offenlegung/') ?? '')) melde('/offenlegung/', 'die Offenlegung hat keine Abschnitte und braucht kein Inhaltsverzeichnis');
// Linienmotive: höchstens drei je Abschnitt (die Komponente bricht sonst den Bau ab); hier zählt die Seite als Ganzes
// nur als Hinweis auf vergessene Kennzeichnung: Jedes Motiv ist für Bildschirmleser ausgeblendet.
for (const [adresse, html] of seiten) {
  for (const [motiv] of alle(html, /<svg[^>]*class="motiv[^"]*"[^>]*>/g)) if (!/aria-hidden="true"/.test(motiv)) melde(adresse, 'ein Linienmotiv ist für Bildschirmleser nicht ausgeblendet');
}

// Zahlen der Website, getrennt von den Zahlen der App (AP-25 Teil F Nr. 2 und 3). Gezählt wird am Bau: jede Seite mit
// einem Rezept in den strukturierten Daten, davon die Rezepte, die es in der App noch nicht gibt (aus alten Kochbüchern
// und neue). Jede Stelle, die Rezepte der Website zählt, nennt genau diese Zahlen. Was die App hat ("über N" Rezepte,
// weiter unten nachgerechnet), bleibt für sich; kein Satz schreibt die Rezepte aus alten Kochbüchern oder die neuen der App zu.
const websiteZahlen = { gesamt: rezeptSeiten, alt: alteSlugs.length, neu: ZUSATZ.size - alteSlugs.length, app: rezeptSeiten - ZUSATZ.size };
const ZAHL_SAETZE = [
  ['/rezepte/', `Auf der Website stehen ${websiteZahlen.gesamt} Rezepte mit Hinweisen zu den Zutaten. ${websiteZahlen.app} davon sind aus der App, ${websiteZahlen.alt} aus alten Kochbüchern und ${websiteZahlen.neu} neue, die später in die App kommen.`],
  ['/', `Über ${UEBER} Rezepte gibt es in der App, ${websiteZahlen.app} davon stehen hier. Dazu kommen ${websiteZahlen.alt} Rezepte aus alten Kochbüchern und ${websiteZahlen.neu} neue, die später in die App kommen.`],
  ['/', `${websiteZahlen.gesamt} Rezepte auf der Website ansehen`],
  [ALTE, `${websiteZahlen.alt} historische Rezepte aus Kochbüchern`],
  ['/fragen/', `Das sind ${websiteZahlen.alt} Rezepte aus gedruckten Kochbüchern`],
];
for (const [adresse, satz] of ZAHL_SAETZE) if (!fliesstext(adresse).includes(satz)) melde(adresse, `Zahlen der Website: „${satz}“ fehlt oder nennt andere Zahlen`);
if (websiteZahlen.app <= 0 || websiteZahlen.alt + websiteZahlen.neu !== ZUSATZ.size) melde('/rezepte/', 'Zahlen der Website lassen sich nicht aus dem Bau zählen');
for (const [adresse, html] of seiten) {
  const text = fliesstext(adresse);
  // Menü und Verweise: "Alle 65 Rezepte", "65 Rezepte auf der Website", "65 Rezepte anzeigen" (Filter ohne Auswahl).
  for (const [ganz, zahl] of alle(text, /Alle (\d+) Rezepte|(?<=\s)(\d+) Rezepte auf der Website/g).map((fund) => [fund[0], Number(fund[1] ?? fund[2])])) {
    if (zahl !== websiteZahlen.gesamt) melde(adresse, `Zahlen der Website: „${ganz}“, auf der Website stehen ${websiteZahlen.gesamt} Rezepte`);
  }
  // Kein Satz schreibt die Rezepte aus alten Kochbüchern der App zu: Wo beides in einem Satz steht, steht "später".
  // Gelesen werden die Absätze, Überschriften und Listenpunkte im Inhalt der Seite und die Beschreibung im Kopf.
  const inhalt = ohneSprachangabe(html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '').replace(/<script[\s\S]*?<\/script>/g, ' ');
  const stuecke = alle(inhalt, /<(p|h[1-6]|dd|figcaption|summary)\b[^>]*>([\s\S]*?)<\/\1>/g).map(([, , innen]) => entschluesselt(innen.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' '));
  for (const satz of [...stuecke, inhaltVon(html, 'description') ?? ''].flatMap((stueck) => stueck.split(/(?<=[.!?])\s+/))) {
    if (/\bApp\b/.test(satz) && /alten? Kochb|historische|Aus dem Original/.test(satz) && !/später/.test(satz)) melde(adresse, `schreibt die Rezepte aus alten Kochbüchern der App zu: „${satz.trim().slice(0, 160)}“`);
  }
}
// Auf den Rezepten, die es in der App noch nicht gibt, steht im Kasten am Ende der Satz zu den anderen Rezepten der App,
// nicht der Verweis auf dieses Rezept in der App.
for (const slug of ZUSATZ.keys()) {
  const text = fliesstext(`/rezepte/${slug}/`);
  if (!text.includes(`In der App gibt es schon über ${UEBER} andere Rezepte.`)) melde(`/rezepte/${slug}/`, 'Kasten am Ende: der Satz zu den anderen Rezepten der App fehlt');
  for (const wendung of ['Dieses Rezept in FoodAsu', `Dort findest du über ${UEBER} Rezepte.`]) if (text.includes(wendung)) melde(`/rezepte/${slug}/`, `schreibt das Rezept der App zu: „${wendung}“`);
}
// Zahlen der App (Projektleitung, 11.10.2026). Im Bau: Jedes "über N" bei Rezepten nennt die abgerundete Zahl aus den
// Daten, der Zahlenblock der Startseite die genauen Zahlen der Rezepte und der Länder, "aus N Ländern" nach den
// Rezepten der App die Zahl der Länder. Gelesen wird die ganze Datei, also auch Beschreibungen im Kopf und
// strukturierte Daten.
if (!Number.isInteger(APP.gesamt) || !Number.isInteger(APP.laender) || UEBER < 50) melde('src/daten/rezepte.json', 'Zahlen der App fehlen oder sind zu klein');
let ueberStellen = 0;
for (const [name, roh] of [...seiten, ['llms.txt', llms]]) {
  const ganz = entschluesselt(roh).replace(/\s+/g, ' ');
  for (const [stelle, zahl] of alle(ganz, /[Üü]ber (\d+)(?= (?:andere )?Rezepte?n?(?![\p{L}])|\.(?=\s|<|"|$))/gu).map((fund) => [fund[0], Number(fund[1])])) {
    ueberStellen++;
    if (zahl !== UEBER) melde(name, `Zahlen der App: „${stelle}“ steht da, aus den Daten ergibt sich „über ${UEBER}“ (${APP.gesamt} Rezepte)`);
  }
  for (const [stelle, zahl] of alle(ganz, /über \d+ Rezepten? aus (\d+) Ländern/g).map((fund) => [fund[0], Number(fund[1])])) {
    if (zahl !== APP.laender) melde(name, `Zahlen der App: „${stelle}“, in den Daten stehen ${APP.laender} Länder`);
  }
}
if (ueberStellen === 0) melde('/', 'Zahlen der App: keine Stelle mit „über N Rezepte“ gefunden (die Prüfung liest nichts)');
{
  const block = (seiten.get('/') ?? '').match(/<ul class="zaehler">[\s\S]*?<\/ul>/)?.[0] ?? '';
  const zahl = (text) => Number(text.replaceAll('.', ''));
  const zaehler = new Map(alle(block, /<li><span class="vh">([\d.]+)<\/span><b[^>]*data-zahl="(\d+)"[^>]*>([\d.]+)<\/b><span class="wortlaut">([^<]+)<\/span><\/li>/g).map(([, a, b, c, wort]) => [wort, zahl(a) === zahl(b) && zahl(b) === zahl(c) ? zahl(a) : NaN]));
  if (zaehler.get('Einträge zum Meiden') !== EINTRAEGE_ALLE) melde('/', `Zahlenblock: „Einträge zum Meiden“ nennt ${zaehler.get('Einträge zum Meiden')}, die Fassung ${FASSUNG.fassung} der App hat ${EINTRAEGE_ALLE}`);
  if (zaehler.get('Rezepte in der App') !== APP.gesamt) melde('/', `Zahlenblock: „Rezepte in der App“ nennt ${zaehler.get('Rezepte in der App')}, in den Daten stehen ${APP.gesamt}`);
  if (zaehler.get('Länder') !== APP.laender) melde('/', `Zahlenblock: „Länder“ nennt ${zaehler.get('Länder')}, in den Daten stehen ${APP.laender}`);
}
// Einträge zum Meiden (feste Vorgabe, Ali, 14.10.2026): Die festen Schlüssel der App-Fassung sind genau die der
// Website (EINTRAEGE in src/daten/rezeptseiten.mjs, auch die Hinweise der Rezepte), jeder Hinweis im Rezeptpaket
// gehört zu einem festen Eintrag, die Chips „Einträge wie in der App“ zählen die festen Einträge, und jede Zahl vor
// „Einträge zum Meiden“ im Bau ist die Zahl der festen Einträge (Rezepte) oder aller Einträge der Fassung.
{
  const fest = new Set(FASSUNG.festeSchluessel);
  const website = new Set(EINTRAEGE.map((eintrag) => eintrag.schluessel));
  if (fest.size !== EINTRAEGE_FEST || website.size !== fest.size || [...website].some((schluessel) => !fest.has(schluessel))) melde('src/daten/app_fassung.json', `feste Einträge der Fassung ${FASSUNG.fassung} passen nicht zu EINTRAEGE der Website`);
  for (const schluessel of Object.keys(APP.mitHinweis ?? {})) if (!fest.has(schluessel)) melde('src/daten/rezepte.json', `Hinweis „${schluessel}“ gehört zu keinem festen Eintrag der App`);
  if (startZahlen.zutatenband.length !== EINTRAEGE_FEST) melde('/', `Chips „Einträge wie in der App“: ${startZahlen.zutatenband.length}, die App hat ${EINTRAEGE_FEST} feste Einträge`);
  let stellen = 0;
  for (const [name, roh] of [...seiten, ['llms.txt', llms]]) {
    const ganz = entschluesselt(ohneSprachangabe(roh)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    for (const fund of alle(ganz, /(\d[\d.]*) Einträge(?:n)? zum Meiden/g)) {
      stellen++;
      const wert = Number(fund[1].replaceAll('.', ''));
      if (wert !== EINTRAEGE_FEST && wert !== EINTRAEGE_ALLE) melde(name, `„${fund[0]}“: die Fassung ${FASSUNG.fassung} der App hat ${EINTRAEGE_FEST} feste und ${EINTRAEGE_ALLE} Einträge insgesamt`);
    }
  }
  if (stellen === 0) melde('/', 'Einträge zum Meiden: keine Stelle im Bau gefunden (die Prüfung liest nichts)');
}
// Weitere Zahlen über die App (feste Vorgabe, Ali, 14.10.2026): Jedes Zahlwort oder jede Ziffer vor „Stufen“, vor
// „Zutaten wie“ und vor „davon stehen gleich unter „Häufig gewählt““ im Bau ist die Zahl aus der Fassung der App.
{
  const WORT = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
  const alsZahl = (text) => (/^\d+$/.test(text) ? Number(text) : WORT.indexOf(text.toLowerCase()));
  const regeln = [
    ['Stufen', /(?<![\p{L}\p{N}])(\p{L}+|\d+) Stufen(?![\p{L}])/gu, FASSUNG.stufen],
    ['Zutaten', /(?<![\p{L}\p{N}])(\d+) Zutaten wie/gu, FASSUNG.arten?.zutaten],
    ['Häufig gewählt', /(?<![\p{L}\p{N}])(\p{L}+) davon stehen gleich unter „Häufig gewählt“/gu, FASSUNG.haeufigGewaehlt],
  ];
  const gezaehlt = {};
  for (const [name, roh] of [...seiten, ['llms.txt', llms]]) {
    const ganz = entschluesselt(ohneSprachangabe(roh)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    for (const [art, ausdruck, wert] of regeln) {
      for (const fund of alle(ganz, ausdruck)) {
        const zahl = alsZahl(fund[1]);
        if (zahl < 0) continue;
        gezaehlt[art] = (gezaehlt[art] ?? 0) + 1;
        if (zahl !== wert) melde(name, `„${fund[0]}“: die Fassung ${FASSUNG.fassung} der App hat ${wert ?? 'keine'} (${art})`);
      }
    }
  }
  if (!gezaehlt.Stufen) melde('/', 'Stufen: keine Stelle im Bau gefunden (die Prüfung liest nichts)');
}
// Alt-Texte der Bildschirmfotos der Startseite (Alis Entscheidung vom 14.10.2026, Nr. 7): Jedes Bild steht in
// src/daten/sogehts_fotos.json, und jeder Wortlaut in Anführungszeichen im Alt-Text steht genau so in der Beschreibung
// „zeigt“ dieses Bildes (verglichen werden die innersten Anführungszeichen, ‚…‘ gilt wie „…“). So fällt ein Alt-Text
// auf, der nach dem Tausch eines Bildes noch das alte beschreibt.
{
  const fotos = JSON.parse(readFileSync('src/daten/sogehts_fotos.json', 'utf8'));
  const zitate = (text) => new Set(alle(text.replaceAll('‚', '„').replaceAll('‘', '“'), /„([^„“]*)“/g).map((fund) => fund[1]));
  const bilder = [
    ...startSchritte.liste.map((schritt) => [schritt.bild, schritt.alt]),
    ...einblick.karten.map((karte) => [karte.datei, karte.alt]),
  ];
  for (const [datei, alt] of bilder) {
    const zeigt = fotos[datei]?.zeigt;
    if (!zeigt) { melde('/', `Bild ${datei} der Startseite fehlt in sogehts_fotos.json`); continue; }
    const belegt = zitate(zeigt);
    for (const zitat of zitate(alt)) if (!belegt.has(zitat)) melde('/', `Alt-Text von ${datei}: „${zitat}“ steht nicht in der Beschreibung des Bildes (sogehts_fotos.json)`);
  }
  if (bilder.length !== 9) melde('/', `Alt-Texte: ${bilder.length} Bilder der Startseite gelesen, erwartet 9`);
}
// Im Quelltext: keine Zahl von Rezepten oder Ländern von Hand, weder für die Website noch für die App. Gelesen werden
// die Texte unter src/ und die festen Seiten unter public/, ohne Kommentare und ohne die zwei Dateien mit den Rezepten
// selbst. Ausnahmen: die Einzahl "1 Rezept" in den Bausteinen, die eine gezählte Zahl in Worte fassen, und zwei
// Beschreibungen von Fotos der App, die sagen, was auf dem Bild steht (VON_HAND_ERLAUBT; mit neuen Fotos nachziehen).
const VON_HAND_ERLAUBT = [
  ['src/daten/sogehts_fotos.json', 'Filter „Österreich“ gewählt: 37 Rezepte'],
  ['src/daten/sogehts_fotos.json', '„33 Rezepte ausgeblendet'],
];
const ZAHLWORT = 'zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|zwanzig|dreißig|vierzig|fünfzig|sechzig|siebzig|achtzig|neunzig|hundert|zweihundert|dreihundert|vierhundert|fünfhundert';
const VON_HAND = new RegExp(`(?<![\\p{L}\\p{N}.,])(?:\\d{1,4}|(?:${ZAHLWORT}))\\s+(?:[\\p{L}-]+\\s+){0,3}(?:Rezepte?n?|Ländern?|Einträgen? zum Meiden)(?![\\p{L}])`, 'giu');
const quelltexte = [];
const sammle = (ordner, endungen) => {
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) sammle(pfad, endungen);
    else if (endungen.test(name) && !/^rezepte(_zusatz)?\.json$/.test(name)) quelltexte.push(pfad.split(sep).join('/'));
  }
};
sammle('src', /\.(mjs|js|ts|astro|json|md|txt)$/);
sammle('public', /\.(html|txt|json|webmanifest|xml)$/);
let vonHandGelesen = 0;
for (const datei of quelltexte) {
  const ohneKommentare = readFileSync(datei, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
  vonHandGelesen++;
  for (const fund of alle(ohneKommentare, VON_HAND)) {
    const [stelle] = fund;
    if (/^1\s+Rezept$/.test(stelle)) continue;
    const umfeld = ohneKommentare.slice(Math.max(0, fund.index - 60), fund.index + stelle.length + 40);
    if (VON_HAND_ERLAUBT.some(([wo, was]) => wo === datei && umfeld.includes(was))) continue;
    melde(datei, `Zahl von Hand: „${stelle.replace(/\s+/g, ' ')}“ (Zahlen von Rezepten und Ländern kommen aus den Daten)`);
  }
}

// llms.txt nennt die Rubrik in einem eigenen Abschnitt, mit der Zahl aus den Daten.
if (!llms.includes('## Aus alten Kochbüchern\n') || !llms.includes(`(${websiteZahlen.alt} Rezepte, `)) melde('llms.txt', 'Abschnitt „Aus alten Kochbüchern“ fehlt oder nennt eine andere Zahl');

// Tabelle aller Titel und Beschreibungen, wie sie auf den gebauten Seiten stehen (Aufruf mit --meta <Datei>).
const metaZiel = process.argv.includes('--meta') ? process.argv[process.argv.indexOf('--meta') + 1] : null;
if (metaZiel) {
  const zelle = (text) => text.replaceAll('|', '\\|');
  const tabelle = [
    '# Website foodasu.com: Titel und Beschreibung jeder Seite (AP-18 Nachtrag Meta)',
    '',
    `Gelesen aus den gebauten Seiten (\`npm run meta\` nach \`npm run build\`); geändert wird in \`foodasu-web/src/daten/meta.mjs\`. ${metaZeilen.length} Seiten, davon ${metaZeilen.length - OHNE_INDEX.size} im Index. Themenseiten der Rezepte stehen nur mit mindestens ${INDEX_AB} Rezepten und eigenem Einleitungstext im Index (AP-22).`,
    '',
    `Grenzen: Titel ${GRENZEN.titel.von} bis ${GRENZEN.titel.bis} Zeichen und höchstens ${GRENZEN.titel.pixel} Pixel (Arial ${GRENZEN.titel.schrift} px); Beschreibung ${GRENZEN.beschreibung.von} bis ${GRENZEN.beschreibung.bis} Zeichen und höchstens ${GRENZEN.beschreibung.pixel} Pixel (Arial ${GRENZEN.beschreibung.schrift} px). Die Pixel sind die Summe der Zeichenbreiten ohne Unterschneidung, also eher zu breit als zu schmal gerechnet.`,
    '',
    '| Adresse | Titel | Zeichen | Pixel | Beschreibung | Zeichen | Pixel | Robots |',
    '|---|---|---|---|---|---|---|---|',
    // Reihenfolge: Startseite, dann nach Adresse, die 404-Seite am Ende.
    ...[...metaZeilen].sort((a, b) => {
      const rang = (zeile) => (zeile.adresse === '/' ? 0 : zeile.adresse === '/404.html' ? 2 : 1);
      return rang(a) - rang(b) || a.adresse.localeCompare(b.adresse, 'de');
    }).map((zeile) => {
      const t = masse(zeile.titel, 'titel');
      const b = masse(zeile.beschreibung, 'beschreibung');
      return `| ${zeile.adresse} | ${zelle(zeile.titel)} | ${t.zeichen} | ${t.pixel} | ${zelle(zeile.beschreibung)} | ${b.zeichen} | ${b.pixel} | ${zeile.robots} |`;
    }),
    '',
  ];
  writeFileSync(metaZiel, tabelle.join('\n'), 'utf8');
  console.log(`Geschrieben: ${metaZiel} (${metaZeilen.length} Seiten)`);
}

console.log(`Kurzlinks: ${weiterleitungen.size} Weiterleitungen (${[...weiterleitungen.keys()].join(', ')}) mit meta refresh auf den Eintrag bei Google Play, noindex, ohne Skript, nicht in Sitemap, llms.txt, Navigation oder robots.txt`);
console.log(`Geprüft: ${seiten.size} Seiten (${[...seiten.keys()].join(', ')}), ${dateien.length} Dateien`);
console.log(`Knopf „${TEILEN_NAME}“: auf ${teilenKnoepfe} von ${rezeptSeiten} Rezeptseiten, auf keiner anderen Seite`);
console.log(`„Zum Ausprobieren“ im Menü: ${probeWahlen.size} verschiedene Auswahlen im HTML von ${seiten.size} Seiten, je drei Rezepte aus drei Ländern, nie die Seite selbst`);
console.log(`Links zu Google Play: ${playLinks} im HTML, davon ${playOhneKennung} ohne Kennung auf Seiten mit Rechtstexten (erlaubt), alle anderen mit utm_campaign aus ${STORE_ORTE.join(', ')}; die drei Kurzlinks (Link und Weiterleitung) mit utm_campaign=kurzlink`);
console.log(`Zahlen der App: ${APP.gesamt} Rezepte und ${APP.laender} Länder in den Daten, im Text „über ${UEBER}“ an ${ueberStellen} Stellen; ${vonHandGelesen} Quelltexte ohne Zahl von Hand`);
console.log(`Themenseiten: ${themenSeiten.imIndex.length} im Index (ab ${INDEX_AB} Rezepten, mit Einleitungstext), ${themenSeiten.ohneIndex.length} mit noindex (${themenSeiten.ohneIndex.join(', ')})`);
console.log(`Im Index: ${seiten.size - OHNE_INDEX.size} von ${seiten.size} Seiten`);
console.log(`Farbprüfung: ${stilDateien.length} Stildateien (feste Farbwerte nur in basis.css und geraet.css), ${farbStellen} Stellen im HTML`);
console.log(`Herkunft und Plattform: ${herkunftDateien} Dateien des Baus durchsucht (HTML, TXT, XML, JSON; Skripte, Stile und Vektorbilder auf die Herkunft)`);
console.log(`Preisaussagen: ${preisSperre.dateien} Dateien des Baus durchsucht (${preisSperre.texte} Textdateien ganz, ${preisSperre.dateien - preisSperre.texte} weitere auf lesbare Zeichenfolgen), ${preisSperre.funde.length} Funde`);
// Zutaten und Zubereitung (AP-25 Nachbesserung, 11.10.2026): Warnung ohne Abbruch, wenn eine Zutat in keinem Schritt
// vorkommt oder mehrmals in der Liste steht, ohne dass ein Schritt sagt, welcher Eintrag gemeint ist
// (tools/zutaten_pruefen.mjs). Einzeln gemeldet werden die Rezepte, die es in der App noch nicht gibt: Ihren Wortlaut
// schreibt oder bearbeitet FoodAsu. Bei den Rezepten aus der App kommt der Wortlaut aus der Quelle; dort steht nur
// die Zahl, die Liste schreibt "node tools/zutaten_pruefen.mjs".
const zutatenStellen = { zusatz: 0, app: 0 };
const gepruefteRezepte = alleRezepte();
const warnungen = [];
for (const rezept of gepruefteRezepte) {
  const befunde = zutatenBefunde(rezept);
  zutatenStellen[rezept.herkunft] += befunde.length;
  if (rezept.herkunft === 'zusatz') for (const befund of befunde) warnungen.push(`/rezepte/${rezept.slug}/: ${befund.text}`);
}
console.log(`Zutaten und Zubereitung: ${gepruefteRezepte.length} Rezepte geprüft; ${zutatenStellen.zusatz} Warnungen bei den Rezepten, die es in der App noch nicht gibt; ${zutatenStellen.app} Stellen bei den Rezepten aus der App (Wortlaut aus der Quelle, Liste mit „node tools/zutaten_pruefen.mjs“)`);
for (const hinweis of hinweise) console.log(`HINWEIS ${hinweis}`);
for (const warnung of warnungen) console.log(`WARNUNG ${warnung}`);
for (const eintrag of fehler) console.log(`FEHLER ${eintrag}`);
console.log(`Ergebnis: ${fehler.length === 0 ? 'bestanden' : fehler.length + ' Befunde'}`);
process.exit(fehler.length === 0 ? 0 : 1);
