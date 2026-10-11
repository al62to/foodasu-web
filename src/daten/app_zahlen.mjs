// Zahlen der App für die Texte der Website (Projektleitung, 11.10.2026). Auf der Website steht keine Zahl von
// Rezepten oder Ländern von Hand. Die genauen Zahlen der App kommen aus rezepte.json (tools/rezepte_exportieren.py
// zählt dort über alle Rezepte der App, nicht nur über die der Website). Im Fließtext steht "über N": die Zahl der
// Rezepte, abgerundet auf volle 50 und immer kleiner als die echte Zahl (306 ergibt 300, 376 ergibt 350, 350 ergibt
// 300). tools/pruefe_seiten.mjs rechnet unabhängig davon nach.
import daten from './rezepte.json' with { type: 'json' };

export const abgerundet = (zahl) => Math.floor((zahl - 1) / 50) * 50;

export const appZahlen = {
  rezepte: daten.zahlen.gesamt,
  laender: daten.zahlen.laender,
  ueber: abgerundet(daten.zahlen.gesamt),
};

if (!Number.isInteger(appZahlen.rezepte) || !Number.isInteger(appZahlen.laender) || appZahlen.ueber < 50 || appZahlen.laender < 1) {
  throw new Error(`rezepte.json: Zahlen der App fehlen oder sind zu klein (${appZahlen.rezepte} Rezepte, ${appZahlen.laender} Länder)`);
}
