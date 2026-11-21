# Trio na Baía e no Farol

Dois desvios opcionais continuam o ensino de Três refúgios, nas Grutas. Os três siris mantêm o relógio de maré compartilhado. Trocar ativo não gasta passo; cada movimento válido custa um. Ninguém precisa refazer um trecho anterior, vencer um chefe ou concluir o trio das Grutas para abrir os novos desvios.

## Eco dos três cais · Baía da Ressaca

- **Acesso:** depois de Cais em paralelo, vire para baixo; para voltar, suba.
- **Tabuleiro:** 11 × 5. Coral e Amarelo atravessam os braços de balsa. Verde cruza dois bolsos firmes, mantém a placa para Coral e depois segue ao marco.
- **Leitura:** na rota de referência, a primeira balsa leva Amarelo; no passo 9, o movimento de Verde transporta Coral, que já estava embarcado. Coral recolhe o fragmento antes do portão.
- **Solução sem levadas:** `RXXRRRRRXRXRRXRXRXRRRRRRXXRRRRXRR` · 23 passos.

## Três luzes em revezamento · Arquipélago do Farol

- **Acesso:** depois de A luz das duas marés, siga para a esquerda; para voltar, vá à direita.
- **Tabuleiro:** 15 × 5. Há dois cais e duas passagens distintas: a porta da placa e o portão de engrenagem. Uma não substitui a outra.
- **Leitura:** Verde pega a pérola no passo 11, cruza de balsa e a encaixa no passo 27. Amarelo usa a outra balsa e sustenta a placa para Coral alcançar a Alavanca B no passo 28. Depois de abrir o portão, os três ocupam os destinos sem expor quem ficou parado.
- **Solução sem levadas:** `XRRRXRRXRRRXXRRXXRRRXRRRLRXRRRRRXRRRRXXRXRRXRRRRRXRRRRR` · 40 passos.

`R/L`: direita e esquerda; `X`: troca, sem passo. Grades e paradas em [`trio-avancado.ts`](../../../src/fases/trio-avancado.ts).

## Verificação

O motor confirmou os menores números de passos sem levadas. Em cada fase, desativar individualmente qualquer balsa ou impedir qualquer um dos três de andar torna a vitória impossível sem levadas. Na Baía, retirar a placa impede a saída; no Farol, retirar placa, pérola, encaixe ou alavanca também impede a vitória. Abertura, retorno, contagem regular e save estão cobertos. O Playwright exercita a carona do siri inativo, a ordem dos mecanismos, os controles e os dois saves por teclado e toque emulado. Não há novo chefe neste lote, nem teste em aparelho físico.
