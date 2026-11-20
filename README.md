# Maré Miúda: Entre Ilhas

*Tiny Tide: Between Islands*

Quebra-cabeça de aventura por turnos: um siri atravessa ilhas onde a água sobe ou desce a cada três passos válidos. Este protótipo cinza testa o núcleo em três travessias curtas. É um projeto independente: não altera o Miudezas nem carrega seu código, seus recursos ou suas partidas salvas.

**Estado:** Fundação e protótipo, com arte provisória. A campanha, a identidade e o áudio finais são etapas futuras.

[Como jogar localmente](#como-jogar-localmente) · [Regras](#regras) · [Produção](docs/producao/README.md) · [Campanha](docs/campanha/README.md) · [Fases e soluções](src/fases/README.md)

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

O núcleo combina contagem de passos, leitura espacial e previsão. O jogador não precisa correr: decisões de água e ameaça só andam em passos válidos. O protótipo não tem botão de esperar. Volta à casa firme e limite de três levadas são hipóteses a testar com jogadores.

</details>

---

<details>
<summary>Campanha e mapa-múndi</summary>

Planejado: oito mundos, mapa caminhável ramificado, ilhas opcionais e retorno por atalhos. Nenhum progresso da campanha foi implementado no protótipo. A transição da Praia abre Recifes e Mangue em qualquer ordem. [Plano dos mundos](docs/campanha/README.md).

</details>

---

<details>
<summary>Level design e soluções</summary>

Passagem da primeira onda, A sombra da garça e Busca e volta. Cada mapa tem objetivo, instrução e solução reproduzível no motor. [Diagramas e soluções](src/fases/README.md).

</details>

---

<details>
<summary>Artes conceituais</summary>

Pranchas são registradas como estudos, separadas das capturas do jogo. As [Travessias V8](docs/processo-de-criacao/identidade-visual/21-travessias-v8/README.md) comparam maré baixa e alta em Fio de Areia e Acima da Espuma e incluem o catálogo conceitual de conchas. Os [seletores V6 e as Travessias V7](docs/processo-de-criacao/identidade-visual/20-seletores-v6-travessias-v7/README.md) reúnem os oito mapas de seleção redesenhados, duas Travessias com água mais calma e as fontes para reproduzir as prévias. Os [estudos litorais V5](docs/processo-de-criacao/identidade-visual/19-estudos-litorais-v5/README.md) reúnem oito seletores temáticos e duas Travessias com mar e terreno próprios para cada mundo. Os [estudos litorais V4](docs/processo-de-criacao/identidade-visual/18-estudos-litorais-v4/README.md) exploram uma nova Travessia e seletores para os oito mundos. A [terceira rodada ortogonal](docs/processo-de-criacao/identidade-visual/17-estudo-ortogonal-v3/README.md) detalha texturas, relevo e luz. A [segunda rodada ortogonal](docs/processo-de-criacao/identidade-visual/16-estudo-ortogonal-v2/README.md) explora relevo, luz e uma grade mais detalhada. Veja o [estudo ortogonal do Caminho das Conchas e da Travessia](docs/processo-de-criacao/identidade-visual/15-estudo-ortogonal/README.md).

</details>

---

<details>
<summary>Artes do jogo e animação</summary>

No protótipo, a arte cinza lê terreno, maré e previsão de ameaça. O desenho do siri e do fragmento são matrizes de pixels editáveis em TypeScript. Nenhum recurso do jogo original é importado. [Guia de arte](docs/arte/README.md).

</details>

---

<details>
<summary>Identidade visual</summary>

Planejada: pixel art com bordas duras, paleta própria e variações de logo PT/EN e compacta. A grade final será escolhida na fatia vertical depois de conferir a leitura no tamanho real.

</details>

---

<details>
<summary>Áudio e trilha</summary>

Não implementados nesta entrega. A música e os sinais da maré terão volumes separados; forma, padrões e texto informarão as regras sem depender de som.

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
- Mapa, persistência e áudio terão módulos separados na fatia vertical em vez de se acoplarem ao motor.

</details>

---

<details>
<summary>Como rodar e publicar</summary>

Veja [Como jogar localmente](#como-jogar-localmente). O build produz uma versão modular em `dist/index.html` e um HTML autônomo para teste. Deploy e merge não são disparados pelo build; a publicação é uma etapa deliberada após aprovação. O GitHub Actions roda verificações, sem publicar.

</details>

---

<details>
<summary>Testes e acessibilidade</summary>

Os testes de motor cobrem as três soluções, passos limítrofes, rejeição de movimentos, eventos simultâneos, terceiro erro, inventário e reinício. Teclado e toque têm caminhos equivalentes; mapa em texto, foco visível, padrões e indicadores não dependem de cor. [Cobertura e limites](tests/README.md).

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

Projeto de Luigi Scofano de Araujo. O protótipo não incorpora sprites, código, fontes baixadas ou sons de terceiros. O navegador usa a fonte de sistema. Documentar autoria, origem e licenças ao incorporar recursos.

</details>

---

**© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.**
