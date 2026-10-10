// Bereich "So geht's" (AP-15 Teil B2, Karte C, AP-18 Teil E): eine Übersicht und sechs Kapitel. Die Begriffe stehen
// so da, wie sie in der App heißen (Stand 0.14.3); beschrieben ist nur, was die App kann. Wortregeln nach Konzept v4,
// Abschnitt 1: keine Versprechen, im Zweifel der Hinweis auf die Verpackung.
// Pflege-Regel: Jedes Paket mit einer sichtbaren neuen Funktion zieht neben der Einführung in der App auch das
// passende Kapitel hier nach. Alle Texte dieser Datei gehen mit "npm run texte" in die Datei
// Website_Texte_SoGehts.md; geändert wird hier.
//
// Ein Abschnitt ("teile") hat der Reihe nach: "einleitung" (ein Absatz), "schritte" (nummeriert), "liste" (Begriff
// und Erklärung), "absaetze" und "extern" (ein Link nach außen). Alles außer dem Titel kann fehlen.
//
// Bilder: Bildschirmfotos der App mit erfundenem Beispielhaushalt (public/bilder/sogehts, gebaut mit
// tools/sogehts_bilder.py). "film" nennt eine kurze Schleife ohne Ton (WebM), die nur mit Bewegung läuft; ohne
// Bewegung steht ihr Standbild da.

export const BEREICH = '/so-gehts/';

export const uebersicht = {
  titel: "So geht's",
  vorspann: 'Sechs kurze Kapitel, vom ersten Start bis zum Backup. Die Begriffe stehen hier so, wie sie in der App heißen.',
  kapitelWort: 'Kapitel',
  lesen: 'Kapitel lesen',
  hinweis: 'FoodAsu zeigt, was laut Daten in einem Produkt ist. Daten können fehlen oder veraltet sein. Maßgeblich ist immer die Verpackung.',
  fragen: { vor: 'Kurze Antworten auf häufige Fragen stehen unter ', text: 'Fragen', nach: '.', ziel: '/fragen/' },
};

// Texte, die auf jeder Kapitelseite gleich sind.
export const rahmen = {
  uebersicht: 'Alle Kapitel',
  zurueck: 'Voriges Kapitel',
  weiter: 'Nächstes Kapitel',
  inhalt: 'In diesem Kapitel',
  bilder: 'Bildschirmfotos',
  bild: 'Die Bildschirmfotos zeigen die App mit einem erfundenen Beispielhaushalt.',
  filmHinweis: 'Kurze Schleife ohne Ton.',
  mehr: 'Weiterlesen',
};

