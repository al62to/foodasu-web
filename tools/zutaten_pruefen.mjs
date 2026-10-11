// Prüft bei jedem Rezept der Website, ob die Zubereitung zu den Zutaten passt (AP-25 Nachbesserung, Projektleitung,
// 11.10.2026). Zwei Warnungen, keine bricht den Bau ab:
//   (a) eine Zutat kommt in keinem Schritt vor;
//   (b) eine Zutat steht mehrmals in der Liste (zum Beispiel Ei für die Füllung und Ei zum Ausbacken), und zu einem
//       der Einträge sagt kein Schritt, welcher gemeint ist.
// Gelesen werden die Daten der Seiten (src/daten/rezepte.json und src/daten/rezepte_zusatz.json), nicht der Bau:
// Dort stehen der Grundbegriff und die Gruppe jeder Zutat. Die Zubereitung nennt die Begriffe der Quelle
// ("Kartoffeln", "Sahne"), die Zutatenliste die Begriffe nach Region ("Erdäpfel", "Schlagobers"); deshalb zählt der
// Grundbegriff. Die Prüfung arbeitet mit Wortstämmen und ist eine Hilfe beim Lesen, kein Beweis: Ein Treffer heißt
// "hier nachsehen".
//
// tools/pruefe_seiten.mjs ruft zutatenBefunde() auf. Allein gestartet schreibt die Datei alle Treffer als Liste:
//   node tools/zutaten_pruefen.mjs [Zieldatei.md]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const glatt = (text) => String(text ?? '').toLowerCase()
  .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
  .replace(/½/g, ' 1/2 ').replace(/¼/g, ' 1/4 ').replace(/¾/g, ' 3/4 ').replace(/\s+/g, ' ').trim();
const woerter = (text) => glatt(text).split(/[^a-z0-9/]+/).filter(Boolean);
// Beiwörter der Zutatenliste, die in der Zubereitung nichts über die Zutat sagen.
const BEIWORT = new Set(woerter('frisch frische frischer frisches gemahlen gemahlener gemahlene fein feine feiner grob grobe gehackt gehackte gehackter '
  + 'gross grosse grosser klein kleine kleiner mittelgross mittelgrosse reif reife kalt kalte kaltes kalter warm warme heiss heisse getrocknet getrockneter getrocknete '
  + 'nativ natives kaltgepresstes glatt glatte mehlig kochende kochend festkochende oder und aus der dem den die das mit ohne nach zum zur fur etwas ganz ganze '
  + 'type saft schale abgerieben abgeriebene dose glas abtropfgewicht stuck gekocht gekochte hart weich hell helles heller dunkel suss susse sauerliche sauer '
  + 'mager mageres gemischt gemischtes einige je extra edelsuss scharf geschmack belieben servieren'));
