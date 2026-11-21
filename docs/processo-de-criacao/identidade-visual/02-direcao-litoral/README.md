# 02 · Direção de arte: litoral em pixel art

Três **mockups conceituais**, não capturas de uma build e ainda não aplicados ao jogo. Guardados como parte permanente do Processo de criação. **Não houve alterações na logo A.**

1. [A travessia — estudo de tabuleiro](renders/01-travessia-3x.png): o baixio se distingue pela forma, pela cor e pela legenda. Uma previsão discreta marca só a próxima casa; a concha clara com brilho é o objetivo. A grade não compete com a ilustração.
2. [Arquipélago — estudo regional](renders/02-arquipelago-3x.png): os pontos mostram a progressão, incluindo a bifurcação inicial. Praia com palmeiras, mangue com água, recifes rochosos, gruta e farol ajudam a distinguir as ilhas; posições e trajetos são propostas de composição.
3. [Praia das Conchas — seleção caminhável](renders/03-mapa-da-praia-3x.png): a trilha tem ramal opcional e entradas de pedra no chão; costa, sombra das copas, piscina natural, clareira e vegetação variada ajudam a revelar profundidade em top-down 3/4. O bem-te-vi é pontual, sem competir com o siri.

---

<details>
<summary>Resolução, exportação e fonte editável</summary>

- Cada cena: **386 × 272** células lógicas quadradas. Os PNGs 1× são as fontes raster; os 3× (1158 × 816) são ampliados pelo vizinho mais próximo.
- A fonte procedural reproduzível está em `desenhar.py` (Python e Pillow 13). Glifos em matrizes binárias; luz, sombra, terreno e ondas em polígonos, traços e máscaras inteiras; sem fontes externas nem suavização.
- Execute `python desenhar.py`. O programa verifica alfa totalmente opaco e ida e volta da escala inteira, byte a byte, antes de exportar em `renders/`.
- A referência de densidade e legibilidade serviu apenas como direção geral. Personagens, cenários, paletas e mapas são originais.

</details>

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
