# Campanha e mapa-múndi

**Planejado.** O protótipo tem seleção de três testes, não um mapa autoral. Na fatia vertical, a Praia das Conchas terá percurso caminhável, bifurcação e retorno. Depois, Recifes e Mangue podem ser feitos em qualquer ordem; completar ambos libera a Enseada. Segredos dão recompensas opcionais e nunca travam a história. Atalhos evitam refazer trechos.

| Mundo | Introdução → aplicação → combinação → domínio |
| --- | --- |
| Praia das Conchas | Contar passos → sair antes da subida → dois baixios com refúgio → desvio opcional. |
| Recifes Expostos | Pedra alta vs. intransitável → refúgio → dois fragmentos → ida e volta em mais de um ciclo. |
| Mangue dos Dois Siris | Troca de personagem → duas posições → contador compartilhado → reunião por rotas distintas. |
| Enseada da Garça | Ver marca → abrigo → ameaça com maré → dois cruzamentos planejados. |
| Ilhas à Deriva | Prever posição da balsa → travessia → resgate e retorno → duas balsas com refúgio. |
| Grutas da Espuma | Transportar item → abrir saída em etapas → mecanismos em lados opostos → ordem de câmaras e retorno. |
| Baía da Ressaca | Ler aviso → sobreviver → atrair ataque → ativar três ancoradouros na arena. |
| Arquipélago do Farol | Travessia de revisão → dupla, plataforma e vigia → rota principal e segredo → farol. |

Cada etapa autoral terá objetivo, regra nova, mapa, solução, sequência de ensino, pontos confusos e condições de reinício. Ao adicionar persistência, use chaves de armazenamento exclusivas do projeto e IDs de progressão versionados.

## Implementado na fatia vertical

Mapa em casas ortogonais, com símbolos de entrada e portões nas extremidades das arestas:

```
#########
#S1.2.3F#
###.##.##
###O#..##
###...###
```

S: cais · 1: Primeira onda · 2: Sombra da garça · 3: Busca e volta · O: Ilhota Perolada · F: encontro final · #: água fora da rota.

- A vitória na Primeira onda abre a bifurcação e a travessia seguinte.
- A vitória na Ilhota dá a Concha Perolada e abre os portões do atalho, sem substituir o desbloqueio concedido pela Sombra da garça.
- As vitórias 2 e 3 são necessárias para alcançar a ponta da praia. A concha não atrasa a rota principal.
- Depois de concluir o encontro, é possível entrar nos créditos ou voltar para explorar. Tentativas são reiniciadas ao entrar na fase; a posição no mapa e as vitórias são persistidas.

A tabela anterior continua sendo o plano da campanha, não indicação de mundos disponíveis.
