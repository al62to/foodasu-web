// Prüfungen der Seite /l/ im Browser (AP-112), gegen eine laufende Vorschau des Baus (npm run build, dann
// npx astro preview). Chrome über puppeteer-core (tools/chrome.mjs), jede Prüfung in einem eigenen, leeren Profil:
//   1. Testfälle im Browser: die gemeinsamen Testfälle (tools/teilen/testfaelle.json, ohne Art "liste") mit
//      DecompressionStream und mit fflate, aus den Quelldateien des Kerns (eigener kleiner Server nur für diese Dateien)
//   2. Liste öffnen, Anzeige (Reihenfolge, Mengen, kein Strichcode), abhaken, Speicher (nur foodasu-liste-<listId>),
//      keine Anfragen an Dritte, keine Cookies; nach Neuladen bleiben die Häkchen
//   3. zwei Tabs: dieselbe Fassung gleicht still ab, eine neuere zeigt „Es gibt eine neuere Fassung“, ein Tipp übernimmt
//   4. ohne Netz nach dem ersten Öffnen (Service Worker nur für /l/, keine Adresse mit # in der Ablage)
//   5. ohne lokalen Speicher (jeder Zugriff wirft): Liste, Hinweis, Abhaken, Zurückschicken gehen
//   6. älterer Browser ohne DecompressionStream und CompressionStream: fflate wird geladen, Liste und Häkchen gehen
//   7. Häkchen zurückschicken und „Alles erledigt“: Umschlag h, Nachricht, done 1
//   8. Seiten ohne Liste: kein #, kaputt, zu groß, neuere Version, Häkchen-Link (Art h), Profil-Link
//   9. Aufräumen nach 60 Tagen und „Liste aus diesem Browser entfernen“
// Aufruf: node tools/teilen_browser.mjs [Basis, Vorgabe http://127.0.0.1:4321]   Rückgabewert 1 bei einem Befund.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { lesen } from '../src/skripte/teilen/kodierung.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASIS = (process.argv[2] ?? 'http://127.0.0.1:4321').replace(/\/$/, '');
const HANDY = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true };
const faelle = JSON.parse(readFileSync(join(wurzel, 'tools', 'teilen', 'testfaelle.json'), 'utf8')).faelle;
const fall = (name) => faelle.find((eintrag) => eintrag.name === name);

const zeilen = [];
const befunde = [];
const pruefe = (gut, text) => { console.log(`${gut ? 'ok    ' : 'FEHLER'} ${text}`); zeilen.push([gut, text]); if (!gut) befunde.push(text); };
const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

// Beispiel-Listen aus den Testfällen (vom Kern erzeugt): Liste neu (Fassung 1) und der Nachtrag (Fassung 2).
const U1 = fall('Liste neu (Fassung 1)');
const U2 = fall('Nachtrag (neu, geändert, gestrichen)');
const link = (kodierung) => `${BASIS}/l/#${kodierung}`;

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true, protocolTimeout: 60000 });

async function neuesProfil({ vorher } = {}) {
  const umgebung = await browser.createBrowserContext();
  const anfragen = [];
  const fehler = [];
  const oeffne = async (ansicht = HANDY) => {
    const seite = await umgebung.newPage();
    await seite.setViewport(ansicht);
    if (vorher) await seite.evaluateOnNewDocument(vorher);
    // navigator.share: merkt sich den Text, statt ein Menü zu öffnen.
    await seite.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: async (daten) => { window.__geteilt = daten.text; } });
    });
    // Puppeteer nennt bei der Navigation die Adresse samt # (wie in der Adresszeile); über HTTP geht der Teil hinter dem #
    // nie hinaus. Gemerkt wird deshalb, ob eine andere Anfrage (Datei, Skript, fetch) ein # enthält.
    seite.on('request', (anfrage) => { if (!anfrage.url().startsWith('data:')) anfragen.push(anfrage.isNavigationRequest() ? anfrage.url().split('#')[0] : anfrage.url()); });
    seite.on('pageerror', (f) => fehler.push(f.message));
    seite.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
    return seite;
  };
  return { umgebung, anfragen, fehler, oeffne };
}
const bereit = (seite) => seite.waitForSelector('[data-l-seite][data-bereit]', { timeout: 10000 });
const offen = async (seite, adresse) => { await seite.goto(adresse, { waitUntil: 'networkidle0' }); await bereit(seite); };
const text = (seite, auswahl) => seite.$eval(auswahl, (e) => e.textContent.trim()).catch(() => null);
const sichtbar = (seite, auswahl) => seite.$eval(auswahl, (e) => !e.hidden && !e.closest('[hidden]')).catch(() => false);
const speicher = (seite) => seite.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
const status = (seite, id) => seite.$eval(`[data-id="${id}"]`, (e) => e.dataset.status).catch(() => null);
const fremd = (anfragen) => anfragen.filter((adresse) => new URL(adresse).origin !== new URL(BASIS).origin);

