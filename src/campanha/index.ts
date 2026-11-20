import { mesmaCasa } from '../motor/index.ts';
import type { Direcao, Posicao } from '../motor/index.ts';

export type IdFaseEnseadinha = 'praia-fio-de-areia' | 'praia-pocas-espelho' | 'praia-mirante'
  | 'praia-bolso-mare' | 'praia-trilha-das-pedras' | 'praia-fragmentos-areal';
export type IdFasePraia = IdFaseEnseadinha | 'primeira-onda' | 'sombra-da-garca' | 'busca-e-volta' | 'ilhota-perolada' | 'ponta-da-garca';
export type IdFase = IdFasePraia | 'recife-pedra-firme' | 'recife-duas-pocas' | 'recife-retorno'
  | 'mangue-dois-encontros' | 'mangue-placa' | 'mangue-reuniao'
  | 'enseada-dupla-vigia' | 'enseada-dupla-revezamento' | 'deriva-dupla-cais' | 'deriva-dupla-contramao'
  | 'enseada-sombra-restinga' | 'enseada-abrigo-ondas' | 'enseada-farol-baixo'
  | 'deriva-primeira-balsa' | 'deriva-duas-margens' | 'deriva-corrente-cruzada'
  | 'grutas-encaixe' | 'grutas-ordem' | 'grutas-retorno'
  | 'grutas-dupla-portao' | 'grutas-dupla-camaras' | 'ressaca-dupla-abrigo' | 'ressaca-dupla-ancoradouros';
