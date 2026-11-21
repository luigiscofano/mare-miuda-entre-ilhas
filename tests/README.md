# Testes

`npm test` roda a suíte do motor no Node.js. `npm run build` produz a versão web e o HTML offline. O motor não depende do render: reproduzir uma solução percorre exatamente as ações do jogo e rejeita comando bloqueado.

`python3 tests/browser_qa.py` é uma verificação opcional com a biblioteca Playwright do Python e Chromium local (módulo `playwright` e Chromium gerenciado pelo Playwright ou indicado pela variável `CHROMIUM_PATH`). Antes, rode o build. Cobre teclado, toque emulado, reinício, erros e versão offline; não equivale a aparelho físico, Safari ou sessão com novos jogadores.

Após o build, `npm run test:offline` carrega o módulo embutido com DOM e Canvas simulados, verificando comandos, desenho em pixels inteiros, bancada e travessia da praia sem rede. Também confere as dimensões e as coordenadas inteiras do recorte da marca. Isso não é teste de toque emulado nem teste visual no navegador. No Chromium e no WebKit, o teste compara os 447 pixels opacos do recorte com a Travessia, o Cabo Baixo e o Arquipélago, em desktop e em toque emulado (320 e 390 px).

Na fatia vertical, o teste de navegador de desktop visita a bifurcação, conclui a ilhota, recarrega com progresso, volta pelo atalho e chega aos créditos. A emulação de 320 e 390 pixels percorre a rota sem a ilhota. As verificações de teclado e toque não correspondem a Safari ou aparelho físico; ver o resultado no PR antes de afirmar que o workflow rodou. A suíte usa o Chromium do Playwright por padrão; a variável `CHROMIUM_PATH` permite apontar uma instalação local identificada.

No Mangue, o teste de navegador confirma que Reiniciar devolve o foco ao título da fase e que Espaço troca de siri sem gastar um passo, inclusive na tentativa seguinte.

## Lote 1: regressão e teste com pessoas

O motor reproduz as 11 soluções. Os testes do lote cobrem retorno conjunto sem colisão, garça e água no mesmo turno, troca gratuita, placa, as duas ordens dos mundos, acesso à Enseada e leitura de save v0.2. O fluxo Chromium percorre Praia, Recifes → Mangue em desktop e Mangue → Recifes em toque emulado, com reload e saída pelo atalho. O fluxo experimental WebKit usa servidor localhost no runner; mesmo se aprovado, não equivale ao Safari em aparelho físico.

Roteiro para 3–5 jogadores que ainda não conhecem o jogo (pendente): apresente só os controles; pergunte antes da primeira virada o que vai acontecer; observe se a pessoa consegue distinguir pedra/rocha sem ajuda, interpretar a perda de quem ficou parado, usar a placa e escolher a outra região após voltar ao mapa. Registre em que ponto pediu explicação. Num celular físico, valide menu, troca, botões, rolagem, som após um toque, reload e retorno sem perder o progresso. Não considere a arte nem a dificuldade fechadas antes dessas observações.

A revisão do mapa testa a unicidade das direções, curvas sem parada, ida e volta pelas mesmas trilhas, migração de posições antigas, portas, atalhos e acesso em ordens diferentes. O roteiro automatizado no navegador testa tecla repetida e cliques em trânsito, atualização do destino e das dicas, além da campanha existente. Aparelho físico e sessão com novos jogadores continuam pendentes.

A prova de moedas cobre vitória no passo final, derrota por orçamento, encerramento único, coleta sem duplicação e reinício. A interface automatizada joga a prova nas mesmas teclas e botões do jogador. A consulta visual de vizinhas é conferida contra o resultado real do motor nas soluções da campanha e da bancada.

Os cantos da travessia só realçam células bloqueadas ortogonais; a suíte verifica que não se espalham às diagonais ou a objetos distantes. A concha tem identificação apenas nas fases com essa meta. O processo de criação mantém os snapshots anteriores intactos.

