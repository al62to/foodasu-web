// Prüflogik für den JavaScript-Kern der Seite /l/ mit den gemeinsamen Testfällen von App und Website (Aufbau in
// docs/Teilen_Format.md der App, Abschnitt 8). Reines ES-Modul ohne Node-Module: läuft in Node
// (tools/teilen_pruefen.mjs, npm run pruefen) und im Browser (tools/teilen_browser.mjs). Alle Fälle außer der Art
// "liste" und "uebernehmen" (nur Kern), jeder einmal mit DecompressionStream/CompressionStream und einmal mit fflate.
import { lesen, schreiben, setzeWeg, letzterWeg, stromMoeglich } from '../../src/skripte/teilen/kodierung.mjs';
import { umschlagLesen, umschlagText, neueKennung, istKennung, KENNUNG_BYTE, base64urlLesen, base64urlSchreiben } from '../../src/skripte/teilen/umschlag.mjs';
import { aufraeumen, haekchen, profilVergleich, zusammenfuehren } from '../../src/skripte/teilen/zusammenfuehren.mjs';
import { mengeText, ordnen } from '../../src/skripte/teilen/anzeige.mjs';

// Gleich nach Inhalt: Reihenfolge der Felder eines Objekts zählt nicht, die einer Liste schon.
export function gleich(x, y) {
  if (x === y) return true;
  if (typeof x !== typeof y || x === null || y === null || typeof x !== 'object') return false;
  if (Array.isArray(x) !== Array.isArray(y)) return false;
  if (Array.isArray(x)) return x.length === y.length && x.every((wert, nummer) => gleich(wert, y[nummer]));
  const schluesselX = Object.keys(x).sort();
  const schluesselY = Object.keys(y).sort();
  return gleich(schluesselX, schluesselY) && schluesselX.every((schluessel) => gleich(x[schluessel], y[schluessel]));
}

// Stand: Einträge als Menge nach entryId (Format 4: die Reihenfolge zählt beim Vergleich nicht).
const standGleich = (x, y) => {
  if (x === null || y === null) return x === y;
  const ordne = (stand) => ({ ...stand, e: [...stand.e].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)) });
  return gleich(ordne(x), ordne(y));
};

const kurz = (wert) => { const text = JSON.stringify(wert); return text.length > 400 ? `${text.slice(0, 400)} …` : text; };
// Ein gelesener Umschlag so, wie die Seite ihn schreibt (Kurzform, Format 3.2), als JSON zum Vergleich mit dem Fall.
const draht = (umschlag) => (umschlag ? JSON.parse(umschlagText(umschlag)) : null);

