// "So geht's", Seite "Zu Hause schreiben, im Laden abhaken" (AP-19): der Weg der Einkaufsliste ohne Scannen, kurz und
// in der Reihenfolge, in der man ihn geht. Die einzelnen Funktionen stehen im Kapitel "Einkaufslisten".
import { foto, link } from './hilfen.mjs';

export default {
  slug: 'zu-hause-schreiben-im-laden-abhaken',
  symbol: 'wagen',
  leitbild: 'liste_eintraege_03',
  titel: 'Zu Hause schreiben, im Laden abhaken',
  kurz: 'Die Einkaufsliste ohne Scannen, vom Aufschreiben bis zum Abhaken.',
  vorspann: 'Für die Einkaufsliste in FoodAsu musst du nichts scannen: Du schreibst zu Hause auf, was du brauchst, und hakst im Laden mit dem Finger ab.',
  teile: [
    {
      titel: 'Zu Hause: aufschreiben',
      anker: 'zu-hause',
      symbol: 'haus',
      gross: true,
      funktionen: ['LISTE-01', 'LISTE-02'],
      nutzen: 'Du schreibst in Ruhe auf, was du brauchst, zum Beispiel „2 Zwiebeln“ oder „500 g Mehl“. FoodAsu ordnet die Liste nach Warengruppen wie im Laden.',
      wo: 'Listen > Liste anlegen oder öffnen > Feld „Hinzufügen“',
      fotos: [foto('liste_eintraege_03', 'Die Liste, zu Hause geschrieben')],
    },
    {
      titel: 'Im Laden: abhaken',
      anker: 'im-laden',
      symbol: 'wagen',
      gross: true,
      funktionen: ['LISTE-04'],
      nutzen: 'Im Laden brauchst du nur noch einen Finger: Ein Tipp auf das Kästchen hakt ab, was im Wagen liegt. Erledigtes rutscht nach unten, oben bleibt, was noch fehlt.',
      wo: 'Liste > Kästchen links am Eintrag; schnell zur Liste: lange auf das Symbol von FoodAsu drücken > „Liste“',
      fotos: [foto('liste_abhaken_03', 'Der Bereich „Erledigt“')],
    },
    {
      titel: 'Gut zu wissen',
      anker: 'gut-zu-wissen',
      symbol: 'info',
      liste: [
        { name: 'Ohne Scannen', text: 'Aufschreiben und Abhaken gehen ganz ohne Kamera. Scannen kannst du, musst du aber nicht.' },
        { name: 'Ohne Internet', text: 'Die Liste liegt auf deinem Handy. Zum Aufschreiben und Abhaken brauchst du kein Internet.' },
        { name: 'Mit Hinweisen', text: 'Betrifft ein Eintrag jemanden in deinem Haushalt, steht ein Hinweis dabei. Das ist ein Hinweis, kein Urteil.' },
        { name: 'Für andere', text: 'Mit „Als Text teilen“ schickst du die offenen Einträge an jemanden, der für dich einkaufen geht.' },
      ],
    },
    {
      titel: 'Nach dem Einkauf',
      anker: 'nach-dem-einkauf',
      symbol: 'haken',
      absaetze: [
        '„Erledigte löschen“ im Menü der Liste räumt alles Abgehakte auf einmal weg. Was offen ist, bleibt für den nächsten Einkauf stehen.',
        'Der Knopf „Was kann ich damit kochen?“ zeigt Rezepte, für die schon vieles auf deiner Liste steht.',
      ],
      verweis: link('Alle Funktionen der Liste stehen im Kapitel ', 'Einkaufslisten', '/so-gehts/einkaufslisten/'),
    },
  ],
  verweise: [
    { text: 'Einkaufslisten', ziel: '/so-gehts/einkaufslisten/' },
    { text: 'Abhaken', ziel: '/so-gehts/einkaufslisten/#abhaken' },
    { text: 'Als Text teilen', ziel: '/so-gehts/einkaufslisten/#als-text-teilen' },
    { text: '„Was kann ich damit kochen?“', ziel: '/so-gehts/einkaufslisten/#was-kann-ich-damit-kochen' },
  ],
};
