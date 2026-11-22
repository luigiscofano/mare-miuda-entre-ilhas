import type { Acao, Fase, Posicao } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] =>
  [...letras].map(letra => comandos[letra as keyof typeof comandos]);
const ponto = (coluna: number, linha: number): Posicao => ({ coluna, linha });

// A patrulha sempre obedece ao relógio de passos que a previsão da tela anuncia.
export const FASES_ENSEADA_AMPLIADA = [
  {
    id: 'enseada-passo-sombra', nome: 'Um passo antes da sombra',
    objetivo: 'Alcance a concha sem tomar o primeiro rasante.',
    ensino: 'O rasante pode acontecer antes da subida da água. Se o baixio estiver marcado, há um desvio firme pelo sul.',
    mapa: ['S.=HC', '...H#'],
    ameaca: { alvo: ponto(2, 0), primeiroAtaque: 2, periodo: 5 },
    solucao: rota('DRRRUR'),
  },
  {
    id: 'enseada-vigia-das-pedras', nome: 'Vigia das pedras',
    objetivo: 'Alcance a concha além das duas posições da garça.',
    ensino: 'O refúgio de areia elevada não alaga, mas não protege do rasante. A garça alterna os dois alvos.',
    mapa: ['S=H..=C', '..H#H##'],
    ameaca: { alvo: ponto(2, 0), rota: [ponto(4, 0)], primeiroAtaque: 4, periodo: 5 },
    solucao: rota('RRRRDURR'),
  },
  {
    id: 'enseada-escolha-de-margem', nome: 'Escolha de margem',
    objetivo: 'Escolha por qual braço passar e alcance a concha.',
    ensino: 'Os dois braços se juntam no mesmo refúgio. Observe em qual margem o próximo ataque cai.',
    mapa: ['S...H###', '.##=H=HC', '..H=H..#', '##...###'],
    ameaca: { alvo: ponto(3, 0), rota: [ponto(3, 2), ponto(6, 1)], primeiroAtaque: 3, periodo: 3 },
    solucao: rota('DUDDRRRRRRUR'),
  },
  {
    id: 'enseada-fragmento-do-bico', nome: 'Fragmento no alcance do bico',
    objetivo: 'Pegue a pérola e volte à saída.',
    ensino: 'Chegar até a pérola não basta: deixe-a para o turno seguro e prepare a volta.',
    mapa: ['SG=H..', '###.#B', '###H..'],
    ameaca: { alvo: ponto(5, 1), primeiroAtaque: 10, periodo: 4 },
    solucao: rota('RRRDURRDULLDULL'),
  },
  {
    id: 'enseada-fresta-da-vazante', nome: 'Fresta da vazante',
    objetivo: 'Busque a pérola além do banco dobrado e volte.',
    ensino: 'Dois baixios seguidos pedem a janela inteira. A volta pelo sul tem só um, mas a garça alterna os alvos.',
    mapa: ['SGH==H.B', '##.##.#.', '##H=HH..'],
    ameaca: { alvo: ponto(5, 1), rota: [ponto(7, 0), ponto(2, 0)], primeiroAtaque: 10, periodo: 4 },
    solucao: rota('RLRLRRRRRRLRRDDLLLLLUUL'),
  },
  {
    id: 'enseada-ecos-do-rasante', nome: 'Ecos do rasante',
    objetivo: 'Recolha duas pérolas, em braços diferentes, e retire-se pelo centro.',
    ensino: 'A patrulha alterna os pontos-chave. Planeje os dois retornos à ilha firme, não só a primeira travessia entre margens.',
    mapa: ['B.H=H####', '.#..H==B#', '#..S.H=.#', '##H=HG###'],
    ameaca: { alvo: ponto(2, 0), rota: [ponto(7, 1), ponto(5, 3)], primeiroAtaque: 12, periodo: 3 },
    solucao: rota('UUDDUDUUDLULLRRDRRRRRDUDLLLDR'),
  },
  {
    id: 'enseada-vigia-partilhada', nome: 'Vigia partilhada',
    objetivo: 'Use a placa para cruzar o portão e reúna os dois siris depois do rasante.',
    ensino: 'A garça também alcança quem está parado. Cruze na janela da placa e retire o parceiro antes que o rasante volte.',
    mapa: ['S=H.D.C', '#######', 'A=H.P#.', '###H=HT'],
    ameaca: { alvo: ponto(4, 2), rota: [ponto(5, 0), ponto(6, 3)], primeiroAtaque: 9, periodo: 4 },
    dupla: { segundoAlvo: 'T' }, solucao: rota('RRRLRLRXRRRDUDURXRRRXDRR'),
  },
] as const satisfies readonly Fase[];

export type IdFaseEnseadaAmpliada = typeof FASES_ENSEADA_AMPLIADA[number]['id'];
