// Seite für geteilte Einkaufslisten /l/ (AP-112; Vorgabe „Liste per Link und Profil teilen“ der Projektleitung vom
// 08.11.2026, Abschnitte 3, 7 und 7a; Konzept 5.1 Punkt 6 und 5.3). Die Liste steckt im Link hinter dem # und geht
// nie an den Server; das Skript der Seite (src/skripte/liste_seite.mjs) liest sie nur im Browser. noindex, nicht in
// der Sitemap, nicht in llms.txt, nicht im Menü. Alle Wortlaute stehen hier; sie brauchen noch Alis Ja (Bericht
// AP-112). Platzhalter in geschweiften Klammern setzt das Skript ein: {absender} ist der Name dessen, der die Liste
// geschickt hat (a[by] im Umschlag), {ich} der eigene Name, {liste} der Name der Liste, {von} der Name aus statusVon.
// Nicht im Browser, mit Absicht: kein Scannen, kein „Passt für alle?“, keine eigenen Einträge.

export const listeSeite = {
  adresse: '/l/',
  // Fester Titel der Seite (Vorgabe 3.1): Die Vorschau in WhatsApp sieht den Teil hinter dem # nie.
  titelSeite: 'Einkaufsliste von FoodAsu',
  beschreibung: 'Eine Einkaufsliste, die dir jemand mit FoodAsu geschickt hat: beim Einkaufen abhaken und die Liste mit einem Link zurückschicken.',
  // Teilen-Bild ohne Inhalt der Liste (gebaut mit tools/teilen_bild_liste.mjs).
  bild: { pfad: '/bilder/liste-teilen.jpg', satz: ['Eine Einkaufsliste für dich.', 'Abhaken und zurückschicken.'] },
  // Kopf vor dem Lesen des Links und ohne JavaScript.
  ueberzeile: 'FoodAsu',
  titel: 'Einkaufsliste',
  ohneSkript: 'Die Einkaufsliste steckt im Link. Damit sie hier erscheint, braucht dein Browser JavaScript.',
  // Karte zur App mit beiden Abzeichen (Konzept 5.3), am Computer mit QR-Code.
  app: {
    titel: 'FoodAsu fürs Handy',
    satz: 'Mit FoodAsu siehst du beim Einkaufen, ob ein Produkt für alle passt.',
    qr: 'Mit dem Handy scannen, dann hast du die Liste dort.',
    qrBild: 'QR-Code mit dem Link zu dieser Einkaufsliste',
  },
};

