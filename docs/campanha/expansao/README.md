# Expansão das travessias
Aqui estão as fichas das 33 travessias novas incluídas neste catálogo.

- [Praia das Conchas](praia.md): +18 travessias regulares.
- [Recifes Expostos](recifes.md): +15 travessias regulares.

Cada trecho começa depois de uma travessia regular existente; as novas provas seguintes no mesmo trecho se abrem em sequência. Viagens, bônus, chefes e desfecho não exigem as novas fases. Na Praia, o total soma os seletores Cabo Baixo e Enseadinha.

## Como verificar

1. Na raiz, execute `npm test`. O teste da expansão verifica as soluções sem levadas, as âncoras regulares, a contagem e o save.
2. Execute `npm run build` e `npm run test:offline`. Abra `dist/mare-miuda-prototipo.html` para jogar sem conexão.
3. Em uma partida nova, confira a primeira fase de cada trecho: o bloqueio deve citar a travessia anterior. Vença a anterior, entre na nova por toque ou Tab/Enter e volte. O foco volta ao botão da fase jogada. Após vencer a fase nova, a seguinte fica disponível. Recarregue e confira o estado **Concluída**.
4. Em uma partida antiga, confira os mesmos marcos, opções de viagem, desvios e créditos. No celular, role até o fim do seletor e confira que os botões, motivos e opções de viagem continuam alcançáveis sem rolagem horizontal.
