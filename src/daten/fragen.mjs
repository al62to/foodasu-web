// Fragen und Antworten der Startseite und der Seite /fragen/ (freigegeben von Ali am 09.10.2026). Eigene Datei seit
// AP-22, damit sitemap.xml den Tag der letzten Änderung der Seite /fragen/ aus dem Git-Datum dieser Datei lesen kann
// (src/daten/stand.mjs). src/daten/startseite.mjs gibt die Liste unverändert weiter.
//
// Satz zum Medizinprodukt (Projektleitung, 10.10.2026, AP-22 Teil 1 Nr. 6), wörtlich. Er steht hier, auf der
// Startseite und auf der Seite "Daten und Quellen". tools/pruefe_seiten.mjs nimmt genau diesen Satz von der
// Wortliste aus ("gesundheitlichen").
export const MEDIZIN = 'FoodAsu ist kein Medizinprodukt und ersetzt keine ärztliche Beratung. Maßgeblich ist immer die Verpackung. Bei gesundheitlichen Fragen wende dich an Fachleute.';

// "anker" ist die Sprungmarke der Frage auf der Seite /fragen/ (seit AP-23; sie bleibt, auch wenn sich die Frage ändert).
export const fragen = {
  ueberschrift: 'Fragen und Antworten',
  liste: [
    {
      anker: 'woher-kommen-die-daten',
      frage: 'Woher kommen die Daten?',
      antwort: [
        'Die Angaben zu Produkten kommen aus der offenen Datenbank Open Food Facts. Eine Gemeinschaft trägt dort ein, was auf der Verpackung steht. Die Angaben können unvollständig oder veraltet sein.',
        'Die Rezepte stammen aus offenen Rezeptsammlungen; Quelle und Lizenz sind bei jedem Rezept verlinkt. Die Nährwerte der Rezepte sind aus den rohen Zutaten berechnet, mit dem Bundeslebensmittelschlüssel (BLS 4.0).',
      ],
    },
    {
      anker: 'meine-angaben',
      frage: 'Was passiert mit meinen Angaben?',
      antwort: [
        'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst. FoodAsu braucht kein Konto und zeigt keine Werbung. Beim Scannen fragt FoodAsu mit dem Strichcode bei der offenen Datenbank Open Food Facts nach und lädt von dort Produktangaben und Produktbild.',
      ],
      verweis: { vor: 'Alles Weitere steht in der ', text: 'Datenschutzerklärung', nach: '.', ziel: '/datenschutz.html' },
    },
    {
      anker: 'verpackung',
      frage: 'Ersetzt FoodAsu die Verpackung?',
      antwort: [
        // Entscheidung Ali vom 10.10.2026 (AP-22, Nr. 2): "Maßgeblich ist immer die Verpackung." steht hier nur noch
        // einmal, im Satz zum Medizinprodukt darunter.
        'Nein. FoodAsu zeigt, was laut Daten im Produkt ist. Daten können fehlen oder veraltet sein.',
        MEDIZIN,
      ],
    },
    {
      anker: 'angaben-unvollstaendig',
      frage: 'Was bedeutet „Angaben unvollständig“?',
      antwort: [
        'Dann fehlt in den Daten die Zutatenliste, oder sie ist nicht vollständig erfasst. FoodAsu schreibt in dem Fall „Angaben unvollständig, Verpackung prüfen“ und nicht „Kein Konflikt laut Daten“.',
      ],
    },
    {
      anker: 'konto',
      frage: 'Brauche ich ein Konto?',
      antwort: ['Nein. FoodAsu funktioniert ohne Registrierung.'],
    },
    {
      anker: 'wo-bekomme-ich-foodasu',
      frage: 'Wo bekomme ich FoodAsu?',
      antwort: [
        'FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. Die App kommt für Android in den Play Store. Eine Version fürs iPhone ist geplant.',
      ],
    },
  ],
};

// Seite /fragen/ (AP-23 Teil C Nr. 4, Entwurf "Nach Themen"): dieselben sechs Fragen in drei Gruppen. "fragen" nennt je
// Gruppe die Anker der Fragen in der Reihenfolge der Seite; FAQPage folgt dieser Reihenfolge. Die Startseite behält die
// Reihenfolge von "liste" oben.
export const fragenGruppen = {
  inhalt: 'Auf dieser Seite',
  gruppen: [
    { anker: 'die-daten', titel: 'Die Daten', fragen: ['woher-kommen-die-daten', 'angaben-unvollstaendig'] },
    { anker: 'deine-angaben', titel: 'Deine Angaben', fragen: ['meine-angaben', 'konto'] },
    { anker: 'die-app', titel: 'Die App', fragen: ['verpackung', 'wo-bekomme-ich-foodasu'] },
  ],
};
