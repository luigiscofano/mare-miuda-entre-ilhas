# Estudo ortogonal de relevo e luz

Segunda rodada de duas pranchas estáticas, não integradas ao jogo. A primeira rodada fica preservada no histórico. As bordas em degraus distinguem o sólido e o molhado sem diagonais cortando casas. Camadas de falésia, reflexos de espuma, copas e rochas iluminadas pelo alto à esquerda dão profundidade.

- Caminho das Conchas: [PNG nativo 240 × 180](caminho-das-conchas-ortogonal-v2-1x.png) e [ampliação 4×](caminho-das-conchas-ortogonal-v2.png). A trilha continua por vértices, não por casas. Os mesmos marcos do Cabo Baixo orientam a proposta.
- Travessia: [PNG nativo 320 × 240](travessia-ortogonal-v2-1x.png) e [ampliação 4×](travessia-ortogonal-v2.png). A casa proposta de 24 × 24 é apenas visual e não altera regras. Tabuleiro da Trilha das Pedras após direita e cima.

A dimensão lógica maior reduz visualmente o tamanho relativo do siri sem mudar seus pixels. Logo, Arquipélago, mapas jogáveis e Miudezas não foram tocados.

Reprodução: execute `python3 desenhar.py` com Pillow. A exportação compara os pixels dos sprites aprovados, confirma alfa binário e testa ampliação por vizinho mais próximo com retorno idêntico. Inspeção visual em 1× e 4×.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
