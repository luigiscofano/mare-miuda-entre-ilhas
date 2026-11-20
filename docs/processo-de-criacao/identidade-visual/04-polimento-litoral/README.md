# 04 · Polimento do litoral

Prévia visual, não captura do jogo. Esta rodada não adota cenários, altera a logo A ou modifica o Miudezas. Os estudos da rodada anterior permanecem em [03 · Refinamento do litoral](../03-refinamento-litoral/).

- [Arquipélago](renders/02-arquipelago-3x.png): mesmas oito posições e ligações. O relevo tem luz e sombra por face, cristas nevadas, estratos de lava, cristais de tamanhos e inclinações diferentes e motivos para as outras ilhas. Os motivos não renomeiam mundos nem impõem novas mecânicas.
- [Caminho das Conchas](renders/03-mapa-da-praia-3x.png): mantém disposição, ramal e entradas, com vegetação costeira de copas variadas, rochas fendidas, dois tipos de poça, grãos de areia esparsos e bem-te-vi mais esguio. A [assinatura do portfólio](https://github.com/luigiscofano/portfolio/blob/15b90fe3a7378e0a37df721e1cdd6d28e509bfdb/public/images/assinatura-bem-te-vi.svg#L18-L31) é referência de proporção de bico, barriga e patas; nenhum asset do portfólio foi incorporado.
- [Travessia](renders/04-travessia-malha-3x.png): conserva o siri e a malha aprovada. Pequenos traços de 1 px delimitam células bloqueadas sem o fundo retangular; pedra grande conserva ocupação de duas células e as menores de uma.
- [Siri aprovado, camada isolada](renders/siri-aprovado-1x.png): exportação direta da função `crab()` da rodada anterior, sem redesenho, 35 × 27, âncora lógica (17, 15), com a sombra opaca original dentro do sprite e alfa 0 apenas fora dele.

---

<details>
<summary>Fonte e verificação</summary>

Execute `python desenhar.py` com Pillow 13. O gerador mantém os estudos na grade de 386 × 272 e grava PNGs ampliados por vizinho mais próximo (3×); verifica opacidade e igualdade byte a byte entre o original e a redução do ampliado. A camada do siri verifica alfa binário. O corpo de `crab()` foi comparado exatamente com a rodada aprovada.

</details>

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
