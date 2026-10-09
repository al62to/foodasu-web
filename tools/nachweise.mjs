// Nachweise an der gebauten Website, gegen eine laufende Vorschau (npm run preview):
//   1. Netzwerk-Mitschnitt je Seite: keine Anfragen an Dritte, keine Cookies, kein Speicher im Browser
//   2. GSAP wird erst nach dem ersten Zeichnen geladen, mit "Bewegung reduzieren" gar nicht
//   3. kein waagrechtes Scrollen bei 360, 390, 768, 1024 und 1440 Pixel
//   4. Mega-Menü mit Tastatur, ohne JavaScript und so, wie es ein Bildschirmleser gemeldet bekommt
//   5. Bildschirmfotos (Handy und Laptop, hell und dunkel) auf einem Blatt
// Aufruf: node tools/nachweise.mjs [Adresse der Vorschau] [Zielordner] [--ohne-bilder]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { seiten as verzeichnis } from '../src/daten/seite.mjs';

const werte = process.argv.slice(2).filter((wert) => !wert.startsWith('--'));
const BASIS = (werte[0] ?? 'http://localhost:4321').replace(/\/$/, '');
const ZIEL = resolve(werte[1] ?? 'nachweise');
const MIT_BILDERN = !process.argv.includes('--ohne-bilder');
const SEITEN = verzeichnis.map((eintrag) => eintrag.pfad);
const BREITEN = [360, 390, 768, 1024, 1440];
const HANDY = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1440, height: 900, deviceScaleFactor: 1 };

mkdirSync(ZIEL, { recursive: true });
const zeilen = [];
const fehler = [];
const sage = (text = '') => { zeilen.push(text); console.log(text); };
const pruefe = (gut, text) => { sage(`${gut ? 'ok    ' : 'FEHLER'} ${text}`); if (!gut) fehler.push(text); };
const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });

async function neueSeite({ ansicht = LAPTOP, schema = 'light', ruhig = false, skript = true } = {}) {
  const umgebung = await browser.createBrowserContext();
  const seite = await umgebung.newPage();
  await seite.setViewport(ansicht);
  await seite.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: schema },
    { name: 'prefers-reduced-motion', value: ruhig ? 'reduce' : 'no-preference' },
  ]);
  await seite.setJavaScriptEnabled(skript);
  return { umgebung, seite };
}

