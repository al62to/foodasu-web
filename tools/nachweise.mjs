// Nachweise an der gebauten Website, gegen eine laufende Vorschau (npm run preview):
//   1. Netzwerk-Mitschnitt je Seite: keine Anfragen an Dritte, keine Cookies, kein Speicher im Browser
//      (solange niemand den Schalter für die Darstellung benutzt)
//   2. GSAP wird erst nach dem ersten Zeichnen geladen, mit "Bewegung reduzieren" gar nicht
//   2c. Knopf "Bewegung anhalten": Tastatur, Stillstand, Fortsetzen, nichts gespeichert
//   2e. Schalter für helle und dunkle Darstellung: hell als Standard, Tastatur, kein Aufblitzen, und im Speicher
//       des Browsers genau ein Eintrag "darstellung" mit "hell" oder "dunkel", sonst nichts
//   2f. Kontrast der Texte, hell und dunkel, auf allen Seitenarten
//   3. kein waagrechtes Scrollen bei 360, 390, 768, 1024 und 1440 Pixel
//   4. Mega-Menü mit Tastatur, ohne JavaScript und so, wie es ein Bildschirmleser gemeldet bekommt
//   5. Bildschirmfotos (Handy und Laptop, hell und dunkel) auf einem Blatt
// Aufruf: node tools/nachweise.mjs [Adresse der Vorschau] [Zielordner] [--ohne-bilder]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { alleMeta } from '../src/daten/meta.mjs';

const werte = process.argv.slice(2).filter((wert) => !wert.startsWith('--'));
const BASIS = (werte[0] ?? 'http://localhost:4321').replace(/\/$/, '');
const ZIEL = resolve(werte[1] ?? 'nachweise');
const MIT_BILDERN = !process.argv.includes('--ohne-bilder');
// Alle festen Seiten (auch die mit noindex und die 404-Seite), dazu je eine erzeugte Seite jeder Art (Rezeptseite,
// Themenseite).
const FEST = alleMeta.map((eintrag) => eintrag.pfad).filter((pfad) => pfad === '/rezepte/' || !pfad.startsWith('/rezepte/'));
const SEITEN = [...FEST, '/rezepte/bibimbap/', '/rezepte/ohne-nuesse/'];
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

