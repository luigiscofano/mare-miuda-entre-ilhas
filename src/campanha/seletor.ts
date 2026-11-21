import { ehIdFase, entradasDo, mundoAtual, posicoesVisitaveis, podeSairDaPraia, rotaLivre, trilhasDo } from './index.ts';
import type { IdFase, Mundo, Progresso } from './index.ts';
import { mesmaCasa } from '../motor/index.ts';
import type { Posicao } from '../motor/index.ts';

export type Categoria = 'regular' | 'bonus' | 'chefe' | 'viagem';
export type OpcaoDoSeletor = Readonly<{
  id: string;
  nome: string;
  posicao: Posicao;
  categoria: Categoria;
  destino?: Mundo;
  fase?: IdFase;
  estado: 'bloqueada' | 'disponivel' | 'concluida';
  motivo?: string;
}>;

function bloqueio(p: Progresso, posicao: Posicao, alcancavel: (pos: Posicao) => boolean): string {
  for (const t of trilhasDo(mundoAtual(p))) {
    const vizinha = mesmaCasa(t.de, posicao) ? t.para : mesmaCasa(t.para, posicao) ? t.de : undefined;
    if (vizinha && alcancavel(vizinha) && !rotaLivre(p, t) && t.motivo) return t.motivo;
  }
  return 'Conclua as travessias anteriores para liberar este caminho.';
}

export function opcoesDoSeletor(p: Progresso): readonly OpcaoDoSeletor[] {
  const mundo = mundoAtual(p);
  if (mundo === 'arquipelago') return [];
  const visitaveis = posicoesVisitaveis(mundo, p.concluidas);
  const alcancavel = (pos: Posicao) => visitaveis.some(item => mesmaCasa(item, pos));
  const opcoes = entradasDo(mundo).map((entrada): OpcaoDoSeletor => {
    const { id, nome, posicao, destino } = entrada;
    const fase = ehIdFase(id) ? id : undefined;
    const livre = alcancavel(posicao);
    return {
      id, nome, posicao, destino, fase,
      categoria: destino ? 'viagem' : entrada.chefe ? 'chefe' : entrada.opcional ? 'bonus' : 'regular',
      estado: !livre ? 'bloqueada' : fase && p.concluidas.includes(fase) ? 'concluida' : 'disponivel',
      motivo: livre ? undefined : bloqueio(p, posicao, alcancavel),
    };
  });
  // A saída original do Cabo continua disponível no mesmo marco legado.
  const encontro = opcoes.find(o => o.fase === 'ponta-da-garca');
  if (encontro) {
    const livre = podeSairDaPraia({ ...p, posicao: encontro.posicao }) && encontro.estado !== 'bloqueada';
    opcoes.push({
      id: 'embarque-cabo', nome: 'Embarcar pelo Cabo Baixo', posicao: encontro.posicao,
      categoria: 'viagem', destino: 'arquipelago', estado: livre ? 'disponivel' : 'bloqueada',
      motivo: livre ? undefined : 'Conclua Ponta da garça para embarcar.',
    });
  }
  return opcoes;
}

export function selecionarMarco(p: Progresso, id: string) {
  // Revalide no momento do clique: opção oculta ou desatualizada não concede acesso.
  const opcao = opcoesDoSeletor(p).find(item => item.id === id);
  if (!opcao || opcao.estado === 'bloqueada') return;
  return { opcao, progresso: { ...p, posicao: opcao.posicao } };
}