// Scrollt die Seite einmal ganz durch (lädt verzögerte Bilder, löst die Bewegung beim Scrollen aus).
async function durchscrollen(seite) {
  await seite.evaluate(async () => {
    const schritt = Math.round(window.innerHeight * 0.6);
    for (let oben = 0; oben < document.documentElement.scrollHeight; oben += schritt) {
      window.scrollTo({ top: oben, behavior: 'instant' });
      await new Promise((fertig) => setTimeout(fertig, 120));
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  });
  await warte(1800);
}

// 1 und 2: Mitschnitt, Speicher, Zeitpunkt des Nachladens
sage('## 1 Netzwerk-Mitschnitt, Cookies, Speicher');
for (const pfad of SEITEN) {
  const { umgebung, seite } = await neueSeite({ ansicht: HANDY });
  const anfragen = [];
  seite.on('request', (anfrage) => { if (!anfrage.url().startsWith('data:')) anfragen.push(anfrage.url()); });
  await seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
  await warte(2500);
  const beimLaden = anfragen.length;
  await durchscrollen(seite);
  const fremd = anfragen.filter((adresse) => new URL(adresse).origin !== new URL(BASIS).origin);
  const speicher = await seite.evaluate(async () => ({
    cookie: document.cookie.length,
    lokal: localStorage.length,
    sitzung: sessionStorage.length,
    datenbanken: (await indexedDB.databases()).length,
    zwischenspeicher: (await caches.keys()).length,
    dienste: (await navigator.serviceWorker.getRegistrations()).length,
  }));
  const cookies = (await umgebung.cookies()).length;
  sage(`${pfad}: ${beimLaden} Anfragen beim ersten Laden, ${anfragen.length} nach dem Durchscrollen`);
  for (const adresse of anfragen) sage(`    ${adresse.replace(BASIS, '')}`);
  pruefe(fremd.length === 0, `${pfad}: Anfragen an Dritte: ${fremd.length}${fremd.length ? ' (' + fremd.join(', ') + ')' : ''}`);
  pruefe(cookies === 0 && speicher.cookie === 0, `${pfad}: Cookies: ${cookies}`);
  pruefe(
    Object.values(speicher).every((zahl) => zahl === 0),
    `${pfad}: localStorage ${speicher.lokal}, sessionStorage ${speicher.sitzung}, IndexedDB ${speicher.datenbanken}, Cache ${speicher.zwischenspeicher}, Service Worker ${speicher.dienste}`,
  );
  if (pfad === '/') {
    const zeiten = await seite.evaluate(() => ({
      zeichnen: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
      laden: performance.getEntriesByType('navigation')[0].loadEventStart,
      gsap: performance.getEntriesByType('resource').find((eintrag) => /bewegung/.test(eintrag.name))?.startTime ?? null,
    }));
    sage(`/: erstes Zeichnen nach ${Math.round(zeiten.zeichnen)} ms, load nach ${Math.round(zeiten.laden)} ms, GSAP angefragt nach ${Math.round(zeiten.gsap)} ms`);
    pruefe(zeiten.gsap !== null && zeiten.gsap > zeiten.zeichnen && zeiten.gsap >= zeiten.laden, '/: GSAP wird erst nach dem ersten Zeichnen (und nach load) angefragt');
  }
  await umgebung.close();
}

sage();
sage('## 2 "Bewegung reduzieren"');
{
  const { umgebung, seite } = await neueSeite({ ansicht: HANDY, ruhig: true });
  const anfragen = [];
  seite.on('request', (anfrage) => anfragen.push(anfrage.url()));
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  await warte(2500);
  await durchscrollen(seite);
  const stand = await seite.evaluate(() => {
    const sichtbar = (auswahl) => [...document.querySelectorAll(auswahl)].every((element) => {
      const stil = getComputedStyle(element);
      return stil.opacity === '1' && stil.visibility === 'visible' && stil.display !== 'none';
    });
    return {
      laufend: document.getAnimations().filter((bewegung) => bewegung.playState === 'running').length,
      sichtbar: sichtbar('.held h1, .held-vorspann, .handy-rahmen, [data-urteil], [data-person], .schwebt, .schritt, .glaskarte, .zaehler li, .rezeptkarte, .faq details, .wort-text'),
      zahlen: [...document.querySelectorAll('[data-zahl]')].map((element) => element.textContent === element.dataset.zahl),
      kopien: document.querySelectorAll('.band-liste[aria-hidden="true"]').length,
      linie: getComputedStyle(document.querySelector('[data-linie]')).transform,
      wort: document.querySelector('[data-wort]').textContent,
    };
  });
  pruefe(!anfragen.some((adresse) => /bewegung/.test(adresse)), 'GSAP wird nicht geladen');
  pruefe(stand.laufend === 0, `laufende Animationen: ${stand.laufend}`);
  pruefe(stand.sichtbar, 'alle Inhalte sofort sichtbar (Kopf, Handy, Schritte, Karten, Zähler, Rezepte, Fragen)');
  pruefe(stand.zahlen.every(Boolean), 'Zähler zeigen die Endzahl');
  pruefe(stand.kopien === 0, 'Laufbänder stehen als Liste, ohne Kopien');
  pruefe(stand.linie === 'none' || stand.linie === 'matrix(1, 0, 0, 1, 0, 0)', 'Linie der drei Schritte ist ganz gezeichnet');
  await umgebung.close();
}

sage();
sage('## 2b Bewegung läuft (ohne "Bewegung reduzieren", Laptop)');
{
  const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  await warte(1200);
  const lage = (auswahl) => seite.evaluate((ziel) => getComputedStyle(document.querySelector(ziel)).transform, auswahl);
  const vorher = { blatt: await lage('[data-blatt]'), marke: await seite.evaluate(() => getComputedStyle(document.querySelector('.schwebt')).translate) };
  await warte(2600);
  pruefe((await lage('[data-blatt]')) !== vorher.blatt, 'Kopf: Der Scan im Handy läuft (Karte bewegt sich)');
  pruefe((await seite.evaluate(() => getComputedStyle(document.querySelector('.schwebt')).translate)) !== vorher.marke, 'Kopf: Begriffe schweben');
  await seite.evaluate(() => document.querySelector('#ohne').scrollIntoView({ behavior: 'instant' }));
  const woerter = new Set();
  for (let nummer = 0; nummer < 6; nummer++) { woerter.add(await seite.evaluate(() => document.querySelector('[data-wort]').textContent)); await warte(1000); }
  pruefe(woerter.size >= 3, `Wechselndes Wort: ${[...woerter].join(', ')}`);
  await seite.evaluate(() => { const ziel = document.querySelector('#schritte'); window.scrollTo({ top: ziel.offsetTop - window.innerHeight * 0.45, behavior: 'instant' }); });
  await warte(600);
  const linie = await seite.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('[data-linie]')).transform).a);
  pruefe(linie > 0.05 && linie < 0.95, `Drei Schritte: Linie wächst mit dem Scrollen (Stand ${linie.toFixed(2)})`);
  await seite.evaluate(() => document.querySelector('#funktionen').scrollIntoView({ behavior: 'instant' }));
  await warte(1600);
  const flaeche = await lage('.glas-flaechen .a');
  const karte = await (await seite.$('.k-scanner')).boundingBox();
  await seite.mouse.move(karte.x + karte.width * 0.85, karte.y + karte.height * 0.2);
  await seite.mouse.move(karte.x + karte.width * 0.9, karte.y + karte.height * 0.15);
  await warte(600);
  pruefe((await lage('.k-scanner')).startsWith('matrix3d'), 'Glas-Raster: Karte neigt sich zur Maus');
  pruefe((await lage('.glas-flaechen .a')) !== flaeche, 'Glas-Raster: Farbflächen bewegen sich');
  const haken = new Set();
  await seite.evaluate(() => document.querySelector('.k-liste').scrollIntoView({ behavior: 'instant', block: 'center' }));
  for (let nummer = 0; nummer < 5; nummer++) { haken.add(await seite.evaluate(() => document.querySelectorAll('[data-haken] li.erledigt').length)); await warte(900); }
  pruefe(haken.size >= 3, `Einkaufsliste hakt sich ab (Stände ${[...haken].sort().join(', ')})`);
  await seite.evaluate(() => document.querySelector('#zahlen').scrollIntoView({ behavior: 'instant' }));
  await warte(300);
  const unterwegs = await seite.evaluate(() => [...document.querySelectorAll('[data-zahl]')].map((element) => element.textContent).join(' '));
  const band = await seite.evaluate(() => [...document.querySelectorAll('[data-band]')].map((spur) => ({ kopien: spur.children.length, lauf: getComputedStyle(spur).animationName, richtung: getComputedStyle(spur).animationDirection })));
  await warte(2300);
  const amEnde = await seite.evaluate(() => [...document.querySelectorAll('[data-zahl]')].every((element) => element.textContent === element.dataset.zahl));
  pruefe(amEnde, `Zähler laufen hoch (unterwegs ${unterwegs}, am Ende die Endzahlen)`);
  pruefe(band.every((spur) => spur.kopien >= 2 && spur.lauf === 'band') && band[0].richtung !== band[1].richtung, `Laufbänder laufen gegeneinander (${band.map((spur) => `${spur.kopien} Kopien, ${spur.richtung}`).join('; ')})`);
  await seite.evaluate(() => document.querySelector('#rezepte').scrollIntoView({ behavior: 'instant' }));
  await warte(1500);
  pruefe(await seite.evaluate(() => [...document.querySelectorAll('.rezeptkarte img')].every((bild) => bild.complete && bild.naturalWidth > 0 && /\.avif$/.test(bild.currentSrc))), 'Rezepte-Vorschau: vier Bilder geladen (AVIF)');
  await umgebung.close();
}