// "schema" ist die Einstellung des Geräts; die Website folgt ihr nicht mehr. "dunkel" stellt eine Seite her, auf der
// der Schalter bei einem früheren Besuch eingeschaltet wurde (der eine Eintrag steht schon im Speicher).
async function neueSeite({ ansicht = LAPTOP, schema = 'light', ruhig = false, skript = true, dunkel = false } = {}) {
  const umgebung = await browser.createBrowserContext();
  const seite = await umgebung.newPage();
  if (dunkel) await seite.evaluateOnNewDocument(() => { try { localStorage.setItem('darstellung', 'dunkel'); } catch { /* ohne Speicher bleibt die Seite hell */ } });
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
  pruefe(await seite.evaluate(() => document.querySelector('[data-bewegung]').hidden), 'Knopf "Bewegung anhalten" bleibt ausgeblendet');
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
sage('## 2c Knopf "Bewegung anhalten" (ohne "Bewegung reduzieren")');
{
  const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  await warte(2500);
  const knopf = () => seite.evaluate(() => {
    const element = document.querySelector('[data-bewegung]');
    const flaeche = element.getBoundingClientRect();
    return {
      sichtbar: !element.hidden && getComputedStyle(element).display !== 'none',
      text: element.textContent.trim(),
      marke: element.tagName,
      imFenster: flaeche.right <= window.innerWidth && flaeche.bottom <= window.innerHeight && flaeche.left >= 0 && flaeche.top >= 0,
      hoehe: flaeche.height,
    };
  });
  const bild = () => seite.evaluate(() => ({
    blatt: getComputedStyle(document.querySelector('[data-blatt]')).transform,
    marke: getComputedStyle(document.querySelector('.schwebt')).translate,
    flaeche: getComputedStyle(document.querySelector('.glas-flaechen .a')).transform,
    band: getComputedStyle(document.querySelector('[data-band]')).transform,
    wort: document.querySelector('[data-wort]').textContent,
    haken: document.querySelectorAll('[data-haken] li.erledigt').length,
    schleifen: document.getAnimations().filter((lauf) => lauf.playState === 'running' && lauf.effect.getComputedTiming().iterations === Infinity).length,
  }));
  let stand = await knopf();
  pruefe(stand.sichtbar && stand.marke === 'BUTTON' && stand.text === 'Bewegung anhalten', `Knopf ist da, sobald Bewegung läuft: "${stand.text}"`);
  pruefe(stand.imFenster, 'Knopf liegt ganz im Fenster (fest unten rechts)');
  let weg = null;
  for (let nummer = 1; nummer <= 12 && !weg; nummer++) {
    await seite.keyboard.press('Tab');
    if (await seite.evaluate(() => document.activeElement.matches('[data-bewegung]'))) weg = { length: nummer };
  }
  pruefe(!!weg, `Knopf mit Tab erreichbar (nach ${weg ? weg.length : '?'} Schritten)`);
  const umriss = await seite.evaluate(() => getComputedStyle(document.activeElement).outline);
  pruefe(/solid [1-9]/.test(umriss), `Fokus sichtbar (Umriss ${umriss})`);
  await seite.keyboard.press('Enter');
  await warte(900);
  stand = await knopf();
  pruefe(stand.text === 'Bewegung fortsetzen', `Enter hält an, der Knopf heißt dann "${stand.text}"`);
  const a = await bild();
  await warte(3200);
  const b = await bild();
  pruefe(a.schleifen === 0 && b.schleifen === 0, `angehalten: laufende Schleifen ${b.schleifen}`);
  pruefe(a.blatt === b.blatt && a.marke === b.marke && a.flaeche === b.flaeche && a.band === b.band && a.wort === b.wort && a.haken === b.haken, 'angehalten: Scan, Begriffe, Wort, Farbflächen, Bänder und Einkaufsliste stehen still (zwei Messungen im Abstand von 3,2 s)');
  await durchscrollen(seite);
  const ruhe = await seite.evaluate(() => {
    const sichtbar = (auswahl) => [...document.querySelectorAll(auswahl)].every((element) => {
      const stil = getComputedStyle(element);
      return stil.opacity === '1' && stil.visibility === 'visible' && stil.display !== 'none';
    });
    return {
      sichtbar: sichtbar('.held h1, .held-vorspann, .handy-rahmen, [data-urteil], [data-person], .schwebt, .schritt, .glaskarte, .zaehler li, .rezeptkarte, .faq details, .wort-text'),
      zahlen: [...document.querySelectorAll('[data-zahl]')].every((element) => element.textContent === element.dataset.zahl),
      linie: getComputedStyle(document.querySelector('[data-linie]')).transform,
      speicher: document.cookie.length + localStorage.length + sessionStorage.length,
    };
  });
  pruefe(ruhe.sichtbar && ruhe.zahlen && (ruhe.linie === 'none' || ruhe.linie === 'matrix(1, 0, 0, 1, 0, 0)'), 'angehalten: nach dem Durchscrollen alle Inhalte sichtbar, Zähler mit Endzahl, Linie voll');
  pruefe(ruhe.speicher === 0 && (await umgebung.cookies()).length === 0, 'angehalten: nichts im Browser gespeichert (Cookies, localStorage, sessionStorage: 0)');
  await seite.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await seite.focus('[data-bewegung]');
  await seite.keyboard.press('Space');
  await warte(400);
  stand = await knopf();
  const c = await bild();
  await warte(3600);
  const d = await bild();
  pruefe(stand.text === 'Bewegung anhalten', `Leertaste setzt fort, der Knopf heißt wieder "${stand.text}"`);
  pruefe(c.blatt !== d.blatt && c.marke !== d.marke && d.schleifen > 0, `fortgesetzt: Scan und Begriffe bewegen sich wieder (laufende Schleifen ${d.schleifen})`);
  await seite.reload({ waitUntil: 'networkidle0' });
  await warte(2500);
  stand = await knopf();
  pruefe(stand.text === 'Bewegung anhalten' && !(await seite.evaluate(() => document.documentElement.classList.contains('angehalten'))), 'nach neuem Laden läuft die Bewegung wieder (Zustand gilt nur für den Besuch der Seite)');
  await umgebung.close();

  const handy = await neueSeite({ ansicht: HANDY });
  await handy.seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  await warte(2500);
  const klein = await handy.seite.evaluate(() => {
    const flaeche = document.querySelector('[data-bewegung]').getBoundingClientRect();
    return { hoehe: flaeche.height, imFenster: flaeche.right <= window.innerWidth && flaeche.left >= 0 && flaeche.bottom <= window.innerHeight };
  });
  pruefe(klein.hoehe >= 44 && klein.imFenster, `Handy: Knopf ${Math.round(klein.hoehe)} px hoch, ganz im Fenster`);
  await handy.seite.tap('[data-bewegung]');
  await warte(600);
  pruefe((await handy.seite.evaluate(() => document.querySelector('[data-bewegung]').textContent.trim())) === 'Bewegung fortsetzen', 'Handy: Tippen hält an');
  await handy.seite.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await warte(300);
  const verdeckt = await handy.seite.evaluate(() => {
    const knopfFlaeche = document.querySelector('[data-bewegung]').getBoundingClientRect();
    return [...document.querySelectorAll('footer a, footer p')].filter((element) => {
      const f = element.getBoundingClientRect();
      return f.width > 0 && f.bottom > knopfFlaeche.top && f.top < knopfFlaeche.bottom && f.right > knopfFlaeche.left && f.left < knopfFlaeche.right;
    }).length;
  });
  pruefe(verdeckt === 0, `Handy: am Seitenende verdeckt der Knopf nichts im Fuß (überdeckte Elemente: ${verdeckt})`);
  await handy.umgebung.close();

  const ohne = await neueSeite({ ansicht: LAPTOP, skript: false });
  await ohne.seite.goto(BASIS + '/', { waitUntil: 'load' });
  await warte(1500);
  const still = await ohne.seite.evaluate(() => ({
    knopf: getComputedStyle(document.querySelector('[data-bewegung]')).display,
    schleifen: document.getAnimations().filter((lauf) => lauf.playState === 'running' && lauf.effect.getComputedTiming().iterations === Infinity).length,
  })).catch(() => null);
  if (still) pruefe(still.knopf === 'none' && still.schleifen === 0, `Ohne JavaScript: kein Knopf und keine Schleife (laufende Schleifen ${still.schleifen})`);
  else sage('Ohne JavaScript: nicht messbar (Auswertung im Browser braucht JavaScript)');
  await ohne.umgebung.close();
}

// 2d Unterseiten: Farbflächen im Kopfbereich mit dem Knopf "Bewegung anhalten", Einblenden beim Scrollen
sage();
sage('## 2d Unterseiten: Knopf "Bewegung anhalten", Einblenden, "Bewegung reduzieren"');
{
  const pfad = '/rezepte/bibimbap/';
  const lese = (seite) => seite.evaluate(() => {
    const knopf = document.querySelector('[data-bewegung-seite]');
    const stil = getComputedStyle(document.querySelector('.s-flaechen i'));
    const teile = [...document.querySelectorAll('[data-ein]')];
    return {
      knopf: knopf ? (knopf.hidden ? 'verborgen' : knopf.textContent.trim()) : 'fehlt',
      hoehe: knopf ? Math.round(knopf.getBoundingClientRect().height) : 0,
      name: stil.animationName,
      laeuft: stil.animationName !== 'none' && stil.animationPlayState === 'running',
      verborgen: teile.filter((teil) => getComputedStyle(teil).opacity !== '1').length,
      teile: teile.length,
      speicher: localStorage.length + sessionStorage.length + document.cookie.length,
    };
  });
  const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP });
  await seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
  let stand = await lese(seite);
  pruefe(stand.knopf === 'Bewegung anhalten' && stand.laeuft, `${pfad}: Farbflächen laufen, Knopf "${stand.knopf}" ist da`);
  pruefe(stand.teile > 0 && stand.verborgen > 0, `${pfad}: ${stand.verborgen} von ${stand.teile} Teilen warten unter dem Fenster auf das Einblenden`);
  await seite.focus('[data-bewegung-seite]');
  await seite.keyboard.press('Enter');
  await warte(900);
  stand = await lese(seite);
  pruefe(stand.knopf === 'Bewegung fortsetzen' && !stand.laeuft && stand.verborgen === 0, `${pfad}: Enter hält an (Knopf "${stand.knopf}", Farbflächen stehen, alle Teile sichtbar)`);
  pruefe(stand.speicher === 0, `${pfad}: nichts gespeichert (Cookies, localStorage, sessionStorage)`);
  await seite.keyboard.press('Space');
  await warte(300);
  stand = await lese(seite);
  pruefe(stand.knopf === 'Bewegung anhalten' && stand.laeuft, `${pfad}: Leertaste setzt fort`);
  await umgebung.close();

  const ruhe = await neueSeite({ ansicht: LAPTOP, ruhig: true });
  await ruhe.seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
  stand = await lese(ruhe.seite);
  pruefe(stand.knopf === 'verborgen' && stand.name === 'none' && stand.verborgen === 0, `${pfad}, "Bewegung reduzieren": kein Knopf, keine Schleife, alles sichtbar`);
  await ruhe.umgebung.close();

  const handy = await neueSeite({ ansicht: HANDY });
  await handy.seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
  stand = await lese(handy.seite);
  pruefe(stand.hoehe >= 44, `${pfad}, Handy: Knopf ${stand.hoehe} px hoch`);
  await handy.umgebung.close();

  const recht = await neueSeite({ ansicht: LAPTOP });
  await recht.seite.goto(BASIS + '/datenschutz.html', { waitUntil: 'networkidle0' });
  const ruhig = await recht.seite.evaluate(() => ({ knopf: !!document.querySelector('[data-bewegung-seite]'), name: getComputedStyle(document.querySelector('.s-flaechen i')).animationName }));
  pruefe(!ruhig.knopf && ruhig.name === 'none', '/datenschutz.html: ruhiger Kopfbereich ohne Schleife und ohne Knopf');
  await recht.umgebung.close();
}

