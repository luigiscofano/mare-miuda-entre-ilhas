# Mangue dos Siris Duplos ampliado

O mundo passa de três para **dez travessias regulares**, todas em dupla. A rota curta original e a condição de abertura da Enseada não mudam. No mapa, suba em Raízes vizinhas para visitar o ramo. Depois de Trinco salgado, a ligação aos fragmentos pede também a travessia histórica Um segura, outro passa. Chefes, trios e revisão de arte ficam fora deste lote.

Todos os mapas começam na maré baixa, com zero levadas. A maré vira a cada três passos válidos dos dois siris. Trocar com Espaço ou com o botão não gasta passo. Mesmo inativo, o parceiro pode ser atingido pela maré. Reiniciar volta ao início da tentativa, sem perder progresso da campanha.

**Legenda:** S início vermelho, A início verde, . chão firme, = baixio, # bloqueio, H pedra alta, C concha, B fragmento, G saída com fragmentos, P placa, D porta, T raiz marcada. **X** é a troca nas rotas abaixo. Elas foram reproduzidas no motor sem levadas e passam pelos dois destinos. O [arquivo de dados](../../../src/fases/mangue-ampliado.ts) registra os mesmos mapas e soluções.

## Duas veredas

Leve a dupla à concha e à raiz marcada, em veredas separadas. Troque sem gastar um passo. Nenhum dos dois chega sozinho aos dois destinos.

```text
S..C#
#####
T..A#
```

Rota verificada (6 passos, 1 troca): → → → X ← ← ←.

## Janela partilhada

Cruze os dois baixios e alcance a concha e a raiz marcada. Não troque deixando o primeiro siri no baixio se a água estiver para subir. A pedra alta é um lugar seguro para a troca.

```text
S=H.C
##.##
A.=HT
```

Rota verificada (10 passos, 1 troca): → → ↓ ↑ → → X → → → →.

## Trinco salgado

Acione a placa da margem de baixo e mantenha-a pressionada até chegar à concha. A maré dos dois é a mesma. Pare na pedra enquanto o outro siri faz o trajeto até a placa.

```text
S=HDDC
.#.###
###..P
A.=H##
```

Rota verificada (11 passos, 2 trocas): X → → → ↑ → → X → → → → →.

## Fragmentos cruzados

Recolha dois fragmentos em margens opostas e alcance a saída e a raiz. Os fragmentos fazem parte do objetivo dos dois. Não é preciso levar ambos ao mesmo fragmento.

```text
S=HB.G
##.##.
######
T.BH=A
###.H.
```

Rota verificada (12 passos, 1 troca): → → ↓ ↑ → → → X ← ← ← ← ←.

## Cotovelo das raízes

Coloque os dois siris na concha e na raiz depois do cotovelo. No caminho único, quem vai à frente precisa liberar a passagem do outro. Use os nichos firmes durante a alta.

```text
S.###C
A.==TH
##H.#.
```

Rota verificada (15 passos, 1 troca): → ↓ ↑ ↓ ↑ ↓ → → → → ↑ X → → → →.

## Depois da porteira

Passe pela porteira e reúna a dupla na concha e na raiz do outro lado. Deixe um siri na placa só até o parceiro estar do outro lado. Depois atravesse o braço inferior na baixa, sem voltar pela porta.

```text
S=H.D.C
######T
A=H.P#.
###H=H.
```

Rota verificada (17 passos, 3 trocas): X → → → ↓ ↑ → X → → → → → → X ↓ → → ↑ ↑.

## Raízes em circuito

Recolha os fragmentos e faça a dupla se encontrar depois do portão. Organize a coleta e a placa em turnos diferentes. Os dois corredores têm baixios e, depois da porta, o outro siri ainda precisa chegar à raiz.

```text
S=H=DD.BG
#########
A.=H.P==T
##...##.#
##B..##.#
```

Rota verificada (22 passos, 6 trocas): X → → ↓ ↓ ↑ ↓ ↑ X → → X → ↑ → → X → → → → → X → → → X →.
