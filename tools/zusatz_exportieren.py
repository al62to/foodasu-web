"""Schreibt die Rezepte, die es auf der Website schon gibt und die später in die App kommen: src/daten/rezepte_zusatz.json.

Das sind zwei Pakete, die neben dem Rezeptpaket der App liegen und mit denselben Werkzeugen gebaut sind: "historisch"
(Rezepte aus alten Kochbüchern in einer heutigen Fassung) und "neu" (weitere Rezepte aus frei lizenzierten Quellen).
Gelesen werden rezepte_ap25.db (derselbe Aufbau wie rezepte.db der App) und zusatz_ap25.json (Paket je Rezept, bei den
alten die Angaben zum Original). Alle Rezepte der beiden Dateien stehen auf der Website; die Auswahl der 40 Rezepte
aus der App (src/daten/auswahl.mjs) bleibt davon unberührt.

Seit AP-107 sind die 25 Rezepte auch in der App (Rezeptpaket Version 3). Damit es für jeden Text nur eine Quelle gibt,
kommen Zutaten, Hinweise, Schritte (Fassung für Österreich), Zeiten, vegetarisch und vegan, der Änderungsvermerk und
die Nährwerte aus dem Rezeptpaket der App (--paket); aus rezepte_ap25.db und zusatz_ap25.json bleiben Titel, Länder,
Quelle, Adressen der Quelle, Lizenz und die Angaben zum Original. Fehlt ein Rezept im Paket der App, bricht der Lauf ab.
"inApp" sagt der Website, dass das Rezept in der App ist (dann entfällt der Kasten „kommt später in die App“).

Die Adresse eines alten Rezepts ist "<gericht>-<jahr>", die eines neuen entsteht wie bei den übrigen aus dem Titel vor
der Klammer. Der Lauf bricht ab, wenn sich eine schon vergebene Adresse ändern würde oder eine Adresse doppelt wäre,
auch gegenüber rezepte.json.

Aufruf: python tools/zusatz_exportieren.py --ordner <Ordner mit rezepte_ap25.db und zusatz_ap25.json>
            --paket <Ordner "assets" der App, darin rezepte/rezepte.db>
"""
import argparse
import json
import sqlite3
import sys
from pathlib import Path

from rezepte_exportieren import NAEHRWERTE, VERGEBEN, fehler, kurztitel, slug

WURZEL = Path(__file__).resolve().parent.parent
ZIEL = WURZEL / "src" / "daten" / "rezepte_zusatz.json"
APP = WURZEL / "src" / "daten" / "rezepte.json"
# Nummern hinter denen der App, je Paket ein eigener Bereich (die Nummer ordnet nur, sie steht auf keiner Seite).
ERSTE_NR = {"neu": 1001, "historisch": 2001}
ZEITRAEUME = ("1500er", "1600er und 1700er", "1800er", "1900 bis 1955")


