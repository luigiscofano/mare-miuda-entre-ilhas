# 09 · Caminho com grade de 224 × 168

Esta rodada muda **somente o Caminho das Conchas**. A versão do Arquipélago de 288 × 216 aprovada permanece intacta, e todas as [densidades anteriores](../08-grade-compacta/) continuam disponíveis. Nenhuma arte de cenário foi adotada no runtime.

[PNG nativo](02-caminho-das-conchas-grade-224.png) · [Prévia 4×](02-caminho-das-conchas-grade-224-4x.png)

- O Caminho foi discretizado de novo sobre a mesma composição, com 44 cores opacas na base, amostragem mediana discreta e limpeza apenas de pontos isolados de baixo contraste.
- A grade tem cerca de **39,5% menos células** que a versão de 288 × 216. Luz, silhueta, escarpas, duas direções da trilha e enquadramento são mantidos. Não há bem-te-vi.
- O siri é a mesma camada original de **35 × 27**, sobreposta sem reamostrar nem recolorir. A posição foi ajustada para o trecho aberto da trilha na nova grade.

`python exportar.py` com Pillow 13 verifica dimensões, opacidade e correspondência exata de cada pixel do siri, e recompõe ambos os PNGs das camadas em `fontes/`. A ampliação 4× usa vizinho mais próximo e volta exatamente a 224 × 168.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
