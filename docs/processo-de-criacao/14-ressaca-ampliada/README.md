# Ampliação da Baía da Ressaca

O sétimo mundo passa a ter dez travessias regulares, seis em dupla. O ramo parte de **Abrigo dos dois cais** e acrescenta oito fases. Ele reúne os mecanismos de outros mundos antes do Farol: bolsos firmes, balsas com paradas previsíveis, placa e portão, e três moedas com limite de passos. Não acrescenta chefes nem muda a patrulha que já existia nas duas travessias originais.

## Rota e revisita

A saída para o Farol continua a depender apenas de **Ancoradouros em revezamento**; a travessia em dupla e o atalho ao cais são os mesmos. Para visitar a costa norte, suba no primeiro marco após completá-lo. O ramo volta a depender da rota original antes de **Cais em paralelo**, que também pede o revezamento nos ancoradouros. As entradas antigas, posições e conclusões guardadas não mudam. Os novos mapas não impedem sair do mundo.

## Fichas

`U D L R`: cima, baixo, esquerda, direita; `X`: troca de siri, sem gastar turno. Coordenadas nos dados começam em zero. `S/A` são inícios, `H` é refúgio firme, `=` é baixio, `~` é água, `#` é bloqueio, `.` é terra, `C` é a concha, `B` é fragmento ou moeda, `G` é saída de coleta, `P/D` são placa/portão e `T` é o marco da dupla. Todas começam na baixa; reiniciar repõe coleta, posição, passos e levadas, sem apagar o mapa-múndi.

| Fase | Objetivo e ponto de atenção | Rota sem levadas |
| --- | --- | --- |
| Refúgio de pedra | Use o bolso firme ao sul para cruzar os dois baixios seguidos na baixa. | `RRDDUURRRDR` (11) |
| Bolsos opostos | Faça a coleta sul antes de ajustar o caminho para o fragmento ao norte e a saída. | `RDDDLRRRRUUUDDD` (15) |
| Vigia da placa | Um siri sustenta o portão; depois que o outro cruzar, o primeiro deixa a placa e vai ao marco. | `XRRRRXDRRURRRXU` (12) |
| Balsas da ponta | Use o cais central para recolher o primeiro fragmento e pegue a balsa oposta para o segundo. | `RRRRDRRRUDLLDLLLLLR` (19) |
| Cais em paralelo | As duas margens são separadas; alterne antes da virada para transportar e preparar a placa. | `RXRRRRRRXRRRLRRRRRXR` (17) |
| Três moedas do cais | O caminho toca três extremidades e precisa usar a faixa alagável no momento certo. | `DLDLUUUUDDDRRRRUUUDD` (20 de 20) |
| Atracadouro torto | Cruze as duas balsas por alturas diferentes e mantenha a placa até a saída. | `RRRXRDUXRDXRDRXRRUDXDXRRRXR` (20) |
| Cofre da vazante | Divida as moedas entre dois siris, use a placa e ocupe os dois destinos sem desperdiçar turno. | `RXRRRURRXRRRRRXRRRXRRRXUDRR` (22 de 22) |

As grades e paradas estão em [`ressaca-ampliada.ts`](../../../src/fases/ressaca-ampliada.ts). As soluções são rotas de referência, não exigem uma única sequência de comandos. Os números na tabela não incluem trocas.

## Verificação

As oito rotas reproduzem vitória sem levadas no motor. A busca por estados confirma que retirar cada balsa individualmente elimina a vitória sem levadas nas fases que a utilizam, e que as quatro novas duplas não vencem sem trocar ou sem a placa. As duas fases de moedas admitem vitória exatamente no limite; um passo a menos não basta numa rota sem levadas. O roteiro de navegador cobre o cofre por teclado e toque emulado, cobrando o último passo e conferindo o progresso após recarregar. Chefes, trio e aparelho físico ficam fora deste lote.
