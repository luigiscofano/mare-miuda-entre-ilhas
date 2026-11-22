# Fenda de Recife

A estreia fica na **Enseada da Garça**, mundo 4, em **Bônus e desvios**. Conclua **Abrigo entre ondas** para abrir **Entre duas fendas**, que depois abre **A fenda da vazante**. São duas fases opcionais: a Enseada continua com 25 travessias regulares e as viagens, chefes e finais usam os mesmos requisitos. O save local continua na versão 1; cenas, mapas clássicos e o Miudezas não foram alterados.

## Regras

- Cada par liga duas posições, nos dois sentidos. As duas bocas têm a mesma silhueta de rocha. A fenda é um metadado sobre chão (.) ou baixio (=), não um novo tipo de piso.
- O siri ativo precisa **pisar** na boca. Se os dois lados estiverem secos no começo do passo, ele sai do outro lado de imediato; isso custa um único passo e não provoca outra travessia. Trocar de siri ou passar da alta à baixa sem sair da boca não aciona nada.
- Se um lado estiver submerso no começo do passo, o par fecha. A outra boca vira piso comum, marcado por um contorno na areia. A água preserva a textura original e impede caminhar na boca alagada.
- Se a saída ativa estiver ocupada por outro siri ou bloqueada, a jogada inteira é rejeitada. O painel explica o motivo e a maré não anda.
- Depois da travessia, a virada da maré e outras ameaças são resolvidas na posição final. Pisar no terceiro passo da maré baixa para uma saída no baixio pode causar uma levada. O painel indica as coordenadas de entrada e saída; o tabuleiro marca a chegada e usa um **!** se ela alagar no próximo passo.

## Fichas de ensino

**Entre duas fendas:** a boca redonda atravessa a parede. Solução: **→ →**. O primeiro passo basta para ir de uma boca à outra.

**A fenda da vazante:** a fenda estreita liga areia firme a baixio. Solução sem levadas: **→ → ↓ → ↑ ↓ ↑ →**. No quinto passo, o siri está na boca seca, mas não viaja porque a outra está submersa. Ele sai para fazer a maré baixar e entra de novo. Outra tentativa útil: **→ → →** demonstra que a saída alaga no terceiro passo.

## Verificação

Na raiz do projeto, execute `node --test tests/fenda-recife.test.ts`, `npm test`, `npm run build` e `npm run test:offline`. Abra `dist/mare-miuda-prototipo.html` e repita as duas soluções. Compare a previsão e as formas antes e depois da virada, reinicie após uma levada, volte ao seletor e recarregue para confirmar o save. Partindo de um save antigo da Enseada com o marco de referência concluído, os novos desvios ficam disponíveis sem repetir fases antigas.
