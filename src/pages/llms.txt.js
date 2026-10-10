// /llms.txt nach dem Format von llmstxt.org: Überschrift, ein Absatz zu FoodAsu, Abschnitte mit Links. Genannt ist
// jede Seite, die im Index steht, mit ihrer Beschreibung aus src/daten/meta.mjs (AP-18 Nachtrag Meta); Seiten mit
// noindex fehlen. Der Absatz stammt aus den freigegebenen Texten der Startseite.
import { seite } from '../daten/seite.mjs';
import { kopf, fuss, geruest } from '../daten/startseite.mjs';
import { rezeptSeiten, texte, themen } from '../daten/rezeptseiten.mjs';
import { BEREICH, adresse, kapitel, uebersicht } from '../daten/sogehts.mjs';
import { alleMeta, metaVon } from '../daten/meta.mjs';

const link = (titel, pfad) => `- [${titel}](${seite.adresse + pfad}): ${metaVon(pfad).beschreibung}`;
const gruppe = (art) => themen.filter((thema) => thema.art === art).sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
const nachName = [...rezeptSeiten].sort((a, b) => a.titel.localeCompare(b.titel, 'de'));

export function GET() {
  const zeilen = [
    `# ${seite.name}`,
    '',
    `> ${seite.name} ist eine App für Android. ${kopf.text} ${fuss.hinweis}`,
    '',
    kopf.stand,
    '',
    '## Website',
    link('Startseite', '/'),
    link(geruest.fragenSeite.titel, '/fragen/'),
    '',
    `## ${uebersicht.titel}`,
    link(`${uebersicht.titel}: Übersicht`, BEREICH),
    ...kapitel.map((eintrag) => link(eintrag.titel, adresse(eintrag))),
    '',
    '## Rezepte',
    link(texte.alle.seitentitel, '/rezepte/'),
    ...['ohne', 'passt', 'kategorie', 'land'].flatMap(gruppe).map((thema) => link(thema.titel, thema.adresse)),
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
