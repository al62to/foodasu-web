"""Baut die Bildschirmfotos und die kurzen Schleifen für den Bereich "So geht's" und die zwei Fotos der 404-Seite.

Quelle sind die Bilder aus dem Gerätetest der App (StoreScreenshotsTest: erfundener Beispielhaushalt, ohne Marken, hell,
Fläche 360 x 810 dp). Jedes Foto entsteht als WebP in zwei Breiten unter public/bilder/sogehts/. Eine Schleife ist
eine Folge solcher Fotos mit weichem Übergang, als WebM ohne Ton; ihr Standbild (das letzte Foto der Folge) liegt als
"film-<Name>-<Breite>.webp" daneben. Die Schleife endet auf ihrem ersten Bild, damit die Wiederholung nicht springt.

Aufruf: python tools/sogehts_bilder.py --quelle <Ordner mit den PNG-Dateien> [--ohne-filme]
Für die Schleifen braucht es ffmpeg im Suchpfad.
"""
import argparse
import subprocess
import sys
from pathlib import Path

from PIL import Image

WURZEL = Path(__file__).resolve().parent.parent
ZIEL = WURZEL / "public" / "bilder" / "sogehts"
APP = WURZEL / "public" / "bilder" / "app"
SEITE = (4, 9)

# Name auf der Website -> Datei aus dem Gerätetest. Scanner, Liste und Kochvorschläge stehen als Standbild ihrer
# Schleife auf der Seite (letztes Bild der Folge) und brauchen kein eigenes Foto.
BILDER = {
    "start": "store_7_start.png",
    "person": "store_2_person.png",
    "warum": "store_4_warum.png",
    "listen": "web_listen.png",
    "rezept": "store_3_rezept.png",
    "einstellungen": "web_einstellungen.png",
}
# Name der Schleife -> Folge aus (Datei, Sekunden, die das Bild ruhig steht)
FILME = {
    "scannen": [("film_scannen_1.png", 1.6), ("store_1_scanner.png", 3.2)],
    "auf-die-liste": [("film_liste_1.png", 1.8), ("film_liste_2.png", 2.0), ("store_6_liste.png", 2.8)],
    "kochen": [("store_6_liste.png", 2.0), ("store_5_kochen.png", 3.4)],
}
# Fotos der 404-Seite (public/bilder/app): Name -> (Datei, Breiten)
APP_BILDER = {"startbildschirm": "store_7_start.png", "produktkarte": "store_1_scanner.png"}
BREITEN = (360, 720)
APP_BREITEN = (240, 480)
FILM_BREITE = 480
UEBERGANG = 0.4


def lade(datei: Path) -> Image.Image:
    bild = Image.open(datei).convert("RGB")
    soll = bild.width * SEITE[1] / SEITE[0]
    if abs(bild.height - soll) > 2:
        raise SystemExit(f"FEHLER {datei.name}: {bild.width} x {bild.height} ist nicht 4:9")
    return bild


def schreibe(bild: Image.Image, ziel: Path, breite: int) -> None:
    hoehe = round(breite * SEITE[1] / SEITE[0])
    bild.resize((breite, hoehe), Image.LANCZOS).save(ziel, "WEBP", quality=82, method=6)
    print(f"{ziel.relative_to(WURZEL).as_posix()}: {breite} x {hoehe}, {ziel.stat().st_size} Byte")


def film(name: str, folge, quelle: Path, arbeit: Path) -> None:
    hoehe = round(FILM_BREITE * SEITE[1] / SEITE[0])
    # Am Ende noch einmal das erste Bild: Die Schleife endet, wie sie beginnt.
    bilder = [*folge, (folge[0][0], 0.2)]
    eingaben, dauern = [], []
    for nummer, (datei, ruhe) in enumerate(bilder):
        klein = arbeit / f"{name}_{nummer}.png"
        lade(quelle / datei).resize((FILM_BREITE, hoehe), Image.LANCZOS).save(klein)
        # Jedes Bild steht seine Ruhezeit und dazu die Übergänge, an denen es beteiligt ist.
        dauer = ruhe + (UEBERGANG if nummer > 0 else 0) + (UEBERGANG if nummer < len(bilder) - 1 else 0)
        dauern.append(dauer)
        eingaben += ["-loop", "1", "-t", f"{dauer:.3f}", "-i", str(klein)]
    schritte, marke, versatz = [], "[0:v]", 0.0
    for nummer in range(1, len(bilder)):
        versatz += dauern[nummer - 1] - UEBERGANG
        aus = f"[v{nummer}]"
        schritte.append(f"{marke}[{nummer}:v]xfade=transition=fade:duration={UEBERGANG}:offset={versatz:.3f}{aus}")
        marke = aus
    schritte.append(f"{marke}fps=24,format=yuv420p[aus]")
    ziel = ZIEL / f"film-{name}.webm"
    befehl = [
        "ffmpeg", "-y", "-loglevel", "error", *eingaben, "-filter_complex", ";".join(schritte), "-map", "[aus]",
        "-an", "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
        str(ziel),
    ]
    subprocess.run(befehl, check=True)
    print(f"{ziel.relative_to(WURZEL).as_posix()}: {FILM_BREITE} x {hoehe}, {ziel.stat().st_size} Byte")
    stand = lade(quelle / folge[-1][0])
    for breite in BREITEN:
        schreibe(stand, ZIEL / f"film-{name}-{breite}.webp", breite)


def main() -> int:
    eingabe = argparse.ArgumentParser()
    eingabe.add_argument("--quelle", required=True)
    eingabe.add_argument("--ohne-filme", action="store_true")
    wahl = eingabe.parse_args()
    quelle = Path(wahl.quelle)
    ZIEL.mkdir(parents=True, exist_ok=True)
    for name, datei in BILDER.items():
        bild = lade(quelle / datei)
        for breite in BREITEN:
            schreibe(bild, ZIEL / f"{name}-{breite}.webp", breite)
    for name, datei in APP_BILDER.items():
        bild = lade(quelle / datei)
        for breite in APP_BREITEN:
            schreibe(bild, APP / f"{name}-{breite}.webp", breite)
    if not wahl.ohne_filme:
        arbeit = quelle / "_film"
        arbeit.mkdir(exist_ok=True)
        for name, folge in FILME.items():
            film(name, folge, quelle, arbeit)
    return 0


if __name__ == "__main__":
    sys.exit(main())