export const kapitel = [
  {
    nummer: 1,
    slug: 'erste-schritte',
    titel: 'Erste Schritte',
    kurz: 'Installieren, die Einführung und die Startseite.',
    vorspann: 'FoodAsu installieren, die Einführung ansehen und die Startseite kennenlernen.',
    bilder: [
      { datei: 'start', alt: 'Startseite von FoodAsu: zuletzt gescannte Produkte mit ihrem Ergebnis, die Karte „Deine Listen“, das Rezept des Tages und der Haushalt.', unterschrift: 'Die Startseite' },
    ],
    teile: [
      {
        titel: 'Installieren',
        absaetze: [
          'FoodAsu ist eine App für Android und kommt über Google Play auf dein Handy. FoodAsu ist in der Beta: Sobald die App für alle im Play Store steht, findest du den Weg dorthin auf dieser Website. Eine Version fürs iPhone ist in Arbeit.',
          'Ein Konto brauchst du nicht. Du gibst keinen Namen und keine E-Mail-Adresse ein, um die App zu nutzen.',
        ],
      },
      {
        titel: 'Die Einführung',
        absaetze: [
          'Beim ersten Start führt dich FoodAsu in kurzen Schritten durch die App: Startseite, Haushalt, Scannen, Produktkarte, Rezepte und Einkaufslisten. Mit „Weiter“ gehst du zum nächsten Schritt, mit „Überspringen“ beendest du die Einführung.',
          'Nach einem Update zeigt dir „Neu in FoodAsu“ nur die Schritte, die dazugekommen sind.',
        ],
      },
      {
        titel: 'Die Einführung noch einmal ansehen',
        absaetze: [
          'Auf der Startseite öffnet der Knopf „Hilfe“ oben rechts, links vom Zahnrad, das Blatt „Anleitung“. Mit „Einführung erneut ansehen“ beginnt die Führung von vorn.',
          'Denselben Weg gibt es in den Einstellungen unter „Hilfe und Feedback“, Zeile „Anleitung“.',
        ],
      },
      {
        titel: 'Die Startseite',
        absaetze: [
          'Die Startseite zeigt deine zuletzt gescannten Produkte, die Karte „Deine Listen“, das „Rezept des Tages“ und deinen Haushalt. Die Kamera bleibt aus, bis du scannst.',
          'Unten wechselst du zwischen Start, Listen, Rezepte und Haushalt. Der runde Knopf in der Mitte öffnet den Scanner.',
        ],
      },
      {
        titel: 'Hell oder dunkel',
        absaetze: [
          'FoodAsu ist hell, unabhängig von der Einstellung deines Handys. Wer es lieber dunkel mag, schaltet in den Einstellungen unter „Darstellung“ den Schalter „Dunkler Modus“ ein. Die Wahl gilt sofort und bleibt gespeichert.',
        ],
      },
      {
        titel: 'Schneller starten',
        absaetze: [
          'Drücke lange auf das App-Symbol und wähle „Scannen“ oder „Liste“. So öffnet sich der Scanner oder deine Einkaufsliste direkt.',
        ],
      },
    ],
  },
  {
    nummer: 2,
    slug: 'haushalt-und-meiden',
    titel: 'Haushalt anlegen und Meiden',
    kurz: 'Personen anlegen, Einträge wählen, die drei Stufen.',
    vorspann: 'Lege für jede Person fest, was sie meidet, und wie deutlich FoodAsu darauf hinweist.',
    bilder: [
      { datei: 'person', alt: 'Seite „Person bearbeiten“ in FoodAsu: für Schalenfrüchte und für Milch je die drei Stufen „Auf keinen Fall“, „Meiden“ und „Lieber nicht“ mit ihrer Erklärung.', unterschrift: 'Die drei Stufen je Eintrag' },
    ],
    teile: [
      {
        titel: 'Wozu der Haushalt da ist',
        absaetze: [
          'Im Reiter Haushalt legst du für jede Person fest, was sie meidet, etwa Milch, Erdnüsse oder Schweinefleisch. Beim Scannen zeigt die App dann, wen ein Produkt laut Daten betrifft.',
          'Ohne Haushalt zeigt die App die Angaben zu einem Produkt ohne Urteil.',
        ],
      },
      {
        titel: 'Person hinzufügen',
        schritte: [
          'Öffne den Reiter Haushalt und tippe auf „Person hinzufügen“.',
          'Gib einen Namen oder ein Kürzel ein. Er bleibt nur auf diesem Gerät.',
          'Tippe unter „Was meidet …?“ an, was die Person meidet.',
          'Wähle unter „Wie streng?“ für jeden Eintrag die Stufe und tippe auf „Speichern“.',
        ],
        absaetze: [
          'Vor der ersten Person zeigt die App den Hinweis „Gut zu wissen“: Die Angaben zu Produkten stammen aus der offenen Datenbank Open Food Facts. Sie können fehlen oder falsch sein. Maßgeblich ist immer die Verpackung.',
        ],
      },
      {
        titel: 'Was du auswählen kannst',
        einleitung: 'Die Einträge stehen in drei Gruppen:',
        liste: [
          { name: 'Zutaten', text: 'Gluten, Krebstiere, Eier, Fisch, Erdnüsse, Soja, Milch, Schalenfrüchte, Sellerie, Senf, Sesam, Sulfite, Lupinen und Weichtiere.' },
          { name: 'Ernährungsform', text: 'Vegan und Vegetarisch.' },
          { name: 'Weitere', text: 'Schweinefleisch, Alkohol, Gelatine und Palmöl.' },
        ],
      },
      {
        titel: 'Die drei Stufen',
        einleitung: 'Jeder Eintrag beginnt mit der strengsten Stufe. Du kannst sie unter „Wie streng?“ lockern.',
        liste: [
          { name: 'Auf keinen Fall', text: 'Warnt bei Treffern und Spuren und hebt unvollständige Angaben deutlich hervor.' },
          { name: 'Meiden', text: 'Warnt bei Treffern, Spuren werden nicht gemeldet.' },
          { name: 'Lieber nicht', text: 'Zeigt nur einen dezenten Hinweis, keine Warnung.' },
        ],
      },
      {
        titel: 'Ändern, sortieren, löschen',
        absaetze: [
          'Im Reiter Haushalt hat jede Person eine Karte. Ein Tipp auf die Karte öffnet die Person: Dort änderst du Namen, Einträge und Stufen. Zum Sortieren drückst du lange auf eine Karte und ziehst sie.',
          'Löschst du eine Person, entfernt die App sie und alles, was sie meidet, von diesem Gerät. Das lässt sich nicht rückgängig machen.',
        ],
      },
      {
        titel: 'Wo die Angaben bleiben',
        absaetze: [
          'Was dein Haushalt meidet, bleibt nur auf deinem Handy, außer du exportierst es selbst. Wie das geht, steht im Kapitel „Deine Daten“.',
        ],
      },
    ],
    verweise: [{ text: 'Deine Daten: Export, Import und Backup', ziel: '/so-gehts/deine-daten/' }],
  },
  {
    nummer: 3,
    slug: 'scannen-und-urteil',
    titel: 'Scannen und das Urteil verstehen',
    kurz: 'Strichcode scannen und die Produktkarte lesen.',
    vorspann: 'Strichcode scannen und auf der Produktkarte lesen, wen ein Produkt laut Daten betrifft.',
    film: { datei: 'scannen', alt: 'Scanner von FoodAsu: Die Kamera erfasst einen Strichcode, dann erscheint die Produktkarte eines Müslis mit dem Ergebnis „Nicht für Mia und Jonas: enthält Schalenfrüchte und Gluten“ und den drei Personen des Haushalts.', unterschrift: 'Scannen, dann das Ergebnis für den Haushalt' },
    bilder: [
      { datei: 'warum', alt: 'Produktkarte mit geöffneter Erklärung „Warum?“: „Laut Zutatenliste: Gluten“ und „Laut Spurenangabe: Schalenfrüchte“ mit den betroffenen Personen, darunter die Quelle Open Food Facts und der Satz „Maßgeblich ist die Verpackung.“', unterschrift: 'Die Erklärung unter „Warum?“' },
    ],
    teile: [
      {
        titel: 'Scannen',
        absaetze: [
          'Tippe auf den runden Knopf in der Mitte der Leiste und halte die Kamera auf den Strichcode. Falls nötig, fragt FoodAsu dabei einmal nach der Erlaubnis für die Kamera. Die Kamera läuft nur im Scanner.',
          'Ohne Kamera geht es auch: Mit „EAN eintippen“ gibst du die Ziffern ein, die unter dem Strichcode stehen.',
          'Den Scanner verlässt du mit dem Knopf „Schließen“ oben links oder indem du auf der Kamerafläche nach unten wischst.',
        ],
      },
      {
        titel: 'Die Produktkarte',
        absaetze: [
          'Oben auf der Produktkarte steht das Ergebnis für deinen Haushalt, darunter für jede Person, was sie betrifft. Weiter unten folgen die Nährwerte je 100 g, der Nutri-Score, die Verarbeitung, die Zusatzstoffe und die Zutaten, soweit sie in den Daten stehen. Fehlt ein Wert, steht dort „keine Angabe“.',
        ],
      },
      {
        titel: 'Was die Ergebnisse bedeuten',
        liste: [
          { name: '„Nicht für Mia: enthält Milch“', text: 'Laut Daten ist etwas im Produkt, das Mia meidet. So lautet die Warnung bei den Stufen „Meiden“ und „Auf keinen Fall“.' },
          { name: '„Nicht für Mia: kann Spuren von Erdnüssen enthalten“', text: 'Laut Spurenangabe sind Spuren möglich. Vor Spuren warnt FoodAsu nur bei der Stufe „Auf keinen Fall“; bei „Meiden“ werden Spuren nicht gemeldet.' },
          { name: '„Hinweis für Mia: enthält Palmöl“', text: 'Ein dezenter Hinweis statt einer Warnung. So zeigt FoodAsu Einträge der Stufe „Lieber nicht“.' },
          { name: '„Angaben unvollständig, Verpackung prüfen“', text: 'In den Daten fehlt die Zutatenliste, oder sie ist nicht vollständig erfasst. FoodAsu schreibt dann nicht „Kein Konflikt laut Daten“.' },
          { name: '„Kein Konflikt laut Daten“', text: 'Für alle Personen und alle Einträge im Haushalt gibt es laut Daten keinen Konflikt. Daten können fehlen oder veraltet sein.' },
        ],
        absaetze: [
          'Die Namen und Einträge oben sind Beispiele. Maßgeblich ist immer die Verpackung.',
        ],
      },
      {
        titel: '„Warum?“',
        absaetze: [
          'Unter „Warum?“ siehst du, worauf ein Ergebnis beruht: wen es betrifft und ob die Angabe aus der Zutatenliste, aus der Auswertung der Zutaten oder aus der Spurenangabe stammt. Darunter steht die Quelle: Angaben aus der offenen Datenbank Open Food Facts.',
        ],
      },
      {
        titel: '„Verpackung gelesen“',
        absaetze: [
          'Fehlen Angaben, lies auf der Verpackung nach. Mit dem Knopf „Verpackung gelesen“ und „Ja, gelesen“ merkt sich FoodAsu, dass ihr das Produkt selbst geprüft habt. Auf der Karte steht dann „Von euch geprüft am …“ mit dem Datum.',
          'Die App merkt sich das für dieses Produkt, bis sich die Angaben oder euer Haushalt ändern. Über „Weitere Aktionen“ und „Prüfung aufheben“ nimmst du es zurück.',
        ],
      },
      {
        titel: '„Daten neu laden“',
        absaetze: [
          'FoodAsu speichert die Angaben zu einem gescannten Produkt auf deinem Handy. Über „Weitere Aktionen“ und „Daten neu laden“ fragt die App noch einmal bei Open Food Facts nach, etwa wenn dort etwas ergänzt wurde.',
        ],
      },
      {
        titel: 'Zuletzt gescannt',
        absaetze: [
          'Die Startseite zeigt unter „Zuletzt gescannt“ deine letzten Produkte mit ihrem Ergebnis. Ein Tipp öffnet die Produktkarte wieder, „Alle“ zeigt den ganzen Verlauf.',
        ],
      },
    ],
    verweise: [{ text: 'Haushalt anlegen und Meiden', ziel: '/so-gehts/haushalt-und-meiden/' }, { text: 'Fragen', ziel: '/fragen/' }],
  },
  {
    nummer: 4,
    slug: 'einkaufslisten',
    titel: 'Einkaufslisten',
    kurz: 'Listen anlegen, in die Liste scannen, als Text teilen.',
    vorspann: 'Listen anlegen, Einträge hinzufügen, Produkte direkt in die Liste scannen und die Liste als Text teilen.',
    film: { datei: 'auf-die-liste', alt: 'Auf der Produktseite wird „Auf die Liste“ angetippt, die Seite meldet „Auf ‚Wocheneinkauf‘ gesetzt“, dann steht das Produkt auf der Einkaufsliste „Wocheneinkauf“ mit ihren Warengruppen.', unterschrift: 'Von der Produktkarte auf die Liste' },
    bilder: [
      { datei: 'listen', alt: 'Übersicht „Deine Listen“ mit drei Listen und der Zahl der offenen Einträge; oben die eigene Liste eines Rezepts.', unterschrift: 'Die Übersicht „Deine Listen“, oben die Liste eines Rezepts' },
    ],
    teile: [
      {
        titel: 'Liste anlegen',
        absaetze: [
          'Im Reiter Listen legst du mit „Liste anlegen“ deine erste Liste an, jede weitere mit „Neue Liste“. Der Reiter zeigt immer die Übersicht deiner Listen mit der Zahl der offenen Einträge.',
          'Auf der Startseite zeigt die Karte „Deine Listen“, wie viele Listen du hast und welche du zuletzt benutzt hast. Ein Tipp öffnet die Übersicht.',
        ],
      },
      {
        titel: 'Einträge hinzufügen',
        absaetze: [
          'Tippe oben in das Feld „Hinzufügen“ und schreib, was du brauchst, zum Beispiel „2 Zwiebeln“ oder „500 g Mehl“. Beim Tippen schlägt FoodAsu passende Wörter vor.',
          'Ein Tipp auf einen Eintrag öffnet „Eintrag bearbeiten“: Name, Menge, Einheit, Notiz und Warengruppe. Bei einem gescannten Produkt öffnet der Tipp das Produkt.',
        ],
      },
      {
        titel: 'Warengruppen',
        absaetze: [
          'FoodAsu sortiert die Liste nach Warengruppen wie im Laden: Obst und Gemüse, Brot und Gebäck, Milch und Käse, Fleisch und Fisch, Vorrat, Getränke, Tiefkühl, Drogerie und Sonstiges. Passt eine Zuordnung nicht, änderst du sie unter „Eintrag bearbeiten“.',
        ],
      },
      {
        titel: 'Abhaken',
        absaetze: [
          'Ein Tipp auf das Kästchen hakt einen Eintrag ab. Erledigtes rutscht nach unten in den Bereich „Erledigt“ und lässt sich von dort zurückholen. „Erledigte löschen“ im Menü räumt die Liste auf.',
        ],
      },
      {
        titel: 'In die Liste scannen',
        absaetze: [
          'Der Scan-Knopf im Feld „Hinzufügen“ öffnet den Scanner für diese Liste: Jedes gescannte Produkt kommt direkt darauf.',
          'Auf jeder Produktkarte gibt es dafür auch die Zeile „Auf die Liste“. Hast du mehrere Listen, wählst du dort die Ziel-Liste.',
        ],
      },
      {
        titel: 'Hinweise auf der Liste',
        absaetze: [
          'Bei Einträgen steht, wen sie betreffen, wie bei den Rezepten. Das ist ein Hinweis, kein Urteil. Bei gescannten Produkten siehst du das Ergebnis für deinen Haushalt.',
        ],
      },
      {
        titel: 'Als Text teilen',
        absaetze: [
          'Im Menü „Weitere Aktionen“ schickst du mit „Als Text teilen“ die offenen Einträge als Text an eine App deiner Wahl. Der Text enthält keine Personen, keine Hinweise und keine Urteile.',
        ],
      },
      {
        titel: 'Vom Einkauf zum Kochen',
        absaetze: [
          'In jeder Liste zeigt der Knopf „Was kann ich damit kochen?“ Rezepte, für die schon vieles auf deiner Liste steht. Mehr dazu im Kapitel „Rezepte“.',
        ],
      },
    ],
    verweise: [{ text: 'Rezepte', ziel: '/so-gehts/rezepte/' }, { text: 'Scannen und das Urteil verstehen', ziel: '/so-gehts/scannen-und-urteil/' }],
  },
  {
    nummer: 5,
    slug: 'rezepte',
    titel: 'Rezepte',
    kurz: 'Hinweise bei Zutaten, Portionen, vom Rezept auf die Liste.',
    vorspann: 'Rezepte finden, Hinweise bei den Zutaten lesen und fehlende Zutaten auf eine Liste setzen.',
    film: { datei: 'kochen', alt: 'In der Einkaufsliste steht der Knopf „Was kann ich damit kochen?“; danach erscheinen Rezepte mit der Zahl der Zutaten, die schon auf der Liste stehen, und dem Knopf „Fehlende auf die Liste“.', unterschrift: '„Was kann ich damit kochen?“' },
    bilder: [
      { datei: 'rezept', alt: 'Rezeptseite „Pizza Margherita“ in FoodAsu: Symbolbild, Wahl der Portionen und bei der Zutat Weizenmehl der Hinweis „Enthält Gluten, betrifft Jonas“.', unterschrift: 'Ein Rezept mit Hinweisen bei den Zutaten' },
    ],
    teile: [
      {
        titel: 'Rezepte finden',
        absaetze: [
          'Im Reiter Rezepte findest du Gerichte aus vielen Ländern. Du suchst nach Titel oder Zutat oder tippst auf ein Land oder eine Kategorie, um die Auswahl einzugrenzen.',
          'Mit dem Herz merkst du dir ein Rezept. Gemerkte Rezepte stehen im Reiter Rezepte ganz oben unter „Gemerkt“.',
          'Jedes Rezept zeigt ein gezeichnetes Bild. Es ist ein Symbolbild und kann vom fertigen Gericht abweichen. Was im Gericht ist, steht in der Zutatenliste.',
        ],
      },
      {
        titel: 'Hinweise bei Zutaten',
        absaetze: [
          'Bei Zutaten steht, wen sie betreffen: „enthält“, „meist mit“ oder „je nach Produkt“. Das ist ein Hinweis, kein Urteil. Ein Urteil gibt es erst, wenn du ein Produkt scannst.',
          'Rezepte, die etwas enthalten, das jemand im Haushalt „Auf keinen Fall“ möchte, blendet FoodAsu aus. Die App schreibt dazu, wie viele Rezepte ausgeblendet sind; mit „Anzeigen“ holst du sie zurück.',
        ],
      },
      {
        titel: 'Portionen',
        absaetze: [
          'Auf der Rezeptseite stellst du mit „Weniger“ und „Mehr“ die Portionen ein. Die Mengen der Zutaten rechnet FoodAsu mit. Wo das nicht geht, steht „Menge wie in der Quelle, nicht umgerechnet“.',
        ],
      },
      {
        titel: 'Nährwerte',
        absaetze: [
          'Rezepte zeigen die Nährwerte pro Portion oder je 100 g. Die Flammen zeigen die Energiedichte, von sehr leicht bis gehaltvoll. Berechnet sind die Werte aus den rohen Zutaten; lassen sich nicht alle Zutaten berechnen, steht dort „Nährwerte unvollständig“.',
        ],
      },
      {
        titel: 'Fehlende Zutaten auf die Liste',
        absaetze: [
          'Unter den Zutaten eines Rezepts setzt du mit „Fehlende Zutaten auf die Liste“ alles, was noch fehlt, auf eine eigene Liste mit dem Namen des Rezepts. Grundzutaten wie Salz und Öl sind abgewählt.',
          'In dieser Liste steht oben, für welches Rezept du einkaufst. Ein Tipp auf die Zeile öffnet das Rezept wieder.',
        ],
      },
      {
        titel: '„Was kann ich damit kochen?“',
        absaetze: [
          'In jeder Liste zeigt dir dieser Knopf Rezepte, für die schon vieles auf deiner Liste steht, und was noch fehlt. Mit „Fehlende auf die Liste“ setzt du das Fehlende mit einem Tipp dazu, auf die Liste, von der du gekommen bist.',
        ],
      },
      {
        titel: 'Beim Kochen',
        absaetze: [
          'Mit dem Schalter „Bildschirm anlassen“ bleibt der Bildschirm an, solange die Rezeptseite offen ist.',
          'Woher ein Rezept stammt, steht unter „Quelle und Lizenz“.',
        ],
      },
    ],
    verweise: [{ text: 'Rezepte auf dieser Website', ziel: '/rezepte/' }, { text: 'Einkaufslisten', ziel: '/so-gehts/einkaufslisten/' }],
  },
  {
    nummer: 6,
    slug: 'deine-daten',
    titel: 'Deine Daten: Export, Import und Backup',
    kurz: 'Export und Import, Backup von Android, fehlende Produkte.',
    vorspann: 'Was auf deinem Handy liegt, wie du deinen Haushalt mitnimmst und was das Backup von Android enthält.',
    bilder: [
      { datei: 'einstellungen', alt: 'Einstellungen von FoodAsu mit der Karte „Haushalt“: „Haushalt exportieren“, „Haushalt importieren“ und „Hinweis zu den Angaben“.', unterschrift: 'Export und Import in den Einstellungen' },
    ],
    teile: [
      {
        titel: 'Wo deine Daten liegen',
        absaetze: [
          'FoodAsu speichert alles, was du in der App anlegst, auf deinem Handy. Es gibt kein Konto und keinen Server von FoodAsu.',
          'Unter Einstellungen, „Über“, zeigt die Zeile „Datenstand“, wie viele Personen, Einträge, Produkte, Scans, Listen und Listeneinträge gespeichert sind.',
        ],
      },
      {
        titel: 'Haushalt exportieren',
        schritte: [
          'Öffne die Einstellungen mit dem Zahnrad oben rechts auf der Startseite.',
          'Tippe in der Karte „Haushalt“ auf „Haushalt exportieren“.',
          'Lies den Hinweis und tippe auf „Weiter“.',
          'Wähle, wo die Datei gespeichert wird.',
        ],
        absaetze: [
          'Die Datei enthält die Namen oder Kürzel der Personen und ihre Einträge unter „Meiden“ mit der Stufe. Sie enthält also Angaben dazu, was dein Haushalt meidet. Teile sie nur mit Personen, denen du vertraust.',
        ],
      },
      {
        titel: 'Haushalt importieren',
        absaetze: [
          'Mit „Haushalt importieren“ wählst du eine exportierte Datei. FoodAsu zeigt zuerst, welche Personen darin stehen; am Haushalt ändert sich noch nichts.',
          'Dann wählst du: „Ergänzen“ nimmt die Personen aus der Datei zu deinem Haushalt dazu. „Ersetzen“ löscht alle Personen in der App und setzt die aus der Datei an ihre Stelle. Mit „Übernehmen“ gilt die Wahl.',
        ],
      },
      {
        titel: 'Backup von Android',
        absaetze: [
          'Android kann ein Backup deiner App-Daten anlegen, wenn du das in den Einstellungen deines Handys eingeschaltet hast. FoodAsu erlaubt das für diese Daten: Produktangaben, Verlauf, eigene Produktnamen, gemerkte Rezepte, Einkaufslisten samt den gemerkten Wörtern und die Einstellungen.',
          'Nie im Backup sind die Angaben zu Haushalt und Meiden. Nach einer Wiederherstellung auf einem neuen Handy legst du deinen Haushalt neu an oder übernimmst ihn mit einer Exportdatei.',
        ],
      },
      {
        titel: 'Löschen',
        absaetze: [
          'Personen löschst du im Reiter Haushalt, Listen und Einträge im Reiter Listen. In den Einstellungen entfernst du mit „Verlauf löschen“ alle Einträge unter „Zuletzt gescannt“ und mit „Vorschläge der Listen löschen“ die Wörter, die FoodAsu beim Hinzufügen vorschlägt.',
        ],
      },
      {
        titel: 'Fehlt ein Produkt?',
        absaetze: [
          'Die Angaben zu Produkten kommen von Open Food Facts, einer offenen Datenbank, die von Freiwilligen gepflegt wird. Ist ein Produkt dort nicht erfasst oder fehlt die Zutatenliste, schreibt FoodAsu das dazu und bittet dich, die Verpackung zu prüfen.',
          'Du kannst das Produkt bei Open Food Facts selbst ergänzen, auf der Website von Open Food Facts oder in deren App. Das geschieht außerhalb von FoodAsu; FoodAsu überträgt dafür nichts. Danach holst du die neuen Angaben mit „Daten neu laden“.',
        ],
        extern: { text: 'Open Food Facts', ziel: 'https://de.openfoodfacts.org' },
      },
      {
        titel: 'Mehr dazu',
        absaetze: [
          'Was FoodAsu speichert und überträgt, steht vollständig in der Datenschutzerklärung.',
        ],
      },
    ],
    verweise: [{ text: 'Datenschutzerklärung', ziel: '/datenschutz.html' }, { text: 'Fragen', ziel: '/fragen/' }],
  },
];

export const adresse = (eintrag) => `${BEREICH}${eintrag.slug}/`;
