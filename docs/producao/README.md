# Edição jogável de Maré Miúda

## Executar

```sh
python3 edicao-oficial/montar.py dist/mare-miuda-prototipo.html --verificar
node edicao-oficial/testes/campanha.mjs dist/mare-miuda-prototipo.html
```

Abra o HTML gerado em um navegador. Os módulos, estilos e recursos ficam separados; o HTML empacotado não é versionado. O arquivo de recursos pode ser inspecionado com um leitor de ZIP. O montador não acessa a rede.

A [campanha](../campanha/README.md) preserva os identificadores usados nos saves. Ao trocar o HTML offline, guarde o original: alguns navegadores associam o progresso ao caminho completo do arquivo. Não limpe o armazenamento do navegador.

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