// ---- 1. Testfälle im Browser ---------------------------------------------------------------------------------
console.log('## 1 Testfälle im Browser');
{
  // Kleiner Server nur für die Dateien, die die Prüfung braucht (Kern, Prüflogik, Testfälle, fflate).
  const ERLAUBT = [/^\/src\/skripte\/teilen\/[\w]+\.mjs$/, /^\/tools\/teilen\/pruefung\.mjs$/, /^\/tools\/teilen\/testfaelle\.json$/, /^\/src\/daten\/teilen_app\.json$/, /^\/node_modules\/fflate\/umd\/index\.js$/];
  const ARTEN = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' };
  const server = createServer((anfrage, antwort) => {
    const pfad = normalize(decodeURIComponent(new URL(anfrage.url, 'http://x').pathname));
    if (pfad === '/') { antwort.writeHead(200, { 'content-type': 'text/html' }); antwort.end('<!doctype html><meta charset="utf-8"><title>Testfälle</title>'); return; }
    const datei = join(wurzel, pfad);
    if (!ERLAUBT.some((muster) => muster.test(pfad)) || !existsSync(datei)) { antwort.writeHead(404); antwort.end(); return; }
    antwort.writeHead(200, { 'content-type': ARTEN[extname(pfad)] ?? 'application/octet-stream' });
    antwort.end(readFileSync(datei));
  });
  await new Promise((fertig) => server.listen(0, '127.0.0.1', fertig));
  const adresse = `http://127.0.0.1:${server.address().port}`;
  const seite = await browser.newPage();
  const seitenFehler = [];
  seite.on('pageerror', (f) => seitenFehler.push(f.message));
  await seite.goto(`${adresse}/`);
  const ergebnis = await seite.evaluate(async () => {
    const { pruefeTestfaelle } = await import('/tools/teilen/pruefung.mjs');
    const daten = await (await fetch('/tools/teilen/testfaelle.json')).json();
    const app = await (await fetch('/src/daten/teilen_app.json')).json();
    return pruefeTestfaelle(daten, app);
  });
  const version = await browser.version();
  for (const weg of ['strom', 'bibliothek']) {
    const arten = ergebnis.zahlen[weg];
    const gut = Object.values(arten).reduce((s, [g]) => s + g, 0);
    const alle = Object.values(arten).reduce((s, [, z]) => s + z, 0);
    pruefe(gut === alle && alle > 0, `${version}, ${weg === 'strom' ? 'DecompressionStream' : 'fflate'}: ${Object.entries(arten).map(([art, [g, z]]) => `${art} ${g}/${z}`).join(', ')}`);
  }
  for (const befund of ergebnis.befunde) pruefe(false, `Testfall im Browser: ${befund}`);
  pruefe(seitenFehler.length === 0, `keine Fehler auf der Seite der Testfälle (${seitenFehler.join('; ')})`);
  await seite.close();
  server.close();
}

