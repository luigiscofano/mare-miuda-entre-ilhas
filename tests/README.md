# Testes

`npm test` roda a suíte do motor no Node.js. `npm run build` produz a versão web e o HTML offline. O motor não depende do render: reproduzir uma solução percorre exatamente as ações do jogo e rejeita comando bloqueado.

`python3 tests/browser_qa.py` é uma verificação opcional com a biblioteca Playwright do Python e Chromium local (respectivamente módulo `playwright` e executável `chromium` no PATH ou variável `CHROMIUM_PATH`). Antes, rode o build. Cobre teclado, toque emulado, reinício, erros e versão offline; não equivale a aparelho físico, Safari ou sessão com novos jogadores.

Após o build, `npm run test:offline` carrega o módulo embutido com DOM e Canvas simulados, verificando comandos, desenho em pixels inteiros e as três fases sem rede. Isso não é teste de toque emulado nem teste visual no navegador.
