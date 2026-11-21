# Arte e renderização

Grade lógica de 256 × 192 e casas de 16 × 16. O Canvas desenha retângulos inteiros e sprites baseados em caracteres, uma célula de cor por pixel. O exterior de sprites é vazio; sobre o palco opaco, não há alpha parcial. A superfície de desenho é de 512 × 384 (densidade 2×), sem mudar a grade lógica, as posições ou a largura CSS. A Praia desenha o cenário diretamente na superfície, com 32 pixels nativos por casa; bancada e demais cenários mantêm o terreno lógico existente. O recorte de 31 × 23 do siri permanece nativo, sem suavização.

- Cinzas e padrões diferenciam firme, baixio baixo, baixio coberto e obstáculo.
- Contorno em X mostra ameaça no próximo passo, acompanhado de texto.
- Linhas e cores da água são provisórias, legíveis e não representam caminhos clicáveis.
- As matrizes originais são editáveis em [src/render/index.ts](../../src/render/index.ts).

A próxima etapa testará a densidade de sprites e fundos em conjunto, três direções de logo em PT/EN e exportação em escala inteira nearest-neighbor. Capturas não devem ter cursor. Estudos e capturas devem ser rotulados separadamente.

## Palco colorido de teste

Nos seletores e cenários não migrados, a paleta de teste usa `#24585e` (mar), `#32747a` (ondulações), `#f4d398` (areia), `#243c41` (contorno), `#df7756` (carapaça) e variações chapadas. As trilhas e entradas usam o mesmo módulo de 16 pixels. Portões não dependem só de cor: têm uma barra transversal. A fase mantém marca em X e aviso textual ao prever o ataque. O cenário de bancada continua cinza, com o siri da marca em sua paleta original.

### Legibilidade do objetivo

Um brilho chapado acompanha a concha, além do texto que identifica o objetivo. A célula ativa e as vizinhas com movimento válido mantêm destaque. Cantos de interação aparecem apenas nos obstáculos diretamente ao lado do personagem ativo. Na Praia, os baixios cobertos também têm quatro cantos finos, sempre visíveis para permitir planejamento à distância.

### Marca na abertura

A variante A, Placa de Areia, foi escolhida para a abertura. É usada sem modificações nos pixels, com o PNG lógico carregado em escala inteira. [Fonte e verificações](../../assets/README.md). A alternativa B, a marca em inglês e as versões compactas continuam nos estudos.

## Primeiro lote: arte de teste, não direção final

Recifes usam mar mais frio, corais chapados e o topo claro da pedra segura; Mangue usa paleta oliva, raízes, placa e portão com formas distintas. O protagonista usa o recorte da marca; Verde e Amarelo usam a mesma silhueta, com paletas e insígnias próprias. O ativo recebe um traço sob os pés. Os desenhos usam a mesma grade, sem pinceladas ou pixels fora da grade. Mapa e cenário são suficientes para testes de regra, mas **a densidade e a composição estão abertas**. A Placa de Areia continua exatamente igual; os estudos de ampliação visual são trabalho separado.

### Cabo Baixo, mapa de seleção

O fundo aprovado mantém 192 × 144 pixels na moldura de desenho. Números, desvio opcional e portão são desenhados pelo seletor em âncoras da imagem base. O siri da placa segue as âncoras do seletor, sem cobrir os números. O fundo não incorpora o personagem. A Enseadinha ainda usa terreno provisório e está identificada como tal.

## Travessia da Praia: direção V32

[Prancha aprovada e aplicação no jogo](../processo-de-criacao/29-travessia-praia/README.md). A [fonte do terreno](../../src/render/travessia-praia.ts) é editável em TypeScript: retângulos inteiros para água e contorno; matrizes de uma cor por pixel para concha, rochas e folhagens. O oceano tem apenas três [enfeites nativos](../../src/render/enfeites-da-praia.ts), recortados do primeiro quadro da prancha nas caixas (16, 123, 61, 150), (354, 166, 395, 198) e (119, 365, 150, 393), base 412 × 412. O fundo chapado vira vazio e só o maior componente conectado de cada recorte é mantido. Nenhum recorte recebe escala fracionária.

Para verificar em movimento, rode `npm run build` e abra a **Passagem da primeira onda** no mapa, não na bancada cinza. Examine a faixa entre o início e a concha antes e depois de três movimentos. O cenário deve manter formas distintas, o mesmo recorte do siri e cantos sem suavização.

## Fauna

[Sprites do trio, duas poses da garça, capturas e fontes](fauna/README.md).
