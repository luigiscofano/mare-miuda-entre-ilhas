# First Playthrough · 2026-11-26

[Play this archived version](https://luigiscofano.github.io/mare-miuda-entre-ilhas/versoes/primeira-partida-2026-11-26/?lang=en) · [Download this build](https://luigiscofano.github.io/mare-miuda-entre-ilhas/downloads/Mare-Miuda-Primeira-Partida-Arquivo.zip)

[Português](README.md) · **English** · [All milestone editions](../README.en.md)

Rebuild this playable copy from the repository. You need a complete clone, Git, `tar` (available in Git Bash on Windows), and Python 3.10 or later. Run from the repository root:

```sh
python3 docs/versoes-marcantes/primeira-partida-2026-11-26/reconstruir.py dist/primeira-partida-2026-11-26
```

Open the generated `Jogar-agora.html` in Chrome or Edge. Once built, it needs no internet connection. Open `Outras-travessias.html` to try the Heron and Lighthouse samples. The command also produces the web build and includes the three-player test script.

## What made this edition a milestone

- The keyboard or touch hint disappears after the first move. A cyan line marks the tidal flat that will flood at the first tide change.
- The game distinguishes an accepted move, a blocked path, and crab recovery. Each step still takes 205 ms.
- The offline HTML went from 61.7 MB to 19.3 MB; all 231 solutions were verified.
- This preview stores progress separately from the official edition. The samples do not save progress.

## Integrity

The script exports revision `205df4e4259b9c866fe8305b87dad1dfa94c00e5`, applies the frozen patch in a temporary directory and verifies the original bytes of `Jogar-agora.html` (19,320,663 bytes) and `web/index.html` (507,911 bytes). The current build is not part of the reconstruction.

[`SHA256SUMS`](SHA256SUMS) lists the two rebuilt entry points and the fingerprint of the original offline ZIP, which is not stored in the repository.
