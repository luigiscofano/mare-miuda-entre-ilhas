# 05 · Grade fina e leitura da concha

Três estudos conceituais de **Maré Miúda: Entre Ilhas**. Não são capturas de uma versão jogável e não foram aplicados. A [rodada anterior](../04-polimento-litoral/) fica preservada.

| Estudo | O que mudou |
| --- | --- |
| [Arquipélago](renders/01-arquipelago-1x.png) | Centros, ordem e ligações preservados; relevo com faces claras e escuras, neve, estratos, lava, afloramentos facetados, reflexos d’água e detalhes em células mais finas. |
| [Caminho das Conchas](renders/02-caminho-das-conchas-1x.png) | Vegetação e pedras têm novas formas, a trilha permanece legível, água e bordas têm detalhes desenhados na nova grade e o bem-te-vi foi retirado. O PNG original do siri foi composto no tamanho nativo, sem recolorir, esticar ou reamostrar. |
| [Travessia](renders/03-travessia-2x.png) | A grade 24 × 24 e o terreno permanecem iguais. O siri aparece uma célula à esquerda para demonstrar dois bloqueios diretamente adjacentes (norte e sul), marcados só por cantos discretos; os bloqueios distantes não recebem marca. A concha ganhou cantos de objetivo e brilho de cor chapada. |

---

<details>
<summary>Fonte editável e testes</summary>

Execute `python desenhar.py` com Pillow 13. `base.py` mantém as cenas anteriores como subdesenho e a variação de apresentação da Travessia. As grades lógicas são 772 × 544 no arquipélago e no seletor e 386 × 272 na Travessia. As duas primeiras cenas foram redesenhadas em cima do traçado anterior com detalhes de 1 px lógico: a grade mais fina não é somente a ampliação do traçado anterior. Os PNGs de inspeção 2× usam exclusivamente vizinho mais próximo e são conferidos byte a byte após redução. O arquivo nativo do siri tem 35 × 27 px, alfa binário e bytes idênticos aos da rodada aprovada.

</details>

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
