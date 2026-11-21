import { balsasNoTurno, casasDoRasante, executarPasso, faixaRessacaNoTurno, feixeNoTurno, iniciar, janelaGrutaAtiva, LIMITE_LEVADAS, mareAlta, nomeDaEtapaGruta, nomeDaJanelaGruta, passagemDoRecifeFechada, PASSOS_POR_MARE, passosAteTrocaFeixe, passosAteVirada, mesmaCasa, posicoesDosSiris, siriAtivo, totalAncoradouros, totalFragmentos } from '../motor/index.ts';
import type { Acao, Direcao, Evento, OrientacaoFarol } from '../motor/index.ts';
import { FASES_BANCADA, TODAS_AS_FASES } from '../fases/index.ts';
import { ALTURA, DENSIDADE, desenhar, desenharPraia, LARGURA } from '../render/index.ts';
import { conectarTeclado } from '../entrada/index.ts';
import { abriuEnseada, campanhaConcluida, CAPITULO_FINAL, concluirFase, entradaEm, entradasDo, ehIdFase, moverNoMapa, mundoAtual, nomeDo, rotaLivre, saidaEm, totalDeFasesRegulares, viajar } from '../campanha/index.ts';
import { prepararTravessia } from '../campanha/travessia.ts';
import { carregar, salvar } from '../persistencia/index.ts';
import { criarAudio } from '../audio/index.ts';
import { gerarMareAMao, DIFICULDADES_MARE_A_MAO, MUNDOS_MARE_A_MAO, type OpcoesMareAMao } from '../mare-a-mao/index.ts';
import {
  incluirNoHistorico, lerHistoricoMare, salvarHistoricoMare, type EntradaMareAMao,
} from './historico-mare-a-mao.ts';
import { selecionarMarco } from '../campanha/seletor.ts';
import { renderizarSeletor } from './seletor.ts';

function buscar<T extends HTMLElement = HTMLElement>(seletor: string): T {
  const elemento = document.querySelector<T>(seletor);
  if (!elemento) throw new Error(`Elemento ausente: ${seletor}`);
  return elemento;
}

function montarCanvas(seletor: string, moldura: string) {
  const canvas = buscar<HTMLCanvasElement>(seletor);
  const borda = buscar(moldura);
  canvas.width = LARGURA * DENSIDADE;
  canvas.height = ALTURA * DENSIDADE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível neste navegador.');
  ctx.setTransform(DENSIDADE, 0, 0, DENSIDADE, 0, 0);
  function escala() {
    canvas.style.width = `${LARGURA * Math.max(1, Math.floor(borda.clientWidth / LARGURA))}px`;
  }
  new ResizeObserver(escala).observe(borda);
  escala();
  return { ctx, escala };
}

function storageLocal() {
  try { return window.localStorage; } catch { return undefined; }
}

const tabuleiro = montarCanvas('#tabuleiro', '#moldura');
const arteArquipelago = buscar<HTMLImageElement>('#arte-arquipelago');
const fauna = buscar<HTMLImageElement>('#folha-fauna');
const mapaPraia = montarCanvas('#mapa-praia', '#moldura-praia');
const storage = storageLocal();
let save = carregar(storage);
const audio = criarAudio();
audio.volumes(save.audio);

const logo = buscar<HTMLImageElement>('#marca-praia');
const molduraLogo = buscar('#moldura-logo');
function escalaDaLogo() {
  const larguraNativa = 180; // Grade original da placa, sem reamostragem.
  const inteiro = Math.max(1, Math.floor(molduraLogo.clientWidth / larguraNativa));
  logo.style.width = `${larguraNativa * inteiro}px`;
}
new ResizeObserver(escalaDaLogo).observe(molduraLogo);

type Tela = 'inicio' | 'praia' | 'fase' | 'creditos' | 'mare-a-mao';
const paineis: Record<Tela, HTMLElement> = {
  inicio: buscar('#inicio'), praia: buscar('#praia'), fase: buscar('#fase'), creditos: buscar('#creditos'),
  'mare-a-mao': buscar('#mare-a-mao'),
};
const listaTestes = buscar('#fases-teste');
const niveis = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-fase]'));
const controlesDaFase = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-direcao]'));
const controlesDoMapa = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-mapa-direcao]'));
const volumes = {
  musica: buscar<HTMLInputElement>('#volume-musica'),
  efeitos: buscar<HTMLInputElement>('#volume-efeitos'),
};
type ContextoCreditos = 'inicio' | 'praia' | 'final';
const TEXTOS_CREDITOS: Record<ContextoCreditos, string> = {
  inicio: 'O caminho começa na Praia das Conchas.',
  praia: 'Você chegou à ponta da praia. A primeira viagem termina aqui; volte ao mapa para seguir à Enseadinha ou embarcar pelas próximas ilhas.',
  final: 'A luz voltou. Quando a maré subiu, o farol mostrou o caminho de casa. As ilhas continuam esperando por você.',
};
let tela: Tela = 'inicio';
let contextoCreditos: ContextoCreditos = 'inicio';
let quadroMapa: number | undefined;
let bancada = false;
let desafioAvulso: EntradaMareAMao | undefined;
let historicoMare = lerHistoricoMare(storage);
let proximaSemente = 0;

