# 10 · Enseada em desenho nativo

Novo estudo de **Caminho das Conchas**, desenhado desde o primeiro traço em uma única grade de **224 × 168**. Não deriva das bases raster anteriores: preservamos as demais rodadas em pastas separadas. O conceito traz uma enseada em meia-lua com margem irregular, um planalto de arenito, poças do baixio e trilhas que bifurcam entre grutas e a parte baixa. Cores chapadas fazem o relevo e as sombras; escadas ligam níveis do terreno. É uma proposta para seleção de fases, não uma captura ou um mapa já jogável.

[PNG nativo](caminho-das-conchas-224-nativo.png) · [Prévia 4×](caminho-das-conchas-224-nativo-4x.png) · [Base sem o siri](fontes/caminho-sem-siri.png)

`desenhar.py` conserva a composição editável como polígonos, traços e grupos de pixels, sem usar desenhos externos. Rode `python desenhar.py` com Pillow 13 para recompor as saídas. O cenário é opaco em todas as células; o mesmo [siri aprovado de 35 × 27](fontes/siri-aprovado-1x.png) é composto sem reamostragem e cada pixel opaco é conferido. A ampliação 4× volta exatamente à grade nativa. Nenhum bem-te-vi foi usado. A logo, o Arquipélago, a Travessia, a execução do jogo e o Miudezas não foram alterados.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
