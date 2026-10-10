"""Baut die Symbolbilder der Rezept- und Themenseiten aus den Originalen des Bildarchivs.

Das Archiv liegt außerhalb des Repositorys und wird nur gelesen (auswahl.json und der Ordner eingang). Welche Datei
zu welchem Rezept gehört, sagt die Auswahl über die Nummer; der Titel der Auswahl muss zum Titel in
src/daten/rezepte.json passen, sonst bricht der Lauf ab. Jede Datei trägt die IPTC-Angabe DigitalSourceType =
TrainedAlgorithmicMedia (als XMP), weil die Symbolbilder mit Adobe Firefly erzeugt sind.

Je Rezept unter public/bilder/rezepte/:
    <slug>-karte-360.avif/.webp       360 x 270    Karten auf Themenseiten und Übersicht (--karten, Rezepte der Auswahl)
    <slug>-karte-720.avif/.webp       720 x 540    dieselben Karten für dichte Bildschirme
    <slug>-4x3-720.avif/.webp         720 x 540    Bild der Rezeptseite
    <slug>-4x3-1200.avif/.webp       1200 x 900    Bild der Rezeptseite und strukturierte Daten (4:3)
    <slug>-16x9-1200.webp            1200 x 675    strukturierte Daten (16:9)
    <slug>-1x1-1200.webp             1200 x 1200   strukturierte Daten (1:1)
    <slug>-teilen.jpg                1200 x 630    Bild beim Teilen (Open Graph, Twitter-Karte), mit --teilen

Aufruf:
    python tools/rezeptbilder_bauen.py --archiv <Bildarchiv> --karten
    python tools/rezeptbilder_bauen.py --archiv <Bildarchiv> --seiten bibimbap [weitere Adressen | alle]
    python tools/rezeptbilder_bauen.py --archiv <Bildarchiv> --teilen --seiten alle   (nur die Bilder zum Teilen)
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image

WURZEL = Path(__file__).resolve().parent.parent
ZIEL = WURZEL / "public" / "bilder" / "rezepte"
HERKUNFT = "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
XMP = (
    '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>'
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">'
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
    '<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
    f'Iptc4xmpExt:DigitalSourceType="{HERKUNFT}"/>'
    "</rdf:RDF></x:xmpmeta>"
    '<?xpacket end="w"?>'
).encode("utf-8")
# Name -> (Seitenverhältnis, Breite, Höhe, Formate)
KARTE = {"karte-360": ((4, 3), 360, 270, ("avif", "webp")), "karte-720": ((4, 3), 720, 540, ("avif", "webp"))}
SEITE = {
    "4x3-720": ((4, 3), 720, 540, ("avif", "webp")),
    "4x3-1200": ((4, 3), 1200, 900, ("avif", "webp")),
    "16x9-1200": ((16, 9), 1200, 675, ("webp",)),
    "1x1-1200": ((1, 1), 1200, 1200, ("webp",)),
}
# Bild beim Teilen: JPEG, weil nicht jeder Dienst WebP in der Vorschau zeigt.
TEILEN = {"teilen": ((40, 21), 1200, 630, ("jpg",))}


def zuschnitt(bild: Image.Image, verhaeltnis: tuple[int, int]) -> Image.Image:
    """Mittiger Zuschnitt auf das Seitenverhältnis."""
    breite, hoehe = bild.size
    b, h = verhaeltnis
    if breite * h >= hoehe * b:
        neu = hoehe * b // h
        links = (breite - neu) // 2
        return bild.crop((links, 0, links + neu, hoehe))
    neu = breite * h // b
    oben = (hoehe - neu) // 2
    return bild.crop((0, oben, breite, oben + neu))


def schreibe(bild: Image.Image, slug: str, groessen: dict) -> int:
    summe = 0
    for name, (verhaeltnis, breite, hoehe, formate) in groessen.items():
        fertig = zuschnitt(bild, verhaeltnis).resize((breite, hoehe), Image.LANCZOS)
        for endung in formate:
            datei = ZIEL / f"{slug}-{name}.{endung}"
            if endung == "avif":
                fertig.save(datei, "AVIF", quality=58, speed=3, xmp=XMP)
            elif endung == "jpg":
                fertig.save(datei, "JPEG", quality=84, optimize=True, progressive=True, xmp=XMP)
            else:
                fertig.save(datei, "WEBP", quality=78, method=6, xmp=XMP)
            if HERKUNFT.encode() not in datei.read_bytes():
                print(f"FEHLER {datei.name}: Herkunftsangabe fehlt")
                sys.exit(1)
            if breite * hoehe < 50_000:
                print(f"FEHLER {datei.name}: weniger als 50.000 Bildpunkte")
                sys.exit(1)
            summe += datei.stat().st_size
    return summe


def main() -> None:
    eingabe = argparse.ArgumentParser()
    eingabe.add_argument("--archiv", required=True)
    eingabe.add_argument("--karten", action="store_true")
    eingabe.add_argument("--seiten", nargs="*", default=[])
    eingabe.add_argument("--teilen", action="store_true")
    wahl = eingabe.parse_args()
    archiv = Path(wahl.archiv)
    auswahl = json.loads((archiv / "auswahl.json").read_text(encoding="utf-8"))["auswahl"]
    rezepte = json.loads((WURZEL / "src" / "daten" / "rezepte.json").read_text(encoding="utf-8"))["rezepte"]
    seiten = {r["slug"] for r in rezepte} if wahl.seiten == ["alle"] else set(wahl.seiten)
    unbekannt = seiten - {r["slug"] for r in rezepte}
    if unbekannt:
        print(f"FEHLER unbekannte Adressen: {sorted(unbekannt)}")
        sys.exit(1)
    ZIEL.mkdir(parents=True, exist_ok=True)
    # Karten nur für die Rezepte der Website (src/daten/auswahl.mjs).
    import re
    gewaehlt_web = set(re.findall(r"'([a-z0-9-]+)'", (WURZEL / "src" / "daten" / "auswahl.mjs").read_text(encoding="utf-8").split("export const auswahl = [")[1].split("];")[0]))
    summe = {"karten": 0, "seiten": 0}
    for r in rezepte:
        gewaehlt = auswahl.get(str(r["nr"]))
        if gewaehlt is None or gewaehlt.get("titel") != r["titel"]:
            print(f"FEHLER Rezept {r['nr']}: Auswahl fehlt oder Titel passt nicht ({gewaehlt and gewaehlt.get('titel')!r} / {r['titel']!r})")
            sys.exit(1)
        if not (wahl.karten and r["slug"] in gewaehlt_web) and r["slug"] not in seiten:
            continue
        with Image.open(archiv / "eingang" / gewaehlt["datei"]) as original:
            bild = original.convert("RGB")
            if wahl.karten and r["slug"] in gewaehlt_web:
                summe["karten"] += schreibe(bild, r["slug"], KARTE)
            if r["slug"] in seiten:
                summe["seiten"] += schreibe(bild, r["slug"], TEILEN if wahl.teilen else SEITE)
    print(f"Karten: {summe['karten']} Byte, Seitenbilder ({len(seiten)} Rezepte): {summe['seiten']} Byte")


if __name__ == "__main__":
    main()