// Kurze Köpfe zusammengesetzter Wörter: "Weizenmehl" ist in der Zubereitung oft nur "Mehl". Längere Köpfe findet die
// allgemeine Regel unten ("Gemüsezwiebel" endet auf "Zwiebel").
const KOEPFE = ['mehl', 'wein', 'saft', 'reis', 'kase', 'brot', 'salz', 'fond', 'teig', 'germ'];
// Zusätze, mit denen eine Zutat nur ihre Form nennt: "Paprikapulver" heißt in der Zubereitung oft "Paprika".
const FORMEN = ['pulver', 'zehe', 'zehen', 'schote', 'schoten', 'blatt', 'blatter', 'korner', 'stange', 'stangen', 'filet', 'filets'];
// Andere Wörter derselben Ware (Begriffe nach Region und übliche Kurzformen der Zubereitung).
const GLEICH = {
  kartoffel: ['erdapfel'], hackfleisch: ['faschiert', 'hack'], rinderhackfleisch: ['faschiert', 'hack'], schweinehackfleisch: ['faschiert', 'hack'],
  sahne: ['schlagobers', 'obers', 'rahm'], schlagsahne: ['sahne', 'schlagobers', 'obers', 'rahm'], eigelb: ['dotter'], brotchen: ['semmel'],
  puderzucker: ['staubzucker'], matjes: ['hering'], cheddar: ['kase'], parmesan: ['kase'], mozzarella: ['kase'], gruyere: ['kase'], butterschmalz: ['fett'],
  ol: ['fett'], knoblauchzehe: ['knoblauch'], pancetta: ['speck'], makkaroni: ['nudel'], ketchup: ['tomatenketchup'], karotte: ['mohre', 'gemuse'],
  zwiebel: ['gemuse'], gemusezwiebel: ['gemuse'], tomate: ['paradeiser'], quark: ['topfen'], hefe: ['germ'], trockenhefe: ['hefe', 'germ'], blumenkohl: ['karfiol'],
  aprikose: ['marille'], speisestarke: ['starke'], backoblaten: ['oblate'], walnuss: ['nuss', 'nusse'], semmelbrosel: ['brosel'], paniermehl: ['brosel'],
  vanilleschote: ['vanille'], gewurznelken: ['nelke'], muskatblute: ['muskat'], muskatnuss: ['muskat'], hahnchen: ['huhn'], huhn: ['hahnchen', 'poulet'],
  filoteig: ['teigblatt', 'teigblatter', 'yufka'], yufkateig: ['teigblatt', 'teigblatter', 'filo'], sojasprossen: ['sprossen'],
};
// Teilstücke vom Tier heißen in der Zubereitung oft nur "Fleisch".
const TEILSTUECK = /schulter|keule|schenkel|filet|steak|brust|schinken|haxe|rippe|lende|hufte|schnitzel|nacken|fleisch|hack|faschiert/;
// Salz und Pfeffer gelten auch als genannt, wenn ein Schritt nur "würzen" oder "abschmecken" sagt.
const WUERZEN = /wurz|abschmeck/;
// "Alle Zutaten", "die restlichen Zutaten": Damit sind alle nicht genannten Zutaten gemeint.
const ALLE_ZUTATEN = /\b(?:alle[nr]?|ubrige[nr]?|restliche[nr]?|andere[nr]?|trockene[nr]?) (?:ubrigen |restlichen |anderen )?zutaten\b/;

const stamm = (wort) => (wort.length > 5 ? wort.replace(/(?:en|er|es|e|n|s)$/, '') : wort);
const eigene = (text) => woerter(text).filter((wort) => !BEIWORT.has(wort) && !/^\d/.test(wort));
// Formen, unter denen eine Zutat in der Zubereitung stehen kann. "nurGrund" lässt den Namen der Liste weg.
function formen(zutat, nurGrund = false) {
  const alle = new Set(nurGrund ? eigene(zutat.grundbegriff) : [...eigene(zutat.grundbegriff), ...eigene(zutat.name)]);
  for (const wort of [...alle]) {
    for (const gleich of GLEICH[wort] ?? GLEICH[stamm(wort)] ?? []) alle.add(gleich);
    for (const kopf of KOEPFE) if (wort.length > kopf.length + 2 && wort.endsWith(kopf)) alle.add(kopf);
    for (const form of FORMEN) if (wort.length > form.length + 3 && wort.endsWith(form)) alle.add(wort.slice(0, -form.length).replace(/n$/, ''));
    if (/[a-z]{3,}ol$/.test(wort) && !/(?:kohl|alkohol)$/.test(wort)) alle.add('ol');
    if (TEILSTUECK.test(wort)) alle.add('fleisch');
  }
  // Jede Form steht ungekürzt und als Wortstamm da ("Rinderbrühe" und "Rinderbrüh").
  return [...new Set([...alle, ...[...alle].map(stamm)])];
}
// Nennt der Text (schon geglättet) eine der Formen?
function nenntForm(text, liste) {
  const teile = text.split(/[^a-z0-9/]+/).filter(Boolean);
  for (const form of liste) {
    if (form === 'ei' || form === 'eier') { if (teile.some((teil) => /^(?:ei|eier|eiern|eis|eigelb|eigelbe|eiweiss|eidotter|dotter|dottern|eiklar|eihalfte|eihalften|eimasse|ruhrei|spiegelei|spiegeleier)$/.test(teil))) return true; continue; }
    if (form === 'ol') { if (teile.some((teil) => teil === 'ol' || teil === 'ols' || /[a-z]{3,}ol$/.test(teil) && !/(?:kohl|alkohol)$/.test(teil) || teil === 'fett')) return true; continue; }
    if (form === 'eis') { if (teile.some((teil) => teil === 'eis' || (teil.endsWith('eis') && !/(?:reis|weis|kreis|preis)$/.test(teil)))) return true; continue; }
    if (form.length <= 3) { if (teile.includes(form)) return true; continue; }
    if (teile.some((teil) => teil.includes(form))) return true;
    // Kopf eines zusammengesetzten Worts: Die Zutat heißt "Gemüsezwiebel", der Schritt sagt "Zwiebeln".
    if (form.length >= 8 && teile.some((teil) => teil.length >= 5 && (form.endsWith(teil) || form.endsWith(stamm(teil))))) return true;
  }
  return false;
}
const nennt = (text, zutat) => nenntForm(text, formen(zutat)) || (['salz', 'pfeffer'].includes(glatt(zutat.grundbegriff)) && WUERZEN.test(text));

