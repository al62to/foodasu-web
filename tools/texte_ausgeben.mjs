// Schreibt alle Texte der Startseite und des Gerüsts als eine Datei zur Freigabe. Quelle ist
// src/daten/startseite.mjs; geändert wird dort. Aufruf: node tools/texte_ausgeben.mjs [Zieldatei]
import { writeFileSync } from 'node:fs';
import { mega, hauptpunkte } from '../src/daten/navigation.mjs';
import * as t from '../src/daten/startseite.mjs';

const ziel = process.argv[2] ?? 'C:/Users/ali/foodasu-play/Website_Texte_Startseite.md';
const z = [];
const zeile = (text = '') => z.push(text);
const punkt = (name, text) => zeile(`- **${name}:** ${text}`);

zeile('# Website foodasu.com: Texte der Startseite (Vorschlag zur Freigabe)');
zeile();
zeile('Stand 09.10.2026, Karte B (AP-15 Etappe 1). Nichts davon ist veröffentlicht.');
zeile('Erzeugt aus `foodasu-web/src/daten/startseite.mjs` (Zweig `astro`) mit `npm run texte`; geändert wird dort, nicht hier.');
zeile('Grundlage: AP-15 Teil B, Nachtrag SEO vom 09.10.2026 (Punkt 7), Konzept v4 Abschnitt 1. Die Wortprüfung läuft über diese Datei (`texte_pruefen.py`) und über die gebauten Seiten (`npm run pruefen`).');
zeile();
zeile('Woher die Wortlaute kommen: Sätze mit dem Vermerk (Store) stehen so im freigegebenen Store-Eintrag, (Beitrag) im freigegebenen LinkedIn-Beitrag vom 06.10.2026, (App) in den Texten der App. Alles ohne Vermerk ist neu geschrieben.');
zeile();

zeile('## Kopfdaten der Seite');
punkt('Titel', `${t.kopfdaten.titel} (${t.kopfdaten.titel.length} Zeichen)`);
punkt('Beschreibung', `${t.kopfdaten.beschreibung} (${t.kopfdaten.beschreibung.length} Zeichen)`);
zeile();

zeile('## Navigation');
punkt('Hauptpunkte', hauptpunkte.map((p) => p.titel).join(', '));
for (const spalte of mega.spalten) punkt(`Mega-Menü, Spalte „${spalte.titel}“`, spalte.eintraege.map((e) => e.name).join(', '));
punkt('Mega-Menü, letzte Zeile', mega.alle.titel);
punkt('Für Bildschirmleser', `„${t.geruest.sprung}“, „${t.geruest.marke}“, „${t.geruest.navigation}“, „${t.geruest.menue}“, „${t.geruest.untermenue}“, „${t.geruest.brotkrumen}“; vor den Einträgen des Mega-Menüs unsichtbar „Rezepte aus: …“, „Rezepte der Kategorie …“, „Rezepte ohne …“`);
zeile();

zeile('## Abschnitt 1: Kopf mit Scan-Geschichte');
punkt('Überschrift', `${t.kopf.ueberschrift.join('')} („${t.kopf.ueberschrift[1]}“ mit Unterstreichung in Mint; Überschrift des LinkedIn-Bildes)`);
punkt('Text', t.kopf.text);
punkt('Aufruf', `${t.kopf.aufruf} (Text ohne Link)`);
punkt('Zweiter Knopf', `${t.kopf.zweiterKnopf} (springt zu Abschnitt 3)`);
punkt('Zeile darunter', `${t.kopf.stand} (Beta-Satz und Satz zum iPhone wörtlich wie freigegeben)`);
punkt('Im Handy, Produkt', `${t.kopf.handy.produkt}, ${t.kopf.handy.zusatz} (erfunden, ohne Marke)`);
punkt('Im Handy, Urteil', `${t.kopf.handy.urteil} (App)`);
punkt('Im Handy, Personen', t.kopf.handy.personen.map((p) => `${p.name}: ${p.ergebnis}`).join('; '));
punkt('Im Handy, Knopf', `${t.kopf.handy.knopf} (App)`);
punkt('Beschreibung des Handys für Bildschirmleser', t.kopf.handy.beschreibung);
punkt('Schwebende Begriffe', t.kopf.begriffe.join(', '));
zeile();

zeile('## Abschnitt 2: Wechselndes Wort');
punkt('Große Zeile', `${t.wort.vorsatz} [${t.wort.woerter.join(' / ')}]`);
punkt('Absatz 1', `${t.wort.absaetze[0]} (Beitrag, erster Halbsatz neu)`);
punkt('Absatz 2', `${t.wort.absaetze[1]} (Beitrag)`);
punkt('Unterschrift', t.wort.unterschrift);
zeile();

zeile('## Abschnitt 3: Drei Schritte');
punkt('Überschrift', t.schritte.ueberschrift);
t.schritte.liste.forEach((s, i) => punkt(`Schritt ${i + 1}, „${s.titel}“`, s.text));
zeile();

zeile('## Abschnitt 4: Funktionen im Glas-Raster');
punkt('Überschrift', `${t.funktionen.ueberschrift} (Store)`);
for (const k of t.funktionen.karten) {
  punkt(`Karte „${k.titel}“`, k.text + (k.bild ? ` Bildbeschreibung: „${k.bild}“.` : '') + (k.beispiel ? ` Beispielliste: ${k.beispiel.join(', ')}.` : ''));
}
zeile();