async function pruefeFall(fall, weg, befunde, app) {
  const melde = (text) => befunde.push(`${weg}: ${fall.art} „${fall.name}“: ${text}`);
  if (fall.art === 'umschlag') {
    const gelesen = await lesen(fall.kodierung, weg);
    if (!gelesen.umschlag || !gleich(draht(gelesen.umschlag), fall.json)) return melde(`Entpacken ergibt ${kurz(gelesen)}`);
    if (umschlagText(gelesen.umschlag) !== fall.text) melde(`als Text ${umschlagText(gelesen.umschlag)}, erwartet ${fall.text}`);
    // Eigener Rundlauf: packen und wieder entpacken (Byte für Byte gleich packt nur der Kern auf der JVM).
    const neu = await schreiben(gelesen.umschlag, weg);
    const zurueck = await lesen(neu, weg);
    if (!gleich(draht(zurueck.umschlag), fall.json)) melde(`Rundlauf packen/entpacken ergibt ${kurz(zurueck)}`);
    return;
  }
  if (fall.art === 'lesen') {
    const gelesen = await lesen(fall.kodierung, weg);
    if (fall.erwartet.fehler) {
      if (gelesen.fehler !== fall.erwartet.fehler) melde(`Fehler ${fall.erwartet.fehler} erwartet, gefunden ${kurz(gelesen)}`);
    } else if (!gleich(draht(gelesen.umschlag), fall.erwartet.json)) melde(`erwartet ${kurz(fall.erwartet.json)}, gefunden ${kurz(gelesen)}`);
    return;
  }
  if (fall.art === 'zusammenfuehren') {
    let stand = fall.stand;
    for (const [nummer, schritt] of fall.schritte.entries()) {
      const gelesen = umschlagLesen(schritt.umschlag);
      if (!gelesen.umschlag) return melde(`Schritt ${nummer + 1}: Umschlag nicht lesbar (${gelesen.fehler})`);
      const aus = zusammenfuehren(stand, gelesen.umschlag);
      if (schritt.fehler) {
        if (aus.fehler !== schritt.fehler) return melde(`Schritt ${nummer + 1}: Fehler ${schritt.fehler} erwartet, gefunden ${kurz(aus.fehler ?? aus.ergebnis)}`);
        continue;
      }
      if (aus.fehler) return melde(`Schritt ${nummer + 1}: unerwarteter Fehler ${aus.fehler}`);
      if (!gleich(aus.ergebnis, schritt.ergebnis)) melde(`Schritt ${nummer + 1}: Ergebnis ${kurz(aus.ergebnis)}, erwartet ${kurz(schritt.ergebnis)}`);
      stand = aus.stand;
    }
    if (!standGleich(stand, fall.erwartet)) melde(`Stand ${kurz(stand)}, erwartet ${kurz(fall.erwartet)}`);
    return;
  }
  if (fall.art === 'aufraeumen') {
    const stand = aufraeumen(fall.stand, fall.jetzt);
    if (!standGleich(stand, fall.erwartet)) melde(`Stand ${kurz(stand)}, erwartet ${kurz(fall.erwartet)}`);
    return;
  }
  if (fall.art === 'haekchen') {
    const umschlag = haekchen(fall.stand, fall.ich, fall.name_ich, fall.jetzt);
    if (!gleich(draht(umschlag), fall.erwartet)) return melde(`Umschlag ${kurz(draht(umschlag))}, erwartet ${kurz(fall.erwartet)}`);
    // Den gebauten Umschlag packt die Seite und liest ihn selbst wieder (wie es die App mit dem Link tut).
    const zurueck = await lesen(await schreiben(umschlag, weg), weg);
    if (!gleich(draht(zurueck.umschlag), fall.erwartet)) melde(`Rundlauf ergibt ${kurz(zurueck)}`);
    return;
  }
  if (fall.art === 'profil') {
    const gelesen = umschlagLesen(fall.umschlag);
    if (!gelesen.umschlag) return melde(`Umschlag nicht lesbar (${gelesen.fehler})`);
    const ergebnis = profilVergleich(fall.vorhanden, gelesen.umschlag);
    if (ergebnis !== fall.erwartet) melde(`${ergebnis}, erwartet ${fall.erwartet}`);
    return;
  }
  if (fall.art === 'reihenfolge') {
    // Reihenfolge in der Gruppe wie in der App (Schlüssel des Namens, dann ordnung); "app" nennt eine bekannte
    // Abweichung durch das Lexikon der App, die Seite zeigt "erwartet".
    const { gruppen } = ordnen({ sv: 0, e: fall.eintraege }, app);
    const ist = gruppen.map((gruppe) => [gruppe.kennung, gruppe.eintraege.map((eintrag) => eintrag[0])]);
    if (!gleich(ist, fall.erwartet)) melde(`Reihenfolge ${kurz(ist)}, erwartet ${kurz(fall.erwartet)}`);
    return;
  }
  melde('unbekannte Art');
}

