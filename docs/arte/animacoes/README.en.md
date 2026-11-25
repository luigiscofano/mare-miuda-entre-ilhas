# Between Islands animations

In the current Shell Beach build, the walk, tide and outcome use the browser frame clock. The original reel documents earlier behavior.

[Português](README.md) · **English**

## The eight worlds

[**Watch or download the MP4 film**](Mare-Miuda-Os-Oito-Mundos.mp4) · **4min22.5s · 1600 × 900 · 60 fps · with audio**

Three victories in each of the eight worlds, across 24 campaign runs. The film also shows Porto de Partida, Arquipélago, the level selectors, a crossing in Ilha de Improviso and its history, Som e música, Créditos, and the return to Porto. The video shows a selection of levels, not all 231 crossings in the game.

The boards and victories come from runs reproduced using the official edition's modules. Navigation screens and panels were reconstructed for the edit using the interface artwork and states. The edit combines [**A Outra Margem**](../trilha-sonora/README.en.md), for nylon-string guitar, with [the game's sound effects](../efeitos-sonoros/README.en.md). It is not a continuous interface recording or an update to the playable version.

### Film chapters

| Start | Section |
| --- | --- |
| 00:00.000 | Porto de Partida |
| 00:03.000 | Arquipélago |
| 00:10.050 | Praia das Conchas |
| 00:29.600 | Recifes Expostos |
| 00:59.783 | Mangue dos Siris Duplos |
| 01:18.083 | Enseada da Garça |
| 01:41.367 | Ilhas à Deriva |
| 02:13.000 | Grutas da Espuma |
| 02:46.167 | Baía das Brasas |
| 03:18.167 | Arquipélago do Farol |
| 03:58.300 | Ilha de Improviso |
| 04:12.500 | Som e música |
| 04:16.050 | Créditos |
| 04:20.050 | Return to Porto de Partida |

If GitHub does not play the file, download the MP4 and open it in a local player. To verify the copy, the file is **16,383,000 bytes** and its SHA-256 is `12e36e09a50f4c8b42eb15a161dfe12cfb2d959dae6af386b7cfb4689887f88f`.

## Silent animation reel

[Watch or download the enlarged version](Mare-Miuda-Animacoes-Sem-Som-Ampliadas.mp4), **2min15s · 1440 × 810 · 60 fps · no audio**. Smaller scenes were enlarged without cropping. This GitHub copy is more compressed than the file delivered in chat, but retains the framing, duration, and 8,109 frames.

The video predates the campaign's larger result signs and stronger flashes. It alternates engine frames, control demonstrations, and identified earlier studies. The 81 patterns are tide-study configurations, not 81 levels. The rifts shown are the four combinations reproduced in actual levels.

## Chapters

- **0:02** · Mouse button interaction
- **0:05** · Mobile button interaction
- **0:08** · Free-floating foam
- **0:14** · Foam around bases
- **0:19** · Steam
- **0:23** · Solo movement
- **0:28** · Pair movement
- **0:35** · Trio movement
- **0:40** · Round rift · no tide change
- **0:43** · Narrow rift · no tide change
- **0:46** · Round rift · falling tide
- **0:49** · Narrow rift · rising tide
- **0:52** · Uniform tide: rises, falls, and sweeps the crab away
- **1:03** · Original heron in motion
- **1:09** · Victory, tide defeat, and heron defeat
- **1:17** · Reduced motion
- **1:22** · 81 tide neighborhoods
- **1:25** · Complete study: 81 configurations

© 2026 Luigi Scofano de Araújo. All rights reserved.

## Steps and level endings

Crab steps last **205 ms** in the campaign and remain 165 ms outside it. The drawn position advances in whole pixels; turn logic does not wait for the animation. The reduced-motion preference remains available.

On defeat, after the final frame, the panel shows **Tentar novamente** (Try again) and **Voltar à seleção de fases** (Back to level selection). With reduced motion, these actions appear without waiting for the animation. The victory flow is unchanged.

## Larger signs and crab flashes

In the current campaign revision, signs grow with the framing, stay centered, and preserve the victory shells. Side spirals appear on defeat. The result artwork does not replace interface actions or change the board.

After the tide or heron animation, the crab affected by a recoverable mistake makes three light pulses over a 496 ms window, without changing the light outside its sprite. The tide front advances or recedes symmetrically, three pixels per 30 ms. Logical tide changes still occur every three valid steps. After a mistake, the input lock follows the water's visual timing, preserving the pause after recovery and the rhythm of the three flashes. With reduced motion, the pause from the mistake lasts 528 ms, without flashes. See [results and recovery](../../interface/README.en.md#results-and-recovery). The silent recording does not claim to show this revision.
