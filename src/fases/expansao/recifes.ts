import type { TravessiaDaExpansao } from './tipos.ts';

export const RECIFES: readonly TravessiaDaExpansao<'recifes'>[] = [
  {
    fase: {
      id: "recifes-exp-arco-do-coral",
      nome: "Arco do coral",
      objetivo: "Cruze o arco de areia e encontre a concha.",
      ensino: "Pisar no refúgio é uma opção, não uma obrigação: confira qual volta deixa a primeira subida segura.",
      mapa: ["S=H##", "..=.#", "#..=C"],
      solucao: ["baixo", "cima", "baixo", "direita", "baixo", "direita", "direita", "direita"],
    },
    depoisDe: "recife-pedra-firme",
  },
  {
    fase: {
      id: "recifes-exp-ponte-em-zigue",
      nome: "Ponte em zigue-zague",
      objetivo: "Faça a curva do refúgio e atravesse ao segundo banco.",
      ensino: "Prepare a segunda travessia no cruzamento em vez de tentar emendar dois baixios de uma vez.",
      mapa: ["S==H#", "##.##", "#.H=C", "##.##"],
      solucao: ["direita", "direita", "baixo", "baixo", "cima", "baixo", "direita", "direita"],
    },
    depoisDe: "recife-pedra-firme",
  },
  {
    fase: {
      id: "recifes-exp-ombro-do-costao",
      nome: "Ombro do costão",
      objetivo: "Chegue à concha acima do banco central.",
      ensino: "A maré fecha o atalho central na primeira subida; o ombro inferior dá espaço para voltar à entrada da concha pelo lado seco.",
      mapa: ["##C##", "##=..", "S=H#.", "..#..", "....."],
      solucao: ["baixo", "cima", "baixo", "baixo", "direita", "direita", "direita", "cima", "direita", "cima", "cima", "esquerda", "esquerda", "cima"],
    },
    depoisDe: "recife-pedra-firme",
  },
  {
    fase: {
      id: "recifes-exp-meia-volta-de-nacre",
      nome: "Meia-volta do nácar",
      objetivo: "Colete os dois fragmentos antes de voltar à saída no sul.",
      ensino: "Ao recolher no braço superior, planeje se vale recuar pelo caminho curto ou dar a volta completa.",
      mapa: ["#.B..", "#=##=", "SH..B", "=.##.", "..G.."],
      solucao: ["direita", "cima", "cima", "direita", "direita", "direita", "baixo", "baixo", "baixo", "baixo", "esquerda", "esquerda"],
    },
    depoisDe: "recife-duas-pocas",
  },
  {
    fase: {
      id: "recifes-exp-bacia-estreita",
      nome: "Bacia estreita",
      objetivo: "Reúna o fragmento da bacia e o da margem antes de abrir a saída.",
      ensino: "Há dois acessos ao braço leste; escolha qual permite sair sem esperar em areia molhada.",
      mapa: ["G..##", "=##..", "H.==B", ".##=.", "S.B.."],
      solucao: ["direita", "direita", "direita", "direita", "cima", "cima", "esquerda", "esquerda", "esquerda", "esquerda", "baixo", "cima", "cima", "cima"],
    },
    depoisDe: "recife-duas-pocas",
  },
  {
    fase: {
      id: "recifes-exp-poco-do-ourico",
      nome: "Poço do ouriço",
      objetivo: "Recolha os dois fragmentos acima das poças e desça até a saída.",
      ensino: "O atalho da direita exige a baixa; à esquerda, a curva seca permite mudar a ordem da coleta.",
      mapa: ["B..#B", "=.#..", "H.S=H", ".###.", "..G.."],
      solucao: ["direita", "cima", "direita", "cima", "baixo", "baixo", "esquerda", "esquerda", "esquerda", "cima", "cima", "esquerda", "baixo", "baixo", "baixo", "baixo", "direita", "direita"],
    },
    depoisDe: "recife-duas-pocas",
  },
  {
    fase: {
      id: "recifes-exp-volta-das-fendas",
      nome: "Volta das fendas",
      objetivo: "Reúna os fragmentos de cima e de baixo e conclua no canto leste.",
      ensino: "O refúgio do meio divide o percurso. Use a ramificação central para preparar a incursão inferior.",
      mapa: ["S...B", ".##.#", "H.H=H", "##.##", "B...G"],
      solucao: ["direita", "direita", "direita", "direita", "esquerda", "baixo", "baixo", "esquerda", "baixo", "baixo", "esquerda", "esquerda", "direita", "direita", "direita", "direita"],
    },
    depoisDe: "recife-retorno",
  },
  {
    fase: {
      id: "recifes-exp-porta-do-norte",
      nome: "Porta do norte",
      objetivo: "Percorra os braços norte e sudeste para abrir a saída no sudoeste.",
      ensino: "Ao voltar do norte, não comprometa a travessia para a saída antes de ter o segundo fragmento.",
      mapa: ["B.H..", "###..", "..S.H", "=##.#", "G.=.B"],
      solucao: ["esquerda", "esquerda", "direita", "direita", "direita", "cima", "cima", "esquerda", "esquerda", "esquerda", "direita", "direita", "direita", "baixo", "baixo", "baixo", "baixo", "direita", "esquerda", "esquerda", "esquerda", "esquerda"],
    },
    depoisDe: "recife-retorno",
  },
  {
    fase: {
      id: "recifes-exp-costura-de-sal",
      nome: "Costura de sal",
      objetivo: "Atravesse a costura, busque o fragmento e retorne à saída junto do cais.",
      ensino: "A coleta ocupa o fim do braço, mas a escolha importante é por onde voltar ao refúgio central.",
      mapa: ["SG#B.", "=#.#=", "H=H..", ".###.", "...H."],
      solucao: ["baixo", "baixo", "baixo", "cima", "baixo", "cima", "direita", "direita", "cima", "baixo", "direita", "direita", "cima", "cima", "esquerda", "direita", "esquerda", "direita", "baixo", "baixo", "baixo", "cima", "baixo", "baixo", "esquerda", "esquerda", "esquerda", "esquerda", "cima", "cima", "cima", "cima", "direita"],
    },
    depoisDe: "recife-retorno",
  },
  {
    fase: {
      id: "recifes-exp-ilhas-de-vies",
      nome: "Ilhas de viés",
      objetivo: "Busque os dois fragmentos e alcance a saída na ponta estreita.",
      ensino: "Os refúgios ficam em diagonais opostas; alinhe cada incursão ao começo de uma nova baixa.",
      mapa: ["S==H###", "##...B#", "##.#.##", "B...H=G", "..#...#"],
      solucao: ["direita", "direita", "baixo", "baixo", "cima", "baixo", "baixo", "esquerda", "esquerda", "direita", "direita", "cima", "cima", "direita", "direita", "direita", "esquerda", "baixo", "baixo", "direita", "direita"],
    },
    depoisDe: "recife-degraus",
  },
  {
    fase: {
      id: "recifes-exp-anel-da-concha",
      nome: "Anel da concha",
      objetivo: "Entre no anel e ache a concha na borda de cima.",
      ensino: "A entrada inferior permite ajustar o ritmo antes da passagem circular; não confunda caminho curto com janela aberta.",
      mapa: ["###..C", "#.H=##", "#.#..#", "S==H.#", "....##"],
      solucao: ["baixo", "direita", "direita", "direita", "cima", "cima", "cima", "cima", "direita", "direita"],
    },
    depoisDe: "recife-janelas",
  },
  {
    fase: {
      id: "recifes-exp-margens-de-tres",
      nome: "Margens de três",
      objetivo: "Recupere os três fragmentos e use a saída central.",
      ensino: "O braço sudeste pode ser cruzado de duas maneiras. Guarde o corredor seco do centro para a volta.",
      mapa: ["B=H..#", ".##=.#", "H..S..", "#=#.#=", "B.H=HB", "###G##"],
      solucao: ["cima", "cima", "esquerda", "direita", "esquerda", "direita", "esquerda", "esquerda", "esquerda", "baixo", "baixo", "direita", "baixo", "baixo", "esquerda", "direita", "esquerda", "direita", "direita", "direita", "direita", "direita", "esquerda", "direita", "esquerda", "esquerda", "baixo"],
    },
    depoisDe: "recife-pocas-suspensas",
  },
  {
    fase: {
      id: "recifes-exp-triangulo-do-baixio",
      nome: "Triângulo do baixio",
      objetivo: "Recolha os três fragmentos nos vértices e escape pelo extremo inferior.",
      ensino: "Os ramos norte e sudeste se encontram por trás do centro. Planeje a coleta para reduzir passagens de ida e volta.",
      mapa: ["B..#..B", "=#.=.#.", "H..H=H.", "#.S...#", ".#=##.#", "B.H==.G"],
      solucao: ["baixo", "baixo", "esquerda", "esquerda", "direita", "direita", "cima", "cima", "cima", "cima", "cima", "baixo", "cima", "esquerda", "esquerda", "direita", "direita", "baixo", "direita", "direita", "cima", "direita", "direita", "baixo", "baixo", "esquerda", "baixo", "baixo", "baixo", "direita"],
    },
    depoisDe: "recife-cintura",
  },
  {
    fase: {
      id: "recifes-exp-saida-apos-espuma",
      nome: "Saída depois da espuma",
      objetivo: "Passe pela cintura do recife, recolha os fragmentos e chegue à ostra no leste.",
      ensino: "Decida em qual refúgio encerrar a primeira metade: a última passagem não compartilha o turno de chegada da coleta.",
      mapa: ["S=H.###", "..#=..B", "##.=H.#", "B=H#.##", ".#.=..G", "...H###"],
      solucao: ["direita", "direita", "direita", "esquerda", "direita", "esquerda", "direita", "baixo", "direita", "baixo", "cima", "direita", "direita", "esquerda", "baixo", "esquerda", "baixo", "baixo", "esquerda", "baixo", "esquerda", "esquerda", "esquerda", "cima", "cima", "baixo", "baixo", "direita", "direita", "cima", "direita", "direita", "direita", "direita"],
    },
    depoisDe: "recife-cintura",
  },
  {
    fase: {
      id: "recifes-exp-coroa-da-vazante",
      nome: "Coroa da vazante",
      objetivo: "Reúna os três fragmentos da coroa e retorne à ostra no canto sul.",
      ensino: "O atalho atrás do cais contorna a passagem central. Faça a última volta quando souber onde a maré baixa termina.",
      mapa: ["B=H..#B", ".###.=.", "..=H=H.", "##.S..#", "B=H#.##", ".#.==.G", "...H..#"],
      solucao: ["cima", "esquerda", "esquerda", "esquerda", "cima", "cima", "direita", "direita", "direita", "esquerda", "direita", "direita", "baixo", "direita", "direita", "cima", "baixo", "baixo", "esquerda", "baixo", "esquerda", "esquerda", "esquerda", "baixo", "esquerda", "esquerda", "baixo", "baixo", "direita", "direita", "direita", "direita", "direita", "cima", "direita"],
    },
    depoisDe: "recife-tres-aneis",
  },
];
