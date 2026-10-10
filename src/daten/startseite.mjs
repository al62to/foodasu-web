// Alle Texte der Startseite an einer Stelle (AP-15 Teil B, Abschnitte 1 bis 8). Von Ali am 09.10.2026 freigegeben.
// Die Datei Website_Texte_Startseite.md entsteht daraus mit tools/texte_ausgeben.mjs.
export const kopfdaten = {
  titel: 'FoodAsu: Lebensmittel-Scanner für den ganzen Haushalt',
  beschreibung:
    'Strichcode scannen und sehen, ob laut den Angaben etwas drin ist, das jemand bei dir zu Hause meidet. In der App: Einkaufslisten und über 300 Rezepte.',
};

export const kopf = {
  ueberschrift: ['Passt es für ', 'alle', '?'],
  text: 'Du scannst den Strichcode und siehst, ob laut den Angaben etwas drin ist, das jemand bei dir zu Hause meidet. Für jede Person einzeln.',
  aufruf: 'Bald im Play Store',
  zweiterKnopf: 'In drei Schritten',
  stand: 'FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. Eine Version fürs iPhone ist in Arbeit.',
  handy: {
    beschreibung:
      'Beispiel aus der App: Ein Müsli wird gescannt. Das Urteil lautet „Nicht für Mia: enthält Schalenfrüchte“. Für Jonas und Elif steht „Kein Konflikt laut Daten“.',
    produkt: 'Nussmüsli',
    zusatz: '500 g',
    urteil: 'Nicht für Mia: enthält Schalenfrüchte',
    personen: [
      { name: 'Mia', ergebnis: 'enthält' },
      { name: 'Jonas', ergebnis: 'Kein Konflikt laut Daten' },
      { name: 'Elif', ergebnis: 'Kein Konflikt laut Daten' },
    ],
    knopf: 'Warum?',
  },
  begriffe: ['Nüsse', 'Gluten', 'Schweinefleisch', 'Palmöl'],
};

export const wort = {
  vorsatz: 'Einkaufen ohne',
  woerter: ['Nüsse', 'Gluten', 'Schweinefleisch', 'Alkohol', 'Palmöl', 'Sesam', 'Milch'],
  absaetze: [
    'In vielen Haushalten isst nicht jeder alles: kein Schweinefleisch für den einen, keine Nüsse für die andere, keine Milch fürs Kind. Im Laden heißt das: Packung umdrehen, Kleingedrucktes lesen, bei jedem Produkt von vorn.',
    'Deshalb habe ich FoodAsu gebaut. Du legst einmal fest, was jede Person bei dir zu Hause meidet. Danach reicht ein Scan.',
  ],
  unterschrift: 'Ali Tonc, Entwickler von FoodAsu',
};

export const schritte = {
  // Überschrift und Schritt 3 weichen von AP-15 Teil B ab ("Scannen, Warum?, Auf die Liste"); von Ali und der
  // Projektleitung am 09.10.2026 freigegeben (Nachtrag SEO, Punkt 8).
  ueberschrift: 'FoodAsu in drei Schritten',
  liste: [
    {
      titel: 'Scannen',
      text: 'Halte den Strichcode vor die Kamera. FoodAsu zeigt für jede Person einzeln, was die Daten zum Produkt sagen.',
    },
    {
      titel: 'Warum?',
      text: 'Ein Tipp auf „Warum?“ zeigt, welche Zutat oder welche Spurenangabe hinter dem Hinweis steht.',
    },
    {
      titel: 'Kochen',
      text: 'FoodAsu schlägt dir zu deiner Einkaufsliste Rezepte vor und zeigt, was noch fehlt. Es geht auch umgekehrt: Aus einem Rezept setzt du die fehlenden Zutaten auf die Liste.',
    },
  ],
};

export const funktionen = {
  ueberschrift: 'Scanner, Einkaufsliste und Rezepte in einer App',
  karten: [
    {
      kennung: 'scanner',
      titel: 'Scannen und sofort sehen',
      text: 'FoodAsu prüft Zutaten und Spurenangaben für jede Person einzeln. Das Ergebnis heißt „enthält“, „Spuren“, „Angaben unvollständig“ oder „Kein Konflikt laut Daten“.',
    },
    {
      kennung: 'haushalt',
      titel: 'Dein Haushalt',
      text: 'Für jede Person eigene Einträge. Drei Stufen von „Lieber nicht“ bis „Auf keinen Fall“; die strengste warnt auch bei Spuren.',
    },
    {
      kennung: 'rezepte',
      titel: 'In der App: über 300 Rezepte aus 25 Ländern',
      text: 'Jedes mit einem Symbolbild. Bei den Zutaten steht, wen sie betreffen.',
      bild: 'Symbolbild: Pizza Margherita',
      datei: 'pizza-margherita',
    },
    {
      kennung: 'liste',
      titel: 'Einkaufsliste, sortiert wie im Supermarkt',
      text: 'Schreib auf, was du brauchst, oder setz die fehlenden Zutaten eines Rezepts auf die Liste. Betrifft ein Eintrag jemanden im Haushalt, steht ein Hinweis dabei.',
      beispiel: ['Tomaten', 'Mozzarella', 'Basilikum'],
    },
    {
      kennung: 'kochen',
      titel: 'Was kann ich damit kochen?',
      text: 'Rezepte zu deiner Einkaufsliste: FoodAsu zeigt Gerichte, für die schon Zutaten auf der Liste stehen, und was noch fehlt.',
    },
    {
      kennung: 'daten',
      titel: 'Kein Konto, keine Werbung, kein Verkauf von Daten.',
      text: 'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst.',
    },
  ],
};

