// Sperre gegen Preisaussagen (Ali und Projektleitung, 11.10.2026; AP-29): Auf der Website steht keine Aussage zum
// Preis von FoodAsu, auch nicht über Code oder Metadaten. Die Prüfung läuft am Ende des Baus (astro.config.mjs) über
// jede Datei des fertigen Baus und bricht ihn bei einem Fund ab; die Meldung nennt Datei, Fund und Umgebung.
// "npm run pruefen" meldet dieselben Funde. Allein: node tools/preisaussagen.mjs [Ordner des Baus]
//
// Gesperrt, auch groß geschrieben, gebeugt und als Wortteil:
// - deutsch: die Wörter der Liste WORTE unten und die Wendungen mit derselben Bedeutung;
// - englisch: "free" als eigenes Wort im Sinn von Preis (nicht in "gluten-free" oder ähnlich) und die Wendungen;
// - der Betrag null als Preis, mit oder ohne Währung;
// - strukturierte Angaben mit derselben Bedeutung: ein Preis von null, "isAccessibleForFree" und Gleichwertiges.
// Dieselbe Liste prüft für die Texte außerhalb der Website foodasu-play/texte_pruefen.py.
//
// Durchsucht wird jede Datei des Baus, nicht nur HTML:
// - Textdateien (HTML, TXT, XML, JSON, Skripte, Stile, Vektorbilder) als Ganzes, also auch Titel, Beschreibungen,
//   Open Graph, Twitter-Karte, alt-, title- und aria-label-Attribute, Bildunterschriften, strukturierte Daten,
//   Adressen, Anker, llms.txt, robots.txt und sitemap.xml. Zeichen-Entitäten und Prozent-Kodierung sind aufgelöst,
//   weiche Trennzeichen entfernt; ein Wort, das ein Tag teilt, wird zusammengesetzt gelesen.
// - Bilder, Schriften und Filme: die lesbaren Zeichenfolgen der Datei (Metadaten wie IPTC und XMP). Text, der in
//   einem Bild gezeichnet ist, sieht die Prüfung nicht; das Bild zum Teilen entsteht aus dem Satz der Fußzeile.
// - der Name jeder Datei mit ihrem Ordner.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const VOR = '(?<![\\p{L}\\p{N}_])';
const ENDE = '(?![\\p{L}\\p{N}_])';
const muster = (quelle) => new RegExp(quelle, 'giu');

