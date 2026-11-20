import { mesmaCasa } from '../motor/index.ts';
import type { Direcao, Posicao } from '../motor/index.ts';

export type IdFasePraia = 'primeira-onda' | 'sombra-da-garca' | 'busca-e-volta' | 'ilhota-perolada' | 'ponta-da-garca';
export type IdFase = IdFasePraia | 'recife-pedra-firme' | 'recife-duas-pocas' | 'recife-retorno'
  | 'mangue-dois-encontros' | 'mangue-placa' | 'mangue-reuniao';
export type Mundo = 'praia' | 'arquipelago' | 'recifes' | 'mangue';
export type Progresso = Readonly<{
  posicao: Posicao;
  concluidas: readonly IdFase[];
  mundo?: Mundo;
  viuTutorial: boolean;
}>;
type Entrada = Readonly<{
  id: IdFase | 'porto' | 'rumo-praia' | 'rumo-recifes' | 'rumo-mangue' | 'enseada';
  posicao: Posicao;
  nome: string;
  opcional?: boolean;
  destino?: Mundo;
}>;
type Bloqueio = Readonly<{
  de: Posicao;
  para: Posicao;
  precisa: IdFase | readonly IdFase[];
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
const ENTRADAS_PRAIA: readonly Entrada[] = [
  { id: 'primeira-onda', nome: 'Primeira onda', posicao: { coluna: 2, linha: 1 } },
  { id: 'sombra-da-garca', nome: 'Sombra da garça', posicao: { coluna: 4, linha: 1 } },
  { id: 'busca-e-volta', nome: 'Busca e volta', posicao: { coluna: 6, linha: 1 } },
  { id: 'ilhota-perolada', nome: 'Ilhota perolada', posicao: { coluna: 3, linha: 3 }, opcional: true },
  { id: 'ponta-da-garca', nome: 'Ponta da garça', posicao: { coluna: 7, linha: 1 } },
];
const BLOQUEIOS_PRAIA: readonly Bloqueio[] = [
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

const P = (coluna: number, linha: number): Posicao => ({ coluna, linha });
const FIM_PRAIA = P(7, 1);
const ARQUIPELAGO = [
  '#########',
  '##R...E##',
  '##.#.####',
  '#P...M###',
  '#########',
] as const;
const RECIFES = ['#########', '#S1.2.3##', '#.####.##', '#......##', '#########'] as const;
const MANGUE = ['#########', '#S1.2.3##', '#.####.##', '#......##', '#########'] as const;

const MAPAS: Readonly<Record<Mundo, readonly string[]>> = {
  praia: MAPA_PRAIA, arquipelago: ARQUIPELAGO, recifes: RECIFES, mangue: MANGUE,
};
const PORTO = { id: 'porto', posicao: CAIS, nome: 'Voltar ao arquipélago', destino: 'arquipelago' } as const;
const ENTRADAS: Readonly<Record<Mundo, readonly Entrada[]>> = {
  praia: ENTRADAS_PRAIA,
  arquipelago: [
    { id: 'rumo-praia', posicao: P(1, 3), nome: 'Praia das Conchas', destino: 'praia' },
    { id: 'rumo-recifes', posicao: P(2, 1), nome: 'Recifes Expostos', destino: 'recifes' },
    { id: 'rumo-mangue', posicao: P(5, 3), nome: 'Mangue dos Dois Siris', destino: 'mangue' },
    { id: 'enseada', posicao: P(6, 1), nome: 'Passagem da Enseada' },
  ],
  recifes: [
    PORTO,
    { id: 'recife-pedra-firme', posicao: P(2, 1), nome: 'Acima da espuma' },
    { id: 'recife-duas-pocas', posicao: P(4, 1), nome: 'Duas poças do recife' },
    { id: 'recife-retorno', posicao: P(6, 1), nome: 'A volta do recife' },
  ],
  mangue: [
    PORTO,
    { id: 'mangue-dois-encontros', posicao: P(2, 1), nome: 'Raízes vizinhas' },
    { id: 'mangue-placa', posicao: P(4, 1), nome: 'Um segura, outro passa' },
    { id: 'mangue-reuniao', posicao: P(6, 1), nome: 'Reencontro na ponta do mangue' },
  ],
};

const MUNDOS = [
  { mundo: 'praia', nome: 'Praia das Conchas' },
  { mundo: 'arquipelago', nome: 'Arquipélago' },
  { mundo: 'recifes', nome: 'Recifes Expostos' },
  { mundo: 'mangue', nome: 'Mangue dos Dois Siris' },
] as const;

export const mundoValido = (mundo: unknown): mundo is Mundo => MUNDOS.some(i => i.mundo === mundo);
export const mundoAtual = (progresso: Progresso): Mundo => progresso.mundo ?? 'praia';
export const mapaDo = (mundo: Mundo): readonly string[] => MAPAS[mundo];
export const nomeDo = (mundo: Mundo): string => MUNDOS.find(i => i.mundo === mundo)?.nome ?? '';
export const abriuEnseada = (p: Progresso) =>
  p.concluidas.includes('recife-retorno') && p.concluidas.includes('mangue-reuniao');

const estruturarMundo = (
  primeira: IdFase, segunda: IdFase, terceira: IdFase,
): readonly Bloqueio[] => [
  { de: P(3, 1), para: P(4, 1), precisa: primeira, motivo: 'Conclua a primeira travessia para seguir.' },
  { de: P(5, 1), para: P(6, 1), precisa: segunda, motivo: 'Conclua a segunda travessia para seguir.' },
  { de: P(1, 1), para: P(1, 2), precisa: terceira, motivo: 'O atalho pelo sul se abre ao concluir este mundo.' },
  { de: P(6, 1), para: P(6, 2), precisa: terceira, motivo: 'O atalho pelo sul se abre ao concluir este mundo.' },
];
const BLOQUEIOS: Readonly<Record<Mundo, readonly Bloqueio[]>> = {
  praia: BLOQUEIOS_PRAIA,
  arquipelago: [
    { de: P(5, 1), para: P(6, 1), precisa: ['recife-retorno', 'mangue-reuniao'],
      motivo: 'A passagem da Enseada abre ao concluir Recifes Expostos e Mangue dos Dois Siris.' },
  ],
  recifes: estruturarMundo('recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno'),
  mangue: estruturarMundo('mangue-dois-encontros', 'mangue-placa', 'mangue-reuniao'),
};

export function podeSairDaPraia(p: Progresso) {
  return mundoAtual(p) === 'praia' && mesmaCasa(p.posicao, FIM_PRAIA) && p.concluidas.includes('ponta-da-garca');
}

export function viajar(p: Progresso, destino: Mundo): Progresso {
  const origem = mundoAtual(p);
  const entrada = entradaEm(p.posicao, origem);
  if (!(destino === 'arquipelago' && podeSairDaPraia(p)) && entrada?.destino !== destino) return p;
  const orientacao: Readonly<Record<Mundo, Posicao>> = {
    praia: P(1, 3), recifes: P(2, 1), mangue: P(5, 3), arquipelago: P(1, 3),
  };
  const posicao = destino === 'arquipelago' ? orientacao[origem] : destino === 'praia' ? FIM_PRAIA : CAIS;
  return { ...p, mundo: destino, posicao };
}

const DELTAS: Readonly<Record<Direcao, readonly [number, number]>> = {
  direita: [1, 0], esquerda: [-1, 0], cima: [0, -1], baixo: [0, 1],
};

export function criarProgresso(): Progresso {
  return { posicao: CAIS, concluidas: [], viuTutorial: false };
}
export function ehIdFase(id: unknown): id is IdFase {
  return Object.values(ENTRADAS).some(entradas => entradas.some(entrada =>
    entrada.id === id && !entrada.destino && entrada.id !== 'enseada'));
}
export function entradaEm(posicao: Posicao, mundo: Mundo = 'praia'): Entrada | undefined {
  return ENTRADAS[mundo].find(entrada => mesmaCasa(entrada.posicao, posicao));
}
export function destinoValido(posicao: Posicao, mundo: Mundo = 'praia'): boolean {
  const celula = MAPAS[mundo][posicao.linha]?.[posicao.coluna];
  return celula !== undefined && celula !== '#';
}
export function portoes(progresso: Progresso): readonly Bloqueio[] {
  return BLOQUEIOS[mundoAtual(progresso)].filter(item => {
    const precisa = typeof item.precisa === 'string' ? [item.precisa] : item.precisa;
    return !precisa.every(id => progresso.concluidas.includes(id));
  });
}

// Bloquear arestas nos dois sentidos impede alcançar uma fase futura via atalho.
export function moverNoMapa(progresso: Progresso, direcao: Direcao) {
  const [dx, dy] = DELTAS[direcao];
  const de = progresso.posicao;
  const para = { coluna: de.coluna + dx, linha: de.linha + dy };
  if (!destinoValido(para, mundoAtual(progresso))) return { progresso, mensagem: 'Este trecho é mar aberto.' };
  const bloqueio = portoes(progresso).find(item =>
    (mesmaCasa(item.de, de) && mesmaCasa(item.para, para)) ||
    (mesmaCasa(item.para, de) && mesmaCasa(item.de, para)));
  if (bloqueio) return { progresso, mensagem: bloqueio.motivo };
  const entrada = entradaEm(para, mundoAtual(progresso));
  return {
    progresso: { ...progresso, posicao: para },
    mensagem: entrada ? `${entrada.opcional ? 'Desvio opcional: ' : ''}${entrada.nome}. ${entrada.destino ? 'Entre para viajar.' : entrada.id === 'enseada' ? 'Passagem aberta; próximo capítulo.' : 'Entre para jogar.'}` : '',
  };
}

export function concluirFase(progresso: Progresso, id: IdFase): Progresso {
  if (progresso.concluidas.includes(id)) return progresso;
  return { ...progresso, concluidas: [...progresso.concluidas, id] };
}
