                                                                                            
                                                              
                                                                

const MARGEM = 2;
export const MODELOS_OCEANICOS = {
  bloco: { largura: 32, altura: 20 },
  seixo: { largura: 30, altura: 17 },
  afloramento: { largura: 40, altura: 23 },
}         ;

// As três formas são âncoras do cenário, não casas nem entidades do motor.
// A margem fica reservada mesmo com toda a grade coberta na maré alta.
export function obstaculosOceanicos(grade           , largura        , altura        ,
  idFase = '')                                             {
  const fimGrade = grade.x + grade.largura;
  const encaixar = (forma               , esquerda         , faixa        )            => {
    const modelo = MODELOS_OCEANICOS[forma];
    const inicioFaixa = esquerda ? 0 : fimGrade;
    const fimFaixa = esquerda ? grade.x : largura;
    const espaco = fimFaixa - inicioFaixa;
    const l = Math.min(modelo.largura, espaco - MARGEM * 2);
    if (l <= 0) throw new RangeError('A Travessia precisa de margem para as estruturas oceânicas.');
    const a = Math.max(1, Math.round(modelo.altura * l / modelo.largura));
    return {
      forma, largura: l, altura: a,
      x: inicioFaixa + Math.floor((espaco - l) / 2),
      y: Math.floor(altura * faixa - a / 2),
    };
  };

  // Na prévia oficial da Trilha das Pedras, o aglomerado continua à esquerda.
  return [
    encaixar('bloco', true, 0.27),
    encaixar('seixo', false, 0.27),
    encaixar('afloramento', idFase === 'praia-trilha-das-pedras', 0.74),
  ];
}
