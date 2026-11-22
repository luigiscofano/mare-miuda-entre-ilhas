import type { Acao, Ameaca, Estado, Fase, Posicao } from '../motor/index.ts';
import { executarPasso, iniciar, mareAlta, mesmaCasa, posicoesDosSiris } from '../motor/index.ts';
import { validarSolucao } from '../validacao/index.ts';
import { abrirMargem, direcao, embaralhar, gradeVazia, ler, marcar, marcarBaixios, ramoDaMargem } from './mapa.ts';
import type { Sorteio } from './mapa.ts';

export const MUNDOS_MARE_A_MAO = ['praia', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'] as const;
export type MundoMareAMao = typeof MUNDOS_MARE_A_MAO[number];
export const DIFICULDADES_MARE_A_MAO = ['Sossegado', 'Animado', 'Puxado', 'Mar Bravo', 'Maré Feroz'] as const;
export type DificuldadeMareAMao = typeof DIFICULDADES_MARE_A_MAO[number];
export type OpcoesMareAMao = Readonly<{
  mundo: MundoMareAMao;
  dificuldade: DificuldadeMareAMao;
  siris: 1 | 2 | 3;
  garca: boolean;
  fragmento: boolean;
}>;

const MAXIMO_TENTATIVAS = 24;
const TAMANHOS = [7, 9, 11, 13, 15] as const;
const PERIODOS_GARCA = [11, 9, 7, 5, 3] as const;
const VERSAO = 'v1';

function hash(texto: string, base: number): number {
  for (let i = 0; i < texto.length; i++) base = Math.imul(base ^ texto.charCodeAt(i), 0x01000193);
  return base >>> 0;
}

function sorteador(semente: number): Sorteio {
  let estado = semente;
  return limite => {
    estado = (estado + 0x9e3779b9) | 0;
    let valor = Math.imul(estado ^ (estado >>> 16), 0x21f0aaad);
    valor = Math.imul(valor ^ (valor >>> 15), 0x735a2d97);
    return ((valor ^ (valor >>> 15)) >>> 0) % limite;
  };
}

function patrulha(fase: Fase, dificuldade: number, sorteio: Sorteio): Ameaca | undefined {
  const quadros: { turno: number; siris: Posicao[] }[] = [];
  let estado = iniciar(fase);
  for (const acao of fase.solucao) {
    estado = executarPasso(fase, estado, acao).estado;
    if (acao !== 'trocar') quadros.push({ turno: estado.passos, siris: posicoesDosSiris(estado) });
  }
  const lugares = fase.mapa.flatMap((linha, y) => [...linha].flatMap((celula, x) =>
    celula === '.' || celula === '=' ? [{ coluna: x, linha: y }] : []));
  const periodo = PERIODOS_GARCA[dificuldade];
  const primeiroAtaque = 2 + sorteio(3);
  const totalAlvos = Math.min(dificuldade + 1, 4, Math.floor((estado.passos - primeiroAtaque) / periodo) + 1);
  const rodada = quadros.filter(q => q.turno >= primeiroAtaque && (q.turno - primeiroAtaque) % periodo === 0);
  const alvos: Posicao[] = [];
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

function preparar(opcoes: OpcoesMareAMao, mundo: number, dificuldade: number, id: string, sorteio: Sorteio): Fase | undefined {
  const { siris, fragmento, garca } = opcoes;
  const grade = gradeVazia(TAMANHOS[dificuldade], siris);
  const cooperativo = siris > 1 && dificuldade >= 2;
  const margens = embaralhar(Array.from({ length: siris }, (_, i) => i), sorteio);
  const trajetos = margens.map(margem => abrirMargem(grade, margem, dificuldade + 1, mundo, sorteio));
  const [principal] = trajetos;
  trajetos.forEach((trilha, i) => {
    marcar(grade, trilha[0], i === 0 ? 'S' : i === 1 ? 'A' : 'M');
    marcar(grade, trilha.at(-1)!, i === 0 ? (fragmento ? 'G' : 'C') : i === 1 ? (cooperativo ? 'P' : 'T') : 'Y');
  });
  if (cooperativo) marcar(grade, principal.at(-2)!, 'D');
  const ramo = fragmento ? ramoDaMargem(grade, principal, sorteio) : undefined;
  if (fragmento && !ramo) return;
  if (ramo) marcar(grade, ramo.fim, 'B');
  for (let siri = 0; siri < siris; siri++) {
    if (!marcarBaixios(grade, trajetos[siri], dificuldade + 1, siri === 0 ? ramo?.entrada : undefined, sorteio)) return;
  }

  const ordem = cooperativo ? [1, 0, ...(siris === 3 ? [2] : [])] : trajetos.map((_, i) => i);
  const solucao: Acao[] = [];
  let ativo = 0;
  let passos = 0;
  for (const siri of ordem) {
    while (ativo !== siri) {
      solucao.push('trocar');
      ativo = (ativo + 1) % siris;
    }
    const caminho = trajetos[siri];
    for (let i = 1; i < caminho.length; i++) {
      const origem = caminho[i - 1];
      const destino = caminho[i];
      if (ler(grade, destino) === '=') {
        // Uma ida e volta entre firmes avança dois turnos. Em até duas
        // voltas alcançamos um dos dois turnos seguros de entrada no baixio.
        for (let idaVolta = 0; (mareAlta(passos) || mareAlta(passos + 1)) && idaVolta < 2; idaVolta++) {
          const anterior = caminho[i - 2];
          solucao.push(direcao(origem, anterior), direcao(anterior, origem));
          passos += 2;
        }
        if (mareAlta(passos) || mareAlta(passos + 1)) return;
      }
      solucao.push(direcao(origem, destino));
      passos++;
      if (siri === 0 && ramo && mesmaCasa(ramo.entrada, destino)) {
        solucao.push(direcao(destino, ramo.fim), direcao(ramo.fim, destino));
        passos += 2;
      }
    }
  }

  const tarefa = fragmento ? 'Recolha a pérola e chegue à Concha de Chegada.' : 'Chegue à concha.';
  const dicas = ['Atravesse os baixios antes da subida. Em terra firme, avançar e voltar prepara a próxima baixa.'];
  if (garca) dicas.push('Confira o alvo da garça antes do próximo passo.');
  if (siris > 1) dicas.push('Use Espaço ou Trocar siri. Os siris compartilham o relógio.');
  if (cooperativo) dicas.push('Deixe o Verde sobre a placa para o Coral cruzar o portão.');
  const fase: Fase = {
    id, nome: `Ilha de Improviso · ${opcoes.dificuldade}`, objetivo: tarefa + (siris > 1 ? ' Termine com cada siri no seu destino.' : ''),
    ensino: dicas.join(' '), mapa: grade.map(linha => linha.join('')), solucao,
    ...(siris > 1 ? { dupla: { segundoAlvo: cooperativo ? 'P' : 'T', ...(siris === 3 ? { terceiroAlvo: 'Y' } : {}) } } : {}),
  };
  const ameaca = garca ? patrulha(fase, dificuldade, sorteio) : undefined;
  if (garca && !ameaca) return;
  return ameaca ? { ...fase, ameaca } : fase;
}

export function gerarMareAMao(opcoes: OpcoesMareAMao, semente: string): Fase | undefined {
  if (!opcoes || typeof semente !== 'string' || semente.length > 80
    || ![1, 2, 3].includes(opcoes.siris) || typeof opcoes.garca !== 'boolean' || typeof opcoes.fragmento !== 'boolean') return;
  const nome = semente.trim().normalize('NFC');
  if (!nome) return;
  const mundo = MUNDOS_MARE_A_MAO.indexOf(opcoes.mundo);
  const dificuldade = DIFICULDADES_MARE_A_MAO.indexOf(opcoes.dificuldade);
  if (mundo < 0 || dificuldade < 0) return;

  const chave = [VERSAO, nome, opcoes.mundo, opcoes.dificuldade, opcoes.siris, opcoes.garca, opcoes.fragmento].join('\0');
  const numero = hash(chave, 0x811c9dc5);
  const sufixo = hash(chave, 0x5b534cb1);
  const id = `mare-a-mao-${VERSAO}-${numero.toString(36)}-${sufixo.toString(36)}`;
  const sorteio = sorteador(numero);
  for (let i = 0; i < MAXIMO_TENTATIVAS; i++) {
    const candidata = preparar(opcoes, mundo, dificuldade, id, sorteio);
    try {
      if (candidata && validarSolucao(candidata)) return candidata;
    } catch {
      // Uma tentativa recusada pelo mesmo motor usado no jogo não chega à tela.
    }
  }
}
