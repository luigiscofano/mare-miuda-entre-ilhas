# Arquipélago

**Português** · [English](README.en.md)

[Galeria de telas do jogo](../arte/galeria/README.md) · [Guia visual do Arquipélago (PDF)](Mare-Miuda-Arquipelago.pdf). As páginas recompõem estados reais e camadas aprovadas dos oito mundos para computador e celular.

A montagem [Os oito mundos](../arte/animacoes/README.md#os-oito-mundos) apresenta o Porto, o Arquipélago, os oito seletores e, no final, Ilha de Improviso, Som e música e Créditos.

© Luigi Scofano de Araújo. Todos os direitos reservados.

## Porto de Partida

No Porto, o oceano preenche a tela sem faixa de rodapé. No computador, a logo, o Siri e os controles crescem juntos conforme a largura e a altura disponíveis. Cada canto usa um arranjo distinto das células de areia de 48 px do tabuleiro. No celular, a composição continua mais compacta.

## Idioma do jogo

No Porto, o botão **EN** fica sozinho no canto inferior direito, por cima do mar. A única outra troca fica no rodapé de **Configurações**, na ordem de navegação por teclado da janela. Arquipélago, seletores e travessias não têm faixa de idioma; **Som e música**, **Créditos** e **Ilha de Improviso** não oferecem troca. Depois de mudar para inglês, o rótulo passa a **PT**. A tradução acompanha títulos, objetivos, avisos e ações sem recriar a travessia ou regravar o save. O português é o padrão ao abrir ou recarregar o HTML normalmente.

[Veja o botão de idioma na galeria](../arte/galeria/README.md#telas).

## Disposição na Praia das Conchas

A campanha da **Praia das Conchas** tem painel compacto, previsão da virada em três passos e cenas de fim de fase mais curtas. No computador, o estado acompanha a travessia à direita; no celular, cabe acima do tabuleiro. O mesmo painel aparece em **Sombra na restinga** e **Turno dos guardiões**. As outras travessias mantêm a disposição anterior.

O painel mostra o objetivo, os passos até a virada, o total de passos e os erros. A maré nova é confirmada no fim do movimento da água. Os rótulos curtos no celular preservam seus nomes acessíveis completos. Na vitória, a concha brilha antes da placa; na derrota, aparece a causa e a opção de tentar de novo. Nos dois casos, o foco de teclado vai para a próxima ação disponível.

Na primeira fase, a dica de setas ou deslize some após o primeiro movimento válido. Um filete ciano marca o baixio que alaga no próximo passo, apenas na primeira virada. Não é um indicador de destino. O painel compacto distingue passo aceito, caminho bloqueado e Siri se recuperando. A recuperação continua descartando comandos, sem fila.

## Movimento

Mova com as **setas** ou **WASD** no teclado, ou deslize sobre o tabuleiro no celular. Um gesto completo em direção clara aciona um passo; toques curtos, diagonais sem direção dominante e gestos cancelados não acionam jogadas. A rolagem permanece disponível fora do tabuleiro.

Os cantos de destino indicam jogadas possíveis somente após o pouso de todos os siris, inclusive ao sair de uma fenda. As regras de movimento e a duração das animações não mudam.

## Resultado e retorno na campanha

A placa de vitória ou derrota fica no centro do tabuleiro e se ajusta ao espaço disponível. Na derrota, **Tentar novamente** e **Voltar à seleção de fases** aparecem ao fim da entrada da placa. Tentar de novo volta ao início da mesma fase; voltar abre a página e foca o cartão dessa fase. Os botões de vitória não mudaram; **Configurações** abre o [painel de apoio](#painéis-de-apoio).

Na campanha, o cabeçalho exibe apenas o nome da fase. O objetivo, a orientação e o mapa em símbolos estão em **Mapa em texto e ajuda**; o foco continua no título ao entrar na fase. O letreiro ilustrado não duplica o nome para leitores de tela e usa texto simples quando o dispositivo força uma paleta de alto contraste.

Depois de um erro recuperável de maré ou garça, apenas o Siri afetado pisca três vezes. As direções ficam bloqueadas desde o erro até o fim da pausa de recuperação. Uma tecla ou um deslize feito durante a pausa é descartado, não executado depois. Configurações, reinício e volta continuam disponíveis.

A preferência de movimento reduzido mostra a placa e seus botões sem esperar a animação e mantém uma pausa curta após o erro, sem piscadas. O terceiro erro termina a tentativa, sem animar um renascimento. A travessia da [Ilha de Improviso](#ilha-de-improviso) usa os mesmos atalhos e gestos de direção, e conserva seu comportamento de resultado.


## Seleção de fases

**Começar viagem** e **Continuar viagem** abrem o Arquipélago sem trocar o mundo gravado no save. No Arquipélago, você escolhe o **mundo**. Dentro dele, a seleção de **fases** continua com quatro páginas por mundo. Os 231 cartões preservam ordem, condições de acesso, rótulos de bloqueio e tipos de fase. Fases bônus e chefes opcionais continuam identificados.

No computador, a seleção ocupa a janela; as quatro quinas de areia são recortes da arte de cada página e encostam nas bordas. O título, as pedras, a rota e os cartões mantêm a composição. O celular mantém a lista vertical.

- **Configurações** abre o [painel de apoio](#painéis-de-apoio) dentro da seleção. Feche para continuar na mesma página, com foco no botão de origem.
- **Voltar ao início** sai para o Porto. Ao continuar na mesma sessão, escolha novamente o mundo para recuperar a página em que estava. Isso não regrava o progresso da campanha.
- Brilhos em três tamanhos e espumas soltas são decorativos, sem área clicável nem anúncio ao leitor de tela. Com movimento reduzido, o fundo exibe um único quadro de espuma.

## Painéis de apoio

| Painel | Onde abrir | Controles |
| --- | --- | --- |
| **Configurações** | Na seleção de fases ou dentro da fase. | Ajustes separados de **Música** e **Efeitos**, com percentuais que acompanham os controles. |
| **Som e música** | No Porto. | As duas regulagens de volume e a identificação da faixa **A Outra Margem**, para **violão de nylon**, sem ilustração de instrumento. |
| **Créditos** | No Porto, pelo botão **Créditos**. | Créditos do jogo, sem revelar o desfecho da campanha. A apresentação de conclusão é separada e mantém **Voltar ao mapa**. |
| **Ilha de Improviso** | No Porto. | Filtros da travessia avulsa, histórico e **Gerar travessia**. |

Cada painel aparece centralizado, sem ocupar toda a tela, e escurece em 79% a tela atrás. As quatro quinas da moldura têm brilhos brancos decorativos que não recebem foco nem interceptam toques. Se a janela for curta, a rolagem fica dentro do painel. A tela de fundo permanece visível, mas não recebe comandos enquanto o painel está aberto.

**Tab** e **Shift+Tab** percorrem os controles do painel. **Esc**, o **X**, o botão **Fechar** (ou **Voltar** em Créditos e Ilha de Improviso) e o clique ou toque na área escurecida fecham o painel de apoio e devolvem o foco ao botão que o abriu. Na seleção, a página não muda; dentro da fase, nenhum movimento é executado por trás do painel.

Ajustar volume mantém as preferências salvas já existentes, sem alterar o andamento da fase. Abrir ou fechar o painel não muda regras, estados de fase, seleção ou andamento do jogo. Não há atalho de depuração visível no menu.

## Ilha de Improviso

No Porto, abra **Ilha de Improviso** para escolher o tema, a dificuldade e o número de Siris (de um a três), ativar ou desativar garça e pérola e acessar o histórico. Os botões usam fonte comum. Em telas estreitas, os textos abaixo dos títulos são ligeiramente menores; se faltar altura, apenas o conteúdo do painel rola.

**Gerar travessia** abre uma fase avulsa, sem alterar o andamento da campanha. Na fase, **Editar filtros** volta ao Porto e reabre a janela com os valores que geraram a travessia. Se fechar a janela sem gerar, o foco volta ao botão **Ilha de Improviso**. Ao reabrir durante a mesma sessão, as escolhas também são mantidas. A janela muda apenas a apresentação: geração, regras e histórico continuam os mesmos.