export type Mundo = 'praia' | 'praia-enseadinha' | 'arquipelago' | 'recifes' | 'mangue' | 'enseada' | 'deriva' | 'grutas' | 'ressaca';
export type Progresso = Readonly<{
  posicao: Posicao;
  concluidas: readonly IdFase[];
  mundo?: Mundo;
  viuTutorial: boolean;
}>;
type Entrada = Readonly<{
  id: IdFase | 'porto' | 'rumo-praia' | 'rumo-recifes' | 'rumo-mangue' | 'enseada' | 'ida-enseadinha' | 'volta-cabo' | 'saida-enseadinha' | 'rumo-deriva' | 'rumo-grutas' | 'rumo-ressaca';
  posicao: Posicao;
  nome: string;
  opcional?: boolean;
  destino?: Mundo;
}>;
const P = (coluna: number, linha: number): Posicao => ({ coluna, linha });
const CAIS: Posicao = { coluna: 1, linha: 1 };
const ENTRADAS_PRAIA: readonly Entrada[] = [
  { id: 'primeira-onda', nome: 'Primeira onda', posicao: { coluna: 2, linha: 1 } },
  { id: 'sombra-da-garca', nome: 'Sombra da garça', posicao: { coluna: 4, linha: 1 } },
  { id: 'busca-e-volta', nome: 'Busca e volta', posicao: { coluna: 6, linha: 1 } },
  { id: 'ilhota-perolada', nome: 'Ilhota perolada', posicao: { coluna: 3, linha: 3 }, opcional: true },
  { id: 'ponta-da-garca', nome: 'Ponta da garça', posicao: { coluna: 7, linha: 1 } },
  { id: 'ida-enseadinha', nome: 'Ir à Enseadinha', posicao: P(8, 1), destino: 'praia-enseadinha' },
];
const FIM_PRAIA = P(7, 1);
const PORTAL_CABO = P(8, 1);
const SAIDA_ENSEADINHA = P(8, 1);
const CRUZAMENTO = P(4, 3);
const PORTO = { id: 'porto', posicao: CAIS, nome: 'Voltar ao arquipélago', destino: 'arquipelago' } as const;
const ENTRADAS: Readonly<Record<Mundo, readonly Entrada[]>> = {
  praia: ENTRADAS_PRAIA,
  'praia-enseadinha': [
    { id: 'volta-cabo', nome: 'Voltar ao Cabo Baixo', posicao: CAIS, destino: 'praia' },
    { id: 'praia-fio-de-areia', nome: 'Fio de areia', posicao: P(2, 1) },
    { id: 'praia-pocas-espelho', nome: 'Poças em espelho', posicao: P(4, 1) },
    { id: 'praia-mirante', nome: 'Da praia ao mirante', posicao: P(6, 1) },
    { id: 'praia-bolso-mare', nome: 'Bolso da maré', posicao: P(3, 3), opcional: true },
    { id: 'praia-trilha-das-pedras', nome: 'Trilha das pedras', posicao: P(4, 0), opcional: true },
    { id: 'praia-fragmentos-areal', nome: 'Fragmentos do areal', posicao: P(7, 3), opcional: true },
    { id: 'saida-enseadinha', nome: 'Embarcar para o arquipélago', posicao: SAIDA_ENSEADINHA, destino: 'arquipelago' },
  ],
  arquipelago: [
    { id: 'rumo-praia', posicao: P(1, 3), nome: 'Praia das Conchas', destino: 'praia' },
    { id: 'rumo-recifes', posicao: P(2, 1), nome: 'Recifes Expostos', destino: 'recifes' },
    { id: 'rumo-mangue', posicao: P(5, 3), nome: 'Mangue dos Siris Duplos', destino: 'mangue' },
    { id: 'enseada', posicao: P(6, 1), nome: 'Enseada da Garça', destino: 'enseada' },
    { id: 'rumo-deriva', posicao: P(7, 3), nome: 'Ilhas à Deriva', destino: 'deriva' },
    { id: 'rumo-grutas', posicao: P(8, 1), nome: 'Grutas da Espuma', destino: 'grutas' },
    { id: 'rumo-ressaca', posicao: P(9, 3), nome: 'Baía da Ressaca', destino: 'ressaca' },
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
  enseada: [
    PORTO,
    { id: 'enseada-sombra-restinga', posicao: P(2, 1), nome: 'Sombra na restinga' },
    { id: 'enseada-abrigo-ondas', posicao: P(4, 1), nome: 'Abrigo entre ondas' },
    { id: 'enseada-farol-baixo', posicao: P(6, 1), nome: 'Corrida ao farol baixo' },
    { id: 'enseada-dupla-vigia', posicao: P(7, 0), nome: 'Vigia em dupla', opcional: true },
    { id: 'enseada-dupla-revezamento', posicao: P(9, 0), nome: 'Revezamento na restinga', opcional: true },
  ],
  deriva: [
    PORTO,
    { id: 'deriva-primeira-balsa', posicao: P(2, 1), nome: 'A primeira balsa' },
    { id: 'deriva-duas-margens', posicao: P(4, 1), nome: 'Duas margens' },
    { id: 'deriva-corrente-cruzada', posicao: P(6, 1), nome: 'Corrente cruzada' },
    { id: 'deriva-dupla-cais', posicao: P(7, 0), nome: 'Encontro nos dois cais', opcional: true },
    { id: 'deriva-dupla-contramao', posicao: P(9, 0), nome: 'Balsas na contramão', opcional: true },
  ],
  grutas: [
    PORTO,
    { id: 'grutas-encaixe', posicao: P(2, 1), nome: 'Uma pérola para o portão' },
    { id: 'grutas-ordem', posicao: P(4, 1), nome: 'Duas câmaras, uma ordem' },
    { id: 'grutas-retorno', posicao: P(6, 1), nome: 'A pérola da maré baixa' },
    { id: 'grutas-dupla-portao', posicao: P(8, 1), nome: 'A pérola e a placa' },
    { id: 'grutas-dupla-camaras', posicao: P(10, 1), nome: 'Revezamento nas câmaras' },
  ],
  ressaca: [
    PORTO,
    { id: 'ressaca-dupla-abrigo', posicao: P(2, 1), nome: 'Abrigo dos dois cais' },
    { id: 'ressaca-dupla-ancoradouros', posicao: P(4, 1), nome: 'Ancoradouros em revezamento' },
  ],
};

const MUNDOS = [
  { mundo: 'praia', nome: 'Praia das Conchas' },
  { mundo: 'praia-enseadinha', nome: 'Praia das Conchas · Enseadinha' },
  { mundo: 'arquipelago', nome: 'Arquipélago' },
  { mundo: 'recifes', nome: 'Recifes Expostos' },
  { mundo: 'mangue', nome: 'Mangue dos Siris Duplos' },
  { mundo: 'enseada', nome: 'Enseada da Garça' },
  { mundo: 'deriva', nome: 'Ilhas à Deriva' },
  { mundo: 'grutas', nome: 'Grutas da Espuma' },
  { mundo: 'ressaca', nome: 'Baía da Ressaca' },
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
    trilha(FIM_PRAIA, PORTAL_CABO, 'direita', 'esquerda', [],
      ['ponta-da-garca'], 'Conclua a Ponta da garça para chegar à Enseadinha.'),
  ],
  'praia-enseadinha': [
    trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(3, 1.625)],
      ['praia-fio-de-areia'], 'Conclua Fio de areia para atravessar as poças.'),
    trilha(P(4, 1), P(6, 1), 'direita', 'esquerda', [P(5, 0.625)],
      ['praia-pocas-espelho'], 'Recupere os fragmentos de Poças em espelho para ir ao mirante.'),
    trilha(P(6, 1), SAIDA_ENSEADINHA, 'direita', 'esquerda', [P(7, 0.625)],
      ['praia-mirante'], 'Complete a travessia do mirante para chegar ao embarque.'),
    trilha(P(2, 1), P(3, 3), 'baixo', 'cima', [P(2.375, 2.375)],
      ['praia-fio-de-areia'], 'Fio de areia abre o desvio da maré.'),
    trilha(P(4, 1), P(4, 0), 'cima', 'baixo', [],
      ['praia-pocas-espelho'], 'A trilha das pedras é um desvio após as poças.'),
    trilha(P(6, 1), P(7, 3), 'baixo', 'cima', [P(6.5, 2.375)],
      ['praia-mirante'], 'O areal é um desvio após o mirante.'),
  ],
  arquipelago: [
    trilha(P(1, 3), CRUZAMENTO, 'direita', 'esquerda', [P(2, 3.375), P(3, 3.5)]),
    trilha(CRUZAMENTO, P(2, 1), 'cima', 'baixo', [P(3.875, 2.125), P(3, 1.625)]),
    trilha(CRUZAMENTO, P(5, 3), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(6, 1), 'direita', 'esquerda', [P(3.125, 0.625), P(4.75, 0.75)],
      ['recife-retorno', 'mangue-reuniao'], 'A passagem da Enseada abre ao concluir Recifes Expostos e Mangue dos Siris Duplos.'),
    trilha(P(6, 1), P(7, 3), 'direita', 'esquerda', [P(7.25, 2)],
      ['enseada-farol-baixo'], 'Conclua o trecho da Enseada da Garça para encontrar as correntes.'),
    trilha(P(7, 3), P(8, 1), 'cima', 'baixo', [P(8, 2.25)],
      ['deriva-corrente-cruzada'], 'Conclua Corrente cruzada para encontrar as Grutas da Espuma.'),
    trilha(P(8, 1), P(9, 3), 'direita', 'esquerda', [P(9, 2)],
      ['grutas-dupla-camaras'], 'Conclua Revezamento nas câmaras para abrir a Baía da Ressaca.'),
  ],
  recifes: sustentar('recife-pedra-firme', 'recife-duas-pocas', 'recife-retorno'),
  mangue: sustentar('mangue-dois-encontros', 'mangue-placa', 'mangue-reuniao', true),
  enseada: [
    ...sustentar('enseada-sombra-restinga', 'enseada-abrigo-ondas', 'enseada-farol-baixo', true),
    trilha(P(6, 1), P(7, 0), 'cima', 'baixo', [P(6.375, 0.5)],
      ['enseada-farol-baixo'], 'Conclua Corrida ao farol baixo para abrir o desvio em dupla.'),
    trilha(P(7, 0), P(9, 0), 'direita', 'esquerda', [P(8.125, 0.375)],
      ['enseada-dupla-vigia'], 'Conclua Vigia em dupla para seguir pela restinga.'),
  ],
  deriva: [
    ...sustentar('deriva-primeira-balsa', 'deriva-duas-margens', 'deriva-corrente-cruzada'),
    trilha(P(6, 1), P(7, 0), 'cima', 'baixo', [P(6.375, 0.5)],
      ['deriva-corrente-cruzada'], 'Conclua Corrente cruzada para abrir o desvio em dupla.'),
    trilha(P(7, 0), P(9, 0), 'direita', 'esquerda', [P(8.125, 0.375)],
      ['deriva-dupla-cais'], 'Conclua Encontro nos dois cais para alcançar a outra corrente.'),
  ],
  grutas: [
    ...sustentar('grutas-encaixe', 'grutas-ordem', 'grutas-retorno', true),
    trilha(P(6, 1), P(8, 1), 'direita', 'esquerda', [P(7, 0.625)],
      ['grutas-retorno'], 'Complete a travessia da pérola para chegar ao revezamento.'),
    trilha(P(8, 1), P(10, 1), 'direita', 'esquerda', [P(9, 1.625)],
      ['grutas-dupla-portao'], 'Conclua A pérola e a placa para chegar às outras câmaras.'),
    trilha(CAIS, P(10, 1), 'cima', 'baixo', [P(3, 0.5), P(7, 0.375), P(9, 0.5)],
      ['grutas-dupla-camaras'], 'Este caminho de volta abre depois do revezamento nas câmaras.'),
  ],
  ressaca: [
    trilha(CAIS, P(2, 1), 'direita', 'esquerda', []),
    trilha(P(2, 1), P(4, 1), 'direita', 'esquerda', [P(3, 0.625)],
      ['ressaca-dupla-abrigo'], 'Conclua Abrigo dos dois cais para chegar aos ancoradouros.'),
    trilha(CAIS, P(4, 1), 'baixo', 'baixo', [P(2.25, 2.5), P(4.625, 2.25)],
      ['ressaca-dupla-ancoradouros'], 'O atalho abre depois do revezamento nos ancoradouros.'),
  ],
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
    praia: P(1, 3), 'praia-enseadinha': P(1, 3), recifes: P(2, 1), mangue: P(5, 3), enseada: P(6, 1), deriva: P(7, 3), grutas: P(8, 1), ressaca: P(9, 3), arquipelago: P(1, 3),
  };
  const posicao = destino === 'arquipelago' ? orientacao[origem] : destino === 'praia' ? (origem === 'praia-enseadinha' ? PORTAL_CABO : FIM_PRAIA) : CAIS;
  return { ...p, mundo: destino, posicao };
}

export function criarProgresso(): Progresso {
  return { posicao: CAIS, concluidas: [], viuTutorial: false };
}
export function ehIdFase(id: unknown): id is IdFase {
  return Object.values(ENTRADAS).some(entradas => entradas.some(entrada =>
    entrada.id === id && !entrada.destino));
}
export function totalDeFasesRegulares(mundo: Mundo): number {
  return ENTRADAS[mundo].filter(entrada => !entrada.destino && !entrada.opcional).length;
}
export function faseOpcional(mundo: Mundo, id: IdFase): boolean {
  return ENTRADAS[mundo].some(entrada => entrada.id === id && entrada.opcional);
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
    mensagem: entrada ? `${entrada.opcional ? 'Desvio opcional: ' : ''}${entrada.nome}. ${entrada.destino ? 'Entre para viajar.' : 'Entre para jogar.'}` : 'Bifurcação das ilhas.',
  };
}

export function concluirFase(progresso: Progresso, id: IdFase): Progresso {
  if (progresso.concluidas.includes(id)) return progresso;
  return { ...progresso, concluidas: [...progresso.concluidas, id] };
}
