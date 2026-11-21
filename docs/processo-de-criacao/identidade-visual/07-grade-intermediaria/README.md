# 07 · Redesenho com grade intermediária

Variação da [dupla conceitual de 724 × 543](../06-redesenho/), feita a partir das mesmas composições-fonte. **544 × 408** conserva o enquadramento 4:3, com 24,9% menos células por lado e 43,5% menos ao todo. Estas imagens não são capturas, não foram aplicadas e não substituem os arquivos anteriores.

- [Arquipélago](01-arquipelago-grade-544.png): oito massas, sem mudanças de silhueta geral ou ordem, e com faces contrastadas nos cristais e nos picos.
- [Caminho das Conchas](02-caminho-das-conchas-grade-544.png): preserva luz, rochas estratificadas, percurso principal e ramal visível. O bem-te-vi segue ausente. O siri de 35 × 27 foi composto em resolução nativa, depois de refazer a grade do cenário; não foi esticado, reconstruído ou recolorido.

Na nova grade, as bases usam 72 cores indexadas opacas, sem dither. Removemos apenas pontos de baixo contraste isolados entre quatro vizinhos idênticos; mantivemos glints e recortes fortes. `fontes/` guarda os cenários e a camada do siri separadamente. `python exportar.py` (Pillow 13) recompõe os arquivos finais, confere pixel a pixel o sprite e valida o round-trip exato da ampliação 2× por vizinho mais próximo.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