// ---- 2. Liste öffnen, Anzeige, Abhaken, Speicher ---------------------------------------------------------------
console.log('\n## 2 Liste öffnen, Anzeige, Abhaken, Speicher');
{
  const p = await neuesProfil();
  const seite = await p.oeffne();
  await offen(seite, link(U1.kodierung));
  pruefe(await text(seite, '[data-l-titel]') === 'Wocheneinkauf', 'Name der Liste als Überschrift');
  pruefe(await text(seite, '.s-kopf .ueberzeile') === 'Einkaufsliste von Papa', 'Überzeile „Einkaufsliste von Papa“ (Name aus a[by])');
  pruefe(/^Stand .+ · 0 von 4 erledigt$/.test(await text(seite, '[data-l-stand]') ?? ''), `Stand und Fortschritt: ${await text(seite, '[data-l-stand]')}`);
  const reihen = await seite.$$eval('.l-gruppe', (gruppen) => gruppen.map((g) => [g.querySelector('.l-gruppe-titel')?.textContent, [...g.querySelectorAll('.l-name')].map((n) => n.textContent)]));
  pruefe(JSON.stringify(reihen) === JSON.stringify([['Brot und Gebäck', ['Brot']], ['Milch und Käse', ['10 Eier', '2 Milch']], ['Vorrat', ['500\u00a0g Kaffee']]]), `Gruppen in der Reihenfolge der App, in der Gruppe nach dem Namen (AP-112b), Menge vor dem Namen: ${JSON.stringify(reihen)}`);
  const seitenText = await seite.evaluate(() => document.body.innerText);
  pruefe(!seitenText.includes('4006381333931'), 'Strichcode (ean) steht nicht auf der Seite');
  await seite.click('[data-id="e0Milch1"] [data-art="haken"]');
  await seite.click('[data-id="e0Kaffee"] [data-art="nicht"]');
  pruefe(await status(seite, 'e0Milch1') === 'd' && await status(seite, 'e0Kaffee') === 'x', 'Abhaken (d) und „nicht bekommen“ (x) per Tipp');
  pruefe(await seite.$eval('[data-id="e0Milch1"]', (e) => e.closest('.l-erledigt') !== null), 'Erledigtes steht im Bereich „Erledigt“');
  pruefe((await text(seite, '[data-id="e0Kaffee"] .l-vermerk'))?.includes('Nicht bekommen'), '„nicht bekommen“ bleibt offen sichtbar mit Vermerk');
  const daten = await speicher(seite);
  const schluessel = Object.keys(daten);
  pruefe(schluessel.length === 1 && schluessel[0] === `foodasu-liste-${U1.json.id}`, `genau ein Eintrag im Speicher: ${schluessel.join(', ')}`);
  const satz = JSON.parse(daten[schluessel[0]] ?? '{}');
  const milch = satz.stand?.e?.find((e) => e[0] === 'e0Milch1');
  pruefe(milch?.[7] === 'd' && milch?.[9] === satz.autor && /^[A-Za-z0-9_-]{6}$/.test(satz.autor) && Math.abs(milch[8] - Date.now() / 1000) < 60, 'eigene Änderung: statusZeit = jetzt (Sekunden), statusVon = eigene authorId (6 Zeichen)');
  pruefe(satz.stand?.id === U1.json.id && satz.stand.rev === 1 && typeof satz.geoeffnet === 'number', 'Speicher: Stand (Format 4), Zeitpunkt des Öffnens');
  await seite.click('[data-id="e0Kaffee"] [data-art="nicht"]');
  pruefe(await status(seite, 'e0Kaffee') === 'o', '„nicht bekommen“ zurücknehmen ergibt wieder offen');
  await seite.reload({ waitUntil: 'networkidle0' });
  await bereit(seite);
  pruefe(await status(seite, 'e0Milch1') === 'd', 'Häkchen bleiben nach dem Neuladen');
  pruefe(await sichtbar(seite, '[data-l-name]'), 'Frage „Wie heißt du?“ beim ersten Öffnen');
  const cookies = await p.umgebung.cookies();
  pruefe(cookies.length === 0 && await seite.evaluate(() => document.cookie.length) === 0, 'keine Cookies');
  pruefe(fremd(p.anfragen).length === 0, `keine Anfragen an Dritte (${fremd(p.anfragen).join(', ')})`);
  pruefe(!p.anfragen.some((adresse) => adresse.includes('#')), 'keine Anfrage der Seite (Dateien, Skripte) enthält den Teil hinter dem #');
  pruefe(p.fehler.length === 0, `keine Fehler in der Konsole (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}

// ---- 3. Zwei Tabs ----------------------------------------------------------------------------------------------
console.log('\n## 3 Zwei Tabs');
{
  const p = await neuesProfil();
  const a = await p.oeffne();
  await offen(a, link(U1.kodierung));
  const b = await p.oeffne();
  await offen(b, link(U1.kodierung));
  await b.bringToFront();
  await b.click('[data-id="e0Eier01"] [data-art="haken"]');
  await warte(400);
  pruefe(await status(a, 'e0Eier01') === 'd' && !(await sichtbar(a, '[data-l-neuer]')), 'gleiche Fassung: Häkchen aus dem zweiten Tab kommen still an');
  await b.evaluate((k) => { location.hash = k; }, U2.kodierung);
  await b.waitForFunction(() => document.querySelector('[data-id="e0Butter"]') !== null);
  await warte(400);
  pruefe(await sichtbar(a, '[data-l-neuer]'), 'neuere Fassung im zweiten Tab: oben „Es gibt eine neuere Fassung“');
  pruefe(await a.$('[data-id="e0Butter"]') === null, 'der ältere Tab zeigt bis zum Tipp seine Fassung');
  await a.bringToFront();
  await a.click('[data-l-neuer-knopf]');
  pruefe(await a.$('[data-id="e0Butter"]') !== null && !(await sichtbar(a, '[data-l-neuer]')), 'ein Tipp übernimmt die neuere Fassung');
  pruefe(await status(a, 'e0Brot01') === 'g' && (await text(a, '[data-id="e0Brot01"] .l-vermerk'))?.includes('gestrichen von Papa'), 'Gestrichenes grau mit „gestrichen von Papa“');
  await b.bringToFront();
  pruefe((await text(b, '[data-id="e0Butter"] .l-neu')) === 'neu' && (await text(b, '[data-id="e0Zwiebl"] .l-neu')) === 'neu', 'Neues aus dem Nachtrag mit „neu“');
  pruefe(await status(b, 'e0Eier01') === 'd', 'Häkchen bleiben beim Nachtrag');
  pruefe((await text(b, '[data-id="e0Milch1"] .l-menge')) === '3', 'geänderte Menge aus dem Nachtrag');
  await b.reload({ waitUntil: 'networkidle0' });
  await bereit(b);
  pruefe(await b.$('[data-id="e0Butter"] .l-neu') === null, '„neu“ nur bis zum nächsten Öffnen');
  pruefe(p.fehler.length === 0, `keine Fehler in der Konsole (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}

// ---- 4. Ohne Netz nach dem ersten Öffnen ------------------------------------------------------------------------
console.log('\n## 4 Ohne Netz');
{
  const p = await neuesProfil();
  const seite = await p.oeffne();
  await offen(seite, link(U1.kodierung));
  await seite.waitForFunction(() => navigator.serviceWorker.controller !== null || navigator.serviceWorker.ready, { timeout: 10000 });
  const anmeldung = await seite.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, skript: r.active?.scriptURL }; });
  pruefe(anmeldung.scope === `${BASIS}/l/` && anmeldung.skript === `${BASIS}/l/sw.js`, `Service Worker ${anmeldung.skript}, Bereich ${anmeldung.scope}`);
  await seite.click('[data-id="e0Milch1"] [data-art="haken"]');
  // Warten, bis die Ablage die Dateien der Seite hat.
  await seite.waitForFunction(async () => { const a = await caches.open('foodasu-l-1'); return (await a.keys()).length >= 3; }, { timeout: 10000 }).catch(() => {});
  const ablage = await seite.evaluate(async () => (await (await caches.open('foodasu-l-1')).keys()).map((r) => r.url));
  pruefe(ablage.length >= 3 && ablage.every((adresse) => !adresse.includes('#') && adresse.startsWith(BASIS)), `Ablage: ${ablage.length} eigene Dateien, keine mit # (${ablage.map((a) => a.replace(BASIS, '')).join(', ')})`);
  await seite.setOfflineMode(true);
  await seite.reload({ waitUntil: 'load' });
  await bereit(seite);
  pruefe(await text(seite, '[data-l-titel]') === 'Wocheneinkauf' && await status(seite, 'e0Milch1') === 'd', 'ohne Netz: Seite lädt neu, Liste und Häkchen da');
  await seite.goto(link(U2.kodierung), { waitUntil: 'load' });
  await bereit(seite);
  pruefe(await seite.$('[data-id="e0Butter"]') !== null, 'ohne Netz: ein Nachtrag öffnet und wird zusammengeführt');
  await seite.setOfflineMode(false);
  pruefe(p.fehler.filter((f) => !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(f)).length === 0, `keine Fehler in der Konsole außer fehlendem Netz (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}

// ---- 5. Ohne lokalen Speicher ---------------------------------------------------------------------------------
console.log('\n## 5 Ohne lokalen Speicher');
{
  const p = await neuesProfil({ vorher: () => { Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Speicher gesperrt', 'SecurityError'); } }); } });
  const seite = await p.oeffne();
  await offen(seite, link(U1.kodierung));
  pruefe(await text(seite, '[data-l-titel]') === 'Wocheneinkauf', 'Liste erscheint');
  pruefe(await sichtbar(seite, '[data-l-ohne-speicher]'), 'kurzer Hinweis, dass die Häkchen nicht bleiben');
  pruefe(!(await sichtbar(seite, '[data-l-browser]')), 'kein Knopf „Liste aus diesem Browser entfernen“');
  await seite.click('[data-id="e0Milch1"] [data-art="haken"]');
  pruefe(await status(seite, 'e0Milch1') === 'd', 'Abhaken geht');
  await seite.click('[data-l-senden]');
  await seite.type('[data-l-name-feld]', 'Mama');
  await seite.click('[data-l-name] button[type="submit"]');
  await seite.waitForFunction(() => window.__geteilt !== undefined, { timeout: 5000 }).catch(() => {});
  const geteilt = await seite.evaluate(() => window.__geteilt ?? '');
  pruefe(geteilt.includes('/l/#1'), 'Zurückschicken geht (Link gebaut)');
  pruefe(p.fehler.length === 0, `keine Fehler auf der Seite (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}

// ---- 6. Älterer Browser ohne DecompressionStream ---------------------------------------------------------------
console.log('\n## 6 Älterer Browser ohne DecompressionStream und CompressionStream');
{
  const p = await neuesProfil({ vorher: () => { delete window.DecompressionStream; delete window.CompressionStream; } });
  const seite = await p.oeffne();
  await offen(seite, link(U1.kodierung));
  pruefe(await seite.evaluate(() => typeof DecompressionStream === 'undefined'), 'DecompressionStream fehlt');
  const bibliothek = p.anfragen.filter((adresse) => /\/_astro\/index\.[\w-]+\.js$/.test(adresse));
  pruefe(bibliothek.length === 1, `Rückfall-Bibliothek nachgeladen: ${bibliothek.map((a) => a.replace(BASIS, '')).join(', ')}`);
  pruefe(await text(seite, '[data-l-titel]') === 'Wocheneinkauf' && (await seite.$$('.l-eintrag')).length === 4, 'Liste mit 4 Einträgen erscheint');
  await seite.click('[data-id="e0Brot01"] [data-art="haken"]');
  await seite.click('[data-l-senden]');
  await seite.type('[data-l-name-feld]', 'Oma');
  await seite.click('[data-l-name] button[type="submit"]');
  await seite.waitForFunction(() => window.__geteilt !== undefined, { timeout: 5000 }).catch(() => {});
  const geteilt = await seite.evaluate(() => window.__geteilt ?? '');
  const kodierung = geteilt.split('#')[1] ?? '';
  const gelesen = await lesen(kodierung, 'strom');
  pruefe(gelesen.umschlag?.k === 'h' && gelesen.umschlag.s.length === 1 && gelesen.umschlag.s[0][0] === 'e0Brot01' && gelesen.umschlag.a[gelesen.umschlag.by] === 'Oma', `mit fflate gepackte Häkchen entpackt Node mit DecompressionStream: ${JSON.stringify(gelesen.umschlag?.s)}`);
  pruefe(p.fehler.length === 0, `keine Fehler auf der Seite (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}
// Gegenprobe: Mit DecompressionStream lädt die Seite die Bibliothek nicht.
{
  const p = await neuesProfil();
  const seite = await p.oeffne();
  await offen(seite, link(U1.kodierung));
  pruefe(!p.anfragen.some((adresse) => /\/_astro\/index\.[\w-]+\.js$/.test(adresse)), 'Gegenprobe: mit DecompressionStream wird fflate nicht geladen');
  await p.umgebung.close();
}

// ---- 7. Häkchen zurückschicken, Alles erledigt ----------------------------------------------------------------
console.log('\n## 7 Häkchen zurückschicken, Alles erledigt');
{
  const p = await neuesProfil();
  const seite = await p.oeffne();
  await offen(seite, link(U1.kodierung));
  pruefe(!(await sichtbar(seite, '[data-l-zurueck]')), 'ohne eigene Häkchen kein Knopf zum Zurückschicken');
  await seite.type('[data-l-name-feld]', 'Mama');
  await seite.click('[data-l-name] button[type="submit"]');
  for (const id of ['e0Milch1', 'e0Eier01', 'e0Brot01']) await seite.click(`[data-id="${id}"] [data-art="haken"]`);
  pruefe((await text(seite, '[data-l-senden]')) === 'Liste an Papa zurückschicken', `Knopf: ${await text(seite, '[data-l-senden]')}`);
  await seite.click('[data-id="e0Kaffee"] [data-art="nicht"]');
  pruefe(await seite.$eval('[data-l-zurueck]', (e) => e.classList.contains('fertig')), 'alles erledigt oder nicht bekommen: großer Knopf');
  pruefe((await text(seite, '[data-l-zurueck-titel]')) === 'Alles erledigt.' && (await text(seite, '[data-l-senden]')) === 'Papa Bescheid geben?', `„Alles erledigt.“ und „${await text(seite, '[data-l-senden]')}“`);
  await seite.click('[data-l-senden]');
  await seite.waitForFunction(() => window.__geteilt !== undefined, { timeout: 5000 });
  const geteilt = await seite.evaluate(() => window.__geteilt);
  const [satz, adresse] = geteilt.split('\n');
  pruefe(satz === 'Mama hat „Wocheneinkauf“ erledigt (3 von 4, nicht bekommen: Kaffee).', `Nachricht: ${satz}`);
  pruefe(adresse.startsWith('https://foodasu.com/l/#1'), `Link https://foodasu.com/l/#… (${adresse.length} Zeichen)`);
  const gelesen = await lesen(adresse.split('#')[1]);
  const u = gelesen.umschlag;
  pruefe(u?.k === 'h' && u.done === 1 && u.rev === 1 && u.id === U1.json.id && u.s.length === 4 && u.s.map((x) => x[0]).join() === 'e0Milch1,e0Eier01,e0Brot01,e0Kaffee', `Umschlag h: done 1, rev 1, s nach ordnung: ${JSON.stringify(u?.s)}`);
  // Ohne navigator.share: WhatsApp-Link, SMS-Link, Kopieren.
  await seite.evaluate(() => { delete navigator.share; Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }); });
  await seite.click('[data-l-senden]');
  await seite.waitForSelector('[data-l-wege]:not([hidden])', { timeout: 5000 });
  const wa = await seite.$eval('[data-l-weg="whatsapp"]', (e) => e.href);
  const sms = await seite.$eval('[data-l-weg="sms"]', (e) => e.href);
  pruefe(wa.startsWith('https://wa.me/?text=') && decodeURIComponent(wa.split('text=')[1]).includes('https://foodasu.com/l/#1'), 'WhatsApp als reiner Link https://wa.me/?text=…');
  pruefe(sms.startsWith('sms:?&body=') && decodeURIComponent(sms.split('body=')[1]).includes('https://foodasu.com/l/#1'), 'SMS als reiner Link sms:?&body=…');
  await p.umgebung.overridePermissions(BASIS, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
  await seite.click('[data-l-weg="kopieren"]');
  await warte(300);
  pruefe((await text(seite, '[data-l-status]')) === 'Link kopiert', `Kopieren: ${await text(seite, '[data-l-status]')}`);
  pruefe(fremd(p.anfragen).length === 0 && p.fehler.length === 0, `keine Anfragen an Dritte, keine Fehler (${[...fremd(p.anfragen), ...p.fehler].join('; ')})`);
  await p.umgebung.close();
}

// ---- 7a. Notiz in beide Richtungen (Nachtrag 09.11.2026) --------------------------------------------------------
console.log('\n## 7a Notiz in beide Richtungen');
{
  const p = await neuesProfil();
  const seite = await p.oeffne();
  const mitNotiz = fall('Liste mit Notiz');
  await offen(seite, link(mitNotiz.kodierung));
  pruefe(await sichtbar(seite, '[data-l-notiz]') && (await text(seite, '[data-l-notiz-titel]')) === 'Notiz von Papa' && (await text(seite, '[data-l-notiz-text]')) === mitNotiz.json.nt[0][0], `Notiz oben: „${await text(seite, '[data-l-notiz-titel]')}“ „${await text(seite, '[data-l-notiz-text]')}“`);
  await seite.type('[data-l-name-feld]', 'Mama');
  await seite.click('[data-l-name] button[type="submit"]');
  await seite.click('[data-id="e0Milch1"] [data-art="haken"]');
  pruefe((await text(seite, '[data-l-notiz-feld-titel]')) === 'Notiz für Papa (freiwillig)', `Feld: ${await text(seite, '[data-l-notiz-feld-titel]')}`);
  await seite.type('[data-l-notiz-eingabe]', 'Butter war aus, hab Margarine genommen');
  await seite.click('[data-l-senden]');
  await seite.waitForFunction(() => window.__geteilt !== undefined, { timeout: 5000 });
  const [satz, notiz, adresse] = (await seite.evaluate(() => window.__geteilt)).split('\n');
  pruefe(notiz === 'Notiz: Butter war aus, hab Margarine genommen', `Notiz in der Nachricht: ${notiz} (nach „${satz}“)`);
  const u = (await lesen(adresse.split('#')[1])).umschlag;
  // Seit AP-114 eine Notiz je Person: Der Umschlag h trägt nur die eigene, [[text, zeit, authorId]] mit authorId = by.
  pruefe(u?.k === 'h' && Array.isArray(u.nt) && u.nt.length === 1 && u.nt[0][0] === 'Butter war aus, hab Margarine genommen' && u.nt[0][2] === u.by, `Umschlag h nur mit der eigenen Notiz: ${JSON.stringify(u?.nt)}`);
  pruefe(!(await sichtbar(seite, '[data-l-notiz]')) || (await text(seite, '[data-l-notiz-titel]')) === 'Notiz von Papa', 'die eigene Antwort steht nicht oben als fremde Notiz');
  pruefe(p.fehler.length === 0, `keine Fehler auf der Seite (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}

// ---- 8. Seiten ohne Liste ------------------------------------------------------------------------------------
console.log('\n## 8 Seiten ohne Liste');
{
  const p = await neuesProfil();
  const seite = await p.oeffne();
  const h = fall('Häkchen und Erledigt');
  const profil = fall('Profil');
  const gross = fall('Kodierung über 8192 Zeichen');
  const neuer = fall('Unbekannte Art der Kodierung');
  for (const [name, adresse, titel] of [
    ['kein #', `${BASIS}/l/`, 'Einkaufsliste'],
    ['kaputt', `${BASIS}/l/#1ab$cd`, 'Dieser Link ist leider unvollständig.'],
    ['zu groß', `${BASIS}/l/#${gross.kodierung}`, 'Dieser Link ist leider unvollständig.'],
    ['neuere Version', `${BASIS}/l/#${neuer.kodierung}`, 'Dieser Link ist für eine neuere FoodAsu-Version.'],
    ['Häkchen (Art h)', `${BASIS}/l/#${h.kodierung}`, 'Liste von Mama zurück'],
    ['Profil (Art p)', `${BASIS}/l/#${profil.kodierung}`, 'Dieser Link gehört zu einem Profil.'],
  ]) {
    await seite.goto('about:blank');
    await offen(seite, adresse);
    const gefunden = await text(seite, '[data-l-titel]');
    pruefe(gefunden === titel && await sichtbar(seite, '[data-l-hinweis]') && !(await sichtbar(seite, '[data-l-liste]')), `${name}: „${gefunden}“, ${await text(seite, '[data-l-hinweis-text]')}`);
  }
  await seite.goto('about:blank');
  await offen(seite, `${BASIS}/l/#${h.kodierung}`);
  const oeffnenLink = await seite.$eval('[data-l-hinweis-oeffnen]', (a) => ({ text: a.textContent.trim(), href: a.href, hidden: a.hidden }));
  pruefe(oeffnenLink.text === 'In FoodAsu öffnen' && !oeffnenLink.hidden && oeffnenLink.href.endsWith(`/l/#${h.kodierung}`), `Häkchen-Seite: Knopf „In FoodAsu öffnen“ mit derselben Adresse (${oeffnenLink.text})`);
  pruefe(Object.keys(await speicher(seite)).length === 0, 'ohne Liste nichts im Speicher');
  pruefe(await seite.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length) === 0, 'ohne Liste kein Service Worker');
  pruefe(p.fehler.length === 0, `keine Fehler auf der Seite (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}

// ---- 9. Aufräumen nach 60 Tagen, Entfernen ---------------------------------------------------------------------
console.log('\n## 9 Aufräumen nach 60 Tagen, Liste entfernen');
{
  const jetzt = Math.floor(Date.now() / 1000);
  const p = await neuesProfil();
  const seite = await p.oeffne();
  await seite.goto(`${BASIS}/l/`, { waitUntil: 'networkidle0' });
  await seite.evaluate((jetzt) => {
    const stand = { id: 'AltListe00000001', rev: 1, t: 1, by: 'PaPa01', n: 'Alt', sv: 0, a: {}, e: [], g: {} };
    localStorage.setItem('foodasu-liste-AltListe00000001', JSON.stringify({ format: 1, name: '', autor: 'AbCd01', stand, geoeffnet: jetzt - 61 * 86400 }));
    localStorage.setItem('foodasu-liste-JungListe0000001', JSON.stringify({ format: 1, name: '', autor: 'AbCd01', stand: { ...stand, id: 'JungListe0000001' }, geoeffnet: jetzt - 59 * 86400 }));
    localStorage.setItem('darstellung', 'hell');
  }, jetzt);
  await offen(seite, `${BASIS}/l/?neu`);
  const nachher = Object.keys(await speicher(seite)).sort();
  pruefe(nachher.join() === 'darstellung,foodasu-liste-JungListe0000001', `nach 61 Tagen gelöscht, nach 59 Tagen bleibt, fremde Einträge bleiben: ${nachher.join(', ')}`);
  await offen(seite, link(U1.kodierung));
  pruefe(Object.keys(await speicher(seite)).includes(`foodasu-liste-${U1.json.id}`), 'Liste im Speicher');
  await seite.click('[data-l-entfernen]');
  pruefe(!Object.keys(await speicher(seite)).includes(`foodasu-liste-${U1.json.id}`) && (await text(seite, '[data-l-titel]')) === 'Die Liste ist aus diesem Browser entfernt.', '„Liste aus diesem Browser entfernen“ löscht den Eintrag');
  // Bildschirm anlassen: Schalter standardmäßig an, ein Tipp schaltet aus und wird gemerkt.
  await offen(seite, link(U2.kodierung));
  const wach = await seite.evaluate(() => 'wakeLock' in navigator);
  if (wach) {
    pruefe((await seite.$eval('[data-l-wach]', (e) => e.getAttribute('aria-checked'))) === 'true', 'Schalter „Bildschirm anlassen“ standardmäßig an');
    await seite.click('[data-l-wach]');
    const satz = JSON.parse((await speicher(seite))[`foodasu-liste-${U2.json.id}`]);
    pruefe((await seite.$eval('[data-l-wach]', (e) => e.getAttribute('aria-checked'))) === 'false' && satz.wach === false, 'ein Tipp schaltet aus, die Wahl bleibt je Liste');
  } else pruefe(!(await sichtbar(seite, '[data-l-wach-zeile]')), 'ohne Screen Wake Lock kein Schalter');
  pruefe(p.fehler.length === 0, `keine Fehler auf der Seite (${p.fehler.join('; ')})`);
  await p.umgebung.close();
}

await browser.close();
console.log(`\nErgebnis: ${zeilen.filter(([gut]) => gut).length} von ${zeilen.length} bestanden${befunde.length ? `, ${befunde.length} Befunde` : ''}`);
process.exit(befunde.length ? 1 : 0);
