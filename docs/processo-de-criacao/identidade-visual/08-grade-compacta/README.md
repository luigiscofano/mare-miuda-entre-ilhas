# 08 · Redesenho com grade compacta

A [rodada de 544 × 408](../07-grade-intermediaria/) e as demais prévias foram preservadas. Esta nova versão usa **288 × 216 células**, com o mesmo enquadramento 4:3 e cerca de **72% menos células** que a anterior. Não é uma captura de jogo nem foi aplicada.

- [Arquipélago](01-arquipelago-grade-288.png): mantém as oito silhuetas, faces claras e escuras, canais e meios-tons chapados.
- [Caminho das Conchas](02-caminho-das-conchas-grade-288.png): conserva a luz, os estratos e o ramal da trilha. Sem bem-te-vi. O mesmo siri isolado de 35 × 27 é composto em escala nativa, sem reamostragem ou mudança de cor.

As bases são discretizadas a partir das composições-fonte com uma paleta de 50 cores sólidas e sem dither. Para estabilizar grupos sem suavizar bordas, a amostragem pixel a pixel seleciona o tom mediano local, e a limpeza troca apenas pontos isolados de contraste baixo. Os arquivos nativos e os PNGs de comparação 3× mantêm a mesma informação em grade.

`fontes/` guarda a base e a camada do siri separadamente. `python exportar.py` com Pillow 13 recompõe e valida dimensões, alfa, pixels idênticos do siri e round-trip exato da ampliação 3× por vizinho mais próximo.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
