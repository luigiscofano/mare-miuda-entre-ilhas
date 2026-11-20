import { executarPasso, iniciar, LIMITE_LEVADAS, mareAlta, passosAteVirada, totalFragmentos, vaiAtacar } from '../motor/index.ts';
import type { Acao, Direcao, Evento } from '../motor/index.ts';
import { FASES, TODAS_AS_FASES } from '../fases/index.ts';
import { desenhar, desenharPraia, LARGURA } from '../render/index.ts';
import { conectarTeclado } from '../entrada/index.ts';
import { abriuEnseada, concluirFase, entradaEm, ehIdFase, moverNoMapa, mundoAtual, nomeDo, podeSairDaPraia, viajar } from '../campanha/index.ts';
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
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível neste navegador.');
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
let tela: Tela = 'inicio';
let bancada = false;
let indice = 0;
let fase = FASES[0];
let estado = iniciar(fase);

function gravar() {
  buscar('#aviso-save').hidden = salvar(storage, save);
}

function trocarTela(destino: Tela, focar = true): void {
  tela = destino;
  buscar('#jogo').setAttribute('data-tela', destino);
  for (const [nome, painel] of Object.entries(paineis)) painel.hidden = nome !== destino;
  listaTestes.hidden = destino !== 'fase' || !bancada;
  audio.ambiente(!document.hidden && (destino === 'praia' || destino === 'fase'));
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
  const entrada = entradaEm(p.posicao, mundo);
  const concluidas = p.concluidas.filter(id =>
    mundo === 'recifes' ? id.startsWith('recife-') : mundo === 'mangue' ? id.startsWith('mangue-')
    : ['primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca'].includes(id)).length;
  const perola = p.concluidas.includes('ilhota-perolada');
  const tituloMapa = nomeDo(mundo);
  buscar('#titulo-praia').textContent = tituloMapa;
  buscar('#mapa-praia').setAttribute('aria-label', 'Mapa caminhável: ' + tituloMapa);
  buscar('#orientacao-praia').textContent = mundo === 'praia'
    ? (concluidas ? 'As passagens se abrem à medida que você resolve as travessias. A ilhota é opcional.'
      : 'Faça o primeiro passo para a direita, pare no marco e entre na Primeira onda.')
    : mundo === 'arquipelago' ? 'Visite Recifes Expostos e Mangue dos Dois Siris em qualquer ordem. A Enseada exige ambos.'
    : 'Complete as três travessias. O atalho sul só se abre depois da última.';
  buscar('#progresso-praia').textContent = mundo === 'praia'
    ? `Rota principal: ${concluidas}/4 · Concha Perolada: ${perola ? 'encontrada' : 'não encontrada'}.`
    : mundo === 'arquipelago'
      ? `Recifes: ${p.concluidas.includes('recife-retorno') ? 'concluídos' : 'a visitar'} · Mangue: ${p.concluidas.includes('mangue-reuniao') ? 'concluído' : 'a visitar'}.`
      : `Travessias concluídas: ${concluidas}/3.`;
  buscar('#enseada-aberta').hidden = mundo !== 'arquipelago' || !abriuEnseada(p);
  buscar('#posicao-praia').textContent = entrada
    ? `${entrada.nome}${entrada.opcional ? ' · opcional' : ''}${p.concluidas.some(id => id === entrada.id) ? ' · concluída' : ''}.`
    : `Trilha na coluna ${p.posicao.coluna + 1}, linha ${p.posicao.linha + 1}.`;
  buscar('#mensagem-praia').textContent = mensagem;
  const entrar = buscar<HTMLButtonElement>('#entrar-fase');
  entrar.disabled = !entrada;
  entrar.textContent = podeSairDaPraia(p) ? 'Seguir para o arquipélago' : entrada?.destino
    ? (entrada.id === 'porto' ? 'Voltar ao arquipélago' : 'Visitar região')
    : entrada?.id === 'enseada' ? 'Ver passagem' : 'Entrar na fase';
  desenharPraia(mapaPraia.ctx, p);
}

function abrirPraia(mensagem = ''): void {
  trocarTela('praia');
  atualizarPraia(mensagem);
}

