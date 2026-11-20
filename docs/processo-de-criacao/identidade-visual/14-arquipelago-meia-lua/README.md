# Meia-Lua · estudo de arquipélago

Prévia de seleção de mundos. Não é captura do jogo, mapa aplicado ou indicação de que oito mundos já estão jogáveis. O estudo mostra oito silhuetas originais: praia, mangue, recife com redemoinho, cascatas, neve, gruta, vulcão e cristais. Esses motivos não renomeiam os mundos nem fecham suas mecânicas. A bifurcação inicial parte da Praia para Recifes e Mangue; ambas as rotas se reencontram antes da Enseada, como no plano. O restante é uma proposta visual.

As ilhas formam uma meia-lua aberta, com a laguna como respiro para as rotas. A costa de areia, a terracota e o mar petróleo mantêm proximidade com o Cabo Baixo, sem reutilizar o desenho daquele cenário. A luz vem do alto à esquerda. Composição inédita produzida como conceito e convertida em grade nativa com paleta chapada; a navegação foi desenhada separadamente. Sem alteração à logo, ao siri da Travessia ou aos estudos anteriores.

## Fonte e exportação

- `fontes/arquipelago-base.png`: cenário raster editável em 288 × 216, sem interface.
- `fontes/rotas-e-cais.png`: rotas e oito entradas; alfa binário.
- `arquipelago-meia-lua-288.png`: composição nativa.
- `arquipelago-meia-lua-288-3x.png`: mesma matriz ampliada 3× por vizinho mais próximo.
- `exportar.py`: reproduz a camada de rotas e a exportação. Rode `python exportar.py` com Pillow.

Verificado em 1× e 3×. A exportação valida dimensões, opacidade do resultado e igualdade pixel a pixel na volta de 3× para 1×. O estudo não foi integrado ao jogo.
