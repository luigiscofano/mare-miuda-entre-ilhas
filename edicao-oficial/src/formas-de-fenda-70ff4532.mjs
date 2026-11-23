// O núcleo não lê tempo, DOM nem storage: reprodução e jogo usam a mesma função.

export const FORMAS_DE_FENDA = ['redonda', 'estreita', 'bifurcada']         ;














































































export const PASSOS_POR_MARE = 3;
export const LIMITE_LEVADAS = 3;
export const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita']         ;
const DELTAS                           = {
  cima: { coluna: 0, linha: -1 },
  baixo: { coluna: 0, linha: 1 },
  esquerda: { coluna: -1, linha: 0 },
  direita: { coluna: 1, linha: 0 },
};

function localizar(fase      , simbolo                 )          {
  const linha = fase.mapa.findIndex(fileira => fileira.includes(simbolo));
  if (linha < 0) throw new Error(`Fase sem casa inicial ${simbolo}.`);
  return { linha, coluna: fase.mapa[linha].indexOf(simbolo) };
}
export function iniciar(fase      )         {
  const posicao = localizar(fase, 'S');
  let dupla                         ;
  if (fase.dupla) {
    const parceiro = localizar(fase, 'A');
    dupla = { posicao: parceiro, ultimoFirme: parceiro };
  }
  const terceiroInicio = fase.dupla?.terceiroAlvo ? localizar(fase, 'M') : undefined;
  const terceiro = terceiroInicio ? { posicao: terceiroInicio, ultimoFirme: terceiroInicio } : undefined;
  return { posicao, ultimoFirme: posicao, passos: 0, levadas: 0, temFragmento: false,
    fragmentos: [], ...(dupla ? { dupla } : {}),
    ...(terceiro ? { terceiro } : {}), situacao: 'jogando' };
}
export function mareAlta(passos        )          {
  return Math.floor(passos / PASSOS_POR_MARE) % 2 === 1;
}
export function passosAteVirada(passos        )         {
  return PASSOS_POR_MARE - passos % PASSOS_POR_MARE;
}
export function mesmaCasa(a         , b         )          {
  return a.coluna === b.coluna && a.linha === b.linha;
}
export function lerCelula(fase      , posicao         )                     {
  return fase.mapa[posicao.linha]?.[posicao.coluna]                      ;
}






// A concha identifica o destino já exigido pela vitória.
// Os papéis pertencem aos lugares, não prendem um siri a uma cor.
export function alvosDasConchasDaEquipe(fase      )                                  {
  if (!fase.dupla) return [];
  const alvos                         = [];
  const papelPorCasa                                                         = {
    C: 'principal',
    G: 'principal',
    [fase.dupla.segundoAlvo]: 'apoio',
    ...(fase.dupla.terceiroAlvo ? { [fase.dupla.terceiroAlvo]: 'terceiro' } : {}),
  };
  fase.mapa.forEach((fila, linha) => {
    for (let coluna = 0; coluna < fila.length; coluna += 1) {
      const casa = fila[coluna]          ;
      const papel = papelPorCasa[casa];
      if (papel) alvos.push({ posicao: { coluna, linha }, papel, sobrePlaca: false });
    }
  });
  return alvos;
}
export function vaiAtacar(ameaca                    , passo        )          {
  return ameaca !== undefined && passo >= ameaca.primeiroAtaque
    && (passo - ameaca.primeiroAtaque) % ameaca.periodo === 0;
}

// A mesma função descreve o aviso e resolve o rasante. A rota não tem relógio separado.
export function alvoDaGarca(ameaca                    , passo        )                      {
  if (!ameaca || !vaiAtacar(ameaca, passo)) return;
  if (!ameaca.rota?.length) return ameaca.alvo;
  const indice = (passo - ameaca.primeiroAtaque) / ameaca.periodo;
  const ciclo = [ameaca.alvo, ...ameaca.rota];
  return ciclo[indice % ciclo.length];
}