Há 17 soluções de campanha e uma prova opcional da bancada. A expansão da Praia acrescenta testes do embarque legado, ida e volta entre telas, todos os bloqueios da nova rota, projeção de trilhas no Cabo Baixo e salva/carrega. O navegador verifica as seis fases novas em desktop e a rota principal em celular emulado, além de capturar as duas telas sem cursor. O teste humano e em aparelho físico continua pendente.

O lote da Enseada e das Ilhas tem seis testemunhas, busca independente no motor e prova de que os três puzzles das Ilhas ficam insolúveis sem as respectivas balsas. O teste de simultaneidade confirma que a garça avalia a posição após o transporte. Volta pelo porto, atalho, desbloqueios, recarga local e as 17 soluções anteriores também são cobertos.

`lote3.test.ts` reproduz as três soluções nas Grutas e faz busca exaustiva no motor com cada etapa substituída por chão firme, sem remover a saída ou o portão. Cobre mecanismos fora de ordem, passo bloqueado, reinício de estado e recarga de progresso. `browser_qa.py` também percorre as três fases por teclado e toque emulado.

O teste dos dois desvios comprova as rotas autorizadas, o portão sem gasto de turno, o rasante sobre o siri inativo e o transporte de quem ficou na balsa. Uma busca finita no mesmo motor descarta vitórias sem trocar de siri ou, na Deriva, sem balsa. As duas fases e as conclusões opcionais também passam por ida, volta e recarga.

A ampliação da dupla checa as duas novas testemunhas sem levadas, a impossibilidade de vitória sem trocar, a necessidade de cada balsa no desvio avançado e a persistência dos dois vértices opcionais. O roteiro Playwright joga ambos, recarrega no desvio concluído e retorna ao porto por teclado e toque emulado.

O Farol verifica a travessia com balsa e placa, a ausência de solução sem troca ou sem qualquer balsa, o portão sem gasto de passo, a patrulha sobre o inativo, a janela de dois passos para a troca no baixio, conclusão e recarga. O teste de navegador joga as dez fases do Farol por teclado e por toque emulado; as duas iniciais permanecem no mesmo ponto de entrada.

A ampliação de Recifes verifica 45 testemunhas de vitória, contagem de dez regulares e dois desvios, atalhos, atribuição única de direção no seletor e persistência de marcos em saves novos e antigos. O roteiro Playwright visita um regular e um opcional usando teclado e toque emulado, reinicia a página e confere que o opcional não altera a contagem. As verificações do navegador devem ser confirmadas no resultado do workflow.

## Mangue dos Siris Duplos ampliado

O motor percorre as 52 soluções da campanha sem levadas. A busca das sete novas fases confirma que não há vitória sem levadas com um dos siris imóvel; também verifica ausência de solução sem portão nas duas finais e o mínimo de trocas. O teste do mapa cobre ida, volta, teclas exclusivas, saves e saída legada para a Enseada. O roteiro Playwright usa teclado e toque emulado para trocar sem gastar passos, provocar uma levada no baixio, reiniciar, vencer e recarregar com o novo marco. Os resultados de navegadores constam da execução de CI.

## Enseada da Garça ampliada

Os chefes têm cobertura de rota mínima, recuperação sem reinício nos estados anteriores à derrota, refúgio alto, ataque ao siri inativo e persistência do ramal. O roteiro Playwright percorre as duas arenas com teclado e toque emulado.

O motor reproduz as 59 soluções sem levadas. Nas sete novas, uma rota que vence sem a garça é atingida quando a patrulha real está ativa. O teste também verifica marcos, volta, saves e a saída original para a Deriva. O roteiro Playwright cobre aviso, rasante, reinício, desvio seguro e recarga com teclado e toque emulado; confirme os resultados na CI.

## Ilhas à Deriva ampliadas

