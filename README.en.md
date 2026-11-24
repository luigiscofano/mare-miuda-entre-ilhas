# Tiny Tide: Between Islands

[Português](README.md) · **English**

<a href="docs/arte/galeria/identidade/logo-oficial.png"><img src="docs/arte/galeria/identidade/logo-oficial.png" alt="Official Maré Miúda: Entre Ilhas logo featuring the coral crab over a sand plaque" width="360"></a>

**A turn-based pixel-art puzzle. The tide turns every three valid moves.** Plan where your crab will be when the water rises, then take advantage of the tidal flats that reappear when it falls.

**8 worlds · 231 campaign levels · Offline edition for desktop and mobile**

[How to play](#how-to-play) · [In-game language](#in-game-language) · [Gallery](#game-gallery) · [The Eight Worlds film](docs/arte/animacoes/Mare-Miuda-Os-Oito-Mundos.mp4) · [All PDFs and videos](#pdfs-and-videos)

**Contents:** [Campaign and design](#campaign-and-design) · [Art and interface](#art-and-interface) · [Audio](#audio) · [Architecture and code](#architecture-and-code) · [Full documentation](docs/README.en.md)

The original title is *Maré Miúda: Entre Ilhas*. This page and its linked guides are in English. The game also supports English and Brazilian Portuguese. The archived screenshots, PDF guides, and videos retain their original language.

## How to play

From the repository root, with Python 3.10 or later:

```sh
python3 edicao-oficial/montar.py dist/mare-miuda-prototipo.html --verificar
```

Open `dist/mare-miuda-prototipo.html` in a browser. This edition bundles the art and audio and runs offline. At **Starting Harbor** (Porto de Partida), **Start journey** or **Continue journey** opens **Archipelago** (Arquipélago) directly. Choose a world and a level; your progress is preserved.

| Action | Control |
| --- | --- |
| Move | Arrow keys or WASD; on mobile, swipe on the board in the direction you want to move. |
| Restart | **R** or **Restart** (Reiniciar). |
| Check the objective and terrain | **Text map and help** (Mapa em texto e ajuda). |
| Adjust sound or go back | **Settings** (Configurações) and the relevant back buttons. |

A blocked move does not spend a step. Corner marks show valid destinations and appear once all crabs have landed. Before replacing an offline copy, keep the previous HTML: some browsers associate saved progress with the file path. See the [build instructions](docs/producao/README.en.md#run-the-game).

## In-game language

With the game open, select **EN** in the lower-right corner to play in English. The button changes to **PT** to switch back to Portuguese. The switch sits in its own footer, clear of the board. A support dialog has its own switch at the bottom. The change is immediate and does not restart the level or change saved progress. When you open or reload the HTML normally, the game starts in Portuguese.

[![Game screen showing the language switch in the lower-right corner](docs/arte/galeria/telas/troca-de-idioma.png)](docs/arte/galeria/telas/troca-de-idioma.png)

[More about switching languages](docs/interface/README.en.md#in-game-language).

## Game gallery

Crossing frames come from the official engine and camera. The interface views include film frames recomposed from the game’s art and actual interface states, along with two approved mobile previews. [Image sources and resolutions](docs/arte/galeria/README.en.md).

<details open>
<summary><strong>Starting Harbor, Archipelago, and support panels</strong></summary>

| Starting Harbor | Improvisation Island |
| --- | --- |
| <a href="docs/arte/galeria/telas/porto.png"><img src="docs/arte/galeria/telas/porto.png" alt="Starting Harbor with the official logo and menu buttons" width="440"></a> | <a href="docs/arte/galeria/telas/ilha-de-improviso.png"><img src="docs/arte/galeria/telas/ilha-de-improviso.png" alt="Improvisation Island dialog with level filters" width="440"></a> |

| Sound and Music | Credits |
| --- | --- |
| <a href="docs/arte/galeria/telas/som-e-musica.png"><img src="docs/arte/galeria/telas/som-e-musica.png" alt="Sound and Music dialog with separate volume controls" width="440"></a> | <a href="docs/arte/galeria/telas/creditos.png"><img src="docs/arte/galeria/telas/creditos.png" alt="Credits dialog over the harbor" width="440"></a> |

| Archipelago · Worlds 1 and 2 | Archipelago · Worlds 3 and 4 |
| --- | --- |
| <a href="docs/arte/galeria/telas/arquipelago-1.png"><img src="docs/arte/galeria/telas/arquipelago-1.png" alt="Archipelago, page 1" width="440"></a> | <a href="docs/arte/galeria/telas/arquipelago-2.png"><img src="docs/arte/galeria/telas/arquipelago-2.png" alt="Archipelago, page 2" width="440"></a> |

| Archipelago · Worlds 5 and 6 | Archipelago · Worlds 7 and 8 |
| --- | --- |
| <a href="docs/arte/galeria/telas/arquipelago-3.png"><img src="docs/arte/galeria/telas/arquipelago-3.png" alt="Archipelago, page 3" width="440"></a> | <a href="docs/arte/galeria/telas/arquipelago-4.png"><img src="docs/arte/galeria/telas/arquipelago-4.png" alt="Archipelago, page 4" width="440"></a> |

| Harbor on mobile | Archipelago on mobile |
| --- | --- |
| <a href="docs/arte/galeria/telas/porto-celular.png"><img src="docs/arte/galeria/telas/porto-celular.png" alt="Approved mobile preview of the harbor" width="240"></a> | <a href="docs/arte/galeria/telas/arquipelago-celular.png"><img src="docs/arte/galeria/telas/arquipelago-celular.png" alt="Approved mobile preview of the archipelago" width="240"></a> |

</details>

<details>
<summary><strong>Level selectors for all eight worlds</strong></summary>

| Praia das Conchas | Recifes Expostos |
| --- | --- |
| <a href="docs/arte/galeria/telas/seletor-01.png"><img src="docs/arte/galeria/telas/seletor-01.png" alt="Level selector: Praia das Conchas" width="440"></a> | <a href="docs/arte/galeria/telas/seletor-02.png"><img src="docs/arte/galeria/telas/seletor-02.png" alt="Level selector: Recifes Expostos" width="440"></a> |

| Mangue dos Siris Duplos | Enseada da Garça |
| --- | --- |
| <a href="docs/arte/galeria/telas/seletor-03.png"><img src="docs/arte/galeria/telas/seletor-03.png" alt="Level selector: Mangue dos Siris Duplos" width="440"></a> | <a href="docs/arte/galeria/telas/seletor-04.png"><img src="docs/arte/galeria/telas/seletor-04.png" alt="Level selector: Enseada da Garça" width="440"></a> |

| Ilhas à Deriva | Grutas da Espuma |
| --- | --- |
| <a href="docs/arte/galeria/telas/seletor-05.png"><img src="docs/arte/galeria/telas/seletor-05.png" alt="Level selector: Ilhas à Deriva" width="440"></a> | <a href="docs/arte/galeria/telas/seletor-06.png"><img src="docs/arte/galeria/telas/seletor-06.png" alt="Level selector: Grutas da Espuma" width="440"></a> |

| Baía das Brasas | Arquipélago do Farol |
| --- | --- |
| <a href="docs/arte/galeria/telas/seletor-07.png"><img src="docs/arte/galeria/telas/seletor-07.png" alt="Level selector: Baía das Brasas" width="440"></a> | <a href="docs/arte/galeria/telas/seletor-08.png"><img src="docs/arte/galeria/telas/seletor-08.png" alt="Level selector: Arquipélago do Farol" width="440"></a> |

</details>

<details>
<summary><strong>Eight crossings, each at both tides</strong></summary>

Low tide at the start; high tide after three valid moves. The crab’s position may differ between frames.

**1. Praia das Conchas · Passagem da primeira onda**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-01-baixa.png"><img src="docs/arte/galeria/travessias/mundo-01-baixa.png" alt="Passagem da primeira onda at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-01-alta.png"><img src="docs/arte/galeria/travessias/mundo-01-alta.png" alt="Passagem da primeira onda at high tide" width="440"></a> |

**2. Recifes Expostos · Acima da espuma**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-02-baixa.png"><img src="docs/arte/galeria/travessias/mundo-02-baixa.png" alt="Acima da espuma at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-02-alta.png"><img src="docs/arte/galeria/travessias/mundo-02-alta.png" alt="Acima da espuma at high tide" width="440"></a> |

**3. Mangue dos Siris Duplos · Raízes vizinhas**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-03-baixa.png"><img src="docs/arte/galeria/travessias/mundo-03-baixa.png" alt="Raízes vizinhas at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-03-alta.png"><img src="docs/arte/galeria/travessias/mundo-03-alta.png" alt="Raízes vizinhas at high tide" width="440"></a> |

**4. Enseada da Garça · Sombra na restinga**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-04-baixa.png"><img src="docs/arte/galeria/travessias/mundo-04-baixa.png" alt="Sombra na restinga at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-04-alta.png"><img src="docs/arte/galeria/travessias/mundo-04-alta.png" alt="Sombra na restinga at high tide" width="440"></a> |

**5. Ilhas à Deriva · Primeira faixa de areia**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-05-baixa.png"><img src="docs/arte/galeria/travessias/mundo-05-baixa.png" alt="Primeira faixa de areia at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-05-alta.png"><img src="docs/arte/galeria/travessias/mundo-05-alta.png" alt="Primeira faixa de areia at high tide" width="440"></a> |

**6. Grutas da Espuma · Corredor da vazante**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-06-baixa.png"><img src="docs/arte/galeria/travessias/mundo-06-baixa.png" alt="Corredor da vazante at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-06-alta.png"><img src="docs/arte/galeria/travessias/mundo-06-alta.png" alt="Corredor da vazante at high tide" width="440"></a> |

**7. Baía das Brasas · Abrigo dos dois cais**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-07-baixa.png"><img src="docs/arte/galeria/travessias/mundo-07-baixa.png" alt="Abrigo dos dois cais at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-07-alta.png"><img src="docs/arte/galeria/travessias/mundo-07-alta.png" alt="Abrigo dos dois cais at high tide" width="440"></a> |

**8. Arquipélago do Farol · O fragmento das duas margens**

| Low tide | High tide |
| --- | --- |
| <a href="docs/arte/galeria/travessias/mundo-08-baixa.png"><img src="docs/arte/galeria/travessias/mundo-08-baixa.png" alt="O fragmento das duas margens at low tide" width="440"></a> | <a href="docs/arte/galeria/travessias/mundo-08-alta.png"><img src="docs/arte/galeria/travessias/mundo-08-alta.png" alt="O fragmento das duas margens at high tide" width="440"></a> |

[See all 231 crossings](docs/arte/catalogo-231-travessias/README.en.md).

</details>


## Campaign and design

<details open>
<summary><strong>Game design · rules and objectives</strong></summary>

- **Tide:** turns every three valid moves. Tidal flats are passable at low tide and submerged at high tide; firm sand provides safe footing.
- **Shells and pearls:** shells mark the finish. In collection levels, the pink oyster opens only after the last pearl is collected.
- **Heron and burrows:** the targeting marker warns of a dive. Burrows connect two points on the board.
- **Two or three crabs:** all respond to the same command. Tiles that are occupied at the start of a turn block passage; the crabs cannot move through one another.
- **Recovery:** after a recoverable mistake in the campaign, the crab returns to its last safe tile. The third mistake ends the attempt. The recovery pause does not spend steps or queue moves.
- **Scenery:** foam, reflections, and ocean formations are decorative. Rafts, anchors, gates, switches, and wave attacks are not part of the current rules.

[Playable edition rules](docs/campanha/validacao-da-edicao.en.md) · [Campaign guide](docs/campanha/README.en.md).

</details>

<details>
<summary><strong>Level design · maps, worlds, and progression</strong></summary>

The challenge starts with **tide timing** and grows through positioning, return routes, and combinations of objectives. A solution's move count does not measure how difficult the level feels. Level records store the map, objective, and reference solution.

| World (English / Portuguese) | Regular | Optional bosses | Bonus | Total | Visual identity |
| --- | ---: | ---: | ---: | ---: | --- |
| 1. Shell Beach (Praia das Conchas) | 25 | 2 | 4 | 31 | Golden sand and seashells |
| 2. Exposed Reefs (Recifes Expostos) | 25 | 2 | 2 | 29 | Reefs and coral |
| 3. Twin Crab Mangrove (Mangue dos Siris Duplos) | 25 | 2 | 0 | 27 | Roots, mud, and warm tones |
| 4. Heron Cove (Enseada da Garça) | 25 | 2 | 4 | 31 | Reeds and white herons |
| 5. Drifting Isles (Ilhas à Deriva) | 25 | 2 | 2 | 29 | Wood and nautical remnants |
| 6. Foam Caves (Grutas da Espuma) | 25 | 2 | 1 | 28 | Amethyst and cool-toned rock |
| 7. Ember Bay (Baía das Brasas) | 25 | 2 | 1 | 28 | Volcanic sand, magma, and steam |
| 8. Lighthouse Archipelago (Arquipélago do Farol) | 25 | 2 | 1 | 28 | Lighthouse and rocky outcrops |
| **Total** | **200** | **16** | **15** | **231** | |

[Progression and mechanics PDF](docs/campanha/Mare-Miuda-Progressao-e-Mecanicas.pdf) · [Level-by-level index](docs/arte/catalogo-231-travessias/README.en.md).

</details>

<details>
<summary><strong>Difficulty and Improvisation Island</strong></summary>

The campaign progresses through its sequence of crossings. **Ilha de Improviso** (Improvisation Island) has five difficulty settings of its own: **Calm** (Sossegado), **Lively** (Animado), **Demanding** (Puxado), **Rough Sea** (Mar Bravo), and **Fierce Tide** (Maré Feroz). Choose a theme, one to three crabs, and whether to include a heron or require a pearl. The standalone level has its own history and does not advance the campaign. **Editar filtros** (Edit filters) returns to the same selections. [Improvisation Island guide](docs/interface/README.en.md#improvisation-island).

</details>

## Art and interface

<details open>
<summary><strong>Visual identity, logo, and PNG sprites</strong></summary>

The **Placa de Areia** (Sand Plaque) logo and the three crabs come from the official edition. The images below use **4× nearest-neighbor scaling**. Choose a crab to open its native PNG.

| Coral Crab | Green Crab | Yellow Crab |
| --- | --- | --- |
| <a href="docs/arte/galeria/identidade/siri-coral.png"><img src="docs/arte/galeria/identidade/siri-coral-4x.png" alt="Official Coral Crab sprite" width="124"></a> | <a href="docs/arte/galeria/identidade/siri-verde.png"><img src="docs/arte/galeria/identidade/siri-verde-4x.png" alt="Official Green Crab sprite" width="124"></a> | <a href="docs/arte/galeria/identidade/siri-amarelo.png"><img src="docs/arte/galeria/identidade/siri-amarelo-4x.png" alt="Official Yellow Crab sprite" width="124"></a> |

The pixel art uses **48 × 48 logical pixels per tile**, flat colors, stepped edges, and short shadows. Small plants and flowers are decorative. Rock, solid ground, and tidal flats differ in shape and texture as well as in color.

[PNG logo](docs/arte/galeria/identidade/logo-oficial.png) · [Art atlas](docs/arte/Mare-Miuda-Atlas-de-Arte.pdf) · [Art guide](docs/arte/README.en.md).

</details>

<details>
<summary><strong>Palette · art and interface colors</strong></summary>

The ocean base color in crossings is **`#142E47`**. These sand samples come from the current renderers; they are not the full palette.

| World | Dry sand | Wet sand |
| --- | --- | --- |
| Praia das Conchas | `#EAD0A3` | `#B68C6B` |
| Recifes Expostos | `#E2DCCA` | `#9F877E` |
| Mangue dos Siris Duplos | `#E1B873` | `#91765D` |
| Enseada da Garça | `#EADABA` | `#B29E8B` |
| Ilhas à Deriva | `#E8B77B` | `#B68D68` |
| Grutas da Espuma | `#DED1C8` | `#A092A6` |
| Baía das Brasas | `#777378` | `#464850` |
| Arquipélago do Farol | `#CBD0B0` | `#919E99` |

Panel colors: base `#112D38`, light text `#FDF0CB`, sand frame `#DFAC6F`, and gold highlight `#FFE2A3`. In crossings, sand, tidal flats, and ocean also differ in texture, outlines, and reflections.

</details>

<details>
<summary><strong>Screens, camera, and accessibility</strong></summary>

- **Starting Harbor:** campaign, Improvisation Island, Sound and Music, and Credits.
- **Archipelago:** choose a world from the cards. Each level selector has four pages, with two columns on desktop and one level per row on mobile. Icons and text distinguish available levels, completed levels, bonus levels, and bosses.
- **Crossing:** the camera centers the entire playable area, including submerged flats. The scenery and board scale together; the title, status panel, and buttons stay outside the zoom. The frame can crop the scenery, but not the route.
- **Support panels:** Settings, Sound and Music, Credits, and Improvisation Island open in the center and dim the background by 79%. Closing a panel returns focus to the control that opened it.
- **Accessibility:** keyboard and touch controls, a text map, screen reader alerts, and a reduced-motion preference. Decorative elements do not take focus. Automated checks do not replace testing on a physical device.

[Interface guide](docs/interface/README.en.md) · [Camera, framing, and ocean](docs/arte/camera/README.en.md) · [Archipelago PDF](docs/interface/Mare-Miuda-Arquipelago.pdf).

</details>

<details>
<summary><strong>Animation · tide, crabs, heron, results, and scenery</strong></summary>

- A campaign stride takes **205 ms**, without changing the turn logic.
- Water advances or retreats according to the tiles around a tidal flat. It covers the crab from the direction of the incoming water. Burrows have entry and exit animations, and the dive uses the official heron sprite.
- After a recoverable mistake, the affected crab blinks three times. Victory and defeat displays are centered, with shells on victory and spirals on defeat.
- Foam and steam are decorative. Reduced motion changes the presentation, not the rules.
- The silent reel includes earlier tide studies. It does not document the latest revisions to results and recovery.

[Animation guide and chapters](docs/arte/animacoes/README.en.md) · [Enlarged silent reel (MP4)](docs/arte/animacoes/Mare-Miuda-Animacoes-Sem-Som-Ampliadas.mp4).

</details>

## Audio

<details open>
<summary><strong>Soundtrack · how A Outra Margem was built</strong></summary>

[Listen to the official nylon-string guitar track (MP3)](docs/arte/trilha-sonora/a-outra-margem-violao.mp3).

![Note map for A Outra Margem: melody, accompaniment, and bass over 16 bars](docs/arte/trilha-sonora/construcao-a-outra-margem.svg)

The chart uses the **76 note events in the official composition**, split into bass, inner notes, and melody: 16 bars in 4/4 at 90 BPM. The game plays a 42.6667-second stereo loop without the listening MP3's fade. The track continues across screens and has a volume control separate from the effects.

[Composition and loop details](docs/arte/trilha-sonora/README.en.md#how-the-track-was-built) · [Note data (CSV)](docs/arte/trilha-sonora/eventos-a-outra-margem.csv).

</details>

<details>
<summary><strong>Sound effects · 11 game and interface sounds</strong></summary>

The effects signal events such as tide changes, burrows, collection, mistakes, recovery, victory, and defeat. The button click is distinct from the ten crossing sounds and does not play when the pointer only hovers. The action remains understandable without sound.

[Listen to the 11 effects (MP3)](docs/arte/efeitos-sonoros/Mare-Miuda-Efeitos-Mais-Sutis.mp3) · [Sound effects and their triggers](docs/arte/efeitos-sonoros/README.en.md).

</details>

## Architecture and code

<details open>
<summary><strong>Languages, structure, and the playable edition</strong></summary>

The game uses **JavaScript ES modules**, **HTML and CSS** for screens and panels, and **Canvas 2D** to draw the board. **Python** builds the offline file, and tests run in **Node.js**. The game and its documentation are available in Brazilian Portuguese and English.

| Path | Responsibility |
| --- | --- |
| [index.html](edicao-oficial/index.html) | Screen, dialog, and control structure. |
| [src/app.mjs](edicao-oficial/src/app.mjs) | Entry point: commands, screen state, audio, saves, and rendering. |
| [src/campanha/fichas/](edicao-oficial/src/campanha/fichas/) | Maps, objectives, solutions, and crossing order. |
| [src/render/](edicao-oficial/src/render/) and [src/interface/](edicao-oficial/src/interface/) | Rendering, effects, panels, and lettering. |
| [estilos/](edicao-oficial/estilos/) and [assets.zip](edicao-oficial/assets.zip) | Presentation, sprites, fonts, music, and effects. |
| [montar.py](edicao-oficial/montar.py) and [verificacao.json](edicao-oficial/verificacao.json) | Offline build and integrity checks. |
| [testes/](edicao-oficial/testes/) | Campaign, animation, audio, and panel tests. |

**Flow:** command → validation → game state and tide → crossing frame and effects. The browser stores progress and preferences locally. Legacy IDs preserve saves without bringing back retired rules. The builder packages media and modules into one HTML file without accessing the network. [Build guide](docs/producao/README.en.md).

</details>

<details>
<summary><strong>Official edition tests</strong></summary>

After building the HTML:

```sh
for teste in campanha passada resultados-e-retorno trilha efeitos paineis idiomas; do
  node "edicao-oficial/testes/${teste}.mjs" dist/mare-miuda-prototipo.html || exit 1
done
```

The campaign test replays **231 solutions and 4,007 valid moves** without any crab being swept away. The other suites verify stride animation, results, audio, and dialogs in the generated HTML. [Manual checks](docs/producao/README.en.md).

</details>

## PDFs and videos

<details open>
<summary><strong>Four PDFs · Portuguese reference library</strong></summary>

| PDF | Contents |
| --- | --- |
| [Art atlas](docs/arte/Mare-Miuda-Atlas-de-Arte.pdf) | Sand, tiles, structures, plants, and animals. |
| [Catalog of all 231 crossings](docs/arte/catalogo-231-travessias/Mare-Miuda-231-Travessias.pdf) | 462 frames showing low and high tides, indexed by world. |
| [Archipelago](docs/interface/Mare-Miuda-Arquipelago.pdf) | World cards on desktop and mobile. |
| [Progression and mechanics](docs/campanha/Mare-Miuda-Progressao-e-Mecanicas.pdf) | Rules, examples, and how the challenges develop. |

[Documentation index](docs/README.en.md).

</details>

<details open>
<summary><strong>Two videos · campaign and animation</strong></summary>

| Video | Format and contents |
| --- | --- |
| [The Eight Worlds (MP4)](docs/arte/animacoes/Mare-Miuda-Os-Oito-Mundos.mp4) | 4 min 22.5 s · 1600 × 900 · 60 fps. 24 campaign victories, one win on Improvisation Island, Sound and Music, and Credits. The edit uses the game's track and sound effects. |
| [Enlarged silent animation reel (MP4)](docs/arte/animacoes/Mare-Miuda-Animacoes-Sem-Som-Ampliadas.mp4) | 2 min 15 s · 1440 × 810 · 60 fps. Movement, results, and tide-pattern studies. |

[Film chapters](docs/arte/animacoes/README.en.md#the-eight-worlds) · [Silent reel details](docs/arte/animacoes/README.en.md#silent-animation-reel).

</details>

© 2026 Luigi Scofano de Araújo. All rights reserved.