// Solo firme também é atingido. O voo passa por cima dos obstáculos,
// mas o refúgio elevado oculta o siri e nunca recebe a marca do rasante.
export function casasDoRasante(fase      , passo        )            {
  const alvo = alvoDaGarca(fase.ameaca, passo);
  if (!alvo) return [];
  const rasante = fase.ameaca?.rasante;
  if (!rasante) return [alvo];
  const casas            = [];
  for (let deslocamento = -rasante.alcance; deslocamento <= rasante.alcance; deslocamento++) {
    const pos = rasante.eixo === 'linha'
      ? { coluna: alvo.coluna + deslocamento, linha: alvo.linha }
      : { coluna: alvo.coluna, linha: alvo.linha + deslocamento };
    const celula = lerCelula(fase, pos);
    if (celula && celula !== '#') casas.push(pos);
  }
  return casas;
}

export function totalFragmentos(fase      )         {
  return fase.mapa.reduce((n, linha) => n + [...linha].filter(celula => celula === 'B').length, 0);
}

function calcularDestino(posicao         , direcao         )          {
  const delta = DELTAS[direcao];
  return { coluna: posicao.coluna + delta.coluna, linha: posicao.linha + delta.linha };
}

function ameacasNoTurno(fase      , posicoes                    , passos        )               {
  const motivos               = [];
  if (mareAlta(passos) && posicoes.some(pos => lerCelula(fase, pos) === '=')) motivos.push('mare');
  const rasante = casasDoRasante(fase, passos);
  if (posicoes.some(pos => rasante.some(casa => mesmaCasa(casa, pos)))) motivos.push('garca');
  return motivos;
}

function resolverObjetivo(fase, celulas, fragmentos, eventos) {
  if (!celulas.includes('C') && !celulas.includes('G')) return false;
  if (fragmentos < totalFragmentos(fase)) {
    eventos.push({ tipo: 'falta-fragmento' });
    return false;
  }
  if (fase.dupla?.terceiroAlvo &&
    (!celulas.includes(fase.dupla.segundoAlvo) || !celulas.includes(fase.dupla.terceiroAlvo))) {
    eventos.push({ tipo: 'faltam-siris' });
    return false;
  }
  if (fase.dupla && !celulas.includes(fase.dupla.segundoAlvo)) {
    eventos.push({ tipo: 'falta-parceiro' });
    return false;
  }
  eventos.push({ tipo: 'vitoria' });
  return true;
}

// Ordem estável nos mapas, na previsão e nas chegadas: coral, verde, amarelo.
export function posicoesDosSiris(estado        )            {
  return [estado.posicao, ...(estado.dupla ? [estado.dupla.posicao] : []),
    ...(estado.terceiro ? [estado.terceiro.posicao] : [])];
}

export function bocaSubmersa(fase      , boca         , passos        )          {
  return lerCelula(fase, boca) === '=' && mareAlta(passos);
}

export function fendaAtiva(fase      , fenda       , passos        )          {
  return !fenda.bocas.some(boca => bocaSubmersa(fase, boca, passos));
}





function passagemLivre(fase, estado, destino) {
  const celula = lerCelula(fase, destino);
  return !!celula && celula !== '#' && !bocaSubmersa(fase, destino, estado.passos);
}

export function preverPasso(fase      , estado        , direcao         )                {
  if (estado.dupla) return preverPassoEmGrupo(fase,estado,direcao).movimentos[0];
  const entrada = calcularDestino(estado.posicao, direcao);
  if (!passagemLivre(fase, estado, entrada)) return { entrada, motivo: 'bloqueado' };
  const fenda = fase.fendas?.find(par => par.bocas.some(boca => mesmaCasa(boca, entrada)));
  if (!fenda || !fendaAtiva(fase, fenda, estado.passos)) return { entrada, destino: entrada };

  // Só a casa em que se pisa ativa o par. A saída não dispara outra viagem.
  const destino = mesmaCasa(fenda.bocas[0], entrada) ? fenda.bocas[1] : fenda.bocas[0];
  if (!passagemLivre(fase, estado, destino)) return { entrada, motivo: 'interditada' };
  return { entrada, destino, fenda, saidaVaiAlagar: bocaSubmersa(fase, destino, estado.passos + 1) };
}



