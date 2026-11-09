// Nachweis im Browser zu „In FoodAsu öffnen“ auf der Seite /l/ (AP-113, Vorgabe „Liste per Link und Profil teilen“
// 6.4), gegen eine laufende Vorschau (npm run preview). Die Links kommen aus den Testfällen tools/teilen/testfaelle.json
// (Umschläge der Arten l und h mit fertiger Kodierung). Geprüft wird:
//   1. Handy, Liste: in der Karte „FoodAsu fürs Handy“ genau ein sichtbarer Link „In FoodAsu öffnen“, sekundärer Knopf
//      (Rand, nicht voll), mindestens 44 px hoch; er führt auf location.href (https-Adresse samt Teil hinter dem #).
//   2. Handy, neuer Link im selben Tab (hashchange): der Knopf führt auf die neue Adresse.
//   3. Handy, Klick ohne App: die Seite bleibt stehen (dieselbe Adresse, Liste weiter da, kein Fehler).
//   4. Handy, Umschlag h: nur der Knopf der kurzen Seite ist zu sehen, auch er mit location.href.
//   5. Handy, ohne # und ohne JavaScript: kein Knopf „In FoodAsu öffnen“ zu sehen.
//   6. Laptop (Maus, ab 56rem): kein Knopf in der Liste; dort steht der QR-Code.
//   7. Android-Browser (AP-114, Kennung mit „Android“): beide Knöpfe führen auf die intent-Adresse
//      intent://foodasu.com/l/#<Kodierung>#Intent;scheme=https;package=at.tonc.einkauf;S.browser_fallback_url=<Seite>;end,
//      auch nach einem neuen Link im selben Tab. Geklickt wird dort nicht (Chrome am Mac kennt keine intent-Adresse).
//   8. Smart App Banner: genau ein <meta name="apple-itunes-app"> mit app-id=6829687240 und app-argument
//      https://foodasu.com/l/#<Kodierung> (vom Skript im Kopf angehängt); ohne # nur https://foodasu.com/l/.
// Aufruf: node tools/liste_oeffnen_pruefen.mjs [Adresse der Vorschau]   (Vorgabe http://localhost:4321)
// Rückgabewert 1, wenn eine Prüfung fehlschlägt.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { chromePfad } from './chrome.mjs';
import { listeTexte } from '../src/daten/liste_seite.mjs';

const BASIS = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');
const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const faelle = JSON.parse(readFileSync(join(wurzel, 'tools', 'teilen', 'testfaelle.json'), 'utf8')).faelle;
const umschlag = (name) => {
  const fall = faelle.find((eintrag) => eintrag.art === 'umschlag' && eintrag.name === name && eintrag.kodierung);
  if (!fall) throw new Error(`Testfall „${name}“ mit Kodierung fehlt in tools/teilen/testfaelle.json`);
  return fall.kodierung;
};
const LISTE = umschlag('Liste neu (Fassung 1)');
const NACHTRAG = umschlag('Nachtrag (neu, geändert, gestrichen)');
const HAEKCHEN = umschlag('Häkchen und Erledigt');
const WORTLAUT = listeTexte.haekchen.oeffnen;

const HANDY = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true };
const LAPTOP = { width: 1440, height: 900, deviceScaleFactor: 1 };

const fehler = [];
const pruefe = (gut, text) => { console.log(`${gut ? 'ok    ' : 'FEHLER'} ${text}`); if (!gut) fehler.push(text); };
const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

const browser = await puppeteer.launch({ executablePath: chromePfad(), headless: true });

const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const intentFuer = (kodierung, href) => `intent://foodasu.com/l/#${kodierung}#Intent;scheme=https;package=at.tonc.einkauf;S.browser_fallback_url=${encodeURIComponent(href)};end`;

async function oeffne(adresse, { ansicht = HANDY, skript = true, kennung = null } = {}) {
  const umgebung = await browser.createBrowserContext();
  const seite = await umgebung.newPage();
  const seitenFehler = [];
  seite.on('pageerror', (f) => seitenFehler.push(f.message));
  if (kennung) await seite.setUserAgent(kennung);
  await seite.setJavaScriptEnabled(skript);
  await seite.setViewport(ansicht);
  await seite.goto(`${BASIS}${adresse}`, { waitUntil: 'networkidle0' });
  if (skript) await seite.waitForSelector('[data-l-seite][data-bereit]', { timeout: 10000 });
  return { seite, umgebung, seitenFehler };
}