function descricao(evento: Evento): string {
  switch (evento.tipo) {
    case 'bloqueado': return 'Passo bloqueado. A maré não avançou.';
    case 'virada': return evento.alta ? 'A maré subiu.' : 'A maré baixou.';
    case 'levada': return evento.motivos.length > 1 ? 'A onda e a garça te alcançaram!'
      : evento.motivos.includes('mare') ? 'A maré te levou!' : 'A garça te alcançou!';
    case 'fragmento': return totalFragmentos(fase) > 1 ? 'Fragmento recolhido.' : 'Fragmento recolhido. Volte à saída.';
    case 'falta-fragmento': return totalFragmentos(fase) > 1
      ? 'Para sair, encontre todos os fragmentos.' : 'Para sair, encontre o fragmento na ilhota.';
    case 'falta-parceiro': return 'O outro siri ainda não está no destino.'; 
    case 'troca': return 'Siri ativo trocado sem avançar a maré.';
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
  fragmento.hidden = !total;
  fragmento.textContent = total > 1 ? `Fragmentos: ${estado.fragmentos.length}/${total}`
    : estado.temFragmento ? 'Fragmento no inventário' : 'Fragmento ainda na ilha';
  const duplaAtiva = buscar('#dupla-ativa');
  duplaAtiva.hidden = !estado.dupla;
  duplaAtiva.textContent = `Siri ativo: ${estado.dupla?.parceiroAtivo ? 'Verde, pinças baixas' : 'Coral, pinças erguidas'} (Espaço para trocar)`;
  buscar('#trocar-siri').hidden = !estado.dupla || finalizada;
  const ameaca = fase.ameaca;
  const sinalGarca = ameaca && vaiAtacar(ameaca, estado.passos + 1)
    ? ` Garça no próximo passo: coluna ${ameaca.alvo.coluna + 1}, linha ${ameaca.alvo.linha + 1}.` : '';
  buscar('#previsao').textContent = finalizada ? 'Tentativa encerrada.'
    : `Em ${movimentos} a maré ${alta ? 'desce' : 'sobe'}.${sinalGarca}`;
  buscar('#posicao').textContent = `Siri na coluna ${estado.posicao.coluna + 1}, linha ${estado.posicao.linha + 1}.`;

  const mensagens = eventos.map(descricao);
  if (eventos.some(evento => evento.tipo === 'levada')) {
    mensagens.push(estado.situacao === 'derrota' ? 'Três erros: tente de novo.' : 'De volta à última casa firme.');
  }
  if (estado.situacao === 'vitoria') {
    if (bancada && indice < FASES.length - 1) mensagens.push('Você já pode selecionar a próxima fase.');
    if (!bancada && fase.id === 'ilhota-perolada') mensagens.push('Concha Perolada encontrada. Atalho de volta aberto!');
    else if (!bancada && fase.id !== 'ponta-da-garca') mensagens.push('Volte à praia para continuar.');
  }
  buscar('#feedback').textContent = mensagem || mensagens.join(' ');
  buscar('#seguir-fase').hidden = bancada || fase.id !== 'ponta-da-garca' || estado.situacao !== 'vitoria';
  desenhar(tabuleiro.ctx, fase, estado, bancada ? false : mundoAtual(save.progresso));
  audio.eventos(eventos);
}

function selecionarFase(novoIndice: number, mensagem?: string, focar = true): void {
  indice = novoIndice;
  fase = (bancada ? FASES : TODAS_AS_FASES)[indice];
  estado = iniciar(fase);
  buscar('#nome-fase').textContent = fase.nome;
  buscar('#objetivo').textContent = fase.objetivo;
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
  if (tela !== 'praia') return;
  const p = save.progresso;
  const entrada = entradaEm(p.posicao, mundoAtual(p));
  if (!entrada) return;
  if (entrada.id === 'enseada') {
    atualizarPraia('Passagem da Enseada aberta. Próximo capítulo ainda não disponível.');
    return;
  }
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
    const proximo = moverNoMapa(save.progresso, direcao);
    if (save.progresso !== proximo.progresso) {
      save = { ...save, progresso: proximo.progresso };
      gravar();
    }
    atualizarPraia(proximo.mensagem);
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
  if (tela === 'fase') selecionarFase(indice, 'Fase reiniciada. Maré baixa.', false);
};
const voltar = () => {
  if (tela === 'fase' && !bancada) abrirPraia();
  else if (tela !== 'inicio') trocarTela('inicio');
};

function abrirCreditos(venceu = false) {
  buscar('#desfecho').textContent = venceu
    ? 'Você chegou à ponta da praia. A primeira viagem termina aqui; use Continuar viagem para seguir às próximas ilhas.'
    : 'O caminho começa na Praia das Conchas.';
  trocarTela('creditos');
}

buscar('#comecar').addEventListener('click', () => {
  save = { ...save, progresso: { ...save.progresso, viuTutorial: true } };
  gravar();
  abrirPraia();
});
buscar('#bancada').addEventListener('click', () => { bancada = true; selecionarFase(0); });
buscar('#creditos-inicio').addEventListener('click', () => abrirCreditos());
buscar('#seguir-fase').addEventListener('click', () => abrirCreditos(true));
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
window.addEventListener('pointerdown', () => { void audio.habilitar(); }, { once: true });
window.addEventListener('keydown', () => { void audio.habilitar(); }, { once: true });
document.addEventListener('visibilitychange', () => {
  audio.ambiente(!document.hidden && (tela === 'praia' || tela === 'fase'));
});
trocarTela('inicio', false);
