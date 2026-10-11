// "Zum Ausprobieren" im Mega-Menü (Ali, 11.10.2026): die Regeln der Auswahl, für den Bau und für den Browser dieselben.
// Drei Rezepte aus drei verschiedenen Ländern, nie das Rezept der Seite selbst. "zufall" liefert Zahlen von 0 bis
// unter 1: im Bau fest aus der Adresse der Seite abgeleitet (src/daten/probieren.mjs), im Browser Math.random.
export const ANZAHL = 3;

// Adresse der Seite, wie sie in den Links steht: ohne "index.html", Ordner mit Schrägstrich am Ende.
export function seitenPfad(pfadname) {
  const pfad = pfadname.replace(/index\.html$/, '');
  return pfad.endsWith('/') || /\.[a-z0-9]+$/.test(pfad) ? pfad : `${pfad}/`;
}

export function waehle(liste, pfad, zufall) {
  const rest = liste.filter((rezept) => rezept.ziel !== pfad);
  const wahl = [];
  while (wahl.length < ANZAHL && rest.length > 0) {
    const [rezept] = rest.splice(Math.floor(zufall() * rest.length), 1);
    if (wahl.every((anderes) => anderes.land !== rezept.land)) wahl.push(rezept);
  }
  return wahl;
}