sage();
sage('## 3 Breiten (kein waagrechtes Scrollen)');
for (const pfad of SEITEN) {
  const ergebnis = [];
  for (const breite of BREITEN) {
    const { umgebung, seite } = await neueSeite({ ansicht: { width: breite, height: 900, deviceScaleFactor: 1, isMobile: breite < 768, hasTouch: breite < 768 } });
    await seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
    await warte(pfad === '/' ? 1500 : 200);
    if (pfad === '/') await durchscrollen(seite);
    const mass = await seite.evaluate(() => ({ inhalt: document.documentElement.scrollWidth, fenster: document.documentElement.clientWidth }));
    ergebnis.push(`${breite}: ${mass.inhalt <= mass.fenster ? 'ok' : `FEHLER (${mass.inhalt} > ${mass.fenster})`}`);
    if (mass.inhalt > mass.fenster) fehler.push(`${pfad} bei ${breite}: waagrechtes Scrollen`);
    await umgebung.close();
  }
  sage(`${pfad}  ${ergebnis.join(', ')}`);
}

// 4 Mega-Menü
sage();
sage('## 4 Mega-Menü');
const aktiv = (seite) => seite.evaluate(() => {
  const element = document.activeElement;
  return { name: (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' '), marke: element.tagName, mega: !!element.closest('#mega-rezepte') };
});
const zustand = (seite) => seite.evaluate(() => ({
  mega: document.querySelector('[data-mega-knopf]').getAttribute('aria-expanded'),
  menue: document.querySelector('[data-menue]').getAttribute('aria-expanded'),
  megaSichtbar: getComputedStyle(document.querySelector('#mega-rezepte')).display !== 'none',
  listeSichtbar: getComputedStyle(document.querySelector('#hauptliste')).display !== 'none',
  links: [...document.querySelectorAll('.haupt a')].filter((link) => link.getClientRects().length > 0).length,
  alleLinks: document.querySelectorAll('.haupt a').length,
}));
async function tabBis(seite, auswahl, hoechstens = 20) {
  const weg = [];
  for (let nummer = 0; nummer < hoechstens; nummer++) {
    await seite.keyboard.press('Tab');
    weg.push((await aktiv(seite)).name);
    if (await seite.evaluate((ziel) => document.activeElement.matches(ziel), auswahl)) return weg;
  }
  return null;
}
{
  const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  const weg = await tabBis(seite, '[data-mega-knopf]');
  sage(`Laptop, Tab-Reihenfolge bis zum Knopf: ${weg ? weg.join(' > ') : 'nicht erreicht'}`);
  pruefe(!!weg, 'Laptop: Knopf "Untermenü Rezepte" mit Tab erreichbar');
  const umriss = await seite.evaluate(() => { const stil = getComputedStyle(document.activeElement); return `${stil.outlineStyle} ${stil.outlineWidth}`; });
  pruefe(/solid [1-9]/.test(umriss), `Laptop: Fokus sichtbar (Umriss ${umriss})`);
  await seite.keyboard.press('Enter');
  let stand = await zustand(seite);
  pruefe(stand.mega === 'true' && stand.megaSichtbar, 'Laptop: Enter öffnet das Menü (aria-expanded="true")');
  pruefe(stand.links === stand.alleLinks, `Laptop: ${stand.links} von ${stand.alleLinks} Links sichtbar`);
  await seite.keyboard.press('Tab');
  const erster = await aktiv(seite);
  pruefe(erster.mega && erster.marke === 'A', `Laptop: Tab führt in das Menü, erster Link "${erster.name}"`);
  await seite.keyboard.press('Escape');
  stand = await zustand(seite);
  const danach = await seite.evaluate(() => document.activeElement.matches('[data-mega-knopf]'));
  pruefe(stand.mega === 'false' && !stand.megaSichtbar && danach, 'Laptop: Esc schließt das Menü, der Fokus steht wieder auf dem Knopf');
  await seite.keyboard.press('Space');
  await seite.mouse.click(700, 800);
  pruefe((await zustand(seite)).mega === 'false', 'Laptop: Leertaste öffnet, ein Klick daneben schließt');

  // Was ein Bildschirmleser gemeldet bekommt: Baum der Bedienungshilfen für die Navigation.
  await seite.focus('[data-mega-knopf]');
  await seite.keyboard.press('Enter');
  const baum = await seite.accessibility.snapshot({ root: await seite.$('nav.haupt'), interestingOnly: false });
  const zeilenBaum = [];
  (function lauf(knoten, ebene) {
    if (!knoten) return;
    const zeigen = ['navigation', 'button', 'list', 'link'].includes(knoten.role);
    if (zeigen) {
      const zusatz = knoten.expanded === undefined ? '' : knoten.expanded ? ' (aufgeklappt)' : ' (zugeklappt)';
      zeilenBaum.push(`${'  '.repeat(ebene)}${knoten.role}${knoten.name ? ` "${knoten.name}"` : ''}${zusatz}`);
    }
    for (const kind of knoten.children ?? []) lauf(kind, ebene + (zeigen ? 1 : 0));
  })(baum, 0);
  writeFileSync(join(ZIEL, 'menue_baum.txt'), zeilenBaum.join('\n'), 'utf8');
  const text = zeilenBaum.join('\n');
  pruefe(/navigation "Hauptnavigation"/.test(text), 'Baum: Navigation heißt "Hauptnavigation"');
  pruefe(/button "Untermenü Rezepte" \(aufgeklappt\)/.test(text), 'Baum: Knopf "Untermenü Rezepte" meldet "aufgeklappt"');
  for (const name of ['Nach Land', 'Nach Kategorie', 'Ohne ...', 'Passt für']) pruefe(text.includes(`list "${name}"`), `Baum: Liste "${name}" hat ihren Namen`);
  pruefe(text.includes('link "Rezepte ohne Nüsse"') && text.includes('link "Rezepte aus: Italien"') && text.includes('link "Rezepte, passt für: Vegan"'), 'Baum: Links tragen den vollen Text (z. B. "Rezepte ohne Nüsse")');
  sage(`Baum der Bedienungshilfen: ${zeilenBaum.length} Zeilen in menue_baum.txt`);
  await umgebung.close();
}
{
  const { umgebung, seite } = await neueSeite({ ansicht: HANDY });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  let stand = await zustand(seite);
  pruefe(!stand.listeSichtbar, 'Handy: Liste ist am Anfang zugeklappt');
  pruefe(!!(await tabBis(seite, '[data-menue]')), 'Handy: Knopf "Menü" mit Tab erreichbar');
  await seite.keyboard.press('Enter');
  stand = await zustand(seite);
  pruefe(stand.menue === 'true' && stand.listeSichtbar, 'Handy: Enter klappt die Liste auf');
  pruefe(!!(await tabBis(seite, '[data-mega-knopf]')), 'Handy: Knopf "Untermenü Rezepte" mit Tab erreichbar');
  await seite.keyboard.press('Enter');
  stand = await zustand(seite);
  pruefe(stand.megaSichtbar && stand.links === stand.alleLinks, `Handy: Untermenü aufgeklappt, ${stand.links} von ${stand.alleLinks} Links sichtbar`);
  const hoehe = await seite.evaluate(() => Math.min(...[...document.querySelectorAll('.haupt button')].map((knopf) => knopf.getBoundingClientRect().height)));
  pruefe(hoehe >= 44, `Handy: Knöpfe mindestens 44 px hoch (${Math.round(hoehe)} px)`);
  await seite.keyboard.press('Escape');
  stand = await zustand(seite);
  pruefe(stand.mega === 'false' && stand.menue === 'true', 'Handy: Esc schließt zuerst das Untermenü');
  await seite.keyboard.press('Escape');
  stand = await zustand(seite);
  pruefe(stand.menue === 'false' && (await seite.evaluate(() => document.activeElement.matches('[data-menue]'))), 'Handy: zweites Esc schließt die Liste, der Fokus steht auf "Menü"');
  await umgebung.close();
}
for (const [name, ansicht] of [['Handy', HANDY], ['Laptop', LAPTOP]]) {
  const { umgebung, seite } = await neueSeite({ ansicht, skript: false });
  await seite.goto(BASIS + '/', { waitUntil: 'load' });
  if (name === 'Laptop') await tabBis(seite, '.mit-menue > .haupt-zeile > a');
  const stand = await zustand(seite);
  const fokus = name === 'Laptop' ? ` (Fokus auf "${(await aktiv(seite)).name}")` : '';
  pruefe(stand.links === stand.alleLinks, `Ohne JavaScript, ${name}: ${stand.links} von ${stand.alleLinks} Links sichtbar${fokus}`);
  if (name === 'Handy') {
    const inhalt = await seite.evaluate(() => [...document.querySelectorAll('.held h1, [data-person], .schritt, .glaskarte, .zaehler li, .rezeptkarte')].every((element) => getComputedStyle(element).opacity === '1'));
    pruefe(inhalt, 'Ohne JavaScript: Inhalte der Startseite sichtbar');
  }
  await umgebung.close();
}

