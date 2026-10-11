// /llms.txt nach dem Format von llmstxt.org: Überschrift, ein Absatz zu FoodAsu, Abschnitte mit Links. Genannt ist
// jede Seite, die im Index steht, mit ihrer Beschreibung aus src/daten/meta.mjs (AP-18 Nachtrag Meta); Seiten mit
// noindex fehlen. Der Absatz stammt aus den freigegebenen Texten der Startseite.
import { seite } from '../daten/seite.mjs';
import { kopf, fuss, geruest } from '../daten/startseite.mjs';
import { rezeptSeiten, alteRezepte, texte, themen } from '../daten/rezeptseiten.mjs';
import { alteSeite } from '../daten/alte_rezepte.mjs';
import { BEREICH, adresse, kapitel, uebersicht } from '../daten/sogehts.mjs';
import { alleMeta, metaVon } from '../daten/meta.mjs';
import { datenquellen } from '../daten/datenquellen.mjs';
import { ueber } from '../daten/ueber.mjs';

const link = (titel, pfad) => `- [${titel}](${seite.adresse + pfad}): ${metaVon(pfad).beschreibung}`;
const gruppe = (art) => themen.filter((thema) => thema.art === art && thema.imIndex).sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
const nachName = [...rezeptSeiten].sort((a, b) => a.titel.localeCompare(b.titel, 'de'));

// Einleitung (Nachtrag zu AP-23 Teil A Nr. 7 in der Fassung der Änderung vom 11.10.2026): der erste Satz des Satzes zur
// Beschreibung (FoodAsu ohne Plattform), dann der Satz, der die Plattform nennt, danach wie bisher kopf.text und
// fuss.hinweis. Der Absatz darunter ist kopf.stand ohne diesen Satz, damit er in der Datei nicht zweimal steht.
const VERFUEGBAR = 'Zuerst kommt die App für Android in den Play Store, danach folgt die Version fürs iPhone.';

export function GET() {
  if (!kopf.stand.endsWith(` ${VERFUEGBAR}`)) throw new Error('llms.txt: kopf.stand endet nicht mit dem Satz zur Plattform');
  const kernsatz = seite.beschreibung.slice(0, seite.beschreibung.indexOf('. ') + 1);
  if (!kernsatz.endsWith('für den ganzen Haushalt.')) throw new Error('llms.txt: der Satz zur Beschreibung beginnt nicht mit dem Kernsatz');
  const zeilen = [
    `# ${seite.name}`,
    '',
    `> ${kernsatz} ${VERFUEGBAR} ${kopf.text} ${fuss.hinweis}`,
    '',
    kopf.stand.slice(0, -VERFUEGBAR.length - 1),
    '',
    '## Website',
    link('Startseite', '/'),
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
    '## Rechtliches',
    link('Datenschutzerklärung', '/datenschutz.html'),
    link(geruest.lizenzen.titel, '/lizenzen/'),
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
