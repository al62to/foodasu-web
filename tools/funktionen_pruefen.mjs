// Hält die Funktionsliste der App (einkauf-app/docs/Funktionsliste.md) gegen den Code der App, gegen "So geht's"
// (src/daten/sogehts.mjs), gegen die Einführung der App, gegen Store-Eintrag und Social-Media-Wortlaute und gegen die
// Bildschirmfotos in foodasu-play/So_gehts_Bilder. Das Ergebnis steht danach in
// einkauf-app/docs/berichte/funktionen_stand.md. Der Prüfer warnt nur: Er endet immer ohne Fehler und bricht keinen
// Bau ab. Er läuft vor jedem neuen App-Release und vor jeder Änderung an "So geht's".
// Aufruf: npm run funktionen (oder node tools/funktionen_pruefen.mjs [Zieldatei]).
// Andere Orte über die Umgebung: FOODASU_APP (Ordner der App), FOODASU_PLAY (Ordner foodasu-play).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = resolve(process.env.FOODASU_APP ?? join(wurzel, '../einkauf-app'));
const play = resolve(process.env.FOODASU_PLAY ?? join(wurzel, '../foodasu-play'));
const liste = join(app, 'docs/Funktionsliste.md');
const ziel = process.argv[2] ?? join(app, 'docs/berichte/funktionen_stand.md');
const quelle = join(app, 'app/src/main');
const kotlin = join(quelle, 'java/at/tonc/einkauf');
const bilderOrdner = join(play, 'So_gehts_Bilder');

// Dateinamen, die einen Bildschirm, ein Blatt oder einen Dialog bauen.
const BILDSCHIRM = /(Screen|Page|Sheet|Dialogs?|Overlay)\.kt$/;
const ARTEN = ['Bildschirm', 'Datei', 'Route', 'Text', 'Einstellung'];

const lies = (pfad) => { try { return readFileSync(pfad, 'utf8'); } catch { return null; } };
const kurz = (text) => text.replace(/\s+/g, ' ').trim();

// Alle Dateien unter einem Ordner, als Pfade mit Schrägstrich relativ zu ihm.
function dateien(ordner, vorsatz = '') {
  let namen;
  try { namen = readdirSync(ordner); } catch { return []; }
  return namen.flatMap((name) => {
    const pfad = join(ordner, name);
    return statSync(pfad).isDirectory() ? dateien(pfad, `${vorsatz}${name}/`) : [`${vorsatz}${name}`];
  });
}

// Textschlüssel eines Ordners unter res: Name und ob er übersetzt wird.
function textschluessel(ordner) {
  const gefunden = new Map();
  for (const name of dateien(join(quelle, 'res', ordner)).filter((datei) => datei.endsWith('.xml'))) {
    const inhalt = lies(join(quelle, 'res', ordner, name)) ?? '';
    for (const treffer of inhalt.matchAll(/<(?:string|plurals)\s+name="([^"]+)"([^>]*)>/g)) {
      gefunden.set(treffer[1], { fest: treffer[2].includes('translatable="false"'), datei: name });
    }
  }
  return gefunden;
}

