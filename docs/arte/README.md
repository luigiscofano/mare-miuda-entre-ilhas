# Arte provisória

Grade lógica de 256 × 192 e casas de 16 × 16. O Canvas desenha retângulos inteiros e sprites baseados em caracteres, uma célula de cor por pixel. O exterior de sprites é vazio; sobre o palco opaco, não há alpha parcial. O Canvas desliga suavização e usa escalas inteiras de 1× ou maiores conforme o espaço.

- Cinzas e padrões diferenciam firme, baixio baixo, baixio coberto e obstáculo.
- Contorno em X mostra ameaça no próximo passo, acompanhado de texto.
- Linhas e cores da água são provisórias, legíveis e não representam caminhos clicáveis.
- As matrizes originais são editáveis em [src/render/index.ts](../../src/render/index.ts).

A próxima etapa testará a densidade de sprites e fundos em conjunto, três direções de logo em PT/EN e exportação em escala inteira nearest-neighbor. Capturas não devem ter cursor. Estudos e capturas devem ser rotulados separadamente.

## Palco colorido de teste

A praia usa `#24585e` (mar), `#32747a` (ondulações), `#f4d398` (areia), `#243c41` (contorno), `#df7756` (carapaça) e variações chapadas. As trilhas e entradas usam o mesmo módulo de 16 pixels. Portões não dependem só de cor: têm uma barra transversal. A fase mantém marca em X e aviso textual ao prever o ataque. A paleta cinza histórica não é substituída.

### Legibilidade do objetivo

Um brilho chapado acompanha a concha, além do texto que identifica o objetivo. A célula ativa e as vizinhas com movimento válido mantêm destaque. Cantos discretos aparecem apenas nas células bloqueadas diretamente ao lado do personagem ativo, sem molduras em áreas distantes.

### Marca na abertura

A variante A, Placa de Areia, foi escolhida para a abertura. É usada sem modificações nos pixels, com o PNG lógico carregado em escala inteira. [Fonte e verificações](../../assets/README.md). A alternativa B, a marca em inglês e as versões compactas continuam nos estudos.

## Primeiro lote: arte de teste, não direção final

Recifes usam mar mais frio, corais chapados e o topo claro da pedra segura; Mangue usa paleta oliva, raízes, placa e portão com formas distintas. Os dois siris têm silhuetas de pinças diferentes e o ativo recebe um traço sob os pés. Os desenhos usam a mesma grade, sem pinceladas ou pixels fora da grade. Mapa e cenário são suficientes para testes de regra, mas **a densidade e a composição estão abertas**. A Placa de Areia continua exatamente igual; os estudos de ampliação visual são trabalho separado.

### Cabo Baixo, mapa de seleção

O fundo aprovado mantém 192 × 144 pixels na moldura de desenho. Números, desvio opcional e portão são desenhados pelo seletor em âncoras da imagem base. O cursor temporário é neutro enquanto se revisa o siri específico deste seletor. Nenhum sprite da Travessia foi alterado. A Enseadinha ainda usa terreno provisório e está identificada como tal.