// Wörter, die auch mitten in einem Wort gelten ("Gratis-App", "kostenlose").
const WORTE = [
  'kostenlos', 'gratis', 'umsonst', 'kostenfrei', 'geb(?:ü|ue)hrenfrei', 'unentgeltlich', 'nulltarif',
  'kostet\\s+(?:[\\p{L}]+\\s+){0,2}nichts', 'zahl(?:st|t|en)\\s+(?:[\\p{L}]+\\s+)?nichts',
].map(muster);
// Wendungen mit derselben Bedeutung, ab einem Wortanfang.
const WENDUNGEN = [
  `ohne\\s+(?:[\\p{L}]+e\\s+)?kosten${ENDE}`, 'ohne\\s+(?:[\\p{L}]+e\\s+)?geb(?:ü|ue)hr',
  `keine(?:rlei)?\\s+(?:[\\p{L}]+n\\s+)?kosten${ENDE}`, 'keine(?:rlei)?\\s+(?:[\\p{L}]+n\\s+)?geb(?:ü|ue)hr',
  'nichts\\s+kostet', 'nichts\\s+(?:zu\\s+)?(?:be)?zahl',
  'for\\s+free', 'free\\s+of\\s+charge', `no\\s+(?:costs?|fees?|charges?)${ENDE}`,
  'at\\s+no\\s+(?:extra\\s+|additional\\s+)?(?:charge|cost)', `without\\s+(?:any\\s+)?(?:charge|cost|fee)s?${ENDE}`,
  'costs?\\s+nothing',
].map((quelle) => muster(VOR + '(?:' + quelle + ')'));
// "free" als eigenes Wort meint den Preis. Nicht gemeint sind Zusammensetzungen mit Bindestrich ("gluten-free",
// "free-range"), "free from", "free of ..." außer "free of charge" und "free text" (Freitext).
const FREE = [muster('(?<![\\p{L}\\p{N}_-])free(?![\\p{L}\\p{N}_-])(?!\\s+(?:text|from|of(?!\\s+charge)))')];
// Der Betrag null als Preis: "0 €", "0,00 €", "0 Euro", "EUR 0". Jeden anderen Betrag meldet die Bezahl-Liste in
// tools/pruefe_seiten.mjs.
const NULL_MIT_WAEHRUNG = [
  `(?<![\\d.,])0(?:[.,]0{1,2})?\\s*(?:€|euros?${ENDE}|eur${ENDE}|chf${ENDE}|cents?${ENDE}|franken${ENDE})`,
  `(?:€|${VOR}eur|${VOR}chf)\\s*0(?:[.,]0{1,2})?(?![.,]?\\d)`,
].map(muster);
// "0,00" ohne Währung, nur im Lesetext. Eine Menge wie "0,00 g" in den Nährwerten ist kein Preis.
const NULL_OHNE_WAEHRUNG = [muster(`(?<![\\d.,])0,00(?!\\d)(?!\\s*(?:g|mg|µg|kg|ml|cl|dl|l|kcal|kj|%|°)${ENDE})`)];
// Strukturierte Angaben: ein Preis von null in JSON-LD, Mikrodaten oder Kopfdaten, und die Angabe, ein Inhalt sei
// frei zugänglich. Suchmaschinen zeigen solche Angaben neben dem Treffer an.
const NULL_WERT = '["\']?\\s*0+(?:[.,]0+)?\\s*["\']?';
const STRUKTUR = [
  'isAccessibleForFree',
  `["'](?:price|lowPrice|highPrice|minPrice|maxPrice)["']\\s*:\\s*${NULL_WERT}(?=\\s*(?:[,}\\]]|$))`,
  '["\'](?:isFree|free)["\']\\s*:\\s*["\']?(?:true|1)',
  `itemprop\\s*=\\s*["']?(?:price|lowPrice|highPrice)["']?[^>]*\\scontent\\s*=\\s*${NULL_WERT}(?=[\\s/>])`,
  `content\\s*=\\s*${NULL_WERT}\\s[^>]*itemprop\\s*=\\s*["']?(?:price|lowPrice|highPrice)`,
  `(?:property|name)\\s*=\\s*["']?(?:product|og):price:amount["']?[^>]*\\scontent\\s*=\\s*${NULL_WERT}(?=[\\s/>])`,
  `content\\s*=\\s*${NULL_WERT}\\s[^>]*(?:property|name)\\s*=\\s*["']?(?:product|og):price:amount`,
].map(muster);

// Erlaubte Wortlaute: Stellen, an denen ein Wort der Liste nicht den Preis von FoodAsu meint. Jeder Eintrag nennt den
// Wortlaut genau und die Datei des Baus, in der er stehen darf. Eine neue Stelle braucht hier einen Eintrag mit Grund.
const ERLAUBT = [
  // Amtlicher Name der Lizenz eines fremden Programms auf der Seite "Lizenzen" (https://gsap.com/standard-license).
  { wortlaut: 'Standard „no charge“ GSAP License', datei: '/lizenzen/index.html' },
  // Rechtstext, Abschnitt über die Rechte: Der Satz meint die Antwort auf eine Anfrage zu den eigenen Daten
  // (Art. 12 Abs. 5 DSGVO), nicht FoodAsu. An der Datenschutzerklärung hat AP-29 nichts geändert.
  { wortlaut: 'Dafür entstehen dir keine Gebühren.', datei: '/datenschutz.html' },
];

