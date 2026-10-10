// "So geht's", Kapitel "Erste Schritte": Bereich "Start und Bedienung" der App (Stand 0.14.3).
import { foto } from './hilfen.mjs';

export default {
  slug: 'erste-schritte',
  titel: 'Erste Schritte',
  kurz: 'Installieren, die Einführung, die Startseite und die Leiste.',
  vorspann: 'FoodAsu installieren, die Einführung ansehen und die Startseite mit ihrer Leiste kennenlernen.',
  teile: [
    {
      titel: 'Installieren',
      anker: 'installieren',
      absaetze: [
        'FoodAsu ist eine App für Android und kommt über Google Play auf dein Handy. FoodAsu ist in der Beta: Sobald die App für alle im Play Store steht, findest du den Weg dorthin auf dieser Website. Eine Version fürs iPhone ist geplant.',
        'Ein Konto brauchst du nicht. Du gibst keinen Namen und keine E-Mail-Adresse ein, um die App zu nutzen.',
      ],
    },
    {
      titel: 'Die Einführung',
      anker: 'die-einfuehrung',
      funktionen: ['START-04', 'START-05'],
      nutzen: 'Beim ersten Start führt dich FoodAsu in kurzen Schritten durch alle Bereiche der App. Nach einem Update zeigt „Neu in FoodAsu“ nur, was dazugekommen ist.',
      wo: 'erscheint von selbst beim ersten Start',
      fotos: [foto('start_einfuehrung_02', 'Ein Schritt der Einführung')],
    },
    {
      titel: 'Die Einführung noch einmal ansehen',
      anker: 'die-einfuehrung-noch-einmal-ansehen',
      funktionen: ['START-06'],
      nutzen: 'Du siehst dir die Einführung an, wann immer du willst.',
      wo: 'Start > Hilfe (Fragezeichen) > „Einführung erneut ansehen“; oder Einstellungen > „Hilfe und Feedback“ > „Anleitung“',
    },
    {
      titel: 'Die Startseite',
      anker: 'die-startseite',
      funktionen: ['START-01'],
      nutzen: 'Die Startseite zeigt auf einen Blick deine zuletzt gescannten Produkte, deine Listen, einen Rezept-Vorschlag und deinen Haushalt. Jede Karte führt mit einem Tipp weiter.',
      wo: 'App öffnen oder Reiter Start',
      fotos: [foto('start_startseite_01', 'Die Startseite')],
    },
    {
      titel: 'Die Leiste unten',
      anker: 'leiste',
      funktionen: ['START-02'],
      nutzen: 'Mit der Leiste am unteren Rand wechselst du zwischen Start, Listen, Rezepte und Haushalt. Der runde Knopf in der Mitte öffnet den Scanner.',
      wo: 'unten auf jedem Hauptbildschirm',
    },
    {
      titel: 'Der Rezept-Vorschlag',
      anker: 'rezept-vorschlag',
      funktionen: ['START-03'],
      nutzen: 'Die Startseite schlägt dir jeden Tag ein Rezept vor. Meidet im Haushalt niemand etwas, steht darunter „Rezept des Tages“; sonst steht dort, ob das Rezept Hinweise für euren Haushalt hat.',
      wo: 'Start > Karte mit dem Rezept',
    },
    {
      titel: 'Hinweise auf der Startseite',
      anker: 'hinweise-auf-der-startseite',
      funktionen: ['START-08', 'START-09'],
      nutzen: 'Gibt es eine neue Version, meldet es die Startseite; du aktualisierst mit einem Tipp oder verschiebst es. Solange FoodAsu in der Beta ist, steht dort auch eine kleine Karte, von der aus du Feedback gibst oder die du ausblendest.',
      wo: 'Start > Karten ganz oben',
    },
    {
      titel: 'Schneller starten',
      anker: 'schneller-starten',
      funktionen: ['START-07'],
      nutzen: 'Vom Startbildschirm deines Handys öffnest du den Scanner oder die Liste, die du zuletzt benutzt hast.',
      wo: 'lange auf das Symbol von FoodAsu drücken > „Scannen“ oder „Liste“',
      fotos: [foto('start_schnellzugriff_01', 'Das Menü am App-Symbol')],
    },
    {
      titel: 'Hell oder dunkel',
      anker: 'hell-oder-dunkel',
      funktionen: ['EINST-02'],
      nutzen: 'FoodAsu ist hell, unabhängig von der Einstellung deines Handys. Mit einem Schalter stellst du die App auf dunkel; die Wahl bleibt gespeichert.',
      wo: 'Einstellungen > „Darstellung“ > „Dunkler Modus“',
      fotos: [foto('einstellungen_dunkel_01', 'Die Einstellungen im dunklen Modus')],
    },
    {
      titel: 'Deutsch oder Englisch',
      anker: 'deutsch-oder-englisch',
      funktionen: ['START-10'],
      nutzen: 'Die Oberfläche der App gibt es auf Deutsch und auf Englisch; sie folgt der Sprache deines Handys. Die Rezepte gibt es nur auf Deutsch.',
      wo: 'Einstellungen des Handys > Apps > FoodAsu > Sprache',
    },
  ],
  verweise: [
    { text: 'Haushalt anlegen und Meiden', ziel: '/so-gehts/haushalt-und-meiden/' },
    { text: 'Scannen und das Urteil verstehen', ziel: '/so-gehts/scannen-und-urteil/' },
  ],
};
