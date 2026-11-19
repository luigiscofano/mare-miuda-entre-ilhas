# Motor por turnos

`iniciar(fase)` devolve a posição inicial, a última casa firme, a contagem de zero e o inventário vazio. A maré é derivada dos passos; o estado não duplica uma informação que pode divergir. Cada `executarPasso` recebe estado anterior imutável e devolve estado e eventos discretos.

1. Valide a direção usando o terreno e a maré antes do deslocamento. Bloqueio deixa o estado intacto; estado terminal ignora entradas.
2. Conte o passo; nos múltiplos de três, registre a virada. Projetos futuros inserem aqui deslocamento de plataformas e efeitos da corrente.
3. Julgue água e ameaças na casa de chegada. Se for atingido, conte uma levada, mantenha o turno, deixe intactos inventário e pedidos pendentes, e retorne à última casa firme. Sem coleta/vitória nesse turno.
4. Se seguro, marque terra firme, atualize objetivo/inventário e só então avalie vitória.

A garça é um padrão de turno anunciado antes da ação. Não há espera por tempo real, efeito aleatório, dupla ou plataformas nesta versão. A saída fica em terra firme.

**Invariantes:** um comando não soma duas levadas; o terceiro erro é terminal; entrar em baixio coberto no turno que faria a água baixar não é um passo válido. No futuro, incluir posições individuais, porto seguro por personagem e relógios de ameaças/plataformas no estado e na validação.

**© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.**