const TEXTDATEI = /\.(?:html?|txt|xml|json|webmanifest|js|mjs|css|svg|map|md|csv|rss|atom)$/i;
const OHNE_LESETEXT = /\.(?:js|mjs|css|svg|map)$/i;
const ZEICHEN = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', shy: '', euro: '€', uuml: 'ü', Uuml: 'Ü', auml: 'ä', ouml: 'ö', szlig: 'ß' };

// Zeichen-Entitäten aufgelöst, unsichtbare Zeichen (weiches Trennzeichen, Leerzeichen ohne Breite) entfernt, jede Art
// von Leerraum als ein Leerzeichen.
const klar = (text) => text
  .replace(/&#x([0-9a-f]+);/gi, (_, zahl) => String.fromCodePoint(parseInt(zahl, 16)))
  .replace(/&#(\d+);/g, (_, zahl) => String.fromCodePoint(Number(zahl)))
  .replace(/&([a-z]+);/gi, (ganz, name) => ZEICHEN[name] ?? ganz)
  .replace(/[­​-‍⁠﻿]/g, '')
  .replace(/[\s   ]+/g, ' ');
const ohneProzent = (text) => text.replace(/(?:%[0-9a-f]{2})+/gi, (folge) => {
  try { return decodeURIComponent(folge); } catch { return folge; }
});
// HTML ohne Stile, ohne Skripte (strukturierte Daten bleiben) und ohne Zahlenreihen von Zeichnungen.
const lesetext = (html) => html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, ' ')
  .replace(/\s(?:d|points|viewBox|style|transform|srcset|sizes)="[^"]*"/gi, ' ');

function funde(text, listen) {
  const stellen = [];
  for (const liste of listen) {
    for (const ausdruck of liste) {
      for (const fund of text.matchAll(ausdruck)) {
        const von = Math.max(0, fund.index - 50);
        stellen.push({ wort: fund[0], umgebung: text.slice(von, fund.index + fund[0].length + 50).trim() });
      }
    }
  }
  return stellen;
}

// Funde in einem Text. "art" ist "html", "text" (TXT, XML, JSON), "code" (Skripte, Stile, Vektorbilder), "name" (Name
// einer Datei) oder "binaer" (lesbare Zeichenfolgen einer Bild-, Schrift- oder Filmdatei).
export function findeIn(inhalt, art, datei = '') {
  let text = klar(inhalt);
  for (const { wortlaut, datei: ort } of ERLAUBT) if (ort === datei) text = text.replaceAll(wortlaut, ' ');
  const stellen = funde(text, [WORTE, WENDUNGEN, FREE, NULL_MIT_WAEHRUNG, STRUKTUR]);
  if (art === 'html') stellen.push(...funde(klar(lesetext(inhalt)), [NULL_OHNE_WAEHRUNG]));
  if (art === 'text') stellen.push(...funde(text, [NULL_OHNE_WAEHRUNG]));
  // Die zwei Lesarten unten melden nur, was die erste nicht schon gefunden hat.
  const bekannt = new Set(stellen.map(({ wort }) => wort.toLowerCase()));
  const neu = (weitere) => weitere.filter(({ wort }) => !bekannt.has(wort.toLowerCase()) && bekannt.add(wort.toLowerCase()));
  if (art === 'html' || art === 'code') {
    // Ein Tag mitten im Wort oder in der Wendung ("kosten<wbr>los", "for <span>free</span>") trennt nicht.
    let ohneTags = klar(inhalt.replace(/<[^>]*>/g, ''));
    for (const { wortlaut, datei: ort } of ERLAUBT) if (ort === datei) ohneTags = ohneTags.replaceAll(wortlaut, ' ');
    stellen.push(...neu(funde(ohneTags, [WORTE, WENDUNGEN])));
  }
  // Eine Adresse mit Prozent-Kodierung ("geb%C3%BChrenfrei") zählt wie ihr Klartext.
  if (art !== 'binaer') stellen.push(...neu(funde(ohneProzent(text), [WORTE, WENDUNGEN])));
  return stellen;
}

// Lesbare Zeichenfolgen einer Datei, die kein Text ist: ASCII, dazu Umlaute und Anführungszeichen in UTF-8. Kurze
// Folgen entstehen in gepackten Daten zufällig und zählen nicht.
function zeichenfolgen(bytes) {
  const roh = bytes.toString('latin1');
  const folgen = roh.match(/(?:[\x20-\x7e]|\xc3[\x80-\xbf]|\xe2\x80[\x90-\x9f]){8,}/g) ?? [];
  return folgen.map((folge) => Buffer.from(folge, 'latin1').toString('utf8'));
}

function dateienIn(ordner) {
  const dateien = [];
  (function lauf(pfad) {
    for (const name of readdirSync(pfad)) {
      const datei = join(pfad, name);
      if (statSync(datei).isDirectory()) lauf(datei);
      else dateien.push(datei);
    }
  })(ordner);
  return dateien.sort();
}

// Liefert die Zahl der durchsuchten Dateien und die Funde als { datei, wort, umgebung }.
export function preisaussagen(bau = 'dist') {
  const stellen = [];
  if (!existsSync(bau)) return { dateien: 0, texte: 0, funde: stellen };
  const dateien = dateienIn(bau);
  let texte = 0;
  for (const datei of dateien) {
    const name = `/${relative(bau, datei).split(sep).join('/')}`;
    for (const fund of findeIn(ohneProzent(name).replace(/[/._]+/g, ' '), 'name')) stellen.push({ datei: name, ...fund, umgebung: `Name der Datei: ${name}` });
    const bytes = readFileSync(datei);
    const alsText = TEXTDATEI.test(name) || (!/\.[a-z0-9]+$/i.test(name) && bytes.length < 1_000_000 && !bytes.includes(0));
    if (alsText) {
      texte++;
      const art = /\.html?$/i.test(name) ? 'html' : OHNE_LESETEXT.test(name) ? 'code' : 'text';
      for (const fund of findeIn(bytes.toString('utf8'), art, name)) stellen.push({ datei: name, ...fund });
    } else {
      for (const folge of zeichenfolgen(bytes)) {
        // "free" allein nur in langen Folgen (Metadaten); in kurzen kann es in gepackten Daten zufällig stehen.
        const gefunden = findeIn(folge, 'binaer', name).filter(({ wort }) => wort.toLowerCase() !== 'free' || folge.length >= 16);
        for (const fund of gefunden) stellen.push({ datei: name, ...fund });
      }
    }
  }
  return { dateien: dateien.length, texte, funde: stellen };
}

// Bricht mit einer Meldung ab, die jede Datei und jeden Fund nennt. Ohne Fund kommen die Zahlen zurück.
export function pruefePreisaussagen(bau = 'dist') {
  const ergebnis = preisaussagen(bau);
  if (ergebnis.dateien === 0) throw new Error(`Preisaussagen: keine Datei unter ${bau} gefunden, die Sperre hat nichts geprüft`);
  if (ergebnis.funde.length) {
    const zeilen = ergebnis.funde.map(({ datei, wort, umgebung }) => `- ${datei}: „${wort}“ (… ${umgebung} …)`);
    throw new Error(`Preisaussage im Bau. Auf der Website steht keine Aussage zum Preis von FoodAsu (tools/preisaussagen.mjs).\n${zeilen.join('\n')}`);
  }
  return ergebnis;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { dateien, texte } = pruefePreisaussagen(process.argv[2] ?? process.env.DIST ?? 'dist');
    console.log(`Preisaussagen: ${dateien} Dateien durchsucht (${texte} Textdateien ganz, ${dateien - texte} weitere auf lesbare Zeichenfolgen), kein Fund`);
  } catch (fehler) {
    console.error(fehler.message);
    process.exit(1);
  }
}
