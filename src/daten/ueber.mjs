// Seite "Über FoodAsu" (/ueber-foodasu/, AP-22 Teil 2 Nr. 5; von Ali am 10.10.2026 freigegeben, mit den Entscheidungen
// 4 und 9): Im Mittelpunkt steht das Problem, das die App löst. Dazu, für wen sie ist, woher die Angaben kommen, was
// am Handy bleibt, wo die App steht und der Kontakt. Genannt wird nur Alis Name (in der Unterschrift); kein beruflicher
// Hintergrund, kein Arbeitgeber, keine Familie, keine Anschrift, kein Foto. Wo es geht, stehen hier Sätze, die Ali für
// die Startseite schon freigegeben hat (Karte "Kein Konto ...", Antworten unter "Fragen"); sie sind hier wörtlich
// wiederholt, damit der Tag der letzten Änderung dieser Seite nur an dieser Datei hängt.
import { seite } from './seite.mjs';

export const ueber = {
  titel: 'Über FoodAsu',
  // Überschrift der Seite (h1); "titel" bleibt für Brotkrumen und Fuß.
  h1: 'Über FoodAsu, die App vom Bodensee',
  // Derselbe Satz wie oben auf der Startseite und in Organization und WebSite.
  vorspann: seite.beschreibung,
  // Jeder Abschnitt ist seit AP-23 eine Station an einer feinen Linie; "symbol" nennt das Zeichen im Kreis
  // (src/daten/zeichen.mjs).
  teile: [
    {
      anker: 'warum',
      symbol: 'frage',
      titel: 'Warum es FoodAsu gibt',
      // Wortlaut nach Alis Angaben im Chat vom 10.10.2026: in seinen Worten, mit der Einkaufsliste als zweitem Grund,
      // ohne Doppelpunkte.
      absaetze: [
        'In vielen Haushalten isst nicht jeder alles. Der eine isst kein Gluten, die andere keine Nüsse, das Kind trinkt keine Milch. Im Laden heißt das Packung umdrehen, Kleingedrucktes lesen, und beim nächsten Produkt wieder von vorn.',
        'Dazu kam bei mir die Einkaufsliste. Jedes Mal eine neue zu schreiben, war mir ehrlich gesagt eine Qual. Ich dachte mir, das muss doch leichter gehen.',
        'Also habe ich FoodAsu gebaut und mehrere Dinge in einer App zusammengebracht, den Scanner, die Einkaufsliste und die Rezepte. Du legst einmal fest, was jede Person bei dir zu Hause meidet. Danach reicht ein Scan, und deine Listen schreibst du nicht jedes Mal neu.',
      ],
      unterschrift: 'Ali Tonc, Entwickler von FoodAsu',
    },
    {
      // Entscheidung 9: für wen FoodAsu ist, und die Einkaufsliste im Alltag (LISTE-01, LISTE-03, LISTE-04).
      anker: 'fuer-wen',
      symbol: 'haus',
      titel: 'Für wen FoodAsu ist',
      absaetze: [
        'FoodAsu ist für alle, die wissen wollen, was sie einkaufen, statt blind zuzugreifen. Die App zeigt, was laut Daten im Produkt ist, und verspricht nichts, was die Daten nicht hergeben.',
        'Dazu gehört die Einkaufsliste. Deine Listen bleiben gespeichert, und du verwendest sie immer wieder, zum Beispiel für den Wocheneinkauf. Was abgehakt ist, steht unter „Erledigt“, und von dort holst du zurück, was du wieder brauchst.',
        'Beim Schreiben schlägt FoodAsu Wörter vor, auch solche, die du schon einmal aufgeschrieben hast. Kein Zettel, kein Suchen im Chatverlauf.',
      ],
    },
    {
      // Entscheidung 4: offene Quellen, "laut Daten", die Verpackung ist maßgeblich.
      anker: 'angaben',
      symbol: 'datenbank',
      titel: 'Woher die Angaben kommen',
      absaetze: [
        'FoodAsu legt offen, woher seine Angaben kommen. Die Angaben zu Produkten stammen aus der offenen Datenbank Open Food Facts, die Rezepte aus offenen Rezeptsammlungen.',
        'Deshalb steht in der App „laut Daten“. FoodAsu zeigt, was in den Angaben steht. Daten können fehlen oder veraltet sein. Maßgeblich ist immer die Verpackung.',
      ],
      verweis: { vor: 'Mehr dazu steht auf der Seite ', text: 'Daten und Quellen', nach: '.', ziel: '/daten-und-quellen/' },
    },
    {
      anker: 'bei-dir',
      symbol: 'handy',
      titel: 'Was bei dir bleibt',
      absaetze: [
        'Kein Konto, keine Werbung, kein Verkauf von Daten. FoodAsu funktioniert ohne Registrierung.',
        'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst.',
      ],
      verweis: { vor: 'Alles Weitere steht in der ', text: 'Datenschutzerklärung', nach: '.', ziel: '/datenschutz.html' },
    },
    {
      anker: 'stand',
      symbol: 'neu',
      titel: 'Wo FoodAsu steht',
      absaetze: ['FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. Die App kommt für Android in den Play Store. Eine Version fürs iPhone ist geplant.'],
      verweis: { vor: 'Was die App schon kann, zeigt die Anleitung ', text: "So geht's", nach: '.', ziel: '/so-gehts/' },
    },
    {
      anker: 'kontakt',
      symbol: 'brief',
      titel: 'Kontakt',
      absaetze: ['Fragen, Hinweise und Feedback kommen per E-Mail an.'],
      kontakt: 'E-Mail schreiben',
      verweis: { vor: 'Wer für diese Website verantwortlich ist, steht in der ', text: 'Offenlegung', nach: '.', ziel: '/offenlegung/' },
    },
  ],
};
