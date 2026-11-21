# Campanha e mapa-múndi

**Planejado.** O protótipo tem seleção de três testes, não um mapa autoral. Na fatia vertical, a Praia das Conchas terá percurso caminhável, bifurcação e retorno. Depois, Recifes e Mangue podem ser feitos em qualquer ordem; completar ambos libera a Enseada. Segredos dão recompensas opcionais e nunca travam a história. Atalhos evitam refazer trechos.

| Mundo | Introdução → aplicação → combinação → domínio |
| --- | --- |
| Praia das Conchas | Contar passos → sair antes da subida → dois baixios com refúgio → desvio opcional. |
| Recifes Expostos | Pedra alta vs. intransitável → refúgio → dois fragmentos → ida e volta em mais de um ciclo. |
| Mangue dos Siris Duplos | Troca de personagem → duas posições → contador compartilhado → reunião por rotas distintas. |
| Enseada da Garça | Ver marca → abrigo → ameaça com maré → dois cruzamentos planejados. |
| Ilhas à Deriva | Prever posição da balsa → travessia → resgate e retorno → duas balsas com refúgio. |
| Grutas da Espuma | Transportar item → abrir saída em etapas → mecanismos em lados opostos → ordem de câmaras e retorno. |
| Baía da Ressaca | Ler aviso → sobreviver → atrair ataque → ativar três ancoradouros na arena. |
| Arquipélago do Farol | Travessia de revisão → dupla, plataforma e vigia → rota principal e segredo → farol. |

Cada etapa autoral terá objetivo, regra nova, mapa, solução, sequência de ensino, pontos confusos e condições de reinício. Ao adicionar persistência, use chaves de armazenamento exclusivas do projeto e IDs de progressão versionados.

## Implementado na fatia vertical

Mapa em casas ortogonais, com símbolos de entrada e portões nas extremidades das arestas:

```
#########
#S1.2.3F#
###.##.##
###O#..##
###...###
```

S: cais · 1: Primeira onda · 2: Sombra da garça · 3: Busca e volta · O: Ilhota Perolada · F: encontro final · #: água fora da rota.

- A vitória na Primeira onda abre a bifurcação e a travessia seguinte.
- A vitória na Ilhota dá a Concha Perolada e abre os portões do atalho, sem substituir o desbloqueio concedido pela Sombra da garça.
- As vitórias 2 e 3 são necessárias para alcançar a ponta da praia. A concha não atrasa a rota principal.
- Depois de concluir o encontro, é possível entrar nos créditos ou voltar para explorar. Tentativas são reiniciadas ao entrar na fase; a posição no mapa e as vitórias são persistidas.

A tabela anterior continua sendo o plano da campanha, não indicação de mundos disponíveis.

## Primeiro lote: mapa do arquipélago

A Ponta da Garça da Praia abre a saída para a vista caminhável do arquipélago. Em seguida escolha Recifes ou Mangue, em qualquer ordem. As regiões têm seus próprios mapas locais e três travessias sequenciais. Depois de concluir a última travessia da região, há um atalho pelo sul de volta ao seu porto. O porto retorna ao ponto regional correspondente no arquipélago.

A passagem da Enseada abre só depois de `recife-retorno` e `mangue-reuniao`. A placa no mapa informa que é uma passagem futura; não há nível silenciosamente vazio nem avanço ao lote 2. A Concha Perolada e a trilha opcional da Praia não entram na condição.

## Atualização: trilhas de marco a marco

A descrição em casas acima é histórica. A seleção atual usa um grafo; um toque ou tecla segue a trilha completa e só para no próximo marco, mesmo se o desenho fizer curvas. Praia, arquipélago, Recifes e Mangue seguem este contrato. Somente as fases usam deslocamento célula a célula. Veja a [revisão de escopo, temas e leitura visual](../producao/escopo-e-leitura.md).

A curva aumenta por etapas: Praia introdutória, lógica leve no segundo mundo, combinação no terceiro e mapas mais amplos, rotas que podem fechar, fuga sinalizada, busca, moedas sob limite e chefes nos últimos. Consulte o [plano revisado](../producao/escopo-e-leitura.md). A prova de moedas da bancada não acrescenta obstáculo à campanha tutorial.

## Praia em duas telas

