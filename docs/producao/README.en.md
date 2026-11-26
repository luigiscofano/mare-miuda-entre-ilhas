# Playable edition of Maré Miúda: Entre Ilhas

[Português](README.md) · **English**

English title: **Tiny Tide: Between Islands**.

## Demonstration film

The documentation includes [The eight worlds](../arte/animacoes/README.en.md#the-eight-worlds), with playthroughs reproduced from the official edition's modules and interface screens reconstructed for editing. The MP4 is not included in the offline build and does not replace campaign tests.

## Run the game

```sh
python3 edicao-oficial/montar.py dist/mare-miuda-prototipo.html --verificar
node edicao-oficial/testes/campanha.mjs dist/mare-miuda-prototipo.html
```

Open the generated HTML in a browser. Modules, styles, and resources remain separate; the bundled HTML is not versioned. The resource file can be inspected with a ZIP reader. The assembler does not access the network.

The [campaign](../campanha/README.en.md) preserves the identifiers used in saves. When replacing the offline HTML, keep the original: some browsers associate progress with the file's full path. Do not clear browser storage.

The offline build reads the original `edicao-oficial/assets.zip` and the separate `edicao-oficial/assets-tipografia.zip` with localized background layers for normal type. Both packages are required; duplicate resource paths are rejected. The detailed pixel-art titles remain in the game.

The standalone HTML embeds each module once through an import map. The Web build serves modules, WAV files and title images separately. Both use the same rules and content. Test the Web build with a local server, not with a file URL.

```sh
python3 edicao-oficial/montar.py dist/web/index.html --web
python3 -m http.server 8000 --directory dist/web
```

## Movement controls

```sh
node edicao-oficial/testes/gestos.mjs dist/mare-miuda-prototipo.html
```

On a physical phone, swipe in each direction on the board and confirm that every completed gesture sends one move. Also test reversing, taps, a second finger, and gestures during a recovery or while Settings is open. Confirm that the page can still scroll outside the board.

## Language switch checks

```sh
node edicao-oficial/testes/idiomas.mjs dist/mare-miuda-prototipo.html
```

The automated test checks the three localized fields for each of the 231 levels and verifies that visible text and accessible attributes return to their original language.

Open the offline HTML without a language parameter and check that it starts in Portuguese. At Starting Harbor, select **EN** in the lower-right corner. Check the menus, selectors, level titles, objectives and status panel. During a crossing, open **Settings**, use **Tab** to reach the language button and switch back with **PT**. Check that your position, move count, saved progress and music have not reset. Confirm there is no language button in Sound and Music, Credits or Improvisation Island, and no language footer in the Archipelago, level selectors or crossings. Select **EN** again and reload the file normally: the interface should return to Portuguese with progress intact. See the [language control guide](../interface/README.en.md#in-game-language).

## Revision parity

- 231 level records and 4,007 solution steps without being swept away.
- 462 stable camera frames, across both tides, compared pixel by pixel with the approved edition.
- 2,320 progression states and save samples, plus 480 Improviso generations compared.
- Removing old rules changed no map, active sprite, audio, camera, active rule, or interface output. Legacy identifiers remain for compatibility and do not enable mechanics.

The comparison uses the engine and canvas in a controlled environment. It does not replace testing on a physical phone.

## Step animation checks

After generating the HTML, run `node edicao-oficial/testes/passada.mjs dist/mare-miuda-prototipo.html`. The test uses the same bundled module and covers all four directions, the pose change, and completion at 205 ms in the campaign, as well as the previous 165 ms step outside it.

## Results and recovery checks

After generating the HTML, run:

```sh
node edicao-oficial/testes/resultados-e-retorno.mjs dist/mare-miuda-prototipo.html
```

The test reads the bundled modules and checks the result plaque's size and center in nine screen configurations, the static reduced-motion frame, the three pulses and duration of the campaign input lock, and the previous animation curve preserved in Improviso. It also checks symmetrical rising and falling speeds, water covering the Siri, and the pause after recovery. The campaign test continues to cover all 231 solutions.

## Level selection checks

On desktop and mobile, go through all four pages of each of the eight worlds. The first and last pages disable the arrow with no destination; locked cards do not start a level. On desktop, check the four corners along the edges and the route between the two columns of cards. On mobile, check the vertical list and the two buttons at the top.

In Mangue, open **Configurações** (Settings) on page 4. Test **Esc**, the close button, and a click on the backdrop: focus must return to **Configurações**, and the page must not change. Press **Voltar ao início** (Back to start), continue the game, and check that the same page returns without losing progress. With reduced motion, the background must stop moving without hiding the glows or foam. These effects do not appear in Arquipélago or on the board.

## Music checks

After generating the offline HTML, run:

```sh
node edicao-oficial/testes/trilha.mjs dist/mare-miuda-prototipo.html
```

The offline edition uses a single loop of [**A Outra Margem**](../arte/trilha-sonora/README.en.md), for nylon-string guitar. During manual review, start audio with a gesture, move through the map, selectors, and levels, and confirm that the track does not restart. Use **Configurações** to adjust music and effects separately; setting music to zero and turning it back on must not restart the track. Switch tabs and return to check that playback resumes from its previous position. Check the rising-tide, falling-tide, collection, error, and victory effects independently of the music.

## Sound effects checks

After generating the offline HTML, run:

```sh
node edicao-oficial/testes/efeitos.mjs dist/mare-miuda-prototipo.html
node edicao-oficial/testes/trilha.mjs dist/mare-miuda-prototipo.html
```

The [effects catalog](../arte/efeitos-sonoros/README.en.md) describes how sounds map to events. During manual review, test a rising tide, a falling tide, collection, a fissure, and level results. Trigger one sweep-away event that allows recovery and another that ends the attempt: the return sound is reserved for reappearance, and defeat plays when the result begins. Test an enabled button with mouse, touch, and keyboard, and confirm one click per activation. Moving focus, hovering, or trying a locked button must not play a click. Adjust **Efeitos** (Effects) without interrupting or changing the volume of **A Outra Margem**.

## Support panels checks

After generating the offline HTML, run:

```sh
node edicao-oficial/testes/paineis.mjs dist/mare-miuda-prototipo.html
```

In Porto, open **Som e música** (Sound and music), **Créditos** (Credits), and **Ilha de Improviso**; in level selection and during a level, open **Configurações**. Check the panels in a wide window and in a narrow, short window: the center is preserved, the same 79% dimming appears behind all four panels, glows appear at all four corners, and scrolling stays inside the panel without expanding it to fill the screen. Use keyboard and touch: **Tab** does not let focus leave; **Esc**, the button, or the dimmed area closes the panel and returns focus to its trigger. During a level, try to move the Siri with the panel open; after closing it, check that the step was not executed. Repeat on the selector's fourth page and confirm that it remains open. Adjust both volumes, check the percentages, and verify that music continues and progress is preserved. See [support panels](../interface/README.en.md#support-panels).

In Porto, choose non-default filters in [Ilha de Improviso](../interface/README.en.md#improvisation-island), view the history, and generate a crossing. In the standalone level, use **Editar filtros** (Edit filters): Porto must return with the window open and the same choices. Close the window and check that focus returns to **Ilha de Improviso**. Reopen it and check that the filters are still selected. Generation and return through the panel must not advance the campaign or erase history.

## Shell Beach: end-to-end check

On desktop and at 320 px, check the three-step tide cue, the completed tide animation, a win and a retry after defeat. Open Settings in the middle of a level, switch languages, and confirm that the current step count and saved progression are unchanged. Return to the selector and check that the same page and level regain focus.
