# Cabo Baixo · Estudo de seleção com níveis

Mantém intacto o [cenário Cabo Baixo de 192 × 144](../02-caminho-das-conchas-cabo-192.png) e acrescenta uma camada separada para o seletor. **Prévia conceitual, não captura do jogo.** Os marcadores não representam um novo mapa interativo já implementado.

[PNG nativo](cabo-baixo-selecao-192.png) · [PNG 4×](cabo-baixo-selecao-192-4x.png) · [Camada isolada](fontes/camada-do-seletor.png)

Os quatro níveis principais seguem a ordem atual do catálogo da Praia das Conchas:
1. Primeira onda
2. Sombra da garça
3. Busca e volta
4. Ponta da garça

O marcador de estrela na ponte identifica o ramal opcional **Ilhota perolada**. Não foram incluídas fases futuras.

O siri em escala reduzida foi redesenhado diretamente em uma grade de **23 × 18**, preservando silhueta, pinças, olhos e a paleta da camada aprovada. É apenas uma proposta para seleção: o sprite de **35 × 27** continua preservado e não mudou na Travessia ou no jogo. O cenário-base foi conferido byte a byte contra a revisão inicial do Cabo Baixo.

`python desenhar-camada.py` (Pillow 13) exporta a camada editável, o sprite pequeno, a composição original e o PNG 4× por vizinho mais próximo. Confere que a composição só mude onde a camada tem pixels e que a escala volte exatamente aos 192 × 144. Não houve aplicação, merge, deploy ou edição no Miudezas.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
