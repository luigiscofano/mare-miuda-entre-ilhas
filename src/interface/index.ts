import { balsasNoTurno, casasDoRasante, executarPasso, faixaRessacaNoTurno, feixeNoTurno, iniciar, janelaGrutaAtiva, LIMITE_LEVADAS, mareAlta, nomeDaEtapaGruta, nomeDaJanelaGruta, passagemDoRecifeFechada, PASSOS_POR_MARE, passosAteTrocaFeixe, passosAteVirada, mesmaCasa, posicoesDosSiris, siriAtivo, totalAncoradouros, totalFragmentos } from '../motor/index.ts';
import { mapaComFundoInterno } from '../render/seletores-praia.ts';
import type { Acao, Direcao, Evento, OrientacaoFarol } from '../motor/index.ts';
import { FASES_BANCADA, TODAS_AS_FASES } from '../fases/index.ts';
import { ALTURA, DENSIDADE, desenhar, desenharCabo, desenharPraia, LARGURA, podeDesenharCabo } from '../render/index.ts';
import { conectarTeclado } from '../entrada/index.ts';
import { abriuEnseada, campanhaConcluida, CAPITULO_FINAL, concluirFase, entradaEm, ehIdFase, faseOpcional, moverNoMapa, mundoAtual, nomeDo, podeSairDaPraia, rotaLivre, saidaEm, totalDeFasesRegulares, viajar } from '../campanha/index.ts';
import { caminhoDoCabo } from '../campanha/cabo-baixo.ts';
import { prepararTravessia } from '../campanha/travessia.ts';
import { carregar, salvar } from '../persistencia/index.ts';
import { criarAudio } from '../audio/index.ts';

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
const fundosDosSeletores = {
  'praia-enseadinha': buscar<HTMLImageElement>('#enseadinha'),
  recifes: buscar<HTMLImageElement>('#mapa-recifes'),
  mangue: buscar<HTMLImageElement>('#mapa-mangue'),
  enseada: buscar<HTMLImageElement>('#mapa-enseada'),
  deriva: buscar<HTMLImageElement>('#mapa-deriva'),
  grutas: buscar<HTMLImageElement>('#mapa-grutas'),
  ressaca: buscar<HTMLImageElement>('#mapa-ressaca'),
  farol: buscar<HTMLImageElement>('#mapa-farol'),
};
function fundoDoSeletor(mundo: ReturnType<typeof mundoAtual>) {
  if (mapaComFundoInterno(mundo)) return fundosDosSeletores[mundo];
}
const arteCabo = buscar<HTMLImageElement>('#cabo-baixo');
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

