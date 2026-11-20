import { mesmaCasa } from '../motor/index.ts';
import type { Direcao, Posicao } from '../motor/index.ts';

export type Trilha = 'cais' | 'praia' | 'opcional' | 'atalho';
export type IdFasePraia = 'primeira-onda' | 'sombra-da-garca' | 'busca-e-volta' | 'ilhota-perolada' | 'ponta-da-garca';
export type Progresso = Readonly<{
  posicao: Posicao;
  concluidas: readonly IdFasePraia[];
  viuTutorial: boolean;
}>;
type Entrada = Readonly<{
  id: IdFasePraia;
  posicao: Posicao;
  nome: string;
  opcional?: boolean;
}>;
type Bloqueio = Readonly<{
  de: Posicao;
  para: Posicao;
  precisa: IdFasePraia;
  motivo: string;
}>;

export const MAPA_PRAIA = [
  '#########',
  '#S1.2.3F#',
  '###.##.##',
  '###O#..##',
  '###...###',
] as const;
const CAIS: Posicao = { coluna: 1, linha: 1 };
const ENTRADAS: readonly Entrada[] = [
  { id: 'primeira-onda', nome: 'Primeira onda', posicao: { coluna: 2, linha: 1 } },
  { id: 'sombra-da-garca', nome: 'Sombra da garça', posicao: { coluna: 4, linha: 1 } },
  { id: 'busca-e-volta', nome: 'Busca e volta', posicao: { coluna: 6, linha: 1 } },
  { id: 'ilhota-perolada', nome: 'Ilhota perolada', posicao: { coluna: 3, linha: 3 }, opcional: true },
  { id: 'ponta-da-garca', nome: 'Ponta da garça', posicao: { coluna: 7, linha: 1 } },
];
const BLOQUEIOS: readonly Bloqueio[] = [
  { de: { coluna: 3, linha: 1 }, para: { coluna: 4, linha: 1 }, precisa: 'primeira-onda',
    motivo: 'Conclua a Primeira onda para abrir a passagem da praia.' },
  { de: { coluna: 5, linha: 1 }, para: { coluna: 6, linha: 1 }, precisa: 'sombra-da-garca',
    motivo: 'Afaste-se da garça na travessia anterior para liberar esta passagem.' },
  { de: { coluna: 6, linha: 1 }, para: { coluna: 7, linha: 1 }, precisa: 'busca-e-volta',
    motivo: 'Recupere o fragmento em Busca e volta para chegar à Ponta da garça.' },
  { de: { coluna: 3, linha: 1 }, para: { coluna: 3, linha: 2 }, precisa: 'primeira-onda',
    motivo: 'A trilha opcional aparece depois da Primeira onda.' },
  { de: { coluna: 3, linha: 3 }, para: { coluna: 3, linha: 4 }, precisa: 'ilhota-perolada',
    motivo: 'A Concha Perolada abre este atalho.' },
  { de: { coluna: 6, linha: 1 }, para: { coluna: 6, linha: 2 }, precisa: 'ilhota-perolada',
    motivo: 'A Concha Perolada abre este atalho.' },
  { de: { coluna: 6, linha: 2 }, para: { coluna: 6, linha: 3 }, precisa: 'sombra-da-garca',
    motivo: 'O atalho é só de volta: conclua primeiro a Sombra da garça.' },
];

const DELTAS: Readonly<Record<Direcao, readonly [number, number]>> = {
  direita: [1, 0], esquerda: [-1, 0], cima: [0, -1], baixo: [0, 1],
};

export function criarProgresso(): Progresso {
  return { posicao: CAIS, concluidas: [], viuTutorial: false };
}
export function ehIdFase(id: unknown): id is IdFasePraia {
  return ENTRADAS.some(entrada => entrada.id === id);
}
export function entradaEm(posicao: Posicao): Entrada | undefined {
  return ENTRADAS.find(entrada => mesmaCasa(entrada.posicao, posicao));
}
export function destinoValido(posicao: Posicao): boolean {
  const celula = MAPA_PRAIA[posicao.linha]?.[posicao.coluna];
  return celula !== undefined && celula !== '#';
}
export function portoes(progresso: Progresso): readonly Bloqueio[] {
  return BLOQUEIOS.filter(item => !progresso.concluidas.includes(item.precisa));
}

// Bloquear arestas nos dois sentidos impede alcançar uma fase futura via atalho.
export function moverNaPraia(progresso: Progresso, direcao: Direcao) {
  const [dx, dy] = DELTAS[direcao];
  const de = progresso.posicao;
  const para = { coluna: de.coluna + dx, linha: de.linha + dy };
  if (!destinoValido(para)) return { progresso, mensagem: 'Este trecho é mar aberto.' };
  const bloqueio = portoes(progresso).find(item =>
    (mesmaCasa(item.de, de) && mesmaCasa(item.para, para)) ||
    (mesmaCasa(item.para, de) && mesmaCasa(item.de, para)));
  if (bloqueio) return { progresso, mensagem: bloqueio.motivo };
  const entrada = entradaEm(para);
  return {
    progresso: { ...progresso, posicao: para },
    mensagem: entrada ? `${entrada.opcional ? 'Desvio opcional: ' : ''}${entrada.nome}. Entre para jogar.` : '',
  };
}

export function concluirNaPraia(progresso: Progresso, id: IdFasePraia): Progresso {
  if (progresso.concluidas.includes(id)) return progresso;
  return { ...progresso, concluidas: [...progresso.concluidas, id] };
}
