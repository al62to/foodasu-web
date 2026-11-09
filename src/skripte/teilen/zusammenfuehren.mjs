// Stand einer geteilten Liste und Zusammenführen (Format 1, App-Repository docs/Teilen_Format.md, Abschnitte 4 bis 6):
// zusammenfuehren(stand | null, umschlag), aufraeumen(stand, jetzt), haekchen(stand, ich, meinName, jetzt) und der
// Vergleich zweier Profile. Wie im Kern (ShareMerge) hängt das Ergebnis nur von Stand und Umschlag ab, nie von der Uhr
// des Geräts. Der Stand hat die Form aus Abschnitt 4: {id, rev, t, by, n, sv, a, e, g, nt}; Einträge als Liste mit
// den 13 Feldern der Langform, nt als Objekt authorId → [text, zeit] (eine Notiz je Person, seit AP-114; {} ohne
// Notiz). Die Seite /l/ speichert genau diesen Stand (dazu nur ihre eigenen Angaben).
import { GRENZEN, STATUS, hat, istObjekt, setze } from './umschlag.mjs';

// Felder eines Eintrags (Format 3.2).
export const F = Object.freeze({
  id: 0, text: 1, menge: 2, einheit: 3, notiz: 4, gruppe: 5, ordnung: 6, status: 7, statusZeit: 8, statusVon: 9,
  inhaltZeit: 10, inhaltVon: 11, ean: 12,
});
// Inhalt: Felder 1 bis 6 und 12 (mit inhaltZeit, inhaltVon).
const INHALT = [F.text, F.menge, F.einheit, F.notiz, F.gruppe, F.ordnung, F.ean];

export const MERGE_FEHLER = Object.freeze({
  falscheArt: 'falsche_art', andereListe: 'andere_liste', unbekannteListe: 'unbekannte_liste',
});

// Vergleich in der Reihenfolge der UTF-16-Zeichen (wie String.compareTo im Kern).
const vergleich = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
// (Zeit, Kennung) größer als (Zeit, Kennung)?
const neuer = (zeitA, vonA, zeitB, vonB) => zeitA > zeitB || (zeitA === zeitB && vergleich(vonA, vonB) > 0);

function namenKopie(a) {
  const kopie = {};
  for (const id of Object.keys(a)) setze(kopie, id, a[id]);
  return kopie;
}

// Notizen eines Stands: nur Paare authorId → [text, zeit] (wie readStateNotes im Kern); alles andere fällt weg.
function notizenKopie(nt) {
  const kopie = {};
  if (!istObjekt(nt)) return kopie;
  for (const von of Object.keys(nt)) {
    const notiz = nt[von];
    if (Array.isArray(notiz) && typeof notiz[0] === 'string' && Number.isInteger(notiz[1])) setze(kopie, von, [notiz[0], notiz[1]]);
  }
  return kopie;
}

export function standKopie(stand) {
  return {
    id: stand.id, rev: stand.rev, t: stand.t, by: stand.by, n: stand.n, sv: stand.sv,
    a: namenKopie(stand.a), e: stand.e.map((eintrag) => [...eintrag]), g: namenKopie(stand.g),
    nt: notizenKopie(stand.nt),
  };
}

const nachKennung = (e) => [...e].sort((x, y) => vergleich(x[F.id], y[F.id]));

// Gesperrt: Die Kennung hat einen Grabstein, oder der Eintrag im Stand hat Status g (5.4).
const gesperrt = (stand, id, vorhanden) => hat(stand.g, id) || (vorhanden && vorhanden[F.status] === STATUS.gestrichen);

// Ein Ergebnis führt jede Kennung höchstens einmal je Liste (5.7).
function merke(liste, id) {
  if (!liste.includes(id)) liste.push(id);
}

// Namen (5.3): Der Absender setzt seinen Namen; andere kommen nur dazu, wenn ihre Kennung im Stand fehlt.
function namenZusammenfuehren(stand, umschlag) {
  for (const id of Object.keys(umschlag.a)) {
    if (id === umschlag.by || !hat(stand.a, id)) setze(stand.a, id, umschlag.a[id]);
  }
}

