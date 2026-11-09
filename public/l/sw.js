// Service Worker der Seite /l/ (AP-112, Vorgabe der Projektleitung vom 08.11.2026, Abschnitt 7): Nach dem ersten Öffnen
// einer Liste geht die Seite auch ohne Netz. Bereich nur /l/ (die Datei liegt unter /l/, angemeldet mit scope /l/);
// /p/ hat keinen (AP-114: die Seite für Profile speichert nichts, Vorgabe 8.1). Gespeichert werden nur die eigenen Dateien der Seite (HTML, Stile, Skripte,
// Schrift, Bilder von foodasu.com), nie etwas aus dem Teil hinter dem #: Er steht in keiner Anfrage, und jede Adresse
// wird vor dem Speichern ohne # geschrieben. Mit Netz kommt immer die aktuelle Fassung vom Server (erst Netz, dann
// Ablage); ohne Netz die abgelegte. Keine Anfragen an Dritte, keine Messung.
const ABLAGE = 'foodasu-l-1';
const SEITE = '/l/';

const ohneTeil = (adresse) => {
  const ziel = new URL(adresse, self.location.href);
  ziel.hash = '';
  return ziel.href;
};
const eigen = (adresse) => new URL(adresse, self.location.href).origin === self.location.origin;

self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(caches.open(ABLAGE).then((ablage) => ablage.add(SEITE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil((async () => {
    for (const name of await caches.keys()) if (name !== ABLAGE && name.startsWith('foodasu-l-')) await caches.delete(name);
    await self.clients.claim();
  })());
});

// Die Seite nennt ihre Dateien (Leistungsdaten des Browsers, nur eigene Adressen); alte Dateien fallen weg.
self.addEventListener('message', (ereignis) => {
  const daten = ereignis.data;
  if (!daten || daten.art !== 'merken' || !Array.isArray(daten.dateien)) return;
  const dateien = [...new Set(daten.dateien.filter((adresse) => typeof adresse === 'string' && eigen(adresse)).map(ohneTeil))];
  ereignis.waitUntil((async () => {
    const ablage = await caches.open(ABLAGE);
    for (const adresse of dateien) {
      if (adresse.endsWith('/l/sw.js')) continue;
      try {
        const antwort = await fetch(adresse, { cache: 'no-cache' });
        if (antwort.ok) await ablage.put(adresse, antwort);
      } catch { /* ohne Netz bleibt die abgelegte Fassung */ }
    }
    const behalten = new Set([...dateien, ohneTeil(SEITE)]);
    for (const anfrage of await ablage.keys()) if (!behalten.has(ohneTeil(anfrage.url))) await ablage.delete(anfrage);
  })());
});

self.addEventListener('fetch', (ereignis) => {
  const anfrage = ereignis.request;
  if (anfrage.method !== 'GET' || !eigen(anfrage.url)) return;
  // Jede Seite unter /l/ ist dieselbe Datei; der Teil hinter dem # bleibt im Browser.
  const schluessel = anfrage.mode === 'navigate' ? ohneTeil(SEITE) : ohneTeil(anfrage.url);
  ereignis.respondWith((async () => {
    const ablage = await caches.open(ABLAGE);
    try {
      const antwort = await fetch(anfrage);
      if (antwort.ok && antwort.type === 'basic' && (anfrage.mode === 'navigate' || (await ablage.match(schluessel)))) {
        await ablage.put(schluessel, antwort.clone());
      }
      return antwort;
    } catch (fehler) {
      const abgelegt = await ablage.match(schluessel);
      if (abgelegt) return abgelegt;
      throw fehler;
    }
  })());
});
