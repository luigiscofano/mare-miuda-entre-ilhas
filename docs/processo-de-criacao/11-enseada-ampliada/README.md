# Enseada da Garça ampliada

A Enseada passa de três para **dez travessias regulares** e mantém os dois desvios em dupla. Suba depois de Sombra na restinga para visitar o novo ramo. O acesso às Ilhas à Deriva continua vindo da rota original; nenhum novo marco é pré-requisito. Arte, áudio, chefes e trio ficam fora desta entrega.

Todos os mapas começam na maré baixa, com zero levadas. A água vira a cada três passos válidos. O rasante usa o mesmo contador e pode atingir qualquer siri, mesmo inativo. O aviso marca a casa antes do passo que dispara o ataque. Pedra alta protege da maré, não da garça. Reiniciar limpa a tentativa sem apagar o avanço no mapa.

**Legenda:** S início vermelho, A início verde, . firme, = baixio, # bloqueio, H pedra alta, C concha, B fragmento, G saída com fragmento, D porta, P placa, T raiz marcada. **X** é troca de siri sem gastar passo. As coordenadas das fichas começam em (0, 0), na ordem coluna, linha. [Dados das fases](../../../src/fases/enseada-ampliada.ts).

## Um passo antes da sombra

Alcance a concha sem tomar o primeiro rasante. O rasante pode acontecer antes da subida da água. Se o baixio estiver marcado, há um desvio firme pelo sul.

```text
S.=HC
...H#
```

Garça: primeiro rasante no passo 2, depois a cada 5; alvo(s): (2, 0).

Rota sem levadas (6 passos): ↓ → → → ↑ →.

## Vigia das pedras

Alcance a concha além das duas posições da garça. A pedra alta evita a subida da água, mas não protege do rasante. A garça alterna os dois alvos.

```text
S=H..=C
..H#H##
```

Garça: primeiro rasante no passo 4, depois a cada 5; alvo(s): (2, 0) → (4, 0).

Rota sem levadas (8 passos): → → → → ↓ ↑ → →.

## Escolha de margem

Escolha por qual braço passar e alcance a concha. Os dois braços se juntam no mesmo refúgio. Observe em qual margem o próximo ataque cai.

```text
S...H###
.##=H=HC
..H=H..#
##...###
```

Garça: primeiro rasante no passo 3, depois a cada 3; alvo(s): (3, 0) → (3, 2) → (6, 1).

Rota sem levadas (12 passos): ↓ ↑ ↓ ↓ → → → → → → ↑ →.

## Fragmento no alcance do bico

Pegue o fragmento e volte à saída. Chegar até o fragmento não basta: deixe-o para o turno seguro e prepare a volta.

```text
SG=H..
###.#B
###H..
```

Garça: primeiro rasante no passo 10, depois a cada 4; alvo(s): (5, 1).

Rota sem levadas (15 passos): → → → ↓ ↑ → → ↓ ↑ ← ← ↓ ↑ ← ←.

## Fresta da vazante

Busque o fragmento além do banco dobrado e volte. Dois baixios seguidos pedem a janela inteira. A volta pelo sul tem só um, mas a garça alterna os alvos.

```text
SGH==H.B
##.##.#.
##H=HH..
```

Garça: primeiro rasante no passo 10, depois a cada 4; alvo(s): (5, 1) → (7, 0) → (2, 0).

Rota sem levadas (23 passos): → ← → ← → → → → → → ← → → ↓ ↓ ← ← ← ← ← ↑ ↑ ←.

## Ecos do rasante

Recolha dois fragmentos, em braços diferentes, e retire-se pelo centro. A patrulha alterna os pontos-chave. Planeje os dois retornos à ilha firme, não só a primeira travessia entre margens.

```text
B.H=H####
.#..H==B#
#..S.H=.#
##H=HG###
```

Garça: primeiro rasante no passo 12, depois a cada 3; alvo(s): (2, 0) → (7, 1) → (5, 3).

Rota sem levadas (29 passos): ↑ ↑ ↓ ↓ ↑ ↓ ↑ ↑ ↓ ← ↑ ← ← → → ↓ → → → → → ↓ ↑ ↓ ← ← ← ↓ →.

## Vigia partilhada

Use a placa para cruzar o portão e reúna os dois siris depois do rasante. A garça também alcança quem está parado. Cruze na janela da placa e retire o parceiro antes que o rasante volte.

```text
S=H.D.C
#######
A=H.P#.
###H=HT
```

Garça: primeiro rasante no passo 9, depois a cada 4; alvo(s): (4, 2) → (5, 0) → (6, 3).

Rota sem levadas (21 passos, 3 trocas): → → → ← → ← → X → → → ↓ ↑ ↓ ↑ → X → → → X ↓ → →.