// Belege einer Zeile: je Art ("Text", "Datei" ...) die Angaben in Rückstrichen.
function belegeVon(wert) {
  const belege = [];
  for (const abschnitt of wert.split(';')) {
    const art = ARTEN.find((name) => new RegExp(`(^|[\\s:(])${name}\\s+\``).test(abschnitt));
    if (!art) continue;
    for (const treffer of abschnitt.matchAll(/`([^`]+)`/g)) belege.push({ art, wert: treffer[1] });
  }
  return belege;
}

// Die Funktionsliste lesen: Funktionen mit ihren Zeilen und die Belege ohne eigene Funktion (Abschnitt "Dem Prüfer
// bekannt").
function listeLesen(text) {
  const funktionen = [];
  const bekannt = [];
  let aktuell = null;
  let imBekannten = false;
  for (const zeile of text.split(/\r?\n/)) {
    const kopf = zeile.match(/^### (\S+) (.+)$/);
    if (kopf) {
      aktuell = { kennung: kopf[1], name: kopf[2].trim(), felder: {} };
      funktionen.push(aktuell);
      continue;
    }
    if (/^## /.test(zeile)) {
      aktuell = null;
      imBekannten = /Dem Prüfer bekannt/.test(zeile);
      continue;
    }
    const feld = zeile.match(/^- ([^:]+): (.*)$/);
    if (!feld) continue;
    if (aktuell) aktuell.felder[feld[1].trim()] = feld[2].trim();
    else if (imBekannten) bekannt.push(...belegeVon(feld[2]));
  }
  for (const funktion of funktionen) funktion.belege = belegeVon(funktion.felder.Belege ?? '');
  return { funktionen, bekannt };
}

// Ob ein Textschlüssel zu einer Angabe passt; ein Stern am Ende steht für jeden Rest.
const passt = (angabe, schluessel) => (angabe.endsWith('*') ? schluessel.startsWith(angabe.slice(0, -1)) : angabe === schluessel);

// Datum "10.10.2026" oder "10.10.2026 14:30" als Zeitpunkt; ohne Uhrzeit das Ende des Tages.
function zeitpunkt(text) {
  const treffer = text.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!treffer) return null;
  const [, tag, monat, jahr, stunde, minute] = treffer;
  return `${jahr}-${monat}-${tag}T${stunde ?? '23'}:${minute ?? '59'}:${stunde ? '00' : '59'}`;
}

// Bildschirmfotos einer Funktion: `datei.png` (Version, Datum, `Datei im Code`, weichgezeichnet).
function bilderVon(wert) {
  const bilder = [];
  for (const treffer of (wert ?? '').matchAll(/`([^`]+\.(?:png|jpg|jpeg|webp))`\s*\(([^)]*)\)/g)) {
    const angaben = treffer[2];
    bilder.push({
      datei: treffer[1],
      version: kurz(angaben.split(',')[0] ?? ''),
      aufnahme: zeitpunkt(angaben),
      datum: (angaben.match(/\d{2}\.\d{2}\.\d{4}(?:\s+\d{2}:\d{2})?/) ?? [''])[0],
      code: [...angaben.matchAll(/`([^`]+)`/g)].map((code) => code[1]),
      weich: /weichgezeichnet/.test(angaben) && !/nicht weichgezeichnet/.test(angaben),
    });
  }
  return bilder;
}

// Änderungen an einer Datei der App seit einem Zeitpunkt, aus der Git-Geschichte; null, wenn Git nicht antwortet.
function aenderungenSeit(pfad, seit) {
  try {
    const ausgabe = execFileSync('git', ['-C', app, 'log', `--since=${seit}`, '--format=%cs %h %s', '--', pfad], { encoding: 'utf8' });
    return ausgabe.split('\n').map((zeile) => zeile.trim()).filter(Boolean);
  } catch { return null; }
}

const pfadImCode = (angabe) => (angabe.startsWith('res/') || angabe === 'AndroidManifest.xml' ? join(quelle, angabe) : join(kotlin, angabe));

async function pruefen() {
  const z = [];
  const zeile = (text = '') => z.push(text);
  const abschnitt = (titel, eintraege, leer = 'Nichts zu melden.') => {
    zeile(`## ${titel}`);
    zeile();
    if (eintraege.length === 0) zeile(leer);
    else eintraege.forEach((eintrag) => zeile(`- ${eintrag}`));
    zeile();
  };

  const text = lies(liste);
  if (text === null) {
    zeile('# Stand der Funktionsliste');
    zeile();
    zeile(`Die Funktionsliste wurde nicht gefunden: \`${liste}\`. Geprüft wurde nichts.`);
    return { z, zahl: 1 };
  }
  const { funktionen, bekannt } = listeLesen(text);

  // Bestand im Code
  const alleDateien = dateien(kotlin);
  const routen = [...(lies(join(kotlin, 'core/navigation/Routes.kt')) ?? '').matchAll(/data (?:object|class) (\w+Route)\b/g)].map((treffer) => treffer[1]);
  const einstellungen = [...new Set(alleDateien.filter((datei) => datei.endsWith('.kt')).flatMap((datei) =>
    [...(lies(join(kotlin, datei)) ?? '').matchAll(/PreferencesKey\("([^"]+)"\)/g)].map((treffer) => treffer[1])))];
  const deutsch = textschluessel('values');
  const englisch = textschluessel('values-en');
  const schritte = [...(lies(join(kotlin, 'intro/domain/IntroPlan.kt')) ?? '').matchAll(/^\s{4}([A-Z][A-Z_]+)\(\d+,/gm)].map((treffer) => treffer[1]);
  const version = (() => {
    const gradle = lies(join(app, 'app/build.gradle.kts')) ?? '';
    const name = gradle.match(/versionName = "([^"]+)"/)?.[1];
    const nummer = gradle.match(/versionCode = (\d+)/)?.[1];
    return name ? `${name} (${nummer})` : 'unbekannt';
  })();

  // "So geht's": Kapitel und ihre Abschnitte
  let kapitel = null;
  try { kapitel = (await import(pathToFileURL(join(wurzel, 'src/daten/sogehts.mjs')).href)).kapitel; } catch { kapitel = null; }
  const storeText = lies(join(play, 'Store_Eintrag.md'));
  const socialText = lies(join(play, 'Social_Media_Wortlaute.md'));

  const alleBelege = [...funktionen.flatMap((funktion) => funktion.belege), ...bekannt];
  const genannt = (art) => new Set(alleBelege.filter((beleg) => art.includes(beleg.art)).map((beleg) => beleg.wert));
  const genannteDateien = genannt(['Bildschirm', 'Datei']);
  const genannteTexte = [...genannt(['Text'])];

  // 1. Belege, die es im Code nicht mehr gibt
  const fehlend = [];
  for (const funktion of [...funktionen, { kennung: 'Abschnitt „Dem Prüfer bekannt“', belege: bekannt }]) {
    for (const beleg of funktion.belege) {
      const fehlt =
        (beleg.art === 'Bildschirm' || beleg.art === 'Datei') ? !existsSync(pfadImCode(beleg.wert))
          : beleg.art === 'Route' ? !routen.includes(beleg.wert)
            : beleg.art === 'Einstellung' ? !einstellungen.includes(beleg.wert)
              : ![...deutsch.keys()].some((schluessel) => passt(beleg.wert, schluessel));
      if (fehlt) fehlend.push(`${funktion.kennung}: ${beleg.art} \`${beleg.wert}\``);
    }
  }

  // 2. Neues im Code, das in keiner Funktion steht
  const neu = [
    ...alleDateien.filter((datei) => BILDSCHIRM.test(datei) && !genannteDateien.has(datei)).map((datei) => `Bildschirm \`${datei}\``),
    ...routen.filter((route) => !genannt(['Route']).has(route)).map((route) => `Route \`${route}\``),
    ...einstellungen.filter((schluessel) => !genannt(['Einstellung']).has(schluessel)).map((schluessel) => `Einstellung \`${schluessel}\``),
    ...[...deutsch.entries()].filter(([schluessel]) => !genannteTexte.some((angabe) => passt(angabe, schluessel)))
      .map(([schluessel, angaben]) => `Text \`${schluessel}\` (${angaben.datei})`),
  ];

  // 3. und 4. Erklärungen: "So geht's", Einführung, Store-Eintrag, Social Media
  const ohneAnleitung = [];
  const nirgends = [];
  const falsch = [];
  const ohneEnglisch = [];
  const uebersicht = [];
  for (const funktion of funktionen) {
    const feld = (name) => funktion.felder[name] ?? '';
    const titel = `${funktion.kennung} ${funktion.name}`;
    const anleitung = feld("So geht's");
    const entfaellt = anleitung.startsWith('entfällt');
    const mitAnleitung = !entfaellt && !anleitung.startsWith('nein') && anleitung !== '';
    if (!mitAnleitung && !entfaellt) ohneAnleitung.push(titel);
    if (mitAnleitung) {
      for (const verweis of anleitung.split(';').map(kurz).filter(Boolean)) {
        const [slug, ...rest] = verweis.split(' / ');
        const abschnittName = rest.join(' / ');
        if (kapitel === null) continue;
        const eintrag = kapitel.find((kandidat) => kandidat.slug === slug);
        if (!eintrag) falsch.push(`${titel}: Kapitel \`${slug}\` gibt es in „So geht's“ nicht`);
        else if (!eintrag.teile.some((teil) => teil.titel === abschnittName)) falsch.push(`${titel}: Abschnitt „${abschnittName}“ fehlt im Kapitel \`${slug}\``);
      }
    }
    const einfuehrung = feld('Einführung');
    const inEinfuehrung = einfuehrung !== '' && !einfuehrung.startsWith('nein');
    for (const treffer of einfuehrung.matchAll(/`([^`]+)`/g)) {
      if (schritte.length > 0 && !schritte.includes(treffer[1])) falsch.push(`${titel}: Schritt \`${treffer[1]}\` gibt es in der Einführung nicht`);
    }
    const zitate = (name, quelleText, datei) => {
      const wert = feld(name);
      const ja = wert.startsWith('ja');
      if (ja && quelleText !== null) {
        for (const treffer of wert.matchAll(/`([^`]+)`/g)) {
          if (!kurz(quelleText).includes(kurz(treffer[1]))) falsch.push(`${titel}: „${treffer[1]}“ steht nicht in ${datei}`);
        }
      }
      return ja;
    };
    const imStore = zitate('Store-Eintrag', storeText, 'Store_Eintrag.md');
    const inSocial = zitate('Social Media', socialText, 'Social_Media_Wortlaute.md');
    if (!mitAnleitung && !entfaellt && !inEinfuehrung && !imStore && !inSocial) nirgends.push(titel);

    const texte = funktion.belege.filter((beleg) => beleg.art === 'Text');
    for (const [schluessel, angaben] of deutsch) {
      if (!angaben.fest && !englisch.has(schluessel) && texte.some((beleg) => passt(beleg.wert, schluessel))) ohneEnglisch.push(`${titel}: \`${schluessel}\``);
    }

    const geraet = feld('Am Gerät');
    funktion.bilder = bilderVon(feld('Bilder'));
    uebersicht.push(`| ${funktion.kennung} | ${funktion.name} | ${geraet.startsWith('geprüft') ? 'ja' : geraet.startsWith('nicht geprüft') ? 'nein' : 'zum Teil'} | ${mitAnleitung ? 'ja' : entfaellt ? 'entfällt' : 'nein'} | ${inEinfuehrung ? 'ja' : 'nein'} | ${imStore ? 'ja' : 'nein'} | ${inSocial ? 'ja' : 'nein'} | ${funktion.bilder.length} |`);
  }
  for (const [schluessel, angaben] of deutsch) {
    if (!angaben.fest && !englisch.has(schluessel) && !ohneEnglisch.some((eintrag) => eintrag.endsWith(`\`${schluessel}\``))) ohneEnglisch.push(`ohne Funktion: \`${schluessel}\``);
  }

  // 5. Bildschirmfotos
  const geaendert = [];
  const bildFehler = [];
  const ohneBild = [];
  const vorhandeneBilder = existsSync(bilderOrdner) ? readdirSync(bilderOrdner).filter((name) => /\.(png|jpg|jpeg|webp)$/.test(name)) : [];
  const eingetragen = new Set();
  for (const funktion of funktionen) {
    const titel = `${funktion.kennung} ${funktion.name}`;
    if (funktion.bilder.length === 0) {
      if (!(funktion.felder["So geht's"] ?? '').startsWith('entfällt')) ohneBild.push(titel);
      continue;
    }
    for (const bild of funktion.bilder) {
      eingetragen.add(bild.datei);
      if (!existsSync(join(bilderOrdner, bild.datei))) bildFehler.push(`${titel}: \`${bild.datei}\` liegt nicht in ${bilderOrdner}`);
      if (bild.weich && !existsSync(join(bilderOrdner, 'original', bild.datei))) bildFehler.push(`${titel}: zu \`${bild.datei}\` fehlt das Original in original/`);
      if (!bild.aufnahme) bildFehler.push(`${titel}: \`${bild.datei}\` ohne Datum der Aufnahme`);
      if (bild.code.length === 0) bildFehler.push(`${titel}: \`${bild.datei}\` ohne Datei im Code`);
      for (const code of bild.code) {
        if (!existsSync(pfadImCode(code))) { bildFehler.push(`${titel}: \`${bild.datei}\` nennt \`${code}\`, die Datei gibt es nicht mehr`); continue; }
        if (!bild.aufnahme) continue;
        const pfad = pfadImCode(code).slice(app.length + 1).replaceAll('\\', '/');
        const spaeter = aenderungenSeit(pfad, bild.aufnahme);
        if (spaeter === null) bildFehler.push(`${titel}: Git-Geschichte zu \`${code}\` nicht lesbar`);
        else if (spaeter.length > 0) geaendert.push(`${titel}: \`${bild.datei}\` (Aufnahme ${bild.datum}, Version ${bild.version}); \`${code}\` seither geändert: ${spaeter[0]}${spaeter.length > 1 ? ` und ${spaeter.length - 1} weitere` : ''}`);
      }
    }
  }
  for (const name of vorhandeneBilder) if (!eingetragen.has(name)) bildFehler.push(`\`${name}\` liegt im Ordner, steht aber bei keiner Funktion`);

  const zahl = fehlend.length + neu.length + ohneAnleitung.length + falsch.length + ohneEnglisch.length + geaendert.length + bildFehler.length + ohneBild.length;
  const jetzt = new Date();
  const zwei = (wert) => String(wert).padStart(2, '0');
  zeile('# Stand der Funktionsliste');
  zeile();
  zeile(`Erzeugt mit \`npm run funktionen\` am ${zwei(jetzt.getDate())}.${zwei(jetzt.getMonth() + 1)}.${jetzt.getFullYear()} um ${zwei(jetzt.getHours())}:${zwei(jetzt.getMinutes())}. App im Quellcode: ${version}. Geändert wird nicht hier, sondern in \`docs/Funktionsliste.md\`, im Code oder in „So geht's“.`);
  zeile();
  zeile(`Geprüft: ${funktionen.length} Funktionen, ${alleBelege.length} Belege, ${deutsch.size} Textschlüssel, ${routen.length} Routen, ${einstellungen.length} Einstellungen, ${kapitel === null ? '„So geht\'s“ nicht lesbar' : `${kapitel.length} Kapitel von „So geht's“`}, ${vorhandeneBilder.length} Bildschirmfotos im Ordner. Meldungen: ${zahl}.`);
  zeile();
  if (kapitel === null) { zeile('**Hinweis:** `src/daten/sogehts.mjs` ließ sich nicht lesen; die Verweise auf „So geht\'s“ sind nicht geprüft.'); zeile(); }
  if (storeText === null) { zeile(`**Hinweis:** \`Store_Eintrag.md\` nicht gefunden in ${play}; die Stellen im Store-Eintrag sind nicht geprüft.`); zeile(); }
  if (socialText === null) { zeile(`**Hinweis:** \`Social_Media_Wortlaute.md\` nicht gefunden in ${play}; die Stellen in den Wortlauten sind nicht geprüft.`); zeile(); }

  abschnitt('1. Belege, die im Code nicht mehr vorkommen', fehlend);
  abschnitt('2. Neu im Code, in keiner Funktion', neu);
  abschnitt("3. Funktionen ohne Erklärung auf „So geht's“", ohneAnleitung);
  abschnitt('4. Davon nirgends erklärt (auch nicht in Einführung, Store-Eintrag oder Social Media)', nirgends);
  abschnitt('5. Verweise, die nicht stimmen', falsch);
  abschnitt('6. Texte ohne englische Fassung', ohneEnglisch);
  abschnitt('7. Bildschirmfotos, deren Bildschirm im Code seit der Aufnahme geändert wurde', geaendert);
  abschnitt('8. Bildschirmfotos mit fehlenden Angaben oder Dateien', bildFehler);
  abschnitt('9. Funktionen ohne Bildschirmfoto', ohneBild);

  zeile('## 10. Übersicht');
  zeile();
  zeile("| Kennung | Funktion | Am Gerät geprüft | So geht's | Einführung | Store-Eintrag | Social Media | Bilder |");
  zeile('|---|---|---|---|---|---|---|---|');
  uebersicht.forEach((reihe) => zeile(reihe));
  zeile();
  return { z, zahl };
}

let ergebnis;
try {
  ergebnis = await pruefen();
} catch (fehler) {
  ergebnis = { z: ['# Stand der Funktionsliste', '', `Der Prüfer ist auf einen Fehler gestoßen und hat nicht alles geprüft: ${fehler?.message ?? fehler}`, ''], zahl: 1 };
}
try {
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, `${ergebnis.z.join('\n')}\n`, 'utf8');
  console.log(`Funktionsliste geprüft: ${ergebnis.zahl} Meldungen. Ergebnis in ${ziel}`);
} catch (fehler) {
  console.log(`Funktionsliste geprüft, das Ergebnis ließ sich aber nicht schreiben (${ziel}): ${fehler?.message ?? fehler}`);
}
process.exitCode = 0;
