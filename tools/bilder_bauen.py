"""Baut die Symbolbilder der Startseite aus dem Rezeptpaket der App.

Gelesen werden je Rezept nur Titel und Bild (rezepte.db, rezeptbilder/gross). Jedes Bild entsteht als AVIF und WebP in
zwei Breiten unter public/bilder/rezepte/ und trägt die IPTC-Angabe DigitalSourceType = TrainedAlgorithmicMedia
(als XMP), weil die Symbolbilder mit Adobe Firefly erzeugt sind.

Aufruf: python tools/bilder_bauen.py --paket <Ordner "assets" der App, darin rezepte/ und rezeptbilder/>
"""
import argparse
import sqlite3
import sys
from pathlib import Path

from PIL import Image

# Dateiname -> (Nummer im Rezeptpaket, erwarteter Titel). Weicht der Titel ab, bricht der Lauf ab.
BILDER = {
    "wiener-schnitzel": (301, "Wiener Schnitzel"),
    "pizza-margherita": (206, "Pizza Margherita"),
    "ratatouille": (222, "Ratatouille"),
    "baklava": (12, "Baklava"),
}
BREITEN = (360, 720)
HERKUNFT = "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
XMP = (
    '<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?>'
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">'
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
    '<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
    f'Iptc4xmpExt:DigitalSourceType="{HERKUNFT}"/>'
    "</rdf:RDF></x:xmpmeta>"
    '<?xpacket end="w"?>'
).encode("utf-8")


def main() -> int:
    eingabe = argparse.ArgumentParser()
    eingabe.add_argument("--paket", required=True)
    paket = Path(eingabe.parse_args().paket)
    ziel = Path(__file__).resolve().parent.parent / "public" / "bilder" / "rezepte"
    ziel.mkdir(parents=True, exist_ok=True)

    db = sqlite3.connect(f"file:{(paket / 'rezepte' / 'rezepte.db').as_posix()}?mode=ro", uri=True)
    for name, (nummer, erwartet) in BILDER.items():
        zeile = db.execute("select id, titel from rezept where nr = ?", (nummer,)).fetchone()
        if zeile is None or zeile[1] != erwartet:
            print(f"FEHLER Rezept {nummer}: erwartet '{erwartet}', gefunden {zeile and zeile[1]!r}")
            return 1
        bild = Image.open(paket / "rezeptbilder" / "gross" / f"{zeile[0]}.webp").convert("RGB")
        for breite in BREITEN:
            hoehe = round(bild.height * breite / bild.width)
            klein = bild if breite == bild.width else bild.resize((breite, hoehe), Image.LANCZOS)
            klein.save(ziel / f"{name}-{breite}.avif", "AVIF", quality=58, speed=3, xmp=XMP)
            klein.save(ziel / f"{name}-{breite}.webp", "WEBP", quality=78, method=6, xmp=XMP)
            for endung in ("avif", "webp"):
                datei = ziel / f"{name}-{breite}.{endung}"
                if HERKUNFT.encode() not in datei.read_bytes():
                    print(f"FEHLER {datei.name}: Herkunftsangabe fehlt")
                    return 1
                print(f"{datei.name}: {breite} x {hoehe}, {datei.stat().st_size} Byte")
    return 0


if __name__ == "__main__":
    sys.exit(main())
