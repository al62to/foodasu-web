// Umschlag beim Teilen (Format 1, App-Repository docs/Teilen_Format.md, Abschnitte 1 und 3): Kennungen, Grenzen, Lesen
// nach 3.5 und Schreiben in der festen Feldfolge. Im Umschlag stehen Einträge, Häkchen und Notizen in der Kurzform
// (Format 3.2, seit AP-112b: Zeiten als Abstand zu t, Warengruppe als Zahl, Felder mit Standard am Ende weggelassen);
// gelesen ergibt sich die Langform des Stands (13 Felder, feste Zeiten, Gruppe als Name), mit der die Seite rechnet. Dieselben Regeln gelten im Kern der App
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
  notizen: 50,
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

export const KENNUNG_BYTE = Object.freeze({ liste: 12, eintrag: 4, autor: 4, profil: 12 });
const KENNUNG = /^[A-Za-z0-9_-]{4,32}$/;

// Beim Lesen gilt jede Kennung mit 4 bis 32 Zeichen aus base64url (so liest auch eine ältere Fassung längere Kennungen).
export const istKennung = (wert) => typeof wert === 'string' && KENNUNG.test(wert);

// Zufällige Kennung aus der kryptografischen Zufallsquelle des Browsers (crypto.getRandomValues); authorId: 4 Byte = 6 Zeichen.
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
// Ein Zeitpunkt als Abstand zu t (Format 3.2: ganze Sekunden, auch negativ); der Zeitpunkt selbst liegt zwischen 0 und
// 2^53, sonst null (wie timeOrNull im Kern).
const zeitpunkt = (wert, t) => {
  if (typeof wert !== 'number' || !Number.isInteger(wert) || Math.abs(wert) > GROESSTE) return null;
  const zeit = t + wert;
  return zeit >= 0 && zeit <= GROESSTE ? zeit + 0 : null;
};
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

// Weg, auf dem eine Liste geschickt wurde (Feld kw im Umschlag l, freiwillig, AP-122): wa WhatsApp, sms SMS (auch
// iMessage), mail E-Mail, tg Telegram. Ein anderer Wert oder ein fehlendes Feld heißt „kein Weg“; beim Lesen fällt es
// dann weg.
export const WEGE = Object.freeze(['wa', 'sms', 'mail', 'tg']);

// Warengruppen im Umschlag als Zahl (Format 3.2): die Stelle in dieser Liste, fest im Format (Kern ShareJson.GROUPS);
// eine unbekannte Zahl gilt als SONSTIGES.
export const GRUPPEN = Object.freeze(['OBST_GEMUESE', 'BROT_GEBAECK', 'MILCH_KAESE', 'FLEISCH_FISCH', 'VORRAT',
  'GETRAENKE', 'TIEFKUEHL', 'DROGERIE', 'SONSTIGES']);
const SONSTIGES = GRUPPEN.indexOf('SONSTIGES');

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

// Ein Eintrag in der Kurzform (Format 3.2, mindestens 5 Felder; fehlende Felder am Ende haben ihren Standard, weitere
// werden überlesen) als Langform des Stands; null, wenn er wegfällt. Ein gestrichener Eintrag ergibt immer
// [id, "", null, null, "", "SONSTIGES", 0, "g", zeit, von, 0, "", null] (wie ShareEntry.struck im Kern).
export function eintragLesen(wert, t, by) {
  if (!Array.isArray(wert) || wert.length < 5) return null;
  const da = (stelle) => stelle < wert.length;
  const id = kennung(wert[0]);
  const name = text(wert[1]);
  const statusZeit = zeitpunkt(wert[2], t);
  const code = ganz(wert[3]);
  const ordnung = ganz(wert[4]);
  const einheit = da(6) ? textOderNull(wert[6]) : null;
  const status = !da(7) ? STATUS.offen : typeof wert[7] === 'string' && STATUS_ALLE.has(wert[7]) ? wert[7] : null;
  const inhaltZeit = da(8) ? zeitpunkt(wert[8], t) : statusZeit;
  const notiz = da(9) ? text(wert[9]) : '';
  const ean = da(10) ? textOderNull(wert[10]) : null;
  const statusVon = da(11) ? text(wert[11]) : by;
  const inhaltVon = da(12) ? text(wert[12]) : by;
  if (id === null || name === null || statusZeit === null || code === null || ordnung === null || einheit === undefined
    || status === null || inhaltZeit === null || notiz === null || ean === undefined || statusVon === null
    || inhaltVon === null) return null;
  if (status === STATUS.gestrichen) return [id, '', null, null, '', 'SONSTIGES', 0, STATUS.gestrichen, statusZeit, statusVon, 0, '', null];
  if (name === '') return null;
  const gruppe = code < GRUPPEN.length ? GRUPPEN[code] : 'SONSTIGES';
  return [id, kuerzen(name, GRENZEN.text), da(5) ? menge(wert[5]) : null, einheit, kuerzen(notiz, GRENZEN.text), gruppe,
    ordnung, status, statusZeit, statusVon, inhaltZeit, inhaltVon, ean];
}

// Häkchen [entryId, status, zeit - t] als [entryId, status, zeit].
function haekchenLesen(wert, t) {
  if (!Array.isArray(wert) || wert.length < 3) return null;
  const id = kennung(wert[0]);
  const status = typeof wert[1] === 'string' && STATUS_HAEKCHEN.has(wert[1]) ? wert[1] : null;
  const zeit = zeitpunkt(wert[2], t);
  return id === null || status === null || zeit === null ? null : [id, status, zeit];
}

