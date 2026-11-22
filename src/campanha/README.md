# Campanha e navegação

## Travessias da expansão

`entradasDo` e `totalDeFasesRegulares` descrevem os marcos do grafo caminhável legado. Para a contagem exibida no seletor, use `opcoesDoSeletor` e a categoria `regular`, que inclui a [expansão](../../docs/campanha/expansao/README.md). Os IDs novos são registrados nas conclusões do save v1 e mantêm a coordenada do marco de referência.

O grafo separa os marcos em que se para das curvas que servem só para desenhar e percorrer a trilha. As direções são declaradas para a ida e a volta; as condições de acesso valem nos dois sentidos. O progresso muda apenas quando o siri chega ao destino. Sair da tela antes disso cancela a travessia, sem gravar uma posição intermediária. O mapa não chama o motor de turnos. A apresentação desenha a mesma sequência de pontos que a travessia interpola, sem antialiasing.

A Enseadinha é a segunda tela do mesmo mundo Praia das Conchas, com código de mapa estável `praia-enseadinha`. O código legado `praia` continua sendo Cabo Baixo, sem remapeamento das posições já salvas.

O ponto da Enseada, que era uma indicação de capítulo futuro, agora abre suas três travessias. Depois de fechar a terceira, saia pelo porto para encontrar as Ilhas à Deriva no arquipélago. O atalho sul de cada região abre pela última fase. Não altere IDs anteriores para mover arte ou posições no grafo.

A rota das Grutas parte das Ilhas à Deriva, subindo no arquipélago após Corrente cruzada. No mapa das Grutas, a rota principal não exige fases opcionais; a última travessia abre o atalho de volta ao cais.

Na Enseada e na Deriva, ↑ no marco da terceira travessia abre o desvio opcional em dupla após a conclusão. ↓ volta ao marco. O porto e a saída após o núcleo principal não exigem esses desvios.

Nas Grutas, as três travessias anteriores dão acesso a dois nós regulares, e o segundo abre a Baía da Ressaca no arquipélago. A rota inicial da Baía tem dois nós em sequência, porto e atalho após a conclusão. IDs e nós anteriores continuam válidos no save.

No arquipélago, Ancoradouros em revezamento abre a saída de cima na Baía da Ressaca. O Farol mantém os dois primeiros nós regulares, porto e atalho após a segunda travessia. No segundo nó, → abre a rota dos guardiões e ↑ o ramo norte; a fase final não depende do ramo norte. A passagem entre Lentes em contramaré e Salão das lanternas funciona nos dois sentidos depois de concluir as duas.

## Recifes Expostos ampliados

A rota histórica, seus três nós e seu atalho pelo sul não mudam. No primeiro marco, suba depois de Acima da espuma para acessar o ramo norte. O ramo tem sete travessias regulares, com uma confluência após o costão: Poças suspensas exige o costão e Duas poças do recife. Os desvios **Fio de coral** e **Mosaico das poças** têm marca própria e não entram no contador de dez regulares. O acesso à Enseada permanece compatível com os saves anteriores.

## Mangue dos Siris Duplos ampliado

No primeiro marco do Mangue, suba depois de Raízes vizinhas para explorar as sete novas travessias. O cruzamento logo após Trinco salgado pede também Um segura, outro passa. A rota original, seus três marcos e o atalho ao porto continuam exatamente nas mesmas posições. O ramo não entra na condição de abertura da Enseada.

## Enseada da Garça ampliada

À direita de Corrida ao farol baixo fica Garça da Restinga; abaixo dela, após vencer, fica Vigia das Falésias. O ramal usa novos IDs sem alterar os marcos anteriores nem a saída para a Deriva.

Suba depois de Sombra na restinga para sete travessias regulares novas. A bifurcação após Fragmento no alcance do bico pede também Abrigo entre ondas. No último marco histórico, os dois desvios em dupla seguem no mesmo lugar, assim como o atalho e o embarque para as Ilhas à Deriva. Nem o ramo novo nem os dois opcionais bloqueiam a saída.

