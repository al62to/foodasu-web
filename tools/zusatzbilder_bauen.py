"""Baut die Symbolbilder der Rezepte aus src/daten/rezepte_zusatz.json (alte Kochbücher und neue Rezepte).

Wie tools/rezeptbilder_bauen.py, nur mit eigenem Bildarchiv: Die Originale aus Adobe Firefly liegen außerhalb des
Repositorys im Ordner "eingang" des Archivs, auswahl_ap25.json nennt je Adresse die gewählte Datei. Geschrieben werden
für jedes Rezept die Karten, die Bilder der Rezeptseite und das Bild beim Teilen (Namen und Größen stehen dort).

Aufruf: python tools/zusatzbilder_bauen.py --archiv <Bildarchiv, z. B. C:/Users/ali/rezeptbilder/ap25>
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image

from rezeptbilder_bauen import KARTE, SEITE, TEILEN, WURZEL, ZIEL, schreibe


def main() -> None:
    eingabe = argparse.ArgumentParser()
    eingabe.add_argument("--archiv", required=True, type=Path)
    wahl = eingabe.parse_args()
    auswahl = json.loads((wahl.archiv / "auswahl_ap25.json").read_text(encoding="utf-8"))["auswahl"]
    rezepte = json.loads((WURZEL / "src" / "daten" / "rezepte_zusatz.json").read_text(encoding="utf-8"))["rezepte"]
    fehlt = [r["slug"] for r in rezepte if r["slug"] not in auswahl]
    if fehlt:
        print(f"FEHLER ohne Bild in auswahl_ap25.json: {fehlt}")
        sys.exit(1)
    ZIEL.mkdir(parents=True, exist_ok=True)
    summe = 0
    vorlaeufig = []
    for r in rezepte:
        eintrag = auswahl[r["slug"]]
        if eintrag.get("vorlaeufig"):
            vorlaeufig.append(r["slug"])
        with Image.open(wahl.archiv / eintrag.get("ordner", "eingang") / eintrag["datei"]) as original:
            bild = original.convert("RGB")
            for groessen in (KARTE, SEITE, TEILEN):
                summe += schreibe(bild, r["slug"], groessen)
    print(f"{len(rezepte)} Rezepte, {summe} Byte")
    if vorlaeufig:
        print(f"ACHTUNG {len(vorlaeufig)} Rezepte mit vorläufigem Bild (Platzhalter): {vorlaeufig}")


if __name__ == "__main__":
    main()
