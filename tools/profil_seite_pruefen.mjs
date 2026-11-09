// Nachweis im Browser zur Seite /p/ (AP-114, Vorgabe „Liste per Link und Profil teilen“ 8.1 und 7a), gegen eine
// laufende Vorschau (npm run build, dann npx astro preview). Die Links kommen aus den Testfällen
// tools/teilen/testfaelle.json (Umschlag „Profil“ mit fertiger Kodierung) oder werden mit dem Kern der Seite gepackt
// (src/skripte/teilen/kodierung.mjs). Jede Prüfung in einem eigenen, leeren Profil des Browsers. Geprüft wird:
//   1. Handy: Titel „Profil von Mia“, Anfangsbuchstabe M im Kreis, „Geteilt von Papa“, der Satz zur Seite, die Einträge
//      mit ihrer Stufe in den Wörtern der App (aus src/daten/teilen_profil.json), „Maßgeblich ist immer die
//      Verpackung.“, beide Abzeichen (App Store zuerst), „In FoodAsu öffnen“ sichtbar (mindestens 44 px) mit
//      location.href; keine Fehler im Skript.
//   2. Die Seite speichert nichts: kein Eintrag im lokalen Speicher und in sessionStorage, keine Cookies, kein
//      Service Worker, keine Ablage (Cache Storage); keine Anfrage an eine andere Adresse als die Vorschau, und keine
//      Anfrage nennt den Teil hinter dem #.
//   3. Neuer Link im selben Tab (hashchange): das neue Profil erscheint.
//   4. Einträge für eine neuere Version: Zeile weg, unten „Ein Eintrag …“ bzw. „2 Einträge …“.
//   5. Android-Browser: „In FoodAsu öffnen“ führt auf die intent-Adresse für /p/.
//   6. Laptop (Maus, ab 56rem): kein Knopf „In FoodAsu öffnen“.
//   7. Zustände ohne Profil: kein #, kaputt, zu groß, neuere Version, eine Liste auf /p/ (wie kaputt).
//   8. Ohne JavaScript: nur der Satz, dass das Profil im Link steckt.
//   9. Smart App Banner: app-argument https://foodasu.com/p/#<Kodierung>.
//  10. Dunkle Darstellung und große Schrift (200 %): kein waagrechtes Scrollen, Text in der Karte lesbar (nicht gleich
//      der Fläche).
// Aufruf: node tools/profil_seite_pruefen.mjs [Adresse der Vorschau]   (Vorgabe http://localhost:4321)
// Rückgabewert 1, wenn eine Prüfung fehlschlägt.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { schreiben } from '../src/skripte/teilen/kodierung.mjs';
import { profilTexte } from '../src/daten/profil_seite.mjs';
import { listeTexte } from '../src/daten/liste_seite.mjs';

const BASIS = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');
const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const faelle = JSON.parse(readFileSync(join(wurzel, 'tools', 'teilen', 'testfaelle.json'), 'utf8')).faelle;
const profil = JSON.parse(readFileSync(join(wurzel, 'src', 'daten', 'teilen_profil.json'), 'utf8'));
const fall = (name) => faelle.find((eintrag) => eintrag.name === name);
const PROFIL = fall('Profil');
const LISTE = fall('Liste neu (Fassung 1)');
const GROSS = fall('Kodierung über 8192 Zeichen');
const NEUER = fall('Unbekannte Art der Kodierung');
const stufe = (kennung) => profil.stufen.find((s) => s.kennung === kennung).name;
const name = (kennung) => profil.meiden.find((e) => e.kennung === kennung).name;

