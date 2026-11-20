# Persistência

O protótipo da Praia usa apenas a chave `mare-miuda-entre-ilhas/praia-v1` no armazenamento local, sem dados fora desse jogo. Grava quando muda de posição no mapa, conclui fase ou altera uma preferência. O documento contém versão do esquema, posição, IDs de fases concluídas, marca de tutorial e volumes. Nenhum save de tentativa ou reset de outros projetos. Se o navegador bloquear o storage, a praia avisa e continua em memória. Ao retomar, use o mesmo navegador e abra o jogo da mesma origem ou do mesmo caminho de arquivo.
