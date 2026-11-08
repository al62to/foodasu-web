// Umschlag beim Teilen (Format 1, App-Repository docs/Teilen_Format.md, Abschnitte 1 und 3): Kennungen, Grenzen, Lesen
// nach 3.5 und Schreiben in der festen Feldfolge. Dieselben Regeln gelten im Kern der App
// (kern/src/commonMain/kotlin/at/tonc/einkauf/teilen/ShareJson.kt); beide prüfen dieselben Testfälle
// (tools/teilen/testfaelle.json, Prüfung tools/teilen_pruefen.mjs). Reines ES-Modul ohne DOM: läuft im Browser und in
// Node. Es gibt kein Feld und keine Regel, die es nur für den Link oder nur für diese Seite gibt.

// Grenzen (Format 2, 3.5 und 4; Kern ShareLimits.kt).
export const GRENZEN = Object.freeze({
  kodierungZeichen: 8192,
  entpacktByte: 65536,
  eintraege: 200,
  haekchen: 400,
  meiden: 500,
  name: 40,
  listenName: 60,
  text: 200,
  grabsteinTage: 30,
  qrZeichen: 1200,
  tag: 86400,
});

// Fehler beim Lesen, mit den Wörtern der Testfälle.
export const FEHLER = Object.freeze({ neuereVersion: 'neuere_version', kaputt: 'kaputt', zuGross: 'zu_gross' });
const KAPUTT = Object.freeze({ fehler: FEHLER.kaputt });
const NEUER = Object.freeze({ fehler: FEHLER.neuereVersion });
const ZU_GROSS = Object.freeze({ fehler: FEHLER.zuGross });

// ---- base64url ohne Füllzeichen (RFC 4648, Abschnitt 5) --------------------------------------------------------

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const WERT = new Map([...ALPHABET].map((zeichen, nummer) => [zeichen, nummer]));

export function base64urlSchreiben(bytes) {
  let aus = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    aus += ALPHABET[(n >> 18) & 63] + ALPHABET[(n >> 12) & 63];
    if (i + 1 < bytes.length) aus += ALPHABET[(n >> 6) & 63];
    if (i + 2 < bytes.length) aus += ALPHABET[n & 63];
  }
  return aus;
}

// Streng wie der Kern (kotlin.io.encoding.Base64, ohne Füllzeichen): nur Zeichen aus dem Alphabet, keine Länge mit
// Rest 1, die übrigen Bits am Ende müssen 0 sein. Null heißt: kein base64url.
export function base64urlLesen(text) {
  if (typeof text !== 'string' || text.length % 4 === 1) return null;
  const bytes = new Uint8Array(Math.floor((text.length * 3) / 4));
  let ort = 0;
  for (let i = 0; i < text.length; i += 4) {
    const stueck = text.slice(i, i + 4);
    let n = 0;
    for (let j = 0; j < 4; j++) {
      if (j < stueck.length) {
        const wert = WERT.get(stueck[j]);
        if (wert === undefined) return null;
        n = (n << 6) | wert;
      } else n <<= 6;
    }
    if (stueck.length === 2 && (n & 0xffff) !== 0) return null;
    if (stueck.length === 3 && (n & 0xff) !== 0) return null;
    bytes[ort++] = (n >> 16) & 255;
    if (stueck.length > 2) bytes[ort++] = (n >> 8) & 255;
    if (stueck.length > 3) bytes[ort++] = n & 255;
  }
  return bytes;
}

// ---- Kennungen (Format 1) ---------------------------------------------------------------------------------------

export const KENNUNG_BYTE = Object.freeze({ liste: 12, eintrag: 6, autor: 4, profil: 12 });
const KENNUNG = /^[A-Za-z0-9_-]{4,32}$/;

// Beim Lesen gilt jede Kennung mit 4 bis 32 Zeichen aus base64url (vorwärts verträglich).
export const istKennung = (wert) => typeof wert === 'string' && KENNUNG.test(wert);

// Zufällige Kennung aus der sicheren Zufallsquelle des Browsers (crypto.getRandomValues); authorId: 4 Byte = 6 Zeichen.
export function neueKennung(byte) {
  const zufall = new Uint8Array(byte);
  globalThis.crypto.getRandomValues(zufall);
  return base64urlSchreiben(zufall);
}

// ---- Hilfen ---------------------------------------------------------------------------------------------------

// Objekte mit Kennungen als Schlüssel ("a", "g"): Eine Kennung wie "__proto__" ist gültig (9 Zeichen aus dem
// Alphabet); deshalb wird nie mit obj[k] = v geschrieben, sondern als eigene Eigenschaft angelegt.
export function setze(objekt, schluessel, wert) {
  Object.defineProperty(objekt, schluessel, { value: wert, writable: true, enumerable: true, configurable: true });
  return objekt;
}
export const hat = (objekt, schluessel) => Object.prototype.hasOwnProperty.call(objekt, schluessel);
const feld = (objekt, name) => (hat(objekt, name) ? objekt[name] : undefined);
export const istObjekt = (wert) => typeof wert === 'object' && wert !== null && !Array.isArray(wert);