const controlesMare = {
  mundo: buscar<HTMLSelectElement>('#mare-tema'),
  dificuldade: buscar<HTMLSelectElement>('#mare-dificuldade'),
  siris: buscar<HTMLSelectElement>('#mare-siris'),
  garca: buscar<HTMLInputElement>('#mare-garca'),
  fragmento: buscar<HTMLInputElement>('#mare-item'),
};
const modoCampanha = () => !bancada && !desafioAvulso;
const temaDaFase = () => bancada ? false : desafioAvulso?.opcoes.mundo ?? mundoAtual(save.progresso);
let indice = 0;
let fase = FASES_BANCADA[0];
let estado = iniciar(fase);

function gravar() {
  buscar('#aviso-save').hidden = salvar(storage, save);
}

function atualizarAmbiente() {
  const avulso = (tela === 'fase' || tela === 'mare-a-mao') ? desafioAvulso?.opcoes.mundo : undefined;
  const comTemaPadrao = (tela === 'fase' && bancada) || tela === 'mare-a-mao';
  const mundo = avulso ?? (comTemaPadrao ? 'praia' : mundoAtual(save.progresso));
  audio.ambiente(mundo, !document.hidden);
}

function trocarTela(destino: Tela, focar = true): void {
  if (destino !== 'praia' && quadroMapa !== undefined) {
    window.cancelAnimationFrame(quadroMapa);
    quadroMapa = undefined;
  }
  tela = destino;
  buscar('#jogo').setAttribute('data-tela', destino);
  for (const [nome, painel] of Object.entries(paineis)) painel.hidden = nome !== destino;
  listaTestes.hidden = destino !== 'fase' || !bancada;
  atualizarAmbiente();
  if (destino === 'inicio') {
    escalaDaLogo();
    buscar('#comecar').textContent = save.progresso.viuTutorial ? 'Continuar viagem' : 'Começar viagem';
  }
  if (destino === 'fase') tabuleiro.escala();
  if (destino === 'praia' && mundoAtual(save.progresso) === 'arquipelago') mapaPraia.escala();
  if (focar) paineis[destino].querySelector('h2')?.focus();
}

function atualizarPraia(mensagem = ''): void {
  const p = save.progresso;
  const mundo = mundoAtual(p);
  buscar('#rever-desfecho').hidden = mundo !== 'farol' || !campanhaConcluida(p);
  const entrada = entradaEm(p.posicao, mundo);
  const direto = mundo !== 'arquipelago';
  const seletor = buscar('#seletor-fases');
  seletor.hidden = !direto;
  for (const id of ['#moldura-praia', '#controles-arquipelago', '#dica-arquipelago', '#saidas-praia', '#posicao-praia']) {
    buscar(id).hidden = direto;
  }
  buscar('#titulo-praia').textContent = nomeDo(mundo);
  buscar('#mensagem-praia').textContent = mensagem;
  buscar('#enseada-aberta').hidden = direto || !abriuEnseada(p);
  paineis.praia.setAttribute('aria-busy', String(quadroMapa !== undefined));
  buscar('#viagem-praia').textContent = mundo === 'praia' ? '1/2 · Cabo Baixo' : mundo === 'praia-enseadinha' ? '2/2 · Enseadinha' : '';
  if (direto) {
    const concluidas = entradasDo(mundo).filter(e => !e.destino && !e.opcional && p.concluidas.some(id => id === e.id)).length;
    buscar('#orientacao-praia').textContent = 'Escolha uma fase disponível. As passagens se abrem com o mesmo progresso da campanha.';
    buscar('#progresso-praia').textContent = mundo === 'praia'
      ? `Rota principal: ${concluidas}/4 · Concha Perolada: ${p.concluidas.includes('ilhota-perolada') ? 'encontrada' : 'não encontrada'}.`
      : `Travessias concluídas: ${concluidas}/${totalDeFasesRegulares(mundo)}.`;
    renderizarSeletor(document, seletor, p, ativarMarco);
    return;
  }
  buscar('#mapa-praia').setAttribute('aria-label', 'Mapa caminhável: Arquipélago');
  buscar('#orientacao-praia').textContent = 'Visite Recifes Expostos e Mangue dos Siris Duplos em qualquer ordem. A Enseada abre depois dos dois; a rota original libera as Ilhas à Deriva. Depois da Corrente cruzada, siga para as Grutas da Espuma e, após o revezamento, para a Baía da Ressaca.';
  buscar('#progresso-praia').textContent = `Recifes: ${p.concluidas.includes('recife-retorno') ? 'concluídos' : 'a visitar'} · Mangue: ${p.concluidas.includes('mangue-reuniao') ? 'concluído' : 'a visitar'}.`;
  buscar('#posicao-praia').textContent = entrada ? `${entrada.nome}.` : 'Bifurcação das ilhas.';
  const entrar = buscar<HTMLButtonElement>('#entrar-fase');
  entrar.disabled = !entrada?.destino || quadroMapa !== undefined;
  entrar.textContent = 'Visitar região';
  const rotas: string[] = [];
  const simbolos = { cima: '↑', baixo: '↓', esquerda: '←', direita: '→' };
  for (const botao of controlesDoMapa) {
    const direcao = botao.dataset.mapaDirecao as Direcao;
    const saida = saidaEm(p, direcao);
    const nome = saida && entradaEm(saida.destino, mundo)?.nome;
    const dica = !saida ? 'sem trilha' : !rotaLivre(p, saida.t) ? saida.t.motivo : nome ?? 'para a bifurcação';
    botao.setAttribute('aria-label', `${direcao}: ${dica}`);
    botao.setAttribute('title', dica);
    if (saida) rotas.push(`${simbolos[direcao]} ${nome ?? 'Bifurcação ou cais'}${rotaLivre(p, saida.t) ? '' : ' (bloqueada)'}`);
  }
  buscar('#saidas-praia').textContent = rotas.join(' · ');
  desenharPraia(mapaPraia.ctx, p, logo, undefined, arteArquipelago);
}

