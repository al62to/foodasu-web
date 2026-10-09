// Prüft alle Links der gebauten Website, die nach außen führen: Jede Adresse wird einmal abgerufen. Interne Links
// prüft tools/pruefe_seiten.mjs. Läuft nicht im Bau (braucht das Netz), sondern vor einer Veröffentlichung.
// Aufruf: node tools/links_pruefen.mjs [Protokolldatei]
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const EIGEN = 'https://foodasu.com';
const ziele = new Map();
(function lauf(ordner) {
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) lauf(pfad);
    else if (pfad.endsWith('.html')) {
      for (const [, ziel] of readFileSync(pfad, 'utf8').matchAll(/<a\b[^>]*?href="(https?:\/\/[^"]+)"/g)) {
        const adresse = ziel.replaceAll('&amp;', '&');
        if (adresse.startsWith(EIGEN)) continue;
        if (!ziele.has(adresse)) ziele.set(adresse, pfad.slice(DIST.length).replaceAll('\\', '/'));
      }
    }
  }
})(DIST);

const KOPF = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 foodasu.com Linkpruefung', accept: 'text/html,*/*' };
async function rufe(adresse) {
  for (const versuch of [1, 2]) {
    try {
      const antwort = await fetch(adresse, { headers: KOPF, redirect: 'follow', signal: AbortSignal.timeout(25000) });
      await antwort.body?.cancel();
      if (antwort.status < 500 || versuch === 2) return antwort.status;
    } catch (fehler) {
      if (versuch === 2) return `kein Abruf (${fehler.cause?.code ?? fehler.name})`;
    }
    await new Promise((weiter) => setTimeout(weiter, 1500));
  }
}

// Höchstens vier Abrufe zugleich und je Rechner nacheinander, damit kein Dienst mit Anfragen überhäuft wird.
const jeRechner = new Map();
for (const adresse of ziele.keys()) {
  const rechner = new URL(adresse).host;
  jeRechner.set(rechner, [...(jeRechner.get(rechner) ?? []), adresse]);
}
const ergebnis = new Map();
const schlangen = [...jeRechner.values()];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let schlange = schlangen.pop(); schlange; schlange = schlangen.pop()) {
    for (const adresse of schlange) {
      ergebnis.set(adresse, await rufe(adresse));
      await new Promise((weiter) => setTimeout(weiter, 250));
    }
  }
}));

const zeilen = [];
let offen = 0;
for (const [adresse, stand] of [...ergebnis].sort((a, b) => String(a[1]).localeCompare(String(b[1])) || a[0].localeCompare(b[0]))) {
  const gut = stand === 200;
  if (!gut) offen++;
  zeilen.push(`${gut ? 'ok    ' : 'PRÜFEN'} ${stand} ${adresse} (zuerst auf ${ziele.get(adresse)})`);
}
zeilen.push('', `${ergebnis.size} Adressen auf ${jeRechner.size} Rechnern, davon ${ergebnis.size - offen} mit Status 200, ${offen} zu prüfen`);
for (const zeile of zeilen.filter((zeile) => !zeile.startsWith('ok'))) console.log(zeile);
if (process.argv[2]) writeFileSync(process.argv[2], zeilen.join('\n') + '\n', 'utf8');
