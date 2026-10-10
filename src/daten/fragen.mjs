// Fragen und Antworten der Startseite und der Seite /fragen/ (freigegeben von Ali am 09.10.2026). Eigene Datei seit
// AP-22, damit sitemap.xml den Tag der letzten Änderung der Seite /fragen/ aus dem Git-Datum dieser Datei lesen kann
// (src/daten/stand.mjs). src/daten/startseite.mjs gibt die Liste unverändert weiter.
//
// Satz zum Medizinprodukt (Projektleitung, 10.10.2026, AP-22 Teil 1 Nr. 6), wörtlich. Er steht hier, auf der
// Startseite und auf der Seite "Daten und Quellen". tools/pruefe_seiten.mjs nimmt genau diesen Satz von der
// Wortliste aus ("gesundheitlichen").
export const MEDIZIN = 'FoodAsu ist kein Medizinprodukt und ersetzt keine ärztliche Beratung. Maßgeblich ist immer die Verpackung. Bei gesundheitlichen Fragen wende dich an Fachleute.';

export const fragen = {
  ueberschrift: 'Fragen und Antworten',
  liste: [
    {
      frage: 'Woher kommen die Daten?',
      antwort: [
        'Die Angaben zu Produkten kommen aus der offenen Datenbank Open Food Facts. Eine Gemeinschaft trägt dort ein, was auf der Verpackung steht. Die Angaben können unvollständig oder veraltet sein.',
        'Die Rezepte stammen aus offenen Rezeptsammlungen; Quelle und Lizenz sind bei jedem Rezept verlinkt. Die Nährwerte der Rezepte sind aus den rohen Zutaten berechnet, mit dem Bundeslebensmittelschlüssel (BLS 4.0).',
      ],
    },
    {
      frage: 'Was passiert mit meinen Angaben?',
      antwort: [
        'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst. FoodAsu braucht kein Konto und zeigt keine Werbung. Beim Scannen fragt FoodAsu mit dem Strichcode bei der offenen Datenbank Open Food Facts nach und lädt von dort Produktangaben und Produktbild.',
      ],
      verweis: { vor: 'Alles Weitere steht in der ', text: 'Datenschutzerklärung', nach: '.', ziel: '/datenschutz.html' },
    },
    {
      frage: 'Ersetzt FoodAsu die Verpackung?',
      antwort: [
        'Nein. FoodAsu zeigt, was laut Daten im Produkt ist. Daten können fehlen oder veraltet sein. Maßgeblich ist immer die Verpackung.',
        MEDIZIN,
      ],
    },
    {
      frage: 'Was bedeutet „Angaben unvollständig“?',
      antwort: [
        'Dann fehlt in den Daten die Zutatenliste, oder sie ist nicht vollständig erfasst. FoodAsu schreibt in dem Fall „Angaben unvollständig, Verpackung prüfen“ und nicht „Kein Konflikt laut Daten“.',
      ],
    },
    {
      frage: 'Brauche ich ein Konto?',
      antwort: ['Nein. FoodAsu funktioniert ohne Registrierung.'],
    },
    {
      frage: 'Wo bekomme ich FoodAsu?',
      antwort: [
        'FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. Die App kommt für Android in den Play Store. Eine Version fürs iPhone ist geplant.',
      ],
    },
  ],
};
