# Grutas da Espuma ampliadas

As Grutas da Espuma passam de cinco para **dez travessias regulares**. O novo ramo parte de Uma pérola para o portão; seu trecho em dupla é liberado depois de A pérola e a placa. A rota original, o retorno ao porto e a passagem para a Baía da Ressaca permanecem. Trio, chefes, arte e áudio não fazem parte deste lote.

Todos os mapas começam na baixa e sem levadas. A água troca a cada três passos válidos; trocar de siri não gasta passo. A pérola pertence a quem recolheu. A alavanca só funciona após o encaixe. O portão das Grutas abre ao terminar as etapas; a porta da placa só permite entrar enquanto o outro siri a mantém pressionada. Em Boca do labirinto, o estado do portão e o fragmento aparecem lado a lado no inventário.

**Legenda:** S início coral, A início verde, . firme, = baixio, # bloqueio, H pedra alta, K pérola, E encaixe A, F alavanca B, O portão das etapas, D porta da placa, P placa, T raiz marcada, C concha, B fragmento e G saída após a coleta. **X** troca de siri. [Dados das fases](../../../src/fases/grutas-ampliadas.ts).

## A alavanca da entrada

Leve a pérola pelo encaixe, volte à alavanca e abra o portão. A alavanca está na primeira bifurcação, mas só funciona depois do encaixe. Guarde o acesso a ela para a volta.

```text
F..###
#.HEOC
KS=###
```

Etapas: K → E → F.

Rota sem levadas (15 passos): ← → ↑ → → ← ↑ ← ← → ↓ → → → →.

## Dobra da câmara

Leve a pérola de uma câmara até o encaixe pela passagem da maré. A seca deixa dois caminhos; quem carrega deve alcançar o encaixe. Use a pedra antes de contornar a volta pela alavanca.

```text
K.H.##F.
.#==##..
S=H.H.E#
..###.OC
```

Etapas: K → E → F.

Rota sem levadas (18 passos): ↑ ↑ ↓ ↑ ↓ ↓ → → → → → → ↑ ↑ ↓ ↓ ↓ →.

## O coral leva a pérola

Leve a pérola com o siri coral, abra os portões e reúna a dupla. O encaixe não aceita o outro siri. O verde guarda a placa, mas só precisa continuar nela até a travessia do coral.

```text
SK=H.E##
####.ODC
########
A.=H.PT#
...#####
```

Etapas: K → E.

Rota sem levadas (14 passos, 3 trocas): → → → → → ↓ X → → → → → X → → X →.

## A alavanca distante

Encaixe a pérola na câmara sul, acione a alavanca no norte e reúna os dois. Quem leva a pérola também precisa encaixá-la. A alavanca fica na outra margem e só responde depois da entrega.

```text
S.H=FODC
########
A=KHEPT#
..H#####
```

Etapas: K → E → F.

Rota sem levadas (13 passos, 3 trocas): → X → → → → → X → → → → → → X →.

## Boca do labirinto

Abra os dois portões, recolha o fragmento e reúna os siris no final. A dupla divide o encaixe e a alavanca em margens diferentes. Antes de liberar a placa, deixe o outro além da porta e proteja a volta pela água.

```text
SK=H.E#####
####.###B##
####.OD...G
###########
A.=H.FP==T#
...####.H.#
```

Etapas: K → E → F.

Rota sem levadas (25 passos, 4 trocas): → → → → → ← X → → → → → → X ↓ ↓ → → → → X → → → X ↑ ↓ → →.
