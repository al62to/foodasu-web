// Rubrik "Aus alten Kochbüchern" (AP-25): Texte der Sammelseite /alte-rezepte/ und die vier Zeiträume des
// Zeitstrahls. Die Rezepte selbst kommen aus src/daten/rezepte_zusatz.json (Paket "historisch"); jedes nennt seinen
// Zeitraum. Ein Zeitraum ohne Rezept bricht den Bau ab, ebenso ein Rezept mit einem Zeitraum, den es hier nicht gibt.
import { alteRezepte } from './rezeptseiten.mjs';

export const alteSeite = {
  adresse: '/alte-rezepte/',
  name: 'Aus alten Kochbüchern',
  titel: 'Alte Rezepte aus historischen Kochbüchern',
  vorspann: (zahl, von, bis) => `${zahl} historische Rezepte aus Kochbüchern von ${von} bis ${bis}: Gerichte, die man heute noch kennt. Zu jedem steht ein kurzer Auszug aus dem alten Buch und eine heutige Fassung mit Zutaten, Mengen und Schritten. Die Rezepte kommen später in die App.`,
  zeitstrahl: 'Zeitstrahl: Rezepte nach Zeitraum',
  sprung: 'Zu einem Zeitraum springen',
  anzahl: (zahl) => (zahl === 1 ? '1 Rezept' : `${zahl} Rezepte`),
  aus: (laender) => `Bücher aus ${laender}`,
  so: {
    titel: 'So sind die alten Rezepte aufbereitet',
    punkte: [
      ['Das Buch', 'Jedes Rezept stammt aus einem gedruckten Kochbuch, dessen Verfasserin oder Verfasser seit mehr als 70 Jahren tot ist oder das ohne Namen erschien. Buch, Jahr und Ort stehen beim Rezept, dazu ein Link zur Seite im Digitalisat oder zur Abschrift des Buchs.'],
      ['Der Auszug', 'Ein kurzer Auszug zeigt den Wortlaut in der alten Schreibweise, darunter steht er in heutigem Deutsch. Bei Büchern in einer anderen Sprache ist das eine eigene Übersetzung.'],
      ['Die heutige Fassung', 'Zutaten, Mengen und Schritte sind neu geschrieben. Alte Maße wie Pfund, Lot oder Pint sind umgerechnet; Mengen, Zeiten und Temperaturen sind mit heutigen Rezepten abgeglichen.'],
      ['Die Hinweise', 'Wie bei allen Rezepten auf FoodAsu steht bei jeder Zutat, ob sie einen der 20 Einträge zum Meiden betrifft. Maßgeblich ist die Verpackung.'],
    ],
  },
  mehr: { titel: 'Mehr Rezepte', alle: 'Alle Rezepte ansehen', quellen: 'Quellen und Lizenzen der Rezepte' },
};

export const ZEITRAEUME = [
  { kennung: '1500er', anker: '1500er', jahre: '1500 bis 1599', kreis: '15', text: 'Kochbücher werden gedruckt und gehen von Hand zu Hand. Mengen stehen selten dabei, gewürzt wird mit Zimt, Ingwer und Rosenwasser.' },
  { kennung: '1600er und 1700er', anker: '1600er-und-1700er', jahre: '1600 bis 1799', kreis: '17', text: 'Die Bücher werden dicker und genauer. Manche Rezepte nennen schon Pfund und Lot, andere verlassen sich auf das Augenmaß der Köchin.' },
  { kennung: '1800er', anker: '1800er', jahre: '1800 bis 1899', kreis: '18', text: 'Kochbücher für den bürgerlichen Haushalt erscheinen in hohen Auflagen. Die Mengen sind genau, gemessen wird noch in Pfund, Lot und Maß.' },
  { kennung: '1900 bis 1955', anker: '1900-bis-1955', jahre: '1900 bis 1955', kreis: '19', text: 'Gramm und Liter haben sich durchgesetzt. Viele Rezepte lesen sich schon fast wie heute.' },
].map((zeitraum) => ({
  ...zeitraum,
  rezepte: alteRezepte.filter((rezept) => rezept.original.zeitraum === zeitraum.kennung).sort((a, b) => Number(a.original.jahr) - Number(b.original.jahr) || a.titel.localeCompare(b.titel, 'de')),
}));

{
  const bekannt = new Set(ZEITRAEUME.map((zeitraum) => zeitraum.kennung));
  const fremd = alteRezepte.filter((rezept) => !bekannt.has(rezept.original.zeitraum));
  if (fremd.length) throw new Error(`Alte Rezepte mit unbekanntem Zeitraum: ${fremd.map((rezept) => rezept.slug).join(', ')}`);
}
// Zeiträume, die auf der Seite stehen: nur die mit Rezepten.
export const zeitraeume = ZEITRAEUME.filter((zeitraum) => zeitraum.rezepte.length > 0);
export const jahreVonBis = () => {
  const jahre = alteRezepte.map((rezept) => Number(rezept.original.jahr));
  return [Math.min(...jahre), Math.max(...jahre)];
};
