# Cabo Baixo · siri da marca

Prévia posterior à [versão com níveis](../revisao-niveis/README.md). Mantém o cenário e as cinco entradas exatamente como estavam. Troca apenas o pequeno personagem decorativo na trilha por uma adaptação de 25 × 19 pixels do siri da Placa de Areia. As cores vêm do emblema: contorno ameixa, pinças corais e parte inferior creme. O gesto frontal e as pinças erguidas são os da marca.

O siri de 35 × 27 da Travessia, a própria logo e o jogo ficam intactos. Esta é uma prévia, não uma captura nem um recurso integrado ao jogo. A versão anterior permanece arquivada.

## Fonte e exportação

A base, a antiga camada dos níveis e os sprites estão em `fontes/`. Rode `python exportar.py` com Pillow para produzir a exportação nativa e a prévia em 4×. O exportador compara os pixels com a versão anterior, verifica que a diferença está somente dentro da área do siri e confirma que a ampliação inteira preserva a matriz nativa.