// Notizen (5.4a), eine je Person: Hat der Stand von dieser Person keine oder eine mit kleinerer Zeit, gilt die neue
// (gleiche Zeit: die vorhandene bleibt). notiz 1, wenn sich dadurch der Text der Notiz einer Person ändert (eine
// fehlende zählt als leer). Personen ohne Notiz im Umschlag behalten ihre.
function notizZusammenfuehren(stand, umschlag, ergebnis) {
  for (const [text, zeit, von] of umschlag.nt ?? []) {
    const da = hat(stand.nt, von) ? stand.nt[von] : null;
    if (da && zeit <= da[1]) continue;
    if ((da ? da[0] : '') !== text) ergebnis.notiz = 1;
    setze(stand.nt, von, [text, zeit]);
  }
}

// Welche Notiz oben steht (5.4b): für ich die neueste Notiz einer anderen Person (Zeit, bei Gleichstand die größere
// Kennung) als [text, zeit, authorId], nur wenn sie Text hat; sonst null. Die eigene Notiz steht nie oben.
export function obenNotiz(stand, ich) {
  let beste = null;
  const nt = istObjekt(stand?.nt) ? stand.nt : {};
  for (const von of Object.keys(nt)) {
    if (von === ich) continue;
    const [text, zeit] = nt[von];
    if (!beste || neuer(zeit, von, beste[1], beste[2])) beste = [text, zeit, von];
  }
  return beste && beste[0].trim() !== '' ? beste : null;
}

// zusammenfuehren(stand | null, umschlag) → { stand, ergebnis } oder { fehler } (der Stand bleibt dann, wie er ist).
export function zusammenfuehren(standVorher, umschlag) {
  if (umschlag.k === 'p') return { fehler: MERGE_FEHLER.falscheArt };
  if (standVorher && standVorher.id !== umschlag.id) return { fehler: MERGE_FEHLER.andereListe };
  if (!standVorher && umschlag.k === 'h') return { fehler: MERGE_FEHLER.unbekannteListe };
  const stand = standVorher
    ? standKopie(standVorher)
    : { id: umschlag.id, rev: 0, t: 0, by: umschlag.by, n: umschlag.n, sv: umschlag.sv, a: {}, e: [], g: {}, nt: {} };
  const ergebnis = { neu: [], geaendert: [], gestrichen: [], haekchen: [], erledigt: 0, von: umschlag.by, notiz: 0 };
  const eintraege = new Map(stand.e.map((eintrag) => [eintrag[F.id], eintrag]));

  if (umschlag.k === 'l') {
    // Kopf (5.2): erst rev, bei Gleichstand t.
    if (umschlag.rev > stand.rev || (umschlag.rev === stand.rev && umschlag.t > stand.t)) {
      Object.assign(stand, { rev: umschlag.rev, t: umschlag.t, by: umschlag.by, n: umschlag.n, sv: umschlag.sv });
    }
    namenZusammenfuehren(stand, umschlag);
    // Einträge (5.4), in der Reihenfolge des Umschlags.
    for (const ein of umschlag.e) {
      const id = ein[F.id];
      const da = eintraege.get(id);
      if (ein[F.status] === STATUS.gestrichen) {
        setze(stand.g, id, hat(stand.g, id) ? Math.min(stand.g[id], ein[F.statusZeit]) : ein[F.statusZeit]);
        if (!da) continue;
        if (da[F.status] !== STATUS.gestrichen) {
          da[F.status] = STATUS.gestrichen;
          da[F.statusZeit] = ein[F.statusZeit];
          da[F.statusVon] = ein[F.statusVon];
          merke(ergebnis.gestrichen, id);
        } else if (ein[F.statusZeit] < da[F.statusZeit]) {
          da[F.statusZeit] = ein[F.statusZeit];
          da[F.statusVon] = ein[F.statusVon];
        }
        continue;
      }
      if (gesperrt(stand, id, da)) continue;
      if (!da) {
        const neu = [...ein];
        eintraege.set(id, neu);
        merke(ergebnis.neu, id);
        continue;
      }
      if (neuer(ein[F.statusZeit], ein[F.statusVon], da[F.statusZeit], da[F.statusVon])) {
        const vorher = da[F.status];
        da[F.status] = ein[F.status];
        da[F.statusZeit] = ein[F.statusZeit];
        da[F.statusVon] = ein[F.statusVon];
        if (da[F.status] !== vorher) merke(ergebnis.haekchen, id);
      }
      if (neuer(ein[F.inhaltZeit], ein[F.inhaltVon], da[F.inhaltZeit], da[F.inhaltVon])) {
        let anders = false;
        for (const nummer of INHALT) {
          if (da[nummer] !== ein[nummer]) anders = true;
          da[nummer] = ein[nummer];
        }
        da[F.inhaltZeit] = ein[F.inhaltZeit];
        da[F.inhaltVon] = ein[F.inhaltVon];
        if (anders) merke(ergebnis.geaendert, id);
      }
    }
  } else {
    // Häkchen (5.5): Kopf, rev und t bleiben; Urheber jedes Häkchens ist by.
    namenZusammenfuehren(stand, umschlag);
    for (const [id, status, zeit] of umschlag.s) {
      const da = eintraege.get(id);
      if (!da || gesperrt(stand, id, da)) continue;
      if (neuer(zeit, umschlag.by, da[F.statusZeit], da[F.statusVon])) {
        const vorher = da[F.status];
        da[F.status] = status;
        da[F.statusZeit] = zeit;
        da[F.statusVon] = umschlag.by;
        if (status !== vorher) merke(ergebnis.haekchen, id);
      }
    }
    ergebnis.erledigt = umschlag.done;
  }
  notizZusammenfuehren(stand, umschlag, ergebnis);
  stand.e = nachKennung(eintraege.values());
  return { stand, ergebnis };
}

