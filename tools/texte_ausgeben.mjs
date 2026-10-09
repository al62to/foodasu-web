// Schreibt alle Texte der Startseite und des Gerüsts als eine Datei zur Freigabe. Quelle ist
// src/daten/startseite.mjs; geändert wird dort. Aufruf: node tools/texte_ausgeben.mjs [Zieldatei]
import { writeFileSync } from 'node:fs';
import { mega, hauptpunkte } from '../src/daten/navigation.mjs';
import * as t from '../src/daten/startseite.mjs';

const ziel = process.argv[2] ?? 'C:/Users/ali/foodasu-play/Website_Texte_Startseite.md';
const z = [];
const zeile = (text = '') => z.push(text);
const punkt = (name, text) => zeile(`- **${name}:** ${text}`);

zeile('# Website foodasu.com: Texte der Startseite (freigegeben am 09.10.2026)');
zeile();
zeile('Stand 09.10.2026, Karte B (AP-15 Etappe 1). Von Ali am 09.10.2026 freigegeben, mit den Entscheidungen am Ende; es ist kein Punkt mehr offen. Nichts davon ist veröffentlicht.');
zeile('Erzeugt aus `foodasu-web/src/daten/startseite.mjs` (Zweig `astro`) mit `npm run texte`; geändert wird dort, nicht hier.');
zeile('Grundlage: AP-15 Teil B, Nachtrag SEO vom 09.10.2026 (Punkt 7 und Punkt 8), Konzept v4 Abschnitt 1. Die Wortprüfung läuft über diese Datei (`texte_pruefen.py`) und über die gebauten Seiten (`npm run pruefen`).');
zeile();
zeile('Woher die Wortlaute kommen: Sätze mit dem Vermerk (Store) stehen so im freigegebenen Store-Eintrag, (Beitrag) im freigegebenen LinkedIn-Beitrag vom 06.10.2026, (App) in den Texten der App. Alles ohne Vermerk ist neu geschrieben.');
zeile();

zeile('## Kopfdaten der Seite');
punkt('Titel', `${t.kopfdaten.titel} (${t.kopfdaten.titel.length} Zeichen)`);
punkt('Beschreibung', `${t.kopfdaten.beschreibung} (${t.kopfdaten.beschreibung.length} Zeichen)`);
zeile();

zeile('## Navigation');
punkt('Hauptpunkte', hauptpunkte.map((p) => p.titel).join(', '));
mega.spalten.forEach((spalte, nummer) => {
  for (const gruppe of spalte.gruppen) punkt(`Mega-Menü, Spalte ${nummer + 1}, Gruppe „${gruppe.titel}“`, gruppe.eintraege.map((e) => e.name).join(', '));
});
punkt('Mega-Menü, letzte Zeile', mega.alle.titel);
punkt('Für Bildschirmleser', `„${t.geruest.sprung}“, „${t.geruest.marke}“, „${t.geruest.navigation}“, „${t.geruest.menue}“, „${t.geruest.untermenue}“, „${t.geruest.brotkrumen}“; Knopf der Startseite „${t.geruest.bewegung.anhalten}“ und „${t.geruest.bewegung.fortsetzen}“ (sichtbar, unten rechts); vor den Einträgen des Mega-Menüs unsichtbar „Rezepte aus: …“, „Rezepte der Kategorie …“, „Rezepte ohne …“, „Rezepte, passt für: …“`);
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
punkt('Im Handy, Knopf', `${t.kopf.handy.knopf} (App; allein in der Zeile, ohne Mengenwähler)`);
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
punkt('Karten', `${t.vorschau.karten.map((k) => k.titel).join(', ')}; jede mit Bild, Kennzeichnung „${t.vorschau.kennzeichnung}“ und Bildbeschreibung „Symbolbild: Titel“ (App)`);
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
punkt('Bild beim Teilen (Open Graph), Bildbeschreibung', `FoodAsu: ${t.kopf.ueberschrift.join('')}`);
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

zeile('## Entscheidungen (Ali, 09.10.2026)');
[
  'Abschnitt 2, die beiden Absätze: bleiben so.',
  'Unterschrift: „Ali Tonc, Entwickler von FoodAsu“.',
  'Frage „Ersetzt FoodAsu die Verpackung?“: Der Satz steht ohne die beiden Wörter, die nur im Store erlaubt sind (Wortregel Konzept v4).',
  'Zähler: „20 Einträge zum Meiden“ statt „14 Hauptzutaten im Blick“ (entspricht Band 1).',
  'Rezepte in Band 2 und in der Vorschau: Titel und Bild aus dem Rezeptpaket nachgelesen. Die vier Karten heißen im Paket genau so. Im Band stehen drei Kurzformen; im Paket heißen sie „Bibimbap (Reisschale mit Gemüse, Rindfleisch und Ei)“, „Massaman-Curry mit Rindfleisch“ und „Mercimek çorbası (rote Linsensuppe)“.',
  'Link „FoodAsu bei Google Play“ und die Angaben zum Store in den strukturierten Daten: erst ab dem öffentlichen Start (Schalter in src/daten/seite.mjs). Bis dahin „Bald im Play Store“.',
  'Facebook: Adresse am 09.10.2026 nachgereicht; Symbol im Fuß und Eintrag in den strukturierten Daten sind drin. Instagram: instagram.com/foodasu.app.',
  'Mega-Menü: Spalte „Ohne ...“ nur mit Nüsse, Gluten, Schweinefleisch, Alkohol, Palmöl, Sesam, Milch; darunter die eigene Gruppe „Passt für“ mit Vegetarisch und Vegan.',
  'Kategorie der App in den strukturierten Daten: „ShoppingApplication“.',
  'Schritt 3 heißt „Kochen“ statt „Auf die Liste“ (bisher: „Ein Tipp, und das Produkt steht auf deiner Einkaufsliste. Die Menge stellst du gleich daneben ein.“). Abweichung von AP-15 Teil B, festgehalten im Nachtrag SEO, Punkt 8.',
  'Überschrift von Abschnitt 3: „FoodAsu in drei Schritten“ statt „Drei Schritte im Laden“.',
  'Karte „Einkaufsliste, sortiert wie im Supermarkt“, erster Satz: „Schreib auf, was du brauchst, oder setz die fehlenden Zutaten eines Rezepts auf die Liste.“ statt „Gescannte Produkte kommen mit einem Tipp auf die Liste.“',
  'Knopf im Handy unter „Nicht für Mia“: „Warum?“ statt „Auf die Liste“.',
  'Reihenfolge der drei Schritte: „Scannen, Warum?, Kochen“ bleibt.',
  'Beta-Satz neben „Bald im Play Store“ und „ich“ neben „wir“: bleibt.',
  'Karte Rezepte: „Jedes mit einem Symbolbild.“ statt „Jedes mit einem gezeichneten Bild.“',
  'Knopf zum Anhalten der Bewegung: ja, mit „Bewegung anhalten“ und „Bewegung fortsetzen“; der Zustand gilt nur für den Besuch, im Browser wird nichts gespeichert.',
].forEach((text, i) => zeile(`${i + 1}. ${text}`));
zeile();

writeFileSync(ziel, z.join('\n'), 'utf8');
console.log(`Geschrieben: ${ziel} (${z.length} Zeilen)`);