// Eine ganze Zahl zwischen 0 und 2^53 (auch als 5.0 geschrieben), sonst null (Format 3.5).
const GROESSTE = 2 ** 53;
export const ganz = (wert) => (typeof wert === 'number' && Number.isInteger(wert) && wert >= 0 && wert <= GROESSTE ? wert + 0 : null);
const schalter = (wert) => { const zahl = ganz(wert); return zahl === 0 || zahl === 1 ? zahl : null; };
const text = (wert) => (typeof wert === 'string' ? wert : null);
// Text oder null: undefined heißt "falscher Typ".
const textOderNull = (wert) => (wert === null ? null : typeof wert === 'string' ? wert : undefined);
const kennung = (wert) => (istKennung(wert) ? wert : null);
// Menge: eine endliche Zahl über 0, sonst null (Format 3.5: "wird null", der Eintrag bleibt).
const menge = (wert) => (typeof wert === 'number' && Number.isFinite(wert) && wert > 0 ? wert : null);

// Höchstens max UTF-16-Zeichen; ein dadurch allein stehendes hohes Surrogat am Ende fällt weg (Format 3.5, Kern cut).
export function kuerzen(wert, max) {
  if (wert.length <= max) return wert;
  const kopf = wert.slice(0, max);
  const letztes = kopf.charCodeAt(kopf.length - 1);
  return letztes >= 0xd800 && letztes <= 0xdbff ? kopf.slice(0, -1) : kopf;
}

export const STATUS = Object.freeze({ offen: 'o', erledigt: 'd', nichtBekommen: 'x', gestrichen: 'g' });
const STATUS_ALLE = new Set(['o', 'd', 'x', 'g']);
const STATUS_HAEKCHEN = new Set(['o', 'd', 'x']);
export const ARTEN = Object.freeze({ liste: 'l', haekchen: 'h', profil: 'p' });

// ---- Lesen (Format 3.5) ---------------------------------------------------------------------------------------

// Namen: ein Objekt; Paare mit ungültiger Kennung oder ohne Text fallen weg (wie im Kern). Kein Objekt: null.
function namenLesen(wert) {
  if (!istObjekt(wert)) return null;
  const namen = {};
  for (const [id, name] of Object.entries(wert)) {
    if (!istKennung(id) || typeof name !== 'string') continue;
    setze(namen, id, kuerzen(name, GRENZEN.name));
  }
  return namen;
}

// Ein Eintrag (Liste mit mindestens 13 Feldern, weitere am Ende werden überlesen); null, wenn er wegfällt.
export function eintragLesen(wert) {
  if (!Array.isArray(wert) || wert.length < 13) return null;
  const id = kennung(wert[0]);
  const name = text(wert[1]);
  const einheit = textOderNull(wert[3]);
  const notiz = text(wert[4]);
  const gruppe = text(wert[5]);
  const ordnung = ganz(wert[6]);
  const status = typeof wert[7] === 'string' && STATUS_ALLE.has(wert[7]) ? wert[7] : null;
  const statusZeit = ganz(wert[8]);
  const statusVon = text(wert[9]);
  const inhaltZeit = ganz(wert[10]);
  const inhaltVon = text(wert[11]);
  const ean = textOderNull(wert[12]);
  if (id === null || name === null || einheit === undefined || notiz === null || gruppe === null || ordnung === null
    || status === null || statusZeit === null || statusVon === null || inhaltZeit === null || inhaltVon === null
    || ean === undefined) return null;
  if (name === '' && status !== STATUS.gestrichen) return null;
  return [id, kuerzen(name, GRENZEN.text), menge(wert[2]), einheit, kuerzen(notiz, GRENZEN.text), gruppe, ordnung,
    status, statusZeit, statusVon, inhaltZeit, inhaltVon, ean];
}

function haekchenLesen(wert) {
  if (!Array.isArray(wert) || wert.length < 3) return null;
  const id = kennung(wert[0]);
  const status = typeof wert[1] === 'string' && STATUS_HAEKCHEN.has(wert[1]) ? wert[1] : null;
  const zeit = ganz(wert[2]);
  return id === null || status === null || zeit === null ? null : [id, status, zeit];
}

function meidenLesen(wert) {
  if (!Array.isArray(wert) || wert.length < 4) return null;
  const [art, schluessel, stufe] = wert.slice(0, 3).map(text);
  const name = textOderNull(wert[3]);
  return art === null || schluessel === null || stufe === null || name === undefined ? null : [art, schluessel, stufe, name];
}

