# Motor por turnos

`iniciar(fase)` devolve a posição inicial, a última casa firme, a contagem de zero e o inventário vazio. A maré é derivada dos passos; o estado não duplica uma informação que pode divergir. Cada `executarPasso` recebe estado anterior imutável e devolve estado e eventos discretos.

1. Valide a direção usando o terreno e a maré antes do deslocamento. Bloqueio deixa o estado intacto; estado terminal ignora entradas.
2. Conte o passo; nos múltiplos de três, registre a virada. Projetos futuros inserem aqui deslocamento de plataformas e efeitos da corrente.
3. Julgue água e ameaças na casa de chegada. Se for atingido, conte uma levada, mantenha o turno, deixe intactos inventário e pedidos pendentes, e retorne à última casa firme. Sem coleta/vitória nesse turno.
4. Se seguro, marque terra firme, atualize objetivo/inventário e só então avalie vitória.

A garça é um padrão de turno anunciado antes da ação. Não há espera por tempo real, efeito aleatório ou plataformas nesta versão. Abrir a placa e alternar a dupla são regras do motor, não da animação. A saída fica em terra firme.

**Invariantes:** um comando não soma duas levadas; o terceiro erro é terminal; entrar em baixio coberto no turno que faria a água baixar não é um passo válido. Nos mapas de dupla, ambos compartilham contador e limite de erros; trocar de ativo não gasta turno. Os marcos firmes só se atualizam quando ambos estão em casas firmes distintas, fora de portão. Um erro move os dois aos marcos do mesmo turno seguro; nenhuma coleta ou chegada é concedida junto da levada. A entrada no portão exige outra posição pressionando a placa. Um siri que já passou pelo portão pode sair dele mesmo quando a placa é solta. O relógio de plataformas permanece futuro.

**© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.**

O render consulta `destinoPermitido` para destacar vizinhas usando a mesma condição que executa o movimento. A consulta não prevê se um passo legal será prudente após a virada; maré e aviso da garça continuam distintos. No laboratório, o limite opcional de passos é aplicado após ameaças, coleta e vitória. Fases sem limite usam as mesmas condições de antes.

A patrulha alterna alvos seguindo a mesma sequência usada pelo aviso do próximo passo. Nas fases com balsas, a posição antiga autoriza embarcar; na virada (3 ou 6 do ciclo), as balsas se movem e levam quem termina o passo a bordo. Só depois são avaliados riscos na posição final, coleta e vitória. Água funda sem balsa é bloqueada e não vira ponto de retorno. Sem ação de esperar, incluindo em balsa. Paradas repetidas e balsa com dupla são rejeitadas neste lote.

### Cadeia de mecanismos das Grutas

Após a resolução da maré e dos perigos, um passo seguro sobre a próxima etapa avança o estado. A pérola entra no inventário ao passar sobre ela e é consumida no encaixe. Uma etapa futura pisada cedo só mostra uma pista. O portão permanece fechado até completar a cadeia; bater nele não gasta passo. Reiniciar recria a tentativa e limpa a sequência.
