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
