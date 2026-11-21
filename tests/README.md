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

A prova de moedas cobre vitória no passo final, derrota por orçamento, encerramento único, coleta sem duplicação e reinício. A interface automatizada joga a prova nas mesmas teclas e botões do jogador. A consulta visual de vizinhas é conferida contra o resultado real do motor nas soluções das doze fases (onze de campanha mais o teste).

Os cantos da travessia só realçam células bloqueadas ortogonais; a suíte verifica que não se espalham às diagonais ou a objetos distantes. A concha tem identificação apenas nas fases com essa meta. O processo de criação mantém os snapshots anteriores intactos.

Há 17 soluções de campanha e uma prova opcional da bancada. A expansão da Praia acrescenta testes do embarque legado, ida e volta entre telas, todos os bloqueios da nova rota, projeção de trilhas no Cabo Baixo e salva/carrega. O navegador verifica as seis fases novas em desktop e a rota principal em celular emulado, além de capturar as duas telas sem cursor. O teste humano e em aparelho físico continua pendente.

O lote da Enseada e das Ilhas tem seis testemunhas, busca independente no motor e prova de que os três puzzles das Ilhas ficam insolúveis sem as respectivas balsas. O teste de simultaneidade confirma que a garça avalia a posição após o transporte. Volta pelo porto, atalho, desbloqueios, recarga local e as 17 soluções anteriores também são cobertos.

`lote3.test.ts` reproduz as três soluções nas Grutas e faz busca exaustiva no motor com cada etapa substituída por chão firme, sem remover a saída ou o portão. Cobre mecanismos fora de ordem, passo bloqueado, reinício de estado e recarga de progresso. `browser_qa.py` também percorre as três fases por teclado e toque emulado.

O teste dos dois desvios comprova as rotas autorizadas, o portão sem gasto de turno, o rasante sobre o siri inativo e o transporte de quem ficou na balsa. Uma busca finita no mesmo motor descarta vitórias sem trocar de siri ou, na Deriva, sem balsa. As duas fases e as conclusões opcionais também passam por ida, volta e recarga.

A ampliação da dupla checa as duas novas testemunhas sem levadas, a impossibilidade de vitória sem trocar, a necessidade de cada balsa no desvio avançado e a persistência dos dois vértices opcionais. O roteiro Playwright joga ambos, recarrega no desvio concluído e retorna ao porto por teclado e toque emulado.

O Farol verifica a travessia com balsa e placa, a ausência de solução sem troca ou sem qualquer balsa, o portão sem gasto de passo, a patrulha sobre o inativo, a janela de dois passos para a troca no baixio, conclusão e recarga. O teste de navegador joga as duas fases por teclado e por toque emulado.

A ampliação de Recifes verifica 45 testemunhas de vitória, contagem de dez regulares e dois desvios, atalhos, atribuição única de direção no seletor e persistência de marcos em saves novos e antigos. O roteiro Playwright visita um regular e um opcional usando teclado e toque emulado, reinicia a página e confere que o opcional não altera a contagem. As verificações do navegador devem ser confirmadas no resultado do workflow.

## Mangue dos Siris Duplos ampliado

O motor percorre as 52 soluções da campanha sem levadas. A busca das sete novas fases confirma que não há vitória sem levadas com um dos siris imóvel; também verifica ausência de solução sem portão nas duas finais e o mínimo de trocas. O teste do mapa cobre ida, volta, teclas exclusivas, saves e saída legada para a Enseada. O roteiro Playwright usa teclado e toque emulado para trocar sem gastar passos, provocar uma levada no baixio, reiniciar, vencer e recarregar com o novo marco. Os resultados de navegadores constam da execução de CI.

## Enseada da Garça ampliada

O motor reproduz as 59 soluções sem levadas. Nas sete novas, uma rota que vence sem a garça é atingida quando a patrulha real está ativa. O teste também verifica marcos, volta, saves e a saída original para a Deriva. O roteiro Playwright cobre aviso, rasante, reinício, desvio seguro e recarga com teclado e toque emulado; confirme os resultados na CI.

## Ilhas à Deriva ampliadas

As 66 soluções vencem sem levadas. A busca usa o motor e confirma que remover qualquer balsa impede vencer sem levadas cada travessia nova. O teste da dupla verifica que os dois chegam ao cais na mesma virada e que proibir carona do inativo eleva o mínimo de 9 para 13 passos. O roteiro Playwright cobre a previsão, o tabuleiro de 15 colunas, a dupla, o transporte observado da posição e a recarga em teclado e toque emulado; os resultados constam da CI.