function meidenLesen(wert) {
  if (!Array.isArray(wert) || wert.length < 4) return null;
  const [art, schluessel, stufe] = wert.slice(0, 3).map(text);
  const name = textOderNull(wert[3]);
  return art === null || schluessel === null || stufe === null || name === undefined ? null : [art, schluessel, stufe, name];
}

// Eine Notiz [text, zeit - t, authorId] (ohne Urheber ist es der Absender by) als [text, zeit, authorId]; schief
// heißt null (kein Text, keine gültige Zeit, Urheber kein Text). Der Text wird auf 200 Zeichen gekürzt, weitere Felder
// werden überlesen (wie readNote im Kern).
export function notizLesen(wert, t, by) {
  if (!Array.isArray(wert) || wert.length < 2) return null;
  const inhalt = text(wert[0]);
  const zeit = zeitpunkt(wert[1], t);
  const von = wert.length > 2 ? text(wert[2]) : by;
  return inhalt === null || zeit === null || von === null ? null : [kuerzen(inhalt, GRENZEN.text), zeit, von];
}

// Je Kennung gilt das erste gültige Teilstück (Kennung an der Stelle stelle).
function erstesJeKennung(liste, stelle = 0) {
  const gesehen = new Set();
  return liste.filter((teil) => teil !== null && !gesehen.has(teil[stelle]) && gesehen.add(teil[stelle]));
}

const vergleich = (x, y) => (x < y ? -1 : x > y ? 1 : 0);

// Notizen, eine je Person (Format 3.2 und 3.5, seit AP-114): [[text, zeit - t, authorId?], …] als Liste von
// [text, zeit, authorId], nach authorId geordnet (Vergleich der UTF-16-Zeichen). Keine Liste (auch die alte Form mit
// nur einer Notiz): keine Notizen. Mehr als 50 Teilstücke: null (zu_gross). Schiefe Teilstücke fallen weg, je Urheber
// gilt das erste (wie readNotes im Kern).
export function notizenLesen(wert, t, by) {
  if (!Array.isArray(wert)) return [];
  if (wert.length > GRENZEN.notizen) return null;
  return erstesJeKennung(wert.map((x) => notizLesen(x, t, by)), 2).sort((x, y) => vergleich(x[2], y[2]));
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
    const umschlag = { ...kopf, n: kuerzen(n, GRENZEN.listenName), sv, full, e: erstesJeKennung(e.map((x) => eintragLesen(x, t, by))) };
    const nt = notizenLesen(feld(wurzel, 'nt'), t, by);
    if (nt === null) return ZU_GROSS;
    if (nt.length) umschlag.nt = nt;
    const kw = feld(wurzel, 'kw');
    if (WEGE.includes(kw)) umschlag.kw = kw;
    return { umschlag };
  }
  if (art === 'h') {
    const done = schalter(feld(wurzel, 'done'));
    const s = feld(wurzel, 's');
    if (done === null || !Array.isArray(s)) return KAPUTT;
    if (s.length > GRENZEN.haekchen) return ZU_GROSS;
    const umschlag = { ...kopf, done, s: erstesJeKennung(s.map((x) => haekchenLesen(x, t))) };
    const nt = notizenLesen(feld(wurzel, 'nt'), t, by);
    if (nt === null) return ZU_GROSS;
    if (nt.length) umschlag.nt = nt;
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

// Ein Eintrag der Langform in der Kurzform (Format 3.2, wie entryToJson im Kern): Felder am Ende mit Standard fallen
// weg; ein gestrichener reist nur mit Kennung und Status.
export function eintragKurz(x, t, by) {
  const g = x[7] === STATUS.gestrichen;
  const statusZeit = x[8] - t;
  const code = GRUPPEN.indexOf(g ? 'SONSTIGES' : x[5]);
  const felder = [x[0], g ? '' : x[1], statusZeit, code < 0 ? SONSTIGES : code, g ? 0 : x[6], g ? null : x[2],
    g ? null : x[3], x[7], g ? statusZeit : x[10] - t, g ? '' : x[4], g ? null : x[12], x[9], g ? by : x[11]];
  const standard = [null, null, STATUS.offen, statusZeit, '', null, by, by];
  let laenge = felder.length;
  while (laenge > 5 && felder[laenge - 1] === standard[laenge - 6]) laenge -= 1;
  return felder.slice(0, laenge);
}

// Notizen nach authorId geordnet, die Zeit als Abstand zu t, ohne Urheber, wenn es der Absender ist (Format 3.2).
const notizenKurz = (nt, t, by) => [...nt].sort((x, y) => vergleich(x[2], y[2]))
  .map(([inhalt, zeit, von]) => (von === by ? [inhalt, zeit - t] : [inhalt, zeit - t, von]));

export function umschlagText(u) {
  const kopf = `"v":1,"k":${json(u.k)},"id":${json(u.id)},"t":${json(u.t)},"by":${json(u.by)},"a":${namenText(u.a)},"rev":${json(u.rev)}`;
  const nt = u.nt && u.nt.length ? `,"nt":${listeText(notizenKurz(u.nt, u.t, u.by))}` : '';
  if (u.k === 'l') return `{${kopf},"n":${json(u.n)},"sv":${json(u.sv)},"full":${json(u.full)},"e":${listeText(u.e.map((x) => eintragKurz(x, u.t, u.by)))}${nt}${WEGE.includes(u.kw) ? `,"kw":${json(u.kw)}` : ''}}`;
  if (u.k === 'h') return `{${kopf},"done":${json(u.done)},"s":${listeText(u.s.map(([id, status, zeit]) => [id, status, zeit - u.t]))}${nt}}`;
  return `{${kopf},"n":${json(u.n)},"ic":${json(u.ic)},"m":${listeText(u.m)},"from":${json(u.from)}}`;
}
