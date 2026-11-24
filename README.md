# Maré Miúda: Entre Ilhas

**Um quebra-cabeça por turnos em pixel art: a cada três passos válidos, a maré vira.** Planeje onde o Siri vai estar quando a água subir e use os baixios que reaparecem quando ela desce.

**8 mundos · 231 fases de campanha · Edição jogável offline para computador e celular**

[Como jogar](#como-jogar) · [Vídeo dos oito mundos](docs/arte/animacoes/Mare-Miuda-Os-Oito-Mundos.mp4) · [Documentação](docs/README.md)

[![Passagem da primeira onda: fase em maré baixa à esquerda e em maré alta à direita](docs/arte/catalogo-231-travessias/amostra-duas-mares.png)](docs/arte/catalogo-231-travessias/README.md)

*Passagem da primeira onda, no início e após três passos. Quadros do próprio jogo.*

<a id="jogar-a-edição-oficial-offline"></a>

## Como jogar

Na raiz do repositório, use Python 3.10 ou posterior para gerar a edição oficial:

```sh
python3 edicao-oficial/montar.py dist/mare-miuda-prototipo.html --verificar
```

Abra `dist/mare-miuda-prototipo.html` no navegador. O HTML gerado inclui a arte e o áudio e não precisa de conexão para rodar. No **Porto de Partida**, entre no Arquipélago para escolher um mundo e depois uma fase.

- **Teclado:** setas ou WASD para mover; **R** para recomeçar.
- **Celular:** use os controles de toque.
- **Maré:** só um movimento válido avança a contagem. Uma tentativa bloqueada não gasta passo. A ajuda da fase inclui o objetivo e o mapa em texto.

Se trocar de cópia offline, guarde o HTML anterior: alguns navegadores associam a partida salva ao caminho do arquivo. Veja [produção e verificação](docs/producao/README.md#executar).

## Campanha e Ilha de Improviso

A campanha tem **200 fases regulares, 16 chefes opcionais e 15 bônus**. As travessias combinam a maré com a garça, fendas, pérolas e desafios em que dois ou três Siris se movem juntos. Conchas marcam chegadas; nas fases de coleta, junte as pérolas para abrir a ostra.

| Mundo | Fases |
| --- | ---: |
| 1. Praia das Conchas | 31 |
| 2. Recifes Expostos | 29 |
| 3. Mangue dos Siris Duplos | 27 |
| 4. Enseada da Garça | 31 |
| 5. Ilhas à Deriva | 29 |
| 6. Grutas da Espuma | 28 |
| 7. Baía das Brasas | 28 |
| 8. Arquipélago do Farol | 28 |

Na **Ilha de Improviso**, escolha tema, dificuldade, número de Siris e opções de garça e pérola para gerar uma travessia avulsa. O histórico é separado da campanha e **Editar filtros** preserva as escolhas. [Guia da Ilha de Improviso](docs/interface/README.md#ilha-de-improviso).

<a id="documentação-visual"></a>

## Vídeos e documentação visual

- [**Os oito mundos (MP4)**](docs/arte/animacoes/Mare-Miuda-Os-Oito-Mundos.mp4) · 4 min 22,5 s, com trilha e efeitos. Mostra 24 vitórias da campanha, uma na Ilha de Improviso e as telas de apoio. [Capítulos e método de montagem](docs/arte/animacoes/README.md#os-oito-mundos).
- [**Animações sem som**](docs/arte/animacoes/README.md#registro-de-animações-sem-som) · Registro ampliado de movimentos, resultados e variações de maré.

| Guia | Conteúdo |
| --- | --- |
| [Atlas de arte](docs/arte/Mare-Miuda-Atlas-de-Arte.pdf) | Areias, células, estruturas, vegetação e animais dos oito mundos. |
| [Todas as travessias](docs/arte/catalogo-231-travessias/Mare-Miuda-231-Travessias.pdf) | As 231 fases em maré baixa e alta, com índice por mundo. |
| [Arquipélago](docs/interface/Mare-Miuda-Arquipelago.pdf) | Os cartões dos oito mundos no computador e no celular. |
| [Progressão e mecânicas](docs/campanha/Mare-Miuda-Progressao-e-Mecanicas.pdf) | Regras e evolução dos desafios. |
| [Câmera, moldura e oceano](docs/arte/camera/README.md) | Enquadramento, cenários e painel de estado. |

## Interface e acessibilidade

<a id="seleção-de-fases"></a>

No computador, o **seletor de fases** ocupa a janela, com duas colunas e as quinas de areia junto às bordas. No celular, usa uma lista de uma fase por linha. As duas versões oferecem **Configurações** e **Voltar ao início**. Espumas e brilhos são decorativos e ficam estáticos com movimento reduzido.

Nas fases da campanha, as placas de vitória e derrota aparecem no centro do tabuleiro. Após um erro recuperável de maré ou garça, o Siri pisca três vezes e os movimentos ficam bloqueados por um instante; com movimento reduzido, a pausa não tem piscadas. O terceiro erro encerra a tentativa. A passada de 205 ms e a animação mais lenta da água não mudam a regra dos três passos válidos.

<a id="painéis-de-apoio"></a>

**Configurações**, **Som e música**, **Créditos** e **Ilha de Improviso** abrem em janelas centrais, com fundo escurecido em 79% e brilhos brancos nas quinas. Ao fechar, o foco volta ao botão de origem sem mudar a fase ou a página. Veja o [guia de interface e acessibilidade](docs/interface/README.md).

<a id="trilha-sonora"></a>

## Música e efeitos

[Ouça **A Outra Margem**, para violão de nylon](docs/arte/trilha-sonora/a-outra-margem-violao.mp3). A trilha acompanha a navegação em um único ciclo, sem recomeçar a cada tela. Música e efeitos têm volumes independentes.

[Ouça os 11 efeitos](docs/arte/efeitos-sonoros/Mare-Miuda-Efeitos-Mais-Sutis.mp3) · [Ficha da trilha e arte da capa](docs/arte/trilha-sonora/README.md) · [Catálogo dos efeitos](docs/arte/efeitos-sonoros/README.md).

## Código e verificação

A edição oficial está em [`edicao-oficial/`](edicao-oficial/): módulos de jogo, interface, estilos, recursos e testes. O montador local reúne tudo em um HTML; o arquivo gerado não é versionado. Os IDs legados ficam apenas para carregar saves antigos sem reativar regras descartadas.

Com Node.js, rode a verificação da campanha depois de gerar a edição:

```sh
node edicao-oficial/testes/campanha.mjs dist/mare-miuda-prototipo.html
```

Esse teste reproduz as 231 soluções. O [guia de produção](docs/producao/README.md) inclui os testes de movimento, resultados, áudio e painéis, além dos limites da validação automatizada.

© 2026 Luigi Scofano de Araújo. Todos os direitos reservados.
