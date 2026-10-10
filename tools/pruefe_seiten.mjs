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

const DIST = 'dist';
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
    'og:type': istRezept ? 'article' : 'website', 'og:site_name': 'FoodAsu', 'og:locale': 'de_AT', 'og:title': titel,
    'og:description': beschreibung, 'og:url': HOST + adresse, 'og:image': HOST + bildPfad,
    'og:image:width': String(TEILEN.breite), 'og:image:height': String(TEILEN.hoehe),
    'twitter:card': 'summary_large_image', 'twitter:title': titel, 'twitter:description': beschreibung, 'twitter:image': HOST + bildPfad,
  };
  for (const [name, wert] of Object.entries(teilen)) {
    if (inhaltVon(html, name) !== wert) melde(adresse, `${name}: erwartet „${wert}“, gefunden „${inhaltVon(html, name)}“`);
  }
  for (const name of ['og:image:alt', 'twitter:image:alt']) if (!inhaltVon(html, name)?.trim()) melde(adresse, `${name} fehlt`);
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
  const erwartet = adresse === '/' ? ['WebSite', 'Organization', 'MobileApplication'] : OHNE_EINGANG.has(adresse) ? [] : ['BreadcrumbList'];
  for (const art of erwartet) if (!arten.includes(art)) melde(adresse, `strukturierte Daten fehlen: ${art}`);
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
        if (stelle < html.indexOf('class="s-kacheln"') || stelle > html.indexOf('class="s-inhalt')) melde(adresse, `Knopf „${TEILEN_NAME}“ steht nicht im Kopfbereich nach den Angaben zum Rezept`);
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
const FUSS_LINKS = ['/datenschutz.html', '/offenlegung/', '/lizenzen/', '/quellen-und-lizenzen/', '/so-gehts/', '/rezepte/', '/fragen/', '/daten-und-quellen/'];
const FUSS_TEXTE = [
  'Der Lebensmittel-Scanner für den ganzen Haushalt.', 'Maßgeblich ist die Verpackung.', 'Rechtliches', 'Folge uns',
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
if (!/<a class="nf-knopf" href="\/so-gehts\/"/.test(nichtGefunden)) melde('/404.html', "der Knopf „So geht's“ führt nicht zur Anleitung");
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
for (const hinweis of hinweise) console.log(`HINWEIS ${hinweis}`);
for (const eintrag of fehler) console.log(`FEHLER ${eintrag}`);
console.log(`Ergebnis: ${fehler.length === 0 ? 'bestanden' : fehler.length + ' Befunde'}`);
process.exit(fehler.length === 0 ? 0 : 1);