Cabo Baixo tem quatro marcos principais, contando o encontro existente, e a Ilhota Perolada. Após vencer a Ponta da garça, siga à direita e abra o portal para a Enseadinha. A passagem de volta no início da nova tela devolve o siri ao portal do Cabo. Três desafios principais liberam o novo embarque, sem exigir os três opcionais. O embarque antigo foi mantido para saves anteriores, e o arquipélago ainda desembarca no ponto original do Cabo. A Praia tem dez fases autorais (seis principais e quatro opcionais) e o encontro Ponta da garça; Vigia das ondas é o primeiro chefe opcional; Ponta da Ressaca continua no plano.

## Planejamento completo

A [matriz visualizável da campanha](matriz.md) separa roteiro principal, ramificações, chefes e requisitos de aceite. As fichas iniciais da Enseada da Garça, Ilhas à Deriva e Grutas da Espuma descrevem incrementos já jogáveis no protótipo. O plano não altera a disponibilidade do catálogo já implementado.

## Segundo lote jogável

A indicação antiga da Enseada agora leva a três travessias de patrulha e, depois delas, a três fases nas Ilhas à Deriva. A ideia de composição do lote está na matriz, e as fichas executáveis e suas soluções no [processo de criação](../processo-de-criacao/07-campanha-e-lote2/README.md). Chefes, sete regulares adicionais por região e arte de acabamento não entram nesta entrega.

Corrente cruzada libera as Grutas da Espuma. O núcleo jogável atual tem três fases de entrega e mecanismos; são parte da rota principal e não exigem desvios opcionais. Os dois chefes e as demais fases ainda estão no plano.

Os desvios em dupla na Enseada e nas Ilhas reaproveitam as cores, a troca gratuita e o relógio compartilhado. A dupla volta de vez em quando, sem substituir os desafios de um siri só.

As Grutas têm cinco fases regulares, das quais duas em dupla; sua última travessia abre a Baía da Ressaca. A Baía começou com duas travessias em dupla que combinam patrulha anunciada e deslocamento de balsas. O Farol abre depois de Ancoradouros em revezamento. Depois das duas travessias históricas, o mapa divide-se em dois ramais: a costa norte tem quatro desafios regulares de revisita e a rota dos guardiões tem quatro regulares, incluindo A luz das duas marés. São dez regulares no total (sete em dupla), sem contar a arena opcional do Guardião. [Fichas e soluções](../processo-de-criacao/15-farol-ampliado/README.md).

Na Enseada e nas Ilhas, o segundo desvio regular em dupla é aberto após o primeiro. No segundo desafio da Enseada, a garça alterna margens; no da Deriva, duas balsas viajam em sentidos opostos no mesmo relógio. Esses desvios não são requisito de embarque.

## Ampliação dos Recifes Expostos

O percurso original conserva a chave que libera a Enseada. Os marcos novos saem de um braço ao norte da primeira travessia: sete regulares e dois desvios facultativos, totalizando doze travessias em Recifes. O ramo não é pré-requisito do arquipélago. Os chefes ficam para outro lote. [Fichas e soluções](../processo-de-criacao/09-recifes-ampliados/README.md).

## Ampliação do Mangue dos Siris Duplos

O Mangue tem dez travessias regulares, sem chefes neste lote. A rota original continua a liberar a Enseada. Um ramo novo parte de Raízes vizinhas e trabalha troca, maré compartilhada, placa, porta, fragmentos e reencontro. [Fichas e soluções](../processo-de-criacao/10-mangue-ampliado/README.md).

## Ampliação da Enseada da Garça

A partir de Corrida ao farol baixo, o ramal das [duas arenas opcionais](../processo-de-criacao/26-chefes-enseada/README.md) ensina faixas horizontais e refúgios em solo, depois combina rasantes verticais com placa e reencontro em dupla. A saída para a Deriva permanece independente.

A Enseada passa a dez regulares mais dois desvios históricos em dupla. O ramo novo parte de Sombra na restinga e termina em Vigia partilhada, em dupla. Não altera a abertura das Ilhas à Deriva. [Fichas e soluções](../processo-de-criacao/11-enseada-ampliada/README.md).

## Ampliação das Ilhas à Deriva

O mundo tem dez travessias regulares e dois desvios em dupla. A rota curta original, o embarque para as Grutas e os saves permanecem. O novo ramo apresenta sete desafios de balsa, incluindo uma travessia regular em dupla. [Fichas e soluções](../processo-de-criacao/12-deriva-ampliada/README.md).

