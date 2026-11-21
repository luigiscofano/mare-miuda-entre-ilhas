# Estado documentado da base jogável

[README principal](../../README.md) · [Processo de criação](README.md) · [Acervo visual](acervo-visual/README.md)

## Conferência posterior: prévia privada

A leitura abaixo permanece como registro do PR #72. Mais tarde, o [PR #75](https://github.com/luigiscofano/mare-miuda-entre-ilhas/pull/75) integrou ao rascunho as oito faixas aprovadas de **Siri na Areia — Notas Claras**. O [CI do PR #77](https://github.com/luigiscofano/mare-miuda-entre-ilhas/actions/runs/44938701024) passou e gerou um ZIP privado. A contagem da campanha não mudou. Teste manual de Safari/VoiceOver no iPhone físico e publicação seguem pendentes.

## Referência desta leitura

Base exata: [PR #72](https://github.com/luigiscofano/mare-miuda-entre-ilhas/pull/72), commit `ffe041cd996b7414b49b77417a6cc1ba1016dd48`, árvore `30d0a52ddda197c7bf966d269bd5cf115a49acc4`. Conferência em 21/11/2026. O PR estava aberto, sem merge. Este documento descreve a proposta local desse commit, **não uma versão lançada**. Nenhuma publicação, integração ou alteração de jogo decorre desta consolidação.

## Conteúdo existente, não apenas planejado

Os oito mundos têm fases implementadas e soluções verificáveis. O catálogo `TODAS_AS_FASES` contém **106 IDs únicos**:

| Categoria documental | Quantidade | Critério |
| --- | ---: | --- |
| Entradas não opcionais | 77 | Soma de `totalDeFasesRegulares` das nove telas regionais: Cabo Baixo 4, Enseadinha 3 e dez em cada um dos outros sete mundos. Inclui o encontro legado Ponta da garça. |
| Arenas opcionais de chefe | 16 | Dois por mundo; IDs com `-chefe-`. |
| Bônus/alternativas não-chefes | 13 | Entradas opcionais restantes da campanha, inclusive desvios em dupla e trio. |
| Total do catálogo da campanha | 106 | 77 + 16 + 13, sem duplicar IDs. |

Os oito mundos são Praia das Conchas, Recifes Expostos, Mangue dos Siris Duplos, Enseada da Garça, Ilhas à Deriva, Grutas da Espuma, Baía da Ressaca e Arquipélago do Farol. A Praia tem dois seletores, Cabo Baixo e Enseadinha: são **nove telas regionais para oito mundos**, além do mapa do arquipélago.

A classificação acima segue o acesso real nos mapas. A expressão histórica “80 regulares” vem da meta editorial de dez travessias por mundo e não coincide com o contador operacional: por exemplo, a Praia possui opcionais que não entram no helper. Não se deve apresentar 80 como total de entradas não opcionais entregues.

A bancada `FASES_BANCADA` possui quatro testes: três reaproveitam IDs de campanha e um é exclusivo da bancada. Não se adicionam quatro ao total de 106.

Fontes: [catálogo](../../src/fases/index.ts), [campanha](../../src/campanha/index.ts), [teste de total e soluções](../../tests/farol-ampliado.test.ts) e [matriz de design](../campanha/matriz.md). A meta de quinze regulares por mundo continua uma expansão, não uma entrega.

## Arte: aprovação não é sinônimo de presença no código

| Elemento | Situação registrada nesta base | Referência |
| --- | --- | --- |
| Marca Placa de Areia A | Aprovada e aplicada na abertura. As variantes EN/compactas são acervo, não seletor de idioma. | [Arte](../arte/README.md) |
| Siri canônico e trio | Recursos de fauna usados pelo jogo, com recorte e paletas documentados. | [Fauna](../arte/fauna/README.md) |
| Cabo Baixo | Fundo aprovado em 192 × 144, aplicado com sinais dinâmicos separados. | [Seletores da Praia](34-seletores-praia/README.md) |
| Travessias da Praia | Direção V32 aprovada e aplicada; prancha conceitual identificada separadamente das capturas. | [Caderno 29](29-travessia-praia/README.md) |
| Travessias dos outros sete mundos | Prévias jogáveis para revisão, não aprovação final inferida. | [30](30-travessias-recifes-mangue/README.md), [31](31-travessias-enseada-deriva/README.md), [32](32-travessias-grutas-ressaca-farol/README.md) |
| Meia-Lua e demais seletores | Propostas aplicadas à base de teste, com rotas e cadeados existentes. A presença no PR não certifica aprovação final. | [33](33-seletor-arquipelago/README.md), [34](34-seletores-praia/README.md), [35](35-seletores-recifes-mangue/README.md), [36](36-seletores-enseada-deriva/README.md), [37](37-seletores-mundos-finais/README.md) |
| Estudos de marca e litoral | Acervo histórico preservado na documentação; não se sobrepõe à arte atual. | [Inventário e proveniência](acervo-visual/README.md) |
| Áudio | Provisório nesta base. Trabalhos paralelos posteriores não estão incluídos nesta leitura. | [README principal](../../README.md) |

## Leitura do histórico e pendências

Os cadernos são cumulativos. Quando uma etapa antiga diz “três testes”, “futuro” ou “primeiro lote”, descreve aquele momento; não invalida as entregas posteriores. Os textos originais foram preservados. Esta página é o resumo datado, não substitui a ficha de regras ou a fonte da fase.

Continuam pendentes a revisão final das propostas visuais, o áudio definitivo, a revisão de lançamento e os testes em dispositivos físicos. Os 340 arquivos do acervo estão preservados na documentação com hashes e links imutáveis de proveniência; a cópia histórica fica fora do build. Não há mudança no Miudezas, em regras, saves, build ou publicação.
