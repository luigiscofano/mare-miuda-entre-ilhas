# 06 · Redesenho de cenário do zero

Duas **prévias concebidas do zero**, sem copiar pixels, contornos, traçado ou objetos de estudos anteriores. Nenhuma foi adotada no runtime. Travessia, Miudezas, a logo A, o desenho do siri e todos os estudos anteriores ficaram intactos.

- [Arquipélago](01-arquipelago-redesenho.png): oito silhuetas em 3/4, separadas por canais: costa tropical em terraços, mangue, cavernas, cristais, cascatas, recife em laço, neve e vulcão.
- [Caminho das Conchas](02-caminho-das-conchas-redesenho.png): escadaria curta, trilha em S e bifurcação entre a gruta e a pequena enseada. Rocha estratificada, vegetação e recifes submersos usam a mesma luz. O bem-te-vi não aparece.
- Os caminhos, patamares e silhuetas deste estudo ainda não amarram colisões, regras nem o fluxo definitivo de navegação.

---

<details>
<summary>Fontes, grade e verificação</summary>

As bases de composição foram criadas com assistência de geração de imagem e discretizadas para 724 × 543 células lógicas sólidas. Cada cenário-base usa até 80 cores opacas indexadas, sem dither, transparência ou filtros de ampliação. `fontes/` conserva os cenários-pixel sem personagem, editáveis, e o sprite aprovado isolado, de 35 × 27. A composição não redimensiona nem recolore o personagem.

Execute `python exportar.py` com Pillow 13 para refazer os dois PNGs deste relatório a partir das camadas conservadas. O script verifica dimensões, igualdade de cada pixel opaco do siri, opacidade dos cenários e round-trip exato da escala 2× por vizinho mais próximo. PNGs finais são indexados sem mudar o RGB de nenhuma célula.

</details>

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.