// Weitere Profile, mit dem Kern der Seite gepackt (wie die App sie schickt: feste Einträge ohne Namen).
const kopf = { v: 1, k: 'p', t: 1793500000, by: 'PaPa01', a: { PaPa01: 'Papa' }, rev: 1, ic: 'initial', from: 'Papa' };
const LEO = await schreiben({ ...kopf, id: 'Prf0Leo000000001', n: 'Leo', m: [['ERNAEHRUNGSFORM', 'en:vegetarian', 'NORMAL', null]] });
const EINER = await schreiben({ ...kopf, id: 'Prf0Neu000000001', n: 'Oma', m: [['ZUTAT', 'en:eggs', 'STRENG', null], ['ZUTAT', 'en:bald-neu', 'STRENG', null]] });
const ZWEI = await schreiben({ ...kopf, id: 'Prf0Neu000000002', n: 'Opa', m: [['NEUE_ART', 'en:x', 'STRENG', 'X'], ['ZUTAT', 'en:milk', 'BALD', null], ['WEITERE', 'en:pork', 'HINWEIS', null]] });

const HANDY = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1440, height: 900, deviceScaleFactor: 1 };
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

const fehler = [];
const pruefe = (gut, text) => { console.log(`${gut ? 'ok    ' : 'FEHLER'} ${text}`); if (!gut) fehler.push(text); };
const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));
const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });

