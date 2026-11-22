# Ilha de Improviso

Modo separado da campanha. Recebe tema de um dos oito mundos, dificuldade (**Sossegado**, **Animado**, **Puxado**, **Mar Bravo**, **Maré Feroz**), total de siris (1–3), garça e pérola de coleta. A fase usa a geografia e a arte do tema selecionado, sem importar as regras especiais das fases da campanha. **Baía da Ressaca** continua sendo um mundo, não um grau de dificuldade.

## O que muda de verdade

A semente gera o sentido da travessia, o perfil e a ordem das margens, as curvas, os baixios com pontos de espera e os ramos; não sorteia uma fase pronta. A dificuldade abre tabuleiros de 7 a 15 colunas, com 1 a 5 curvas e 1 a 5 baixios por siri. Todos os siris compartilham a maré; de Puxado em diante, na dupla ou no trio, o Verde precisa sustentar a placa para o Coral cruzar o portão. A garça configurável ataca casas realmente usadas, passa a alternar alvos e encurta o intervalo de 11 para 3 turnos nos maiores desafios. Com coletável, a pérola fica numa ponta sem saída: é preciso buscá-lo e voltar à rota, e a saída só aceita a vitória depois da coleta.

## Como se garante uma solução

O gerador constrói uma rota testemunha, reserva duas casas firmes antes de cada baixio, encaixa as travessias no ciclo da maré e escolhe as casas da patrulha sem quebrar essa rota. Antes de devolver a fase, `validarSolucao` valida o mapa e reproduz cada comando com o motor real; só se aceita vitória com zero levadas. Isso garante ao menos uma rota segura, não implica solução única ou mais curta. Jogando sem seguir a rota, maré e garça continuam podendo causar levadas; a derrota na terceira é a mesma do motor.

`gerarMareAMao(opcoes, semente)` devolve uma `Fase` ou `undefined` (dados inválidos ou limite de 24 tentativas). A semente usa até 80 caracteres, sem espaços nas pontas e normalização NFC. Semente, opções e versão do gerador determinam a fase; o ID prefixado `mare-a-mao-v1-` não é aceito pelo catálogo da campanha. Qualquer mudança futura que altere a reprodução por semente deve subir a versão. O módulo não lê DOM, relógio, rede ou armazenamento. A opção interna `fragmento` conserva seu nome no save; se ativa, o jogador vê uma pérola como item obrigatório e a ostra de chegada abre depois de recolhê-la.


## Estruturas no oceano

O cenário de cada mundo garante três estruturas oceânicas nas duas marés, inclusive na grade 15 × 11 com três siris. O [renderizador](../../docs/arte/README.md#três-estruturas-no-oceano) calcula as posições fora da grade; por isso não muda o gerador, a semente, o save nem a rota testemunha.
