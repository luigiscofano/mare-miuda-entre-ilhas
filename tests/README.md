# Testes

`npm test` roda a suíte do motor no Node.js. `npm run build` produz a versão web e o HTML offline. O motor não depende do render: reproduzir uma solução percorre exatamente as ações do jogo e rejeita comando bloqueado.

`python3 tests/browser_qa.py` é uma verificação opcional com a biblioteca Playwright do Python e Chromium local (módulo `playwright` e Chromium gerenciado pelo Playwright ou indicado pela variável `CHROMIUM_PATH`). Antes, rode o build. Cobre teclado, toque emulado, reinício, erros e versão offline; não equivale a aparelho físico, Safari ou sessão com novos jogadores.

Após o build, `npm run test:offline` carrega o módulo embutido com DOM e Canvas simulados, verificando comandos, desenho em pixels inteiros, bancada e travessia da praia sem rede. Isso não é teste de toque emulado nem teste visual no navegador.

Na fatia vertical, o teste de navegador de desktop visita a bifurcação, conclui a ilhota, recarrega com progresso, volta pelo atalho e chega aos créditos. A emulação de 320 e 390 pixels percorre a rota sem a ilhota. As verificações de teclado e toque não correspondem a Safari ou aparelho físico; ver o resultado no PR antes de afirmar que o workflow rodou. A suíte usa o Chromium do Playwright por padrão; a variável `CHROMIUM_PATH` permite apontar uma instalação local identificada.

## Lote 1: regressão e teste com pessoas

O motor reproduz as 11 soluções. Os testes do lote cobrem retorno conjunto sem colisão, garça e água no mesmo turno, troca gratuita, placa, as duas ordens dos mundos, acesso à Enseada e leitura de save v0.2. O fluxo Chromium percorre Praia, Recifes → Mangue em desktop e Mangue → Recifes em toque emulado, com reload e saída pelo atalho. O fluxo experimental WebKit usa servidor localhost no runner; mesmo se aprovado, não equivale ao Safari em aparelho físico.

Roteiro para 3–5 jogadores que ainda não conhecem o jogo (pendente): apresente só os controles; pergunte antes da primeira virada o que vai acontecer; observe se a pessoa consegue distinguir pedra/rocha sem ajuda, interpretar a perda de quem ficou parado, usar a placa e escolher a outra região após voltar ao mapa. Registre em que ponto pediu explicação. Num celular físico, valide menu, troca, botões, rolagem, som após um toque, reload e retorno sem perder o progresso. Não considere a arte nem a dificuldade fechadas antes dessas observações.

A revisão do mapa testa a unicidade das direções, curvas sem parada, ida e volta pelas mesmas trilhas, migração de posições antigas, portas, atalhos e acesso em ordens diferentes. O roteiro automatizado no navegador testa tecla repetida e cliques em trânsito, atualização do destino e das dicas, além da campanha existente. Aparelho físico e sessão com novos jogadores continuam pendentes.

A prova de moedas cobre vitória no passo final, derrota por orçamento, encerramento único, coleta sem duplicação e reinício. A interface automatizada joga a prova nas mesmas teclas e botões do jogador. A consulta visual de vizinhas é conferida contra o resultado real do motor nas soluções das doze fases (onze de campanha mais o teste).

Os cantos da travessia só realçam células bloqueadas ortogonais; a suíte verifica que não se espalham às diagonais ou a objetos distantes. A concha tem identificação apenas nas fases com essa meta. O processo de criação mantém os snapshots anteriores intactos.

Há 17 soluções de campanha e uma prova opcional da bancada. A expansão da Praia acrescenta testes do embarque legado, ida e volta entre telas, todos os bloqueios da nova rota, projeção de trilhas no Cabo Baixo e salva/carrega. O navegador verifica as seis fases novas em desktop e a rota principal em celular emulado, além de capturar as duas telas sem cursor. O teste humano e em aparelho físico continua pendente.

O lote da Enseada e das Ilhas tem seis testemunhas, busca independente no motor e prova de que os três puzzles das Ilhas ficam insolúveis sem as respectivas balsas. O teste de simultaneidade confirma que a garça avalia a posição após o transporte. Volta pelo porto, atalho, desbloqueios, recarga local e as 17 soluções anteriores também são cobertos.