function preverIntencao(
  fase      , estado        , origem         , direcao         , ocupacao                    ,
)                   {
  const entrada = calcularDestino(origem, direcao);
  if (!passagemLivre(fase, estado, entrada)) return { origem, entrada, motivo: 'bloqueado' };
  const fenda = fase.fendas?.find(par =>
    fendaAtiva(fase, par, estado.passos) && par.bocas.some(boca => mesmaCasa(boca, entrada)));
  const ocupada = (casa         ) => ocupacao.some(siri => !mesmaCasa(siri, origem) && mesmaCasa(siri, casa));
  // A ocupação é a do começo do comando, mesmo que o outro siri vá sair.
  if (ocupada(entrada)) return { origem, entrada, ...(fenda ? { fenda } : {}), motivo: 'ocupada' };
  if (!fenda) return { origem, entrada, destino: entrada };
  const destino = mesmaCasa(fenda.bocas[0], entrada) ? fenda.bocas[1] : fenda.bocas[0];
  if (ocupada(destino)) return { origem, entrada, fenda, motivo: 'ocupada' };
  if (!passagemLivre(fase, estado, destino)) return { origem, entrada, fenda, motivo: 'interditada' };
  if (mesmaCasa(origem, destino)) return { origem, entrada, fenda, motivo: 'conflito' };
  return { origem, entrada, destino, fenda, saidaVaiAlagar: bocaSubmersa(fase, destino, estado.passos + 1) };
}

function casasReservadas(movimento                  )                     {
  if (!('destino' in movimento)) return [];
  // A fenda é indivisível: reserva a entrada e o ponto de chegada.
  return movimento.fenda ? [movimento.entrada, movimento.destino] : [movimento.destino];
}

export function preverPassoEmGrupo(fase      , estado        , direcao         )            



   {
  const origens = posicoesDosSiris(estado);
  if (origens.length === 1) {
    const passo = preverPasso(fase, estado, direcao);
    return {
      avanca: 'destino' in passo,
      posicoes: 'destino' in passo ? [passo.destino] : origens,
      movimentos: [{ ...passo, origem: origens[0] }],
    };
  }
  const intencoes = origens.map(origem => preverIntencao(fase, estado, origem, direcao, origens));
  const reservas = intencoes.map(casasReservadas);
  // Não há prioridade entre cores: se dois trajetos se disputam, ambos ficam.
  // A lista de conflitos é calculada antes de remover qualquer intenção.
  const conflitos = reservas.map((casas, i) => reservas.some((outras, j) =>
    i !== j && casas.some(casa => outras.some(outra => mesmaCasa(casa, outra)))));
  const movimentos = intencoes.map((m, i)                   => {
    if (!conflitos[i] || !('destino' in m)) return m;
    return { origem: m.origem, entrada: m.entrada, fenda: m.fenda, motivo: 'conflito' };
  });
  return {
    avanca: movimentos.some(m => 'destino' in m),
    movimentos,
    posicoes: movimentos.map(movimento => 'destino' in movimento ? movimento.destino : movimento.origem),
  };
}

// A marca de movimento aponta para a boca pisada, não para a saída distante.
export function destinoPermitido(fase      , estado        , direcao         )                      {
  const previsao = preverPasso(fase, estado, direcao);
  return 'destino' in previsao ? previsao.entrada : undefined;
}

