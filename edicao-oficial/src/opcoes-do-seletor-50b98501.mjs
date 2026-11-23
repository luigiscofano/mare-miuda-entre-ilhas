import { faseDaCampanha } from '@@MARE:modulo:src/fases-d5b7ec17.mjs@@';
import { FENDAS_DA_ENSEADA } from '@@MARE:modulo:src/campanha/fichas/desvios.mjs@@';
import { travessiasDaExpansao } from '@@MARE:modulo:src/expansao-5dd97c18.mjs@@';
import { ehIdFase, entradasDo, motivoDaRota, mundoAtual, posicoesVisitaveis, podeSairDaPraia, rotaLivre, trilhasDo } from '@@MARE:modulo:src/mundo-valido-900be48c.mjs@@';
                                                           
import { mesmaCasa } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
                                                 

                                                                 
                                       
             
               
                   
                       
                  
                
                                                   
                  
                    
                     
   

function bloqueio(p           , posicao         , alcancavel                           )         {
  for (const t of trilhasDo(mundoAtual(p))) {
    const vizinha = mesmaCasa(t.de, posicao) ? t.para : mesmaCasa(t.para, posicao) ? t.de : undefined;
    if (vizinha && alcancavel(vizinha) && !rotaLivre(p, t)) return motivoDaRota(p, t);
  }
  return 'Conclua as travessias anteriores para liberar este caminho.';
}

export function opcoesDoSeletor(p           )                            {
  const mundo = mundoAtual(p);
  if (mundo === 'arquipelago') return [];
  const visitaveis = posicoesVisitaveis(mundo, p.concluidas);
  const alcancavel = (pos         ) => visitaveis.some(item => mesmaCasa(item, pos));
  const opcoesOriginais = entradasDo(mundo).map((entrada)                 => {
    const { id, nome, posicao, destino } = entrada;
    const fase = ehIdFase(id) ? id : undefined;
    const livre = alcancavel(posicao);
    return {
      id, nome: fase ? faseDaCampanha(fase).nome : nome, posicao, destino, fase,
      categoria: destino ? 'viagem' : entrada.chefe ? 'chefe' : entrada.opcional ? 'bonus' : 'regular',
      estado: !livre ? 'bloqueada' : fase && p.concluidas.includes(fase) ? 'concluida' : 'disponivel',
      motivo: livre ? undefined : bloqueio(p, posicao, alcancavel),
    };
  });
  const expansao = travessiasDaExpansao(mundo);
  const concluidas = new Set(p.concluidas);
  const opcoes = opcoesOriginais.flatMap((ancora)                   => {
    if (!ancora.fase || ancora.categoria !== 'regular') return [ancora];
    // A expansão herda a posição salva da travessia de referência. Não cria
    // nós extras no mapa nem muda as exigências das rotas já existentes.
    const novas = expansao.filter(({ depoisDe }) => depoisDe === ancora.fase);
    let anterior = ancora;
    const sequencia = novas.map(({ fase })                 => {
      const livre = anterior.estado === 'concluida';
      anterior = {
        id: fase.id, fase: fase.id, nome: faseDaCampanha(fase.id).nome, posicao: ancora.posicao, categoria: 'regular',
        depoisDe: ancora.fase, soNoSeletor: true,
        estado: !livre ? 'bloqueada' : concluidas.has(fase.id) ? 'concluida' : 'disponivel',
        motivo: livre ? undefined : `Conclua ${anterior.nome} para liberar esta travessia.`,
      };
      return anterior;
    });
    return [ancora, ...sequencia];
  });
  if (mundo === 'enseada') {
    // Desvio de ensino no seletor; a posição do marco antigo continua no save.
    let anterior = opcoesOriginais.find(opcao => opcao.fase === 'enseada-abrigo-ondas');
    if (anterior) {
      const posicao = anterior.posicao;
      for (const fase of FENDAS_DA_ENSEADA) {
        const livre = anterior.estado === 'concluida';
        const nova                 = {
          id: fase.id, fase: fase.id, nome: faseDaCampanha(fase.id).nome, posicao, categoria: 'bonus', soNoSeletor: true,
          estado: !livre ? 'bloqueada' : concluidas.has(fase.id) ? 'concluida' : 'disponivel',
          motivo: livre ? undefined : `Conclua ${anterior.nome} para liberar este desvio.`,
        };
        opcoes.push(nova);
        anterior = nova;
      }
    }
  }
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

export function selecionarMarco(p           , id        ) {
  // Revalide no momento do clique: opção oculta ou desatualizada não concede acesso.
  const opcao = opcoesDoSeletor(p).find(item => item.id === id);
  if (!opcao || opcao.estado === 'bloqueada') return;
  return { opcao, progresso: { ...p, posicao: opcao.posicao } };
}