// Zustand beider Knöpfe „In FoodAsu öffnen“ und der Seite.
const lage = (seite, wortlaut) => seite.evaluate((wortlaut) => {
  const sichtbar = (e) => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getClientRects().length > 0;
  const beschreibe = (e) => {
    if (!e) return null;
    const rahmen = e.getBoundingClientRect();
    return {
      sichtbar: sichtbar(e), marke: e.tagName, href: e.href, text: e.textContent.trim(),
      rand: e.classList.contains('rand'), voll: e.classList.contains('voll'),
      inKarte: !!e.closest('section.l-app'), hoehe: Math.round(rahmen.height),
    };
  };
  return {
    adresse: location.href,
    computer: matchMedia('(min-width: 56rem) and (hover: hover) and (pointer: fine)').matches,
    liste: sichtbar(document.querySelector('[data-l-liste]')),
    qr: sichtbar(document.querySelector('[data-l-qr]')),
    karte: beschreibe(document.querySelector('[data-l-app-oeffnen]')),
    kurz: beschreibe(document.querySelector('[data-l-hinweis-oeffnen]')),
    sichtbareMitWortlaut: [...document.querySelectorAll('a, button')].filter((e) => sichtbar(e) && e.textContent.trim() === wortlaut).length,
  };
}, wortlaut);