logo.addEventListener('load', () => {
  if (tela === 'praia' && quadroMapa === undefined && mundoAtual(save.progresso) === 'arquipelago') atualizarPraia();
  if (tela === 'fase') desenhar(tabuleiro.ctx, fase, estado, logo, temaDaFase(), fauna);
});

fauna.addEventListener('load', () => {
  if (tela === 'fase') desenhar(tabuleiro.ctx, fase, estado, logo, temaDaFase(), fauna);
});

arteArquipelago.addEventListener('load', () => {
  if (tela === 'praia' && quadroMapa === undefined && mundoAtual(save.progresso) === 'arquipelago') atualizarPraia();
});

function abrirPraia(mensagem = ''): void {
  trocarTela('praia', false);
  atualizarPraia(mensagem);
  buscar('#titulo-praia').focus();
}

const SIRIS = ['Coral', 'Verde', 'Amarelo'] as const;
const INSIGNIAS = ['círculo', 'quadrado', 'triângulo'] as const;
function descricao(evento: Evento): string {
  switch (evento.tipo) {
    case 'bloqueado': return 'Passo bloqueado. A maré não avançou.';
    case 'gruta-avancou': return evento.etapa === 'K' ? 'Pérola no inventário.'
      : evento.etapa === 'E' ? 'Encaixe A acionado.' : 'Alavanca B acionada.';
    case 'gruta-fora-da-janela': return `A peça exige: ${nomeDaJanelaGruta(evento.janela)}.`;
    case 'gruta-sem-placa': return 'O outro siri precisa estar na placa para acionar a alavanca.';
    case 'gruta-precisa-portador': return 'Quem recolheu a pérola precisa levá-la ao Encaixe A.';
    case 'gruta-fora-da-ordem': return `Ainda não. Próxima etapa: ${nomeDaEtapaGruta(evento.proxima)}.`;
    case 'balsa': return 'A balsa levou o siri ao outro cais.';
    case 'virada': return evento.alta ? 'A maré subiu.' : 'A maré baixou.';
    case 'levada': if (evento.motivos.includes('farol')) return 'A ponte de luz apagou sob um siri!';
      if (fase.ameaca?.rasante && evento.motivos.includes('garca')) return 'A garça alcançou um siri no rasante!';
      if (evento.motivos.includes('ressaca')) return 'A faixa da ressaca te alcançou!';
      return evento.motivos.length > 1 ? 'A onda e a garça te alcançaram!'
      : evento.motivos.includes('mare') ? 'A maré te levou!' : 'A garça te alcançou!';
    case 'orcamento-esgotado': return 'Os passos acabaram. Reinicie e tente outra rota.';
    case 'abrigo-visitado': return 'Refúgio marcado na maré alta.';
    case 'faltam-abrigos': return 'Visite os dois refúgios marcados na maré alta antes de sair.';
    case 'recife-mudou-rota': return 'A comporta norte fechou. Volte pela passagem sul na baixa.';
    case 'fragmento': if (fase.orcamentoMoedas) return 'Moeda recolhida.'; return totalFragmentos(fase) > 1 ? 'Fragmento recolhido.' : 'Fragmento recolhido. Volte à saída.';
    case 'falta-fragmento': if (fase.orcamentoMoedas) return 'Encontre as três moedas antes de sair.'; return totalFragmentos(fase) > 1
      ? 'Para sair, encontre todos os fragmentos.' : 'Para sair, encontre o fragmento na ilhota.';
    case 'ancorou': return 'Ancoradouro firme!';
    case 'aguarde-desembarque': return 'Para firmar este ancoradouro, desembarque nele quando faltar um passo para a virada.';
    case 'ancora-na-alta': return 'Volte a este ancoradouro na maré baixa.';
    case 'lente-acesa': return 'Lente acesa!';
    case 'lente-fora-do-feixe': return 'A lente só acende se você chegar enquanto o feixe estiver voltado para ela.';
    case 'lente-sem-placa': return 'Outro siri precisa ocupar a placa indicada para esta lente.';
    case 'faltam-lentes': return 'Acenda todas as lentes antes de sair.';
    case 'faltam-ondas': return 'Sobreviva ao ciclo inteiro antes de reunir a dupla nos destinos.';
    case 'faltam-ancoradouros': return fase.atracacaoNaVirada
      ? 'Firme os dois ancoradouros antes de sair.' : 'Firme os três ancoradouros para usar a saída.';
    case 'faltam-siris': return 'Coloque um siri em cada um dos três destinos.';
    case 'falta-parceiro': return 'O outro siri ainda não está no destino.'; 
    case 'troca': return `Siri ativo: ${SIRIS[siriAtivo(estado)]}. A maré não avançou.`;
    case 'vitoria': return 'Fase concluída!';
  }
}

