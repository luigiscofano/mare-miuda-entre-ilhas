# 13 · Cabo Baixo

Nova composição em **192 × 144** para o Caminho das Conchas. Estudo conceitual, não captura nem arte aplicada ao jogo. A direção da Trilha de Ardósia agradou, mas a rodada de 208 × 156 motivou o pedido por um cenário menos detalhado e mais próximo da Travessia e da Placa de Areia. O histórico anterior permanece separado.

[PNG nativo](02-caminho-das-conchas-cabo-192.png) · [PNG de inspeção 4×](02-caminho-das-conchas-cabo-192-4x.png)

O cabo abre para uma enseada com espaço livre de mar. A trilha bifurca para o arco e a gruta; uma escada chega à praia e uma ponte alcança o baixio. Terracota, creme e verde-mate predominam. Faces sombreadas e sombras no chão usam blocos de cor, sem gradientes. O cenário foi concebido do zero com assistência de geração de imagem, discretizado na resolução lógica e indexado sem dither. O fundo tem 37 cores sólidas.

`fontes/` conserva o cenário raster e a camada original do siri em arquivos separados. `python exportar.py` (Pillow 13) recompõe as prévias e valida tamanho e opacidade, cada pixel opaco do siri de 35 × 27 e a volta exata da ampliação 4×. O siri não foi redimensionado nem recolorido. Sem bem-te-vi. Arquipélago, Travessia, logo, runtime e Miudezas ficaram intactos.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
