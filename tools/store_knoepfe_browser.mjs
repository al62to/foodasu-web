// Store-Knöpfe im Browser (AP-124), gegen eine laufende Vorschau des Baus (npm run build, dann npx astro preview).
// Je Kennung (Android-Chrome, Android in einem eingebauten Browser, iPhone-Safari, iPhone in einem eingebauten
// Browser, iPad mit Desktop-Kennung, Computer) und Seite: jedes Abzeichen bzw. jeder Link zu einem Store antippen und
// das Ziel lesen. Nichts davon wird ausgeführt: Die Sperre aus tools/fremde_apps_sperre.mjs fängt intent:, market:,
// itms-apps: und die Store-Hosts in der Seite ab, dazu bricht die Anfrage-Sperre jede Anfrage an die Store-Hosts ab.
// Geprüft: Ziel beim Antippen, Rückfall-Adresse, Referrer unverändert, die Seite bleibt stehen; ohne JavaScript und mit
// JavaScript nach dem Laden steht im href die Adresse aus dem Bau (Vergleich mit einem Bau von vorher, wenn angegeben).
// Aufruf: node tools/store_knoepfe_browser.mjs [Basis, Vorgabe http://127.0.0.1:4321] [Ordner eines Baus von vorher]
//   Rückgabewert 1 bei einem Befund.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { fremdeAppsSperren, istFremd, STORE_HOSTS } from './fremde_apps_sperre.mjs';
import { intentLesen } from '../src/skripte/teilen/app_oeffnen.mjs';
import { KENNUNGEN } from './store_knoepfe_kennungen.mjs';

const BASIS = (process.argv[2] ?? 'http://127.0.0.1:4321').replace(/\/$/, '');
const VORHER = process.argv[3];
const faelle = JSON.parse(readFileSync(new URL('./teilen/testfaelle.json', import.meta.url), 'utf8')).faelle;
const LISTE = faelle.find((f) => f.name === 'Liste neu (Fassung 1)').kodierung;

const SEITEN = [
  { pfad: '/', datei: 'index.html' },
  { pfad: '/rezepte/wiener-schnitzel/', datei: 'rezepte/wiener-schnitzel/index.html' },
  { pfad: `/l/#${LISTE}`, datei: 'l/index.html', bereit: '[data-l-seite][data-bereit]' },
  { pfad: '/c/', datei: 'c/index.html' },
  { pfad: '/so-gehts/', datei: 'so-gehts/index.html' },
  { pfad: '/datenschutz.html', datei: 'datenschutz.html' },
  { pfad: '/teilen/', datei: 'teilen/index.html', weiterleitung: true },
];
const ART = { 'Android Chrome': 'android', 'Android eingebaut (WebView)': 'android', 'iPhone Safari': 'apple', 'iPhone eingebaut': 'apple', 'iPad Desktop-Kennung': 'apple', Computer: 'computer' };
const ANSICHT = {
  android: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  apple: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  ipad: { width: 1024, height: 1366, deviceScaleFactor: 1, isMobile: false, hasTouch: true },
  computer: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};
const STORE_LINKS = 'a[href^="https://apps.apple.com/"], a[href^="https://play.google.com/"]';

const befunde = [];
const tabelle = [];
let zahl = 0;
const pruefe = (gut, text) => { zahl += 1; if (!gut) { befunde.push(text); console.log(`FEHLER ${text}`); } };
const warte = (ms) => new Promise((f) => setTimeout(f, ms));
const entities = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const hrefsAusDatei = (datei) => [...readFileSync(datei, 'utf8').matchAll(/<a\b[^>]*\bhref="(https:\/\/(?:apps\.apple\.com|play\.google\.com)\/[^"]*)"/g)].map((m) => entities(m[1]));

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true, protocolTimeout: 60000 });
const anChrome = [];
const abgebrochen = [];

