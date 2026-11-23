# mare-miuda-entre-ilhas
Quebra-cabeça de aventura por turnos em pixel art. Um siri, um arquipélago e uma maré que vira a cada três passos.

## Documentação visual

| Guia | Conteúdo |
| --- | --- |
| [Atlas de arte](docs/arte/Mare-Miuda-Atlas-de-Arte.pdf) | Areias, células, estruturas, vegetação e animais dos oito mundos. |
| [Todas as travessias](docs/arte/catalogo-231-travessias/Mare-Miuda-231-Travessias.pdf) | 231 fases em maré baixa e alta, com índice por mundo. |
| [Arquipélago](docs/interface/Mare-Miuda-Arquipelago.pdf) | Os cartões dos oito mundos no computador e no celular. |
| [Progressão e mecânicas](docs/campanha/Mare-Miuda-Progressao-e-Mecanicas.pdf) | Regras da edição oficial e evolução dos desafios. |

Veja o [índice da documentação](docs/README.md) e as notas de verificação em cada seção. Os PDFs documentam a edição offline aprovada e não alteram a versão jogável do repositório.

© 2026 Luigi Scofano de Araújo. Todos os direitos reservados.

- [Vídeo sem som das animações](docs/arte/animacoes/README.md): versão ampliada dos trechos de ação.

## Jogar a edição oficial offline

Com Python 3.10+ e Node, gere o HTML em `dist` e abra-o no navegador:

```sh
python3 edicao-oficial/montar.py dist/mare-miuda-prototipo.html --verificar
node edicao-oficial/testes/campanha.mjs dist/mare-miuda-prototipo.html
```

As fontes removem do motor e dos renderizadores as mecânicas históricas descartadas. Os identificadores antigos ficam apenas para carregar saves sem perder progresso. Consulte [produção e verificação](docs/producao/README.md).

A interface também inclui a passada de 165 ms, o painel de estado com avisos separados e as ações de derrota ao fim da animação.

Na campanha, as placas de resultado são maiores e continuam centradas no tabuleiro; a derrota ganha espirais laterais. Após um erro recuperável de maré ou garça, o Siri pisca três vezes. A sequência e o bloqueio total das direções duram o dobro da versão anterior. O título fica sozinho no topo; o objetivo e a orientação estão em **Mapa em texto e ajuda**. A Ilha de Improviso não mudou.

Veja [controles e acessibilidade](docs/interface/README.md#resultado-e-retorno-na-campanha) e [a verificação de resultado e retorno](docs/producao/README.md#validação-de-resultado-e-retorno).

## Seleção de fases

Nos oito mundos, a seleção de fases preenche a janela no computador, com as quatro quinas de areia encostadas às bordas. No celular, a lista mantém o formato vertical. As duas versões oferecem **Configurações** e **Voltar ao início**, sem apagar o progresso nem a página da seleção durante a sessão. O fundo tem brilhos em três tamanhos e espumas decorativas; a preferência de movimento reduzido deixa o fundo estático.

Veja [seleção de fases e acessibilidade](docs/interface/README.md#seleção-de-fases).
