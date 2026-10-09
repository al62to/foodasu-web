"""Schreibt die Rezeptdaten der Website aus dem Rezeptpaket der App: src/daten/rezepte.json.

Gelesen wird nur rezepte.db (lesend). In die Datei kommen nur die Rezepte der Auswahl (src/daten/auswahl.mjs,
höchstens 40): Das Repository ist öffentlich, alle übrigen Rezepte gibt es nur in der App. Was die Seiten über die
App sagen ("davon 216 zu diesem Thema"), rechnet der Lauf über alle Rezepte des Pakets aus und schreibt davon nur
die Zahlen in die Datei ("zahlen").

Von Hand gepflegt ist nur die Liste der fremdsprachigen Namen in Titeln für das lang-Attribut. Sie nennt Rezepte
über die Auswahl hinaus und liegt deshalb außerhalb des Repositorys (--sprachen). Die Adresse eines Rezepts (slug)
entsteht aus dem Titel vor der Klammer und bleibt fest: Der Lauf bricht ab, wenn sich eine schon vergebene Adresse
ändern würde oder zwei Rezepte dieselbe bekämen.

Aufruf: python tools/rezepte_exportieren.py --paket <Ordner "assets" der App, darin rezepte/rezepte.db>
            --sprachen <Datei titel_sprachen.tsv>
"""
import argparse
import json
import re
import sqlite3
import sys
import unicodedata
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
ZIEL = WURZEL / "src" / "daten" / "rezepte.json"
AUSWAHL = WURZEL / "src" / "daten" / "auswahl.mjs"
HOECHSTENS = 40
# Adressen unter /rezepte/, die den Themenseiten gehören.
VERGEBEN = ("land", "kategorie", "vegetarisch", "vegan", "alle")
ERSATZ = {"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "œ": "oe", "æ": "ae", "ø": "o", "đ": "d", "ł": "l", "ı": "i"}
NAEHRWERTE = ("kcal", "fett", "gesaettigt", "kohlenhydrate", "zucker", "ballaststoffe", "eiweiss", "salz")


def slug(text: str) -> str:
    text = "".join(ERSATZ.get(z, z) for z in text.lower())
    text = unicodedata.normalize("NFD", text)
    text = "".join(z for z in text if not unicodedata.combining(z))
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def kurztitel(titel: str) -> str:
    """Titel ohne den erklärenden Zusatz in Klammern am Ende."""
    return re.sub(r"\s*\([^()]*\)\s*$", "", titel).strip() or titel


def fehler(text: str) -> None:
    print(f"FEHLER {text}")
    sys.exit(1)


def auswahl() -> list[str]:
    """Die Adressen der Rezepte der Website aus src/daten/auswahl.mjs."""
    text = AUSWAHL.read_text(encoding="utf-8").split("export const auswahl = [")[1].split("];")[0]
    adressen = re.findall(r"'([a-z0-9-]+)'", re.sub(r"//.*", "", text))
    if len(adressen) != len(set(adressen)):
        fehler("auswahl.mjs nennt ein Rezept doppelt")
    if not adressen or len(adressen) > HOECHSTENS:
        fehler(f"auswahl.mjs nennt {len(adressen)} Rezepte, erlaubt sind 1 bis {HOECHSTENS}")
    return adressen


def main() -> None:
    eingabe = argparse.ArgumentParser()
    eingabe.add_argument("--paket", required=True)
    eingabe.add_argument("--sprachen", required=True, type=Path)
    wahl = eingabe.parse_args()
    paket = Path(wahl.paket) / "rezepte" / "rezepte.db"
    gewaehlt = auswahl()
    db = sqlite3.connect(f"file:{paket.as_posix()}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row

    fremd: dict[int, list[dict]] = {}
    for zeile in wahl.sprachen.read_text(encoding="utf-8").splitlines():
        if not zeile.strip() or zeile.startswith("#"):
            continue
        nr, wortlaut, sprache = zeile.split("\t")
        fremd.setdefault(int(nr), []).append({"text": wortlaut, "lang": sprache})

    alt = {}
    if ZIEL.is_file():
        alt = {r["id"]: r["slug"] for r in json.loads(ZIEL.read_text(encoding="utf-8"))["rezepte"]}

    rezepte, adressen = [], {}
    for r in db.execute("select * from rezept order by nr"):
        nr = r["nr"]
        for eintrag in fremd.get(nr, []):
            if eintrag["text"] not in r["titel"]:
                fehler(f"{wahl.sprachen.name}, Rezept {nr}: '{eintrag['text']}' steht nicht im Titel '{r['titel']}'")
        adresse = slug(kurztitel(r["titel"]))
        if not adresse or adresse in VERGEBEN or adresse.startswith("ohne-"):
            fehler(f"Rezept {nr}: Adresse '{adresse}' ist nicht verwendbar")
        if adresse in adressen:
            fehler(f"Adresse '{adresse}' doppelt: Rezept {adressen[adresse]} und {nr}")
        if r["id"] in alt and alt[r["id"]] != adresse:
            fehler(f"Rezept {nr}: Adresse würde sich ändern ({alt[r['id']]} -> {adresse})")
        adressen[adresse] = nr

        hinweise: dict[int, list[dict]] = {}
        for h in db.execute("select pos, eintrag, stufe from hinweis where rezept_nr = ? order by pos, eintrag", (nr,)):
            hinweise.setdefault(h["pos"], []).append({"eintrag": h["eintrag"], "stufe": h["stufe"]})
        zutaten = [
            {
                "menge": z["menge"], "einheit": z["einheit_text"], "name": z["name"],
                "grundbegriff": z["grundbegriff"], "gruppe": z["gruppe"], "hinweise": hinweise.get(z["pos"], []),
            }
            for z in db.execute("select * from zutat where rezept_nr = ? order by pos", (nr,))
        ]
        gesamt = dict(teil.split("=") for teil in r["hinweise"].split(";") if teil)
        rezepte.append({
            "nr": nr, "id": r["id"], "slug": adresse, "titel": r["titel"], "kurztitel": kurztitel(r["titel"]),
            "fremd": fremd.get(nr, []),
            "laender": r["laender"].split(","), "kueche": r["kueche"], "kategorie": r["kategorie"],
            "aufwand": r["aufwand"], "portionen": r["portionen"], "portionenEinheit": r["portionen_einheit"],
            "portionenText": r["portionen_text"], "zeitVorbereitung": r["zeit_vorbereitung"],
            "zeitGesamt": r["zeit_gesamt"], "vegetarisch": bool(r["vegetarisch"]), "vegan": bool(r["vegan"]),
            "quelle": r["quelle"], "quelleUrl": r["quelle_url"], "urheberUrl": r["urheber_url"],
            "lizenz": r["lizenz"], "lizenzUrl": r["lizenz_url"], "uebertragen": bool(r["uebertragen"]),
            "aenderung": r["aenderung"], "hinweise": gesamt, "energiedichte": r["energiedichte"],
            "nwVollstaendig": bool(r["nw_vollstaendig"]), "ohneSalzNachGeschmack": bool(r["nw_ohne_salz_nach_geschmack"]),
            "portion": None if r["portion_kcal"] is None else {n: r[f"portion_{n}"] for n in NAEHRWERTE},
            "je100": {n: r[f"je100_{n}"] for n in NAEHRWERTE},
            "zutaten": zutaten,
            "schritte": [s["text"] for s in db.execute("select text from schritt where rezept_nr = ? order by pos", (nr,))],
        })

    stand = dict(db.execute("select schluessel, wert from paket"))
    if len(rezepte) != int(stand["rezepte"]):
        fehler(f"{len(rezepte)} Rezepte gelesen, das Paket nennt {stand['rezepte']}")
    unbekannt = [adresse for adresse in gewaehlt if adresse not in adressen]
    if unbekannt:
        fehler(f"auswahl.mjs nennt unbekannte Rezepte: {unbekannt}")

    # Zahlen über alle Rezepte der App: Rezepte mit einem Hinweis je Eintrag, je Land und je Kategorie.
    mit_hinweis: dict[str, int] = {}
    je_land: dict[str, int] = {}
    je_kategorie: dict[str, int] = {}
    for r in rezepte:
        for eintrag in r["hinweise"]:
            mit_hinweis[eintrag] = mit_hinweis.get(eintrag, 0) + 1
        for land in r["laender"]:
            je_land[land] = je_land.get(land, 0) + 1
        je_kategorie[r["kategorie"]] = je_kategorie.get(r["kategorie"], 0) + 1
    zahlen = {
        "gesamt": len(rezepte), "laender": len(je_land),
        "mitHinweis": dict(sorted(mit_hinweis.items())), "land": dict(sorted(je_land.items())),
        "kategorie": dict(sorted(je_kategorie.items())),
    }

    website = [r for r in rezepte if r["slug"] in set(gewaehlt)]
    daten = {
        "paket": {"stand": stand["stand"], "version": stand["version"], "naehrwerte": stand["naehrwerte"]},
        "zahlen": zahlen, "rezepte": website,
    }
    ZIEL.write_text(json.dumps(daten, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    print(f"{len(website)} von {len(rezepte)} Rezepten geschrieben, {sum(len(r['fremd']) for r in website)} "
          f"gekennzeichnete Namen, {ZIEL.stat().st_size} Byte")


if __name__ == "__main__":
    main()
