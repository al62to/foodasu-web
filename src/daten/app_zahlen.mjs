// Zahlen der App für die Texte der Website (Projektleitung, 11.10.2026). Auf der Website steht keine Zahl von
// Rezepten oder Ländern von Hand. Die genauen Zahlen der App kommen aus rezepte.json (tools/rezepte_exportieren.py
// zählt dort über alle Rezepte der App, nicht nur über die der Website). Im Fließtext steht "über N": die Zahl der
// Rezepte, abgerundet auf volle 50 und immer kleiner als die echte Zahl (306 ergibt 300, 376 ergibt 350, 350 ergibt
// 300). tools/pruefe_seiten.mjs rechnet unabhängig davon nach.
import daten from './rezepte.json' with { type: 'json' };
// Einträge zum Meiden der Fassung der App, die öffentlich verfügbar ist (feste Vorgabe, Ali, 14.10.2026): aus
// app_fassung.json, geschrieben von tools/app_fassung_exportieren.py aus dem Repository der App (fester Katalog und,
// ab 0.15, die wählbaren Lebensmittel der Zutatenliste). Nie von Hand.
import fassung from './app_fassung.json' with { type: 'json' };

export const abgerundet = (zahl) => Math.floor((zahl - 1) / 50) * 50;

export const appZahlen = {
  rezepte: daten.zahlen.gesamt,
  laender: daten.zahlen.laender,
  ueber: abgerundet(daten.zahlen.gesamt),
  // Fassung der App, zu der die Zahlen gehören (zum Beispiel "0.14.4").
  fassung: fassung.fassung,
  // Feste Einträge zum Meiden (Katalog der App); gegen sie prüft die App auch die Rezepte.
  eintraegeFest: fassung.eintraegeFest,
  // Alles, was man in dieser Fassung beim Meiden wählen kann: feste Einträge und weitere Lebensmittel (ab 0.15).
  eintraege: fassung.eintraegeFest + fassung.weitereLebensmittel,
  // Die festen Einträge je Art (Zutaten, Ernährungsformen, weitere wie Schweinefleisch), die Stufen eines Eintrags
  // und, ab 0.15, die Knöpfe „Häufig gewählt“.
  zutatenFest: fassung.arten.zutaten,
  ernaehrungsformen: fassung.arten.ernaehrungsformen,
  weitereFest: fassung.arten.weitere,
  stufen: fassung.stufen,
  haeufigGewaehlt: fassung.haeufigGewaehlt,
};

// Zahlwort für Texte („drei Stufen“), klein oder mit großem Anfangsbuchstaben; über zwölf als Ziffer.
const ZAHLWOERTER = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
export const zahlwort = (zahl, gross = false) => {
  const wort = ZAHLWOERTER[zahl] ?? String(zahl);
  return gross ? wort.charAt(0).toUpperCase() + wort.slice(1) : wort;
};

if (!Number.isInteger(appZahlen.stufen) || !Number.isInteger(appZahlen.zutatenFest) || appZahlen.zutatenFest + appZahlen.ernaehrungsformen + appZahlen.weitereFest !== appZahlen.eintraegeFest) {
  throw new Error('app_fassung.json: Stufen oder Arten der festen Einträge fehlen oder passen nicht zusammen');
}
if (!Number.isInteger(appZahlen.eintraegeFest) || appZahlen.eintraegeFest < 1 || fassung.festeSchluessel.length !== appZahlen.eintraegeFest || !Number.isInteger(fassung.weitereLebensmittel)) {
  throw new Error('app_fassung.json: Einträge zum Meiden fehlen oder passen nicht zusammen');
}
if (!Number.isInteger(appZahlen.rezepte) || !Number.isInteger(appZahlen.laender) || appZahlen.ueber < 50 || appZahlen.laender < 1) {
  throw new Error(`rezepte.json: Zahlen der App fehlen oder sind zu klein (${appZahlen.rezepte} Rezepte, ${appZahlen.laender} Länder)`);
}
