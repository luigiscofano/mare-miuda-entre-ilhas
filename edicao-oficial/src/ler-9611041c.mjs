                                                                  
import { mesmaCasa } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';

                                                 
                        

const PASSOS                                                       = {
  cima: [0, -1], baixo: [0, 1], esquerda: [-1, 0], direita: [1, 0],
};

const ponto = (coluna        , linha        )          => ({ coluna, linha });
export const ler = (grade       , p         ) => grade[p.linha]?.[p.coluna];
export function marcar(grade       , p         , celula        ) {
  grade[p.linha][p.coluna] = celula;
}

export function direcao(origem         , destino         )          {
  for (const [acao, [x, y]] of Object.entries(PASSOS)) {
    if (origem.coluna + x === destino.coluna && origem.linha + y === destino.linha) return acao           ;
  }
  throw new Error('A trilha gerada contém um salto.');
}

export function gradeVazia(largura        , siris        )        {
  // Três linhas úteis por margem e uma divisória entre margens.
  return Array.from({ length: siris * 4 - 1 }, () => Array        (largura).fill('#'));
}

export function embaralhar   (itens              , sorteio         )      {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = sorteio(i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function abrirMargem(grade       , margem        , curvas        , perfil        , sorteio         , sentidoDeGrupo          )            {
  const largura = grade[0].length;
  const base = margem * 4;
  // Curvas não usam colunas vizinhas: não criam atalho involuntário entre os desníveis.
  const colunas = Array.from({ length: Math.floor((largura - 2) / 2) }, (_, i) => i * 2 + 1);
  const desvios = new Set(embaralhar(colunas, sorteio).slice(0, curvas));
  const sentidoLocal = (sorteio(2) + perfil + margem) % 2 === 1;
  const inverter = sentidoDeGrupo ?? sentidoLocal;
  let altura = (sorteio(3) + perfil + margem) % 3;
  const trajeto            = [];
  function abrir(coluna        ) {
    const celula = ponto(inverter ? largura - coluna - 1 : coluna, base + altura);
    marcar(grade, celula, '.');
    trajeto.push(celula);
  }
  for (let coluna = 0; coluna < largura; coluna++) {
    abrir(coluna);
    if (desvios.has(coluna)) {
      const subir = altura === 2 || (altura === 1 && sorteio(2) === 0);
      altura += subir ? -1 : 1;
      abrir(coluna);
    }
  }
  return trajeto;
}

export function ramoDaMargem(grade       , trajeto                    , sorteio         ) {
  const candidatos                                       = [];
  for (const entrada of trajeto.slice(1, -1)) {
    for (const [x, y] of Object.values(PASSOS)) {
      const fim = ponto(entrada.coluna + x, entrada.linha + y);
      if (Math.floor(fim.linha / 4) !== Math.floor(entrada.linha / 4) || fim.linha % 4 === 3
        || ler(grade, fim) !== '#') continue;
      const vizinhas = Object.values(PASSOS).map(([dx, dy]) => ponto(fim.coluna + dx, fim.linha + dy));
      if (vizinhas.every(p => mesmaCasa(p, entrada) || !ler(grade, p) || ler(grade, p) === '#')) {
        candidatos.push({ entrada, fim });
      }
    }
  }
  return candidatos[sorteio(Math.max(1, candidatos.length))];
}

export function marcarBaixios(grade       , trajeto                    , quantidade        ,
  protegido                     , sorteio         )          {
  const indices = trajeto.flatMap((p, i) => i >= 2 && i < trajeto.length - 1 && ler(grade, p) === '.'
    && (!protegido || !mesmaCasa(protegido, p)) ? [i] : []);
  // Cada baixio precisa de duas casas firmes antes dele para acertar o relógio.
  // Distribua sem bloquear a próxima travessia ou eliminar a espera.
  function escolher(inicio        , faltam        )                       {
    if (!faltam) return [];
    const ordem = embaralhar(indices.slice(inicio), sorteio);
    for (const indice of ordem) {
      const seguinte = indices.findIndex(item => item >= indice + 3);
      if (faltam > 1 && seguinte < 0) continue;
      const resto = escolher(seguinte, faltam - 1);
      if (resto) return [indice, ...resto];
    }
  }
  const escolhidos = escolher(0, quantidade);
  if (!escolhidos) return false;
  for (const indice of escolhidos) {
    marcar(grade, trajeto[indice], '=');
    if (sorteio(3) !== 0 && ler(grade, trajeto[indice - 1]) === '.') marcar(grade, trajeto[indice - 1], 'H');
  }
  return true;
}

// Quando curvas muito independentes não geram uma rota simultânea,
// use o mesmo relevo base em margens diferentes.
export function construirMargensAlinhadas(grade       , margens                   ,
  dificuldade        , mundo        , sentido         , sorteio         )              {
  const molde = abrirMargem(grade, margens[0], dificuldade + 1, mundo, sorteio, sentido);
  return margens.map((margem, i) => {
    if (i === 0) return molde;
    const trilha = molde.map(p => ponto(p.coluna, p.linha + 4 * (margem - margens[0])));
    for (const p of trilha) marcar(grade, p, '.');
    return trilha;
  });
}