type Tela = 'inicio' | 'praia' | 'fase' | 'creditos';
const paineis: Record<Tela, HTMLElement> = {
  inicio: buscar('#inicio'), praia: buscar('#praia'), fase: buscar('#fase'), creditos: buscar('#creditos'),
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
let indice = 0;
let fase = FASES_BANCADA[0];
let estado = iniciar(fase);

function gravar() {
  buscar('#aviso-save').hidden = salvar(storage, save);
}

function atualizarAmbiente() {
  const mundo = tela === 'fase' && bancada ? 'praia' : mundoAtual(save.progresso);
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
  if (destino === 'praia') mapaPraia.escala();
  if (focar) paineis[destino].querySelector('h2')?.focus();
}

function atualizarPraia(mensagem = ''): void {
  const p = save.progresso;
  const mundo = mundoAtual(p);
  buscar('#rever-desfecho').hidden = mundo !== 'farol' || !campanhaConcluida(p);
  const entrada = entradaEm(p.posicao, mundo);
  const concluidas = p.concluidas.filter(id =>
    mundo === 'praia-enseadinha' ? ['praia-fio-de-areia', 'praia-pocas-espelho', 'praia-mirante'].includes(id)
    : (mundo === 'enseada' || mundo === 'deriva') ? id.startsWith(mundo + '-') && !faseOpcional(mundo, id)
    : (mundo === 'grutas' || mundo === 'ressaca' || mundo === 'farol') ? id.startsWith(mundo + '-') && !faseOpcional(mundo, id)
    : mundo === 'recifes' ? id.startsWith('recife-') && !faseOpcional(mundo, id) : mundo === 'mangue' ? id.startsWith('mangue-') && !faseOpcional(mundo, id)
    : ['primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca'].includes(id)).length;
  const perola = p.concluidas.includes('ilhota-perolada');
  const tituloMapa = nomeDo(mundo);
  buscar('#titulo-praia').textContent = tituloMapa;
  buscar('#mapa-praia').setAttribute('aria-label', 'Mapa caminhável: ' + tituloMapa);
  buscar('#orientacao-praia').textContent = mundo === 'praia'
    ? (concluidas ? 'As passagens se abrem à medida que você resolve as travessias. Depois da Ponta da garça, siga à direita para a Enseadinha.'
      : 'Faça o primeiro passo para a direita, pare no marco e entre na Primeira onda.')
    : mundo === 'praia-enseadinha' ? 'Atravesse o braço de areia. Suba em Fio de areia para visitar as arenas opcionais ou volte ao Cabo Baixo pelo começo da trilha.'
    : mundo === 'arquipelago' ? 'Visite Recifes Expostos e Mangue dos Siris Duplos em qualquer ordem. A Enseada abre depois dos dois; a rota original libera as Ilhas à Deriva. Depois da Corrente cruzada, siga para as Grutas da Espuma e, após o revezamento, para a Baía da Ressaca.'
    : mundo === 'recifes' ? 'A trilha do cais leva à Enseada. Explore as travessias ao norte ou siga à direita após A volta do recife para enfrentar os chefes.'
    : mundo === 'mangue' ? 'O caminho em frente é a rota para a Enseada. Depois de Raízes vizinhas, suba para o ramo dos siris. À direita de Reencontro na ponta do mangue estão as arenas opcionais.'
    : mundo === 'enseada' ? 'A rota do cais leva às Ilhas à Deriva. Suba depois de Sombra na restinga para explorar o ramo; os dois desvios em dupla continuam no último marco da rota original.'
    : mundo === 'deriva' ? 'A rota do cais leva às Grutas. Suba em A primeira balsa para o ramo norte. Em Corrente cruzada, suba para os desvios em dupla ou vá à direita para os chefes.'
    : mundo === 'grutas' ? 'A rota do cais leva à Baía da Ressaca. Suba depois de Uma pérola para o portão para explorar as câmaras ao norte. Vá à direita depois de Revezamento nas câmaras para as arenas opcionais.'
      : mundo === 'ressaca' ? 'A rota do cais leva ao Farol. Suba depois de Abrigo dos dois cais para explorar o ramo norte. Desça depois de Cais em paralelo para o trio. Depois do Cofre da vazante, siga à esquerda para Vento Sul.'
      : mundo === 'farol'
        ? 'Explore a costa norte ou siga pela rota dos guardiões. Depois de A luz das duas marés, vá à esquerda para o trio ou desça para o Guardião. Vencê-lo abre a Última Virada.'
        : 'Complete as três travessias. O atalho sul só se abre depois da última.';
  buscar('#progresso-praia').textContent = mundo === 'praia'
    ? `Rota principal: ${concluidas}/4 · Concha Perolada: ${perola ? 'encontrada' : 'não encontrada'}.`
    : mundo === 'praia-enseadinha' ? `Rota da Enseadinha: ${concluidas}/3. Os três desvios não bloqueiam a saída.`
    : mundo === 'arquipelago'
      ? `Recifes: ${p.concluidas.includes('recife-retorno') ? 'concluídos' : 'a visitar'} · Mangue: ${p.concluidas.includes('mangue-reuniao') ? 'concluído' : 'a visitar'}.`
      : `Travessias concluídas: ${concluidas}/${totalDeFasesRegulares(mundo)}.`;
  buscar('#enseada-aberta').hidden = mundo !== 'arquipelago' || !abriuEnseada(p);
  buscar('#posicao-praia').textContent = entrada
    ? `${entrada.nome}${entrada.chefe ? ' · chefe opcional' : entrada.opcional ? ' · opcional' : ''}${p.concluidas.some(id => id === entrada.id) ? ' · concluída' : ''}.`
    : mundo === 'arquipelago' ? 'Bifurcação das ilhas.' : 'Cais da Praia das Conchas.';
  buscar('#mensagem-praia').textContent = mensagem;
  const entrar = buscar<HTMLButtonElement>('#entrar-fase');
  buscar('#viagem-praia').textContent = mundo === 'praia' ? '1/2 · Cabo Baixo' : mundo === 'praia-enseadinha' ? '2/2 · Enseadinha' : '';
  entrar.disabled = !entrada || quadroMapa !== undefined;
  paineis.praia.setAttribute('aria-busy', String(quadroMapa !== undefined));
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
  if (podeSairDaPraia(p)) entrar.textContent = 'Seguir para o arquipélago';
  else if (entrada?.id === 'porto') entrar.textContent = 'Voltar ao arquipélago';
  else if (entrada?.destino) entrar.textContent = entrada.id.startsWith('rumo-') ? 'Visitar região' : entrada.nome;
  else entrar.textContent = 'Entrar na fase';
  if (podeDesenharCabo(mundo, arteCabo)) desenharCabo(mapaPraia.ctx, p, arteCabo, logo);
  else desenharPraia(mapaPraia.ctx, p, logo, undefined, arteArquipelago, fundoDoSeletor(mundo));
}

logo.addEventListener('load', () => {
  if (tela === 'praia' && quadroMapa === undefined) atualizarPraia();
  if (tela === 'fase') desenhar(tabuleiro.ctx, fase, estado, logo, bancada ? false : mundoAtual(save.progresso), fauna);
});

fauna.addEventListener('load', () => {
  if (tela === 'fase') desenhar(tabuleiro.ctx, fase, estado, logo, bancada ? false : mundoAtual(save.progresso), fauna);
});

arteCabo.addEventListener('load', () => {
  if (tela === 'praia' && quadroMapa === undefined && mundoAtual(save.progresso) === 'praia') atualizarPraia();
});

for (const [mundo, arte] of Object.entries(fundosDosSeletores)) {
  arte.addEventListener('load', () => {
    if (tela === 'praia' && quadroMapa === undefined && mundoAtual(save.progresso) === mundo) atualizarPraia();
  });
}

arteArquipelago.addEventListener('load', () => {
  if (tela === 'praia' && quadroMapa === undefined && mundoAtual(save.progresso) === 'arquipelago') atualizarPraia();
});

function abrirPraia(mensagem = ''): void {
  trocarTela('praia');
  atualizarPraia(mensagem);
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
    if (!bancada && fase.id === 'ilhota-perolada') mensagens.push('Concha Perolada encontrada. Atalho de volta aberto!');
    else if (!bancada && !fase.ressaca && !fase.farol && !fase.ameaca?.rasante && !fase.recife && !arenaLocal && fase.id !== 'ponta-da-garca' && fase.id !== CAPITULO_FINAL) mensagens.push('Volte à praia para continuar.');
  }
  buscar('#feedback').textContent = mensagem || mensagens.join(' ');
  const seguir = buscar('#seguir-fase');
  seguir.hidden = bancada || estado.situacao !== 'vitoria'
    || (fase.id !== 'ponta-da-garca' && fase.id !== CAPITULO_FINAL);
  seguir.textContent = fase.id === CAPITULO_FINAL ? 'Ver desfecho' : 'Concluir viagem';
  desenhar(tabuleiro.ctx, fase, estado, logo, bancada ? false : mundoAtual(save.progresso), fauna);
  audio.eventos(eventos);
}

