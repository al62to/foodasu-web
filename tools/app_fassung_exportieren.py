"""Schreibt die Zahlen einer Fassung der App, die auf der Website stehen, nach src/daten/app_fassung.json.

Feste Vorgabe (Ali, 14.10.2026): Jede Zahl über die App auf der Website (Rezepte, Länder, Einträge zum Meiden, Stufen
und ähnliche) passt zur öffentlich verfügbaren Fassung der App und kommt aus einer Quelle (appZahlen in
src/daten/app_zahlen.mjs). Rezepte und Länder kommen aus rezepte.json (tools/rezepte_exportieren.py); dieses Werkzeug
liefert die Einträge zum Meiden:

- eintraegeFest: die festen Einträge des Katalogs der App (AvoidCatalog: die Zutaten aus EuAllergens und die
  Einträge aus AvoidKeys), mit ihren Schlüsseln, dazu je Art (zutaten, ernaehrungsformen, weitere);
- stufen: die Stufen eines Eintrags (enum Strictness in AvoidEntry.kt);
- haeufigGewaehlt: ab 0.15 die Knöpfe „Häufig gewählt“ (OwnIngredientUi.frequentKeys), sonst null;
- weitereLebensmittel: ab 0.15 die Lebensmittel aus der Zutatenliste der App (res/raw/zutaten_taxonomie.tsv), die man
  auf Deutsch wählen kann; dieselbe Regel wie TaxonomyEntry.isSelectable: deutscher Name, gültige Kennung
  (^[a-z]{2}:[a-z0-9-]+$), kein fester Eintrag. Die Zahl muss mit dem Unit-Test der App übereinstimmen
  (AvoidSearchTest, selectableCount(DE)), sonst bricht das Werkzeug ab. Vor 0.15 gibt es die Datei nicht, dann 0.

Gelesen wird mit git aus dem Repository der App, nichts dort wird geändert.
Aufruf: python tools/app_fassung_exportieren.py --app C:/Users/ali/einkauf-app --ref <Zweig oder Commit>
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ZIEL = Path(__file__).resolve().parent.parent / 'src' / 'daten' / 'app_fassung.json'
KATALOG = 'app/src/main/java/at/tonc/einkauf/profile/domain/AvoidCatalog.kt'
EINTRAG = 'app/src/main/java/at/tonc/einkauf/profile/domain/AvoidEntry.kt'
HAEUFIG = 'app/src/main/java/at/tonc/einkauf/profile/ui/OwnIngredientUi.kt'
SCHLUESSEL = 'app/src/main/java/at/tonc/einkauf/profile/domain/AvoidKeys.kt'
BAU = 'app/build.gradle.kts'
LISTE = 'app/src/main/res/raw/zutaten_taxonomie.tsv'
TEST = 'app/src/test/java/at/tonc/einkauf/taxonomy/domain/AvoidSearchTest.kt'
GUELTIG = re.compile(r'^[a-z]{2}:[a-z0-9-]+$')


def git(app, *argumente, darf_fehlen=False):
    lauf = subprocess.run(['git', '-C', app, *argumente], capture_output=True)
    if lauf.returncode != 0:
        if darf_fehlen:
            return None
        sys.exit(f'git {" ".join(argumente)}: {lauf.stderr.decode("utf-8", "replace").strip()}')
    return lauf.stdout.decode('utf-8')


def feste_schluessel(app, ref):
    schluessel = git(app, 'show', f'{ref}:{SCHLUESSEL}')
    katalog = git(app, 'show', f'{ref}:{KATALOG}')
    konstanten = dict(re.findall(r'const val ([A-Z_]+) = "([^"]+)"', schluessel))
    eu = re.search(r'object EuAllergens \{\s*val all: List<String> = listOf\(([^)]*)\)', schluessel)
    if not eu:
        sys.exit('EuAllergens.all nicht gefunden')
    liste = re.findall(r'"([^"]+)"', eu.group(1))
    if 'EuAllergens.all.map' not in katalog:
        sys.exit('AvoidCatalog nimmt EuAllergens.all nicht mehr auf; Werkzeug anpassen')
    paare = re.findall(r'AvoidCatalogItem\(AvoidKeys\.([A-Z_]+), AvoidKind\.([A-Z_]+)\)', katalog)
    if 'EuAllergens.all.map { AvoidCatalogItem(it, AvoidKind.ZUTAT) }' not in katalog:
        sys.exit('AvoidCatalog: die Zutaten aus EuAllergens sind nicht mehr die Art ZUTAT; Werkzeug anpassen')
    weitere = [konstanten[name] for name, _ in paare]
    alle = liste + weitere
    if len(set(alle)) != len(alle) or not all(GUELTIG.match(eintrag) for eintrag in alle):
        sys.exit(f'feste Schlüssel doppelt oder ungültig: {alle}')
    arten = {'zutaten': len(liste), 'ernaehrungsformen': sum(art == 'ERNAEHRUNGSFORM' for _, art in paare),
             'weitere': sum(art == 'WEITERE' for _, art in paare)}
    if sum(arten.values()) != len(alle):
        sys.exit(f'Arten der festen Einträge: {arten} ergibt nicht {len(alle)}')
    return alle, arten


def stufen(app, ref):
    eintrag = git(app, 'show', f'{ref}:{EINTRAG}')
    werte = re.search(r'enum class Strictness \{([^;}]*);', eintrag)
    if not werte:
        sys.exit('enum Strictness nicht gefunden')
    return len([wert for wert in werte.group(1).replace(',', ' ').split() if wert])


def haeufig(app, ref):
    text = git(app, 'show', f'{ref}:{HAEUFIG}', darf_fehlen=True)
    liste = re.search(r'val frequentKeys: List<String> = listOf\(([^)]*)\)', text or '')
    return len([eintrag for eintrag in liste.group(1).split(',') if eintrag.strip()]) if liste else None


def weitere_lebensmittel(app, ref, fest):
    inhalt = git(app, 'show', f'{ref}:{LISTE}', darf_fehlen=True)
    if inhalt is None:
        return 0, None
    kopf = dict(re.findall(r'^# (version|stand): (.+)$', inhalt, re.M))
    zeilen = [zeile for zeile in inhalt.splitlines() if zeile and not zeile.startswith('#')]
    spalten = zeilen[0].split('\t')
    kennung, deutsch = spalten.index('kennung'), spalten.index('de')
    zahl = 0
    for zeile in zeilen[1:]:
        feld = zeile.split('\t')
        if feld[deutsch].strip() and GUELTIG.match(feld[kennung]) and feld[kennung] not in fest:
            zahl += 1
    test = git(app, 'show', f'{ref}:{TEST}')
    erwartet = re.search(r'assertEquals\((\d+), realSearch\.selectableCount\(DE\)\)', test)
    if not erwartet or int(erwartet.group(1)) != zahl:
        sys.exit(f'Zutatenliste: {zahl} wählbare Einträge auf Deutsch, der Test der App erwartet {erwartet.group(1) if erwartet else "nichts"}')
    return zahl, {'version': int(kopf['version']), 'stand': kopf['stand'].strip()}


def main():
    teil = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    teil.add_argument('--app', required=True)
    teil.add_argument('--ref', required=True)
    argumente = teil.parse_args()
    commit = git(argumente.app, 'rev-parse', '--short', argumente.ref).strip()
    bau = git(argumente.app, 'show', f'{argumente.ref}:{BAU}')
    fassung = re.search(r'versionName = "([^"]+)"', bau).group(1)
    code = int(re.search(r'versionCode = (\d+)', bau).group(1))
    fest, arten = feste_schluessel(argumente.app, argumente.ref)
    weitere, liste = weitere_lebensmittel(argumente.app, argumente.ref, set(fest))
    daten = {
        'fassung': fassung, 'versionCode': code, 'commit': commit,
        'eintraegeFest': len(fest), 'arten': arten, 'festeSchluessel': fest,
        'stufen': stufen(argumente.app, argumente.ref), 'haeufigGewaehlt': haeufig(argumente.app, argumente.ref),
        'weitereLebensmittel': weitere, 'zutatenliste': liste,
    }
    ZIEL.write_text(json.dumps(daten, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{ZIEL.name}: Fassung {fassung} ({code}, {commit}), {len(fest)} feste Einträge {arten}, {weitere} weitere Lebensmittel, {daten["stufen"]} Stufen, „Häufig gewählt“ {daten["haeufigGewaehlt"]}')


if __name__ == '__main__':
    main()
