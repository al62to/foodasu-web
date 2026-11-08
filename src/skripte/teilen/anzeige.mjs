// Anzeige einer geteilten Liste wie in der App: Menge vor dem Namen (App: ListQuantities.label, ListUnits.display und
// wording), Reihenfolge der Einträge (App: ShoppingListUiState, ListGroups) und "Stand 18:25". Die Warengruppen, ihre
// Namen und die Einheiten kommen aus src/daten/teilen_app.json (erzeugt aus der App, nie von Hand). Reines ES-Modul.
import { F } from './zusammenfuehren.mjs';
import { STATUS } from './umschlag.mjs';

// ---- Zahlen genau wie in der App (ExactDecimal: kürzeste Schreibweise, kaufmännisch gerundet) -----------------

// Eine Dezimalzahl als { ziffern (BigInt, ohne Vorzeichen), stellen } mit Wert ziffern / 10^stellen.
function kuerzeste(zahl) {
  const [mantisse, exponent = '0'] = String(zahl).split('e');
  const [ganz, bruch = ''] = mantisse.split('.');
  let stellen = bruch.length - Number(exponent);
  let ziffern = BigInt(ganz + bruch);
  if (stellen < 0) { ziffern *= 10n ** BigInt(-stellen); stellen = 0; }
  return { ziffern, stellen };
}

// Genauer Wert einer Gleitkommazahl (> 0): Mantisse mal Zweierpotenz, als Dezimalzahl ohne Rundung.
function genau(zahl) {
  const ansicht = new DataView(new ArrayBuffer(8));
  ansicht.setFloat64(0, zahl);
  const hoch = ansicht.getUint32(0);
  const tief = ansicht.getUint32(4);
  const exponentRoh = (hoch >>> 20) & 0x7ff;
  let mantisse = (BigInt(hoch & 0xfffff) << 32n) | BigInt(tief);
  let exponent;
  if (exponentRoh === 0) exponent = -1074;
  else { mantisse |= 1n << 52n; exponent = exponentRoh - 1075; }
  if (exponent >= 0) return { ziffern: mantisse << BigInt(exponent), stellen: 0 };
  return { ziffern: mantisse * 5n ** BigInt(-exponent), stellen: -exponent };
}

// Kaufmännisch (HALF_UP) auf höchstens stellen Nachkommastellen.
function runden({ ziffern, stellen }, ziel) {
  if (stellen <= ziel) return { ziffern, stellen };
  const teiler = 10n ** BigInt(stellen - ziel);
  let rest = ziffern % teiler;
  let neu = ziffern / teiler;
  if (rest * 2n >= teiler) neu += 1n;
  return { ziffern: neu, stellen: ziel };
}

const alsZahl = ({ ziffern, stellen }) => Number(`${ziffern}e-${stellen}`);

// Ohne Nullen am Ende, mit Komma.
function schreibweise({ ziffern, stellen }) {
  let text = ziffern.toString().padStart(stellen + 1, '0');
  if (stellen === 0) return text;
  let ganz = text.slice(0, -stellen);
  let bruch = text.slice(-stellen).replace(/0+$/, '');
  return bruch ? `${ganz},${bruch}` : ganz;
}

// App: ListUnits.clean (Rechenreste weg: genauer Wert, kaufmännisch auf sechs Stellen).
const sauber = (zahl) => alsZahl(runden(genau(zahl), 6));

// App: ListQuantities.format: höchstens drei Nachkommastellen, eine positive Menge nie 0 (kleinster Wert 0,001).
export function zahlText(zahl) {
  const gerundet = runden(kuerzeste(zahl), 3);
  if (gerundet.ziffern === 0n && zahl > 0) return '0,001';
  return schreibweise(gerundet);
}

