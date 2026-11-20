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
