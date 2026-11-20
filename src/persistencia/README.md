# Persistência

O protótipo da Praia usa apenas a chave `mare-miuda-entre-ilhas/praia-v1` no armazenamento local, sem dados fora desse jogo. Grava quando muda de posição no mapa, conclui fase ou altera uma preferência. O documento contém versão do esquema, posição, IDs de fases concluídas, marca de tutorial e volumes. Nenhum save de tentativa ou reset de outros projetos. Se o navegador bloquear o storage, a praia avisa e continua em memória. Ao retomar, use o mesmo navegador e abra o jogo da mesma origem ou do mesmo caminho de arquivo.

Desde o lote 1, o mesmo registro tem um campo opcional `mundo` (praia, arquipélago, recifes ou mangue). Ausência do campo em v0.2 significa Praia. O identificador estável de cada fase, a posição e os volumes continuam no mesmo namespace. O barco e o atalho não mudam regras de save; apenas gravam o novo mundo/ponto caminhável.

Na navegação por marcos, a chave e o esquema legados permanecem. Uma posição já em nó alcançável continua a mesma. Casas antigas intermediárias são arredondadas para o nó alcançável mais próximo (distância ortogonal; empates pela ordem de acesso das trilhas). Nenhum portão é liberado pela migração. Região, vitórias, preferências de áudio e tutorial são mantidos.

As três fases das Grutas e seus nós passam pela mesma validação de IDs e posições do save v1. Salva-se a conclusão e o local no mapa, não a pérola nem a sequência de uma tentativa.