// Menge und Einheit vor dem Namen ("3", "500 g", "1,5 kg", "2 Dosen"); null ohne Menge. Ab 1000 g als kg, ab 1000 ml
// als l; bei Menge über 1 die Mehrzahl der Einheit; eine unbekannte Einheit bleibt, wie sie ist. Zwischen Zahl und
// Einheit ein geschütztes Leerzeichen (wie im Rezeptpaket der App).
export function mengeText(menge, einheit, app) {
  if (typeof menge !== 'number' || !Number.isFinite(menge) || menge <= 0) return null;
  let zahl = menge;
  let einheitJetzt = einheit;
  const gross = (app.grosseEinheiten ?? []).find((regel) => regel.von === einheit);
  if (gross && menge >= gross.ab) { zahl = sauber(menge / gross.ab); einheitJetzt = gross.nach; }
  const text = zahlText(zahl);
  if (einheitJetzt === null || einheitJetzt === undefined || einheitJetzt === '') return text;
  const formen = Object.prototype.hasOwnProperty.call(app.einheiten, einheitJetzt) ? app.einheiten[einheitJetzt] : null;
  const wort = formen ? (zahl > 1 ? formen[1] : formen[0]) : einheitJetzt;
  return `${text}\u00a0${wort}`;
}

// ---- Reihenfolge wie in der App ---------------------------------------------------------------------------------

const vergleich = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
const nachOrdnung = (x, y) => x[F.ordnung] - y[F.ordnung] || vergleich(x[F.id], y[F.id]);
// Erledigtes: zuletzt erledigt zuerst, dann Kennung (App: DONE_ORDER).
const nachErledigt = (x, y) => y[F.statusZeit] - x[F.statusZeit] || vergleich(x[F.id], y[F.id]);

// Teilt die Einträge eines Stands für die Seite auf: offen (o und x, auch gestrichene g an ihrer Stelle) nach
// Warengruppen (sv 0, Reihenfolge aus teilen_app.json, unbekannte Gruppe = SONSTIGES, in der Gruppe nach ordnung) oder
// als einfache Liste (sv 1, nach ordnung), Erledigtes (d) für sich.
export function ordnen(stand, app) {
  const bekannt = new Set(app.warengruppen.map((gruppe) => gruppe.kennung));
  const gruppeVon = (eintrag) => (bekannt.has(eintrag[F.gruppe]) ? eintrag[F.gruppe] : 'SONSTIGES');
  const offen = stand.e.filter((eintrag) => eintrag[F.status] !== STATUS.erledigt).sort(nachOrdnung);
  const erledigt = stand.e.filter((eintrag) => eintrag[F.status] === STATUS.erledigt).sort(nachErledigt);
  const gruppen = stand.sv === 1
    ? [{ kennung: null, name: null, eintraege: offen }]
    : app.warengruppen
      .map((gruppe) => ({ kennung: gruppe.kennung, name: gruppe.name, eintraege: offen.filter((eintrag) => gruppeVon(eintrag) === gruppe.kennung) }))
      .filter((gruppe) => gruppe.eintraege.length > 0);
  return { gruppen, erledigt };
}

// ---- Zeit ----------------------------------------------------------------------------------------------------

// "18:25" am selben Tag, sonst "7. November, 18:25" (in einem anderen Jahr mit Jahr). Zeiten in Sekunden.
export function standZeit(sekunden, jetztMs = Date.now(), zone) {
  const datum = new Date(sekunden * 1000);
  const heute = new Date(jetztMs);
  const optionen = zone ? { timeZone: zone } : {};
  const uhr = new Intl.DateTimeFormat('de', { ...optionen, hour: '2-digit', minute: '2-digit' }).format(datum);
  const tag = (wert) => new Intl.DateTimeFormat('de', { ...optionen, year: 'numeric', month: '2-digit', day: '2-digit' }).format(wert);
  if (tag(datum) === tag(heute)) return uhr;
  const jahr = new Intl.DateTimeFormat('de', { ...optionen, year: 'numeric' });
  const mitJahr = jahr.format(datum) !== jahr.format(heute);
  const datumText = new Intl.DateTimeFormat('de', { ...optionen, day: 'numeric', month: 'long', ...(mitJahr ? { year: 'numeric' } : {}) }).format(datum);
  return `${datumText}, ${uhr}`;
}
