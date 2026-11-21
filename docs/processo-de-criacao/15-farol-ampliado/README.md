# 15 · Arquipélago do Farol ampliado

---
<details>
<summary>O que entra neste lote</summary>

Dez fases regulares, sete em dupla. As duas travessias anteriores mantêm IDs e posições. Depois do segundo marco, **As duas luzes do farol**, bifurcam-se a rota leste/sul e a costa norte. A luz final é acessível pelo leste sem terminar a costa norte. Ao concluir **Salão das lanternas** e **Lentes em contramaré**, a ligação entre as rotas abre nos dois sentidos.

Não há chefe nem trio neste lote: as travessias recombinam as regras da campanha, sem introduzir ações novas. Sem mudanças na arte da fase ou no início de outros mundos.

</details>

---
<details>
<summary>Fichas, rotas e soluções</summary>

As rotas partem de maré baixa e terminam sem levadas. U ↑, D ↓, L ←, R → e X troca o siri ativo sem avançar o relógio. A rota guardada fica nos próprios dados da fase.

| Ramo e fase | Objetivo e leitura | Rota de referência | Passos |
| --- | --- | --- | ---: |
| Leste · Faroleiros de vigia | Levar o fragmento ao fim e posicionar ambos os siris. A garça alterna alvos; o portão permite um caminho mais curto, mas não é obrigatório. | `XRXRRRDRXRRRRRDXRRUDD` | 17 |
| Leste · Turno dos guardiões | Fazer os dois embarques em marés opostas, com fragmentos nas duas margens. Proteja a dupla dos sinais de rasante perto da placa. | `RRRXRRRRRRXRXRRLXRRRRRXR` | 19 |
| Norte · Costa das três luzes | Juntar três moedas e alcançar a saída em até 29 passos. Três bolsos e os bancos inundáveis disputam o caminho de volta. | `DLDLRLRLLUUUUURRRDRRURRDDDR` | 27 |
| Norte · Faísca de entrada | Levar a pérola ao encaixe e voltar à alavanca antes de alcançar o portão. A volta oferece um anel de terra firme. | `RRRURRRDRDLULLLULULRRRDRRDRDDR` | 30 |
| Leste · Salão das lanternas | Um siri transporta e encaixa a pérola, o outro aciona a alavanca e segura a placa. O corredor sul leva ao marco da dupla. | `RRRRRXRRRRRRXRDRRRDRXRDRRRU` | 24 |
| Norte · Quatro cais do farol | Recolher três fragmentos usando quatro balsas de orientação alternada. Planeje a volta a oeste antes da última travessia. | `RRRRRRDRDRLRRDDDRLLRLLRLLULLLL` | 30 |
| Norte · Lentes em contramaré | A dupla sincroniza as duas balsas, a pérola, a alavanca da outra margem e os dois portões. | `RRRXRRRRRXRRRRXRDDXDRRLDDRXRR` | 24 |
| Sul · A luz das duas marés | Usar a alavanca da margem sul, três balsas e dois portões. Buscar três fragmentos e reunir a dupla sob ameaça de rasante. | `RXRRRXRRRXRRRXRRRRXDDXRRLRLRLDDRLDRRRXRRD` | 34 |

Em **Faroleiros de vigia**, a solução `XRXRRRDRRRDDXRURRRRUDD` funciona com o portão fechado: 19 passos e zero levadas. Já em **Lentes em contramaré** e **A luz das duas marés**, não há vitória sem levadas retirando um dos portões. As quatro balsas de **Quatro cais do farol** e as três de **A luz das duas marés** foram verificadas separadamente: remover qualquer uma impede vencer sem levadas. A fase final exige pelo menos 34 passos; a rota acima usa sete trocas e onze viradas de maré.

</details>

---
<details>
<summary>O que foi verificado</summary>

- Todas as soluções da campanha são executadas pelo motor do jogo, sem levadas.
- O mapa tem ida e volta por vértices, mantém saves anteriores e libera o retorno ao arquipélago sem terminar o ramo norte.
- O teste de navegador percorre os dois ramais, as dez fases, a recarga e a volta ao arquipélago com teclado e toque emulado. O resultado de cada navegador está nos checks do PR. Teste em celular físico fica para a revisão de lançamento.

</details>
