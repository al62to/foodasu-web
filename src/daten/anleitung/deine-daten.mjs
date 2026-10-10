// "So geht's", Kapitel "Einstellungen und deine Daten": Bereich "Einstellungen und Daten" der App (Stand 0.14.3).
// Die Adresse /so-gehts/deine-daten/ bleibt. Das Wort für die Datensicherung von Android ist hier durchgehend
// "Backup" (Wortregeln).
import { foto, link } from './hilfen.mjs';

export default {
  slug: 'deine-daten',
  titel: 'Einstellungen und deine Daten',
  kurz: 'Einstellungen, Export und Import, Backup, Löschen und Feedback.',
  vorspann: 'Was in den Einstellungen steht, was auf deinem Handy liegt und wie du deinen Haushalt mitnimmst.',
  teile: [
    {
      titel: 'Einstellungen öffnen',
      anker: 'einstellungen-oeffnen',
      funktionen: ['EINST-01'],
      nutzen: 'Das Zahnrad öffnet die Einstellungen mit den Abschnitten „Darstellung“, „Scanner“, „Verlauf und Vorschläge“, „Haushalt“, „Hilfe und Feedback“ und „Über“.',
      wo: 'Zahnrad oben rechts auf Start, Listen, Rezepte und Haushalt',
      fotos: [foto('einstellungen_oeffnen_01', 'Die Einstellungen')],
    },
    {
      titel: 'Wo deine Daten liegen',
      anker: 'wo-deine-daten-liegen',
      funktionen: ['EINST-07'],
      nutzen: 'Alles, was du in der App anlegst, liegt auf deinem Handy. Es gibt kein Konto und keinen Server von FoodAsu; der „Datenstand“ zeigt, wie viel gespeichert ist.',
      wo: 'Einstellungen > „Über“ > „Datenstand“',
    },
    {
      titel: 'Haushalt exportieren',
      anker: 'haushalt-exportieren',
      funktionen: ['HAUSHALT-07'],
      nutzen: 'Du speicherst alle Personen und ihre Einträge in einer Datei, etwa für ein neues Handy. Die Datei enthält, was dein Haushalt meidet: Teile sie nur mit Personen, denen du vertraust.',
      wo: 'Einstellungen > „Haushalt“ > „Haushalt exportieren“',
      fotos: [foto('haushalt_export_01', 'Die Karte „Haushalt“ in den Einstellungen')],
    },
    {
      titel: 'Haushalt importieren',
      anker: 'haushalt-importieren',
      funktionen: ['HAUSHALT-08'],
      nutzen: 'Du übernimmst Personen aus einer exportierten Datei und wählst, ob sie deinen Haushalt ergänzen oder ersetzen. „Ersetzen“ löscht alle Personen, die in der App stehen.',
      wo: 'Einstellungen > „Haushalt“ > „Haushalt importieren“',
      fotos: [foto('haushalt_import_01', 'Die Personen in der Datei')],
    },
    {
      titel: 'Backup von Android',
      anker: 'backup-von-android',
      funktionen: ['EINST-10'],
      nutzen: 'Android kann ein Backup deiner App-Daten anlegen, wenn du das auf deinem Handy eingeschaltet hast. Was dein Haushalt meidet, ist nie dabei: Auf ein neues Handy kommt der Haushalt nur mit der Exportdatei.',
      wo: 'Einstellungen deines Handys, nicht in FoodAsu',
      absaetze: [
        'Im Backup sind Produktangaben, Verlauf, eigene Produktnamen, gemerkte Rezepte, Einkaufslisten samt den gemerkten Wörtern und die Einstellungen.',
      ],
    },
    {
      titel: 'Löschen',
      anker: 'loeschen',
      funktionen: ['EINST-03', 'EINST-04'],
      nutzen: 'Was FoodAsu speichert, lässt sich in der App wieder löschen: der Verlauf unter „Zuletzt gescannt“ und die Wörter, die sich FoodAsu für die Vorschläge der Listen gemerkt hat. Beides lässt sich nicht rückgängig machen.',
      wo: 'Einstellungen > „Verlauf und Vorschläge“ > „Verlauf löschen“ oder „Vorschläge der Listen löschen“',
      absaetze: [
        'Personen löschst du im Reiter Haushalt, Listen und Einträge im Reiter Listen.',
      ],
    },
    {
      titel: 'Feedback geben',
      anker: 'feedback-geben',
      funktionen: ['EINST-05'],
      nutzen: 'Du schreibst FoodAsu aus der App eine E-Mail; Adresse und Betreff sind schon eingetragen. Mit geht die Version der App und von Android, sonst nichts.',
      wo: 'Einstellungen > „Hilfe und Feedback“ > „Feedback geben“',
    },
    {
      titel: 'Version und Update',
      anker: 'version-und-update',
      funktionen: ['EINST-06'],
      nutzen: 'Du siehst, welche Version du hast, und fragst selbst über Google Play nach einem Update.',
      wo: 'Einstellungen > „Über“ > „Nach Update suchen“',
    },
    {
      titel: 'Fehlt ein Produkt?',
      anker: 'fehlt-ein-produkt',
      absaetze: [
        'Die Angaben zu Produkten kommen von Open Food Facts, einer offenen Datenbank, die von Freiwilligen gepflegt wird. Ist ein Produkt dort nicht erfasst oder fehlt die Zutatenliste, schreibt FoodAsu das dazu und bittet dich, die Verpackung zu prüfen.',
        'Du kannst das Produkt bei Open Food Facts selbst ergänzen, auf der Website von Open Food Facts oder in deren App. Das geschieht außerhalb von FoodAsu; FoodAsu überträgt dafür nichts. Danach holst du die neuen Angaben mit „Daten neu laden“.',
      ],
      extern: { text: 'Open Food Facts', ziel: 'https://de.openfoodfacts.org' },
    },
    {
      titel: 'Mehr dazu',
      anker: 'mehr-dazu',
      funktionen: ['EINST-08'],
      nutzen: 'Die Kurzfassung der Datenschutzerklärung liest du in der App, auch ohne Internet.',
      wo: 'Einstellungen > „Über“',
      absaetze: [
        'Was FoodAsu speichert und überträgt, steht vollständig in der Datenschutzerklärung auf dieser Website.',
      ],
      verweis: link('Zur ', 'Datenschutzerklärung', '/datenschutz.html'),
    },
  ],
  verweise: [
    { text: 'Datenschutzerklärung', ziel: '/datenschutz.html' },
    { text: 'Fragen', ziel: '/fragen/' },
  ],
};
