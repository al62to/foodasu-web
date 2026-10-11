// "Zum Ausprobieren" im Mega-Menü (Ali, 11.10.2026): drei Rezepte mit Bild, auf jeder Seite andere.
// Im HTML steht je Seite eine feste Auswahl aus allen Rezeptseiten der Website, abgeleitet aus der Adresse der Seite:
// gleiche Seite, gleiche Auswahl bei jedem Bau. Das ist die Auswahl ohne JavaScript und die, die Suchmaschinen sehen.
// Beim Besuch ersetzt das Skript in Kopf.astro sie durch eine zufällige nach denselben Regeln
// (src/skripte/probe_wahl.js); die Liste dafür ("probeDaten") steht in der Seite selbst.
import { rezepte, LAND, rezeptAdresse, ziel } from './rezeptseiten.mjs';
import { kennzeichne } from '../../tools/sprache_setzen.mjs';
import { ANZAHL, seitenPfad, waehle } from '../skripte/probe_wahl.js';

export const SYMBOLBILD = 'Symbolbild';

// Alle Rezeptseiten der Website in fester Reihenfolge. Das Land ist das erste des Rezepts, wie auf der Karte im Menü.
const kandidaten = rezepte.flatMap((rezept) => {
  const adresse = ziel(rezeptAdresse(rezept));
  return adresse ? [{ slug: rezept.slug, titel: rezept.kurztitel, land: LAND[rezept.laender[0]], ziel: adresse }] : [];
});
const laender = [...new Set(kandidaten.map((rezept) => rezept.land))];
if (laender.length < ANZAHL) throw new Error(`"Zum Ausprobieren" braucht Rezepte aus mindestens ${ANZAHL} Ländern, es sind ${laender.length}`);
// Der Browser bildet Adresse und Bild aus dem Namen des Rezepts in der Adresse.
for (const rezept of kandidaten) {
  if (rezept.ziel !== `/rezepte/${rezept.slug}/` || !rezept.land) throw new Error(`"Zum Ausprobieren": Adresse oder Land fehlt bei ${rezept.slug}`);
}

// Feste Zahlenfolge aus einem Text (FNV-1a als Startwert, dann Mulberry32): gleiche Adresse, gleiche Folge.
function festerZufall(text) {
  let wert = 2166136261;
  for (let stelle = 0; stelle < text.length; stelle++) {
    wert ^= text.charCodeAt(stelle);
    wert = Math.imul(wert, 16777619);
  }
  return () => {
    wert = (wert + 0x6d2b79f5) | 0;
    let zahl = Math.imul(wert ^ (wert >>> 15), 1 | wert);
    zahl = (zahl + Math.imul(zahl ^ (zahl >>> 7), 61 | zahl)) ^ zahl;
    return ((zahl ^ (zahl >>> 14)) >>> 0) / 4294967296;
  };
}

// Die Auswahl im HTML der Seite mit diesem Pfad.
export function probeFuer(pfadname) {
  const pfad = seitenPfad(pfadname);
  const wahl = waehle(kandidaten, pfad, festerZufall(pfad));
  if (wahl.length !== ANZAHL) throw new Error(`"Zum Ausprobieren": keine ${ANZAHL} Rezepte für ${pfad}`);
  return wahl;
}

// Liste für den Browser, so kurz wie möglich: je Rezept Name in der Adresse, Titel, Nummer des Landes und, wo der
// Titel fremdsprachig ist, die Sprache des ganzen Titels. Enthält er nur ein fremdsprachiges Wort, steht stattdessen
// der Titel als HTML mit der Sprachangabe da, wie sie der Bau in die Seiten setzt.
const html = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const probeDaten = JSON.stringify({
  alt: SYMBOLBILD,
  laender,
  rezepte: kandidaten.map(({ slug, titel, land }) => {
    const schlicht = html(titel);
    const mitSprache = kennzeichne(schlicht);
    if (mitSprache === schlicht) return [slug, titel, laender.indexOf(land)];
    const ganz = mitSprache.match(/^<span lang="([^"]+)">([^<]*)<[/]span>$/);
    return [slug, titel, laender.indexOf(land), ganz && ganz[2] === schlicht ? ganz[1] : mitSprache];
  }),
}).replace(/</g, '\\u003c');
