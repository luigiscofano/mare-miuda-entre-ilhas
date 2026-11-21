import type { Celula, Direcao, Posicao } from '../motor/index.ts';
import { mesmaCasa } from '../motor/index.ts';

export type Sorteio = (limite: number) => number;
type Grade = Celula[][];

const PASSOS: Readonly<Record<Direcao, readonly [number, number]>> = {
  cima: [0, -1], baixo: [0, 1], esquerda: [-1, 0], direita: [1, 0],
};

const ponto = (coluna: number, linha: number): Posicao => ({ coluna, linha });
export const ler = (grade: Grade, p: Posicao) => grade[p.linha]?.[p.coluna];
export function marcar(grade: Grade, p: Posicao, celula: Celula) {
  grade[p.linha][p.coluna] = celula;
}

export function direcao(origem: Posicao, destino: Posicao): Direcao {
  for (const [acao, [x, y]] of Object.entries(PASSOS)) {
    if (origem.coluna + x === destino.coluna && origem.linha + y === destino.linha) return acao as Direcao;
  }
  throw new Error('A trilha gerada contém um salto.');
}

export function gradeVazia(largura: number, siris: number): Grade {
  // Três linhas úteis por margem e uma divisória entre margens.
  return Array.from({ length: siris * 4 - 1 }, () => Array<Celula>(largura).fill('#'));
}

export function embaralhar<T>(itens: readonly T[], sorteio: Sorteio): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = sorteio(i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function abrirMargem(grade: Grade, margem: number, curvas: number, perfil: number, sorteio: Sorteio): Posicao[] {
  const largura = grade[0].length;
  const base = margem * 4;
  // Curvas não usam colunas vizinhas: não criam atalho involuntário entre os desníveis.
  const colunas = Array.from({ length: Math.floor((largura - 2) / 2) }, (_, i) => i * 2 + 1);
  const desvios = new Set(embaralhar(colunas, sorteio).slice(0, curvas));
  const inverter = (sorteio(2) + perfil + margem) % 2 === 1;
  let altura = (sorteio(3) + perfil + margem) % 3;
  const trajeto: Posicao[] = [];
  function abrir(coluna: number) {
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

export function ramoDaMargem(grade: Grade, trajeto: readonly Posicao[], sorteio: Sorteio) {
  const candidatos: { entrada: Posicao; fim: Posicao }[] = [];
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

export function marcarBaixios(grade: Grade, trajeto: readonly Posicao[], quantidade: number,
  protegido: Posicao | undefined, sorteio: Sorteio): boolean {
  const indices = trajeto.flatMap((p, i) => i >= 2 && i < trajeto.length - 1 && ler(grade, p) === '.'
    && (!protegido || !mesmaCasa(protegido, p)) ? [i] : []);
  // Cada baixio precisa de duas casas firmes antes dele para acertar o relógio.
  // Distribua sem bloquear a próxima travessia ou eliminar a espera.
  function escolher(inicio: number, faltam: number): number[] | undefined {
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