async function oeffne(kennung, ansicht, { js = true } = {}) {
  const umgebung = await browser.createBrowserContext();
  const seite = await umgebung.newPage();
  await seite.setViewport(ansicht);
  await seite.setUserAgent(kennung.userAgent);
  await seite.setJavaScriptEnabled(js);
  await fremdeAppsSperren(seite);
  // Touch-Punkte wie am Gerät (puppeteer meldet sonst 1; das iPad mit Desktop-Kennung erkennt die Seite an mehr als 1).
  await seite.evaluateOnNewDocument((punkte) => { Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { configurable: true, get: () => punkte }); }, kennung.maxTouchPoints);
  const waechter = await seite.createCDPSession();
  await waechter.send('Page.enable');
  waechter.on('Page.frameRequestedNavigation', (e) => { if (istFremd(e.url)) anChrome.push(e.url); });
  await seite.setRequestInterception(true);
  seite.on('request', (anfrage) => {
    let host = '';
    try { host = new URL(anfrage.url()).hostname; } catch { /* data: und Ähnliches */ }
    if (STORE_HOSTS.includes(host)) { abgebrochen.push(anfrage.url()); anfrage.abort(); } else anfrage.continue();
  });
  const fehler = [];
  seite.on('pageerror', (f) => fehler.push(f.message));
  return { umgebung, seite, fehler };
}

for (const [name, kennung] of Object.entries(KENNUNGEN)) {
  const art = ART[name];
  const ansicht = name.startsWith('iPad') ? ANSICHT.ipad : ANSICHT[art];
  for (const s of SEITEN) {
    const adresse = `${BASIS}${s.pfad}`;
    const vorherHrefs = VORHER ? hrefsAusDatei(join(VORHER, s.datei)) : null;
    // Ohne JavaScript: die hrefs wie im Bau (Weiterleitung ohne Skript nicht laden: das meta refresh ginge zum Store).
    if (!s.weiterleitung) {
      const ohne = await oeffne(kennung, ansicht, { js: false });
      await ohne.seite.goto(adresse, { waitUntil: 'load' });
      const hrefs = await ohne.seite.$$eval(STORE_LINKS, (as) => as.map((a) => a.getAttribute('href')));
      pruefe(hrefs.length > 0, `${name} ${s.pfad}: ohne JavaScript Store-Links vorhanden`);
      if (vorherHrefs) pruefe(JSON.stringify(hrefs) === JSON.stringify(vorherHrefs), `${name} ${s.pfad}: ohne JavaScript hrefs wie im Bau vorher (${hrefs.length} gegen ${vorherHrefs.length})`);
      await ohne.umgebung.close();
    }
    const { umgebung, seite, fehler } = await oeffne(kennung, ansicht);
    await seite.goto(adresse, { waitUntil: 'networkidle0' });
    if (s.bereit) await seite.waitForSelector(s.bereit, { timeout: 10000 });
    await warte(200);
    const beimLaden = await seite.evaluate(() => [...(window.__fremdAbgefangen ?? [])]);
    if (s.weiterleitung) {
      // Unverändert seit AP-79w: iPhone/iPad zum App Store, alle anderen zu Google Play mit Kennung (sofort, ohne Tippen).
      const erwartet = art === 'apple' ? 'https://apps.apple.com/at/app/id6829687240' : 'https://play.google.com/store/apps/details?id=at.tonc.einkauf&referrer=utm_source%3Dapp%26utm_medium%3Dteilen%26utm_campaign%3Dempfehlung';
      pruefe(beimLaden.length === 1 && beimLaden[0] === erwartet, `${name} ${s.pfad}: Weiterleitung beim Laden wie bisher (${beimLaden.join(' | ')})`);
    } else pruefe(beimLaden.length === 0, `${name} ${s.pfad}: beim Laden keine Navigation (${beimLaden.join(' | ')})`);
    const links = await seite.$$(STORE_LINKS);
    const hrefs = await seite.$$eval(STORE_LINKS, (as) => as.map((a) => a.getAttribute('href')));
    if (vorherHrefs && !s.weiterleitung) pruefe(JSON.stringify(hrefs) === JSON.stringify(vorherHrefs), `${name} ${s.pfad}: mit JavaScript hrefs wie im Bau vorher`);
    for (const link of links) {
      const info = await link.evaluate((a) => {
        const r = a.getBoundingClientRect(); const st = getComputedStyle(a);
        const ort = a.closest('[data-abzeichen]')?.dataset.abzeichen ?? (a.closest('footer') ? 'fuss' : a.closest('.c-store') ? 'code' : a.closest('.wl') ? 'kurzlink' : '?');
        return { href: a.href, ort, sichtbar: r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && !a.closest('[hidden]') };
      });
      await seite.evaluate(() => { window.__fremdAbgefangen = []; });
      if (info.sichtbar) {
        await link.evaluate((a) => a.scrollIntoView({ block: 'center' }));
        await warte(50);
        if (ansicht.hasTouch) await link.tap(); else await link.click();
      } else await link.evaluate((a) => a.click());
      await warte(info.href.startsWith('https://apps.apple.com') && art === 'apple' ? 1900 : 350);
      const ziele = await seite.evaluate(() => [...(window.__fremdAbgefangen ?? [])]);
      const store = info.href.startsWith('https://play.google.com') ? 'google' : 'apple';
      const zeile = { kennung: name, seite: s.pfad.split('#')[0], ort: info.ort, store, sichtbar: info.sichtbar, ziele };
      tabelle.push(zeile);
      const text = `${name} ${zeile.seite} ${info.ort} ${store}${info.sichtbar ? '' : ' (verdeckt, per Skript geklickt)'}`;
      if (art === 'android' && store === 'google') {
        const gelesen = ziele.length === 1 ? intentLesen(ziele[0]) : null;
        pruefe(gelesen?.daten === `market://details${new URL(info.href).search}` && gelesen.paket === 'com.android.vending' && gelesen.rueckfall === info.href && ziele[0].includes(';scheme=market;'),
          `${text}: intent zum Play Store mit Rückfall (${ziele.join(' | ')})`);
        pruefe(new URLSearchParams(new URL(info.href).search).get('referrer') === new URLSearchParams(gelesen?.daten?.split('?')[1] ?? '').get('referrer'), `${text}: Referrer unverändert`);
      } else if (art === 'apple' && store === 'apple') {
        const url = new URL(info.href);
        pruefe(ziele.length === 2 && ziele[0] === `itms-apps://${url.host}${url.pathname}${url.search}` && ziele[1] === info.href, `${text}: itms-apps, nach 1,5 s https (${ziele.join(' | ')})`);
      } else {
        pruefe(ziele.length === 1 && ziele[0] === info.href, `${text}: https wie bisher (${ziele.join(' | ')})`);
      }
    }
    pruefe(seite.url() === adresse, `${name} ${s.pfad}: Seite bleibt stehen (${seite.url()})`);
    pruefe(fehler.length === 0, `${name} ${s.pfad}: keine Fehler in der Seite (${fehler.join(' | ')})`);
    await umgebung.close();
  }
}
await browser.close();

