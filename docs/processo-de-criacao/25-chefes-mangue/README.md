# Chefes do Mangue dos Siris Duplos

São dois marcos extras: em **Reencontro na ponta do mangue**, siga **→** para o Guardião. Ao vencê-lo, **↓** abre Dupla no Mangue. Retorne por **↑** e **←**. Nenhuma arena conta entre as dez regulares nem muda o caminho à Enseada.

## Guardião da Raiz

No tabuleiro de 13 × 3, cada raiz numerada só aceita a placa do mesmo número. Verde sustenta a primeira para Coral atravessar. Do outro lado, Coral segura a segunda para Verde passar. As duas usam o mesmo relógio de maré; trocar de siri não gasta passo. O mapa e a previsão distinguem os dois pares por número, coordenada e estado.

**Rota mínima sem levadas:** `XRRRXRLRRRRRRRXRRXRRXRRXRRRXRRLRRRR` · 28 passos.

## Dupla no Mangue

No tabuleiro de 14 × 5, a placa, o baixio norte e o baixio sul entram na rota de rasantes. O aviso mostra o alvo do próximo passo. Planeje a entrada e depois tire o siri parado da linha da garça; os bolsos laterais permitem ajustar o tempo sem expor os dois. A maré continua virando a cada três passos; a patrulha não depende de tempo real.

**Rota mínima sem levadas:** `XRRRXRRRRRRXRRRRXRRXRDURRRRXRDURRDUDURRXR` · 34 passos, contra 32 sem a garça. Para testar o aviso: `XRRRRRRRXRRR` deixa Verde parado na placa; `L` no passo 11 dispara uma única levada.

`U/D/L/R` indicam cima/baixo/esquerda/direita; `X` troca o siri ativo. As duas travessias exigem movimento dos dois siris. A busca cobre 4.272 estados no Guardião e 8.723 na Dupla, sem posição firme alcançável que obrigue a reiniciar. Se os dois forem deixados em baixios que inundam no mesmo passo, a perda ainda acontece e retorna às últimas posições firmes. O save guarda a conclusão, não a tentativa corrente.

O roteiro Playwright cobre placas distintas, aviso e perda, reinício, as duas vitórias, retorno e save por teclado e toque emulado. Aparelho físico não testado.
