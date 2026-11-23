                                                                                
import { DIRECOES, executarPasso, iniciar, mareAlta, mesmaCasa, posicoesDosSiris } from '@@MARE:modulo:src/formas-de-fenda-70ff4532.mjs@@';
import { validarSolucao } from '@@MARE:modulo:src/validar-mapa-52e6db35.mjs@@';
import { abrirMargem, direcao, embaralhar, gradeVazia, ler, marcar, marcarBaixios, ramoDaMargem, construirMargensAlinhadas } from '@@MARE:modulo:src/ler-9611041c.mjs@@';
                                         

export const MUNDOS_MARE_A_MAO = ['praia', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol']         ;
                                                             
export const DIFICULDADES_MARE_A_MAO = ['Sossegado', 'Animado', 'Puxado', 'Mar Bravo', 'Maré Feroz']         ;
                                                                         
                                       
                       
                                   
                   
                 
                     
   

const MAXIMO_TENTATIVAS = 24;
const TENTATIVAS_GRUPO_LIVRE = 4;
const TAMANHOS = [7, 9, 11, 13, 15]         ;
const PERIODOS_GARCA = [11, 9, 7, 5, 3]         ;
const VERSAO_SOLO = 'v1';
const VERSAO_GRUPO_INICIAL = 'v2';
const VERSAO_GRUPO_AVANCADO = 'v3';

function hash(texto        , base        )         {
  for (let i = 0; i < texto.length; i++) base = Math.imul(base ^ texto.charCodeAt(i), 0x01000193);
  return base >>> 0;
}

function sorteador(semente        )          {
  let estado = semente;
  return limite => {
    estado = (estado + 0x9e3779b9) | 0;
    let valor = Math.imul(estado ^ (estado >>> 16), 0x21f0aaad);
    valor = Math.imul(valor ^ (valor >>> 15), 0x735a2d97);
    return ((valor ^ (valor >>> 15)) >>> 0) % limite;
  };
}

function patrulha(fase      , dificuldade        , sorteio         )                     {
  const quadros                                        = [];
  let estado = iniciar(fase);
  for (const acao of fase.solucao) {
    estado = executarPasso(fase, estado, acao).estado;
    quadros.push({ turno: estado.passos, siris: posicoesDosSiris(estado) });
  }
  const lugares = fase.mapa.flatMap((linha, y) => [...linha].flatMap((celula, x) =>
    celula === '.' || celula === '=' ? [{ coluna: x, linha: y }] : []));
  const periodo = PERIODOS_GARCA[dificuldade];
  const primeiroAtaque = 2 + sorteio(3);
  const totalAlvos = Math.min(dificuldade + 1, 4, Math.floor((estado.passos - primeiroAtaque) / periodo) + 1);
  const rodada = quadros.filter(q => q.turno >= primeiroAtaque && (q.turno - primeiroAtaque) % periodo === 0);
  const alvos            = [];
  for (let i = 0; i < totalAlvos; i++) {
    const ataques = rodada.filter((_, rodada) => rodada % totalAlvos === i);
    const opcoes = lugares.filter(lugar =>
      !alvos.some(v => mesmaCasa(v, lugar))
      && ataques.every(q => q.siris.every(siri => !mesmaCasa(siri, lugar))));
    // Prefira a rota dos próprios siris perto do momento de ataque, em vez
    // de ameaçar uma decoração ou uma casa que ninguém precisa visitar.
    const visitadas = opcoes.filter(lugar => quadros.some(
      q => q.siris.some(siri => mesmaCasa(siri, lugar)) && ataques.some(ataque => Math.abs(ataque.turno - q.turno) <= 2),
    ));
    const alvo = visitadas[sorteio(Math.max(1, visitadas.length))];
    if (!alvo) return;
    alvos.push(alvo);
  }
  if (alvos.length === 0) return;
  return { alvo: alvos[0], primeiroAtaque, periodo, ...(alvos.length > 1 ? { rota: alvos.slice(1) } : {}) };
}

// A busca usa o próprio motor. Sem ameaça, posições, pérola e ciclo de seis
// passos bastam: a última posição firme só importa em rotas com levada.
function resolverGrupo(fase      )                        {
                                                            
  const inicio = iniciar(fase);
  const fila       = [{ estado: inicio, pai: -1 }];
  const chave = (estado        ) => [
    estado.passos % 6, Number(estado.temFragmento),
    ...posicoesDosSiris(estado).map(p => p.linha * fase.mapa[0].length + p.coluna),
  ].join(':');
  const vistas = new Set([chave(inicio)]);
  const limite = 4_000;

  for (let atual = 0; atual < fila.length && fila.length < limite; atual++) {
    const no = fila[atual];
    for (const acao of DIRECOES) {
      const { estado } = executarPasso(fase, no.estado, acao);
      if (estado.passos === no.estado.passos || estado.levadas) continue;
      if (estado.situacao === 'vitoria') {
        const rota = [acao];
        for (let i = atual; fila[i].pai >= 0; i = fila[i].pai) rota.push(fila[i].acao );
        return rota.reverse();
      }
      const id = chave(estado);
      if (!vistas.has(id)) {
        vistas.add(id);
        fila.push({ estado, pai: atual, acao });
      }
    }
  }
}

function rotaSolo(grade                           , caminho           ,
  ramo                                 )                        {
  const solucao            = [];
  for (let i = 1; i < caminho.length; i++) {
    const origem = caminho[i - 1];
    const destino = caminho[i];
    if (ler(grade, destino) === '=') {
      // A ida e volta entre duas casas firmes prepara a próxima baixa.
      for (let volta = 0; (mareAlta(solucao.length) || mareAlta(solucao.length + 1)) && volta < 2; volta++) {
        const anterior = caminho[i - 2];
        solucao.push(direcao(origem, anterior), direcao(anterior, origem));
      }
      if (mareAlta(solucao.length) || mareAlta(solucao.length + 1)) return;
    }
    solucao.push(direcao(origem, destino));
    if (ramo && mesmaCasa(ramo.entrada, destino)) {
      solucao.push(direcao(destino, ramo.fim), direcao(ramo.fim, destino));
    }
  }
  return solucao;
}

function preparar(opcoes                , mundo        , dificuldade        , id        , sorteio         , alinharMargens = false)                   {
  const { siris, fragmento, garca } = opcoes;
  const grade = gradeVazia(TAMANHOS[dificuldade], siris);
  const margens = embaralhar(Array.from({ length: siris }, (_, i) => i), sorteio);
  // As trilhas têm curvas próprias, mas começam a progredir para o mesmo
  // lado. Parede e baixio deixam as margens se dessincronizar.
  const sentido = siris > 1 ? sorteio(2) === 1 : undefined;
  const trajetos = alinharMargens
    ? construirMargensAlinhadas(grade, margens, dificuldade, mundo, sentido , sorteio)
    : margens.map(margem => abrirMargem(grade, margem, dificuldade + 1, mundo, sorteio, sentido));
  const [principal] = trajetos;
  trajetos.forEach((trilha, i) => {
    marcar(grade, trilha[0], i === 0 ? 'S' : i === 1 ? 'A' : 'M');
    marcar(grade, trilha.at(-1) , i === 0 ? (fragmento ? 'G' : 'C') : i === 1 ? 'T' : 'Y');
  });
  const ramo = fragmento ? ramoDaMargem(grade, principal, sorteio) : undefined;
  if (fragmento && !ramo) return;
  if (ramo) marcar(grade, ramo.fim, 'B');
  if (alinharMargens) {
    const limiteComum = Math.min(...trajetos.map(trilha => trilha.length));
    if (!marcarBaixios(grade, principal.slice(0, limiteComum), dificuldade + 1, ramo?.entrada, sorteio)) return;
    for (const trilha of trajetos.slice(1)) for (let i = 0; i < limiteComum - 1; i++) {
      const tipo = ler(grade, principal[i]);
      if (tipo === '=' || tipo === 'H') marcar(grade, trilha[i], tipo);
    }
  } else for (let i = 0; i < siris; i++) {
    if (!marcarBaixios(grade, trajetos[i], dificuldade + 1, i === 0 ? ramo?.entrada : undefined, sorteio)) return;
  }

  const chegadaEmGrupo = siris === 2
    ? 'Termine com os dois siris nas duas conchas ao mesmo tempo.'
    : 'Termine com os três siris nas três conchas ao mesmo tempo.';
  const tarefa = siris > 1
    ? (fragmento ? `Recolha a pérola. ${chegadaEmGrupo}` : chegadaEmGrupo)
    : fragmento ? 'Recolha a pérola e chegue à Concha de Chegada.' : 'Chegue à concha.';
  const dicas = ['Atravesse os baixios antes da subida. Em terra firme, avançar e voltar prepara a próxima baixa.'];
  if (garca) dicas.push('Confira o alvo da garça antes do próximo passo.');
  if (siris > 1) dicas.push('Uma direção move todos os siris juntos. Quem estiver bloqueado fica no lugar; o relógio avança uma vez.');
  const fase       = {
    id, nome: `Ilha de Improviso · ${opcoes.dificuldade}`, objetivo: tarefa,
    ensino: dicas.join(' '), mapa: grade.map(linha => linha.join('')), solucao: [],
    ...(siris > 1 ? { dupla: { segundoAlvo: 'T', ...(siris === 3 ? { terceiroAlvo: 'Y' } : {}) } } : {}),
  };
  const solucao = siris === 1 ? rotaSolo(grade, principal, ramo) : resolverGrupo(fase);
  if (!solucao) return;
  const certificada = { ...fase, solucao };
  const ameaca = garca ? patrulha(certificada, dificuldade, sorteio) : undefined;
  if (garca && !ameaca) return;
  return ameaca ? { ...certificada, ameaca } : certificada;
}

export function gerarMareAMao(opcoes                , semente        )                   {
  if (!opcoes || typeof semente !== 'string' || semente.length > 80
    || ![1, 2, 3].includes(opcoes.siris) || typeof opcoes.garca !== 'boolean' || typeof opcoes.fragmento !== 'boolean') return;
  const nome = semente.trim().normalize('NFC');
  if (!nome) return;
  const mundo = MUNDOS_MARE_A_MAO.indexOf(opcoes.mundo);
  const dificuldade = DIFICULDADES_MARE_A_MAO.indexOf(opcoes.dificuldade);
  if (mundo < 0 || dificuldade < 0) return;

  // Preserve as representações antigas onde a geração já não criava placa nem portão.
  const versao = opcoes.siris === 1
    ? VERSAO_SOLO
    : dificuldade < 2 ? VERSAO_GRUPO_INICIAL : VERSAO_GRUPO_AVANCADO;
  const chave = [versao, nome, opcoes.mundo, opcoes.dificuldade, opcoes.siris, opcoes.garca, opcoes.fragmento].join('\0');
  const numero = hash(chave, 0x811c9dc5);
  const sufixo = hash(chave, 0x5b534cb1);
  const id = `mare-a-mao-${versao}-${numero.toString(36)}-${sufixo.toString(36)}`;
  const sorteio = sorteador(numero);
  for (let i = 0; i < MAXIMO_TENTATIVAS; i++) {
    const alinhar = opcoes.siris > 1 && i >= TENTATIVAS_GRUPO_LIVRE;
    const candidata = preparar(opcoes, mundo, dificuldade, id, sorteio, alinhar);
    try {
      if (candidata && validarSolucao(candidata)) return candidata;
    } catch {
      // Uma tentativa recusada pelo mesmo motor usado no jogo não chega à tela.
    }
  }
}
