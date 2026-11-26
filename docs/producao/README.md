# Edição jogável de Maré Miúda

**Português** · [English](README.en.md)

## Filme de demonstração

A documentação inclui [Os oito mundos](../arte/animacoes/README.md#os-oito-mundos), com partidas reproduzidas a partir dos módulos da edição oficial e telas de interface recompostas para a montagem. O MP4 não integra o build offline e não substitui os testes da campanha.

## Executar

```sh
python3 edicao-oficial/montar.py dist/mare-miuda-prototipo.html --verificar
node edicao-oficial/testes/campanha.mjs dist/mare-miuda-prototipo.html
```

Abra o HTML gerado em um navegador. Os módulos, estilos e recursos ficam separados; o HTML empacotado não é versionado. O arquivo de recursos pode ser inspecionado com um leitor de ZIP. O montador não acessa a rede.

A [campanha](../campanha/README.md) preserva os identificadores usados nos saves. Ao trocar o HTML offline, guarde o original: alguns navegadores associam o progresso ao caminho completo do arquivo. Não limpe o armazenamento do navegador.

O montador lê o `edicao-oficial/assets.zip` original e o `edicao-oficial/assets-tipografia.zip`, que reúne as bases localizadas para o texto normal. Ambos são necessários; caminhos de recursos repetidos são rejeitados. Os letreiros detalhados em pixel art continuam no jogo.

O HTML independente inclui cada módulo uma única vez por meio de um importmap. A edição Web serve módulos, WAVs e imagens dos títulos separadamente. As duas usam as mesmas regras e conteúdo. Teste a Web com servidor local, não por uma URL de arquivo.

```sh
python3 edicao-oficial/montar.py dist/web/index.html --web
python3 -m http.server 8000 --directory dist/web
```

## Validação dos controles

```sh
node edicao-oficial/testes/gestos.mjs dist/mare-miuda-prototipo.html
```

Em um celular físico, deslize nas quatro direções no tabuleiro e confirme que cada gesto completo produz um só comando. Inverta a direção e verifique toques, segundo dedo e gestos durante a pausa de recuperação ou com Configurações abertas. Confira se a página continua rolável fora do tabuleiro.

## Validação de idiomas

```sh
node edicao-oficial/testes/idiomas.mjs dist/mare-miuda-prototipo.html
```

O teste automatizado confere a presença dos três textos de cada uma das 231 fases e o retorno de textos e atributos acessíveis ao idioma original.

Abra o HTML offline sem parâmetro de idioma e confirme o português como padrão. No Porto de Partida, selecione **EN** no canto inferior direito e confira menus, seletores, títulos, objetivos e painel da fase. Durante uma travessia, abra **Configurações**, use **Tab** para chegar ao botão de idioma e volte com **PT**. Verifique que posição, contagem de passos, progresso salvo e música não foram reiniciados. Confirme que Som e música, Créditos e Ilha de Improviso não têm botão de idioma e que Arquipélago, seletores e travessias não têm faixa de idioma. Selecione **EN** novamente e recarregue o arquivo normalmente: a interface deve voltar ao português, com progresso preservado. Consulte o [guia do controle](../interface/README.md#idioma-do-jogo).

## Paridade da revisão

- 231 fichas e 4.007 passos de solução sem levadas.
- 462 quadros estáveis da câmera, nas duas marés, comparados pixel a pixel com a edição aprovada.
- 2.320 estados de progressão e amostras do save, mais 480 gerações de Improviso comparadas.
- Nenhum mapa, sprite em uso, áudio, câmera, regra em uso ou saída da interface mudou com a retirada de regras antigas. Os identificadores legados ficam para compatibilidade e não habilitam mecânicas.

A comparação usa o motor e o canvas em ambiente controlado. Não substitui testes em celular físico.

## Validação da passada

Após gerar o HTML, execute `node edicao-oficial/testes/passada.mjs dist/mare-miuda-prototipo.html`. O teste usa o mesmo módulo empacotado e cobre as quatro direções, a troca de pose e o fim em 205 ms na campanha e a passada anterior de 165 ms fora dela.

## Validação de resultado e retorno

Após gerar o HTML, execute:

```sh
node edicao-oficial/testes/resultados-e-retorno.mjs dist/mare-miuda-prototipo.html
```

O teste lê os módulos empacotados e verifica o tamanho e o centro da placa em nove configurações de tela, o quadro estático de movimento reduzido, os três pulsos e a duração do bloqueio da campanha e a curva anterior preservada no Improviso. Também verifica a velocidade simétrica da subida e da descida, a cobertura do Siri pela água e a pausa após o retorno. O teste de campanha continua cobrindo as 231 soluções.


## Validação da seleção de fases

Em desktop e celular, percorra as quatro páginas de cada um dos oito mundos. A primeira e a última desabilitam a seta sem destino; cartões bloqueados não iniciam fase. No desktop, confira as quatro quinas junto às bordas e a rota entre as duas colunas de cartões. No celular, confira a lista vertical e os dois botões no topo.

No Mangue, abra **Configurações** na página 4. Teste **Esc**, botão de fechar e clique no fundo: o foco deve voltar a **Configurações** e a página não pode mudar. Pressione **Voltar ao início**, continue o jogo e confira a mesma página sem perder progresso. Com movimento reduzido, o fundo deve parar sem sumir com os brilhos ou com a espuma. Esses efeitos não aparecem no Arquipélago nem no tabuleiro.

## Validação da trilha sonora

Após gerar o HTML offline, execute:

```sh
node edicao-oficial/testes/trilha.mjs dist/mare-miuda-prototipo.html
```

A edição offline usa um único loop de [**A Outra Margem**](../arte/trilha-sonora/README.md), para violão de nylon. Na revisão manual, inicie o áudio com um gesto, passe pelo mapa, seletores e fases e confirme que a faixa não volta ao começo. Use **Configurações** para ajustar música e efeitos separadamente; reduzir a música a zero e reativá-la não deve reiniciar a faixa. Alterne de aba e volte para conferir a retomada do ponto anterior. Verifique os efeitos de subida e descida da maré, coleta, erro e vitória sem depender da música.

## Validação dos efeitos sonoros

Após gerar o HTML offline, execute:

```sh
node edicao-oficial/testes/efeitos.mjs dist/mare-miuda-prototipo.html
node edicao-oficial/testes/trilha.mjs dist/mare-miuda-prototipo.html
```

O [catálogo de efeitos](../arte/efeitos-sonoros/README.md) descreve o vínculo entre os sons e os eventos. Na revisão manual, teste uma subida e uma descida da maré, a coleta, uma fenda e os resultados da fase. Provoque uma levada que permita retomar e outra que encerre a tentativa: o som de retorno é reservado para o reaparecimento, e a derrota toca no início do resultado. Teste um botão habilitado por mouse, toque e teclado e confirme um clique por ativação. Navegar com foco, passar o ponteiro ou tentar um botão bloqueado não deve tocar o clique. Ajuste o volume de **Efeitos** sem interromper ou modificar o volume de **A Outra Margem**.

## Validação dos painéis de apoio

Após gerar o HTML offline, execute:

```sh
node edicao-oficial/testes/paineis.mjs dist/mare-miuda-prototipo.html
```

No Porto, abra **Som e música**, **Créditos** e **Ilha de Improviso**; na seleção e durante uma fase, abra **Configurações**. Verifique os painéis em uma janela ampla e em uma janela estreita e curta: centro preservado, o mesmo escurecimento de 79% atrás dos quatro painéis e brilhos nas quatro quinas e rolagem restrita ao painel, sem expandir para a tela inteira. Use teclado e toque: o foco não sai pelo **Tab**, fecha por **Esc**, pelo botão ou pela área escurecida e retorna ao acionador. Na fase, tente movimentar o Siri com o painel aberto; ao fechar, confira que o passo não foi executado. Repita na quarta página do seletor e confirme que ela permanece aberta. Ajuste os dois volumes, confira os percentuais e valide que a música continua e o progresso permanece. Veja os [painéis de apoio](../interface/README.md#painéis-de-apoio).

No Porto, escolha filtros diferentes dos padrões na [Ilha de Improviso](../interface/README.md#ilha-de-improviso), consulte o histórico e gere uma travessia. Na fase avulsa, use **Editar filtros**: o Porto deve voltar com a janela aberta e as mesmas escolhas. Feche a janela e confira se o foco volta a **Ilha de Improviso**. Reabra e confira se os filtros ainda estão selecionados. A geração e o retorno pelo painel não devem avançar a campanha nem apagar o histórico.

## Praia das Conchas: verificação do fluxo

No computador e a 320 px, confira o aviso de virada em três passos, a animação completa da maré, uma vitória e uma derrota com nova tentativa. Abra Configurações no meio da partida, alterne o idioma e confirme que a contagem de passos e o progresso salvo foram preservados. Volte ao seletor e confira o retorno à mesma página e ao foco na mesma fase.

## GitHub Pages

O workflow do Pages verifica a edição atual e reconstrói o marco histórico. Pull requests só validam; a publicação é exclusiva da `main`. Jogo online, download offline e versão histórica têm URLs separadas.
