import { executarPasso, iniciar, LIMITE_LEVADAS, mareAlta, passosAteVirada, vaiAtacar } from '../motor/index.ts';
import type { Direcao, Evento } from '../motor/index.ts';
import { FASES, FASES_PRAIA } from '../fases/index.ts';
import { desenhar, desenharPraia, LARGURA } from '../render/index.ts';
import { conectarTeclado } from '../entrada/index.ts';
import { concluirNaPraia, entradaEm, ehIdFase, moverNaPraia } from '../campanha/index.ts';
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
  for (const [nome, painel] of Object.entries(paineis)) painel.hidden = nome !== destino;
  listaTestes.hidden = destino !== 'fase' || !bancada;
  audio.ambiente(!document.hidden && (destino === 'praia' || destino === 'fase'));
  if (destino === 'inicio') {
    buscar('#comecar').textContent = save.progresso.viuTutorial ? 'Continuar viagem' : 'Começar viagem';
  }
  if (destino === 'fase') tabuleiro.escala();
  if (destino === 'praia') mapaPraia.escala();
  if (focar) paineis[destino].querySelector('h2')?.focus();
}

function atualizarPraia(mensagem = ''): void {
  const p = save.progresso;
  const entrada = entradaEm(p.posicao);
  const concluidas = p.concluidas.filter(id => id !== 'ilhota-perolada').length;
  const perola = p.concluidas.includes('ilhota-perolada');
  buscar('#orientacao-praia').textContent = concluidas
    ? 'As passagens se abrem à medida que você resolve as travessias. A ilhota é opcional.'
    : 'Faça o primeiro passo para a direita, pare no marco e entre na Primeira onda.';
  buscar('#progresso-praia').textContent = `Rota principal: ${concluidas}/4 · Concha Perolada: ${perola ? 'encontrada' : 'não encontrada'}.`;
  buscar('#posicao-praia').textContent = entrada
    ? `${entrada.nome}${entrada.opcional ? ' · opcional' : ''}${p.concluidas.includes(entrada.id) ? ' · concluída' : ''}.`
    : `Trilha na coluna ${p.posicao.coluna + 1}, linha ${p.posicao.linha + 1}.`;
  buscar('#mensagem-praia').textContent = mensagem;
  buscar<HTMLButtonElement>('#entrar-fase').disabled = !entrada;
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
    case 'fragmento': return 'Fragmento recolhido. Volte à saída.';
    case 'falta-fragmento': return 'Para sair, encontre o fragmento na ilhota.';
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
  fragmento.hidden = !fase.mapa.some(linha => linha.includes('B'));
  fragmento.textContent = estado.temFragmento ? 'Fragmento no inventário' : 'Fragmento ainda na ilha';
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
  desenhar(tabuleiro.ctx, fase, estado, !bancada);
  audio.eventos(eventos);
}

function selecionarFase(novoIndice: number, mensagem?: string, focar = true): void {
  indice = novoIndice;
  fase = (bancada ? FASES : FASES_PRAIA)[indice];
  estado = iniciar(fase);
  buscar('#nome-fase').textContent = fase.nome;
  buscar('#objetivo').textContent = fase.objetivo;
  buscar('#ensino').textContent = fase.ensino;
  buscar('#lembrete-fase').textContent = fase.ensino;
  buscar('#lembrete-fase').hidden = bancada;
  buscar('#grade').textContent = fase.mapa.join('\n');
  buscar<HTMLDetailsElement>('#ajuda').open = false;
  buscar('#voltar-fase').textContent = bancada ? 'Tela inicial' : 'Voltar à praia';
  niveis.forEach((botao, i) => botao.setAttribute('aria-pressed', String(indice === i)));
  trocarTela('fase', focar);
  atualizarFase([], mensagem ?? 'Fase selecionada. Maré baixa.');
}

function entrarFase(): void {
  if (tela !== 'praia') return;
  const entrada = entradaEm(save.progresso.posicao);
  if (!entrada) return;
  bancada = false;
  selecionarFase(FASES_PRAIA.findIndex(item => item.id === entrada.id));
}

function mover(direcao: Direcao): void {
  if (tela === 'praia') {
    const proximo = moverNaPraia(save.progresso, direcao);
    if (save.progresso !== proximo.progresso) {
      save = { ...save, progresso: proximo.progresso };
      gravar();
    }
    atualizarPraia(proximo.mensagem);
    return;
  }
  if (tela !== 'fase' || estado.situacao !== 'jogando') return;
  const transicao = executarPasso(fase, estado, direcao);
  estado = transicao.estado;
  if (!bancada && estado.situacao === 'vitoria' && ehIdFase(fase.id)) {
    save = { ...save, progresso: concluirNaPraia(save.progresso, fase.id) };
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
    ? 'Você chegou à ponta da praia. A primeira viagem termina aqui; as próximas ilhas ainda são um horizonte.'
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

conectarTeclado(window, mover, reiniciar, entrarFase, voltar, () => tela === 'praia' || tela === 'fase');
window.addEventListener('pointerdown', () => { void audio.habilitar(); }, { once: true });
window.addEventListener('keydown', () => { void audio.habilitar(); }, { once: true });
document.addEventListener('visibilitychange', () => {
  audio.ambiente(!document.hidden && (tela === 'praia' || tela === 'fase'));
});
trocarTela('inicio', false);
