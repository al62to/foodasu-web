// Kodierung des Umschlags für den Teil hinter dem # (Format 1, App-Repository docs/Teilen_Format.md, Abschnitt 2):
// <Art><Inhalt>; Art "1" = Umschlag als JSON in UTF-8, raw DEFLATE (RFC 1951), base64url ohne Füllzeichen.
// Entpacken und Packen über DecompressionStream/CompressionStream("deflate-raw"), wo der Browser es kann; sonst über
// die selbst gehostete Bibliothek fflate (MIT), die nur in diesem Fall nachgeladen wird. Reihenfolge der Prüfungen wie
// im Kern (ShareCodec.decode): leer, zu lang, Art, base64url, DEFLATE, Größe, UTF-8, JSON, Umschlag.
import { FEHLER, GRENZEN, base64urlLesen, base64urlSchreiben, umschlagLesen, umschlagText } from './umschlag.mjs';

export const ART_GEPACKT = '1';

// Welcher Weg entpackt und packt: "strom" (DecompressionStream, CompressionStream), "bibliothek" (fflate) oder
// "auto" (strom, wo vorhanden). Die Prüfungen setzen den Weg fest, damit beide Wege dieselben Fälle bestehen.
let vorgabeWeg = 'auto';
export function setzeWeg(weg) {
  if (!['auto', 'strom', 'bibliothek'].includes(weg)) throw new Error(`Unbekannter Weg: ${weg}`);
  vorgabeWeg = weg;
}

// Ob der Browser raw DEFLATE als Strom kann (Chrome ab 103, Safari ab 16.4, Firefox ab 113).
export function stromMoeglich() {
  try {
    if (typeof DecompressionStream !== 'function' || typeof CompressionStream !== 'function') return false;
    new DecompressionStream('deflate-raw');
    new CompressionStream('deflate-raw');
    return true;
  } catch {
    return false;
  }
}

const wegVon = (weg) => {
  const gewaehlt = weg ?? vorgabeWeg;
  return gewaehlt === 'auto' ? (stromMoeglich() ? 'strom' : 'bibliothek') : gewaehlt;
};

// Der zuletzt benutzte Weg (für die Prüfungen im Browser: Hat der Rückfall gegriffen?).
export let letzterWeg = null;

// fflate (MIT, Fassung fest in package.json) als eigene Datei, unverändert aus dem Paket (die kleine Fassung umd/
// index.js): Der Bau legt sie neben die Skripte der Seite (new URL … import.meta.url); geladen wird sie nur auf diesem
// Weg und nur, wenn er gebraucht wird. Im Browser setzt sie self.fflate, in Node ist sie ein CommonJS-Modul
// (default). In Node zeigt dieselbe Adresse auf die Datei im Ordner node_modules.
const FFLATE = new URL('../../../node_modules/fflate/umd/index.js', import.meta.url);
let bibliothek = null;
const fflate = () => (bibliothek ??= import(/* @vite-ignore */ FFLATE.href).then((modul) => modul.default ?? globalThis.fflate));

function verbinden(teile, laenge) {
  const ganz = new Uint8Array(laenge);
  let ort = 0;
  for (const teil of teile) { ganz.set(teil, ort); ort += teil.length; }
  return ganz;
}