try {
  // 1 bis 3: Handy, Liste
  {
    const { seite, umgebung, seitenFehler } = await oeffne(`/l/#${LISTE}`);
    let l = await lage(seite, WORTLAUT);
    pruefe(!l.computer, `Handy: Ansicht wird nicht als Computer erkannt (computer=${l.computer})`);
    pruefe(l.liste, 'Handy: Liste aus dem Testfall „Liste neu (Fassung 1)“ wird gezeigt');
    pruefe(l.karte?.sichtbar && l.karte.inKarte && l.karte.marke === 'A', `Handy: Knopf „${WORTLAUT}“ sichtbar in der Karte „FoodAsu fürs Handy“ (${JSON.stringify(l.karte)})`);
    pruefe(l.karte?.text === WORTLAUT, `Handy: Wortlaut „${l.karte?.text}“ gleich dem der kurzen Seite „${WORTLAUT}“`);
    pruefe(l.karte?.rand && !l.karte.voll, 'Handy: sekundärer Knopf (knopf rand, nicht voll)');
    pruefe((l.karte?.hoehe ?? 0) >= 44, `Handy: Knopf mindestens 44 px hoch (${l.karte?.hoehe} px)`);
    pruefe(l.karte?.href === l.adresse && l.adresse.endsWith(`/l/#${LISTE}`), `Handy: Knopf führt auf location.href (${l.karte?.href === l.adresse ? 'gleich' : `${l.karte?.href} statt ${l.adresse}`})`);
    pruefe(l.kurz && !l.kurz.sichtbar && l.sichtbareMitWortlaut === 1, `Handy: Knopf der kurzen Seite verborgen, genau ein sichtbarer „${WORTLAUT}“ (${l.sichtbareMitWortlaut})`);

    await seite.evaluate((kodierung) => { location.hash = kodierung; }, NACHTRAG);
    await warte(800);
    l = await lage(seite, WORTLAUT);
    pruefe(l.karte?.sichtbar && l.karte.href === l.adresse && l.adresse.endsWith(`#${NACHTRAG}`), 'Handy: nach einem neuen Link im selben Tab (hashchange) führt der Knopf auf die neue Adresse');

    const vorher = l.adresse;
    await seite.click('[data-l-app-oeffnen]');
    await warte(800);
    l = await lage(seite, WORTLAUT);
    pruefe(l.adresse === vorher && l.liste, 'Handy: Klick ohne installierte App lässt die Seite stehen (dieselbe Adresse, Liste weiter da)');
    pruefe(seitenFehler.length === 0, `Handy: keine Fehler im Skript der Seite (${seitenFehler.join(' | ') || 'keine'})`);
    await umgebung.close();
  }
  // 4: Handy, Umschlag h
  {
    const { seite, umgebung } = await oeffne(`/l/#${HAEKCHEN}`);
    const l = await lage(seite, WORTLAUT);
    pruefe(l.kurz?.sichtbar && l.kurz.href === l.adresse, `Umschlag h: Knopf der kurzen Seite sichtbar und auf location.href (${l.kurz?.href === l.adresse ? 'gleich' : l.kurz?.href})`);
    pruefe(l.karte && !l.karte.sichtbar && l.sichtbareMitWortlaut === 1, `Umschlag h: Knopf in der Karte verborgen, genau ein sichtbarer „${WORTLAUT}“ (${l.sichtbareMitWortlaut})`);
    await umgebung.close();
  }
  // 5: ohne # und ohne JavaScript
  {
    const { seite, umgebung } = await oeffne('/l/');
    const l = await lage(seite, WORTLAUT);
    pruefe(l.sichtbareMitWortlaut === 0, `ohne #: kein Knopf „${WORTLAUT}“ zu sehen (${l.sichtbareMitWortlaut})`);
    await umgebung.close();
  }
  {
    const { seite, umgebung } = await oeffne(`/l/#${LISTE}`, { skript: false });
    const l = await lage(seite, WORTLAUT);
    pruefe(l.sichtbareMitWortlaut === 0 && l.karte && !l.karte.sichtbar, `ohne JavaScript: kein Knopf „${WORTLAUT}“ zu sehen (${l.sichtbareMitWortlaut})`);
    await umgebung.close();
  }
  // 6: Laptop
  {
    const { seite, umgebung } = await oeffne(`/l/#${LISTE}`, { ansicht: LAPTOP });
    const l = await lage(seite, WORTLAUT);
    pruefe(l.computer && l.liste, `Laptop: als Computer erkannt, Liste wird gezeigt (computer=${l.computer})`);
    pruefe(l.karte && !l.karte.sichtbar && l.sichtbareMitWortlaut === 0, `Laptop: kein Knopf „${WORTLAUT}“ in der Liste (${l.sichtbareMitWortlaut})`);
    pruefe(l.qr, 'Laptop: QR-Code in der Karte zur App');
    await umgebung.close();
  }
  // 7: Android-Browser
  {
    const { seite, umgebung, seitenFehler } = await oeffne(`/l/#${LISTE}`, { kennung: ANDROID_UA });
    let l = await lage(seite, WORTLAUT);
    pruefe(l.karte?.sichtbar && l.karte.href === intentFuer(LISTE, l.adresse), `Android: Knopf in der Karte führt auf die intent-Adresse (${l.karte?.href?.slice(0, 90)} …)`);
    await seite.evaluate((kodierung) => { location.hash = kodierung; }, NACHTRAG);
    await warte(800);
    l = await lage(seite, WORTLAUT);
    pruefe(l.karte?.href === intentFuer(NACHTRAG, l.adresse), 'Android: nach einem neuen Link im selben Tab die intent-Adresse mit der neuen Kodierung');
    pruefe(seitenFehler.length === 0, `Android: keine Fehler im Skript der Seite (${seitenFehler.join(' | ') || 'keine'})`);
    await umgebung.close();
  }
  {
    const { seite, umgebung } = await oeffne(`/l/#${HAEKCHEN}`, { kennung: ANDROID_UA });
    const l = await lage(seite, WORTLAUT);
    pruefe(l.kurz?.sichtbar && l.kurz.href === intentFuer(HAEKCHEN, l.adresse), 'Android, Umschlag h: Knopf der kurzen Seite führt auf die intent-Adresse');
    await umgebung.close();
  }
  // 8: Smart App Banner
  for (const [name, adresse, soll] of [['mit #', `/l/#${LISTE}`, `app-id=6829687240, app-argument=https://foodasu.com/l/#${LISTE}`], ['ohne #', '/l/', 'app-id=6829687240, app-argument=https://foodasu.com/l/']]) {
    const { seite, umgebung } = await oeffne(adresse);
    const inhalte = await seite.$$eval('head meta[name="apple-itunes-app"]', (m) => m.map((e) => e.getAttribute('content')));
    pruefe(inhalte.length === 1 && inhalte[0] === soll, `Smart App Banner ${name}: ${JSON.stringify(inhalte)}`);
    await umgebung.close();
  }
} finally {
  await browser.close();
}

console.log(fehler.length ? `\n${fehler.length} Prüfungen fehlgeschlagen` : '\nAlle Prüfungen bestanden');
process.exit(fehler.length ? 1 : 0);