export const zahlen = {
  ueberschrift: 'Die App in Zahlen',
  zutatenband: [
    'Nüsse (Schalenfrüchte)', 'Erdnüsse', 'Gluten', 'Milch', 'Eier', 'Soja', 'Sesam', 'Sellerie', 'Senf', 'Fisch',
    'Krebstiere', 'Weichtiere', 'Lupinen', 'Sulfite', 'Schweinefleisch', 'Gelatine', 'Alkohol', 'Palmöl',
    'vegetarisch', 'vegan',
  ],
  rezeptband: [
    'Wiener Schnitzel', 'Pizza Margherita', 'Ratatouille', 'Baklava', 'Bibimbap', 'Massaman-Curry',
    'Mercimek çorbası',
  ],
  zaehler: [
    { zahl: 306, wort: 'Rezepte in der App' },
    { zahl: 25, wort: 'Länder' },
    { zahl: 20, wort: 'Einträge zum Meiden' },
    { zahl: 0, wort: 'Werbung' },
  ],
};

export const vorschau = {
  ueberschrift: 'Kochen für alle am Tisch',
  text: 'Bei den Zutaten steht, wen sie betreffen. Enthält ein Rezept etwas, das jemand auf keinen Fall will, blendet FoodAsu es aus und nennt die Zahl der ausgeblendeten Rezepte.',
  // "datei" ist der Name des Bildes unter public/bilder/rezepte (gebaut mit tools/bilder_bauen.py).
  karten: [
    { titel: 'Wiener Schnitzel', datei: 'wiener-schnitzel' },
    { titel: 'Pizza Margherita', datei: 'pizza-margherita' },
    { titel: 'Ratatouille', datei: 'ratatouille' },
    { titel: 'Baklava', datei: 'baklava' },
  ],
  kennzeichnung: 'Symbolbild',
  // Auf der Website stehen 40 Rezepte, alle über 300 gibt es nur in der App (Ali, 09.10.2026).
  hinweis: 'Über 300 Rezepte gibt es in der App, 40 davon stehen hier.',
  link: '40 Rezepte auf der Website ansehen',
};

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
        'FoodAsu ist kein medizinisches Hilfsmittel und ersetzt keine ärztliche Beratung.',
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
        'FoodAsu ist in der Beta. Wir bauen laufend neue Funktionen ein und freuen uns über dein Feedback. Die App kommt für Android in den Play Store. Eine Version fürs iPhone ist in Arbeit.',
      ],
    },
  ],
};

export const fuss = {
  links: { datenschutz: 'Datenschutz', offenlegung: 'Offenlegung', lizenzen: 'Lizenzen', quellen: 'Quellen und Lizenzen', kontakt: 'Kontakt per E-Mail' },
  hinweis: 'Maßgeblich ist die Verpackung.',
  auftritte: {
    facebook: 'FoodAsu bei Facebook',
    instagram: 'FoodAsu bei Instagram',
    storeBald: 'Bald im Play Store',
    storeLink: 'FoodAsu bei Google Play',
  },
};