// Entpackt raw DEFLATE. Null: kein vollständiger DEFLATE-Strom. Wird es mehr als max Byte, hört das Entpacken auf
// und das Ergebnis ist max + 1 Byte lang (wie im Kern: der Aufrufer meldet "zu groß").
export async function entpacken(bytes, max = GRENZEN.entpacktByte, weg) {
  const art = wegVon(weg);
  letzterWeg = art;
  if (bytes.length === 0) return null;
  if (art === 'strom') {
    const strom = new DecompressionStream('deflate-raw');
    const schreiber = strom.writable.getWriter();
    schreiber.write(bytes).catch(() => {});
    schreiber.close().catch(() => {});
    const leser = strom.readable.getReader();
    const teile = [];
    let laenge = 0;
    try {
      for (;;) {
        const { done, value } = await leser.read();
        if (done) break;
        teile.push(value);
        laenge += value.length;
        if (laenge > max) {
          leser.cancel().catch(() => {});
          return verbinden(teile, laenge).subarray(0, max + 1);
        }
      }
    } catch {
      return null;
    }
    return verbinden(teile, laenge);
  }
  const { Inflate } = await fflate();
  const teile = [];
  let laenge = 0;
  let fertig = false;
  const entpacker = new Inflate((teil, letztes) => {
    teile.push(teil);
    laenge += teil.length;
    if (letztes) fertig = true;
  });
  // In kleinen Stücken, damit das Entpacken wie beim Strom an der Grenze aufhört.
  const STUECK = 1024;
  try {
    for (let ort = 0; ort < bytes.length; ort += STUECK) {
      entpacker.push(bytes.subarray(ort, ort + STUECK), ort + STUECK >= bytes.length);
      if (laenge > max) return verbinden(teile, laenge).subarray(0, max + 1);
    }
  } catch {
    return null;
  }
  return fertig ? verbinden(teile, laenge) : null;
}

// Packt raw DEFLATE (im Browser ohne Wahl der Stufe; Format 2: verbindlich ist nur, dass jede Seite entpackt, was die
// andere gepackt hat).
export async function packen(bytes, weg) {
  const art = wegVon(weg);
  letzterWeg = art;
  if (art === 'strom') {
    const strom = new CompressionStream('deflate-raw');
    const schreiber = strom.writable.getWriter();
    schreiber.write(bytes).catch(() => {});
    schreiber.close().catch(() => {});
    const teile = [];
    let laenge = 0;
    const leser = strom.readable.getReader();
    for (;;) {
      const { done, value } = await leser.read();
      if (done) break;
      teile.push(value);
      laenge += value.length;
    }
    return verbinden(teile, laenge);
  }
  const { deflateSync } = await fflate();
  return deflateSync(bytes, { level: 9 });
}

// Liest eine Kodierung (Teil hinter dem #, ohne #). Ergebnis { umschlag } oder { fehler } (Format 2 und 3.5).
export async function lesen(kodierung, weg) {
  if (typeof kodierung !== 'string' || kodierung.length === 0) return { fehler: FEHLER.kaputt };
  if (kodierung.length > GRENZEN.kodierungZeichen) return { fehler: FEHLER.zuGross };
  if (kodierung[0] !== ART_GEPACKT) return { fehler: FEHLER.neuereVersion };
  const gepackt = base64urlLesen(kodierung.slice(1));
  if (gepackt === null) return { fehler: FEHLER.kaputt };
  let bytes = await entpacken(gepackt, GRENZEN.entpacktByte, weg);
  // Bytes nach dem Ende des DEFLATE-Stroms überliest zlib im Kern (und fflate), DecompressionStream meldet sie als
  // Fehler. Damit die Seite liest, was der Kern liest, versucht sie es dann noch mit fflate (Format 2).
  if (bytes === null && (weg ?? vorgabeWeg) !== 'bibliothek' && letzterWeg === 'strom') bytes = await entpacken(gepackt, GRENZEN.entpacktByte, 'bibliothek');
  if (bytes === null) return { fehler: FEHLER.kaputt };
  if (bytes.length > GRENZEN.entpacktByte) return { fehler: FEHLER.zuGross };
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    return { fehler: FEHLER.kaputt };
  }
  let wert;
  try {
    wert = JSON.parse(text);
  } catch {
    return { fehler: FEHLER.kaputt };
  }
  return umschlagLesen(wert);
}

// Der Umschlag als Kodierung der Art 1.
export async function schreiben(umschlag, weg) {
  const gepackt = await packen(new TextEncoder().encode(umschlagText(umschlag)), weg);
  return ART_GEPACKT + base64urlSchreiben(gepackt);
}