// A maré anterior decide se o passo pode começar. A nova, junto das ameaças,
// decide se os dois siris ficam seguros antes de qualquer coleta ou vitória.
export function executarPasso(fase      , anterior        , acao      )            {
  if (anterior.situacao !== 'jogando') return { estado: anterior, eventos: [] };
  const { dupla, terceiro } = anterior;
  if (!DIRECOES.includes(acao)) return { estado: anterior, eventos: [] };
  const previsao = preverPassoEmGrupo(fase, anterior, acao);
  const eventos           = [];
  previsao.movimentos.forEach((m, indice) => {
    const siri = indice             ;
    if ('destino' in m) {
      if (m.fenda) eventos.push({ tipo: 'fenda-atravessada', forma: m.fenda.forma, ...(dupla ? { siri } : {}) });
    } else if (m.motivo !== 'bloqueado' && (m.fenda || !dupla)) {
      eventos.push({ tipo: 'fenda-bloqueada', motivo: m.motivo,
        ...(dupla ? { siri } : {}), ...(previsao.avanca ? { grupoAvancou: true } : {}) });
    }
  });
  if (!previsao.avanca) {
    if (eventos.length === 0) eventos.push({ tipo: 'bloqueado' });
    return { estado: anterior, eventos };
  }
  const passos = anterior.passos + 1;
  const posicoes = previsao.posicoes;
  if (passos % PASSOS_POR_MARE === 0) {
    eventos.push({ tipo: 'virada', alta: mareAlta(passos) });
  }
  const motivos = ameacasNoTurno(fase, posicoes, passos);

  if (motivos.length > 0) {
    // Toda a equipe retorna ao mesmo instantâneo, nunca a marcos gravados
    // separadamente. O retorno não cria uma disputa por uma casa firme.
    const levadas = anterior.levadas + 1;
    eventos.push({ tipo: 'levada', motivos });
    const perdeu = levadas >= LIMITE_LEVADAS;
    return {
      estado: { ...anterior, passos, levadas, posicao: anterior.ultimoFirme,
        ...(dupla ? { dupla: { ...dupla, posicao: dupla.ultimoFirme } } : {}),
        ...(terceiro ? { terceiro: { ...terceiro, posicao: terceiro.ultimoFirme } } : {}),
        situacao: perdeu ? 'derrota' : 'jogando' },
      eventos,
    };
  }

  const celulas = posicoes.map(p => lerCelula(fase, p));
  const chegadas = posicoes.flatMap((destino, i) => {
    const { origem } = previsao.movimentos[i];
    return !dupla || !mesmaCasa(origem, destino) ? [{ origem, destino, celula: celulas[i], siri: i              }] : [];
  });
  const novasColetas = chegadas.filter(({ destino, celula }) =>
    celula === 'B' && !anterior.fragmentos.some(p => mesmaCasa(p, destino)));
  const fragmentos = novasColetas.length > 0 ? [...anterior.fragmentos, ...novasColetas.map(x => x.destino)] : anterior.fragmentos;
  for (const _ of novasColetas) eventos.push({ tipo: 'fragmento' });
  const venceu = resolverObjetivo(fase, celulas, fragmentos.length, eventos);
  const [posicao, posicaoParceiro, posicaoTerceiro] = posicoes;
  // Os marcos do grupo vêm de um mesmo turno seguro e não se sobrepõem.
  const firmes = celulas.every(casa => casa !== '=');
  const novaDupla = dupla && posicaoParceiro
    ? { ...dupla, posicao: posicaoParceiro, ultimoFirme: firmes ? posicaoParceiro : dupla.ultimoFirme }
    : undefined;
  return {
    estado: { ...anterior, posicao, passos, temFragmento: fragmentos.length > 0, fragmentos,
      ultimoFirme: firmes ? posicao : anterior.ultimoFirme,
      ...(novaDupla ? { dupla: novaDupla } : {}),
      ...(terceiro && posicaoTerceiro ? { terceiro: { ...terceiro, posicao: posicaoTerceiro,
        ultimoFirme: firmes ? posicaoTerceiro : terceiro.ultimoFirme } } : {}),
      situacao: venceu ? 'vitoria' : 'jogando' },
    eventos,
  };
}
