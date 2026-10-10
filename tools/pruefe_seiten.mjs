// Prüft die gebaute Website in dist/: Kopfdaten und Aufbau jeder Seite, Links, fremde Adressen, Speicher im Browser,
// strukturierte Daten, Sitemap und die Wortlisten (gesperrte Wörter, Bezahl- und Fristwörter wie in
// texte_pruefen.py, dazu die Wendungen aus dem Nachtrag SEO, Punkt 7). Aufruf nach dem Bau: node tools/pruefe_seiten.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { begriffe } from '../src/daten/sprachen.mjs';
import { AUSDRUCK, durchlaufe } from './sprache_setzen.mjs';
import { muster as nurMuster } from '../src/daten/auswahl.mjs';

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
const AUSNAHMEN = ['Pro Portion', 'Pro Stück'];
const SPEICHER = /document\.cookie|localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest|\bfetch\(/;

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
  const attribute = alle(text, /(?:aria-label|alt|title|content)="([^"]*)"/g).map((m) => m[1]).join(' \n ');
  text = entschluesselt(text.replace(/<[^>]+>/g, ' ') + ' ' + attribute);
  for (const wendung of AUSNAHMEN) text = text.replaceAll(wendung, ' '.repeat(wendung.length));
  return text;
};

for (const [adresse, html] of seiten) {
  const titel = alle(html, /<title>([^<]*)<\/title>/g);
  if (titel.length !== 1 || !titel[0][1].trim()) melde(adresse, 'genau ein Titel erwartet');
  const beschreibung = html.match(/<meta name="description" content="([^"]*)"/);
  if (!beschreibung || !beschreibung[1].trim()) melde(adresse, 'Beschreibung fehlt');
  else if (beschreibung[1].length > 160) hinweise.push(`${adresse}: Beschreibung hat ${beschreibung[1].length} Zeichen`);
  const kanonisch = html.match(/<link rel="canonical" href="([^"]*)"/);
  if (!kanonisch || kanonisch[1] !== HOST + adresse) melde(adresse, `kanonische Adresse erwartet: ${HOST + adresse}`);
  if (alle(html, /<h1[\s>]/g).length !== 1) melde(adresse, 'genau eine Überschrift h1 erwartet');
  if (!/<html lang="de"/.test(html)) melde(adresse, 'lang="de" fehlt');
  for (const angabe of ['og:title', 'og:description', 'og:url', 'twitter:card']) {
    if (!html.includes(`="${angabe}"`)) melde(adresse, `${angabe} fehlt`);
  }

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
  if (datei.endsWith('.js') && SPEICHER.test(inhalt)) melde(name, `Speicher oder Anfrage im Skript: ${inhalt.match(SPEICHER)[0]}`);
}
for (const [adresse, html] of seiten) {
  for (const [, skript] of alle(html, /<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
    if (SPEICHER.test(skript)) melde(adresse, `Speicher oder Anfrage im Skript: ${skript.match(SPEICHER)[0]}`);
  }
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
// "So geht's" bleibt bis zur Karte C ein Platzhalter mit noindex (die Sitemap prüft der nächste Abschnitt).
const soGehts = seiten.get('/so-gehts/');
if (!soGehts) melde('/so-gehts/', 'Seite fehlt');
else if (!/<meta name="robots" content="noindex/.test(soGehts)) melde('/so-gehts/', 'noindex fehlt');

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
  for (const [adresse, html] of seiten) {
    // Die 404-Seite gehört nicht in die Sitemap: GitHub Pages liefert sie mit Status 404 aus.
    if (adresse === '/404.html') { if (karte.includes('/404.html')) melde('sitemap.xml', 'die 404-Seite ist eingetragen'); continue; }
    if (!html.includes('noindex') && !karte.includes(`<loc>${HOST + adresse}</loc>`)) melde('sitemap.xml', `Seite nicht eingetragen: ${adresse}`);
  }
}
if (!seiten.get('/')?.includes('facebook.com')) hinweise.push('Fuß: Adresse der Facebook-Seite fehlt (src/daten/seite.mjs)');

console.log(`Geprüft: ${seiten.size} Seiten (${[...seiten.keys()].join(', ')}), ${dateien.length} Dateien`);
for (const hinweis of hinweise) console.log(`HINWEIS ${hinweis}`);
for (const eintrag of fehler) console.log(`FEHLER ${eintrag}`);
console.log(`Ergebnis: ${fehler.length === 0 ? 'bestanden' : fehler.length + ' Befunde'}`);
process.exit(fehler.length === 0 ? 0 : 1);
