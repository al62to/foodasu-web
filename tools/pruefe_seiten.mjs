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
import { einblick } from '../src/daten/startseite.mjs';
import { GRENZEN, grenzBefunde, masse } from '../src/daten/breite.mjs';

// Der Ordner der gebauten Website; mit der Umgebungsvariable DIST prüft der Lauf einen anderen Ordner (Vorschau).
const DIST = process.env.DIST ?? 'dist';
const HOST = 'https://foodasu.com';
const OHNE_EINGANG = new Set(['/', '/404.html']);
// Rechtstexte laufen wie in texte_pruefen.py nur durch die Bezahl- und Fristlisten.
const RECHTSTEXTE = new Set(['/datenschutz.html']);
// Quelle, Urheber, Lizenz und Änderungen je Rezept (nicht im Index, im Fuß verlinkt).
const QUELLEN = '/quellen-und-lizenzen/';

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
    for (const befund of grenzBefunde(text, art)) melde(adresse, `${art === 'titel' ? 'Titel' : 'Beschreibung'} „${text}“: ${befund}`);
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
  const erwartet = adresse === '/' ? ['WebSite', 'Organization'] : OHNE_EINGANG.has(adresse) ? [] : ['BreadcrumbList'];
  for (const art of erwartet) if (!arten.includes(art)) melde(adresse, `strukturierte Daten fehlen: ${art}`);
  // AP-22, Entscheidung Ali vom 10.10.2026: keine Software-App in den strukturierten Daten, auf keiner Seite.
  for (const art of arten.flat()) if (/Application$/.test(art)) melde(adresse, `strukturierte Daten: ${art} ist nicht vorgesehen`);
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
      // der Abschnitt nennt Lizenz und Änderungsvermerk.
      const kennung = adresse.split('/').at(-2);
      if (!html.includes(`href="${QUELLEN}#${kennung}"`)) melde(adresse, `Link auf ${QUELLEN}#${kennung} fehlt`);
      const abschnitt = (seiten.get(QUELLEN) ?? '').split(/<section /).find((teil) => teil.includes(`id="${kennung}"`));
      if (!abschnitt) melde(QUELLEN, `Abschnitt zu ${kennung} fehlt`);
      else for (const teil of ['rel="license', 'Für FoodAsu verändert.', rezept.license, rezept.isBasedOn]) {
        if (!abschnitt.includes(teil.replaceAll('&', '&amp;'))) melde(QUELLEN, `Abschnitt ${kennung}: ${teil} fehlt`);
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
    if (texteZuZiel.has(text) && texteZuZiel.get(text) !== ziel) melde(adresse, `Linktext "${text}" führt zu verschiedenen Zielen`);
    texteZuZiel.set(text, ziel);
  }

  // Sprache: Kein Begriff aus src/daten/sprachen.mjs darf ohne lang-Attribut im sichtbaren Text stehen.
  durchlaufe(html, (text) => {
    for (const fund of text.match(AUSDRUCK) ?? []) melde(adresse, `fremdsprachiger Begriff ohne lang-Attribut: ${fund}`);
  });
  for (const [, sprache] of alle(html, /<span lang="([^"]+)">/g)) {
    if (!begriffe.some((begriff) => begriff.lang === sprache)) melde(adresse, `unbekanntes lang-Attribut: ${sprache}`);
  }

  // Wortlisten
  const text = sichtbar(html);
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

