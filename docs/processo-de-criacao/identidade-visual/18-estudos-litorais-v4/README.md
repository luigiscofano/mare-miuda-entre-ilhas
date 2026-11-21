# Estudos litorais V4

Nova composição para a Travessia e novos seletores conceituais para os oito mundos. O seletor geral do arquipélago, a logo e a execução do jogo não mudam. A fase usa o tabuleiro existente da Trilha das Pedras; os seletores interpretam visualmente as trilhas da campanha, sem alterar a navegação. Cabo Baixo representa uma tela da Praia, não as dez fases completas.

| Mundo | Estudo em tamanho nativo | Direção visual |
| --- | --- | --- |
| 1 | [Praia das Conchas](mundos-1-a-4/praia-das-conchas-1x.png) | Dunas claras, coqueiros e falésias quentes. |
| 2 | [Recifes Expostos](mundos-1-a-4/recifes-expostos-1x.png) | Pedra calcária, poças e corais. |
| 3 | [Mangue dos Siris Duplos](mundos-1-a-4/mangue-dos-siris-duplos-1x.png) | Copas densas, raízes e água calma. |
| 4 | [Enseada da Garça](mundos-1-a-4/enseada-da-garca-1x.png) | Promontório de arenito e restinga. |
| 5 | [Ilhas à Deriva](mundos-5-a-8/deriva-1x.png) | Ilhotas separadas por canais e balsas. |
| 6 | [Grutas da Espuma](mundos-5-a-8/grutas-1x.png) | Boca de cavernas, rocha e cristais. |
| 7 | [Baía da Ressaca](mundos-5-a-8/ressaca-1x.png) | Costões e arrebentação. |
| 8 | [Arquipélago do Farol](mundos-5-a-8/farol-1x.png) | Terraços e luz do farol na costa. |

[Travessia em tamanho nativo](travessia/travessia-v4-1x.png) · [Fonte e notas](travessia/README.md). O mar usa correntes, espuma e recifes submersos de silhuetas distintas. A arte da água externa não representa casas navegáveis.

Os oito seletores usam 384 × 288 pixels lógicos; a Travessia, 480 × 360. Os PNGs são RGB sem suavização, e os sprites aprovados foram preservados pixel a pixel. As ampliações de prévia são inteiras por vizinho mais próximo. Em cada subpasta, execute `python3 desenhar.py` com Pillow para reproduzir o estudo e sua exportação ampliada. Trilhas ortogonais são uma linguagem visual no seletor: o deslocamento continua de vértice em vértice. Na fase, o movimento segue as casas da malha.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
