// Seite für geteilte Profile /p/ (AP-114; Vorgabe „Liste per Link und Profil teilen“ der Projektleitung vom
// 08.11.2026, Abschnitte 3, 4.4, 7a und 8.1). Das Profil steckt im Link hinter dem # und geht nie an den Server; das
// Skript der Seite (src/skripte/profil_seite.mjs) liest es nur im Browser und speichert nichts. noindex, nicht in der
// Sitemap, nicht in llms.txt, nicht im Menü. Profil teilen kommt mit Pro (Alis Entscheidung 09.11.2026, 13:06); auf
// der Seite steht trotzdem nirgends „Pro“, kein Kaufhinweis und kein Hinweis auf eine kommende Funktion.
// Alle Wortlaute stehen hier; sie brauchen noch Alis Ja (Bericht AP-114). Platzhalter in geschweiften Klammern setzt
// das Skript ein: {name} ist der Name der Person (n im Umschlag), {von} der Name dessen, der teilt (from), {anzahl}
// die Zahl der Einträge für eine neuere Version. Die Namen der Einträge und Stufen kommen nicht von hier, sondern aus
// src/daten/teilen_profil.json (erzeugt aus der App). Die Fehlerzustände nimmt die Seite wortgleich von /l/.

export const profilSeite = {
  adresse: '/p/',
  // Fester Titel der Seite (Vorgabe 3.1): Die Vorschau in WhatsApp sieht den Teil hinter dem # nie.
  titelSeite: 'Profil von FoodAsu',
  beschreibung: 'Ein Profil, das dir jemand mit FoodAsu geschickt hat: was eine Person meidet, damit du beim Einkaufen und Kochen daran denken kannst.',
  // Teilen-Bild ohne Inhalt des Profils (gebaut mit node tools/teilen_bild_liste.mjs profil).
  bild: { pfad: '/bilder/profil-teilen.jpg', satz: ['Ein Profil für dich.', 'Was jemand meidet, auf einen Blick.'] },
  // Kopf vor dem Lesen des Links und ohne JavaScript.
  ueberzeile: 'FoodAsu',
  titel: 'Profil',
  ohneSkript: 'Das Profil steckt im Link. Damit es hier erscheint, braucht dein Browser JavaScript.',
  // Karte zur App mit beiden Abzeichen (Vorgabe 8.1); Satz zur Verfügbarkeit wortgleich wie auf der übrigen Website
  // (VERFUEGBAR in src/daten/startseite.mjs; nicht importiert, weil diese Datei ins Skript der Seite geht; npm run
  // pruefen vergleicht beide).
  app: {
    titel: 'FoodAsu fürs Handy',
    satz: 'FoodAsu gibt es für Android im Play Store und fürs iPhone im App Store.',
  },
};

// Texte, die das Skript einsetzt (stehen als JSON in der Seite; npm run pruefen lässt die Wortlisten darüber laufen).
export const profilTexte = {
  ueberzeile: 'Profil',
  titel: 'Profil von {name}',
  von: 'Geteilt von {von}',
  // Vorschlag: ein Satz, was die Seite ist.
  satz: 'Was {name} meidet, damit du beim Einkaufen und Kochen daran denken kannst.',
  listeTitel: 'Was {name} meidet',
  listeTitelOhneName: 'Einträge',
  leer: 'Für {name} ist nichts eingetragen.',
  neuerEiner: 'Ein Eintrag ist für eine neuere FoodAsu-Version.',
  neuerMehr: '{anzahl} Einträge sind für eine neuere FoodAsu-Version.',
  verpackung: 'Maßgeblich ist immer die Verpackung.',
  oeffnen: 'In FoodAsu öffnen',
  // Ohne # in der Adresse.
  leerSeite: {
    titel: 'Profil',
    text: 'Hier erscheint ein Profil, das dir jemand mit FoodAsu geschickt hat. Öffne dazu den ganzen Link aus der Nachricht.',
  },
};
