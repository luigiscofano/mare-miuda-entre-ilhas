# Recreating Siri na Areia — Notas Claras

[Português](README.md) · **English**

> **Historical record.** This document describes the *Siri na Areia — Notas Claras* soundtrack used before the offline edition with *A Outra Margem*. The instructions below belong to the previous revision and do not build the current soundtrack. See [the offline edition's soundtrack](../../docs/arte/trilha-sonora/README.en.md).

Original composition, synthetic timbres, and eight original arrangements, with no external samples. The Praia master uses the score from the approved preview. All arrangements share the same melody, tempo (97 BPM), and duration; harmonic backing and brightness vary between islands.

The game build uses the MP3 files already under version control. To regenerate the **soundtrack**, use Python 3 with NumPy and SciPy, and FFmpeg with libmp3lame:

```sh
python3 scripts/trilha/partitura.py
python3 scripts/trilha/sintetizar.py
python3 scripts/trilha/arranjar.py
```

`siri-na-areia.json` stores the score; the first two commands render the Praia source again. The third generates the eight MP3s in `assets/audio/trilha/` and checks decoding of 1,425,155 stereo PCM samples at 48 kHz per track. Encoder versions may change the MP3 bytes; compare duration and listen to the loop seam when regenerating. WAVs and intermediate outputs are not needed to play.

World names below retain their Portuguese UI names.

| World | Timbre and backing |
| --- | --- |
| Praia das Conchas | Original Notas Claras marimba |
| Recifes Expostos | Glass mallet, open chords |
| Mangue dos Siris Duplos | Dry wood, more prominent bass |
| Enseada da Garça | Airy plucked tone, sparse backing |
| Ilhas à Deriva | Rounded steel mallet, offbeat backing |
| Grutas da Espuma | Muted bell, inverted backing |
| Baía da Ressaca | Firmer string tone, anticipated accents |
| Arquipélago do Farol | Celesta, open chords |

The `manifesto-web.sha256` file records the eight approved MP3s. To validate the copy, run `sha256sum -c scripts/trilha/manifesto-web.sha256` from the game root.
