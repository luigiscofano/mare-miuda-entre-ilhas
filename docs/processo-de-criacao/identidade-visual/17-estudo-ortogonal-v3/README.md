# Terceiro estudo ortogonal: textura e profundidade

Nova rodada privada de estudos, sem substituir anteriores nem aplicar ao jogo. Travessia mantém movimento de uma casa ortogonal por vez; o Caminho navega por vértices, nunca por casas. A mesma luz do alto à esquerda orienta copas, rochas e falésia; texturas são grupos de pixels sólidos de paletas discretas. No tabuleiro, a espuma, a sombra e os recifes externos nunca contam como piso.

- [Caminho das Conchas: nativo 304 × 228](caminho-das-conchas-ortogonal-v3-1x.png) · [PNG 3×](caminho-das-conchas-ortogonal-v3.png).
- [Travessia: nativo 400 × 300](travessia-ortogonal-v3-1x.png) · [PNG 3×](travessia-ortogonal-v3.png). Usa o mapa existente Trilha das Pedras após direita e cima. As casas de 30 × 30 são uma proposta gráfica sem efeito no motor.

Execute `python3 desenhar.py` com Pillow. A saída é RGB sem suavização. Foram verificados em 1× e 3× os sprites aprovados, alfa binário, igualdade de todos os pixels opacos e ampliação inteira reversível. As telas maiores tornam o mesmo siri proporcionalmente menor sem redimensioná-lo.

Logo, Arquipélago/Meia-Lua, execução do jogo e Miudezas permanecem intactos.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