## Ampliação das Grutas da Espuma

O mundo tem dez regulares: dois solos e três desafios em dupla novos, além das cinco fases anteriores. O ramo parte do primeiro marco; o caminho histórico continua a liberar a Baía da Ressaca. [Fichas e soluções](../processo-de-criacao/13-grutas-ampliadas/README.md).

## Ampliação da Baía da Ressaca

A Baía passa a ter dez travessias regulares, seis em dupla. O ramo novo parte de Abrigo dos dois cais e combina refúgios, balsas, placa e duas travessias com três moedas e orçamento de passos. O caminho anterior continua a liberar o Farol sem enfrentar o chefe opcional Vento Sul, que se abre depois de Cofre da vazante. [Fichas e soluções](../processo-de-criacao/14-ressaca-ampliada/README.md).

## Arena Vento Sul

O primeiro chefe da Baía usa a própria subida da maré para varrer uma faixa anunciada. Firme três ancoradouros na baixa antes de sair. [Ficha, aviso no tabuleiro e solução](../processo-de-criacao/16-vento-sul/README.md). O segundo chefe da Baía continua planejado.

## Arena Ressaca Alta

Depois de Vento Sul, siga à esquerda para sobreviver a três faixas anunciadas e conduzir a dupla a dois destinos. As arenas são opcionais, mantêm dez regulares na Baía e não mudam a passagem ao Farol. [Ficha e solução](../processo-de-criacao/17-ressaca-alta/README.md).

## Estreia do trio nas Grutas

Depois de **A pérola e a placa**, siga para baixo no mapa para o desvio **Três refúgios**. O trio divide o comando e a maré, e vence com três alvos ocupados. O desafio não entra nas dez regulares nem impede a viagem à Baía. [Ficha](../processo-de-criacao/18-trio-grutas/README.md).

## Trio na Baía e no Farol

Depois da introdução em Três refúgios, **Eco dos três cais** combina duas balsas com placa e fragmento. **Três luzes em revezamento** combina duas balsas, placa e a ordem da pérola, do encaixe e da alavanca. Os desvios têm porta de entrada e volta, sem mudar as dez regulares de cada mundo nem os dois chefes da Baía. [Fichas e soluções](../processo-de-criacao/19-trio-avancado/README.md).

## Guardião do Farol

O primeiro chefe opcional do Farol abre abaixo de A luz das duas marés. O feixe muda de orientação, abre pontes diferentes e indica qual lente pode ser acesa. A passagem do trio à esquerda e o embarque para o arquipélago não dependem do Guardião. [Ficha](../processo-de-criacao/20-guardiao-farol/README.md).

## Última Virada

O segundo chefe opcional do Farol abre à esquerda do Guardião depois de vencê-lo. As três lentes usam placas distintas: para acender uma, o siri chega enquanto o feixe aponta para ela e outro sustenta o controle. A arena não bloqueia o desvio do trio nem a rota das regulares. [Ficha e solução](../processo-de-criacao/21-ultima-virada/README.md).

## Vigia das ondas

Depois de Fio de areia, siga para cima para aprender a ler a faixa anunciada e usar as pedras altas. A saída da Praia e o encontro Ponta da garça não mudam. [Ficha](../processo-de-criacao/22-vigia-das-ondas/README.md).

## Ponta da Ressaca

Ao vencer Vigia das ondas, suba no marco dele para encarar a segunda arena opcional. As ondas alternam entre duas faixas e o caminho tem dois baixios em janelas separadas, com uma margem firme e pedras altas de refúgio. O embarque e a Ponta da garça continuam independentes. [Ficha e solução](../processo-de-criacao/23-ponta-da-ressaca/README.md).

## Chefes dos Recifes Expostos

A volta do recife abre o ramo direito: Guardião das Poças primeiro e Vigia do Recife abaixo. A saída da região e os dez marcos regulares não mudam. [Fichas e rotas](../processo-de-criacao/24-chefes-recifes/README.md).

## Chefes das Ilhas à Deriva

Depois de Corrente cruzada, vá à direita para **Mestre das Correntes**. Vença-o e siga para baixo para **Passagem das Balsas**. As dez travessias regulares e os dois desvios em dupla não mudam. Os dois chefes são opcionais e não são requisitos para o embarque rumo às Grutas da Espuma. [Fichas, capturas e soluções](../processo-de-criacao/27-chefes-deriva/README.md).
