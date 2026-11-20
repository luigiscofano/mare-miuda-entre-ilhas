# Maré Miúda: Entre Ilhas

*Tiny Tide: Between Islands*

Quebra-cabeça de aventura por turnos: um siri atravessa ilhas onde a água sobe ou desce a cada três passos válidos. A fatia vertical Praia das Conchas tem um mapa caminhável com cinco desafios. O primeiro lote acrescenta seis travessias autorais em Recifes Expostos e Mangue dos Dois Siris. O protótipo cinza de três travessias continua na bancada de testes e no histórico. É um projeto independente: não altera o Miudezas nem carrega seu código, seus recursos ou suas partidas salvas.

**Estado:** Fundação e protótipo preservados; fatia vertical Praia das Conchas e primeiro lote de campanha implementados para teste. A abertura usa Placa de Areia aprovada; o restante da arte e do áudio ainda é provisório. Não existe publicação do jogo nesta fase.

[Como jogar localmente](#como-jogar-localmente) · [Regras](#regras) · [Produção](docs/producao/README.md) · [Campanha](docs/campanha/README.md) · [Fases e soluções](src/fases/README.md) · [Processo de criação](docs/processo-de-criacao/README.md)

## Como jogar localmente

Com Node.js 24 ou posterior, execute na raiz:

```sh
npm test
npm run build
npm run test:offline
```

Abra `dist/mare-miuda-prototipo.html` no navegador para jogar sem conexão. A outra opção é executar `npm run serve` (requer Python 3) e abrir `http://127.0.0.1:4173`. O protótipo não precisa instalar dependências para compilar ou rodar os testes de motor.

<a id="regras"></a>

## Documentação

<details>
<summary>Processo de criação</summary>

1. [Fundação](docs/processo-de-criacao/01-fundacao/README.md): regras, decisões de arquitetura e plano dos mundos.
2. [Protótipo cinza](docs/processo-de-criacao/02-prototipo/README.md): HTML autônomo v0.1.0 preservado, fichas, soluções e alcance dos testes.
3. [Fatia vertical: Praia das Conchas](docs/processo-de-criacao/03-fatia-vertical/README.md): mapa, trilhas, arte provisória, edição de áudio, salvamento e encontro de encerramento.
4. [Primeiro lote: Recifes e Mangue](docs/processo-de-criacao/04-lote-1/README.md): arquipélago, pedra alta, dois fragmentos, dupla, placa e porta.

[Índice permanente do processo](docs/processo-de-criacao/README.md), com os estudos de identidade mantidos à parte. O material histórico não entra no build.

</details>

---

<details>
<summary>Sobre e origem</summary>

O jogo parte da ideia de maré do minigame Maré Miúda. Neste repositório, o estado, as fases e a renderização têm implementação nova, sem dependência do original. Nomes de trabalho: Maré Miúda: Entre Ilhas e Tiny Tide: Between Islands.

</details>

---

<details>
<summary>Regras e controles</summary>

Setas, WASD ou botões de toque movem uma casa. R ou Reiniciar recomeça. Passos bloqueados, pausa e seleção não mudam a maré. Três passos válidos sobem a maré; mais três descem. Baixio coberto bloqueia. A água e a garça são avaliadas antes da coleta e da vitória. Um erro leva o siri à última casa firme, sem rebobinar o ciclo; a terceira levada encerra a tentativa. Um turno nunca soma dois erros. [Contrato do motor](src/motor/README.md).

</details>

---

<details>
<summary>Game design</summary>

O núcleo combina contagem de passos, leitura espacial e previsão. O jogador não precisa correr: decisões de água e ameaça só andam em passos válidos. A bancada e a praia não têm botão de esperar. Na praia, caminhos são descobertos andando pelo mapa, sem consumir passos de maré. Volta à casa firme e limite de três levadas são hipóteses a testar com jogadores.

</details>

---

<details>
<summary>Campanha e mapa-múndi</summary>

Na fatia vertical a Praia das Conchas já é caminhável: rota principal e ramo da Ilhota Perolada abrem trilhas no mapa. O arquipélago permite Recifes e Mangue em qualquer ordem depois da Praia. Depois das duas regiões surge a passagem da Enseada, que ainda não tem fases. O plano completo prevê oito mundos. [Plano dos mundos](docs/campanha/README.md).

</details>

---

<details>
<summary>Level design e soluções</summary>

Passagem da primeira onda, A sombra da garça e Busca e volta. Essas três fases estão na bancada e também na rota da praia. A praia acrescenta O segredo da ilhota e A ponta da garça. Recifes e Mangue têm três fases cada, com novas travessias e uma resolução final. Cada mapa tem objetivo, instrução e solução reproduzível no motor. [Diagramas e soluções](src/fases/README.md).

</details>

---

<details>
<summary>Artes conceituais</summary>

Os estudos PT/EN ficam preservados separadamente. A Placa de Areia (A) foi aprovada para a abertura em português; a Corrente de Espuma (B) continua no acervo como estudo. Estudos e capturas reais têm rótulos distintos no Processo de criação.

</details>

---

<details>
<summary>Artes do jogo e animação</summary>

Na bancada, a arte cinza lê terreno, maré e previsão de ameaça. A Praia, os Recifes e o Mangue usam paletas experimentais. A densidade do cenário e do arquipélago segue em revisão; a Placa de Areia da abertura foi mantida. O desenho do siri e do fragmento são matrizes de pixels editáveis em TypeScript. Nenhum recurso do jogo original é importado. [Guia de arte](docs/arte/README.md).

</details>

---

<details>
<summary>Identidade visual</summary>

Placa de Areia (opção A) na abertura, em grade original de 180 × 94 pixels, com escala inteira sem suavização. A variante inglesa e as versões compactas ficam no acervo dos estudos; o jogo ainda não tem seleção de idioma. A paleta e a grade das demais artes ainda são provisórias.

</details>

---

<details>
<summary>Áudio e trilha</summary>

A praia usa um tema original provisório sintetizado por Web Audio e sinais diferentes de subida/descida, erro, coleta e vitória. Música e efeitos têm volumes independentes e persistentes. Forma, padrões e texto ensinam as regras sem depender de áudio. Ver [áudio](src/audio/README.md).

</details>

---

<details>
<summary>Arquitetura e fluxo</summary>

Entrada traduz o comando → motor puro resolve o turno → interface publica o novo estado → Canvas desenha. O índice de fases e o validador usam os mesmos dados e regras. A animação futura será declarativa e não contará turnos. [Contrato do motor](src/motor/README.md).

</details>

---

<details>
<summary>Linguagem e ferramentas</summary>

TypeScript, HTML semântico, CSS e Canvas 2D; Node.js 24 no script de build e nos testes. O protótipo é web estático, sem servidor de jogo ou conta. Python 3 é opcional para o servidor de desenvolvimento e para as verificações de navegador.

</details>

---

<details>
<summary>Código e estrutura de pastas</summary>

- `src/motor/`: estado, regras e eventos.
- `src/fases/`, `src/validacao/`: mapas, soluções e validação por reprodução.
- `src/entrada/`, `src/interface/`, `src/render/`: controles, estado perceptível e arte provisória.
- `tests/`, `scripts/` e `docs/`: testes, build e cadernos de produção.
- `src/campanha/`, `src/persistencia/` e `src/audio/` implementam a praia, o save isolado e o tema/sinais. Não dependem do Miudezas.

</details>

---

<details>
<summary>Como rodar e publicar</summary>

Veja [Como jogar localmente](#como-jogar-localmente). O build produz uma versão modular em `dist/index.html` e um HTML autônomo para teste. Deploy e merge não são disparados pelo build; a publicação é uma etapa deliberada após aprovação. O GitHub Actions roda verificações e produz capturas como artefatos quando os testes de navegador passam, sem publicar.

</details>

---

<details>
<summary>Testes e acessibilidade</summary>

Os testes cobrem as onze soluções, o relógio compartilhado da dupla, as duas ordens dos mundos e passos limítrofes, rejeição de movimentos, eventos simultâneos, terceiro erro, inventário, reinício, rotas do mapa e persistência. O teste offline carrega o HTML final em DOM/Canvas simulados e verifica tanto a bancada quanto o mapa. Teclado e toque têm caminhos equivalentes; mapa em texto, foco visível, padrões e indicadores não dependem de cor. [Cobertura e limites](tests/README.md).

</details>

---

<details>
<summary>Produção e roteiro</summary>

Fundação → protótipo → fatia vertical → campanha em lotes → lançamento. Não há geração procedural ou coop simultânea no escopo inicial. [Critérios de passagem](docs/producao/README.md).

</details>

---

<details>
<summary>Referências</summary>

[Implementação de Maré Miúda no Miudezas](https://github.com/luigiscofano/Miudezas/blob/main/dist/quintal.js), consultada apenas como referência. Pokémon Black and White é referência futura de legibilidade e densidade, sem uso de mapas, sprites, marcas ou paletas originais.

</details>

---

<details>
<summary>Créditos e direitos autorais</summary>

Projeto de Luigi Scofano de Araujo. O protótipo e a fatia vertical não incorporam sprites, código, fontes baixadas ou sons de terceiros. O navegador usa a fonte de sistema. Documentar autoria, origem e licenças ao incorporar recursos.

</details>

---

**© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.**
