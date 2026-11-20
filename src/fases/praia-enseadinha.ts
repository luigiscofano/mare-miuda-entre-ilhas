import type { Acao, Fase } from '../motor/index.ts';

const teclas = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' } as const;
const rota = (comandos: string): Acao[] => [...comandos].map(c => teclas[c as keyof typeof teclas]);

export const FASES_ENSEADINHA: readonly Fase[] = [
  {
    id: 'praia-fio-de-areia', nome: 'Fio de areia',
    objetivo: 'Cruze dois baixios até a concha.',
    ensino: 'Pare na areia ou na pedra alta quando a maré subir. O bolsão inferior permite caminhar sem entrar na água.',
    mapa: ['S==H=C', '##..##'],
    solucao: rota('RRRDUDURR'),
  },
  {
    id: 'praia-pocas-espelho', nome: 'Poças em espelho',
    objetivo: 'Recolha os dois fragmentos dos bolsões e volte à saída.',
    ensino: 'As poças se abrem ao mesmo tempo; escolha por qual lado começar.',
    mapa: ['##G##', 'B=S=B', '.#.#.'],
    solucao: rota('RRDUDULLUDUDLLDUDURRU'),
  },
  {
    id: 'praia-mirante', nome: 'Da praia ao mirante',
    objetivo: 'Atravesse para a concha pelo mirante.',
    ensino: 'A garça tem ritmo próprio. Consulte o aviso antes de usar a passagem estreita.',
    mapa: ['S=.##', '##..C', '##...'],
    ameaca: { alvo: { coluna: 3, linha: 1 }, primeiroAtaque: 4, periodo: 4 },
    solucao: rota('RRDUDRR'),
  },
  {
    id: 'praia-bolso-mare', nome: 'Bolso da maré',
    objetivo: 'Leve o fragmento da ilhota até a saída.',
    ensino: 'Há um refúgio perto de cada baixio; planeje o retorno antes de buscar o fragmento.',
    mapa: ['SG###', 'H=..B', '.#..#'],
    solucao: rota('RDRRRLLLU'),
  },
  {
    id: 'praia-trilha-das-pedras', nome: 'Trilha das pedras',
    objetivo: 'Cruze pelo refúgio para alcançar a concha.',
    ensino: 'Use a junção para adiantar a maré antes de cruzar a faixa final de areia baixa.',
    mapa: ['#..H.#', 'S==.=C', '#.####'],
    solucao: rota('RURRRLRDR'),
  },
  {
    id: 'praia-fragmentos-areal', nome: 'Fragmentos do areal',
    objetivo: 'Recolha os fragmentos sem cair na marca da garça.',
    ensino: 'As duas rotas são diferentes. Planeje o ciclo da garça e a maré, e volte ao porto.',
    mapa: ['B=.G.#', '..#.#.', 'S..H=B'],
    ameaca: { alvo: { coluna: 1, linha: 0 }, primeiroAtaque: 3, periodo: 4 },
    solucao: rota('UUDRDRRRRUDUDLLUU'),
  },
];