// Notiz [text, zeit, authorId] (freiwillig, Nachtrag 09.11.2026): schief oder fehlend heißt keine Notiz (null); der
// Text wird auf 200 Zeichen gekürzt, weitere Felder werden überlesen (wie ShareJson.readNote im Kern).
export function notizLesen(wert) {
  if (!Array.isArray(wert) || wert.length < 3) return null;
  const inhalt = text(wert[0]);
  const zeit = ganz(wert[1]);
  const von = text(wert[2]);
  return inhalt === null || zeit === null || von === null ? null : [kuerzen(inhalt, GRENZEN.text), zeit, von];
}

// Je Kennung gilt das erste gültige Teilstück.
function erstesJeKennung(liste) {
  const gesehen = new Set();
  return liste.filter((teil) => teil !== null && !gesehen.has(teil[0]) && gesehen.add(teil[0]));
}

// Liest einen Umschlag aus dem geparsten JSON. Ergebnis { umschlag } in der Form des JSON (Felder in der
// Reihenfolge des Formats, unbekannte Felder weg) oder { fehler }.
export function umschlagLesen(wurzel) {
  if (!istObjekt(wurzel)) return KAPUTT;
  const version = ganz(feld(wurzel, 'v'));
  if (version === null) return KAPUTT;
  if (version > 1) return NEUER;
  if (version !== 1) return KAPUTT;
  const art = text(feld(wurzel, 'k'));
  if (art === null) return KAPUTT;
  if (art !== 'l' && art !== 'h' && art !== 'p') return NEUER;
  const id = kennung(feld(wurzel, 'id'));
  const t = ganz(feld(wurzel, 't'));
  const by = kennung(feld(wurzel, 'by'));
  const a = namenLesen(feld(wurzel, 'a'));
  const rev = ganz(feld(wurzel, 'rev'));
  if (id === null || t === null || by === null || a === null || rev === null) return KAPUTT;
  const kopf = { v: 1, k: art, id, t, by, a, rev };
  if (art === 'l') {
    if (rev < 1) return KAPUTT;
    const n = text(feld(wurzel, 'n'));
    const sv = schalter(feld(wurzel, 'sv'));
    const full = schalter(feld(wurzel, 'full'));
    const e = feld(wurzel, 'e');
    if (n === null || sv === null || full === null || !Array.isArray(e)) return KAPUTT;
    if (e.length > GRENZEN.eintraege) return ZU_GROSS;
    const umschlag = { ...kopf, n: kuerzen(n, GRENZEN.listenName), sv, full, e: erstesJeKennung(e.map(eintragLesen)) };
    const nt = notizLesen(feld(wurzel, 'nt'));
    if (nt) umschlag.nt = nt;
    return { umschlag };
  }
  if (art === 'h') {
    const done = schalter(feld(wurzel, 'done'));
    const s = feld(wurzel, 's');
    if (done === null || !Array.isArray(s)) return KAPUTT;
    if (s.length > GRENZEN.haekchen) return ZU_GROSS;
    const umschlag = { ...kopf, done, s: erstesJeKennung(s.map(haekchenLesen)) };
    const nt = notizLesen(feld(wurzel, 'nt'));
    if (nt) umschlag.nt = nt;
    return { umschlag };
  }
  if (rev < 1) return KAPUTT;
  const n = text(feld(wurzel, 'n'));
  const ic = text(feld(wurzel, 'ic'));
  const m = feld(wurzel, 'm');
  const from = text(feld(wurzel, 'from'));
  if (n === null || ic === null || !Array.isArray(m) || from === null) return KAPUTT;
  if (m.length > GRENZEN.meiden) return ZU_GROSS;
  return { umschlag: { ...kopf, n: kuerzen(n, GRENZEN.name), ic, m: m.map(meidenLesen).filter((teil) => teil !== null), from: kuerzen(from, GRENZEN.name) } };
}

// ---- Schreiben (Format 3: kompakt, Felder in der Reihenfolge der Tabellen, "a" nach Kennung geordnet) ----------

const json = (wert) => JSON.stringify(wert);
const namenText = (a) => `{${Object.keys(a).sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)).map((id) => `${json(id)}:${json(a[id])}`).join(',')}}`;
const listeText = (liste) => `[${liste.map((teil) => json(teil)).join(',')}]`;

export function umschlagText(u) {
  const kopf = `"v":1,"k":${json(u.k)},"id":${json(u.id)},"t":${json(u.t)},"by":${json(u.by)},"a":${namenText(u.a)},"rev":${json(u.rev)}`;
  const nt = u.nt ? `,"nt":${json(u.nt)}` : '';
  if (u.k === 'l') return `{${kopf},"n":${json(u.n)},"sv":${json(u.sv)},"full":${json(u.full)},"e":${listeText(u.e)}${nt}}`;
  if (u.k === 'h') return `{${kopf},"done":${json(u.done)},"s":${listeText(u.s)}${nt}}`;
  return `{${kopf},"n":${json(u.n)},"ic":${json(u.ic)},"m":${listeText(u.m)},"from":${json(u.from)}}`;
}