function selecionarFase(novoIndice: number, mensagem?: string, focar = true): void {
  indice = novoIndice;
  fase = (bancada ? FASES_BANCADA : TODAS_AS_FASES)[indice];
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
  buscar('#voltar-fase').textContent = bancada ? 'Tela inicial' : mundoAtual(save.progresso) === 'praia' ? 'Voltar à praia' : 'Voltar ao mapa';
  niveis.forEach((botao, i) => botao.setAttribute('aria-pressed', String(indice === i)));
  trocarTela('fase', focar);
  atualizarFase([], mensagem ?? 'Fase selecionada. Maré baixa.');
}

function entrarFase(): void {
  if (tela !== 'praia' || quadroMapa !== undefined) return;
  const p = save.progresso;
  const entrada = entradaEm(p.posicao, mundoAtual(p));
  if (!entrada) return;
  const destino = podeSairDaPraia(p) ? 'arquipelago' : entrada.destino;
  if (destino) {
    const proximo = viajar(p, destino);
    if (proximo !== p) {
      save = { ...save, progresso: proximo };
      gravar();
      abrirPraia();
    }
    return;
  }
  bancada = false;
  selecionarFase(TODAS_AS_FASES.findIndex(item => item.id === entrada.id));
}

function mover(direcao: Direcao): void {
  if (tela === 'praia') {
    if (quadroMapa !== undefined) return;
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
    const caminhoVisual = podeDesenharCabo(mundoAtual(save.progresso), arteCabo)
      ? caminhoDoCabo(save.progresso.posicao, proximo.progresso.posicao) : undefined;
    const percurso = prepararTravessia(caminhoVisual ?? proximo.caminho);
    let inicio: number | undefined;
    const animar = (agora: number) => {
      inicio ??= agora;
      const fracao = (agora - inicio) / percurso.duracao;
      if (fracao >= 1) { concluir(); return; }
      const ponto = percurso.ponto(fracao);
      if (caminhoVisual) desenharCabo(mapaPraia.ctx, save.progresso, arteCabo, logo, ponto);
      else desenharPraia(mapaPraia.ctx, save.progresso, logo, ponto, arteArquipelago, fundoDoSeletor(mundoAtual(save.progresso)));
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
  if (!bancada && estado.situacao === 'vitoria' && ehIdFase(fase.id)) {
    save = { ...save, progresso: concluirFase(save.progresso, fase.id) };
    gravar();
  }
  atualizarFase(transicao.eventos);
}

const reiniciar = () => {
  // Devolva o foco ao título para Espaço voltar a trocar o siri, não reativar o botão.
  if (tela === 'fase') selecionarFase(indice, 'Fase reiniciada. Maré baixa.');
};
const voltar = () => {
  if ((tela === 'fase' && !bancada) || (tela === 'creditos' && contextoCreditos === 'final')) abrirPraia();
  else if (tela !== 'inicio') trocarTela('inicio');
};

function abrirCreditos(contexto: ContextoCreditos): void {
  contextoCreditos = contexto;
  buscar('#titulo-creditos').textContent = contexto === 'final' ? 'Desfecho e créditos' : 'Créditos';
  buscar('#desfecho').textContent = TEXTOS_CREDITOS[contexto];
  buscar('#voltar-creditos').textContent = contexto === 'final' ? 'Voltar ao mapa' : 'Voltar à tela inicial';
  trocarTela('creditos');
}

buscar('#comecar').addEventListener('click', () => {
  save = { ...save, progresso: { ...save.progresso, viuTutorial: true } };
  gravar();
  abrirPraia();
});
buscar('#bancada').addEventListener('click', () => { bancada = true; selecionarFase(0); });
buscar('#creditos-inicio').addEventListener('click', () => abrirCreditos('inicio'));
buscar('#seguir-fase').addEventListener('click', () => {
  if (tela !== 'fase' || bancada || estado.situacao !== 'vitoria') return;
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

conectarTeclado(window, mover, reiniciar, entrarFase, voltar, () => tela === 'praia' || tela === 'fase', () => jogarAcao('trocar'));
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
