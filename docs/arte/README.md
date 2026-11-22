# Arte e renderização

Grade lógica de 256 × 192 e casas de 16 × 16. O Canvas desenha retângulos inteiros e sprites baseados em caracteres, uma célula de cor por pixel. O exterior de sprites é vazio; sobre o palco opaco, não há alpha parcial. A superfície de desenho é de 512 × 384 (densidade 2×), sem mudar a grade lógica, as posições ou a largura CSS. As oito travessias desenham o cenário diretamente na superfície, com 32 pixels nativos por casa. A bancada e os seletores mantêm seus próprios desenhos. O recorte de 31 × 23 do siri permanece nativo, sem suavização.

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

Recifes usam mar mais frio, corais chapados e o patamar claro dos refúgios de areia elevada; Mangue usa paleta oliva, raízes, placa e portão com formas distintas. O protagonista usa o recorte da marca; Verde e Amarelo usam a mesma silhueta, com paletas e insígnias próprias. O ativo recebe um traço sob os pés. Os desenhos usam a mesma grade, sem pinceladas ou pixels fora da grade. Mapa e cenário são suficientes para testes de regra, mas **a densidade e a composição estão abertas**. A Placa de Areia continua exatamente igual; os estudos de ampliação visual são trabalho separado.

### Cabo Baixo, mapa de seleção

O fundo aprovado mantém 192 × 144 pixels na moldura de desenho. Números, desvio opcional e portão são desenhados pelo seletor em âncoras da imagem base. O siri da placa segue as âncoras do seletor, sem cobrir os números. O fundo não incorpora o personagem. A Enseadinha agora tem uma proposta de fundo próprio em 512 × 384, com ilhotas ortogonais, espuma e camadas de luz. Números, desvios, chefes, saídas e cadeados são desenhados sobre o fundo, seguindo o progresso. Veja [quadros, fontes e legenda](../processo-de-criacao/34-seletores-praia/README.md).

## Três estruturas no oceano

Cada fase da campanha e da Ilha de Improviso tem três estruturas fora da área das casas. O bloco, o seixo e o afloramento da Praia são exemplos; no restante da campanha, os temas contribuem com suas próprias rochas, recifes, raízes, cristais ou outras peças sólidas. Uma composição agrupada é uma estrutura. Espuma e reflexos continuam sendo água, e refúgio com piso seguro nunca entra na contagem. Uma casa de água intransitável da malha não recebe uma pedra adicional.


A areia elevada dos refúgios `H` é uma camada contínua da trilha, sem o corpo escuro e isolado das rochas. O siri pode pisar nela; pedras não são piso em nenhum mundo. Nas capturas históricas abaixo, a antiga aparência de pedra alta representava o mesmo refúgio que hoje é areia elevada.
As [âncoras](../../src/render/obstaculos-oceanicos.ts) derivam da moldura do tabuleiro, não da maré. Na Trilha das Pedras o afloramento fica embaixo, à esquerda. Em mapas grandes, a arte cabe nas margens da mesma superfície 512 × 384, desenhada com coordenadas inteiras, sem cortar o sprite. O renderizador só muda a camada visível; regras, casas e soluções ficam iguais. A bancada em cinza não representa um mundo e mantém a arte de diagnóstico.

Verificação: `node --test tests/obstaculos-oceanicos.test.ts` exercita as 231 fases da campanha e os oito temas de Improviso nas duas marés, incluindo a grade 15 × 11. As prévias mais recentes de arte são estudos separados, não aplicados ao renderizador deste ajuste.

## Pérolas de coleta

A matriz aprovada tem 20 × 20 pixels nativos, incluindo a sombra curta, e cabe centralizada na célula de 32 × 32 sem interpolação. A mesma silhueta tem quatro paletas distintas: creme, rosa, azul e lilás. A ordem linha-coluna da malha inicial define a cor. Coletar um item não altera a aparência dos que ficaram. Não é necessário distinguir cores para cumprir o objetivo.

A arte mostra apenas os itens `B` nas fases com saída de coleta `G` que não usam orçamento de moedas. O motor mantém os mesmos símbolos, inventário e condições. Nessas fases, a Concha de Chegada em `G` é uma ostra: fechada antes da coleta completa, aberta depois. A arte aprovada foi reduzida a 21 × 22 pixels por vizinho mais próximo, mantendo seus oito tons, a cavidade e os cantos de movimento livres em uma casa de 32 × 32. A pérola `K` das Grutas e as conchas das outras fases continuam como estavam. Verifique com `node --test tests/perolas-coletaveis.test.ts`.

## Espuma de aviso e onda frontal

O primeiro desenho aprovado vira duas matrizes sólidas em [onda-frontal.ts](../../src/render/onda-frontal.ts), com vizinho mais próximo na casa de 32 × 32. Na maré baixa a espuma fica nas casas da próxima faixa, com mais contraste no último passo. A virada para alta acionada pelo motor dispara uma única crista frontal por 360 ms, com o mesmo conjunto de casas se o siri estiver protegido ou sofrer uma levada. Refúgio, obstáculo e mar aberto não recebem a marca. A crista não desliza nem pisca, inclusive com movimento reduzido. Um novo passo válido, reinício, saída ou fim do tempo retira a imagem; bloqueios e redesenhos não reiniciam o tempo.

