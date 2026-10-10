// "So geht's", Kapitel "Scannen und das Urteil verstehen": Bereich "Scanner" der App und das Urteil der Produktkarte
// (Stand 0.14.3). Die übrigen Angaben der Produktkarte stehen im Kapitel "Die Produktkarte".
// Das Bild der Karte im Scanner zeigt ein Produkt aus "Zuletzt gescannt"; ein Bild vom Moment des Scannens gibt es
// noch nicht (Entscheidung vom 10.10.2026). Die Texte daneben behaupten das auch nicht.
import { foto, link } from './hilfen.mjs';

export default {
  slug: 'scannen-und-urteil',
  titel: 'Scannen und das Urteil verstehen',
  kurz: 'Strichcode scannen und das Urteil für den Haushalt lesen.',
  vorspann: 'Strichcode scannen und auf der Produktkarte lesen, wen ein Produkt laut Daten betrifft.',
  film: { datei: 'scannen', alt: 'Scanner von FoodAsu: Die Kamera erfasst einen Strichcode, dann erscheint die Produktkarte eines Müslis mit dem Ergebnis „Nicht für Mia und Jonas: enthält Schalenfrüchte und Gluten“ und den drei Personen des Haushalts.', unterschrift: 'Scannen, dann das Ergebnis für den Haushalt' },
  teile: [
    {
      titel: 'Scannen',
      anker: 'scannen',
      funktionen: ['SCAN-01'],
      nutzen: 'Du hältst die Kamera auf den Strichcode eines Lebensmittels und bekommst die Produktkarte mit dem Ergebnis für deinen Haushalt. Die Kamera läuft nur im Scanner.',
      wo: 'runder Knopf in der Mitte der Leiste',
      fotos: [foto('scanner_scannen_01', 'Der Scanner')],
    },
    {
      titel: 'EAN eintippen',
      anker: 'ean-eintippen',
      funktionen: ['SCAN-02'],
      nutzen: 'Ohne Kamera gibst du die Ziffern ein, die unter dem Strichcode stehen, und bekommst dieselbe Produktkarte.',
      wo: 'Scanner > „EAN eintippen“',
      fotos: [foto('scanner_ean_01', 'Der Dialog „EAN eintippen“')],
    },
    {
      titel: 'Taschenlampe',
      anker: 'taschenlampe',
      funktionen: ['SCAN-03'],
      nutzen: 'Ist es zu dunkel, schaltest du im Scanner das Licht deines Handys ein.',
      wo: 'Scanner > Knopf oben rechts',
    },
    {
      titel: 'Mehrere Produkte nacheinander',
      anker: 'mehrere-produkte',
      funktionen: ['SCAN-05'],
      nutzen: 'Die Produktkarte öffnet auf halber Höhe, und die Kamera läuft dahinter weiter: Das nächste Produkt scannst du einfach. Nach oben gezogen zeigt die Karte alle Angaben.',
      wo: 'Scanner > Produktkarte am Griff ziehen oder nach unten wischen',
      fotos: [foto('scanner_scannen_02', 'Die Karte auf halber Höhe, hier bei einem Produkt aus „Zuletzt gescannt“')],
    },
    {
      titel: 'Zuletzt gescannt',
      anker: 'zuletzt-gescannt',
      funktionen: ['SCAN-06'],
      nutzen: 'Du öffnest ein schon gescanntes Produkt wieder, ohne es neu zu scannen.',
      wo: 'Start > „Zuletzt gescannt“ > „Alle“; oder Scanner > „Zuletzt gescannt“',
    },
    {
      titel: 'Scanner schließen',
      anker: 'scanner-schliessen',
      funktionen: ['SCAN-04'],
      nutzen: 'Du verlässt den Scanner mit einem Tipp oder einem Wisch.',
      wo: 'Scanner > Kreuz oben links; oder auf der Kamerafläche nach unten wischen',
    },
    {
      titel: 'Vibration bei Treffer',
      anker: 'vibration-bei-treffer',
      funktionen: ['SCAN-07'],
      nutzen: 'Das Handy vibriert kurz, wenn ein Strichcode erkannt wurde; das kannst du abschalten.',
      wo: 'Einstellungen > „Scanner“ > „Vibration bei Treffer“',
    },
    {
      titel: 'Im Querformat',
      anker: 'querformat',
      funktionen: ['SCAN-08'],
      nutzen: 'Hältst du das Handy quer, steht die Produktkarte neben dem Kamerabild.',
      wo: 'Scanner > Handy drehen',
    },
    {
      titel: 'Das Urteil für den Haushalt',
      anker: 'das-urteil',
      funktionen: ['KARTE-01'],
      nutzen: 'Oben auf der Produktkarte steht, für wen im Haushalt das Produkt laut Daten nicht passt, und darunter das Ergebnis für jede Person einzeln. Maßgeblich ist immer die Verpackung.',
      wo: 'Produktkarte, ganz oben',
      fotos: [foto('karte_urteil_01', 'Das Urteil und das Ergebnis je Person')],
    },
    {
      titel: 'Was die Ergebnisse bedeuten',
      anker: 'was-die-ergebnisse-bedeuten',
      absaetze: [
        'Das Urteil nennt, wen ein Produkt betrifft und was es laut Daten enthält, zum Beispiel „Nicht für Mia: enthält Schalenfrüchte“. Fehlen Angaben, steht dort „Angaben unvollständig, Verpackung prüfen“. Gibt es laut Daten für niemanden einen Konflikt, steht „Kein Konflikt laut Daten“.',
        'Die Namen und Einträge sind Beispiele. Daten können fehlen oder veraltet sein. Maßgeblich ist immer die Verpackung.',
      ],
    },
    {
      titel: '„Warum?“',
      anker: 'warum',
      funktionen: ['KARTE-02'],
      nutzen: 'Ein Tipp auf „Warum?“ zeigt, worauf ein Ergebnis beruht und wen es betrifft. Die Angaben stammen aus der offenen Datenbank Open Food Facts.',
      wo: 'Produktkarte > „Warum?“ in der Zeile mit dem Urteil',
      fotos: [foto('karte_warum_01', 'Die Erklärung unter „Warum?“', 'Erklärung „Warum?“ in FoodAsu: wen das Ergebnis betrifft, darunter die Quelle Open Food Facts und der Satz „Maßgeblich ist die Verpackung.“')],
    },
    {
      titel: '„Verpackung gelesen“',
      anker: 'verpackung-gelesen',
      funktionen: ['KARTE-03'],
      nutzen: 'Fehlen Angaben, liest du auf der Verpackung nach und lässt FoodAsu sich merken, dass ihr das Produkt selbst geprüft habt. Das nimmst du auch wieder zurück.',
      wo: 'Produktkarte > „Verpackung gelesen“; zurück über „Weitere Aktionen“ > „Prüfung aufheben“',
      fotos: [foto('scanner_ean_03', '„Angaben unvollständig“ mit dem Knopf „Verpackung gelesen“')],
    },
    {
      titel: 'Mehr auf der Produktkarte',
      anker: 'die-produktkarte',
      alteAnker: ['daten-neu-laden'],
      absaetze: [
        'Unter dem Urteil folgen die Nährwerte, die Abzeichen und die Zutaten, soweit sie in den Daten stehen. Von der Karte aus setzt du ein Produkt auch auf eine Liste.',
      ],
      verweis: link('Mehr dazu im Kapitel ', 'Die Produktkarte', '/so-gehts/produktkarte/'),
    },
  ],
  verweise: [
    { text: 'Haushalt anlegen und Meiden', ziel: '/so-gehts/haushalt-und-meiden/' },
    { text: 'Fragen', ziel: '/fragen/' },
  ],
};
