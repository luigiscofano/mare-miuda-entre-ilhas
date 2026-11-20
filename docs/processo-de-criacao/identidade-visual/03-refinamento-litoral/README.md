# 03 · Refinamento do litoral

São estudos visuais, não capturas do jogo. Nada foi aplicado ao runtime nem à logo A. A rodada anterior continua arquivada integralmente em [Direção litoral](../02-direcao-litoral/).

| Estudo | Proposta |
| --- | --- |
| [Travessia](renders/01-travessia-3x.png) | Siri de frente com pinças mais largas, braços curtos ligados à carapaça e barriga clara. Excluindo o sprite e sua sombra, o tabuleiro é idêntico ao da rodada anterior. |
| [Arquipélago](renders/02-arquipelago-3x.png) | Oito temas de composição: verde-claro, cascatas, vulcão, picos, giros d’água, grutas, costa e cristais. As posições não definem nomes, mecânicas ou correspondências finais. Os caminhos pontilhados são esquemáticos. |
| [Caminho das Conchas](renders/03-mapa-da-praia-3x.png) | Trilha e ramal diagonais, terreno em top-down 3/4, corpos d’água em camadas de fundo, árvores e pedras com pés em terra. Bem-te-vi lateral pequeno, com máscara, sobrancelha clara e barriga amarela. |

---

<details>
<summary>Fonte, grade e verificação</summary>

- Gerador editável `desenhar.py`, Python e Pillow 13; execute `python desenhar.py`.
- Base: **386 × 272**. As versões **1158 × 816** são ampliadas em 3× pelo vizinho mais próximo.
- O gerador verifica alfa opaco e igualdade exata após redução à grade original. A comparação adicional da Travessia localizou todas as mudanças em uma região de 35 × 27, que contém o siri e sua sombra.

</details>

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.

## Exploração e tabuleiro são grades distintas

- Na **fase**, a amostra [04 · Travessia com malha](renders/04-travessia-malha-3x.png) distingue célula atual e vizinhas ortogonais por cantos de cor e textura. Pedras, árvores e outros obstáculos podem ocupar **qualquer número inteiro de células**. A amostra inclui um rochedo com base de duas células, além das pedras de uma célula. A base demarca exatamente as células bloqueadas; as copas e os contornos podem conservar formas orgânicas. A malha serve ao movimento, não à decoração.
- No **seletor**, as trilhas conservam diagonais e curvas, definidas por vértices em vez de células de colisão; o tratamento do terreno não é uma indicação de onde se pode mover na fase.
- [05 · Motivos de ilha](renders/05-motivos-de-ilha-3x.png) mostra raízes de mangue e afloramentos de cristal como amostras de linguagem. Cada identidade pode aparecer nos tabuleiros sem perder areia, mar e a leitura do baixio variável.