## Ilhas à Deriva ampliadas

Suba depois de A primeira balsa para sete regulares. Duas rampas e Duas margens abrem o trecho das balsas alternadas. Os desvios em dupla e o atalho do trecho histórico mantêm ID e posição, e só Corrente cruzada condiciona o acesso às Grutas.

## Grutas da Espuma ampliadas

Suba depois de Uma pérola para o portão para cinco novas regulares. A pérola e a placa, na rota de origem, é pré-requisito das três novas em dupla; nenhuma fase nova condiciona o retorno ao porto ou a abertura da Baía da Ressaca. IDs, marcos e saves anteriores permanecem.

## Baía da Ressaca ampliada

Suba depois de Abrigo dos dois cais para acessar oito travessias novas. Cais em paralelo exige Balsas da ponta e Ancoradouros em revezamento, mas nenhuma fase nova condiciona o atalho ao porto ou a saída para o Farol. Os nós já salvos permanecem válidos.

## Arena opcional Vento Sul

Ao concluir Cofre da vazante, siga à esquerda para o marco de chefe; direita volta ao Cofre. A arena é salva pelo mesmo sistema de conclusões, mas não entra no progresso das dez regulares e não bloqueia o Farol.

Ressaca Alta aparece em um novo marco à esquerda da arena Vento Sul, liberado pela conclusão do primeiro chefe. Ambos ficam fora do contador de regulares. Nenhum requisito novo para viajar até o Farol.

Nas Grutas, ↓ no marco de A pérola e a placa abre Três refúgios depois da conclusão. ↑ volta ao marco. O ID novo é reconhecido pelo save sem migração e não é condição do caminho à Baía.

## Desvios de trio na Baía e no Farol

Em Cais em paralelo, **↓** leva a Eco dos três cais e **↑** retorna. Em A luz das duas marés, **←** leva a Três luzes em revezamento e **→** retorna. Cada desvio abre com a conclusão do próprio marco, conta como extra e guarda a conclusão no save sem exigir a fase de trio de outro mundo.

No Farol, ↓ abaixo de A luz das duas marés abre o Guardião depois da conclusão. ↑ volta ao mesmo marco. O atalho de volta e o desvio em trio preservam posições e condições próprias.

## Última Virada

Depois de vencer Guardião do Farol, siga à esquerda para a segunda arena. Direita retorna. A conclusão é opcional, fica no save e não muda o contador das regulares.

Na Enseadinha, ↑ no marco de Fio de areia abre Vigia das ondas após a conclusão do primeiro. ↓ volta ao mesmo marco. O embarque e os três desvios anteriores continuam independentes.

Acima de Vigia das ondas, ↑ abre Ponta da Ressaca após vencê-lo. ↓ volta ao Vigia e mais ↓ retorna ao Fio de areia. O segundo chefe é opcional, preserva as posições existentes e não muda o embarque.

## Chefes das Ilhas à Deriva

De Corrente cruzada, **→** leva ao Mestre após concluir o marco; **←** retorna. Depois de vencer o Mestre, **↓** abre a Passagem e **↑** retorna. Os novos nós usam a lista de conclusões do save já existente; nenhum deles modifica as dez fases regulares, a saída para as Grutas ou o ramo em dupla acima de Corrente cruzada.

## Chefes das Grutas da Espuma

Sentinela da Gruta (à direita de Revezamento nas câmaras) e Cofre das Espumas (abaixo da Sentinela) são chefes opcionais, em sequência. A primeira visita exige vencer a travessia histórica; a segunda, vencer a Sentinela. Os IDs, a contagem regular e a rota antiga da Baía são preservados.

## Desfecho do Farol

A conclusão de `farol-luz-das-duas-mares` habilita o desfecho no mapa do Farol. O estado é derivado dos IDs já gravados em `concluidas`; não depende do nó atual ou do total de fases, e abrir ou fechar os créditos não altera o progresso.