function atualizarFase(eventos: readonly Evento[] = [], mensagem = ''): void {
  const alta = mareAlta(estado.passos);
  const faltam = passosAteVirada(estado.passos);
  const movimentos = faltam === 1 ? '1 passo' : `${faltam} passos`;
  const finalizada = estado.situacao !== 'jogando';
  const fragmento = buscar('#fragmento');
  buscar('#mare').textContent = alta ? 'Alta' : 'Baixa';
  buscar('#passos').textContent = String(estado.passos);
  buscar('#erros').textContent = `${estado.levadas} / ${LIMITE_LEVADAS}`;
  const total = totalFragmentos(fase);
  const limite = buscar('#orcamento');
  limite.hidden = fase.orcamentoMoedas === undefined;
  limite.textContent = fase.orcamentoMoedas === undefined ? '' : `Passos restantes: ${fase.orcamentoMoedas - estado.passos}`;
  fragmento.hidden = !total;
  fragmento.textContent = fase.orcamentoMoedas ? `Moedas: ${estado.fragmentos.length}/3` : total > 1 ? `Fragmentos: ${estado.fragmentos.length}/${total}`
    : estado.temFragmento ? 'Fragmento no inventário' : 'Fragmento ainda na ilha';
  if (fase.etapasGruta) {
    fragmento.hidden = false;
    const etapa = estado.etapaGruta ?? 0;
    const proxima = fase.etapasGruta[etapa];
    const coleta = total ? ` · ${fragmento.textContent}` : '';
    const levando = etapa === 1 && fase.etapasGruta[0] === 'K';
    const inventario = estado.portadorGruta === 'terceiro' ? 'Pérola com o siri amarelo · '
      : estado.portadorGruta === 'parceiro' ? 'Pérola com o siri verde · '
      : estado.portadorGruta === 'principal' ? 'Pérola com o siri coral · '
      : levando ? 'Pérola no inventário · ' : '';
    const condicao = fase.condicoesGruta?.find(item => item.etapa === proxima);
    const placa = condicao?.placa;
    const janela = condicao ? ` · ${nomeDaJanelaGruta(condicao.janela)} (${
      janelaGrutaAtiva(condicao.janela, estado.passos + 1) ? 'abre no próximo passo' : 'fechada no próximo passo'})` : '';
    const apoio = placa ? ` · Placa ${posicoesDosSiris(estado).some(pos => mesmaCasa(pos, placa)) ? 'ocupada' : 'livre'}` : '';
    fragmento.textContent = proxima
      ? `${inventario}Próxima etapa: ${nomeDaEtapaGruta(proxima)}${janela}${apoio}${coleta}`
      : `Portão aberto${coleta}`;
  }
  const ancoradouros = buscar('#ancoradouros');
  const firmes = estado.ancoradouros;
  ancoradouros.hidden = !firmes;
  ancoradouros.textContent = firmes ? `Ancoradouros firmes: ${firmes.length}/${totalAncoradouros(fase)}` : '';
  if (firmes) {
    buscar('#grade').textContent = fase.mapa.map((fileira, linha) => [...fileira].map((casa, coluna) =>
      casa === 'N' && firmes.some(p => mesmaCasa(p, { linha, coluna })) ? 'n' : casa).join('')).join('\n');
  }
  const ondas = buscar('#ondas-seguras');
  ondas.hidden = estado.ondasSeguras === undefined;
  ondas.textContent = ondas.hidden ? '' : `Ondas seguras seguidas: ${estado.ondasSeguras}/${fase.ressaca?.faixas.length}`;
  const lentes = buscar('#lentes-farol');
  lentes.hidden = !estado.lentesAcesas;
  lentes.textContent = estado.lentesAcesas ? `Lentes acesas: ${estado.lentesAcesas.length}/${fase.farol?.orientacoes.length}` : '';
  const recife = fase.recife;
  const progressoRecife = buscar('#progresso-recife');
  progressoRecife.hidden = !recife;
  progressoRecife.textContent = !recife ? ''
    : 'abrigos' in recife
      ? `Refúgios visitados na alta: ${estado.abrigosVisitados?.length ?? 0}/${recife.abrigos.length}.`
      : estado.temFragmento ? 'Volta aberta ao sul na maré baixa.' : 'Ida aberta ao norte na maré baixa.';
  if (recife) {
    buscar('#grade').textContent = fase.mapa.map((fileira, linha) => [...fileira].map((casa, coluna) => {
      const pos = { coluna, linha };
      if ('abrigos' in recife && recife.abrigos.some(abrigo => mesmaCasa(abrigo, pos))) {
        return estado.abrigosVisitados?.some(abrigo => mesmaCasa(abrigo, pos)) ? 'h' : 'R';
      }
      if ('ida' in recife && (mesmaCasa(recife.ida, pos) || mesmaCasa(recife.volta, pos))) {
        return passagemDoRecifeFechada(fase, pos, estado.temFragmento) ? 'X' : 'Q';
      }
      return casa;
    }).join('')).join('\n');
  }
  buscar('#legenda-recife').hidden = !recife;
  const duplaAtiva = buscar('#dupla-ativa');
  duplaAtiva.hidden = !estado.dupla;
  const ativo = siriAtivo(estado);
  duplaAtiva.textContent = `Siri ativo: ${SIRIS[ativo]}, ${INSIGNIAS[ativo]} (Espaço ou botão Trocar siri)`;
  buscar('#trocar-siri').hidden = !estado.dupla || finalizada;
  const coordenadas = (p: { coluna: number; linha: number }) => `coluna ${p.coluna + 1}, linha ${p.linha + 1}`;
  const rasante = casasDoRasante(fase, estado.passos + 1);
  const alvo = rasante[0];
  const mostrarGarca = Boolean(fase.ameaca && !finalizada);
  buscar('#garca-patrulha').hidden = !mostrarGarca || Boolean(alvo);
  buscar('#garca-rasante').hidden = !mostrarGarca || !alvo;
  const sinalGarca = !alvo ? (mostrarGarca ? ' Garça em patrulha.' : '') : fase.ameaca?.rasante
    ? ` Rasante no próximo passo: ${rasante.map(coordenadas).join('; ')}. Pedra alta protege.`
    : ` Garça no próximo passo: ${coordenadas(alvo)}.`;
  const cais = balsasNoTurno(fase, estado.passos);
  const destinos = balsasNoTurno(fase, estado.passos + faltam);
  const previsoes = cais.map((atual, i) => `Balsa ${i + 1}: ${coordenadas(atual)} → ${coordenadas(destinos[i])}`);
  const sinalBalsa = previsoes.length ? ` Na virada: ${previsoes.join('; ')}.` : '';
  const ateSubir = faltam + (alta ? PASSOS_POR_MARE : 0);
  const faixa = faixaRessacaNoTurno(fase, estado.passos + ateSubir);
  const sinalRessaca = faixa ? ` Onda na subida: linha ${faixa.linha + 1}, colunas ${faixa.primeiraColuna + 1} a ${faixa.ultimaColuna + 1}. Pedra alta protege.` : '';
  const atualFarol = feixeNoTurno(fase, estado.passos);
  const passosDoFeixe = passosAteTrocaFeixe(fase, estado.passos);
  const proximoFarol = feixeNoTurno(fase, estado.passos + passosDoFeixe);
  const descreverFeixe = (feixe: OrientacaoFarol, agora = false) => {
    const placa = feixe.placa;
    const ocupada = placa && posicoesDosSiris(estado).some(pos => mesmaCasa(pos, placa));
    const comando = placa ? ` Placa em ${coordenadas(placa)}${agora ? (ocupada ? ' (ocupada)' : ' (livre)') : ''}.` : '';
    return `${feixe.nome}; lente em ${coordenadas(feixe.lente)}; pontes em ${feixe.plataformas.map(coordenadas).join('; ')}.${comando}`;
  };
  const sinalFarol = atualFarol && proximoFarol
    ? ` Feixe atual: ${descreverFeixe(atualFarol, true)} Em ${passosDoFeixe} ${passosDoFeixe === 1 ? 'passo' : 'passos'}: ` +
      descreverFeixe(proximoFarol) : '';
  const vinculos = fase.portoesVinculados?.map(({ portao, placa }, indice) => {
    const aberto = posicoesDosSiris(estado).some(pos => mesmaCasa(pos, placa));
    const deriva = fase.id === 'deriva-chefe-passagem-das-balsas';
    const nome = deriva ? 'Portão' : 'Raiz';
    const situacao = deriva ? (aberto ? 'aberto' : 'fechado') : (aberto ? 'aberta' : 'fechada');
    return `${nome} ${indice + 1} (${situacao}): placa em ${coordenadas(placa)}; portão em ${coordenadas(portao)}.`;
  });
  const sinalPortoes = vinculos ? ` ${vinculos.join(' ')}` : '';
  buscar('#previsao').textContent = finalizada ? 'Tentativa encerrada.'
    : `Em ${movimentos} a maré ${alta ? 'desce' : 'sobe'}.${sinalGarca}${sinalBalsa}${sinalRessaca}${sinalFarol}${sinalPortoes}`;
  buscar('#posicao').textContent = estado.dupla
    ? posicoesDosSiris(estado).map((pos, i) => `${SIRIS[i]}${i === ativo ? ' (ativo)' : ''}: ${coordenadas(pos)}.`).join(' ')
    : `Siri na ${coordenadas(estado.posicao)}.`;

  const mensagens = eventos.map(descricao);
  if (eventos.some(evento => evento.tipo === 'levada')) {
    mensagens.push(estado.levadas >= LIMITE_LEVADAS ? 'Três erros: tente de novo.' : 'De volta à última casa firme.');
  }
  if (estado.situacao === 'vitoria') {
    if (fase.id === CAPITULO_FINAL) mensagens.push('A luz do farol voltou. Veja o desfecho ou volte ao mapa.');
    if (fase.ameaca?.rasante) mensagens.push(`Arena concluída: ${fase.nome}. Volte à Enseada.`);
    const arenaLocal = fase.id.startsWith('deriva-chefe-') || fase.id.startsWith('grutas-chefe-');
    if (fase.recife || arenaLocal) mensagens.push(`Arena vencida: ${fase.nome}. Volte ao mapa.`);
    if (fase.farol?.orientacoes.some(o => o.placa)) mensagens.push(`Arena vencida: ${fase.nome}. Volte ao mapa.`);
    else if (fase.farol) mensagens.push('Guardião do Farol vencido. Volte ao mapa.');
    if (fase.ressaca?.objetivo === 'sobreviver') mensagens.push('Ressaca Alta vencida. Volte à Baía.');
    else if (fase.ressaca?.objetivo === 'atravessar') mensagens.push(`${fase.nome} vencido. Volte ao mapa.`);
    else if (fase.ressaca) mensagens.push(`${fase.nome} vencido. Volte à Baía.`);
    if (bancada && indice < FASES_BANCADA.length - 1) mensagens.push('Você já pode selecionar a próxima fase.');
    if (desafioAvulso) mensagens.push('Você pode gerar a próxima travessia ou mudar os filtros.');
    if (modoCampanha() && fase.id === 'ilhota-perolada') mensagens.push('Concha Perolada encontrada. Atalho de volta aberto!');
    else if (modoCampanha() && !fase.ressaca && !fase.farol && !fase.ameaca?.rasante && !fase.recife && !arenaLocal && fase.id !== 'ponta-da-garca' && fase.id !== CAPITULO_FINAL) mensagens.push('Volte à praia para continuar.');
  }
  buscar('#feedback').textContent = mensagem || mensagens.join(' ');
  const seguir = buscar('#seguir-fase');
  seguir.hidden = !modoCampanha() || estado.situacao !== 'vitoria'
    || (fase.id !== 'ponta-da-garca' && fase.id !== CAPITULO_FINAL);
  seguir.textContent = fase.id === CAPITULO_FINAL ? 'Ver desfecho' : 'Concluir viagem';
  buscar('#nova-mare-a-mao').hidden = !desafioAvulso || estado.situacao === 'jogando';
  desenhar(tabuleiro.ctx, fase, estado, logo, temaDaFase(), fauna);
  audio.eventos(eventos);
}

