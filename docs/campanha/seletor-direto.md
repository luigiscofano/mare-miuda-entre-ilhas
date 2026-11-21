# Seletores diretos de fases

O Arquipélago permanece o mapa de seleção de mundos. Dentro de cada mundo, escolha um botão pelo nome. Travessias, bônus, chefes e viagens ficam separados. Cabo Baixo e Enseadinha continuam duas telas da Praia das Conchas; as duas formas de embarcar preservam os requisitos originais. As fases concluídas podem ser rejogadas.

## Bloqueios e salvamento

A camada em [seletor.ts](../../src/campanha/seletor.ts) usa as entradas do grafo e a mesma verificação de alcance empregada para normalizar saves. Um clique ou acionamento por teclado revalida a entrada, preserva o mundo e grava a posição do marco original, sem marcar vitória. O motor continua aplicando regras e conclusão. Em viagens, o mesmo adaptador chama `viajar` com os destinos originais. Não há chaves de save novas.

Acessibilidade: Tab percorre botões em ordem de leitura. Enter e Espaço ativam o botão focado. Bloqueios são informados por texto, não apenas por cor, e a ação fica desabilitada. O foco vai ao título ao entrar e voltar. O teclado de movimento só vale no tabuleiro e no Arquipélago.

## Composição provisória e próxima revisão de arte

O [adaptador de interface](../../src/interface/seletor.ts) organiza grupos de botões HTML por tema e mantém cada `data-marco` ligado ao ID estável da campanha. A composição atual é provisória: círculo de areia, coral serrilhado, margens de mangue, asas da Enseada, dois cais, arco das Grutas, ondas da Baía e estrela do Farol. A geometria está isolada na apresentação; os pontos/cores dos quadros futuros não precisam mudar os IDs, o grafo ou o DOM acessível. Em telas estreitas, as linhas podem quebrar sem esconder informações.

Os fundos, fontes, pranchas e renderizadores anteriores não foram sobrescritos. Consulte [o processo de criação](../processo-de-criacao/README.md), especialmente os cadernos 34–37. As propostas não substituem o cenário dentro da travessia ou o mapa caminhável do Arquipélago. Arte final e publicação são etapas à parte.