const saetze = (schritte) => schritte.flatMap((schritt, nummer) => schritt.split(/(?<=[.!?;])\s+/).map((satz) => ({ nummer: nummer + 1, satz, text: glatt(satz) })));
// Wörter, mit denen ein Schritt sagt, welcher von mehreren Einträgen gemeint ist, ohne ihn zu benennen: "die übrige
// Butter", "das rohe Ei", "die rohen und die durchgestrichenen Eigelb", "die Hälfte der Butter". Das Wort muss kurz
// vor der Zutat stehen; "je zwei Hälften zusammensetzen" sagt nichts über die Zutat.
const ZUSATZWORT = /^(?:ubrig|restlich|roh|zweit|ander)/;
function allgemeinZugeordnet(text, grund) {
  const teile = text.split(/[^a-z0-9/]+/).filter(Boolean);
  return teile.some((teil, platz) => {
    const danach = teile.slice(platz + 1, platz + 5);
    if (ZUSATZWORT.test(teil)) return danach.some((wort) => nenntForm(wort, grund));
    return /^halfte/.test(teil) && ['der', 'des', 'vom', 'von'].includes(danach[0]) && danach.slice(1, 3).some((wort) => nenntForm(wort, grund));
  });
}

// Liefert die Befunde eines Rezepts als Liste von { art: 'ohne-schritt' | 'mehrfach', zutat, text }.
export function zutatenBefunde(rezept) {
  const befunde = [];
  const alles = glatt(rezept.schritte.join(' '));
  const stellen = saetze(rezept.schritte);
  const pauschal = ALLE_ZUTATEN.test(alles);
  for (const zutat of rezept.zutaten) {
    if (!pauschal && !nennt(alles, zutat)) befunde.push({ art: 'ohne-schritt', zutat: zutat.name, text: `Zutat „${zutat.name}“ kommt in keinem Schritt vor` });
  }
  // Mehrfach genannte Zutaten: gleicher Grundbegriff, mehrere Zeilen.
  const gruppen = new Map();
  for (const zutat of rezept.zutaten) gruppen.set(glatt(zutat.grundbegriff), [...(gruppen.get(glatt(zutat.grundbegriff)) ?? []), zutat]);
  for (const eintraege of gruppen.values()) {
    if (eintraege.length < 2) continue;
    const grund = formen(eintraege[0], true);
    const nennungen = stellen.filter((stelle) => nenntForm(stelle.text, grund) || nennt(stelle.text, eintraege[0]));
    // Was einen Eintrag von den anderen unterscheidet: Menge mit Einheit, Gruppe, Beiwörter des Namens.
    const kennzeichen = eintraege.map((zutat) => ({
      menge: [zutat.menge, zutat.einheit].filter(Boolean).map(glatt).join(' ').trim(),
      worte: [...woerter(zutat.gruppe), ...woerter(zutat.name)].filter((wort) => wort.length > 3 && !grund.includes(stamm(wort)) && !['zum', 'fur', 'nach'].includes(wort)),
    }));
    let offen = [];
    eintraege.forEach((zutat, platz) => {
      const eigen = kennzeichen[platz];
      const andere = kennzeichen.filter((_, nummer) => nummer !== platz);
      const menge = eigen.menge && andere.every((k) => k.menge !== eigen.menge) ? eigen.menge : null;
      const worte = eigen.worte.filter((wort) => andere.every((k) => !k.worte.includes(wort)));
      const zugeordnet = nennungen.some((stelle) =>
        (menge && new RegExp(`(?<![0-9/,])${menge.replace(/[/]/g, '\\/')}(?![0-9/])`).test(stelle.text))
        || worte.some((wort) => stelle.text.includes(stamm(wort))
          // Kopf eines zusammengesetzten Worts: Gruppe "Heringssauce", der Schritt sagt "Für die Sauce". Der Rest davor
          // muss selbst ein Wort sein ("Herings"), sonst gälte "backen" schon als "Ausbacken".
          || (wort.length > 8 && stelle.text.split(/[^a-z]+/).some((teil) => teil.length > 4 && wort.endsWith(teil) && wort.length - teil.length >= 4 && !grund.includes(stamm(teil))))));
      if (!zugeordnet) offen.push({ zutat, menge: eigen.menge });
    });
    // Ein Schritt mit "übrige", "restliche", "Hälfte" oder "rohe" ordnet einen sonst offenen Eintrag zu.
    const allgemein = nennungen.filter((stelle) => allgemeinZugeordnet(stelle.text, grund)).length;
    offen = offen.slice(0, Math.max(0, offen.length - allgemein));
    for (const { zutat, menge } of offen) {
      const zusatz = [menge, zutat.gruppe ? `Gruppe „${zutat.gruppe}“` : null].filter(Boolean).join(', ');
      befunde.push({ art: 'mehrfach', zutat: zutat.name, text: `Zutat „${zutat.name}“${zusatz ? ` (${zusatz})` : ''} steht ${eintraege.length}-mal in der Liste; kein Schritt sagt, dass dieser Eintrag gemeint ist` });
    }
  }
  return befunde;
}