zeile('## Abschnitt 5: Laufbänder und Zahlen');
punkt('Überschrift (nur für Bildschirmleser)', t.zahlen.ueberschrift);
punkt('Band 1, Einträge wie in der App', t.zahlen.zutatenband.join(', '));
punkt('Band 2, Rezepte', t.zahlen.rezeptband.join(', '));
punkt('Zähler', t.zahlen.zaehler.map((e) => `${e.zahl} ${e.wort}`).join('; '));
zeile();

zeile('## Abschnitt 6: Rezepte-Vorschau');
punkt('Überschrift', t.vorschau.ueberschrift);
punkt('Text', t.vorschau.text);
punkt('Karten', `${t.vorschau.karten.join(', ')}; jede mit Bild, Kennzeichnung „${t.vorschau.kennzeichnung}“ und Bildbeschreibung „Symbolbild: Titel“ (App)`);
punkt('Link', t.vorschau.link);
zeile();

zeile('## Abschnitt 7: Fragen und Antworten');
punkt('Überschrift', t.fragen.ueberschrift);
for (const f of t.fragen.liste) {
  const verweis = f.verweis ? ` ${f.verweis.vor}${f.verweis.text}${f.verweis.nach}` : '';
  punkt(f.frage, f.antwort.join(' ') + verweis);
}
zeile();

zeile('## Abschnitt 8: Fuß');
punkt('Links', Object.values(t.fuss.links).join(', '));
punkt('Hinweis', t.fuss.hinweis);
punkt('Auftritte', `${t.fuss.auftritte.facebook}, ${t.fuss.auftritte.instagram}; bis zum öffentlichen Start „${t.fuss.auftritte.storeBald}“ als Text, danach der Link „${t.fuss.auftritte.storeLink}“`);
punkt('Offenlegung', 'steht wie bisher am Ende der Startseite, Wortlaut unverändert (Adresse /#offenlegung)');
zeile();

zeile('## Weitere Seiten des Gerüsts');
for (const p of Object.values(t.geruest.platzhalter)) {
  punkt(`Platzhalter „${p.titel}“`, `${p.text}${p.link ? ` Link: „${p.link}“.` : ''} Beschreibung: ${p.beschreibung}`);
}
const n = t.geruest.nichtGefunden;
punkt('Seite 404', `${n.titel}. ${n.text} Links: „${n.start}“, „${n.rezepte}“.`);
const l = t.geruest.lizenzen;
punkt('Seite Lizenzen', `${l.einleitung} ${l.eintraege.map((e) => `${e.name} (${e.art}): ${e.lizenz}`).join('; ')}; ${l.bilder} Beschreibung: ${l.beschreibung}`);
punkt('Seite Datenschutz', 'Text der Fassung 1.4 unverändert unter /datenschutz.html (wortgleich geprüft)');
zeile();

zeile('## Zur Entscheidung');
[
  'Abschnitt 2, die beiden Absätze: Sie stammen aus deinem freigegebenen LinkedIn-Beitrag. Nach Nachtrag Punkt 7 kannst du sie durch bis zu fünf eigene Sätze ersetzen (warum FoodAsu entstanden ist, was bei euch beim Einkaufen schwierig war). Erfunden ist nichts.',
  'Unterschrift „Ali, Entwickler von FoodAsu“: so, mit vollem Namen oder ohne Unterschrift?',
  'Frage „Ersetzt FoodAsu die Verpackung?“: AP-15 Teil E nennt für die Website den Haftungssatz im Wortlaut des Store-Eintrags; Konzept v4 erlaubt die beiden sonst gesperrten Wörter nur im Store. Hier steht der Satz ohne die beiden Wörter. Soll der Wortlaut des Store-Eintrags auf die Website?',
  'Zähler „14 Hauptzutaten im Blick“: AP-15 nennt „14 Hauptzutaten“. Gemeint sind nach meinem Verständnis die 14 Einträge von Gluten bis Weichtiere; bitte bestätigen oder den Wortlaut ändern.',
  'Rezepte in Band 2 und in der Vorschau: Ich nenne nur Titel, die in freigegebenen Texten vorkommen. Für Bilder und genaue Schreibweise muss die Fortsetzung diese wenigen Rezepte im Rezeptpaket nachlesen; Karte B nimmt die Rezeptdaten aus. Bitte freigeben.',
  'Link „FoodAsu bei Google Play“ und die Angaben zum Store in den strukturierten Daten: erst ab dem öffentlichen Start (ein Schalter), weil der Store-Eintrag bis dahin nur für Tester erreichbar ist. Bis dahin steht „Bald im Play Store“.',
  'Die Adresse der Facebook-Seite fehlt mir (für das Symbol im Fuß und die strukturierten Daten). Instagram: instagram.com/foodasu.app.',
  'Mega-Menü, Spalte „Ohne ...“: die sieben Wörter aus Abschnitt 2, dazu Vegetarisch und Vegan. Welche Themenseiten es wirklich gibt, ergibt sich in Karte D aus den Daten.',
  'Kategorie der App in den strukturierten Daten: Google kennt keine eigene Kategorie für Essen und Trinken; eingetragen ist „LifestyleApplication“ (Alternative „ShoppingApplication“).',
].forEach((text, i) => zeile(`${i + 1}. ${text}`));
zeile();

writeFileSync(ziel, z.join('\n'), 'utf8');
console.log(`Geschrieben: ${ziel} (${z.length} Zeilen)`);