As 66 soluções vencem sem levadas. A busca usa o motor e confirma que remover qualquer balsa impede vencer sem levadas cada travessia nova. O teste da dupla verifica que os dois chegam ao cais na mesma virada e que proibir carona do inativo eleva o mínimo de 9 para 13 passos. O roteiro Playwright cobre a previsão, o tabuleiro de 15 colunas, a dupla, o transporte observado da posição e a recarga em teclado e toque emulado; os resultados constam da CI.

## Grutas da Espuma ampliadas

As soluções da campanha encerram sem levadas. A busca usa o motor e demonstra que omitir qualquer etapa impede vencer nas cinco novas travessias e que nenhuma das três duplas vence sem troca ou placa. O teste confirma que o siri que recolhe é o mesmo que encaixa, e que a alavanca exige o parceiro nas duas fases com as três etapas. O Playwright percorre coleta, encaixe, alavanca, fragmento e saída na fase final, com teclado e toque emulado; os resultados constam da CI.

## Baía da Ressaca ampliada

O motor reproduz as 79 rotas da campanha sem levadas. `ressaca-ampliada.test.ts` verifica dependência das balsas, troca e placa, e comprova os limites sem levadas de 20 e 22 passos nos desafios de três moedas. Verifica também as trilhas de ida e volta, a retomada de saves e a abertura do Farol pela rota anterior. O Playwright percorre o Cofre da vazante com teclado e toque emulado e confirma a vitória no último passo e o progresso após recarregar.

## Farol ampliado

A busca ordenada por passos repete o motor sem levadas e preserva o relógio da maré e da patrulha. Confere o contorno da vigia (19 passos ante 17 pela placa), o orçamento da costa (mínimo de 27), as travessias com quatro e três balsas indispensáveis e ambos os portões nos dois últimos desafios em dupla. A luz das duas marés requer no mínimo 34 passos; a solução publicada tem sete trocas e três fragmentos. O roteiro de navegador entra nos dois ramais, conclui a fase final, recarrega a posição com 10/10 e volta ao arquipélago. Toque é emulado; aparelho físico não foi testado.

## Arena Vento Sul

`vento-sul.test.ts` cobre a previsão de faixas, a imunidade da pedra alta, levada única por ameaças simultâneas, proteção da saída até firmar as três âncoras, chegada na alta, reinício, ida e volta e persistência sem bloqueio do Farol. O roteiro Playwright lê o aviso, provoca a primeira onda, reinicia e conclui a arena por teclado e toque emulado. A verificação em aparelho físico permanece pendente.

## Arena Ressaca Alta

O motor valida três ondas seguras seguidas, perda causada pelo siri inativo, retorno sem rebobinar a maré, proteção da pedra alta e dois alvos seguros. A rota ótima tem 34 passos; sem proteção das pedras são 36. O roteiro de navegador exercita os avisos, o reinício, a solução completa e a retomada da conclusão no mapa, com teclado e toque emulado. Save e entrada no Farol não exigem os chefes.

## Trio nas Grutas

Os testes verificam troca gratuita, ocupação das casas, placa mantida por um integrante inativo, transporte simultâneo de dois ocupantes de balsa e uma única levada quando os dois inativos são atingidos. A busca prova o mínimo de 19 passos, que todos os siris devem se mover e que o portão é indispensável para uma rota segura. O Playwright entra pelo desvio, confere posição e aviso do ativo, joga e recarrega a conclusão em teclado e toque emulado. O texto acessível foi inspecionado no DOM; o anúncio real com leitor de tela ainda não foi verificado.

## Trio na Baía e no Farol

`trio-avancado.test.ts` reproduz as soluções de 23 e 40 passos, busca alternativas sem levadas, desativa um siri ou mecanismo por vez e verifica ida, volta e save. O teste de navegador acompanha a carona do coral enquanto Verde anda, o transporte de pérola e a abertura do portão, e confirma as conclusões sem alterar a contagem regular. A emulação móvel continua distinta de um aparelho físico.

## Fauna

A suíte confere os hashes dos cinco quadros entregues e da folha, além dos bytes embutidos no HTML offline. O Playwright confere os pixels opacos de cada siri no Canvas, as insígnias e a mudança de patrulha para rasante no turno previsto, com teclado e toque emulado. O teste não substitui aparelho físico ou leitor de tela real.

