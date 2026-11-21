# Meia-Lua · espuma ao redor das ilhas

Variação da [arte sem casas e com as rotas revisadas](../sem-casas/). Acrescenta apenas traços descontínuos de espuma branca a 1 pixel de largura junto às costas das oito ilhas. Os cais, as rotas e o cenário terrestre não foram alterados.

Grade nativa de 288 × 216. O exportador testa a igualdade de todos os pixels fora da camada de espuma (alfa binário) e a integridade da ampliação de 3× com vizinho mais próximo. Use `python exportar.py` com Pillow para reproduzir. Este estudo não foi aplicado ao jogo.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