function selecionarFase(novoIndice: number, mensagem?: string, focar = true): void {
  indice = novoIndice;
  fase = (bancada ? FASES_BANCADA : TODAS_AS_FASES)[indice];
  prepararFase(mensagem, focar);
}

function prepararFase(mensagem?: string, focar = true): void {
  estado = iniciar(fase);
  buscar('#nome-fase').textContent = fase.nome;
  buscar('#objetivo').textContent = fase.objetivo;
  const sinalConcha = buscar('#sinal-concha');
  sinalConcha.hidden = !fase.mapa.some(linha => linha.includes('C'));
  buscar('#ensino').textContent = fase.ensino;
  buscar('#lembrete-fase').textContent = fase.ensino;
  buscar('#lembrete-fase').hidden = bancada;
  buscar('#grade').textContent = fase.mapa.join('\n');
  buscar<HTMLDetailsElement>('#ajuda').open = false;
  buscar('#voltar-fase').textContent = desafioAvulso ? 'Editar filtros' : bancada ? 'Tela inicial' : mundoAtual(save.progresso) === 'praia' ? 'Voltar à praia' : 'Voltar ao mapa';
  niveis.forEach((botao, i) => botao.setAttribute('aria-pressed', String(indice === i)));
  trocarTela('fase', focar);
  atualizarFase([], mensagem ?? 'Fase selecionada. Maré baixa.');
}

