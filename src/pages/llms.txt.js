// /llms.txt nach dem Format von llmstxt.org: Überschrift, ein Absatz zu FoodAsu, Abschnitte mit Links. Genannt ist
// jede Seite, die im Index steht, mit ihrer Beschreibung aus src/daten/meta.mjs (AP-18 Nachtrag Meta); Seiten mit
// noindex fehlen, seit AP-56w (29.10.2026) auch alle Seiten mit Rechtstexten. Der Absatz stammt aus den freigegebenen Texten der Startseite.
// Seit dem Auftrag SEO 1 neu (14.10.2026, Teil 3 Nr. 3): Oben steht der GEO-Satz (gleichlautend auf der Startseite und
// in SoftwareApplication.description), darunter eine kurze sachliche Beschreibung auf Deutsch; der Link zum Eintrag bei
// Google Play kommt erst mit dem öffentlichen Start (store.oeffentlich).
import { seite, store } from '../daten/seite.mjs';
import { kopf, fuss, geruest, GEO_SATZ, VERFUEGBAR } from '../daten/startseite.mjs';
import { rezeptSeiten, alteRezepte, texte, themen } from '../daten/rezeptseiten.mjs';
import { alteSeite } from '../daten/alte_rezepte.mjs';
import { BEREICH, adresse, kapitel, uebersicht } from '../daten/sogehts.mjs';
import { alleMeta, metaVon } from '../daten/meta.mjs';
import { datenquellen } from '../daten/datenquellen.mjs';
import { ueber } from '../daten/ueber.mjs';

const link = (titel, pfad) => `- [${titel}](${seite.adresse + pfad}): ${metaVon(pfad).beschreibung}`;
const gruppe = (art) => themen.filter((thema) => thema.art === art && thema.imIndex).sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
const nachName = [...rezeptSeiten].sort((a, b) => a.titel.localeCompare(b.titel, 'de'));

// Einleitung: der GEO-Satz als Zitat, darunter der Satz zur Beschreibung, der Hinweis zur Beta mit dem Satz zur
// Verfügbarkeit (er steht in der Datei genau einmal) und der Hinweis auf die Verpackung.

export function GET() {
  if (!kopf.stand.endsWith(` ${VERFUEGBAR}`)) throw new Error('llms.txt: kopf.stand endet nicht mit dem Satz zur Plattform');
  const kernsatz = seite.beschreibung.slice(0, seite.beschreibung.indexOf('. ') + 1);
  if (!kernsatz.endsWith('für den ganzen Haushalt.')) throw new Error('llms.txt: der Satz zur Beschreibung beginnt nicht mit dem Kernsatz');
  const zeilen = [
    `# ${seite.name}`,
    '',
    `> ${GEO_SATZ}`,
    '',
    `${seite.beschreibung} ${kopf.stand} ${fuss.hinweis}`,
    '',
    '## Website',
    link('Startseite', '/'),
    ...(store.oeffentlich ? [`- [${fuss.auftritte.storeLink}](${store.adresse}): Eintrag von ${seite.name} bei Google Play`] : []),
    link(geruest.fragenSeite.titel, '/fragen/'),
    link(datenquellen.titel, '/daten-und-quellen/'),
    link(ueber.titel, '/ueber-foodasu/'),
    '',
    `## ${uebersicht.titel}`,
    link(`${uebersicht.titel}: Übersicht`, BEREICH),
    ...kapitel.map((eintrag) => link(eintrag.titel, adresse(eintrag))),
    '',
    '## Rezepte',
    link(texte.alle.seitentitel, '/rezepte/'),
    ...['ohne', 'passt', 'kategorie', 'land'].flatMap(gruppe).map((thema) => link(thema.titel, thema.adresse)),
    '',
    '## Aus alten Kochbüchern',
    link(`${alteSeite.titel} (${alteRezepte.length} Rezepte, jedes mit einem Auszug aus dem Original und einer heutigen Fassung)`, alteSeite.adresse),
    '',
    '## Rezepte im Einzelnen',
    ...nachName.map((rezept) => link(rezept.titel, `/rezepte/${rezept.slug}/`)),
    '',
  ];
  // Jede Seite im Index steht in der Datei, keine Seite mit noindex.
  const inhalt = zeilen.join('\n');
  for (const eintrag of alleMeta) {
    const genannt = inhalt.includes(`(${seite.adresse + eintrag.pfad})`);
    if (eintrag.index && !genannt) throw new Error(`llms.txt: Seite fehlt: ${eintrag.pfad}`);
    if (!eintrag.index && genannt) throw new Error(`llms.txt: Seite mit noindex ist genannt: ${eintrag.pfad}`);
  }
  return new Response(inhalt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
