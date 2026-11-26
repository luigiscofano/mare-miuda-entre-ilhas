# Primeira Partida · 26/11/2026

[Jogar esta versão histórica](https://luigiscofano.github.io/mare-miuda-entre-ilhas/versoes/primeira-partida-2026-11-26/) · [Baixar esta versão](https://luigiscofano.github.io/mare-miuda-entre-ilhas/downloads/Mare-Miuda-Primeira-Partida-Arquivo.zip)

**Português** · [English](README.en.md) · [Todas as versões marcantes](../README.md)

Reconstrua a cópia jogável a partir do repositório. Você precisa de um clone completo, Git, `tar` (disponível no Git Bash no Windows) e Python 3.10 ou posterior. Rode na raiz:

```sh
python3 docs/versoes-marcantes/primeira-partida-2026-11-26/reconstruir.py dist/primeira-partida-2026-11-26
```

Abra o `Jogar-agora.html` gerado no Chrome ou Edge. Depois de montado, ele não precisa de internet. `Outras-travessias.html` abre as amostras da Garça e do Farol. O comando também gera a edição web e inclui o roteiro de teste com três jogadores.

## O que marcou esta edição

- A orientação de teclado ou toque some após o primeiro passo. Um filete ciano mostra qual baixio vai alagar na primeira virada.
- O jogo diferencia passo aceito, caminho bloqueado e Siri em recuperação. A passada continua durando 205 ms.
- O HTML offline caiu de 61,7 MB para 19,3 MB; as 231 soluções foram verificadas.
- A cópia de prévia tem progresso separado do oficial. As amostras não gravam progresso.

## Integridade

O script exporta a revisão `205df4e4259b9c866fe8305b87dad1dfa94c00e5`, aplica o patch congelado em uma pasta temporária e verifica os bytes originais de `Jogar-agora.html` (19.320.663 bytes) e `web/index.html` (507.911 bytes). A montagem atual não entra na reconstrução.

A lista [`SHA256SUMS`](SHA256SUMS) registra os dois pontos de entrada reconstruídos e a assinatura do ZIP offline original, que não está versionado.