async function oeffne(kodierung, { ansicht = HANDY, skript = true, kennung = null, vorher = null } = {}) {
  const umgebung = await browser.createBrowserContext();
  const seite = await umgebung.newPage();
  const seitenFehler = [];
  const anfragen = [];
  seite.on('pageerror', (f) => seitenFehler.push(f.message));
  // Der Teil hinter dem # reist bei der Navigation nie zum Server; Puppeteer nennt ihn trotzdem, deshalb weg wie in teilen_browser.mjs.
  seite.on('request', (anfrage) => anfragen.push(anfrage.isNavigationRequest() ? anfrage.url().split('#')[0] : anfrage.url()));
  if (kennung) await seite.setUserAgent(kennung);
  if (vorher) await seite.evaluateOnNewDocument(vorher);
  await seite.setJavaScriptEnabled(skript);
  await seite.setViewport(ansicht);
  await seite.goto(`${BASIS}/p/${kodierung === null ? '' : `#${kodierung}`}`, { waitUntil: 'networkidle0' });
  if (skript) await seite.waitForSelector('[data-p-seite][data-bereit]', { timeout: 10000 });
  return { seite, umgebung, seitenFehler, anfragen };
}

const lage = (seite) => seite.evaluate((oeffnen) => {
  const sichtbar = (e) => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getClientRects().length > 0;
  const text = (auswahl) => { const e = document.querySelector(auswahl); return sichtbar(e) ? e.textContent.trim() : null; };
  const knopf = document.querySelector('[data-p-app-oeffnen]');
  return {
    adresse: location.href,
    // Der Kreis mit dem Anfangsbuchstaben steht in der Überschrift, aber aria-hidden; der Titel ist nur der Text daneben.
    titel: document.querySelector('h1 [data-p-titel]')?.textContent.trim(),
    kreis: text('[data-p-kreis]'),
    von: text('[data-p-von]'),
    satz: text('[data-p-satz]'),
    hinweis: text('[data-p-hinweis-text]'),
    liste: sichtbar(document.querySelector('[data-p-liste]')),
    zeilen: [...document.querySelectorAll('.p-eintrag')].filter(sichtbar).map((z) => [z.querySelector('.p-name').textContent, z.querySelector('.p-stufe').textContent]),
    leer: text('[data-p-leer]'),
    neuer: text('[data-p-neuer]'),
    verpackung: text('[data-p-verpackung]'),
    ohneSkript: text('[data-p-ohne-skript]'),
    knopf: knopf ? { sichtbar: sichtbar(knopf), href: knopf.href, text: knopf.textContent.trim(), hoehe: Math.round(knopf.getBoundingClientRect().height), rand: knopf.classList.contains('rand') } : null,
    sichtbareMitWortlaut: [...document.querySelectorAll('a, button')].filter((e) => sichtbar(e) && e.textContent.trim() === oeffnen).length,
    abzeichen: [...document.querySelectorAll('.p-app [data-abzeichen] a')].filter(sichtbar).map((a) => a.className),
    banner: [...document.querySelectorAll('head meta[name="apple-itunes-app"]')].map((m) => m.getAttribute('content')),
    breit: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
}, profilTexte.oeffnen);

try {
  // 1 bis 3: Handy
  {
    const { seite, umgebung, seitenFehler, anfragen } = await oeffne(PROFIL.kodierung);
    let l = await lage(seite);
    pruefe(l.titel === 'Profil von Mia' && l.kreis === 'M', `Handy: Titel „${l.titel}“, Anfangsbuchstabe „${l.kreis}“`);
    pruefe(l.von === 'Geteilt von Papa', `Handy: „${l.von}“`);
    pruefe(l.satz === 'Was Mia meidet, damit du beim Einkaufen und Kochen daran denken kannst.', `Handy: Satz zur Seite „${l.satz}“`);
    const soll = [[name('en:milk'), stufe('NORMAL')], [name('en:nuts'), stufe('STRENG')], ['Koriander', stufe('HINWEIS')]];
    pruefe(JSON.stringify(l.zeilen) === JSON.stringify(soll), `Handy: Einträge ${JSON.stringify(l.zeilen)}`);
    pruefe(l.neuer === null && l.leer === null, 'Handy: kein Hinweis auf eine neuere Version, nicht leer');
    pruefe(l.verpackung === 'Maßgeblich ist immer die Verpackung.', `Handy: „${l.verpackung}“`);
    pruefe(l.abzeichen.join(' ') === 'abzeichen-apple abzeichen-google', `Handy: Abzeichen ${l.abzeichen.join(', ')} (App Store zuerst)`);
    pruefe(l.knopf?.sichtbar && l.knopf.rand && l.knopf.hoehe >= 44 && l.knopf.href === l.adresse && l.sichtbareMitWortlaut === 1, `Handy: „${profilTexte.oeffnen}“ sichtbar, Rand, ${l.knopf?.hoehe} px, auf location.href`);
    pruefe(l.banner.length === 1 && l.banner[0] === `app-id=6829687240, app-argument=https://foodasu.com/p/#${PROFIL.kodierung}`, `Smart App Banner: ${JSON.stringify(l.banner)}`);
    pruefe(!l.breit, 'Handy: kein waagrechtes Scrollen');
    const speicher = await seite.evaluate(async () => ({
      lokal: Object.keys(localStorage), sitzung: Object.keys(sessionStorage), keks: document.cookie,
      dienste: (await navigator.serviceWorker?.getRegistrations?.())?.length ?? 0, ablagen: (await caches.keys()).length,
    }));
    const kekse = await umgebung.cookies?.() ?? [];
    pruefe(speicher.lokal.length === 0 && speicher.sitzung.length === 0 && !speicher.keks && kekse.length === 0 && speicher.dienste === 0 && speicher.ablagen === 0, `speichert nichts: ${JSON.stringify(speicher)}`);
    const fremd = anfragen.filter((adresse) => !adresse.startsWith(BASIS) && !adresse.startsWith('data:'));
    pruefe(fremd.length === 0, `keine Anfrage an Dritte (${fremd.join(', ') || 'keine'})`);
    pruefe(!anfragen.some((adresse) => adresse.includes(PROFIL.kodierung.slice(1, 20))), 'keine Anfrage nennt den Teil hinter dem #');

    await seite.evaluate((kodierung) => { location.hash = kodierung; }, LEO);
    await warte(800);
    l = await lage(seite);
    pruefe(l.titel === 'Profil von Leo' && JSON.stringify(l.zeilen) === JSON.stringify([[name('en:vegetarian'), stufe('NORMAL')]]) && l.knopf?.href === l.adresse, `neuer Link im selben Tab: „${l.titel}“ ${JSON.stringify(l.zeilen)}`);
    pruefe(seitenFehler.length === 0, `Handy: keine Fehler im Skript (${seitenFehler.join(' | ') || 'keine'})`);
    await umgebung.close();
  }
  // 4: Einträge für eine neuere Version
  for (const [kodierung, zeilen, satz] of [[EINER, [[name('en:eggs'), stufe('STRENG')]], profilTexte.neuerEiner], [ZWEI, [[name('en:pork'), stufe('HINWEIS')]], profilTexte.neuerMehr.replace('{anzahl}', '2')]]) {
    const { seite, umgebung } = await oeffne(kodierung);
    const l = await lage(seite);
    pruefe(JSON.stringify(l.zeilen) === JSON.stringify(zeilen) && l.neuer === satz, `neuere Version: ${JSON.stringify(l.zeilen)}, „${l.neuer}“`);
    await umgebung.close();
  }
  // 5: Android
  {
    const { seite, umgebung } = await oeffne(PROFIL.kodierung, { kennung: ANDROID_UA });
    const l = await lage(seite);
    const soll = `intent://foodasu.com/p/#${PROFIL.kodierung}#Intent;scheme=https;package=at.tonc.einkauf;S.browser_fallback_url=${encodeURIComponent(l.adresse)};end`;
    pruefe(l.knopf?.sichtbar && l.knopf.href === soll, `Android: intent-Adresse (${l.knopf?.href?.slice(0, 90)} …)`);
    await umgebung.close();
  }
  // 6: Laptop
  {
    const { seite, umgebung } = await oeffne(PROFIL.kodierung, { ansicht: LAPTOP });
    const l = await lage(seite);
    pruefe(l.liste && l.sichtbareMitWortlaut === 0 && l.abzeichen.length === 2, `Laptop: Profil da, kein „${profilTexte.oeffnen}“, beide Abzeichen`);
    await umgebung.close();
  }
  // 7: Zustände ohne Profil
  for (const [art, kodierung, titel] of [
    ['kein #', null, profilTexte.leerSeite.titel],
    ['kaputt', '1ab$cd', listeTexte.kaputt.titel],
    ['zu groß', GROSS.kodierung, listeTexte.kaputt.titel],
    ['neuere Version', NEUER.kodierung, listeTexte.neuereVersion.titel],
    ['Liste auf /p/', LISTE.kodierung, listeTexte.kaputt.titel],
  ]) {
    const { seite, umgebung } = await oeffne(kodierung);
    const l = await lage(seite);
    pruefe(l.titel === titel && l.hinweis && !l.liste && l.sichtbareMitWortlaut === 0 && l.verpackung === null, `${art}: „${l.titel}“, ${l.hinweis}`);
    await umgebung.close();
  }
  // 8: ohne JavaScript
  {
    const { seite, umgebung } = await oeffne(PROFIL.kodierung, { skript: false });
    const l = await lage(seite);
    pruefe(l.ohneSkript && !l.liste && l.sichtbareMitWortlaut === 0, `ohne JavaScript: „${l.ohneSkript}“`);
    await umgebung.close();
  }
  // 10: dunkel und große Schrift
  {
    const { seite, umgebung } = await oeffne(PROFIL.kodierung, { vorher: () => { try { localStorage.setItem('darstellung', 'dunkel'); } catch { /* ohne Speicher */ } } });
    await seite.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await warte(300);
    const farben = await seite.evaluate(() => {
      const karte = document.querySelector('[data-p-liste]');
      const name = document.querySelector('.p-name');
      return { modus: document.documentElement.dataset.modus, karte: getComputedStyle(karte).backgroundColor, text: getComputedStyle(name).color, breit: document.documentElement.scrollWidth > window.innerWidth + 1 };
    });
    pruefe(farben.modus === 'dunkel' && farben.karte !== farben.text && !farben.breit, `dunkel und 200 % Schrift: ${JSON.stringify(farben)}`);
    await umgebung.close();
  }
} finally {
  await browser.close();
}

console.log(fehler.length ? `\n${fehler.length} Prüfungen fehlgeschlagen` : '\nAlle Prüfungen bestanden');
process.exit(fehler.length ? 1 : 0);
