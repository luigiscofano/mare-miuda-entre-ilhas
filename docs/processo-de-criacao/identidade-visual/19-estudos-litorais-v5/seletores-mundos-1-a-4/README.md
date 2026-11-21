# Estudos V5 dos seletores: mundos 1 a 4

As quatro imagens são estudos estáticos de direção de arte e interface. Nenhum
mapa foi integrado ao código do jogo. O painel da Praia corresponde a Cabo
Baixo e aponta para a Enseadinha; não é a seleção global de mundos.

| Mundo | Construção visual | Referência de navegação |
|---|---|---|
| Praia das Conchas | Bancos de areia quentes, coqueiros, borda de sedimentação e espuma curta | Rota costeira principal, Ilhota Perolada, atalho e continuação |
| Recifes Expostos | Franja calcária, poças, corais e duas plataformas isoladas | Três fases e atalho que volta ao cais |
| Mangue dos Siris Duplos | Bosques de raízes, remanso e passarela sinuosa em ângulos retos | Três fases e atalho que volta ao cais |
| Enseada da Garça | Promontório de arenito, restinga e farolete, com uma garça distante | Três fases principais, duas opcionais e atalho ao cais |

Os pontos e as conexões remetem ao estado de campanha de `399e67a`. O
ligamento ortogonal no estudo não altera as coordenadas, os bloqueios ou os
comandos efetivos. A posição destacada é um exemplo de seleção, não uma
captura de progresso. Em jogo, um comando deve percorrer uma aresta entre
vértices, não andar pelas células decorativas.

As telas têm **384 × 288** pixels lógicos. O siri aprovado tem **31 × 23** e
mantém os pixels originais. O exportador verifica o alfa binário do sprite,
a cor exata de todos os seus pixels visíveis e a igualdade entre 1× e a
redução da exportação 3× por vizinho mais próximo. A prancha usa 2× inteiro.
Paleta sólida, luz superior esquerda e faces de relevo ao sul. As paletas e
os temários mudam por mundo; só a linguagem de navegação e o HUD são comuns.

Para reproduzir: Python 3 com Pillow, NumPy e SciPy, então `python desenhar.py` neste
diretório. A arte de terreno se origina nas plantas e desenhos definidos no
script; o sprite de entrada e as letras vieram do estudo anterior.

## Revisão da quinta rodada

O mar profundo fica livre de ranhuras avulsas. Caústicas ocupam apenas a
água rasa junto às plataformas. O solo tem textura agrupada e discreta.
Dunas em dobra, lajes calcárias, raízes de mangue e o farolete são peças
moldadas ao terreno, com juntas, faces de sombra e iluminação comum.
Cada cais tem materiais e silhueta próprios. A arte anterior não é
substituída; interfaces, pontos da campanha e sprite foram preservados.
