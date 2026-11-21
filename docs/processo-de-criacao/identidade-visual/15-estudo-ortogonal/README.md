# Estudo ortogonal: Caminho das Conchas e Travessia

Duas prévias estáticas desenhadas do zero para comparação visual. Não são capturas do jogo nem alteram sua arte em execução. O Arquipélago Meia-Lua e a logo não mudam.

- **Caminho das Conchas** (192 × 144 px lógicos): terreno em degraus, marcos do Cabo Baixo e trilhas com cotovelos de 90°. Cada comando continua levando a um vértice da trilha, não a uma casa da grade.
- **Travessia** (256 × 192 px lógicos, casas de 16 × 16): exemplo da Trilha das Pedras após direita e cima. A etapa tem movimentos ortogonais de uma casa, terreno em células inteiras, cantos apenas na rocha bloqueada adjacente e concha com destaque próprio.

| Tela | Grade nativa | Inspeção 4× |
| --- | --- | --- |
| Caminho das Conchas | [PNG](caminho-das-conchas-ortogonal-1x.png) | [PNG](caminho-das-conchas-ortogonal.png) |
| Travessia | [PNG](travessia-ortogonal-1x.png) | [PNG](travessia-ortogonal.png) |

Execute `python3 desenhar.py` nesta pasta com Pillow instalado. Os sprites de entrada são versões aprovadas, sem reamostragem: 31 × 23 do seletor a partir da composição do Cabo Baixo (#17), 35 × 27 da Travessia a partir do estudo aprovado (#9), recuperado do recurso preservado no #12; isso não reaplica a grade de 40 pixels daquele PR.

A exportação verifica alfa binário, igualdade de cada pixel opaco do siri e ampliação inteira que volta à imagem nativa de forma idêntica. As duas pranchas foram inspecionadas em 1× e 4×.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