// Prüft alle Fälle auf beiden Wegen; Ergebnis { zahlen: {weg: {art: [bestanden, gesamt]}}, befunde }.
export async function pruefeTestfaelle(daten, app) {
  const befunde = [];
  const zahlen = {};
  if (daten.format !== 1 || !Array.isArray(daten.faelle)) befunde.push('Testfälle: Format 1 mit Liste "faelle" erwartet');
  if (!stromMoeglich()) befunde.push('Node kann DecompressionStream("deflate-raw") nicht (Node 21.2 oder neuer nötig)');
  // "liste" und "uebernehmen" gelten nur für den Kern der App (Schicken, Übernehmen in eine Liste).
  const faelle = (daten.faelle ?? []).filter((fall) => fall.art !== 'liste' && fall.art !== 'uebernehmen');
  for (const weg of ['strom', 'bibliothek']) {
    setzeWeg(weg);
    zahlen[weg] = {};
    for (const fall of faelle) {
      const vorher = befunde.length;
      await pruefeFall(fall, weg, befunde, app);
      const zeile = (zahlen[weg][fall.art] ??= [0, 0]);
      zeile[1] += 1;
      if (befunde.length === vorher) zeile[0] += 1;
    }
    if (letzterWeg !== weg) befunde.push(`${weg}: Entpackt wurde über „${letzterWeg}“`);
  }
  setzeWeg('auto');
  // Bytes nach dem Ende des DEFLATE-Stroms: Der Kern (zlib) überliest sie; die Seite (ohne festen Weg) auch.
  {
    const liste = (daten.faelle ?? []).find((fall) => fall.art === 'umschlag' && fall.json?.k === 'l');
    if (liste) {
      const roh = base64urlLesen(liste.kodierung.slice(1));
      const mitRest = '1' + base64urlSchreiben(new Uint8Array([...roh, 1, 2, 3]));
      const gelesen = await lesen(mitRest);
      if (!gleich(draht(gelesen.umschlag), liste.json)) befunde.push(`auto: Bytes nach dem Ende des DEFLATE-Stroms ergeben ${kurz(gelesen)}`);
    }
  }
  // Kennungen aus der kryptografischen Zufallsquelle: Länge nach Format 1, gültig, verschieden.
  const autoren = Array.from({ length: 200 }, () => neueKennung(KENNUNG_BYTE.autor));
  if (!autoren.every((id) => id.length === 6 && istKennung(id)) || new Set(autoren).size < 199) befunde.push('Kennungen: authorId nicht 6 Zeichen oder nicht zufällig');
  if (neueKennung(KENNUNG_BYTE.liste).length !== 16 || neueKennung(KENNUNG_BYTE.eintrag).length !== 6) befunde.push('Kennungen: listId 16, entryId 6 Zeichen erwartet');
  // Anzeige der Menge wie in der App (Beispiele aus den Kommentaren von ListQuantities und ListUnits der App).
  const MENGEN = [
    [3, null, '3'], [1.5, null, '1,5'], [0.25, null, '0,25'], [0.125, 'l', '0,125 l'], [500, 'g', '500 g'],
    [1500, 'g', '1,5 kg'], [1125, 'g', '1,125 kg'], [1000, 'ml', '1 l'], [999, 'ml', '999 ml'], [2, 'Dose', '2 Dosen'],
    [1, 'Dose', '1 Dose'], [3, 'Zehe', '3 Zehen'], [2, 'Glas', '2 Gläser'], [2, 'EL', '2 EL'], [0.5, 'kg', '0,5 kg'],
    [0.0001, null, '0,001'], [1.0005, null, '1,001'], [0.30000000000000004, null, '0,3'], [2, 'Msp.', '2 Msp.'],
    [2, 'Unbekannt', '2 Unbekannt'], [null, 'g', null], [0, null, null], [-1, null, null], [12.3456, 'kg', '12,346 kg'],
  ];
  for (const [menge, einheit, soll] of MENGEN) {
    const ist = mengeText(menge, einheit, app)?.replace('\u00a0', ' ') ?? null;
    if (ist !== soll) befunde.push(`Anzeige: Menge ${menge} ${einheit ?? ''} als „${ist}“, erwartet „${soll}“`);
  }
  zahlen.anzeige = MENGEN.length;
  return { zahlen, befunde, uebersprungen: (daten.faelle ?? []).length - faelle.length };
}