// 2e Schalter für helle und dunkle Darstellung (AP-18 Teil C)
sage();
sage('## 2e Schalter für helle und dunkle Darstellung');
{
  const HELL = 'rgb(255, 255, 255)';
  const DUNKEL = 'rgb(18, 18, 25)';
  // Was eine Seite gerade zeigt und was der Browser für sie gespeichert hat.
  const lese = (seite) => seite.evaluate(async () => {
    const schalter = document.querySelector('[data-modus-schalter]');
    const kasten = schalter.getBoundingClientRect();
    return {
      modus: document.documentElement.getAttribute('data-modus'),
      grund: getComputedStyle(document.body).backgroundColor,
      schema: getComputedStyle(document.documentElement).colorScheme,
      rolle: schalter.getAttribute('role'),
      art: schalter.tagName + ':' + schalter.type,
      an: schalter.getAttribute('aria-checked'),
      name: schalter.textContent.replace(/\s+/g, ' ').trim(),
      sichtbar: schalter.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }),
      hoehe: Math.round(kasten.height),
      breite: Math.round(kasten.width),
      eintraege: Object.keys(localStorage).map((schluessel) => `${schluessel}=${localStorage.getItem(schluessel)}`),
      sonst: document.cookie.length + sessionStorage.length + (await indexedDB.databases()).length + (await caches.keys()).length,
    };
  });

  // Hell ist der Standard, auch wenn das Gerät dunkel eingestellt ist. Ohne den Schalter wird nichts gespeichert.
  for (const pfad of SEITEN) {
    const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP, schema: 'dark', ruhig: true });
    await seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
    const stand = await lese(seite);
    pruefe(stand.modus === null && stand.grund === HELL && stand.schema === 'light', `${pfad}: hell, obwohl das Gerät dunkel eingestellt ist (Hintergrund ${stand.grund})`);
    pruefe(stand.eintraege.length === 0 && stand.sonst === 0 && (await umgebung.cookies()).length === 0, `${pfad}: ohne den Schalter nichts gespeichert`);
    await umgebung.close();
  }

  // Laptop: Der Schalter steht in der Kopfzeile, ist mit der Tastatur bedienbar und wirkt sofort.
  {
    const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP, ruhig: true });
    const anfragen = [];
    await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
    seite.on('request', (anfrage) => anfragen.push(anfrage.url()));
    let stand = await lese(seite);
    pruefe(stand.art === 'BUTTON:button' && stand.rolle === 'switch' && stand.an === 'false' && stand.name === 'Dunkler Modus', `Schalter: echter Knopf mit der Rolle Schalter, Name „${stand.name}“, aus`);
    pruefe(stand.sichtbar && stand.hoehe >= 44 && stand.breite >= 44, `Laptop: Schalter in der Kopfzeile sichtbar, ${stand.breite} x ${stand.hoehe} px`);
    const imKopf = await seite.evaluate(() => !!document.querySelector('header.kopf [data-modus-schalter]'));
    pruefe(imKopf, 'Laptop: Der Schalter steht in der Kopfzeile');
    const baum = await seite.accessibility.snapshot({ interestingOnly: true });
    const knoten = [];
    (function sammle(teil) { if (teil.role === 'switch') knoten.push(teil); for (const kind of teil.children ?? []) sammle(kind); })(baum);
    pruefe(knoten.length === 1 && knoten[0].name === 'Dunkler Modus' && knoten[0].checked === false, `Bildschirmleser: ein Schalter „${knoten[0]?.name}“, nicht gesetzt`);

    await seite.focus('[data-modus-schalter]');
    await seite.keyboard.press('Space');
    stand = await lese(seite);
    pruefe(stand.modus === 'dunkel' && stand.grund === DUNKEL && stand.schema === 'dark' && stand.an === 'true', `Leertaste schaltet auf dunkel (Hintergrund ${stand.grund}, Schalter an)`);
    pruefe(stand.eintraege.length === 1 && stand.eintraege[0] === 'darstellung=dunkel', `gespeichert ist genau ein Eintrag: ${stand.eintraege.join(', ') || 'keiner'}`);
    pruefe(stand.sonst === 0 && (await umgebung.cookies()).length === 0, 'sonst nichts gespeichert (Cookies, sessionStorage, IndexedDB, Cache)');
    pruefe(anfragen.length === 0, `das Umschalten löst keine Anfrage aus (${anfragen.length})`);

    // Neu laden und eine andere Seite: Die Wahl gilt schon, bevor der Inhalt gezeichnet wird.
    await seite.evaluateOnNewDocument(() => {
      new MutationObserver((_, beobachter) => {
        if (!document.body) return;
        window.__modusVorDemInhalt = document.documentElement.getAttribute('data-modus');
        beobachter.disconnect();
      }).observe(document, { childList: true, subtree: true });
    });
    for (const pfad of ['/', '/rezepte/', '/rezepte/bibimbap/', '/datenschutz.html', '/404.html']) {
      await seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
      stand = await lese(seite);
      const vorher = await seite.evaluate(() => window.__modusVorDemInhalt);
      pruefe(vorher === 'dunkel' && stand.grund === DUNKEL && stand.an === 'true', `${pfad}: dunkel schon vor dem Inhalt (kein Aufblitzen), Schalter an`);
      pruefe(stand.eintraege.length === 1 && stand.eintraege[0] === 'darstellung=dunkel', `${pfad}: weiter genau ein Eintrag (${stand.eintraege.join(', ')})`);
    }

    await seite.focus('[data-modus-schalter]');
    await seite.keyboard.press('Enter');
    stand = await lese(seite);
    pruefe(stand.modus === null && stand.grund === HELL && stand.an === 'false', `Enter schaltet zurück auf hell (Hintergrund ${stand.grund})`);
    pruefe(stand.eintraege.length === 1 && stand.eintraege[0] === 'darstellung=hell', `gespeichert ist genau ein Eintrag: ${stand.eintraege.join(', ')}`);
    await seite.goto(BASIS + '/fragen/', { waitUntil: 'networkidle0' });
    stand = await lese(seite);
    pruefe(stand.modus === null && stand.grund === HELL && (await seite.evaluate(() => window.__modusVorDemInhalt)) === null, '/fragen/: nach dem Zurückschalten wieder hell');
    await umgebung.close();
  }

  // Handy: Der Schalter steht im Menü, als ganze Zeile mit seinem Namen; das Menü bleibt beim Umschalten offen.
  {
    const { umgebung, seite } = await neueSeite({ ansicht: HANDY, ruhig: true });
    await seite.goto(BASIS + '/rezepte/', { waitUntil: 'networkidle0' });
    let stand = await lese(seite);
    pruefe(!stand.sichtbar, 'Handy: Schalter bei geschlossenem Menü nicht zu sehen');
    await seite.click('[data-menue]');
    stand = await lese(seite);
    const zeile = await seite.evaluate(() => {
      const schalter = document.querySelector('[data-modus-schalter]');
      const text = schalter.querySelector('.modus-text').getBoundingClientRect();
      return { imMenue: !!schalter.closest('#hauptliste'), text: Math.round(text.width) };
    });
    pruefe(stand.sichtbar && zeile.imMenue && stand.hoehe >= 44 && zeile.text > 40, `Handy: Schalter im Menü, mit sichtbarem Namen, ${stand.breite} x ${stand.hoehe} px`);
    await seite.click('[data-modus-schalter]');
    stand = await lese(seite);
    const offen = await seite.evaluate(() => document.querySelector('[data-menue]').getAttribute('aria-expanded'));
    pruefe(stand.modus === 'dunkel' && stand.grund === DUNKEL && offen === 'true', 'Handy: Tippen schaltet auf dunkel, das Menü bleibt offen');
    pruefe(stand.eintraege.length === 1 && stand.eintraege[0] === 'darstellung=dunkel', `Handy: genau ein Eintrag (${stand.eintraege.join(', ')})`);
    await umgebung.close();
  }

  // Ohne JavaScript gibt es keinen Schalter; die Seite ist hell.
  {
    const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP, schema: 'dark', skript: false });
    await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
    seite.setJavaScriptEnabled(true);
    const ohne = await seite.evaluate(() => ({
      zusehen: getComputedStyle(document.querySelector('[data-modus-schalter]')).display,
      grund: getComputedStyle(document.body).backgroundColor,
    }));
    pruefe(ohne.zusehen === 'none' && ohne.grund === HELL, 'Ohne JavaScript: kein Schalter, die Seite ist hell');
    await umgebung.close();
  }
}