// Fußzeile A (AP-18 Teil D): auf jeder Seite Logo mit Satz und Hinweis, drei Spalten mit ihren Links, die schmale
// Zeile mit dem Vermerk. Facebook und Instagram sind einfache Links; eingebettet wird nichts.
const FUSS_LINKS = ['/datenschutz.html', '/offenlegung/', '/lizenzen/', '/quellen-und-lizenzen/', '/so-gehts/', '/rezepte/', '/fragen/', '/daten-und-quellen/', '/ueber-foodasu/'];
const FUSS_TEXTE = [
  'Lebensmittel-Scanner und Einkaufsliste für den ganzen Haushalt.', 'Maßgeblich ist die Verpackung.', 'Rechtliches', 'Folge uns',
  '© 2026 FoodAsu · Eine App von Ali',
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
  for (const satz of FUSS_TEXTE) if (!text.includes(satz)) melde(adresse, `Fußzeile ohne den Text „${satz}“`);
  if (alle(inhalt, /<h2\b/g).length !== 3) melde(adresse, 'Fußzeile: drei Spalten mit Überschrift erwartet');
  if (!/href="mailto:|href="&#/.test(inhalt)) melde(adresse, 'Fußzeile ohne Kontakt per E-Mail');
  for (const dienst of ['facebook.com', 'instagram.com']) {
    if (!new RegExp(`<a class="fuss-knopf" href="https://www\\.${dienst.replace('.', '\\.')}/[^"]*" rel="me noopener">\\s*<svg`).test(inhalt)) melde(adresse, `Fußzeile: Knopf mit Symbol für ${dienst} fehlt`);
  }
  if (/<(?:iframe|img|script|link)\b/.test(inhalt)) melde(adresse, 'Fußzeile bettet etwas ein (erlaubt sind nur Links und Zeichnungen im Quelltext)');
  if (!text.includes('Bald im Play Store') && !inhalt.includes('play.google.com')) melde(adresse, 'Fußzeile ohne Hinweis auf den Play Store');
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
if (alle(startseite, /<div class="geraet-rahmen"/g).length !== einblick.karten.length) melde('/', `Abschnitt „${einblick.ueberschrift}“: jedes Bild im Handy-Rahmen erwartet`);
if (kapitel.filter((eintrag) => eintrag.film).length > 3) melde(BEREICH, 'höchstens drei Schleifen (Karte C)');
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
const KERNSATZ = 'FoodAsu verbindet Lebensmittel-Scanner und Einkaufsliste in einer App für den ganzen Haushalt.';
const BESCHREIBUNG = `${KERNSATZ} Beim Scannen zeigt die App für jede Person einzeln, ob laut den Angaben zum Produkt etwas drin ist, das sie meidet. Dazu kommen über 300 Rezepte. Ohne Konto, ohne Werbung.`;
for (const adresse of ['/', '/ueber-foodasu/']) {
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
  if (alle(wochenTeil, /<li class="schritt">/g).length !== 4) melde('/', 'Einkaufswoche: vier Schritte erwartet');
  if (!wochenTeil.includes('href="/so-gehts/zu-hause-schreiben-im-laden-abhaken/"')) melde('/', 'Einkaufswoche: Link auf „Zu Hause schreiben, im Laden abhaken“ fehlt');
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
if (wochenTeil && !entschluesselt(wochenTeil).includes('„Warum?“')) melde('/', 'Einkaufswoche: Schritt 3 nennt „Warum?“ nicht');
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
const ABSATZ_START = [
  'In vielen Haushalten isst nicht jeder alles. Der eine isst kein Gluten, die andere keine Nüsse, das Kind trinkt keine Milch. Im Laden heißt das Packung umdrehen, Kleingedrucktes lesen, und beim nächsten Produkt wieder von vorn.',
  'Deshalb habe ich FoodAsu gebaut. Du legst einmal fest, was jede Person bei dir zu Hause meidet. Danach reicht ein Scan.',
];
const wortTeil = startseite.match(/<section class="wort" id="ohne">[\s\S]*?<\/section>/)?.[0] ?? '';
if (!wortTeil) melde('/', 'Abschnitt „Einkaufen ohne …“ fehlt');
else {
  const wortText = entschluesselt(wortTeil.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  for (const absatz of ABSATZ_START) if (!wortText.includes(absatz)) melde('/', `Absatz mit Unterschrift weicht vom Wortlaut ab: ${absatz.slice(0, 50)} …`);
  if (!/Ali Tonc,\s*Entwickler von FoodAsu/.test(wortText)) melde('/', 'Unterschrift „Ali Tonc, Entwickler von FoodAsu“ fehlt');
  if (!/<a\b[^>]*href="\/ueber-foodasu\/#warum"[^>]*>\s*Warum es FoodAsu gibt/.test(wortTeil)) melde('/', 'Link „Warum es FoodAsu gibt“ auf /ueber-foodasu/#warum fehlt');
  // Nachtrag zu AP-23 Teil B Nr. 6: Die Wörter stehen als Chips neben der Unterschrift; "Eier" statt "Schweinefleisch".
  if (/Schweinefleisch/.test(entschluesselt(wortTeil))) melde('/', 'im Abschnitt mit Alis Unterschrift steht „Schweinefleisch“ (Chips und Absatz; seit dem Nachtrag zu AP-23 „Eier“)');
  if (!/<li[^>]*\bdata-wortmarke\b[^>]*>Eier<\/li>/.test(wortTeil)) melde('/', 'der Chip „Eier“ im Abschnitt „Einkaufen ohne …“ fehlt');
  if (/:/.test(ABSATZ_START.map((absatz) => wortText.includes(absatz) ? '' : ':').join(''))) melde('/', 'der Absatz mit Unterschrift enthält einen Doppelpunkt');
}
if (/data-band\b|band-spur/.test(startseite)) melde('/', 'die Bänder der Startseite laufen noch (sie stehen seit AP-23 still, als Chips in Reihen)');
if (!/id="fragen"/.test(startseite)) melde('/', 'Abschnitt mit dem Anker #fragen fehlt');
const tischTeil = startseite.match(/<div class="tisch" aria-hidden="true">[\s\S]*?<\/div>/)?.[0] ?? '';
if (!tischTeil) melde('/', 'der Tisch im Abschnitt „Wenn nicht alle dasselbe essen“ fehlt oder ist für Bildschirmleser nicht ausgeblendet');
else for (const schild of ['Kind · Milch', 'Partner · Vegetarisch', 'Gäste · Schweinefleisch', 'Oma · Gluten']) if (!entschluesselt(tischTeil).includes(schild)) melde('/', `Schildchen am Tisch fehlt: ${schild}`);
if (alle(startseite, /<li class="lage(?: woche)?">/g).length !== 5) melde('/', '„Wenn nicht alle dasselbe essen“: fünf Lagen erwartet');
if (!/<div class="einkauf" aria-hidden="true">/.test(startseite)) melde('/', 'die kleine Einkaufsliste beim Wocheneinkauf fehlt oder ist für Bildschirmleser nicht ausgeblendet');
// Nachtrag zu AP-23 (Ali, 11.10.2026): FoodAsu tritt ohne regionale Herkunft auf (kein Ort, keine Region, kein Land als
// Herkunft) und wird ohne Plattform beschrieben. Geprüft wird der fertige Bau, nicht der Quelltext: jede HTML-, TXT-,
// XML- und JSON-Datei als Ganzes, also auch Titel, Beschreibungen, Open Graph, Twitter-Karte, strukturierte Daten,
// Bildbeschreibungen, Sprungmarken, llms.txt, sitemap.xml und robots.txt; Skripte, Stile und Vektorbilder dazu auf die
// Wörter zur Herkunft. Erlaubt bleiben genau diese Stellen:
// - Datenschutzerklärung und Offenlegung: der Rechtstext selbst (Anschrift und Behörde sind Pflicht), nicht die
//   Kopfdaten und der Rahmen der Seite;
// - die Länder der Rezepte: "aus Österreich" auf den Seiten unter /rezepte/ und in llms.txt in der Zeile einer solchen
//   Seite;
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
const VERFUEGBAR = 'Zuerst kommt die App für Android in den Play Store, danach folgt die Version fürs iPhone.';
const STAND = `FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. ${VERFUEGBAR}`;
const PLAY_EINTRAG = 'https://play.google.com/store/apps/details?id=at.tonc.einkauf';
const WEITERE_SPRACHE = /<meta property="og:locale:alternate" content="de_AT"\s*\/?>/g;
const ANLEITUNG_ANDROID = [
  'FoodAsu gibt es zuerst für Android und kommt über Google Play auf dein Handy.',
  'Backup von Android', 'backup-von-android', 'Android kann ein Backup deiner App-Daten anlegen',
  'Mit geht die Version der App und von Android, sonst nichts.',
];
const RECHT_MIT_ANSCHRIFT = new Set(['/datenschutz.html', '/offenlegung/']);
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
    const inAnleitung = adresse.startsWith(BEREICH) || (name === '/llms.txt' && teil.includes(`](${HOST}${BEREICH}`));
    if (inAnleitung) for (const wortlaut of ANLEITUNG_ANDROID) teil = teil.replaceAll(wortlaut, ' ');
    const beiRezepten = adresse.startsWith('/rezepte/') || (name === '/llms.txt' && teil.includes(`](${HOST}/rezepte/`));
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
if (!llms.split('\n').some((zeile) => zeile.startsWith(`> ${KERNSATZ} ${VERFUEGBAR} `))) melde('llms.txt', 'Einleitung: der Kernsatz und danach der Satz zur Plattform erwartet');
if (llms.split(VERFUEGBAR).length !== 2) melde('llms.txt', 'der Satz zur Plattform steht nicht genau einmal in der Datei');
// Titel der Startseite, Überschrift von "Über FoodAsu", Satz der Fußzeile als Beschreibung des Bildes zum Teilen.
if (!startseite.includes('<title>FoodAsu: Lebensmittel-Scanner und Einkaufsliste</title>')) melde('/', 'Titel „FoodAsu: Lebensmittel-Scanner und Einkaufsliste“ erwartet');
if (!fliesstext('/ueber-foodasu/').includes(' Über FoodAsu: Lebensmittel-Scanner und Einkaufsliste für den ganzen Haushalt ') || !/<h1[^>]*>Über FoodAsu: /.test(seiten.get('/ueber-foodasu/') ?? '')) melde('/ueber-foodasu/', 'Überschrift „Über FoodAsu: Lebensmittel-Scanner und Einkaufsliste für den ganzen Haushalt“ fehlt');
if (inhaltVon(startseite, 'og:image:alt') !== 'FoodAsu: Lebensmittel-Scanner und Einkaufsliste für den ganzen Haushalt.') melde('/', 'Beschreibung des Bildes zum Teilen: der Satz der Fußzeile erwartet');
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
// 404-Seite: Karte im Wortlaut der Projektleitung, keine Handys mehr, die Null als Zitronenscheibe.
if (!sichtbar(nichtGefunden).includes('Lebensmittel-Scanner und Einkaufsliste in einer App: Du scannst beim Einkauf und siehst sofort, ob laut den Angaben etwas drin ist, das du meidest.')) melde('/404.html', 'Karte „Was ist FoodAsu?“ weicht vom Wortlaut ab');
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
if (fragenTitel.length !== 6 || fragenTitel.join(' | ') !== faqNamen.join(' | ')) melde('/fragen/', `FAQPage folgt nicht der Reihenfolge der Seite: Seite „${fragenTitel.join(' | ')}“, Daten „${faqNamen.join(' | ')}“`);
if ((faqDaten?.mainEntity ?? []).find((eintrag) => eintrag.name === 'Wo bekomme ich FoodAsu?')?.acceptedAnswer?.text !== STAND) melde('/fragen/', 'FAQPage: Die Antwort auf „Wo bekomme ich FoodAsu?“ ist nicht der Satz zur Verfügbarkeit');
if (!/<p class="kasten">FoodAsu ist kein Medizinprodukt/.test(fragenInhalt)) melde('/fragen/', 'der Satz zum Medizinprodukt steht nicht als Lavendel-Kasten da');
if (/<details/.test(fragenInhalt)) melde('/fragen/', 'eine Antwort ist zugeklappt (auf dieser Seite stehen alle Antworten offen)');
for (const [adresse, html] of seiten) {
  if (adresse !== '/fragen/' && /"@type":\s*"FAQPage"/.test(html)) melde(adresse, 'FAQPage gehört nur auf /fragen/');
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
if (/<nav class="s-toc"/.test(seiten.get('/offenlegung/') ?? '')) melde('/offenlegung/', 'die Offenlegung hat keine Abschnitte und braucht kein Inhaltsverzeichnis');
// Linienmotive: höchstens drei je Abschnitt (die Komponente bricht sonst den Bau ab); hier zählt die Seite als Ganzes
// nur als Hinweis auf vergessene Kennzeichnung: Jedes Motiv ist für Bildschirmleser ausgeblendet.
for (const [adresse, html] of seiten) {
  for (const [motiv] of alle(html, /<svg[^>]*class="motiv[^"]*"[^>]*>/g)) if (!/aria-hidden="true"/.test(motiv)) melde(adresse, 'ein Linienmotiv ist für Bildschirmleser nicht ausgeblendet');
}

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

console.log(`Geprüft: ${seiten.size} Seiten (${[...seiten.keys()].join(', ')}), ${dateien.length} Dateien`);
console.log(`Knopf „${TEILEN_NAME}“: auf ${teilenKnoepfe} von ${rezeptSeiten} Rezeptseiten, auf keiner anderen Seite`);
console.log(`Themenseiten: ${themenSeiten.imIndex.length} im Index (ab ${INDEX_AB} Rezepten, mit Einleitungstext), ${themenSeiten.ohneIndex.length} mit noindex (${themenSeiten.ohneIndex.join(', ')})`);
console.log(`Im Index: ${seiten.size - OHNE_INDEX.size} von ${seiten.size} Seiten`);
console.log(`Farbprüfung: ${stilDateien.length} Stildateien (feste Farbwerte nur in basis.css und geraet.css), ${farbStellen} Stellen im HTML`);
console.log(`Herkunft und Plattform: ${herkunftDateien} Dateien des Baus durchsucht (HTML, TXT, XML, JSON; Skripte, Stile und Vektorbilder auf die Herkunft)`);
for (const hinweis of hinweise) console.log(`HINWEIS ${hinweis}`);
for (const eintrag of fehler) console.log(`FEHLER ${eintrag}`);
console.log(`Ergebnis: ${fehler.length === 0 ? 'bestanden' : fehler.length + ' Befunde'}`);
process.exit(fehler.length === 0 ? 0 : 1);
