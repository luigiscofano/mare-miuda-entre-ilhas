# Archipelago

[Português](README.md) · **English**

[Game screen gallery](../arte/galeria/README.en.md) · [Arquipélago visual guide (PDF)](Mare-Miuda-Arquipelago.pdf). The pages reconstruct real states and approved layers of the eight worlds for desktop and mobile.

[The eight worlds montage](../arte/animacoes/README.en.md#the-eight-worlds) shows Starting Harbor, Archipelago, the eight level selectors and, at the end, Improvisation Island, Sound and Music, and Credits.

© Luigi Scofano de Araújo. All rights reserved.

## In-game language

Outside support dialogs, the **EN** button is in the lower-right corner of a footer outside the play area. In **Settings**, **Sound and Music**, **Credits**, and **Improvisation Island**, the switch is at the bottom of the dialog and stays in its keyboard navigation order. Once you switch to English, its label becomes **PT**. Titles, objectives, alerts, and actions are translated without recreating the crossing or rewriting the save. Portuguese is the default when you open or reload the HTML normally.

[See the language switch in the gallery](../arte/galeria/README.en.md#screens).

## Movement

Use the **arrow keys** or **WASD**, or swipe on the board on mobile. One swipe in a clear direction sends one move. Short touches, unresolved diagonals and cancelled gestures do not move the crab. You can still scroll outside the board.

Corner marks show legal moves only after all crabs have landed, including when leaving a fissure. Movement rules and animation timing are unchanged.

## Results and recovery

The victory or defeat sign sits at the center of the board and adapts to the available space. On defeat, **Tentar novamente** (Try again) and **Voltar à seleção de fases** (Back to level selection) appear when the sign's entrance finishes. Trying again returns to the start of the same level; going back opens its page and focuses its card. Victory buttons are unchanged; **Configurações** (Settings) opens the [support panel](#support-panels).

In the campaign, the header displays only the level name. The objective, guidance, and symbol map are under **Mapa em texto e ajuda** (Text map and help); focus remains on the title when entering the level. The illustrated sign does not duplicate the name for screen readers and uses plain text when the device forces a high-contrast palette.

After a recoverable tide or heron mistake, only the affected crab flashes three times. Directional input is locked from the mistake until the recovery pause ends. A keypress or swipe during the pause is discarded, not executed later. Settings, restart, and back remain available.

The reduced-motion preference displays the sign and its buttons without waiting for the animation and keeps a short pause after a mistake, without flashes. The third mistake ends the attempt, without a respawn animation. [Ilha de Improviso](#improvisation-island) crossings use the same directional shortcuts and gestures and retain their own result behavior.

## Level selection

**Start journey** and **Continue journey** open Archipelago without changing the world stored in your save. In Archipelago, you select the **world**. Inside it, **level** selection still has four pages per world. The 231 cards preserve their order, access conditions, lock labels, and level types. Bonus levels and optional bosses remain identified.

On desktop, selection fills the window; the four sand corners are crops from each page's artwork and meet the edges. The title, rocks, route, and cards retain their composition. Mobile keeps the vertical list.

- **Configurações** opens the [support panel](#support-panels) inside level selection. Close it to continue on the same page, with focus on the original button.
- **Voltar ao início** (Back to start) exits to Porto. When continuing in the same session, reopen the world to return to its previous level-selection page. This does not rewrite campaign progress.
- Glints in three sizes and free-floating foam are decorative, without click targets or screen-reader announcements. With reduced motion, the background shows a single foam frame.

## Support panels

| Panel | Where to open it | Controls |
| --- | --- | --- |
| **Settings** (Configurações) | In level selection or inside a level. | Separate **Música** (Music) and **Efeitos** (Effects) adjustments, with percentages that follow the controls. |
| **Sound and Music** (Som e música) | In Porto. | Both volume controls and the track identification, **A Outra Margem**, for **nylon-string guitar**, without an instrument illustration. |
| **Credits** (Créditos) | In Starting Harbor, using the **Credits** button. | Game credits, without revealing the campaign ending. The completion presentation is separate and retains **Back to the map** (Voltar ao mapa). |
| **Improvisation Island** (Ilha de Improviso) | In Porto. | Standalone crossing filters, history, and **Gerar travessia** (Generate crossing). |

Each panel appears centered, without filling the entire screen, and darkens the screen behind it by 79%. The frame's four corners have decorative white glints that neither receive focus nor intercept touches. In a short window, scrolling stays inside the panel. The background remains visible but does not receive commands while the panel is open.

**Tab** and **Shift+Tab** move through the panel's controls. **Esc**, **X**, the **Fechar** (Close) button (or **Voltar**, Back, in Créditos and Ilha de Improviso), and clicking or touching the darkened area close the support panel and return focus to the button that opened it. In selection, the page does not change; inside a level, no movement happens behind the panel.

Adjusting volume preserves existing saved preferences without changing level progress. Opening or closing the panel does not change rules, level states, selection, or game progress. There is no visible debug shortcut in the menu.

## Improvisation Island

In Porto, open **Ilha de Improviso** to choose the theme, difficulty, and number of crabs (one to three), enable or disable the heron and pearl, and access history. Buttons use the regular font. On narrow screens, text below headings is slightly smaller; if height is insufficient, only the panel's content scrolls.

**Gerar travessia** opens a standalone level without changing campaign progress. Inside the level, **Editar filtros** (Edit filters) returns to Porto and reopens the panel with the values that generated the crossing. If the panel is closed without generating a level, focus returns to the **Ilha de Improviso** button. Reopening it in the same session also preserves the choices. The panel changes only presentation: generation, rules, and history remain unchanged.
