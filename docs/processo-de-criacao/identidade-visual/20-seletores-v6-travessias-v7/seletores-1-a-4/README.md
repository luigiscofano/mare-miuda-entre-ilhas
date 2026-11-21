# Seletores V6 · Mundos 1 a 4

Quatro novos estudos estáticos: a Praia (trecho Cabo Baixo), os Recifes
Expostos, o Mangue dos Siris Duplos e a Enseada da Garça. Os terrenos, os
níveis de relevo e as composições são novos, separados das rodadas anteriores.
A luz chega do noroeste; faces abaixo do plano, apoios e sombras usam a
mesma projeção ortográfica. Passarelas levam cargas a pilares; escadas
terminam em patamares; portas, beirais e vidros fazem parte dos edifícios.

As rotas preservam o grafo de campanha do protótipo 399e67a. Os caminhos
visuais viram 90°; a navegação proposta continua ponto a ponto, não por
célula. A Praia inclui a saída para a Enseadinha; os outros mundos mantêm
o atalho e, quando existente, os nós opcionais. Posições aqui são do estudo,
não do estado de execução.

Cada mapa é criado em 512 × 384, RGB opaco, e ampliado exatamente a 2×.
A prancha une os quadros em escala nativa. O sprite de 31 × 23 pixels
é o mesmo arquivo aprovado dos seletores V4 e V5, sem redesenho,
redimensionamento ou alteração de cor. O exportador valida o alfa binário
na fonte e cada cor colada, além do retorno idêntico da exportação a 1×.

Reproduza com Python 3, Pillow, NumPy e SciPy: `python desenhar.py`.
Não houve mudança de runtime, logo, seleção de mundos ou publicação.
