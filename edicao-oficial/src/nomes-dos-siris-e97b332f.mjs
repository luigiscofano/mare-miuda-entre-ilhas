import { DIRECOES, preverPassoEmGrupo } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                      

export const NOMES_DOS_SIRIS = ['Coral', 'Verde', 'Amarelo']         ;
export const FORMAS_DOS_SIRIS = ['círculo', 'quadrado', 'triângulo']         ;

export function preverDirecoesDaEquipe(fase      , estado        ) {
  return DIRECOES.map(direcao => ({ direcao, ...preverPassoEmGrupo(fase, estado, direcao) }));
}

export const chaveDaPosicao = ({ coluna, linha }                                   ) => `${coluna},${linha}`;

export function entradasDosSiris(previsoes                                           ) {
  const entradas = new Map                     ();
  for (const { movimentos } of previsoes) movimentos.forEach((movimento, i) => {
    if (!('destino' in movimento)) return;
    const chave = chaveDaPosicao(movimento.entrada);
    const grupo = entradas.get(chave) ?? new Set        ();
    grupo.add(i);
    entradas.set(chave, grupo);
  });
  return entradas;
}