## Última Virada

`ultima-virada.test.ts` confirma 48 passos sem levadas, contra 42 sem exigir placa, e cobre o risco antes da recompensa e a retomada do save. A busca reversa verifica 949.104 combinações de posições firmes em menos de um segundo localmente. O roteiro Playwright cobre a recusa da lente com a placa livre, a indicação da placa ocupada e o fechamento com os três siris por teclado e toque emulado.

## Vigia das ondas

Testa a onda atingindo areia firme, o refúgio protegendo, a rota de 16 passos sem levadas e a recuperação de todo estado alcançável sem derrota. O Playwright usa o desvio da Enseadinha, testa aviso e levada, reinicia, conclui, recarrega e retoma a rota anterior com teclado e toque emulado.

## Ponta da Ressaca

O teste reproduz a alternância das faixas, a proteção na pedra alta e as duas passagens obrigatórias em baixios de janelas diferentes. A busca encontra 22 passos e confere a recuperação de todos os estados sem derrota. O Playwright cobre a transição do Vigia para a segunda arena, os avisos de norte e sul, a vitória e a recarga com teclado e toque emulado.

## Chefes dos Recifes

`chefes-recifes.test.ts` audita as soluções de 19 e 31 passos, a recuperação após levadas, a ida/volta das comportas e o ramo opcional. O cenário de navegador cobre as duas vitórias, a mudança da passagem e a persistência sem alterar o contador regular. Consulte a CI para a evidência de teclado e toque emulado.

## Chefes das Ilhas à Deriva

`chefes-deriva.test.ts` valida as duas soluções, o menor total de passos, a necessidade de cada balsa, o vínculo de cada placa e a carona do siri inativo. A busca de recuperação inclui a posição anterior em terra firme, o ciclo da maré e até duas levadas. O teste de mapa verifica a rota antiga às Grutas, os desbloqueios opcionais e recarga sem contaminar a contagem regular. O roteiro Playwright cobre teclado, toque emulado pelo teste, avisos, ancoradouros, alagamento, reinício e recarga. Resultados de navegadores ficam na CI; toque emulado não é teste em aparelho físico.

## Chefes das Grutas da Espuma

`chefes-grutas.test.ts` verifica o relógio de cada peça, a exigência de mover os dois siris no Cofre, a recusa com a placa livre e a recuperação após até duas levadas. O mapa preserva o acesso à Baía, dez regulares e recarga. O roteiro Playwright cobre as duas arenas com teclado e toque emulado, incluindo recusa, reinício, conclusão, save e capturas sem cursor.

A fixture do desfecho parte do Salão das lanternas com cinco regulares concluídas. Ela testa a vitória em 34 passos, o desfecho com 6/10, a revisita após recarga, o retorno ao mesmo marco e a ausência de desfecho na preliminar. O HTML offline cobre o save v1 e igualdade da preferência de áudio; o roteiro Playwright acrescenta foco, teclado e toque emulado.

### Arte da Travessia da Praia

`arte-travessia-praia.test.ts` executa o renderizador com coordenadas inteiras e cores opacas. Verifica o escopo (Cabo Baixo e Enseadinha, não bancada ou Recifes), a areia molhada na baixa, os quatro cantos de um pixel na alta, a espuma e a concha. O teste de navegador percorre a primeira travessia com teclado e toque emulado, confere o recorte exato do siri e compara os pixels da maré. Com `MARE_CAPTURA_DIR` preenchido, salva os dois estados sem cursor. Aparelho físico não entra nessa verificação.

### Prévia da arte em Recifes e Mangue

`arte-recifes-mangue.test.ts` verifica que cada costa tem cor, concha e enfeites próprios e usa a grade nativa com cores opacas. Os testes distinguem a areia molhada e os quatro cantos da maré alta. Degraus da vazante e Janela partilhada servem de verificação no navegador, com teclado e toque emulado, e de captura sem cursor com `MARE_CAPTURA_DIR`. Os testes dos chefes continuam verificando as comportas e placas. Sem teste em aparelho físico.

