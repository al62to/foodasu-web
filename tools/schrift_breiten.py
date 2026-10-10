"""Schreibt die Zeichenbreiten von Arial nach src/daten/arial.json.

Die Vorschau der Google-Suche setzt den Titel in Arial 20 px und die Beschreibung in Arial 14 px. Damit der Bau und
das Prüfskript die Breite eines Textes in Pixeln rechnen können (src/daten/breite.mjs), stehen hier die Vorschübe der
Zeichen in Einheiten des Schriftgevierts. Gelesen wird die Schrift des Rechners; in das Repository kommt nur die
Tabelle der Breiten, nicht die Schrift.

Aufruf: python tools/schrift_breiten.py [--schrift C:/Windows/Fonts/arial.ttf]
"""
import argparse
import json
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ZIEL = Path(__file__).resolve().parent.parent / "src" / "daten" / "arial.json"
# Lateinisch mit Erweiterungen (Umlaute, ç, ı, ñ, á ...), dazu Satzzeichen wie Gedankenstrich und Anführungszeichen.
BEREICHE = [(0x20, 0x7E), (0xA0, 0x24F), (0x2010, 0x2044), (0x20AC, 0x20AC)]


def main() -> int:
    eingabe = argparse.ArgumentParser()
    eingabe.add_argument("--schrift", default="C:/Windows/Fonts/arial.ttf")
    schrift = TTFont(eingabe.parse_args().schrift)
    zeichen = schrift.getBestCmap()
    vorschub = schrift["hmtx"].metrics
    breiten = {}
    for von, bis in BEREICHE:
        for nummer in range(von, bis + 1):
            if nummer in zeichen:
                breiten[chr(nummer)] = vorschub[zeichen[nummer]][0]
    inhalt = {"schrift": "Arial", "geviert": schrift["head"].unitsPerEm, "breiten": breiten}
    ZIEL.write_text(json.dumps(inhalt, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{ZIEL.name}: {len(breiten)} Zeichen, Geviert {inhalt['geviert']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
