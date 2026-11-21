# Ilhas à Deriva ampliadas

As Ilhas à Deriva passam de três para **dez travessias regulares**, além dos dois desvios em dupla que já existiam. Suba depois de A primeira balsa para visitar o novo ramo. O porto, o atalho e o acesso às Grutas da Espuma continuam na rota original. Arte, áudio, chefes e trio ficam fora desta entrega.

Todos os mapas começam na maré baixa e com zero levadas. Cada balsa fica na primeira parada na baixa e na segunda na alta. Na virada, ela leva quem está a bordo, mesmo quando o passo foi do outro siri. Não há botão de esperar: use as casas firmes para alinhar a próxima virada. Recomeçar limpa a tentativa, sem perder o progresso no seletor.

**Legenda:** S início coral, A início verde, . chão firme, = baixio, # bloqueio, ~ água, H pedra firme, C concha, B fragmento, G saída com fragmentos e T raiz marcada. **X** troca de siri sem gastar passo. As coordenadas começam em (0, 0), na ordem coluna, linha. [Dados das fases](../../../src/fases/deriva-ampliada.ts).

## Um passo ao cais

Use a balsa de leste e alcance a concha. Confira se a balsa está ao lado do cais. O terceiro passo válido muda a maré e transporta quem embarcou.

```text
S..~~~.C
...#####
```

Balsa 1: (3, 0) baixa → (5, 0) alta.

Rota sem levadas (5 passos): → → → → →.

## O cais da alta

Alcance a concha usando a balsa no sentido de volta. A balsa começa longe do siri. Caminhe perto do cais para trazê-la, embarque na alta e use a descida para atravessar.

```text
C.~~~~.S
######..
```

Balsa 1: (2, 0) baixa → (5, 0) alta.

Rota sem levadas (8 passos): ↓ ↑ ↓ ↑ ← ← ← ←.

## Duas rampas

Pegue a balsa e chegue à concha por um dos desembarques. As rampas têm distâncias diferentes até o próximo baixio. A saída que parece mais curta no mapa pode dar na água alta.

```text
S..~~~H=C
...##H.=.
######H..
```

Balsa 1: (3, 0) baixa → (5, 0) alta.

Rota sem levadas (8 passos): → → → ↓ ↑ → → →.

## Balsas alternadas

Troque de balsa no ilhote e siga para a concha. Uma balsa chega enquanto a outra parte. Desembarque no ilhote e mire a chegada da segunda na maré seguinte.

```text
S..~~~~....~~.C
#######...#####
#######...#####
```

Balsa 1: (3, 0) baixa → (6, 0) alta; Balsa 2: (12, 0) baixa → (11, 0) alta.

Rota sem levadas (14 passos): → → → → ↓ ↑ ↓ ↑ → → → → → →.

## Ida e retorno pela corrente

Busque o fragmento do outro lado e volte ao cais inicial. São duas balsas e cais diferentes para ida e volta. A balsa da ida não está no mesmo lugar quando você sai da margem.

```text
SG.~~~~H.B
..#####...
..~~~~~~..
```

Balsa 1: (3, 0) baixa → (6, 0) alta; Balsa 2: (2, 2) baixa → (7, 2) alta.

Rota sem levadas (15 passos): → → → → ↓ ↑ → → ↓ ↓ ← ← ← ↑ ↑.

## Dois ancoradouros

Recolha os dois fragmentos de margens opostas e siga até a saída de leste. Planeje o primeiro desembarque e volte pelo outro braço. Depois, entre no ancoradouro que leva ao segundo fragmento.

```text
B.~~~~S..~~~BG
..####...#####
..~~~~...#####
```

Balsa 1: (5, 0) baixa → (2, 0) alta; Balsa 2: (2, 2) baixa → (5, 2) alta; Balsa 3: (9, 0) baixa → (11, 0) alta.

Rota sem levadas (17 passos): ↓ ↑ ← ← ← ↓ ↓ → → → ↑ ↑ → → → → →.

## Tripulação partilhada

Embarque com os dois siris, recolha o fragmento e chegue à saída e à raiz. Deixe um siri a bordo e troque. O passo do parceiro pode virar a maré e transportar quem não está ativo.

```text
S.~#~.BG
########
A~##~..T
```

Balsa 1: (2, 0) baixa → (4, 0) alta; Balsa 2: (1, 2) baixa → (4, 2) alta.

Rota sem levadas (9 passos, 3 trocas): → → X → → → X → → → X →.