// Alle Rezepte der Website mit ihrer Herkunft: "app" (Wortlaut aus der Quelle) oder "zusatz" (eigener Wortlaut oder
// von FoodAsu bearbeitet; es gibt sie in der App noch nicht).
export function alleRezepte() {
  const lies = (datei) => JSON.parse(readFileSync(new URL(`../src/daten/${datei}`, import.meta.url), 'utf8')).rezepte;
  return [...lies('rezepte.json').map((rezept) => ({ ...rezept, herkunft: 'app' })), ...lies('rezepte_zusatz.json').map((rezept) => ({ ...rezept, herkunft: 'zusatz' }))];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const zeilen = [];
  for (const herkunft of ['zusatz', 'app']) {
    const rezepte = alleRezepte().filter((rezept) => rezept.herkunft === herkunft);
    const treffer = rezepte.flatMap((rezept) => zutatenBefunde(rezept).map((befund) => ({ rezept, befund })));
    zeilen.push(`## ${herkunft === 'zusatz' ? 'Rezepte, die es in der App noch nicht gibt' : 'Rezepte aus der App'}: ${rezepte.length} Rezepte, ${treffer.length} Treffer`, '');
    for (const { rezept, befund } of treffer) zeilen.push(`- ${rezept.titel} (/rezepte/${rezept.slug}/): ${befund.text}`);
    zeilen.push('');
  }
  if (process.argv[2]) writeFileSync(process.argv[2], zeilen.join('\n'), 'utf8');
  console.log(zeilen.join('\n'));
}
