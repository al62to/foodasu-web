"""Baut die Bildschirmfotos für "So geht's" und für den Abschnitt "FoodAsu im Bild" der Startseite.

Quelle ist der Ordner mit den Bildschirmfotos der App aus der Play-Fassung (lokal, außerhalb jedes Repositorys):
C:/Users/ali/foodasu-play/So_gehts_Bilder. Genommen werden nur die Dateien aus dem Hauptordner; dort sind Marken,
Produktnamen, Produktfotos und EAN weichgezeichnet. Der Unterordner "original" (ohne Weichzeichnung) wird nie gelesen;
eine Quelle, die auf "original" endet, bricht den Lauf ab.

Zuschnitt (AP-19 Teil H): Ein Bild in voller Höhe (1080 x 2237) zeigt unten die Tasten von Android; es wird oberhalb
davon abgeschnitten (TASTEN). Ein Bild mit Tastatur wird oberhalb der Tastatur abgeschnitten; die Zeile steht je Bild
in OBERHALB. Ein neues Bild mit Tastatur braucht dort einen Eintrag. Am Ende prüft der Lauf, dass kein Bild die volle
Höhe behalten hat.

Welche Bilder gebraucht werden, steht in den Daten: Jeder Aufruf foto('bereich_thema_01', ...) in
src/daten/anleitung/*.mjs und jede Angabe datei: 'bereich_thema_01' in src/daten/startseite.mjs nennt ein Bild. Jedes entsteht als WebP in zwei Breiten unter public/bilder/sogehts/
(Unterstriche werden zu Bindestrichen). Maße und der Satz, was das Bild zeigt, gehen nach src/daten/sogehts_fotos.json;
die Seiten lesen daraus Breite, Höhe und die Bildbeschreibung. Bilder, die keine Seite mehr nennt, werden entfernt.

Aufruf: python tools/sogehts_fotos.py [--quelle <Ordner>] [--pruefe]
"""
import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image

WURZEL = Path(__file__).resolve().parent.parent
ZIEL = WURZEL / "public" / "bilder" / "sogehts"
VERZEICHNIS = WURZEL / "src" / "daten" / "sogehts_fotos.json"
DATEN = [*sorted((WURZEL / "src" / "daten" / "anleitung").glob("*.mjs")), WURZEL / "src" / "daten" / "startseite.mjs"]
QUELLE = Path("C:/Users/ali/foodasu-play/So_gehts_Bilder")
BREITEN = (360, 720)
# Namen der neuen Bildschirmfotos: Bereich, Thema, Schritt (zum Beispiel liste_abhaken_02).
NAME = re.compile(r"(?:datei:\s*|foto\()'([a-z]+(?:_[a-z0-9]+)+_\d\d)'")
BEREICHE = ("start", "scanner", "karte", "liste", "rezepte", "haushalt", "einstellungen")
# Höhe eines Bildes mit den Tasten von Android (Statusleiste schon entfernt) und Höhe des Streifens mit den Tasten.
VOLL = 2237
TASTEN = 144
# Bilder mit Tastatur: Name -> letzte Zeile über der Tastatur (Bildpunkte des Bildes im Hauptordner).
OBERHALB = {"liste_eintraege_02": 1128, "scanner_ean_01": 1200}


def gebraucht() -> list[str]:
    namen: list[str] = []
    for datei in DATEN:
        for name in NAME.findall(datei.read_text(encoding="utf-8")):
            if name not in namen:
                namen.append(name)
    return namen


def zuschnitt(name: str, bild: Image.Image) -> Image.Image:
    """Schneidet unten ab: über der Tastatur (OBERHALB) oder über den Tasten von Android (volle Höhe)."""
    if name in OBERHALB:
        return bild.crop((0, 0, bild.width, OBERHALB[name]))
    if bild.height == VOLL:
        return bild.crop((0, 0, bild.width, VOLL - TASTEN))
    return bild


def webname(name: str, breite: int) -> str:
    return f"{name.replace('_', '-')}-{breite}.webp"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quelle", type=Path, default=QUELLE)
    parser.add_argument("--pruefe", action="store_true", help="nichts schreiben, nur melden, was fehlt oder zu viel ist")
    args = parser.parse_args()
    quelle = args.quelle.resolve()
    if quelle.name.lower() == "original" or "original" in [teil.lower() for teil in quelle.parts[-2:]]:
        print("FEHLER: Die Originale ohne Weichzeichnung kommen nie auf die Website.")
        return 1
    with open(quelle / "bilder.json", encoding="utf-8") as handle:
        bekannt = {eintrag["datei"][:-4]: eintrag for eintrag in json.load(handle)["bilder"]}

    namen = gebraucht()
    fehler = [name for name in namen if name not in bekannt or not (quelle / f"{name}.png").is_file()]
    if fehler:
        print("FEHLER: Diese Bilder nennt eine Seite, sie liegen aber nicht im Ordner oder nicht in bilder.json:")
        print("  " + ", ".join(fehler))
        return 1

    soll = {webname(name, breite) for name in namen for breite in BREITEN}
    vorhanden = {datei.name for datei in ZIEL.glob("*.webp") if datei.name.split("-")[0] in BEREICHE}
    zuviel = sorted(vorhanden - soll)
    if args.pruefe:
        fehlend = sorted(soll - vorhanden)
        print(f"{len(namen)} Bilder gebraucht, {len(fehlend)} Dateien fehlen, {len(zuviel)} zu viel")
        return 1 if fehlend or zuviel else 0

    ZIEL.mkdir(parents=True, exist_ok=True)
    verzeichnis = {}
    groesse = 0
    for name in namen:
        bild = zuschnitt(name, Image.open(quelle / f"{name}.png").convert("RGB"))
        if bild.height >= VOLL:
            print(f"FEHLER: {name} hat nach dem Zuschnitt noch die volle Höhe ({bild.height}).")
            return 1
        for breite in BREITEN:
            hoehe = round(bild.height * breite / bild.width)
            ziel = ZIEL / webname(name, breite)
            bild.resize((breite, hoehe), Image.LANCZOS).save(ziel, "WEBP", quality=80, method=6)
            groesse += ziel.stat().st_size
            if breite == BREITEN[-1]:
                verzeichnis[name] = {"breite": breite, "hoehe": hoehe, "zeigt": bekannt[name]["zeigt"],
                                     "weich": bool(bekannt[name]["weich"]), "aufnahme": bekannt[name]["aufnahme"]}
    for datei in zuviel:
        (ZIEL / datei).unlink()
    VERZEICHNIS.write_text(json.dumps(verzeichnis, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(namen)} Bilder in {len(BREITEN)} Breiten, zusammen {groesse / 1e6:.1f} MB; entfernt: {len(zuviel)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
