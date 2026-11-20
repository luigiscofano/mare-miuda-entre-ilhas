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
const CAIS: Posicao = { coluna: 1, linha: 1 };
const ENTRADAS_PRAIA: readonly Entrada[] = [
  { id: 'primeira-onda', nome: 'Primeira onda', posicao: { coluna: 2, linha: 1 } },
  { id: 'sombra-da-garca', nome: 'Sombra da garça', posicao: { coluna: 4, linha: 1 } },
  { id: 'busca-e-volta', nome: 'Busca e volta', posicao: { coluna: 6, linha: 1 } },
  { id: 'ilhota-perolada', nome: 'Ilhota perolada', posicao: { coluna: 3, linha: 3 }, opcional: true },
  { id: 'ponta-da-garca', nome: 'Ponta da garça', posicao: { coluna: 7, linha: 1 } },
];
const P = (coluna: number, linha: number): Posicao => ({ coluna, linha });
const FIM_PRAIA = P(7, 1);
const CRUZAMENTO = P(4, 3);
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
export const nomeDo = (mundo: Mundo): string => MUNDOS.find(i => i.mundo === mundo)?.nome ?? '';
export const abriuEnseada = (p: Progresso) =>
  p.concluidas.includes('recife-retorno') && p.concluidas.includes('mangue-reuniao');

export type Trilha = Readonly<{
  de: Posicao;
  para: Posicao;
  ida: Direcao;
  volta: Direcao;
  curvas: readonly Posicao[];
  precisa: readonly IdFase[];
  motivo: string;
}>;

function trilha(
  de: Posicao, para: Posicao, ida: Direcao, volta: Direcao, curvas: readonly Posicao[],
  precisa: readonly IdFase[] = [], motivo = '',
): Trilha {
  return { de, para, ida, volta, curvas, precisa, motivo };
}

const sustentar = (
  primeira: IdFase, segunda: IdFase, terceira: IdFase, mangue = false,
): readonly Trilha[] => [
  trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
  trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(2.75, mangue ? 1.5 : 0.625)],
    [primeira], 'Conclua a primeira travessia para seguir.'),
  trilha(P(4, 1), P(6, 1), 'direita', 'esquerda', [P(5, mangue ? 0.625 : 1.625)],
    [segunda], 'Conclua a segunda travessia para seguir.'),
  trilha(CAIS, P(6, 1), 'baixo', 'baixo', [P(0.875, 2.25), P(2, 3.375), P(4.5, 3.5), P(6.625, 2.25)],
    [terceira], 'O atalho pelo sul se abre ao concluir este mundo.'),
];

// A tecla representa a saída no nó, não a orientação de cada segmento da curva.
const TRILHAS: Readonly<Record<Mundo, readonly Trilha[]>> = {
  praia: [
    trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(3.125, 0.625)],
      ['primeira-onda'], 'Conclua a Primeira onda para abrir a passagem da praia.'),
    trilha(P(4, 1), P(6, 1), 'direita', 'esquerda', [P(5, 0.625)],
      ['sombra-da-garca'], 'Afaste-se da garça na travessia anterior para liberar esta passagem.'),
    trilha(P(6, 1), FIM_PRAIA, 'direita', 'esquerda', [],
      ['busca-e-volta'], 'Recupere o fragmento em Busca e volta para chegar à Ponta da garça.'),
    trilha(P(2, 1), P(3, 3), 'baixo', 'cima', [P(2.25, 2), P(2.625, 2.625)],
      ['primeira-onda'], 'A trilha opcional aparece depois da Primeira onda.'),
    trilha(P(3, 3), P(6, 1), 'baixo', 'baixo', [P(3.75, 3.75), P(5.125, 3.5), P(6, 2.375)],
      ['ilhota-perolada', 'sombra-da-garca'], 'O atalho pede a Concha Perolada e a passagem pela Sombra da garça.'),
  ],
  arquipelago: [
    trilha(P(1, 3), CRUZAMENTO, 'direita', 'esquerda', [P(2, 3.375), P(3, 3.5)]),
    trilha(CRUZAMENTO, P(2, 1), 'cima', 'baixo', [P(3.875, 2.125), P(3, 1.625)]),
    trilha(CRUZAMENTO, P(5, 3), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(6, 1), 'direita', 'esquerda', [P(3.125, 0.625), P(4.75, 0.75)],
      ['recife-retorno', 'mangue-reuniao'], 'A passagem da Enseada abre ao concluir Recifes Expostos e Mangue dos Dois Siris.'),
  ],
  recifes: sustentar('recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno'),
  mangue: sustentar('mangue-dois-encontros', 'mangue-placa', 'mangue-reuniao', true),
};

