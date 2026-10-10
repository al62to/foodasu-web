// Seite "Daten und Quellen" (/daten-und-quellen/, AP-22 Teil 1 Nr. 5): verständlich erklärt, woher die Angaben in
// FoodAsu kommen, was "laut Daten" bedeutet, warum Angaben fehlen oder veraltet sein können und warum die Verpackung
// maßgeblich ist. Die Einzelnachweise je Rezept stehen weiter nur auf der Seite "Quellen und Lizenzen", die Lizenzen
// der Website auf der Seite "Lizenzen"; hier wird dorthin verlinkt und nichts wiederholt.
// Wortregeln nach Konzept v4, Abschnitt 1. Die Seite zeigt, was die App kann und woher die Angaben stammen, nicht,
// nach welchen Regeln ein Ergebnis entsteht. Begriffe in Anführungszeichen stehen so in der App (Stand 0.14.3).
import { MEDIZIN } from './fragen.mjs';

export const datenquellen = {
  titel: 'Daten und Quellen',
  vorspann: 'Woher die Angaben in FoodAsu kommen, was „laut Daten“ bedeutet und warum am Ende die Verpackung zählt.',
  // "absaetze" sind Text; ein Absatz als Objekt hat einen Link: { vor, text, ziel, nach, extern }.
  teile: [
    {
      anker: 'produkte',
      titel: 'Produkte: Open Food Facts',
      absaetze: [
        'Die Angaben zu Produkten kommen aus der offenen Datenbank Open Food Facts. Eine Gemeinschaft trägt dort ein, was auf der Verpackung steht: Zutaten, Spurenangaben und Nährwerte. Beim Scannen fragt FoodAsu mit dem Strichcode dort nach.',
        'Auf der Produktkarte steht, von wann die Angaben sind und dass sie von Open Food Facts stammen.',
        { vor: 'Open Food Facts stellt seine Datenbank unter der Open Database License (ODbL) bereit: ', text: 'Open Food Facts', ziel: 'https://de.openfoodfacts.org/', nach: '.', extern: true },
      ],
    },
    {
      anker: 'laut-daten',
      titel: 'Was „laut Daten“ bedeutet',
      absaetze: [
        'FoodAsu zeigt, was laut Daten im Produkt ist, und hält das neben das, was jede Person in deinem Haushalt meidet. Das Ergebnis heißt „enthält“, „Spuren“, „Angaben unvollständig“ oder „Kein Konflikt laut Daten“.',
        '„Kein Konflikt laut Daten“ heißt: In den Angaben zum Produkt steht nichts, das diese Person meidet. Ob die Packung in deiner Hand genau so zusammengesetzt ist, steht auf der Verpackung.',
      ],
    },
    {
      anker: 'luecken',
      titel: 'Warum Angaben fehlen oder veraltet sein können',
      absaetze: [
        'Die Datenbank lebt von Menschen, die Produkte eintragen. Manche Produkte fehlen ganz. Bei anderen fehlt die Zutatenliste, oder sie ist nicht vollständig erfasst. Ändert ein Hersteller die Zusammensetzung, kann in der Datenbank noch die alte stehen.',
        'Fehlt die Zutatenliste, schreibt FoodAsu „Angaben unvollständig, Verpackung prüfen“ und nicht „Kein Konflikt laut Daten“. Mit „Daten neu laden“ holst du die Angaben zu einem Produkt noch einmal frisch.',
      ],
    },
    {
      anker: 'verpackung',
      titel: 'Warum die Verpackung maßgeblich ist',
      absaetze: [
        'Auf der Verpackung steht, was in genau dieser Packung ist. Die Angaben dort kommen vom Hersteller. FoodAsu gibt dir im Laden einen schnellen Überblick und ersetzt die Verpackung nicht.',
        'Fehlen Angaben, liest du auf der Verpackung nach. Mit „Verpackung gelesen“ merkt sich die App, dass ihr das Produkt selbst geprüft habt.',
        MEDIZIN,
      ],
    },
    {
      anker: 'rezepte',
      titel: 'Rezepte',
      absaetze: [
        'Die Rezepte stammen aus offenen Rezeptsammlungen, zum Beispiel aus dem Koch-Wiki, dem Kochbuch von Wikibooks und UniTools World Recipes. Sie stehen unter freien Lizenzen und sind für FoodAsu verändert. Die Hinweise zu den Zutaten stammen von FoodAsu.',
        { vor: 'Quelle, Urheber, Lizenz und Änderungen stehen für jedes Rezept dieser Website auf der Seite ', text: 'Quellen und Lizenzen', ziel: '/quellen-und-lizenzen/', nach: '.' },
      ],
    },
    {
      anker: 'naehrwerte',
      titel: 'Nährwerte der Rezepte',
      absaetze: [
        'Die Nährwerte der Rezepte sind eine eigene Berechnung aus den rohen Zutaten, mit Daten des Bundeslebensmittelschlüssels (BLS 4.0), herausgegeben vom Max Rubner-Institut. Das Max Rubner-Institut hat die Berechnung nicht geprüft. Beim Kochen ändert sich das Gewicht.',
        'Die Nährwerte eines Produkts kommen dagegen aus Open Food Facts, wie die übrigen Angaben zum Produkt.',
      ],
    },
    {
      anker: 'bilder',
      titel: 'Symbolbilder',
      absaetze: [
        'Die Bilder der Rezepte sind Symbolbilder. Sie sind mit Adobe Firefly erzeugt und zeigen nicht das Gericht, wie es nach diesem Rezept gekocht aussieht. Jedes Bild ist als „Symbolbild“ gekennzeichnet; die Herkunft steht auch in der Bilddatei.',
      ],
    },
    {
      anker: 'nachweise',
      titel: 'Wo die Nachweise stehen',
      absaetze: [
        { vor: 'Die Nachweise zu jedem Rezept: ', text: 'Quellen und Lizenzen der Rezepte', ziel: '/quellen-und-lizenzen/', nach: '.' },
        { vor: 'Schriften, Programme und Daten dieser Website: ', text: 'Lizenzen', ziel: '/lizenzen/', nach: '.' },
        { vor: 'Was beim Scannen übertragen wird: ', text: 'Datenschutzerklärung', ziel: '/datenschutz.html', nach: '.' },
      ],
    },
  ],
};
