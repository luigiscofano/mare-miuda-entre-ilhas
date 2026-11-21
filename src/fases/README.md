# Fases, grade e soluções

Estado inicial padrão: maré baixa, zero passos, zero erros e sem fragmento. Símbolos: S início, . firme, = baixio, # bloqueio, C concha, B fragmento, G saída com fragmento. Todas reiniciam no início pelo botão ou R. Não têm checkpoints intermediários nem opcionais no protótipo.

## 01 · Passagem da primeira onda

```
S=.C
.###
```

**Objetivo:** chegar à concha. Ensina que a chegada do terceiro passo precisa ser firme.

**Solução:** → → →. Alternativa pedagógica de erro: ↓ ↑ → deixa o siri sobre o baixio no terceiro passo, devolve a S e mantém a maré alta. Verificar se o jogador entende por que não pode entrar de novo direto.

## 02 · A sombra da garça

```
S=..C
##.##
```

**Objetivo:** concha depois da casa visada. A garça ataca na coluna 4 (contando a partir de 1), linha 1, nos passos 3, 7, 11… e avisa um passo antes. Ensina abrigo lateral e leitura simultânea de dois ciclos.

**Solução:** → → ↓ ↑ → →. A corrida direta → → → perde um erro; a casa de baixo é firme, não um obstáculo.

## 03 · Busca e volta

```
SG#
=##
.B#
```

**Objetivo:** recuperar o fragmento e levar à saída. Ensina escolher rota de volta em um ciclo diferente. Chegar a G cedo avisa que falta coletar o item.

**Solução:** ↓ ↓ → ← → ← ↑ ↑ →. A ilha permite andar enquanto a água está alta; a sexta ação baixa a água. Testar volta, coleta não duplicada e reinício limpando a ação intermediária.

Fonte de dados: [index.ts](index.ts). As três soluções são executadas pelo motor nos testes, não pelo cronômetro de uma animação.

## 04 · O segredo da ilhota (opcional)

```
S=.##
.##=C
...=.
```

**Objetivo:** encontrar a Concha Perolada. Voltar do baixio inicial dá tempo de atravessar o banco por baixo quando descer. A alcova superior é deliberadamente sem saída; reveja no teste se fica clara como rota de preparação.

**Solução:** → ← ↓ ↓ → → → → ↑. Vitória abre atalho no mapa, sem bloquear a rota principal.

## 05 · A ponta da garça

```
S=....
###.#G
....B.
```

**Objetivo:** recuperar o fragmento e alcançar a saída. A garça mira o fragmento nos passos 6, 10, 14… Entrar direto na casa marcada no sexto passo causa erro **sem** coletar. A saída fica firme e não dispara sem o fragmento.

**Rota do abrigo:** → → → ↓ ↓ ← → → → ↑. **Rota alternativa pela parte de cima:** → → → → → ↓ ↓ ← → ↑. As duas chegam sem erro e passam por perigos em momentos diferentes.

## Lote 1 · Recifes Expostos

Legenda adicional: H pedra alta, firme e atravessável; # rocha bloqueada. As sequências usam U↑, D↓, L←, R→, X troca de siri sem consumir passo.

| Fase | Mapa (as barras separam linhas) | Solução |
| --- | --- | --- |
| Acima da espuma | `S=H==C / ##.###` | `RRDUDURRR` |
| Duas poças do recife | `###G### / B=.S.=B / ..#..#.` | `RRRDUDULLLRLLLLDRLRURRU` |
| A volta do recife | `SG#### / =#.### / H=.### / .#=B.# / ###..#` | `DDDUDURRUDUDDRRLRLLUUDUDLLDUDUUUR` |

Aprendizado: distinguir refúgio de bloqueio → coletar dois fragmentos em janelas diferentes → preparar ida e volta em mais de um ciclo. Observe se os dois fragmentos são lidos como itens distintos e se os bolsões laterais comunicam espaço seguro, sem bordas enganadoras. Reiniciar restaura todos os fragmentos.

As três fichas acima são o percurso original. O [lote de ampliação](../../docs/processo-de-criacao/09-recifes-ampliados/README.md) registra sete travessias regulares adicionais e dois desvios, com grades e soluções verificadas.

## Lote 1 · Mangue dos Siris Duplos

Legenda adicional: A início do segundo siri, T raiz-alvo, P placa, D portão. Em dupla, concha e raiz/placa devem estar ocupadas ao mesmo tempo.

| Fase | Mapa (as barras separam linhas) | Solução |
| --- | --- | --- |
| Raízes vizinhas | `SC### / ##T.A` | `RXLL` |
| Um segura, outro passa | `S=HDC / .#### / A.P##` | `RRXRRXRR` |
| Reencontro na ponta do mangue | `S=H.DC / .#.##T / A=H.P.` | `RRRLRLXRRRRXRRRXRU` |