// 2f Kontrast der Texte, hell und dunkel, auf allen Seitenarten (AP-18 Teil C: mindestens 4,5:1)
sage();
sage('## 2f Kontrast der Texte (mindestens 4,5:1), hell und dunkel');
{
  const messe = (seite) => seite.evaluate(() => {
    const zahlen = (wert) => {
      const teile = wert.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
      return { r: teile[0], g: teile[1], b: teile[2], a: teile.length > 3 ? teile[3] : 1 };
    };
    const ueber = (oben, unten) => ({
      r: oben.r * oben.a + unten.r * (1 - oben.a), g: oben.g * oben.a + unten.g * (1 - oben.a), b: oben.b * oben.a + unten.b * (1 - oben.a), a: 1,
    });
    const hell = ({ r, g, b }) => {
      const kanal = (wert) => { const anteil = wert / 255; return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
    };
    // Hintergrund eines Elements: alle Flächen der Vorfahren von unten nach oben übereinandergelegt. Liegt ein Bild
    // oder ein Verlauf dazwischen, lässt sich die Farbe nicht bestimmen; solche Stellen werden gezählt, nicht gewertet.
    const grund = (element) => {
      const kette = [];
      for (let teil = element; teil; teil = teil.parentElement) {
        const stil = getComputedStyle(teil);
        if (stil.backgroundImage !== 'none') return null;
        const farbe = zahlen(stil.backgroundColor);
        if (farbe.a > 0) kette.push(farbe);
        if (farbe.a === 1) break;
      }
      let flaeche = { r: 255, g: 255, b: 255, a: 1 };
      for (const farbe of kette.reverse()) flaeche = ueber(farbe, flaeche);
      return flaeche;
    };
    const funde = [];
    let geprueft = 0;
    let offen = 0;
    const lauf = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const gesehen = new Set();
    for (let knoten = lauf.nextNode(); knoten; knoten = lauf.nextNode()) {
      const element = knoten.parentElement;
      if (!knoten.textContent.trim() || gesehen.has(element)) continue;
      gesehen.add(element);
      // Nicht gemessen: Unsichtbares und reiner Schmuck, den auch ein Bildschirmleser übergeht (aria-hidden), etwa die
      // großen Ziffern hinter den drei Schritten der Startseite.
      if (element.closest('script, style, noscript, [hidden], [aria-hidden="true"], .vh, .modus-text, .sprung')) continue;
      if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const kasten = element.getBoundingClientRect();
      if (kasten.width < 2 || kasten.height < 2) continue;
      // Texte auf einem Bildschirmfoto der App oder im gezeichneten Handy haben feste Farben und gehören zum Bild.
      if (element.closest('.schirm, .nf-handy')) continue;
      const stil = getComputedStyle(element);
      const flaeche = grund(element);
      if (!flaeche) { offen++; continue; }
      const schrift = ueber(zahlen(stil.color), flaeche);
      const [heller, dunkler] = [hell(schrift), hell(flaeche)].sort((a, b) => b - a);
      const kontrast = (heller + 0.05) / (dunkler + 0.05);
      geprueft++;
      if (kontrast < 4.5) {
        funde.push(`${kontrast.toFixed(2)}:1 „${knoten.textContent.trim().slice(0, 40)}“ (${element.tagName.toLowerCase()}.${element.className || '-'}, ${stil.color} auf rgb(${Math.round(flaeche.r)}, ${Math.round(flaeche.g)}, ${Math.round(flaeche.b)}), ${stil.fontSize})`);
      }
    }
    return { geprueft, offen, funde };
  });
  for (const pfad of SEITEN) {
    for (const [wort, dunkel] of [['hell', false], ['dunkel', true]]) {
      const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP, ruhig: true, dunkel });
      await seite.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
      await durchscrollen(seite);
      // Menü und alle aufklappbaren Teile öffnen, damit auch ihre Texte gemessen werden.
      await seite.evaluate(() => {
        for (const teil of document.querySelectorAll('details')) teil.open = true;
        document.querySelector('[data-mega-knopf]')?.click();
      });
      await warte(200);
      const ergebnis = await messe(seite);
      pruefe(ergebnis.funde.length === 0, `${pfad}, ${wort}: ${ergebnis.geprueft} Texte gemessen, unter 4,5:1: ${ergebnis.funde.length}${ergebnis.offen ? ` (${ergebnis.offen} auf Bild oder Verlauf nicht messbar)` : ''}`);
      for (const fund of ergebnis.funde.slice(0, 12)) sage(`    ${fund}`);
      await umgebung.close();
    }
  }
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