### Prévia das travessias da Enseada e da Deriva

`arte-enseada-deriva.test.ts` verifica grade e cores nativas, quatro cantos dos baixios na alta, X de risco acima da areia, posição da balsa nas duas marés e conchas diferentes por tema. Em **Um passo antes da sombra** e **Balsas alternadas**, a verificação Playwright combina os pixels com o aviso da garça e o transporte na virada. Com `MARE_CAPTURA_DIR`, gera capturas sem cursor. Toque emulado não substitui teste em aparelho físico.

### Prévia das travessias das Grutas, da Baía e do Farol

`arte-grutas-ressaca-farol.test.ts` verifica o uso de pixels nativos, as oito paletas de travessia e a leitura da coleta da pérola, do fim do aviso da onda e da ponte depois que apaga. No navegador, **Uma pérola para o portão**, **Ressaca Alta** e **Guardião do Farol** verificam esses sinais com teclado e toque emulado. Com `MARE_CAPTURA_DIR`, geram capturas sem cursor. A bancada e os seletores não usam as paletas novas.

### Prévia do seletor de mundos Meia-Lua

`seletor-arquipelago.test.ts` verifica pintura nativa sem interpolação, recorte e posição do siri idênticos com ou sem o fundo e os mesmos nove marcos e oito trechos. O marco da Enseada só deixa de mostrar o cadeado após os dois percursos necessários. Playwright percorre o mapa nas duas ordens (Recifes primeiro ou Mangue primeiro) e confere o pixel do marco antes e depois da abertura. O teste offline compara os bytes do fundo copiado e embutido ao PNG original. O quadro de fallback usa o mapa anterior.

## Seletores da Praia das Conchas

`seletores-praia.test.ts` compara o Siri com a projeção anterior, o fundo do Cabo Baixo, os nove caminhos e dez vértices da Enseadinha e a leitura do bloqueio/desvio. O teste autônomo verifica os bytes dos três fundos de seleção empacotados. O percurso Playwright verifica a entrada nos dois mapas, o mapa travado e aberto após Fio de areia, os chefes e o save em desktop e toque emulado. Quadros nativos do renderizador no [caderno 34](../docs/processo-de-criacao/34-seletores-praia/README.md) são independentes de captura de navegador.

### Seletores de Recifes e Mangue

Os testes Node conferem grade inteira, recorte do siri, fallback sem imagem e os ramos existentes. O HTML autônomo carrega os dois PNGs originais byte a byte. O Playwright localiza os fundos no Canvas e percorre ramos, travas e saves após recarga, com teclado e toque emulado. Não conta como teste em dispositivo físico.

## Seletores da Enseada da Garça e das Ilhas à Deriva

`seletores-enseada-deriva.test.ts` verifica 15 vértices, 15 caminhos, os quadros com e sem fundo válido, o recorte do Siri e a troca visual de cadeado por areia aberta sem alterar o destino. O Playwright observa o mesmo antes e depois de vencer a fase exigida, em teclado e toque emulado. O build autônomo verifica os bytes de cada fundo PNG. Os quadros nativos do [caderno 36](../docs/processo-de-criacao/36-seletores-enseada-deriva/README.md) não substituem testes no navegador ou em aparelho físico.

## Seletores das Grutas, da Baía e do Farol

`seletores-mundos-finais.test.ts` verifica os vértices e ligações, o recorte do Siri, o fundo de contingência e a mudança de estado visual dos três acessos entre arenas. O Playwright valida essas passagens antes e depois da primeira arena de cada mundo, em desktop e toque emulado, e mantém a cobertura de desfecho e créditos. Os seis quadros do [caderno 37](../docs/processo-de-criacao/37-seletores-mundos-finais/README.md) são renderizações nativas, não substitutos de captura do navegador.
