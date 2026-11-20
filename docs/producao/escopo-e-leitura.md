# Decisão de produção: campanha ampliada e duas formas de navegação

Esta revisão complementa o [roteiro](README.md) sem substituir os registros históricos.

## Escopo de campanha

Oito mundos, **no mínimo 10 fases autorais por mundo sem contar chefes**, com 15 como meta de expansão e **dois encontros de chefe por mundo** (16 ao todo). A ordem introdutória sugerida é aproximadamente cinco fases até o primeiro chefe, um segundo trecho antes do chefe final e ramos opcionais distribuídos pelos dois blocos. Não se exige vencer todas as quinze fases para terminar um mundo. Colecionáveis, desafios extras e ramificações não viram chaves obrigatórias da rota principal. Os chefes ensinam e combinam as regras no ritmo dos turnos, não em tempo real.

- **Agora:** validar a navegação e a legibilidade das 11 fases existentes. Continuam pendentes: teste com jogadores novos, controles em celular físico e acabamento visual.
- **Depois, começar pela Praia:** definir as aproximadamente cinco fases e o primeiro chefe; montar uma rota curta que prove desbloqueio e retorno. Em seguida completar o segundo trecho, o segundo chefe e ramos até pelo menos 10 fases, com 15 como meta de expansão. Não basta um mapa ser solucionável: as pistas precisam ser compreendidas sem ajuda.
- **Demais mundos, por lotes:** aproveitar as fases já feitas de Recifes e Mangue; validar o incremento de cada região antes de abrir o lote seguinte. Para cada etapa, exigir solução reproduzível no motor, validação da campanha sem opcionais, retornos e estabilidade do save. Este número é escopo de produção, não promessa de desafios já implementados.

## Seleção = grafo, fase = malha ortogonal

Na seleção das fases e no arquipélago, o siri se move de **marco a marco**. Cada direção que sai de um marco aponta para no máximo uma trilha. Uma pressão em setas/WASD ou um toque direcional percorre toda a curva, sem parar nos vértices intermediários do desenho. A rota em si pode ser diagonal ou orgânica. As saídas, destinos e bloqueios ficam legíveis na tela e nos rótulos dos controles. Repetição de tecla ou nova entrada durante a travessia não enfileira comando. Navegação não consome passos da maré. Há opção do sistema para reduzir movimento.

**Dentro da fase**, a navegação é uma casa ortogonal adjacente por passo válido. A malha discreta deve deixar limites e colisões claros sem apagar as silhuetas orgânicas. Obstáculos como pedras, cristais e árvores podem ocupar **qualquer quantidade de células inteiras**, sem teto por objeto. A decoração pode ter contorno natural, mas não pode mascarar o que bloqueia, apoia ou deixa passar; uma pedra alta transitável deve ser visualmente distinta de uma rocha bloqueada. O plano visual prevê realçar a célula atual e apenas as vizinhas que o motor permite acessar, com contraste/tipo de borda além de cor; pulso é opcional, desligado com movimento reduzido, e não ditará nenhuma regra. O destaque não deve ser confundido com a previsão da virada.

## Tema da ilha nas duas escalas

Cada região tem linguagem própria **no arquipélago e dentro das fases**: raízes, troncos e sedimento no mangue; recifes, pedras altas e poças nos recifes; cristais e paredes minerais quando couber nas grutas. Preservar areia, mar, maré e a leitura do que fica coberto ou descoberto. As grades de pixel podem diferir entre famílias conforme a direção de arte; cada grade continua uniforme, sólida, sem suavização. A marca Placa de Areia não muda nesta revisão. As ilustrações finais seguem em frente separada.

## Curva de dificuldade da campanha

A Praia começa fácil, com tutorial jogável e uma ideia nova de cada vez. O segundo mundo introduz lógica leve, sem exigir ciclos longos ou penalizar a exploração. O terceiro aumenta a exigência com estado compartilhado, objetivos em mais de uma etapa e antecipação. Nos últimos mundos, invista em mapas maiores e com múltiplas rotas, ações que fecham passagens, busca e fuga de garça previsível, chefes por turnos e objetivos como três moedas distribuídas sob orçamento de passos. A rota de campanha segue sem exigir ramos opcionais. Cada fase desse grupo precisa ter solução reproduzível no motor e análise de recuperação: ensinar o impacto antes de fechar uma passagem, impedir impasses sem aviso e manter reinício e ponto de retomada claros. Comprove a curva com jogadores, não só contando passos ou aumentando a grade.

## Grades visuais do arquipélago e dos seletores

Separar o **arquipélago e os seletores locais dos oito mundos**, com pixels menores em grade uniforme para geografia e detalhes, da **Travessia**, que conserva a grade aprovada, os pixels e a âncora do siri original. A identidade dos biomas muda entre regiões, não o padrão de alinhamento interno. Não aplicar recursos provisórios da seleção por cima dos sprites ou da Travessia. Conservar a logo A exatamente. Assinalar apenas obstáculos ortogonais imediatamente adjacentes ao siri ativo, célula por célula conforme ocupação real; concha tem brilho sólido e identificação textual. O bem-te-vi deixa o jogo atual e as artes novas; capturas e arquivos anteriores permanecem como registro histórico.

O chamado Cabo Baixo orienta a seleção dos mundos. Um mundo pode ter mais de uma tela; passagens explícitas interligam páginas do mesmo grafo de campanha. Praia começa com Cabo Baixo e Enseadinha. Cada tela mantém o caminho caminhável, com desvios visíveis e retorno claro.
