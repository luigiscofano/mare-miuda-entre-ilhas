# A Outra Margem

[Voltar ao guia de arte](../README.md) · [Produção e verificação](../../producao/README.md#validação-da-trilha-sonora)

**A Outra Margem** acompanha a edição offline de *Maré Miúda: Entre Ilhas*. A versão escolhida é para **violão de nylon**: baixo discreto, poucas notas de acompanhamento e espaço entre as frases da melodia. O tema atravessa os oito mundos como uma faixa única. Não há uma faixa separada por mundo, nem versão de piano no jogo.

[Ouvir a versão aprovada em violão (MP3)](a-outra-margem-violao.mp3). O arquivo de escuta termina com uma saída suave; o jogo usa o WAV sem esse efeito para repetir sem pausa.

## Como a faixa foi construída

![Mapa das notas de A Outra Margem: baixo em verde, notas internas em dourado e melodia clara distribuídos em 16 compassos](construcao-a-outra-margem.svg)

O quadro veio dos eventos de nota da composição usada no jogo. O eixo horizontal marca os **16 compassos em 4/4, a 90 BPM**; o eixo vertical mostra a altura. Cada barra indica o momento de entrada e a duração de uma nota programada. Não é uma transcrição por ouvido nem uma tablatura.

| Parte | Notas | Papel |
| --- | ---: | --- |
| Baixo | 16 | Uma entrada por compasso; sustenta o dedilhado em registro grave. |
| Notas internas | 15 | Entradas espaçadas no acompanhamento, sem dobrar a melodia com acordes cheios. |
| Melodia | 45 | Abre com Lá4–Fá♯4–Mi4, chega a Fá♯5 no compasso 9 e fecha em Ré4 no compasso 16. |

As três partes usam o timbre de **violão de náilon** (programa MIDI indexado em zero: 24). Variações pequenas de início, de até 7 ms, e de intensidade dão diferenças ao ataque das notas. O renderizador produz três voltas e usa a do meio para manter o ambiente do áudio na emenda. O ciclo final tem 42,6667 segundos e não inclui o fade do MP3 de escuta.

[Baixar as 76 notas da composição em CSV](eventos-a-outra-margem.csv).

## Como funciona no jogo

O som começa após um gesto. A mesma faixa segue durante as trocas de tela e de mundo, incluindo a passagem do seletor para a fase e a volta. Música e efeitos têm controles independentes. Zerar o volume da música silencia sem voltar ao início da faixa; ocultar a aba pausa a reprodução, que retoma do último ponto quando o navegador volta a permitir áudio.

Os efeitos de jogo permanecem separados da música. As indicações visuais e textuais continuam permitindo jogar sem som.

[Ouça os 11 efeitos e veja quando são usados](../efeitos-sonoros/README.md). A faixa em violão não foi alterada pelo ajuste dos efeitos.

[Regule os volumes em **Som e música** ou **Configurações**](../../interface/README.md#painéis-de-apoio).

Ouça a trilha em contexto no [filme Os oito mundos](../animacoes/README.md#os-oito-mundos), com os efeitos do jogo na montagem.

## Arquivo usado

| Parâmetro | Valor |
| --- | --- |
| Empacotamento | [`edicao-oficial/assets.zip`](../../../edicao-oficial/assets.zip), entrada `assets/audio/a-outra-margem-violao.wav` |
| Áudio | WAV, PCM de 16 bits, estéreo, 48 kHz |
| Loop | 2.048.000 quadros de amostra, 42,6667 s |
| SHA-256 do WAV | `d74670604f0f39e99d0390e76772c865486f898358800d71f4d28173dea36bf6` |

© 2026 Luigi Scofano de Araújo. Todos os direitos reservados.
