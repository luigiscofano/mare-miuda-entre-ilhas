# Maré Miúda: Entre Ilhas

*Tiny Tide: Between Islands*

Quebra-cabeça de aventura por turnos: um siri atravessa ilhas onde a água sobe ou desce a cada três passos válidos. A Praia das Conchas tem dez fases autorais (seis principais e quatro opcionais) e o encontro Ponta da garça em duas telas conectadas: Cabo Baixo e Enseadinha. Na Enseadinha, suba depois de Fio de areia para enfrentar [Vigia das ondas](docs/processo-de-criacao/22-vigia-das-ondas/README.md) e, depois, [Ponta da Ressaca](docs/processo-de-criacao/23-ponta-da-ressaca/README.md). Os dois chefes são opcionais. Recifes Expostos tem dez travessias regulares, dois desvios e [dois chefes opcionais](docs/processo-de-criacao/24-chefes-recifes/README.md). O Mangue dos Siris Duplos tem dez travessias regulares, todas em dupla. A Enseada da Garça e as Ilhas à Deriva têm dez regulares e dois desvios em dupla cada. As Ilhas à Deriva também têm [duas arenas opcionais](docs/processo-de-criacao/27-chefes-deriva/README.md). As Grutas da Espuma têm dez regulares, cinco em dupla, e [duas arenas opcionais](docs/processo-de-criacao/28-chefes-grutas/README.md): Sentinela da Gruta e Cofre das Espumas. A Baía da Ressaca tem dez regulares, seis em dupla, e dois chefes opcionais: Vento Sul e Ressaca Alta. O protótipo cinza de três travessias continua na bancada de testes e no histórico. É um projeto independente: não altera o Miudezas nem carrega seu código, seus recursos ou suas partidas salvas.

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

[Siris duplos em outros mundos](docs/processo-de-criacao/09-siris-duplos/README.md) registra as primeiras provas jogáveis e a ampliação dos desvios da Enseada e da Deriva. [Grutas e Ressaca em dupla](docs/processo-de-criacao/10-duplas-grutas-ressaca/README.md) acompanha as quatro fases regulares. [Farol em dupla](docs/processo-de-criacao/11-farol-dupla/README.md) registra duas fases regulares e o encaixe entre balsas, baixios e patrulha.

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

O núcleo combina contagem de passos, leitura espacial e previsão. O jogador não precisa correr: decisões de água e ameaça só andam em passos válidos. A bancada e a praia não têm botão de esperar. No mapa de seleção, cada comando escolhe uma saída e o siri percorre a trilha até o próximo marco, sem consumir passos de maré. A movimentação em grade fica dentro das fases. Volta à casa firme e limite de três levadas são hipóteses a testar com jogadores.

</details>

---

<details>
<summary>Campanha e mapa-múndi</summary>

Na fatia vertical a Praia das Conchas já é caminhável: rota principal e ramo da Ilhota Perolada abrem trilhas no mapa. O arquipélago permite Recifes e Mangue em qualquer ordem depois da Praia. Depois das duas regiões, a rota inicial da Enseada oferece três travessias com patrulha; a última delas abre as Ilhas à Deriva. Sete regulares novas da Enseada ficam em um ramo distinto, com uma conclusão em dupla. [Fichas da Enseada ampliada](docs/processo-de-criacao/11-enseada-ampliada/README.md). Depois de Corrida ao farol baixo, o [desvio dos chefes da Enseada](docs/processo-de-criacao/26-chefes-enseada/README.md) abre duas arenas opcionais com rasantes; a rota para a Deriva não muda. As Ilhas à Deriva têm um ramo de sete regulares com cais de ida e volta, balsas alternadas e uma travessia em dupla. [Fichas da Deriva ampliada](docs/processo-de-criacao/12-deriva-ampliada/README.md). Após Corrente cruzada, siga à direita para Mestre das Correntes e desça, depois de vencê-lo, para Passagem das Balsas. O [caderno das arenas da Deriva](docs/processo-de-criacao/27-chefes-deriva/README.md) reúne capturas, rotas e regras. Corrente cruzada continua a liberar as três primeiras travessias das Grutas da Espuma, com pérola, encaixe, alavanca e portão. O plano prevê oito mundos, com pelo menos 10 fases por mundo fora dos dois chefes (15 fases por mundo como meta de expansão). Os ramos são opcionais na rota principal. A dupla de siris de cores diferentes reaparece em dois desvios regulares da Enseada e dois das Ilhas e volta nas Grutas e na Baía da Ressaca. Nas Grutas, o ramo novo parte da primeira travessia e acrescenta dois desafios solo e três em dupla, sem condicionar a abertura da Baía. [Fichas das Grutas ampliadas](docs/processo-de-criacao/13-grutas-ampliadas/README.md). O desvio [Três refúgios](docs/processo-de-criacao/18-trio-grutas/README.md) estreia o trio sem alterar as dez regulares e a passagem para a Baía. O Farol agora tem dez regulares, sete em dupla. Depois de As duas luzes do farol, a bifurcação separa os quatro desafios da costa norte da rota dos guardiões e da travessia final. [Fichas do Farol ampliado](docs/processo-de-criacao/15-farol-ampliado/README.md). Na Baía, o ramo norte acrescenta quatro solos e quatro duplas, incluindo dois desafios de três moedas no limite de passos. O embarque para o Farol segue a rota original. [Fichas da Ressaca ampliada](docs/processo-de-criacao/14-ressaca-ampliada/README.md). Depois de Cofre da vazante, siga à esquerda para [Vento Sul](docs/processo-de-criacao/16-vento-sul/README.md), uma arena de ondas em faixas e ancoradouros que só firmam na baixa. Vencer Vento Sul libera [Ressaca Alta](docs/processo-de-criacao/17-ressaca-alta/README.md), em que a dupla precisa sobreviver a três ondas seguidas e ocupar dois destinos. O trio também aparece em [Eco dos três cais e Três luzes em revezamento](docs/processo-de-criacao/19-trio-avancado/README.md), dois desvios que aumentam a dificuldade de 23 a 40 passos. Concluir **A luz das duas marés** encerra a história mesmo com 6/10 regulares no Farol. Use **Ver desfecho** após a vitória ou **Rever desfecho** no mapa do Farol. Os chefes, os desvios e a exploração continuam opcionais. Ao vencer o Guardião do Farol, o trio pode enfrentar a [Última Virada](docs/processo-de-criacao/21-ultima-virada/README.md), em que cada lente depende de outro siri na placa correspondente. Cada ilha terá tema tanto no arquipélago como dentro das fases; obstáculos ocupam células inteiras em uma malha legível, sem tamanho máximo por objeto. A arte prevê destacar a célula atual e as vizinhas válidas conforme o motor. [Revisão do roteiro](docs/producao/escopo-e-leitura.md). [Plano dos mundos](docs/campanha/README.md) · [Matriz de game design e level design](docs/campanha/matriz.md).