// 4 Mega-Menü (Entwurf A, AP-17 Teil E2)
sage();
sage('## 4 Mega-Menü');
const aktiv = (seite) => seite.evaluate(() => {
  const element = document.activeElement;
  return { name: (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' '), marke: element.tagName, mega: !!element.closest('#mega-rezepte') };
});
const zustand = (seite) => seite.evaluate(() => {
  const sichtbar = (element) => element.getClientRects().length > 0;
  const wahlen = [...document.querySelectorAll('[data-wahl]')];
  return {
    mega: document.querySelector('[data-mega-knopf]').getAttribute('aria-expanded'),
    menue: document.querySelector('[data-menue]').getAttribute('aria-expanded'),
    megaSichtbar: getComputedStyle(document.querySelector('#mega-rezepte')).display !== 'none',
    listeSichtbar: getComputedStyle(document.querySelector('#hauptliste')).display !== 'none',
    links: [...document.querySelectorAll('.haupt a')].filter(sichtbar).length,
    alleLinks: document.querySelectorAll('.haupt a').length,
    gewaehlt: wahlen.filter((wahl) => wahl.getAttribute('aria-expanded') === 'true').map((wahl) => wahl.textContent.trim()),
    // Je Gruppe: wie viele ihrer Links zu sehen sind.
    gruppen: wahlen.map((wahl) => [...wahl.parentElement.querySelectorAll('[data-feld] a')].filter(sichtbar).length),
    gruppenLinks: wahlen.map((wahl) => wahl.parentElement.querySelectorAll('[data-feld] a').length),
    probe: [...document.querySelectorAll('.mega-probe a')].filter(sichtbar).length,
  };
});
async function tabBis(seite, auswahl, hoechstens = 30) {
  const weg = [];
  for (let nummer = 0; nummer < hoechstens; nummer++) {
    await seite.keyboard.press('Tab');
    weg.push((await aktiv(seite)).name);
    if (await seite.evaluate((ziel) => document.activeElement.matches(ziel), auswahl)) return weg;
  }
  return null;
}
const mitte = (seite, auswahl) => seite.evaluate((ziel) => {
  const rahmen = document.querySelector(ziel).getBoundingClientRect();
  return { x: Math.round(rahmen.left + rahmen.width / 2), y: Math.round(rahmen.top + rahmen.height / 2), oben: rahmen.top, unten: rahmen.bottom };
}, auswahl);
{
  const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  const weg = await tabBis(seite, '[data-mega-knopf]');
  sage(`Laptop, Tab-Reihenfolge bis zum Knopf: ${weg ? weg.join(' > ') : 'nicht erreicht'}`);
  pruefe(!!weg, 'Laptop: Knopf "Rezepte" mit Tab erreichbar');
  const umriss = await seite.evaluate(() => { const stil = getComputedStyle(document.activeElement); return `${stil.outlineStyle} ${stil.outlineWidth}`; });
  pruefe(/solid [1-9]/.test(umriss), `Laptop: Fokus sichtbar (Umriss ${umriss})`);
  await seite.keyboard.press('Enter');
  let stand = await zustand(seite);
  pruefe(stand.mega === 'true' && stand.megaSichtbar, 'Laptop: Enter öffnet das Menü (aria-expanded="true")');
  pruefe(stand.gewaehlt.join() === 'Nach Land' && stand.gruppen[0] === stand.gruppenLinks[0] && stand.gruppen.slice(1).every((zahl) => zahl === 0),
    `Laptop: Die erste Gruppe ist gewählt, nur ihre ${stand.gruppen[0]} Links stehen in der Mitte`);
  pruefe(stand.probe === 3, `Laptop: rechts ${stand.probe} Rezepte mit Bild`);
  await seite.keyboard.press('Tab');
  const erster = await aktiv(seite);
  pruefe(erster.mega, `Laptop: Tab führt in das Menü, zuerst "${erster.name}"`);
  await seite.keyboard.press('Escape');
  stand = await zustand(seite);
  const danach = await seite.evaluate(() => document.activeElement.matches('[data-mega-knopf]'));
  pruefe(stand.mega === 'false' && !stand.megaSichtbar && danach, 'Laptop: Esc schließt das Menü, der Fokus steht wieder auf dem Knopf');
  await seite.keyboard.press('Space');
  // Ein Klick neben dem Menü: knapp unter seinem unteren Rand (das Menü ist je nach Zahl der Themen verschieden hoch).
  const unten = await seite.evaluate(() => Math.round(document.querySelector('#mega-rezepte .mega-innen').getBoundingClientRect().bottom));
  pruefe(unten + 40 < LAPTOP.height, `Laptop: Das offene Menü passt in das Fenster (unterer Rand bei ${unten} von ${LAPTOP.height} Pixel)`);
  await seite.mouse.click(700, Math.min(unten + 30, LAPTOP.height - 5));
  pruefe((await zustand(seite)).mega === 'false', 'Laptop: Leertaste öffnet, ein Klick daneben schließt');

  // Gruppen wechseln per Klick und per Tastatur.
  await seite.focus('[data-mega-knopf]');
  await seite.keyboard.press('Enter');
  await seite.click('[data-wahl][aria-controls="mega-ohne"]');
  stand = await zustand(seite);
  pruefe(stand.gewaehlt.join() === 'Ohne …' && stand.gruppen[2] === stand.gruppenLinks[2] && stand.gruppen[0] === 0, 'Laptop: Ein Klick auf "Ohne …" zeigt nur die Links dieser Gruppe');
  await seite.focus('[data-wahl][aria-controls="mega-kategorie"]');
  await seite.keyboard.press('Enter');
  stand = await zustand(seite);
  pruefe(stand.gewaehlt.join() === 'Nach Kategorie', 'Laptop: Enter auf einer Gruppe wählt sie');
  await seite.keyboard.press('Tab');
  const inGruppe = await aktiv(seite);
  pruefe(inGruppe.mega && inGruppe.marke === 'A', `Laptop: Tab führt von der Gruppe zu ihren Links ("${inGruppe.name}")`);

  // Was ein Bildschirmleser gemeldet bekommt: Baum der Bedienungshilfen für die Navigation.
  await seite.click('[data-wahl][aria-controls="mega-land"]');
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
  pruefe(/button "Rezepte" \(aufgeklappt\)/.test(text), 'Baum: Knopf "Rezepte" meldet "aufgeklappt"');
  pruefe(/button "Nach Land" \(aufgeklappt\)/.test(text) && /button "Nach Kategorie" \(zugeklappt\)/.test(text), 'Baum: Die Gruppen melden "aufgeklappt" und "zugeklappt"');
  pruefe(text.includes('list "Nach Land"') && text.includes('list "Zum Ausprobieren"'), 'Baum: Die Listen haben ihren Namen');
  pruefe(text.includes('link "Rezepte aus: Italien"') && /link "Alle \d+ Rezepte"/.test(text), 'Baum: Links tragen den vollen Text (z. B. "Rezepte aus: Italien")');
  sage(`Baum der Bedienungshilfen: ${zeilenBaum.length} Zeilen in menue_baum.txt`);
  await seite.keyboard.press('Escape');

  // Mauszeiger: öffnet nach kurzer Verzögerung, bleibt auf dem Weg nach unten offen, schließt erst nach einer Weile
  // außerhalb. Zwischen "Rezepte" und dem Menü liegt keine Lücke.
  await seite.mouse.move(5, 500);
  await warte(450);
  const knopf = await mitte(seite, '[data-mega-knopf]');
  await seite.mouse.move(knopf.x, knopf.y);
  pruefe((await zustand(seite)).mega === 'false', 'Maus: Das Menü öffnet nicht im selben Augenblick (kurze Verzögerung)');
  await warte(260);
  pruefe((await zustand(seite)).mega === 'true', 'Maus: Nach kurzer Verzögerung ist das Menü offen');
  const feld = await mitte(seite, '#mega-rezepte .mega-innen');
  const luecke = await seite.evaluate((x, von, bis) => {
    for (let y = Math.floor(von); y <= Math.ceil(bis) + 2; y++) {
      if (!document.elementFromPoint(x, y)?.closest('[data-mega-eintrag]')) return y;
    }
    return null;
  }, knopf.x, knopf.unten, feld.oben);
  pruefe(luecke === null, `Maus: keine Lücke zwischen "Rezepte" und dem Menü${luecke === null ? '' : ` (Lücke bei y = ${luecke})`}`);
  // Langsam nach unten in das Menü, in kleinen Schritten.
  for (let y = knopf.y; y <= feld.oben + 60; y += 6) { await seite.mouse.move(knopf.x, y); await warte(12); }
  pruefe((await zustand(seite)).mega === 'true', 'Maus: Beim Runterfahren in das Menü bleibt es offen');
  // Kurz daneben geraten und zurück: Das Menü bleibt offen.
  await seite.mouse.move(knopf.x, feld.unten + 40);
  await warte(150);
  pruefe((await zustand(seite)).mega === 'true', 'Maus: 150 ms außerhalb schließen das Menü noch nicht');
  await seite.mouse.move(knopf.x, feld.oben + 60);
  await warte(400);
  pruefe((await zustand(seite)).mega === 'true', 'Maus: Zurück im Menü bleibt es offen');
  // Gruppe wechseln mit dem Mauszeiger.
  const kategorie = await mitte(seite, '[data-wahl][aria-controls="mega-kategorie"]');
  await seite.mouse.move(kategorie.x, kategorie.y);
  await warte(280);
  pruefe((await zustand(seite)).gewaehlt.join() === 'Nach Kategorie', 'Maus: Überfahren einer Gruppe wählt sie');
  await seite.mouse.move(knopf.x, feld.unten + 60);
  await warte(520);
  pruefe((await zustand(seite)).mega === 'false', 'Maus: Etwa 300 ms außerhalb schließen das Menü');
  await umgebung.close();
}
{
  const { umgebung, seite } = await neueSeite({ ansicht: HANDY });
  await seite.goto(BASIS + '/', { waitUntil: 'networkidle0' });
  let stand = await zustand(seite);
  pruefe(!stand.listeSichtbar, 'Handy: Das Menü ist am Anfang zu');
  pruefe(!!(await tabBis(seite, '[data-menue]')), 'Handy: Knopf "Menü" mit Tab erreichbar');
  await seite.keyboard.press('Enter');
  stand = await zustand(seite);
  pruefe(stand.menue === 'true' && stand.listeSichtbar, 'Handy: Enter öffnet das Menü');
  const flaeche = await seite.evaluate(() => {
    const rahmen = document.querySelector('#hauptliste').getBoundingClientRect();
    return { breite: Math.round(rahmen.width), unten: Math.round(rahmen.bottom), name: document.querySelector('[data-menue]').textContent.trim() };
  });
  pruefe(flaeche.breite === HANDY.width && flaeche.unten === HANDY.height, `Handy: Das Menü füllt den Bildschirm unter dem Kopf (${flaeche.breite} px breit, bis ${flaeche.unten} px)`);
  pruefe(flaeche.name === 'Menü schließen', `Handy: Der Knopf heißt jetzt "${flaeche.name}"`);
  pruefe(stand.probe === 3, `Handy: unten ${stand.probe} Rezepte zum Ausprobieren`);
  pruefe(!!(await tabBis(seite, '[data-mega-knopf]')), 'Handy: Knopf "Rezepte" mit Tab erreichbar');
  await seite.keyboard.press('Enter');
  stand = await zustand(seite);
  const wahlen = await seite.evaluate(() => [...document.querySelectorAll('.mega .alle a, [data-wahl]')].filter((el) => el.getClientRects().length > 0).map((el) => el.textContent.trim()));
  pruefe(stand.megaSichtbar && stand.gewaehlt.length === 0 && stand.gruppen.every((zahl) => zahl === 0), 'Handy: "Rezepte" klappt auf, noch ist keine Gruppe offen');
  pruefe(/^Alle \d+ Rezepte$/.test(wahlen[0]) && wahlen.slice(1).join() === 'Nach Land,Nach Kategorie,Ohne …,Vegetarisch und vegan', `Handy: darin ${wahlen.join(', ')}`);
  const hoehe = await seite.evaluate(() => Math.min(...[...document.querySelectorAll('.haupt button')].filter((knopf) => knopf.getClientRects().length > 0).map((knopf) => knopf.getBoundingClientRect().height)));
  pruefe(hoehe >= 44, `Handy: Knöpfe mindestens 44 px hoch (${Math.round(hoehe)} px)`);
  await tabBis(seite, '[data-wahl][aria-controls="mega-land"]');
  await seite.keyboard.press('Enter');
  stand = await zustand(seite);
  const ebene = await seite.evaluate(() => {
    const rahmen = document.querySelector('#mega-land').getBoundingClientRect();
    return { breite: Math.round(rahmen.width), unten: Math.round(rahmen.bottom), fokus: document.activeElement.matches('#mega-land [data-zurueck]') };
  });
  pruefe(stand.gewaehlt.join() === 'Nach Land' && stand.gruppen[0] === stand.gruppenLinks[0], `Handy: Die Gruppe öffnet eine Ebene mit ihren ${stand.gruppen[0]} Links`);
  pruefe(ebene.breite === HANDY.width && ebene.unten === HANDY.height && ebene.fokus, 'Handy: Die Ebene füllt den Bildschirm, der Fokus steht auf "Zurück"');
  await seite.keyboard.press('Enter');
  stand = await zustand(seite);
  pruefe(stand.gewaehlt.length === 0 && (await seite.evaluate(() => document.activeElement.matches('[data-wahl][aria-controls="mega-land"]'))), 'Handy: "Zurück" schließt die Ebene, der Fokus steht wieder auf der Gruppe');
  await seite.keyboard.press('Enter');
  await seite.keyboard.press('Escape');
  stand = await zustand(seite);
  pruefe(stand.gewaehlt.length === 0 && stand.mega === 'true', 'Handy: Esc schließt zuerst die Ebene');
  await seite.keyboard.press('Escape');
  stand = await zustand(seite);
  pruefe(stand.mega === 'false' && stand.menue === 'true', 'Handy: das zweite Esc klappt "Rezepte" zu');
  await seite.keyboard.press('Escape');
  stand = await zustand(seite);
  pruefe(stand.menue === 'false' && (await seite.evaluate(() => document.activeElement.matches('[data-menue]'))), 'Handy: das dritte Esc schließt das Menü, der Fokus steht auf "Menü"');
  // Antippen statt Tastatur.
  await seite.tap('[data-menue]');
  await seite.tap('[data-mega-knopf]');
  await seite.tap('[data-wahl][aria-controls="mega-ohne"]');
  stand = await zustand(seite);
  pruefe(stand.gewaehlt.join() === 'Ohne …' && stand.gruppen[2] === stand.gruppenLinks[2], 'Handy: Tippen öffnet Menü, "Rezepte" und die Ebene "Ohne …"');
  await umgebung.close();
}
for (const [name, ansicht] of [['Handy', HANDY], ['Laptop', LAPTOP]]) {
  const { umgebung, seite } = await neueSeite({ ansicht, skript: false });
  await seite.goto(BASIS + '/', { waitUntil: 'load' });
  if (name === 'Laptop') await tabBis(seite, '.mit-menue > .mega-link');
  const stand = await zustand(seite);
  const fokus = name === 'Laptop' ? ` (Fokus auf "${(await aktiv(seite)).name}")` : '';
  // Ohne JavaScript stehen alle Themen da; die drei Rezepte mit Bild gibt es je Breite einmal.
  const themen = stand.gruppen.every((zahl, nummer) => zahl === stand.gruppenLinks[nummer]);
  pruefe(themen, `Ohne JavaScript, ${name}: alle Themen des Menüs sichtbar (${stand.gruppen.join(' + ')} Links)${fokus}`);
  if (name === 'Handy') {
    const inhalt = await seite.evaluate(() => [...document.querySelectorAll('.held h1, [data-person], .schritt, .glaskarte, .zaehler li, .rezeptkarte')].every((element) => getComputedStyle(element).opacity === '1'));
    pruefe(inhalt, 'Ohne JavaScript: Inhalte der Startseite sichtbar');
  }
  await umgebung.close();
}

