# Áudio

> **Registro histórico.** Este documento descreve a trilha *Siri na Areia — Notas Claras*, usada antes da edição offline com *A Outra Margem*. As instruções abaixo são da revisão anterior e não constroem a trilha atual. Veja [a trilha sonora da edição offline](../../docs/arte/trilha-sonora/README.md).

**Siri na Areia — Notas Claras** tem oito arranjos (um por mundo), a 97 BPM. Praia e Enseadinha usam o mesmo arranjo. O Arquipélago conserva a última faixa, sem criar uma nona. A Praia vem do ciclo PCM da versão aprovada. A pauta e o renderizador estão em [scripts/trilha](../../scripts/trilha/README.md).

O jogo só busca e decodifica a faixa em uso após ativação do áudio por gesto. Cada MP3 carrega como um `AudioBuffer` em loop; os arranjos têm um período comum de 1.425.155 amostras a 48 kHz. Nas viagens, o novo loop começa na posição correspondente do relógio compartilhado e cruza com o anterior em 440 ms. A passagem mapa → fase → mapa no mesmo mundo não cria outra fonte. Ficam em cache até três buffers, além de uma possível faixa em transição.

A música e os efeitos saem por ganhos independentes e os controles são guardados no save atual, sem migração. Os efeitos sintetizados sinalizam subida, descida, coleta, erro e vitória; os textos continuam sendo a fonte principal de feedback. Música a zero, aba oculta ou contexto interrompido pausam o relógio musical e cancelam downloads pendentes. Se o navegador não retomar sozinho, o próximo gesto confiável tenta de novo. Um arquivo ausente ou indecodificável não interrompe o jogo e mantém a faixa anterior, se disponível; outro gesto pode recuperar a faixa.

O build servido copia os MP3; o HTML autônomo incorpora as oito faixas em blocos inertes e converte em bytes só quando pede uma faixa. Não há CDN nem requisições externas. `npm test` cobre máquina de estados, ganhos e falhas simuladas; `npm run build && npm run test:offline` prova a igualdade dos bytes do build. Teste físico no Safari segue separado.