A camada não muda o relógio nem as consequências do motor. O texto continua anunciando o perigo. Verifique em **Vigia das ondas**, liberado após **Fio de areia** na Enseadinha, ou rode `node --test tests/onda-frontal.test.ts`.

## Travessia da Praia: direção V32

[Prancha aprovada e aplicação no jogo](../processo-de-criacao/29-travessia-praia/README.md). A [fonte do terreno](../../src/render/travessia-praia.ts) é editável em TypeScript: retângulos inteiros para água e contorno; matrizes de uma cor por pixel para concha, rochas e folhagens. Na V32 histórica, o oceano usava três [enfeites nativos](../../src/render/enfeites-da-praia.ts), recortados do primeiro quadro da prancha nas caixas (16, 123, 61, 150), (354, 166, 395, 198) e (119, 365, 150, 393), base 412 × 412. O fundo chapado vira vazio e só o maior componente conectado de cada recorte é mantido. Essa extração não é a regra de posicionamento da versão jogável atual.

Para verificar em movimento, rode `npm run build` e abra a **Passagem da primeira onda** no mapa, não na bancada cinza. Examine a faixa entre o início e a concha antes e depois de três movimentos. O cenário deve manter formas distintas, o mesmo recorte do siri e cantos sem suavização.

## Travessias de Recifes e Mangue: prévia jogável

[Direção, quadros e regras de leitura](../processo-de-criacao/30-travessias-recifes-mangue/README.md). As paletas e matrizes dos dois ambientes estão em [costas-recifes-mangue.ts](../../src/render/costas-recifes-mangue.ts), sem reamostragem. Um tema muda o mar, os enfeites, os estratos, o acabamento do baixio e o desenho da concha. A mesma grade ortogonal e a mesma ordem de camadas protegem os sinais de jogo; os seletores e a arte da Praia permanecem intactos.

## Travessias da Enseada e da Deriva: prévia jogável

[Quadros, paletas e critérios de leitura](../processo-de-criacao/31-travessias-enseada-deriva/README.md). As [matrizes nativas](../../src/render/costas-enseada-deriva.ts) mantêm a mesma malha, com azul de amanhecer e juncos na Enseada, canais de jade e boia distante na Deriva. A concha em violeta e a concha em crescente distinguem os objetivos. O X da garça aparece por cima; o ramo, a espuma e a boia nunca entram no tabuleiro nem se confundem com a balsa que carrega o siri.

## Travessias das Grutas, da Baía e do Farol: prévia jogável

[Caderno com as duas marés e mecanismos](../processo-de-criacao/32-travessias-grutas-ressaca-farol/README.md). As [matrizes de pixel](../../src/render/costas-grutas-ressaca-farol.ts) propõem cavernas de ardósia, mar de tempestade e penhascos em azul-índigo. O fundo não imita o ícone da pérola, a sinalização da onda ou os segmentos claros da ponte. Conchas de objetivo têm forma e paleta próprias; sprites e sinais da regra não são recriados pela camada de arte.

## Seletor de mundos: Meia-Lua

[Quadros e fontes editáveis do seletor](../processo-de-criacao/33-seletor-arquipelago/README.md). O fundo nativo não inclui caminho, cadeados ou personagem. A camada dinâmica usa os oito destinos e a bifurcação já definidos na campanha. A forma das marcas muda quando o acesso é liberado, e o siri canônico é desenhado na mesma posição da versão anterior. A pintura é exclusiva do mapa de mundos.

## Fauna

[Sprites do trio, duas poses da garça, capturas e fontes](fauna/README.md).

## Seletores de Recifes e Mangue

Os [fundos nativos e quadros de comparação](../processo-de-criacao/35-seletores-recifes-mangue/README.md) registram as duas propostas. As rotas e categorias de marco permanecem na camada do jogo, acima do terreno. A arte dos demais seletores e travessias não muda.

## Seletores da Enseada e da Deriva

[Propostas, quadros e fonte](../processo-de-criacao/36-seletores-enseada-deriva/README.md). As paletas distinguem os dois ambientes; as placas e as rotas saem da mesma lógica dos outros seletores. A posição das placas no ramal norte deixa os cadeados visíveis.

## Seletores das Grutas, da Baía e do Farol

[Fundos, fontes e quadros](../processo-de-criacao/37-seletores-mundos-finais/README.md). A arte de cada região preserva os sinais jogáveis e a paleta de cada ambiente. O farol cenográfico não é um objetivo: a camada do jogo indica as rotas, inclusive a reta do último chefe.

## Grãos na areia seca

Todas as casas de areia seca recebem um grão quadrado de 2 × 2 e um de 3 × 3 pixels nativos. São dois tons chapados mais escuros que o chão, com posição determinada pela célula. Baixios, água e obstáculos não recebem estes grãos. Objetivos, sinais e personagens são desenhados depois.