// Texte, die das Skript einsetzt (stehen als JSON in der Seite; npm run pruefen lässt die Wortlisten darüber laufen).
export const listeTexte = {
  ueberzeile: 'Einkaufsliste von {absender}',
  ueberzeileOhneName: 'Einkaufsliste',
  stand: 'Stand {zeit}',
  fortschritt: '{erledigt} von {alle} erledigt',
  wach: 'Bildschirm anlassen',
  neuer: { text: 'Es gibt eine neuere Fassung dieser Liste.', knopf: 'Neuere Fassung zeigen' },
  ohneSpeicher: 'Dieser Browser merkt sich hier nichts. Deine Häkchen gehen beim Schließen verloren; schick sie vorher zurück.',
  name: {
    titel: 'Wie heißt du?',
    text: 'So sieht {absender}, was du erledigt hast.',
    textOhneName: 'So sieht man, was du erledigt hast.',
    textSenden: 'Bevor du die Häkchen schickst: Wie heißt du?',
    feld: 'Dein Name',
    speichern: 'Speichern',
    spaeter: 'Später',
    als: 'Du hakst ab als {ich}.',
    aendern: 'Name ändern',
  },
  liste: {
    titel: 'Einträge',
    erledigt: 'Erledigt',
    neu: 'neu',
    nichtBekommen: 'Nicht bekommen',
    nichtBekommenVon: 'nicht bekommen von {von}',
    zuruecknehmen: 'Zurücknehmen',
    erledigtVon: 'erledigt von {von}',
    gestrichenVon: 'gestrichen von {von}',
    gestrichen: 'gestrichen',
    // Namen der Knöpfe für Bildschirmleser.
    nichtBekommenName: '{eintrag}: nicht bekommen',
    zuruecknehmenName: '{eintrag}: zurücknehmen',
  },
  // Notiz des Absenders oben unter Absender und Stand (Nachtrag 09.11.2026).
  notiz: { von: 'Notiz von {von}', ohneName: 'Notiz zur Liste' },
  zurueck: {
    // Alis Wortlaut 08.11.2026, 23:50: „Liste an Papa zurückschicken“ (statt „Häkchen an Papa zurückschicken“).
    titel: 'Liste zurückschicken',
    text: 'Öffnet {absender} den Link in FoodAsu, stehen deine Häkchen in der Liste.',
    textOhneName: 'Öffnet man den Link in FoodAsu, stehen deine Häkchen in der Liste.',
    knopf: 'Liste an {absender} zurückschicken',
    knopfOhneName: 'Liste zurückschicken',
    // Notiz in beide Richtungen (Alis Wahl 09.11.2026, 00:08): freiwillig, höchstens 200 Zeichen, steht auch in der
    // Nachricht.
    notizFeld: 'Notiz für {absender} (freiwillig)',
    notizFeldOhneName: 'Notiz (freiwillig)',
    nachrichtNotiz: 'Notiz: {notiz}',
    fertigTitel: 'Alles erledigt.',
    fertigKnopf: '{absender} Bescheid geben?',
    fertigKnopfOhneName: 'Bescheid geben?',
    wege: 'So schickst du den Link:',
    whatsapp: 'Mit WhatsApp',
    sms: 'Als SMS',
    kopieren: 'Link kopieren',
    kopiert: 'Link kopiert',
    nichtKopiert: 'Kopieren ging nicht. Halte den Link gedrückt und kopiere ihn selbst.',
    // Nachrichten (Konzept 5.1 Punkt 6). Danach folgt in einer neuen Zeile der Link.
    nachricht: '{ich} hat bei „{liste}“ {erledigt} von {alle} Sachen erledigt.',
    nachrichtNicht: '{ich} hat bei „{liste}“ {erledigt} von {alle} Sachen erledigt, nicht bekommen: {nicht}.',
    nachrichtFertig: '{ich} hat „{liste}“ erledigt ({erledigt} von {alle}).',
    nachrichtFertigNicht: '{ich} hat „{liste}“ erledigt ({erledigt} von {alle}, nicht bekommen: {nicht}).',
  },
  browser: {
    titel: 'In diesem Browser',
    text: 'Deine Häkchen und dein Name bleiben nur hier in diesem Browser. Nach 60 Tagen ohne Öffnen löscht die Seite sie selbst.',
    entfernen: 'Liste aus diesem Browser entfernen',
  },
  // Zustände ohne Liste.
  leer: {
    titel: 'Einkaufsliste',
    text: 'Hier erscheint eine Einkaufsliste, die dir jemand mit FoodAsu geschickt hat. Öffne dazu den ganzen Link aus der Nachricht.',
  },
  kaputt: {
    titel: 'Dieser Link ist leider unvollständig.',
    text: 'Vielleicht ist beim Kopieren ein Teil verloren gegangen. Bitte um einen neuen Link, oder öffne ihn direkt aus der Nachricht.',
  },
  neuereVersion: {
    titel: 'Dieser Link ist für eine neuere FoodAsu-Version.',
    text: 'Diese Seite kann ihn noch nicht zeigen. Mit der neuesten Version von FoodAsu öffnest du ihn in der App.',
  },
  profil: {
    titel: 'Dieser Link gehört zu einem Profil.',
    text: 'Hier erscheinen nur Einkaufslisten. Öffne den Link mit FoodAsu auf deinem Handy.',
  },
  // Art h ohne App (Vorgabe 3.1, Alis Wortlaut 08.11.2026, 23:50): kurze Seite für den, der die Liste geschickt hat,
  // „Liste von Mama zurück“ (Name dessen, der zurückschickt) mit „In FoodAsu öffnen“.
  haekchen: {
    titel: 'Liste von {von} zurück',
    titelOhneName: 'Liste zurück',
    fuer: 'Einkaufsliste für {absender}',
    // Derselbe Wortlaut steht seit AP-113 auch in der Liste (Karte „FoodAsu fürs Handy“).
    oeffnen: 'In FoodAsu öffnen',
    text: '{von} hat {anzahl} Sachen auf deiner Liste abgehakt.',
    textEine: '{von} hat eine Sache auf deiner Liste abgehakt.',
    textFertig: '{von} hat alles erledigt.',
    textOhneName: 'Hier sind Häkchen für eine Einkaufsliste aus FoodAsu.',
    weiter: 'Öffne diesen Link auf dem Handy, auf dem du die Liste in FoodAsu hast. Mit der neuesten Version von FoodAsu kommen die Häkchen dann in deine Liste.',
  },
  entfernt: {
    titel: 'Die Liste ist aus diesem Browser entfernt.',
    text: 'Öffnest du den Link wieder, erscheint sie neu, ohne deine Häkchen.',
  },
};
