# Recriar Siri na Areia — Notas Claras

Composição, timbres sintéticos e oito arranjos originais, sem amostras externas. O master da Praia usa a partitura da prévia aprovada. Todos os arranjos compartilham a mesma melodia, andamento (97 BPM) e duração; muda o apoio harmônico e o brilho em cada ilha.

A compilação do jogo usa os MP3 já versionados. Para refazer a **trilha**, use Python 3 com NumPy e SciPy e FFmpeg com libmp3lame:

```sh
python3 scripts/trilha/partitura.py
python3 scripts/trilha/sintetizar.py
python3 scripts/trilha/arranjar.py
```

`siri-na-areia.json` guarda a partitura; os dois primeiros comandos renderizam a fonte da Praia novamente. O terceiro gera os oito MP3 em `assets/audio/trilha/` e confere a decodificação de 1.425.155 amostras PCM estéreo a 48 kHz por faixa. Versões do encoder podem mudar os bytes dos MP3; compare a duração e ouça a emenda ao regenerar. WAVs e saídas intermediárias não são necessários para jogar.

| Mundo | Timbre e apoio |
| --- | --- |
| Praia das Conchas | Marimba Notas Claras original |
| Recifes Expostos | Malhete de vidro, acordes abertos |
| Mangue dos Siris Duplos | Madeira seca, baixo mais presente |
| Enseada da Garça | Palheta aérea, apoio espaçado |
| Ilhas à Deriva | Malhete de aço redondo, apoio em contratempo |
| Grutas da Espuma | Sino abafado, apoio invertido |
| Baía da Ressaca | Corda mais firme, acentos adiantados |
| Arquipélago do Farol | Celesta, acordes abertos |

O arquivo `manifesto-web.sha256` registra os oito MP3 aprovados. Para validar a cópia, na raiz do jogo execute `sha256sum -c scripts/trilha/manifesto-web.sha256`.
