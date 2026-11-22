# Roteiro de produção

> **Meta atual da campanha:** 25 travessias regulares por mundo, além dos bônus e dos dois chefes de cada mundo. A [expansão](../campanha/expansao/README.md) acrescenta 123 provas de dificuldade gradual, com soluções verificadas no motor. Os marcos abaixo são históricos.

> **Leitura atualizada:** esta página conserva planejamento e atualizações históricos. A base do PR #72 já contém oito mundos, 77 entradas não opcionais, 16 chefes opcionais e 13 bônus/alternativas não-chefes. Consulte o [estado datado e os critérios de contagem](../processo-de-criacao/estado-atual.md) antes de interpretar expressões antigas como “planejado”, “futuro” ou “pendente”. Arte preliminar e lançamento continuam sujeitos à revisão. A trilha Notas Claras e suas sete variações integram uma proposta separada da base histórica; consulte [áudio](../../src/audio/README.md) para implementação e limites de teste.

| Marco | Entrega | Barreira antes de avançar |
| --- | --- | --- |
| Fundação | Repositório independente, contrato de turno, arquitetura e acordeões. | Exemplos claros de passo inválido, disputa de objetivos, maré e retorno. |
| Protótipo | Três mapas cinza, motor puro, arte mínima, toque, teclado, previsão e reinício. | Reproduzir soluções e casos de borda no motor; pessoas novas conseguem prever e explicar erros em sessão de teste. |
| Fatia vertical | Praia caminhável, tutorial, rota opcional, conclusão, salvamento, arte mínima, som e prévias das logos. | Voltar ao mapa, retomar progresso e concluir em celular sem ajuda externa. |
| Campanha | Mapas por lotes de mundos; regras ensinadas antes de combinação. | Solução no motor, rota principal e opcionais sem bloqueios, testes de regressão por lote. |
| Lançamento | Revisão de dificuldade, navegação, acessibilidade, performance, documentação e autorizações. | Campanha completa no teclado e no toque, save/reload, sem bloqueadores. Distinguir emulação, Safari e aparelho. |

**Abertos para teste:** se o indicador de um passo é suficiente; se esperar acrescenta estratégia; se três levadas criam margem justa; como a dupla retorna quando um deles erra; escala mais clara no celular. Fora de escopo nesta etapa: campanha, arte e música finais, coop simultânea, geração procedural e Pages.

**Validação manual de lançamento:** use o [roteiro por aparelho](../../tests/qa-manual.md) e registre versão e evidências. Safari físico e VoiceOver não são validados pelo CI.

## Revisão do plano

A campanha tem **oito mundos com no mínimo dez fases autorais (quinze como meta de expansão) e dois chefes por mundo**. Estrutura de produção, entrega começando pela Praia, navegação por marcos e requisitos de leitura/tema nas fases: [escopo e decisão de navegação](escopo-e-leitura.md).

A Baía da Ressaca alcança dez fases regulares, com seis em dupla. O Arquipélago do Farol também tem dez fases regulares. A Baía tem dois chefes opcionais: Vento Sul, com ancoragem, e Ressaca Alta, com sobrevivência em dupla. O trio estreia no desvio Três refúgios e volta em desafios mais difíceis na Baía e no Farol. O Guardião do Farol estreia com pontes de luz e três lentes. [Fichas da Baía](../processo-de-criacao/14-ressaca-ampliada/README.md).

O Farol tem duas arenas opcionais. O Guardião ensina pontes temporárias e três lentes; a Última Virada acrescenta três posições e controles dependentes. As arenas dos demais mundos e a revisão de lançamento continuam pendentes.

A Praia tem duas arenas opcionais: [Vigia das ondas](../processo-de-criacao/22-vigia-das-ondas/README.md) ensina a primeira faixa; [Ponta da Ressaca](../processo-de-criacao/23-ponta-da-ressaca/README.md) alterna norte e sul entre duas janelas da maré. Ponta da garça continua como encontro legado.

A Enseada ganha duas [arenas opcionais](../processo-de-criacao/26-chefes-enseada/README.md). As dez regulares da Enseada permanecem. A Deriva também ganhou [duas arenas opcionais](../processo-de-criacao/27-chefes-deriva/README.md), com desembarques sincronizados e carona inativa. As Grutas ganharam [duas arenas opcionais](../processo-de-criacao/28-chefes-grutas/README.md) com janelas de maré e placa em outra margem. O acesso à Baía não depende delas.

O desfecho revisitável fecha a rota narrativa no Farol, sem tornar o conteúdo opcional obrigatório. O progresso v1 já registra a vitória e permite reabrir os créditos sem trocar o save.