Aprendizado: troca gratuita e destinos distintos → segurar a placa → proteger ambos na virada, abrir passagem e reunir a dupla. Observe se o formato das pinças e o marcador de atividade identificam o siri ativo sem depender da cor. Erros levam ambos à última combinação segura; reiniciar também redefine o siri ativo e o portão. Nenhuma solução depende do tempo de resposta físico.

As fichas deste trecho original permanecem válidas. As sete travessias regulares novas estão no [registro da ampliação do Mangue](../../docs/processo-de-criacao/10-mangue-ampliado/README.md), com objetivos, diagramas e soluções sem levadas.

## Laboratório: Três moedas na restinga

Experimental, fora da campanha e da contagem das onze fases. As três moedas estão em ramos diferentes; colete cada uma uma única vez e chegue à saída em até 14 passos válidos. A vitória em passo 14 vale; se o objetivo não for cumprido, o mesmo passo encerra a tentativa. Testemunha: ↑↑↓↓←←→→↓↓↑↑→→. Reiniciar limpa contador e moedas.

As seis travessias da Enseadinha incluem três opcionais. Suas rotas estão no [registro da Praia ampliada](../../docs/processo-de-criacao/06-praia-ampliada/README.md). Não substituem as fases existentes.

A [prova jogável do segundo lote](../../docs/processo-de-criacao/07-campanha-e-lote2/README.md) introduz patrulha e balsas em seis fases. O símbolo `~` indica água funda: só se entra quando a balsa estiver naquele ponto.

### Desvios dos siris duplos

- **Vigia em dupla**, na Enseada: leve um siri à placa e deixe o outro no refúgio antes do rasante; a rota sem levadas é `RRRLXRRRXRRR`.
- **Encontro nos dois cais**, nas Ilhas: use a balsa com o primeiro, coloque o segundo sobre a placa, atravesse e reúna os dois; rota sem levadas `RRRXRRXRRXDRR`.
- Nas rotas, `R` = direita, `L` = esquerda, `U` = cima, `D` = baixo e `X` = trocar. As fases são opcionais e aparecem após a terceira travessia dos respectivos mundos.

## Grutas da Espuma

As três fases iniciais estão em `lote3.ts`. `K` é a pérola, `E` o encaixe A, `F` a alavanca B e `O` o portão. `etapasGruta` declara a sequência e o mapa tem uma única casa para cada etapa declarada.

## Grutas e Ressaca em dupla

| Mundo | Fase | Coordenação | Rota sem levadas |
| --- | --- | --- | --- |
| Grutas | A pérola e a placa | Um siri transporta a pérola e sustenta a placa; o outro cruza o portão. | `RRXRRRRXRRR` |
| Grutas | Revezamento nas câmaras | Encaixe pelo portador, alavanca da outra câmara e reunião após a placa. | `XRRXRLRRXRRRXRRRRXR` |
| Ressaca | Abrigo dos dois cais | Antecipe o rasante nos cais, use a balsa e a placa, depois reúna a dupla. | `RRRDUDXRRRXURXDRXRR` |
| Ressaca | Ancoradouros em revezamento | Planeje duas balsas sincronizadas e a fuga em quatro alvos de rasante. | `RRRLRRRXRRRXRXDXRXURRRDRR` |

`R` = direita, `L` = esquerda, `U` = cima, `D` = baixo e `X` = trocar. Todas são regulares; trocar continua sem gastar turno.

### Segundo desafio em dupla da Enseada e da Deriva

- `enseada-dupla-revezamento`: dois fragmentos sob patrulha alternada, com placa e reunião final (18 passos sem levadas).
- `deriva-dupla-contramao`: duas balsas em sentidos opostos, placa, dois fragmentos e reunião final (20 passos sem levadas).

## Farol em dupla

| Fase | Sequência testemunha | Passos válidos |
| --- | --- | --- |
| O fragmento das duas margens | `RRXRRXRRRRRDURRRXRRRD` | 18 |
| As duas luzes do farol | `RDUDDRRXRUURRRRRLRXRRXRXRRR` | 23 |

Os dois mapas de `farol.ts` reaproveitam a placa `P`, o portão `D`, o embarque em `~`, os fragmentos `B` e os alvos de chegada. Nenhuma regra nova no motor.

## Enseada da Garça ampliada

Seis travessias solo e uma em dupla nascem de um ramo ao norte da rota original. Veja as [fichas do lote](../../docs/processo-de-criacao/11-enseada-ampliada/README.md) com grades, ciclos da garça e soluções verificadas.

## Ilhas à Deriva ampliadas

As sete travessias do ramo norte usam balsas e mantêm os três mapas originais e os dois desvios em dupla. As [fichas do lote](../../docs/processo-de-criacao/12-deriva-ampliada/README.md) trazem as grades, os cais por maré e as rotas testadas.