def main() -> None:
    eingabe = argparse.ArgumentParser()
    eingabe.add_argument("--ordner", required=True, type=Path)
    eingabe.add_argument("--paket", required=True, type=Path)
    wahl = eingabe.parse_args()
    app = sqlite3.connect(f"file:{(wahl.paket / 'rezepte' / 'rezepte.db').as_posix()}?mode=ro", uri=True)
    app.row_factory = sqlite3.Row
    app_stand = dict(app.execute("select schluessel, wert from paket"))
    if app_stand["version"] != "3":
        fehler(f"Rezeptpaket der App Version {app_stand['version']}, erwartet 3 (mit den Rezepten aus AP-25)")
    in_app = {r["id"]: r for r in app.execute("select * from rezept")}
    zusatz = json.loads((wahl.ordner / "zusatz_ap25.json").read_text(encoding="utf-8"))
    db = sqlite3.connect(f"file:{(wahl.ordner / 'rezepte_ap25.db').as_posix()}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row

    belegt = {r["slug"] for r in json.loads(APP.read_text(encoding="utf-8"))["rezepte"]}
    alt = {}
    if ZIEL.is_file():
        alt = {r["id"]: r["slug"] for r in json.loads(ZIEL.read_text(encoding="utf-8"))["rezepte"]}

    rezepte, adressen = [], {}
    zaehler = dict(ERSTE_NR)
    for r in db.execute("select * from rezept order by nr"):
        angaben = zusatz.get(r["id"])
        if angaben is None:
            fehler(f"{r['titel']}: steht nicht in zusatz_ap25.json")
        paket = angaben["paket"]
        original = angaben.get("alt")
        if paket == "historisch":
            if original["zeitraum"] not in ZEITRAEUME:
                fehler(f"{r['titel']}: Zeitraum {original['zeitraum']!r}")
            if not r["titel"].endswith(f"({original['jahr']})"):
                fehler(f"{r['titel']}: Der Titel eines alten Rezepts endet mit dem Jahr in Klammern")
            adresse = f"{slug(kurztitel(r['titel']))}-{original['jahr']}"
            kurz = r["titel"]
        else:
            adresse = slug(kurztitel(r["titel"]))
            kurz = kurztitel(r["titel"])
        if not adresse or adresse in VERGEBEN or adresse.startswith("ohne-"):
            fehler(f"{r['titel']}: Adresse '{adresse}' ist nicht verwendbar")
        if adresse in adressen or adresse in belegt:
            fehler(f"Adresse '{adresse}' doppelt ({r['titel']})")
        if r["id"] in alt and alt[r["id"]] != adresse:
            fehler(f"{r['titel']}: Adresse würde sich ändern ({alt[r['id']]} -> {adresse})")
        adressen[adresse] = r["id"]
        a = in_app.get(r["id"])
        if a is None:
            fehler(f"{r['titel']}: fehlt im Rezeptpaket der App")
        if a["titel"] != r["titel"] or a["laender"] != r["laender"]:
            fehler(f"{r['titel']}: Titel oder Länder anders als im Rezeptpaket der App")
        nr = zaehler[paket]
        zaehler[paket] += 1

        hinweise: dict[int, list[dict]] = {}
        for h in app.execute("select pos, eintrag, stufe from hinweis where rezept_nr = ? order by pos, eintrag", (a["nr"],)):
            hinweise.setdefault(h["pos"], []).append({"eintrag": h["eintrag"], "stufe": h["stufe"]})
        zutaten = [
            {
                "menge": z["menge"], "einheit": z["einheit_text"], "name": z["name"],
                "grundbegriff": z["grundbegriff"], "gruppe": z["gruppe"], "hinweise": hinweise.get(z["pos"], []),
            }
            for z in app.execute("select * from zutat where rezept_nr = ? order by pos", (a["nr"],))
        ]
        gesamt = dict(teil.split("=") for teil in a["hinweise"].split(";") if teil)
        rezepte.append({
            "nr": nr, "id": r["id"], "slug": adresse, "titel": r["titel"], "kurztitel": kurz, "fremd": [],
            "laender": r["laender"].split(","), "kueche": r["kueche"], "kategorie": r["kategorie"],
            "aufwand": r["aufwand"], "portionen": r["portionen"], "portionenEinheit": r["portionen_einheit"],
            "portionenText": a["portionen_text"], "zeitVorbereitung": a["zeit_vorbereitung"],
            "zeitGesamt": a["zeit_gesamt"], "vegetarisch": bool(a["vegetarisch"]), "vegan": bool(a["vegan"]),
            "quelle": r["quelle"], "quelleUrl": r["quelle_url"], "urheberUrl": r["urheber_url"],
            "lizenz": r["lizenz"], "lizenzUrl": r["lizenz_url"], "uebertragen": bool(r["uebertragen"]),
            "aenderung": a["aenderung"], "hinweise": gesamt, "energiedichte": a["energiedichte"],
            "nwVollstaendig": bool(a["nw_vollstaendig"]), "ohneSalzNachGeschmack": bool(a["nw_ohne_salz_nach_geschmack"]),
            "portion": None if a["portion_kcal"] is None else {n: a[f"portion_{n}"] for n in NAEHRWERTE},
            "je100": {n: a[f"je100_{n}"] for n in NAEHRWERTE},
            "zutaten": zutaten,
            "schritte": [s["text"] for s in app.execute("select text from schritt where rezept_nr = ? order by pos", (a["nr"],))],
            "paket": paket, "inApp": True, "original": original,
        })

    fehlt = sorted(set(zusatz) - {r["id"] for r in rezepte})
    if fehlt:
        fehler(f"zusatz_ap25.json nennt Rezepte, die in rezepte_ap25.db fehlen: {fehlt}")
    rezepte.sort(key=lambda r: r["nr"])
    stand = dict(db.execute("select schluessel, wert from paket"))
    daten = {"paket": {"stand": stand["stand"], "naehrwerte": stand["naehrwerte"]}, "rezepte": rezepte}
    ZIEL.write_text(json.dumps(daten, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    je = {paket: sum(1 for r in rezepte if r["paket"] == paket) for paket in ERSTE_NR}
    print(f"{len(rezepte)} Rezepte geschrieben ({je}), {ZIEL.stat().st_size} Byte")
    for r in rezepte:
        print(f"  {r['nr']} /rezepte/{r['slug']}/  {r['titel']}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
