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

Após gerar o HTML, execute `node edicao-oficial/testes/passada.mjs dist/mare-miuda-prototipo.html`. O teste usa o mesmo módulo empacotado e cobre as quatro direções, a troca de pose e o fim em 165 ms.
