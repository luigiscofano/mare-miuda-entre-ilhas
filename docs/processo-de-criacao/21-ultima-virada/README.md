# Última Virada

Segunda arena opcional do Arquipélago do Farol. Ao vencer o Guardião do Farol, siga à esquerda; **→** volta ao Guardião. A arena não muda as rotas da campanha, o desvio independente em trio ou a contagem das dez regulares.

## Uma lente precisa de dois siris

Os três corredores se mantêm separados. A cada três passos válidos o feixe gira e a maré vira. Quando um siri chega à lente apontada pelo feixe, outro precisa estar na **placa daquela lente** no mesmo turno. Pisar na placa não deixa a lente acesa automaticamente; a chegada precisa estar na orientação certa, com todas as posições seguras. A previsão indica coordenadas e se a placa atual está ocupada. Duas marcas brancas sobre a placa mostram qual é a do feixe atual, e a cor da própria placa só muda enquanto estiver ocupada.

| Feixe | Quem chega à lente | Quem sustenta a placa |
| --- | --- | --- |
| Oeste | Coral · coluna 11, linha 1 | Verde · coluna 9, linha 3 |
| Leste | Verde · coluna 3, linha 3 | Amarelo · coluna 11, linha 5 |
| Sul | Amarelo · coluna 8, linha 5 | Coral · coluna 13, linha 1 |

Na ida, pode ser preciso passar por uma lente apagada e voltar: as três placas ficam além das lentes de quem as ocupa. Uma lente acesa não apaga ao sair da placa nem ao sofrer uma levada. Reiniciar limpa as lentes e volta ao começo. A saída só vale com as três lentes acesas e os três destinos ocupados. Trocas não gastam passo.

## Ficha e validação

- **Tabuleiro:** 15 × 5, visão de cima, corredores próprios com um baixio e uma ponte de luz cada.
- **Menor rota sem levadas:** `RRRXXRRRRRRRRRRXRRRRRRXRRRRRRRRXXRRRXXLLLRRRRRRRXRRXRRRRRR`. São 48 passos, contra 42 se a placa não for exigida. `L/R` são esquerda/direita e `X` troca o siri ativo. Nessa rota Verde acende no passo 21, Coral no 28 e Amarelo no 33.
- **Retomada:** uma busca reversa no ciclo combinado de 18 turnos conferiu 949.104 combinações de posições firmes, relógio, siri ativo e lentes. Todas ainda podem vencer sem perder outra vez. Isso não impede uma levada por deixar um parceiro numa ponte que apaga; confirma que o retorno firme ainda tem saída.
- **Verificação:** o motor testa placa desocupada, lente acesa, perda, retorno e save. O roteiro de navegador provoca a recusa com a placa livre e conclui a arena com teclado e toque emulado. Sem teste em aparelho físico.