</details>

---

<details>
<summary>Level design e soluções</summary>

A campanha parte de um tutorial acessível na Praia, passa por lógica leve e combinação de regras, e chega a mapas maiores com escolhas consequentes, fuga e chefes por turnos. A bancada inclui uma prova independente de três moedas com orçamento de passos. Na Baía, a mesma regra volta em duas travessias da campanha. [Curva de dificuldade](docs/producao/escopo-e-leitura.md#curva-de-dificuldade-da-campanha).


Passagem da primeira onda, A sombra da garça e Busca e volta. Essas três fases estão na bancada e também na rota da praia. A praia acrescenta O segredo da ilhota e A ponta da garça. Recifes tem dez travessias regulares e dois desvios. O ramo norte parte do primeiro marco; a saída para a Enseada continua dependendo das três travessias históricas de Recifes e das três do Mangue, sem exigir o ramo novo. [Fichas dos Recifes ampliados](docs/processo-de-criacao/09-recifes-ampliados/README.md). O Mangue acrescenta sete regulares em um ramo após Raízes vizinhas, sem substituir o percurso original. [Fichas do Mangue ampliado](docs/processo-de-criacao/10-mangue-ampliado/README.md). Cada mapa tem objetivo, instrução e solução reproduzível no motor. [Diagramas e soluções](src/fases/README.md).

</details>

---

<details>
<summary>Artes conceituais</summary>

Os estudos PT/EN ficam preservados separadamente. A Placa de Areia (A) foi aprovada para a abertura em português; a Corrente de Espuma (B) continua no acervo como estudo. Estudos e capturas reais têm rótulos distintos no Processo de criação.

</details>

---

<details>
<summary>Artes do jogo e animação</summary>

A concha tem um brilho de pixels chapados e identificação textual. Os cantos de bloqueio marcam apenas vizinhos ortogonais, sem cobrir o cenário inteiro. A [direção futura dos mapas de seleção](docs/producao/escopo-e-leitura.md#grades-visuais-do-arquipélago-e-dos-seletores) é independente da grade de travessia.


Na bancada, a arte cinza lê terreno, maré e previsão de ameaça. A Praia, os Recifes e o Mangue usam paletas experimentais. A densidade do cenário e do arquipélago segue em revisão; a Placa de Areia da abertura foi mantida. O siri principal é o recorte nativo da Placa de Areia na Travessia, na bancada e nos seletores, sem trocar a arte dos mapas. Verde e Amarelo são o mesmo recorte em outras paletas: insígnias acima dos sprites identificam cada um também sem cor. A nova garça aparece na previsão, em patrulha ou rasante, sem cobrir o X no tabuleiro. [Fauna e capturas](docs/arte/fauna/README.md). Os fragmentos permanecem em matrizes de pixels editáveis em TypeScript. Nenhum recurso do jogo original é importado. [Guia de arte](docs/arte/README.md).

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

Os testes cobrem as 98 soluções da campanha, incluindo duas arenas de chefe em cada um dos mundos Praia, Recifes, Baía e Farol, o relógio compartilhado da dupla, as duas ordens dos mundos e passos limítrofes, rejeição de movimentos, eventos simultâneos, terceiro erro, inventário, reinício, rotas do mapa e persistência. O teste offline carrega o HTML final em DOM/Canvas simulados e verifica tanto a bancada quanto o mapa. Teclado e toque têm caminhos equivalentes; mapa em texto, foco visível, padrões e indicadores não dependem de cor. [Cobertura e limites](tests/README.md). [Fichas e decisões das Grutas](docs/processo-de-criacao/08-grutas/README.md).

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