// Grabsteine älter als 30 Tage weg (Abschnitt 4); ein Eintrag mit Status g bleibt gesperrt.
export function aufraeumen(standVorher, jetzt) {
  const stand = standKopie(standVorher);
  const grenze = jetzt - GRENZEN.grabsteinTage * GRENZEN.tag;
  const g = {};
  for (const id of Object.keys(stand.g)) if (stand.g[id] >= grenze) setze(g, id, stand.g[id]);
  stand.g = g;
  return stand;
}

// Nach ordnung, dann entryId (6.1 und 6.2).
export const nachOrdnung = (x, y) => x[F.ordnung] - y[F.ordnung] || vergleich(x[F.id], y[F.id]);

// Ob alles erledigt ist: mindestens ein Eintrag ohne g, und alle ohne g haben d oder x (6.2).
export function allesErledigt(stand) {
  const offen = stand.e.filter((eintrag) => eintrag[F.status] !== STATUS.gestrichen);
  return offen.length > 0 && offen.every((eintrag) => eintrag[F.status] === STATUS.erledigt || eintrag[F.status] === STATUS.nichtBekommen);
}

// Häkchen-Umschlag (6.2): je Eintrag ohne g, dessen statusVon = ich ist, [entryId, status, statusZeit].
export function haekchen(stand, ich, meinName, jetzt) {
  const s = stand.e
    .filter((eintrag) => eintrag[F.status] !== STATUS.gestrichen && eintrag[F.statusVon] === ich)
    .sort(nachOrdnung)
    .map((eintrag) => [eintrag[F.id], eintrag[F.status], eintrag[F.statusZeit]]);
  const umschlag = { v: 1, k: 'h', id: stand.id, t: jetzt, by: ich, a: setze({}, ich, meinName), rev: stand.rev, done: allesErledigt(stand) ? 1 : 0, s };
  // Nur die eigene Notiz reist zurück (6.2), auch eine geleerte.
  if (istObjekt(stand.nt) && hat(stand.nt, ich)) umschlag.nt = [[stand.nt[ich][0], stand.nt[ich][1], ich]];
  return umschlag;
}

// Profil (5.6): neu, anderes_profil, neuer, gleich, aelter.
export function profilVergleich(vorhanden, umschlag) {
  if (!vorhanden) return 'neu';
  if (vorhanden.id !== umschlag.id) return 'anderes_profil';
  if (umschlag.rev > vorhanden.rev) return 'neuer';
  return umschlag.rev === vorhanden.rev ? 'gleich' : 'aelter';
}