function lerOpcoesMare(): OpcoesMareAMao | undefined {
  const mundo = MUNDOS_MARE_A_MAO.find(item => item === controlesMare.mundo.value);
  const dificuldade = DIFICULDADES_MARE_A_MAO.find(item => item === controlesMare.dificuldade.value);
  const siris = Number(controlesMare.siris.value);
  if (!mundo || !dificuldade || (siris !== 1 && siris !== 2 && siris !== 3)) return;
  return { mundo, dificuldade, siris, garca: controlesMare.garca.checked, fragmento: controlesMare.fragmento.checked };
}

function mostrarOpcoesMare(opcoes: OpcoesMareAMao): void {
  controlesMare.mundo.value = opcoes.mundo;
  controlesMare.dificuldade.value = String(opcoes.dificuldade);
  controlesMare.siris.value = String(opcoes.siris);
  controlesMare.garca.checked = opcoes.garca;
  controlesMare.fragmento.checked = opcoes.fragmento;
}

function jogarMareAMao(opcoes: OpcoesMareAMao, semente?: string): void {
  const novaSemente = semente ?? `${Date.now().toString(36)}-${(++proximaSemente).toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const gerada = gerarMareAMao(opcoes, novaSemente);
  if (!gerada) {
    abrirMareAMao('Não foi possível montar uma travessia com esses filtros. Tente de novo ou ajuste a seleção.');
    return;
  }
  const entrada = { opcoes, semente: novaSemente };
  desafioAvulso = entrada;
  fase = gerada;
  bancada = false;
  historicoMare = incluirNoHistorico(historicoMare, entrada);
  const persistiu = salvarHistoricoMare(storage, historicoMare);
  prepararFase(persistiu ? 'Travessia pronta. Maré baixa.' : 'Travessia pronta. O histórico não será salvo ao fechar.');
}

function abrirMareAMao(aviso = ''): void {
  const lista = buscar('#mare-historico-itens');
  lista.replaceChildren();
  buscar('#mare-historico-vazio').hidden = historicoMare.length > 0;
  for (const { opcoes, semente } of historicoMare) {
    const item = document.createElement('li');
    const repetir = document.createElement('button');
    repetir.type = 'button';
    const quantidade = opcoes.siris === 1 ? '1 siri' : `${opcoes.siris} siris`;
    const pistas = [opcoes.garca ? 'garça' : '', opcoes.fragmento ? 'fragmento' : ''].filter(Boolean);
    repetir.textContent = [nomeDo(opcoes.mundo), opcoes.dificuldade, quantidade, ...pistas, semente].join(' · ');
    repetir.addEventListener('click', () => {
      mostrarOpcoesMare(opcoes);
      jogarMareAMao(opcoes, semente);
    });
    item.append(repetir);
    lista.append(item);
  }
  buscar('#aviso-mare-a-mao').textContent = aviso;
  trocarTela('mare-a-mao');
}

function ativarMarco(id: string): void {
  if (tela !== 'praia' || quadroMapa !== undefined) return;
  const selecao = selecionarMarco(save.progresso, id);
  if (!selecao) return;
  const { opcao, progresso } = selecao;
  if (opcao.destino) {
    const proximo = viajar(progresso, opcao.destino);
    if (proximo === progresso) return;
    save = { ...save, progresso: proximo };
    gravar();
    abrirPraia();
    return;
  }
  const novoIndice = TODAS_AS_FASES.findIndex(item => item.id === opcao.fase);
  if (novoIndice < 0) return;
  save = { ...save, progresso };
  gravar();
  bancada = false;
  selecionarFase(novoIndice);
}

function entrarFase(): void {
  if (tela !== 'praia' || quadroMapa !== undefined) return;
  const p = save.progresso;
  if (mundoAtual(p) !== 'arquipelago') return;
  const destino = entradaEm(p.posicao, 'arquipelago')?.destino;
  if (!destino) return;
  const proximo = viajar(p, destino);
  if (proximo === p) return;
  save = { ...save, progresso: proximo };
  gravar();
  abrirPraia();
}

function mover(direcao: Direcao): void {
  if (tela === 'praia') {
    if (quadroMapa !== undefined || mundoAtual(save.progresso) !== 'arquipelago') return;
    const proximo = moverNoMapa(save.progresso, direcao);
    if (!proximo.caminho) { atualizarPraia(proximo.mensagem); return; }
    const concluir = () => {
      quadroMapa = undefined;
      save = { ...save, progresso: proximo.progresso };
      gravar();
      atualizarPraia(proximo.mensagem);
    };
    // Com movimento reduzido, o mesmo nó é confirmado sem animação.
    if (!window.requestAnimationFrame || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      concluir();
      return;
    }
    const percurso = prepararTravessia(proximo.caminho);
    let inicio: number | undefined;
    const animar = (agora: number) => {
      inicio ??= agora;
      const fracao = (agora - inicio) / percurso.duracao;
      if (fracao >= 1) { concluir(); return; }
      const ponto = percurso.ponto(fracao);
      desenharPraia(mapaPraia.ctx, save.progresso, logo, ponto, arteArquipelago);
      quadroMapa = window.requestAnimationFrame(animar);
    };
    quadroMapa = window.requestAnimationFrame(animar);
    atualizarPraia('Percorrendo a trilha…');
    return;
  }
  jogarAcao(direcao);
}

function jogarAcao(acao: Acao): void {
  if (tela !== 'fase' || estado.situacao !== 'jogando') return;
  const transicao = executarPasso(fase, estado, acao);
  estado = transicao.estado;
  if (modoCampanha() && estado.situacao === 'vitoria' && ehIdFase(fase.id)) {
    save = { ...save, progresso: concluirFase(save.progresso, fase.id) };
    gravar();
  }
  atualizarFase(transicao.eventos);
}

const reiniciar = () => {
  // Devolva o foco ao título para Espaço voltar a trocar o siri, não reativar o botão.
  if (tela === 'fase') prepararFase('Fase reiniciada. Maré baixa.');
};
const voltar = () => {
  if (tela === 'fase' && desafioAvulso) {
    abrirMareAMao();
    return;
  }
  if ((tela === 'fase' && !bancada) || (tela === 'creditos' && contextoCreditos !== 'inicio')) abrirPraia();
  else if (tela !== 'inicio') trocarTela('inicio');
};

function abrirCreditos(contexto: ContextoCreditos): void {
  contextoCreditos = contexto;
  buscar('#titulo-creditos').textContent = contexto === 'final' ? 'Desfecho e créditos' : 'Créditos';
  buscar('#desfecho').textContent = TEXTOS_CREDITOS[contexto];
  buscar('#voltar-creditos').textContent = contexto === 'inicio' ? 'Voltar à tela inicial' : 'Voltar ao mapa';
  trocarTela('creditos');
}

buscar('#comecar').addEventListener('click', () => {
  desafioAvulso = undefined;
  save = { ...save, progresso: { ...save.progresso, viuTutorial: true } };
  gravar();
  abrirPraia();
});
buscar('#bancada').addEventListener('click', () => { desafioAvulso = undefined; bancada = true; selecionarFase(0); });
buscar('#abrir-mare-a-mao').addEventListener('click', () => abrirMareAMao());
buscar('#voltar-mare-a-mao').addEventListener('click', voltar);
buscar('#configurar-mare-a-mao').addEventListener('submit', evento => {
  evento.preventDefault();
  const opcoes = lerOpcoesMare();
  if (opcoes) jogarMareAMao(opcoes);
});
buscar('#nova-mare-a-mao').addEventListener('click', () => {
  if (tela === 'fase' && desafioAvulso && estado.situacao !== 'jogando') jogarMareAMao(desafioAvulso.opcoes);
});
buscar('#creditos-inicio').addEventListener('click', () => abrirCreditos('inicio'));
buscar('#seguir-fase').addEventListener('click', () => {
  if (tela !== 'fase' || !modoCampanha() || estado.situacao !== 'vitoria') return;
  if (fase.id === CAPITULO_FINAL) abrirCreditos('final');
  else if (fase.id === 'ponta-da-garca') abrirCreditos('praia');
});
buscar('#rever-desfecho').addEventListener('click', () => {
  if (tela === 'praia' && mundoAtual(save.progresso) === 'farol' && campanhaConcluida(save.progresso)) abrirCreditos('final');
});
buscar('#menu-praia').addEventListener('click', voltar);
buscar('#voltar-fase').addEventListener('click', voltar);
buscar('#voltar-creditos').addEventListener('click', voltar);
buscar('#entrar-fase').addEventListener('click', entrarFase);
buscar('#reiniciar').addEventListener('click', reiniciar);
buscar('#trocar-siri').addEventListener('click', () => jogarAcao('trocar'));
niveis.forEach((botao, i) => botao.addEventListener('click', () => selecionarFase(i)));
controlesDaFase.forEach(botao => botao.addEventListener('click', () => mover(botao.dataset.direcao as Direcao)));
controlesDoMapa.forEach(botao => botao.addEventListener('click', () => mover(botao.dataset.mapaDirecao as Direcao)));
for (const canal of ['musica', 'efeitos'] as const) {
  const controle = volumes[canal];
  controle.value = String(Math.round(save.audio[canal] * 100));
  controle.addEventListener('input', () => {
    save = { ...save, audio: { ...save.audio, [canal]: Number(controle.value) / 100 } };
    audio.volumes(save.audio);
  });
  controle.addEventListener('change', gravar);
}

conectarTeclado(window, mover, reiniciar, entrarFase, voltar, () => tela === 'fase' || (tela === 'praia' && mundoAtual(save.progresso) === 'arquipelago'), () => jogarAcao('trocar'));
// No toque a ativação acontece no fim do gesto. Clique também cobre o
// acionamento por tecnologia assistiva, sem depender de mouse ou gesto anterior.
window.addEventListener('pointerdown', evento => {
  if (evento.isTrusted && evento.pointerType === 'mouse' && evento.button === 0) void audio.habilitar();
});
window.addEventListener('pointerup', evento => {
  if (evento.isTrusted && evento.pointerType !== 'mouse' && evento.isPrimary && evento.button === 0) void audio.habilitar();
});
window.addEventListener('click', evento => {
  if (evento.isTrusted) void audio.habilitar();
}, true);
window.addEventListener('keydown', evento => {
  if (evento.isTrusted && !evento.repeat
    && !['', 'Shift', 'Control', 'Meta', 'Alt', 'CapsLock', 'Tab', 'Escape'].includes(evento.key)) void audio.habilitar();
}, true);
document.addEventListener('visibilitychange', atualizarAmbiente);
trocarTela('inicio', false);