pruefe(anChrome.length === 0, `fremde Apps: keine Adresse an Chrome gegeben (${anChrome.join(' | ')})`);
// Zusammenfassung je Kennung und Store
const zusammen = {};
for (const z of tabelle) {
  const schluessel = `${z.kennung} | ${z.store}`;
  const ziel = z.ziele[0] ? z.ziele[0].replace(/^(intent:\/\/details|itms-apps:\/\/apps\.apple\.com|https:\/\/[^/?]+).*$/, '$1') + (z.ziele.length > 1 ? ' → ' + z.ziele[1].replace(/^(https:\/\/[^/?]+).*$/, '$1') : '') : '(nichts)';
  (zusammen[schluessel] ??= { klicks: 0, ziele: new Set() }).klicks += 1;
  zusammen[schluessel].ziele.add(ziel);
}
console.log('\nKennung | Store | Abzeichen getippt | Ziel');
for (const [schluessel, { klicks, ziele }] of Object.entries(zusammen)) console.log(`${schluessel} | ${klicks} | ${[...ziele].join('; ')}`);
console.log(`\nAbgefangene Anfragen an Store-Hosts (nie geladen): ${abgebrochen.length}`);
console.log(`Store-Knöpfe im Browser: ${zahl} Prüfungen, ${tabelle.length} Abzeichen getippt (${tabelle.filter((z) => z.sichtbar).length} sichtbar angetippt, die übrigen verdeckt per Skript geklickt), ${befunde.length} Befunde`);
console.log(befunde.length ? 'Ergebnis: NICHT bestanden' : 'Ergebnis: bestanden');
process.exit(befunde.length ? 1 : 0);