export const trilhasDo = (mundo: Mundo) => TRILHAS[mundo];
export const rotaLivre = (p: Progresso, t: Trilha) => t.precisa.every(id => p.concluidas.includes(id));
export function saidaEm(progresso: Progresso, direcao: Direcao) {
  for (const t of trilhasDo(mundoAtual(progresso))) {
    const caminho = [t.de, ...t.curvas, t.para];
    if (mesmaCasa(t.de, progresso.posicao) && t.ida === direcao) return { t, caminho, destino: t.para };
    if (mesmaCasa(t.para, progresso.posicao) && t.volta === direcao) return { t, caminho: caminho.reverse(), destino: t.de };
  }
}

export function nosDo(mundo: Mundo): readonly Posicao[] {
  return trilhasDo(mundo).flatMap(t => [t.de, t.para]).filter((pos, i, lista) =>
    lista.findIndex(item => mesmaCasa(item, pos)) === i);
}

export function normalizarPosicao(
  mundo: Mundo, posicao: Posicao | undefined, concluidas: readonly IdFase[],
): Posicao {
  const inicio = mundo === 'arquipelago' ? P(1, 3) : CAIS;
  if (!posicao) return inicio;
  const disponiveis: Posicao[] = [inicio];
  // Migração de saves de células: não conceda um nó do outro lado de uma passagem trancada.
  for (let i = 0; i < disponiveis.length; i++) {
    for (const t of trilhasDo(mundo)) {
      if (!t.precisa.every(id => concluidas.includes(id))) continue;
      const atual = disponiveis[i];
      const outro = mesmaCasa(atual, t.de) ? t.para : mesmaCasa(atual, t.para) ? t.de : undefined;
      if (outro && !disponiveis.some(n => mesmaCasa(n, outro))) disponiveis.push(outro);
    }
  }
  const distancia = (n: Posicao) => Math.abs(n.coluna - posicao.coluna) + Math.abs(n.linha - posicao.linha);
  // Empates mantêm a primeira posição visitável na ordem das trilhas declaradas.
  return disponiveis.reduce((maisProxima, n) => distancia(n) < distancia(maisProxima) ? n : maisProxima);
}

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
export function moverNoMapa(progresso: Progresso, direcao: Direcao) {
  const saida = saidaEm(progresso, direcao);
  if (!saida) return { progresso, mensagem: 'Não há trilha nessa direção.' };
  if (!rotaLivre(progresso, saida.t)) return { progresso, mensagem: saida.t.motivo };
  const entrada = entradaEm(saida.destino, mundoAtual(progresso));
  return {
    progresso: { ...progresso, posicao: saida.destino },
    caminho: saida.caminho,
    mensagem: entrada ? `${entrada.opcional ? 'Desvio opcional: ' : ''}${entrada.nome}. ${entrada.destino ? 'Entre para viajar.' : entrada.id === 'enseada' ? 'Passagem aberta; próximo capítulo.' : 'Entre para jogar.'}` : 'Bifurcação das ilhas.',
  };
}

export function concluirFase(progresso: Progresso, id: IdFase): Progresso {
  if (progresso.concluidas.includes(id)) return progresso;
  return { ...progresso, concluidas: [...progresso.concluidas, id] };
}