// Texte des Gerüsts außerhalb der Startseite.
export const geruest = {
  sprung: 'Zum Inhalt springen',
  marke: 'FoodAsu, Startseite',
  navigation: 'Hauptnavigation',
  menue: 'Menü',
  menueZu: 'Menü schließen',
  brotkrumen: 'Brotkrumen',
  recht: { datenschutz: 'Datenschutz', inhalt: 'Inhalt' },
  // Eigene Seite der Offenlegung (AP-17 Teil E1). Der Wortlaut kommt aus dem Baustein src/inhalte/offenlegung.html.
  offenlegung: { titel: 'Offenlegung', beschreibung: 'Offenlegung nach § 25 Mediengesetz für die Website foodasu.com.' },
  fragenSeite: {
    titel: 'Fragen und Antworten',
    beschreibung: 'Woher die Daten von FoodAsu kommen, was mit deinen Angaben passiert und warum die Verpackung maßgeblich bleibt.',
  },
  // Knopf der Startseite, der die Bewegung anhält (WCAG 2.2.2). Der Zustand gilt nur für den Besuch.
  bewegung: { anhalten: 'Bewegung anhalten', fortsetzen: 'Bewegung fortsetzen' },
  platzhalter: {
    soGehts: {
      titel: "So geht's",
      beschreibung: 'Die Anleitung zu FoodAsu: vom ersten Scan bis zur Einkaufsliste. Kommt bald.',
      text: 'Kommt bald. Hier entsteht die Anleitung zu FoodAsu, vom ersten Scan bis zur Einkaufsliste.',
    },
    rezepte: {
      titel: 'Rezepte',
      beschreibung: 'Die Rezepte aus FoodAsu, mit Hinweisen zu den Zutaten. Kommt bald.',
      text: 'Kommt bald. Hier findest du die Rezepte aus FoodAsu, mit Hinweisen zu den Zutaten.',
    },
  },
  // 404-Seite: Wortlaut und Aufbau nach dem Entwurf der Projektleitung (AP-16 Nachtrag Website, Punkt 2), von Ali
  // freigegeben. "themen" nennt die Adressen der sechs Themen; gibt es eine Seite beim Bauen nicht, fällt ihr Chip weg.
  nichtGefunden: {
    seitentitel: 'Seite nicht gefunden',
    etikett: 'Fehler 404',
    zahl: '404',
    titel: ['Diese Seite gibt es ', 'hier nicht.'],
    text: 'Vielleicht ist der Link veraltet oder hat einen Tippfehler. Von hier aus geht es weiter.',
    start: 'Zur Startseite',
    rezepte: 'Zu den Rezepten',
    themenTitel: 'Oder direkt zu einem Thema',
    themen: [
      { titel: 'Rezepte ohne Nüsse', ziel: '/rezepte/ohne-nuesse/' },
      { titel: 'Rezepte ohne Gluten', ziel: '/rezepte/ohne-gluten/' },
      { titel: 'Rezepte ohne Milch', ziel: '/rezepte/ohne-milch/' },
      { titel: 'Rezepte ohne Eier', ziel: '/rezepte/ohne-eier/' },
      { titel: 'Vegetarische Rezepte', ziel: '/rezepte/vegetarisch/' },
      { titel: 'Vegane Rezepte', ziel: '/rezepte/vegan/' },
    ],
    karte: {
      titel: 'Was ist FoodAsu?',
      text: 'Eine App für Android: Du scannst Lebensmittel beim Einkauf und siehst sofort, ob etwas drin ist, das du meidest.',
      // Der Knopf führt zu den drei Schritten der Startseite; sobald "So geht's" fertig ist, auf diese Seite umstellen.
      knopf: "So geht's",
      ziel: '/#schritte',
    },
    bilder: { karte: 'FoodAsu-App: Produktkarte nach dem Scan mit Urteil', start: 'FoodAsu-App: Startbildschirm' },
  },
  lizenzen: {
    titel: 'Lizenzen',
    beschreibung: 'Schriften, Daten, Bilder und Software, die diese Website verwendet, mit ihren Lizenzen.',
    einleitung: 'Diese Website verwendet die folgenden Schriften, Daten, Bilder und Programme.',
    eintraege: [
      { name: 'Plus Jakarta Sans', art: 'Schrift', lizenz: 'SIL Open Font License 1.1', ziel: 'https://openfontlicense.org/open-font-license-official-text/' },
      { name: 'Pacifico', art: 'Schrift im Logo', lizenz: 'SIL Open Font License 1.1', ziel: 'https://openfontlicense.org/open-font-license-official-text/' },
      { name: 'Astro', art: 'Programm, mit dem die Seiten gebaut werden', lizenz: 'MIT License', ziel: 'https://github.com/withastro/astro/blob/main/LICENSE' },
      { name: 'GSAP', art: 'Programm für die Animationen', lizenz: 'Standard „no charge“ GSAP License', ziel: 'https://gsap.com/standard-license' },
      {
        name: 'Bundeslebensmittelschlüssel (BLS) 4.0',
        art: 'Daten für die Nährwerte der Rezepte, herausgegeben vom Max Rubner-Institut (2025). Die Nährwerte sind eine eigene Berechnung aus den rohen Zutaten; das Max Rubner-Institut hat sie nicht geprüft.',
        lizenz: 'CC BY 4.0',
        ziel: 'https://creativecommons.org/licenses/by/4.0/deed.de',
        zusatz: { vor: ', DOI ', text: '10.25826/Data20251217-134202-0', ziel: 'https://doi.org/10.25826/Data20251217-134202-0' },
      },
    ],
    saetze: [
      { name: 'Rezepte', text: 'Die Rezepte stammen aus offenen Rezeptsammlungen. Quelle, Urheber, Lizenz und Änderungen stehen für jedes Rezept auf der Seite ', link: { text: 'Quellen und Lizenzen', ziel: '/quellen-und-lizenzen/' }, nach: '.' },
      { name: 'Bilder', text: 'Symbolbilder, mit Adobe Firefly erzeugt.' },
    ],
  },
};
