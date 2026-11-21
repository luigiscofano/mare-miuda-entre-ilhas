# Recursos de execução

`logo-placa-de-areia-pt.png`: cópia byte a byte do [PNG lógico aprovado da Placa de Areia](https://github.com/luigiscofano/mare-miuda-entre-ilhas/blob/d6695646fc0898666b843929468e8132d3d7b58c/docs/processo-de-criacao/identidade-visual/01-placa-e-corrente/renders/enseada-pt-1x.png), 180 × 94, com alfa somente 0 ou 255. SHA-256: `3d96700e26c84adb3d222ade23c741fea37a3828606e415c5a949eec8e762e7c`.

O recorte do siri aprovado é idêntico aos pixels da placa: origem (75, 3), 31 × 23, com 447 pixels opacos. A Travessia e os mapas usam o próprio PNG da abertura como fonte, sem uma segunda cópia ou recoloração do protagonista.

O build modular copia o PNG sem conversão. A versão autônoma encaixa os mesmos bytes. A escala de exibição é um múltiplo inteiro dos pixels lógicos, sem suavização.

A versão em inglês e a opção Corrente de Espuma (B) permanecem no [acervo dos estudos](https://github.com/luigiscofano/mare-miuda-entre-ilhas/pull/3), sem fazer parte do jogo em português.

© 2026 Luigi Scofano de Araujo. Todos os direitos reservados.

`cabo-baixo-192.png` é o fundo nativo do estudo aprovado, preservado byte por byte (192 × 144). A camada de seleção é desenhada pelo jogo; o protagonista vem do recorte da placa, não do fundo. Estudos de novos fundos permanecem separados.

`fauna/` guarda os cinco PNGs aprovados e a folha nativa de 155 × 23. A cópia do Coral na folha documenta a referência; o jogo continua a recortá-lo da marca. Verde e Amarelo vêm da folha e preservam a geometria. As duas poses da garça são usadas na previsão da Travessia. [Fontes e exportação](../docs/arte/fauna/README.md).

`arquipelago-meia-lua.png` é o fundo RGB de 512 × 384, usado só pelo seletor de mundos. O [caderno Meia-Lua](../docs/processo-de-criacao/33-seletor-arquipelago/README.md) preserva a camada transparente de ilhas e a fonte do exportador; nenhuma rota vem dentro do PNG de execução.

A proposta `enseadinha-512.png` é o fundo nativo (512 × 384) da seleção de fases da Enseadinha, sem marcas de navegação embutidas. [Fonte e exportação reproduzível](../docs/processo-de-criacao/34-seletores-praia/README.md). O arquivo aprovado do Cabo Baixo permanece inalterado.

- `seletor-recifes-512.png` e `seletor-mangue-512.png`: fundos de seletores em 512 × 384 sem marcas, com [fonte e exportador](../docs/processo-de-criacao/35-seletores-recifes-mangue/README.md).

- `seletor-enseada-512.png` e `seletor-deriva-512.png`: fundos ortogonais sem elementos interativos, com [exportador reproduzível](../docs/processo-de-criacao/36-seletores-enseada-deriva/README.md).

- `seletor-grutas-512.png`, `seletor-ressaca-512.png` e `seletor-farol-512.png`: fundos nativos sem elementos interativos, com [exportação reproduzível](../docs/processo-de-criacao/37-seletores-mundos-finais/README.md).
