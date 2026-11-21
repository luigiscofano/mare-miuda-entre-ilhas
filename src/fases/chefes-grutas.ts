import type { Acao, Fase } from '../motor/index.ts';

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string): Acao[] => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

export const SENTINELA_DA_GRUTA = {
  id: 'grutas-chefe-sentinela-da-gruta',
  nome: 'Sentinela da Gruta',
  mapa: ['SK=H=E###', '..#....##', '.##....##', '..H===H##', '##F....OC'],
  etapasGruta: ['K', 'E', 'F'],
  condicoesGruta: [{ etapa: 'E', janela: 'alta' }, { etapa: 'F', janela: 'baixa' }],
  objetivo: 'Encaixe a pérola na maré alta, acione a alavanca na baixa e alcance a concha.',
  ensino: 'O encaixe só responde ao entrar nele com maré alta. A alavanca responde na baixa. Ajuste a contagem nos bolsões de terra firme.',
  solucao: rota('RRRDUDUDRRUDDDDLLLRRRRRR'),
} as const satisfies Fase;

export const COFRE_DAS_ESPUMAS = {
  id: 'grutas-chefe-cofre-das-espumas',
  nome: 'Cofre das Espumas',
  mapa: ['SK.H.E..HPO.C', '##.#...##.###', '#############', 'A=H=..H==.FT#', '...#...##..##'],
  dupla: { segundoAlvo: 'T' },
  etapasGruta: ['K', 'E', 'F'],
  condicoesGruta: [{ etapa: 'E', janela: 'descida' }, { etapa: 'F', janela: 'alta', placa: { coluna: 9, linha: 0 } }],
  objetivo: 'Sincronize a pérola e a placa das duas margens e leve os siris às saídas.',
  ensino: 'O portador encaixa a pérola no passo da descida. Com a maré alta, pise na alavanca com o outro siri já na placa. Depois, leve o verde ao marco e o coral à concha.',
  solucao: rota('RRXDRRURRDURRRRRXRRRRRRRXRRXRRR'),
} as const satisfies Fase;
