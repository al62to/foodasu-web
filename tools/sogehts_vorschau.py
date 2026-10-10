"""Kontaktbögen der Bilder von "So geht's" für die Vorschau (AP-19 Teil G): je Kapitel ein Bogen mit den Bildern in der
Reihenfolge der Seite, unter jedem Bild der Dateiname aus foodasu-play/So_gehts_Bilder und die Unterschrift.

Gezeigt werden die Web-Fassungen aus public/bilder/sogehts, also genau das, was veröffentlicht würde.
Aufruf: erst node tools/sogehts_vorschau.mjs <Zielordner>, dann python tools/sogehts_vorschau.py <Zielordner>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WURZEL = Path(__file__).resolve().parent.parent
WEB = WURZEL / "public" / "bilder" / "sogehts"
BREITE, SPALTEN, RAND, KOPF, FUSS, JE_BOGEN = 300, 6, 14, 46, 44, 18


def schrift(datei: str, groesse: int):
    try:
        return ImageFont.truetype(f"C:/Windows/Fonts/{datei}", groesse)
    except OSError:
        return ImageFont.load_default()


def main() -> int:
    ziel = Path(sys.argv[1])
    liste = json.loads((ziel / "_fotos.json").read_text(encoding="utf-8"))
    for alt in ziel.glob("Kontaktbogen_*.png"):
        alt.unlink()
    normal, fett = schrift("arial.ttf", 15), schrift("arialbd.ttf", 22)
    for kapitel in liste:
        fotos = kapitel["fotos"]
        for teil, start in enumerate(range(0, len(fotos), JE_BOGEN), start=1):
            stueck = fotos[start:start + JE_BOGEN]
            bilder = []
            for foto in stueck:
                bild = Image.open(WEB / f"{foto['datei'].replace('_', '-')}-720.webp").convert("RGB")
                bilder.append(bild.resize((BREITE, round(bild.height * BREITE / bild.width)), Image.LANCZOS))
            hoehe = max(bild.height for bild in bilder)
            zeilen = (len(stueck) + SPALTEN - 1) // SPALTEN
            bogen = Image.new("RGB", (RAND + SPALTEN * (BREITE + RAND), KOPF + zeilen * (hoehe + FUSS + RAND) + RAND), (255, 255, 255))
            stift = ImageDraw.Draw(bogen)
            name = f"Kapitel {kapitel['nummer']}: {kapitel['titel']}" if kapitel["nummer"] else kapitel["titel"]
            mehrere = len(fotos) > JE_BOGEN
            stift.text((RAND, 12), f"{name}{f' (Bogen {teil})' if mehrere else ''} – {len(fotos)} Bilder in der Reihenfolge der Seite", fill=(20, 20, 30), font=fett)
            for stelle, (foto, bild) in enumerate(zip(stueck, bilder)):
                x = RAND + (stelle % SPALTEN) * (BREITE + RAND)
                y = KOPF + (stelle // SPALTEN) * (hoehe + FUSS + RAND)
                bogen.paste(bild, (x, y))
                stift.rectangle((x, y, x + BREITE - 1, y + bild.height - 1), outline=(190, 190, 200))
                stift.text((x, y + hoehe + 6), f"{foto['datei']}.png", fill=(20, 20, 30), font=normal)
                stift.text((x, y + hoehe + 24), foto["unterschrift"][:44], fill=(90, 90, 100), font=normal)
            datei = f"Kontaktbogen_{kapitel['nummer']:02d}_{kapitel['slug']}{f'_{teil}' if mehrere else ''}.png"
            bogen.save(ziel / datei, optimize=True)
            print(datei, bogen.size)
    (ziel / "_fotos.json").unlink()
    return 0


if __name__ == "__main__":
    sys.exit(main())
