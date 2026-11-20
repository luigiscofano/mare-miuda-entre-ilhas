# Arte provisória

Grade lógica de 256 × 192 e casas de 16 × 16. O Canvas desenha retângulos inteiros e sprites baseados em caracteres, uma célula de cor por pixel. O exterior de sprites é vazio; sobre o palco opaco, não há alpha parcial. O Canvas desliga suavização e usa escalas inteiras de 1× ou maiores conforme o espaço.

- Cinzas e padrões diferenciam firme, baixio baixo, baixio coberto e obstáculo.
- Contorno em X mostra ameaça no próximo passo, acompanhado de texto.
- Linhas e cores da água são provisórias, legíveis e não representam caminhos clicáveis.
- As matrizes originais são editáveis em [src/render/index.ts](../../src/render/index.ts).

A próxima etapa testará a densidade de sprites e fundos em conjunto, três direções de logo em PT/EN e exportação em escala inteira nearest-neighbor. Capturas não devem ter cursor. Estudos e capturas devem ser rotulados separadamente.

## Palco colorido de teste

A praia usa `#24585e` (mar), `#32747a` (ondulações), `#f4d398` (areia), `#243c41` (contorno), `#df7756` (carapaça) e variações chapadas. As trilhas e entradas usam o mesmo módulo de 16 pixels. Portões não dependem só de cor: têm uma barra transversal. A fase mantém marca em X e aviso textual ao prever o ataque. A paleta cinza histórica não é substituída.
