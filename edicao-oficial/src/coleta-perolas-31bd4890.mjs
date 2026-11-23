                                                       

                                                                                             
const porFase = new WeakMap                        ();

function coletaveis(fase      )                   {
  const anterior = porFase.get(fase);
  if (anterior) return anterior;

  const indices = new Map                ();
  const usaSaidaComColeta = fase.mapa.some(linha => linha.includes('G'));
  if (usaSaidaComColeta) {
    const largura = fase.mapa[0].length;
    fase.mapa.forEach((linha, y) => {
      [...linha].forEach((casa, x) => {
        // A ordem vem do mapa inicial, nunca da ordem em que o jogador coleta.
        if (casa === 'B') indices.set(y * largura + x, indices.size);
      });
    });
  }
  const dados = { perolas: indices.size > 0, indices };
  porFase.set(fase, dados);
  return dados;
}

export function coletaPerolas(fase      )          {
  return coletaveis(fase).perolas;
}

export function indiceDaPerola(fase      , { coluna, linha }         )                     {
  const largura = fase.mapa[0].length;
  if (coluna < 0 || coluna >= largura || linha < 0 || linha >= fase.mapa.length) return;
  return coletaveis(fase).indices.get(linha * largura + coluna);
}

const TERMOS_VISIVEIS = [
  [/\bdo segundo fragmento\b/g, 'da segunda pérola'],
  [/\bo segundo fragmento\b/g, 'a segunda pérola'],
  [/\b([Oo])s (dois|três) fragmentos\b/g, (_        , o        , total        ) =>
    `${o === 'O' ? 'As' : 'as'} ${total === 'dois' ? 'duas' : total} pérolas`],
  [/\btodos os fragmentos\b/g, 'todas as pérolas'],
  [/\b([Oo])s fragmentos\b/g, (_        , o        ) => o === 'O' ? 'As pérolas' : 'as pérolas'],
  [/\b([Oo]) fragmento\b/g, (_        , o        ) => o === 'O' ? 'A pérola' : 'a pérola'],
  [/\b([Uu])m fragmento\b/g, (_        , u        ) => u === 'U' ? 'Uma pérola' : 'uma pérola'],
  [/\bseu fragmento\b/g, 'sua pérola'],
  [/\bdo fragmento\b/g, 'da pérola'],
  [/\bao fragmento\b/g, 'à pérola'],
  [/\bfragmentos\b/g, 'pérolas'],
  [/\bfragmento\b/g, 'pérola'],
  [/\ba pérola da bacia e o da margem\b/g, 'a pérola da bacia e a da margem'],
  [/\bUma pérola fica atrás do baixio e o outro\b/g, 'Uma pérola fica atrás do baixio e a outra'],
  [/\bsua pérola de volta da placa\. O coral só chega ao outro\b/g,
    'sua pérola de volta da placa. O coral só chega à outra'],
  [/\babrir a ostra\b/g, 'alcançar a Concha de Chegada'],
  [/\babra a ostra\b/g, 'alcance a Concha de Chegada'],
  [/à ostra\b/g, 'à Concha de Chegada'],
  [/\ba ostra\b/g, 'a Concha de Chegada'],
]         ;

export function textoDaColeta(fase      , texto        )         {
  if (!coletaPerolas(fase)) return texto;
  // Algumas fichas da expansão antecedem a aprovação das pérolas.
  // Ajuste apenas o texto visível; não altere as fichas, IDs ou saves.
  for (const [termo, substituto] of TERMOS_VISIVEIS) {
    texto = typeof substituto === 'string' ? texto.replace(termo, substituto) : texto.replace(termo, substituto);
  }
  return texto;
}