// 4b Rezeptübersicht: Filter (Entwurf 1, AP-17 Teil E3)
sage();
sage('## 4b Rezeptübersicht: Suche und Filter');
const treffer = (seite) => seite.evaluate(() => ({
  karten: [...document.querySelectorAll('[data-karte]')].filter((karte) => !karte.hidden).length,
  stand: document.querySelector('[data-stand]').textContent.trim(),
  aktiv: [...document.querySelectorAll('[data-aktiv-liste] button')].map((knopf) => knopf.textContent.trim()),
  knoepfe: [...document.querySelectorAll('[data-knopf] [data-knopf-text]')].map((el) => el.textContent.trim()),
  adresse: window.location.pathname + window.location.search,
}));
const waehle = (seite, gruppe, wert) => seite.evaluate((art, was) => {
  const feld = document.querySelector(`[data-gruppe="${art}"] input[value="${was}"]`);
  feld.checked = !feld.checked;
  feld.dispatchEvent(new Event('change', { bubbles: true }));
}, gruppe, wert);
{
  const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP });
  await seite.goto(BASIS + '/rezepte/', { waitUntil: 'networkidle0' });
  let stand = await treffer(seite);
  const alle = stand.karten;
  pruefe(alle > 0 && stand.stand === `${alle} Rezepte` && stand.aktiv.length === 0, `Laptop: am Anfang alle ${alle} Rezepte, kein Filter gewählt`);
  pruefe(stand.knoepfe.join() === 'Kategorie,Land,Passt für', `Laptop: drei Auswahlknöpfe (${stand.knoepfe.join(', ')})`);
  const ohneAlle = await seite.evaluate(() => [...document.querySelectorAll('[data-filter] button, [data-filter] label')].every((el) => el.textContent.trim() !== 'Alle'));
  pruefe(ohneAlle, 'Laptop: kein Knopf "Alle"');
  // Liste öffnen: nur Möglichkeiten mit Rezepten, jede mit Anzahl.
  await seite.click('[data-gruppe="land"] [data-knopf]');
  const liste = await seite.evaluate(() => {
    const gruppe = document.querySelector('[data-gruppe="land"]');
    const punkte = [...gruppe.querySelectorAll('li')];
    return {
      offen: gruppe.querySelector('[data-knopf]').getAttribute('aria-expanded'),
      sichtbar: punkte.filter((punkt) => punkt.getClientRects().length > 0).length,
      alle: punkte.length,
      zahlen: punkte.every((punkt) => Number(punkt.querySelector('.f-anzahl').textContent) > 0),
      knoepfe: [...gruppe.querySelectorAll('[data-feld] button')].filter((knopf) => knopf.getClientRects().length > 0).map((knopf) => knopf.textContent.trim()),
    };
  });
  pruefe(liste.offen === 'true' && liste.zahlen, `Laptop: "Land" öffnet eine Liste zum Ankreuzen, jede der ${liste.alle} Möglichkeiten hat Rezepte und nennt ihre Anzahl`);
  pruefe(liste.knoepfe.includes('Zurücksetzen') && liste.knoepfe.includes('Fertig'), `Laptop: Knöpfe der Liste: ${liste.knoepfe.join(', ')}`);
  if (liste.knoepfe.includes('Weitere Länder anzeigen')) {
    await seite.click('[data-gruppe="land"] [data-mehr]');
    const danach = await seite.evaluate(() => [...document.querySelectorAll('[data-gruppe="land"] li')].filter((punkt) => punkt.getClientRects().length > 0).length);
    pruefe(liste.sichtbar < liste.alle && danach === liste.alle, `Laptop: zuerst ${liste.sichtbar} Länder, nach "Weitere Länder anzeigen" alle ${danach}`);
  }
  // Verknüpfung: oder innerhalb von Land und Kategorie, und innerhalb von "Passt für", und zwischen den Gruppen.
  const zaehle = (probe) => seite.evaluate((quelle) => {
    const pruefung = new Function('k', `return ${quelle}`);
    return [...document.querySelectorAll('[data-karte]')].filter((karte) => pruefung({ kategorie: karte.dataset.kategorie, land: karte.dataset.land.split(' '), passt: karte.dataset.passt.split(' ') })).length;
  }, probe);
  await waehle(seite, 'land', 'IT');
  stand = await treffer(seite);
  pruefe(stand.karten === (await zaehle("k.land.includes('IT')")) && stand.stand === (stand.karten === 1 ? '1 Rezept' : `${stand.karten} Rezepte`), `Laptop: Land Italien: ${stand.stand}`);
  pruefe(stand.knoepfe[1] === 'Land: Italien' && stand.aktiv.join() === 'Italien', 'Laptop: Der Knopf nennt die Auswahl, darunter steht ein Kärtchen "Italien"');
  await waehle(seite, 'land', 'AT');
  stand = await treffer(seite);
  pruefe(stand.karten === (await zaehle("k.land.includes('IT') || k.land.includes('AT')")), `Laptop: Italien oder Österreich: ${stand.stand} (oder innerhalb von Land)`);
  await waehle(seite, 'kategorie', 'SUESSSPEISE');
  stand = await treffer(seite);
  pruefe(stand.karten === (await zaehle("(k.land.includes('IT') || k.land.includes('AT')) && k.kategorie === 'SUESSSPEISE'")), `Laptop: dazu Kategorie Süßspeise: ${stand.stand} (und zwischen den Gruppen)`);
  // Die Liste "Land" ist noch offen und liegt über den Kärtchen: "Fertig" schließt sie.
  await seite.click('[data-gruppe="land"] [data-fertig]');
  const landZu = await seite.evaluate(() => document.querySelector('[data-gruppe="land"] [data-knopf]').getAttribute('aria-expanded') === 'false');
  pruefe(landZu, 'Laptop: "Fertig" schließt die Liste');
  await seite.click('[data-filter] [data-alle-leeren]');
  stand = await treffer(seite);
  pruefe(stand.karten === alle && stand.aktiv.length === 0, 'Laptop: "Alle Filter zurücksetzen" zeigt wieder alle Rezepte');
  await waehle(seite, 'passt', 'en:nuts');
  const ohneNuesse = (await treffer(seite)).karten;
  await waehle(seite, 'passt', 'en:vegan');
  stand = await treffer(seite);
  pruefe(stand.karten === (await zaehle("k.passt.includes('en:nuts') && k.passt.includes('en:vegan')")) && stand.karten <= ohneNuesse, `Laptop: Ohne Nüsse und Vegan: ${stand.stand} von ${ohneNuesse} ohne Nüsse (und innerhalb von "Passt für")`);
  // Kärtchen mit X entfernt einen Filter.
  await seite.click('[data-aktiv-liste] button');
  stand = await treffer(seite);
  pruefe(stand.aktiv.length === 1, `Laptop: Das X am Kärtchen nimmt den Filter weg (übrig: ${stand.aktiv.join(', ')})`);
  await seite.click('[data-filter] [data-alle-leeren]');
  // Suche
  await seite.type('[data-suche]', 'mozzarella');
  stand = await treffer(seite);
  pruefe(stand.karten > 0 && stand.karten < alle, `Laptop: Suche nach einer Zutat ("mozzarella"): ${stand.stand}`);
  pruefe(stand.adresse === '/rezepte/', `Laptop: Die Adresse bleibt ${stand.adresse} (keine neuen Adressen durch Filter)`);
  // Tastatur: Esc schließt die Liste, der Fokus steht auf ihrem Knopf.
  await seite.focus('[data-gruppe="kategorie"] [data-knopf]');
  await seite.keyboard.press('Enter');
  await seite.keyboard.press('Tab');
  const imFeld = await seite.evaluate(() => document.activeElement.matches('[data-gruppe="kategorie"] input'));
  await seite.keyboard.press('Space');
  await seite.keyboard.press('Escape');
  const nachEsc = await seite.evaluate(() => ({ zu: document.querySelector('[data-gruppe="kategorie"] [data-knopf]').getAttribute('aria-expanded') === 'false', fokus: document.activeElement.matches('[data-gruppe="kategorie"] [data-knopf]') }));
  pruefe(imFeld && nachEsc.zu && nachEsc.fokus, 'Laptop: Tastatur: Enter öffnet, Tab und Leertaste kreuzen an, Esc schließt und gibt den Fokus zurück');
  const themen = await seite.evaluate(() => ({ titel: document.querySelector('#themen')?.textContent.trim(), links: document.querySelectorAll('.f-themen a').length }));
  pruefe(themen.titel === 'Mehr Themen' && themen.links === 6, `Laptop: am Ende "${themen.titel}" mit ${themen.links} Links`);
  await umgebung.close();
}
{
  const { umgebung, seite } = await neueSeite({ ansicht: HANDY });
  await seite.goto(BASIS + '/rezepte/', { waitUntil: 'networkidle0' });
  const alle = (await treffer(seite)).karten;
  const anfang = await seite.evaluate(() => ({
    knopf: document.querySelector('[data-blatt-auf]').getClientRects().length > 0,
    blatt: document.querySelector('[data-blatt]').getClientRects().length > 0,
  }));
  pruefe(anfang.knopf && !anfang.blatt, 'Handy: ein Knopf "Filter", das Blatt ist zu');
  await seite.tap('[data-blatt-auf]');
  await warte(400);
  let blatt = await seite.evaluate(() => {
    const el = document.querySelector('[data-blatt]');
    const rahmen = el.getBoundingClientRect();
    return {
      rolle: el.getAttribute('role'), modal: el.getAttribute('aria-modal'), unten: Math.round(rahmen.bottom), breite: Math.round(rahmen.width),
      gruppen: [...el.querySelectorAll('[data-knopf]')].map((knopf) => knopf.textContent.trim()),
      zeigen: el.querySelector('[data-zeigen]').textContent.trim(),
      fokus: el.contains(document.activeElement),
    };
  });
  pruefe(blatt.rolle === 'dialog' && blatt.modal === 'true' && blatt.unten === HANDY.height && blatt.breite === HANDY.width, 'Handy: "Filter" öffnet ein Blatt von unten (Dialog über die ganze Breite)');
  pruefe(blatt.gruppen.join() === 'Kategorie,Land,Passt für' && blatt.fokus, `Handy: im Blatt die drei Gruppen zum Aufklappen (${blatt.gruppen.join(', ')}), der Fokus steht im Blatt`);
  pruefe(blatt.zeigen === `${alle} Rezepte anzeigen`, `Handy: Knopf "${blatt.zeigen}"`);
  await waehle(seite, 'land', 'IT');
  await waehle(seite, 'passt', 'en:vegetarian');
  const gefiltert = await treffer(seite);
  blatt = await seite.evaluate(() => ({ zeigen: document.querySelector('[data-zeigen]').textContent.trim(), marke: document.querySelector('[data-aktiv-zahl]').textContent.trim() }));
  pruefe(blatt.zeigen === (gefiltert.karten === 1 ? '1 Rezept anzeigen' : `${gefiltert.karten} Rezepte anzeigen`), `Handy: Der Knopf zählt mit: "${blatt.zeigen}"`);
  // Der Fokus bleibt im Blatt.
  let drin = true;
  for (let nummer = 0; nummer < 40; nummer++) {
    await seite.keyboard.press('Tab');
    drin = drin && (await seite.evaluate(() => document.querySelector('[data-blatt]').contains(document.activeElement)));
  }
  pruefe(drin, 'Handy: Tab bleibt im Blatt');
  await seite.tap('[data-zeigen]');
  const zu = await seite.evaluate(() => ({
    blatt: document.querySelector('[data-blatt]').getClientRects().length > 0,
    fokus: document.activeElement.matches('[data-blatt-auf]'),
    marke: document.querySelector('[data-aktiv-zahl]').textContent.trim(),
  }));
  pruefe(!zu.blatt && zu.fokus && zu.marke === '2', `Handy: Der Knopf schließt das Blatt, "Filter" zeigt ${zu.marke} gewählte Filter`);
  await seite.tap('[data-blatt-auf]');
  await seite.keyboard.press('Escape');
  pruefe(await seite.evaluate(() => document.querySelector('[data-blatt]').getClientRects().length === 0 && document.activeElement.matches('[data-blatt-auf]')), 'Handy: Esc schließt das Blatt');
  await umgebung.close();
}
{
  const { umgebung, seite } = await neueSeite({ ansicht: LAPTOP, skript: false });
  await seite.goto(BASIS + '/rezepte/', { waitUntil: 'load' });
  const ohne = await seite.evaluate(() => ({
    karten: [...document.querySelectorAll('[data-karte]')].filter((karte) => karte.getClientRects().length > 0).length,
    alle: document.querySelectorAll('[data-karte]').length,
    leiste: document.querySelector('[data-filter]').getClientRects().length > 0,
  }));
  pruefe(ohne.karten === ohne.alle && !ohne.leiste, `Ohne JavaScript: alle ${ohne.karten} Rezepte stehen da, die Filterleiste entfällt`);
  await umgebung.close();
}

// 5 Bildschirmfotos auf einem Blatt
if (MIT_BILDERN) {
  sage();
  sage('## 5 Bildschirmfotos');
  const aufnahmen = [];
  for (const [name, ansicht, streifen, breite] of [['Handy', HANDY, 4, 300], ['Laptop', LAPTOP, 2, 640]]) {
    for (const [dunkel, wort] of [[false, 'hell'], [true, 'dunkel']]) {
      const { umgebung, seite } = await neueSeite({ ansicht, dunkel });
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