// 5 Bildschirmfotos auf einem Blatt
if (MIT_BILDERN) {
  sage();
  sage('## 5 Bildschirmfotos');
  const aufnahmen = [];
  for (const [name, ansicht, streifen, breite] of [['Handy', HANDY, 4, 300], ['Laptop', LAPTOP, 2, 640]]) {
    for (const [schema, wort] of [['light', 'hell'], ['dark', 'dunkel']]) {
      const { umgebung, seite } = await neueSeite({ ansicht, schema });
      await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
      await warte(2500);
      await durchscrollen(seite);
      await seite.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      // Warten, bis im Handy die Karte mit allen Personen zu sehen ist.
      await seite.waitForFunction(() => {
        const blatt = document.querySelector('[data-blatt]');
        const oben = new DOMMatrixReadOnly(getComputedStyle(blatt).transform).m42 === 0;
        return oben && [...document.querySelectorAll('[data-person]')].every((person) => getComputedStyle(person).opacity === '1');
      }, { timeout: 20000, polling: 100 }).catch(() => {});
      const datei = join(ZIEL, `start_${name.toLowerCase()}_${wort}.png`);
      await seite.screenshot({ path: datei, fullPage: true });
      const hoehe = await seite.evaluate(() => document.documentElement.scrollHeight);
      aufnahmen.push({ titel: `${name}, ${wort} (${ansicht.width} px)`, datei, streifen, breite, mass: breite / ansicht.width, hoehe });
      sage(`${name}, ${wort}: ${ansicht.width} x ${hoehe} px, ${datei}`);
      await umgebung.close();
    }
  }
  const teile = aufnahmen.map((aufnahme) => {
    const hoch = Math.ceil((aufnahme.hoehe * aufnahme.mass) / aufnahme.streifen);
    const stuecke = Array.from({ length: aufnahme.streifen }, (_, nummer) =>
      `<div style="width:${aufnahme.breite}px;height:${hoch}px;background:url('${pathToFileURL(aufnahme.datei).href}') 0 -${nummer * hoch}px / ${aufnahme.breite}px auto no-repeat"></div>`).join('');
    return `<figure><figcaption>${aufnahme.titel}</figcaption><div class="reihe">${stuecke}</div></figure>`;
  });
  const blattHtml = `<!doctype html><meta charset="utf-8"><style>
body { margin: 0; padding: 28px; width: max-content; background: #e9e8f1; font-family: "Segoe UI", sans-serif; color: #1a1a24; }
h1 { margin: 0 0 20px; font-size: 26px; }
.zeile { display: flex; gap: 28px; margin-bottom: 28px; }
figure { margin: 0; }
figcaption { margin-bottom: 8px; font-size: 18px; font-weight: 700; }
.reihe { display: flex; gap: 6px; }
.reihe div { outline: 1px solid #c7c4d7; }
</style><h1>foodasu.com, Startseite (Vorschau, nicht veröffentlicht), ${new Date().toLocaleDateString('de-AT')}. Jede Seite ist in Streifen von oben nach unten geschnitten, zu lesen von links nach rechts.</h1>
<div class="zeile">${teile.slice(0, 2).join('')}</div><div class="zeile">${teile.slice(2).join('')}</div>`;
  const vorlage = join(ZIEL, 'blatt.html');
  writeFileSync(vorlage, blattHtml, 'utf8');
  const blatt = await browser.newPage();
  await blatt.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
  await blatt.goto(pathToFileURL(vorlage).href, { waitUntil: 'load' });
  await blatt.screenshot({ path: join(ZIEL, 'Startseite_Blatt.jpg'), type: 'jpeg', quality: 86, fullPage: true });
  sage(`Blatt: ${join(ZIEL, 'Startseite_Blatt.jpg')}`);
}

await browser.close();
sage();
sage(`Ergebnis: ${fehler.length === 0 ? 'bestanden' : fehler.length + ' Befunde'}`);
writeFileSync(join(ZIEL, 'nachweise.txt'), zeilen.join('\n'), 'utf8');
process.exit(fehler.length === 0 ? 0 : 1);
