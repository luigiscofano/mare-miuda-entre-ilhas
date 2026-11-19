import { executarPasso, iniciar, LIMITE_LEVADAS, mareAlta, passosAteVirada, vaiAtacar } from '../motor/index.ts';
import type { Direcao, Evento } from '../motor/index.ts';
import { FASES } from '../fases/index.ts';
import { desenhar, LARGURA } from '../render/index.ts';
import { conectarTeclado } from '../entrada/index.ts';

function buscar<T extends HTMLElement>(seletor: string): T {
  const elemento = document.querySelector<T>(seletor);
  if (!elemento) throw new Error(`Elemento ausente: ${seletor}`);
  return elemento;
}

const canvas = buscar<HTMLCanvasElement>('#tabuleiro');
const bordaTabuleiro = buscar('#moldura');
const ctx = canvas.getContext('2d') ?? (() => { throw new Error('Canvas indisponível neste navegador.'); })();
const titulo = buscar('#nome-fase');
const objetivo = buscar('#objetivo');
const ensino = buscar('#ensino');
const mare = buscar('#mare');
const passos = buscar('#passos');
const erros = buscar('#erros');
const fragmento = buscar('#fragmento');
const previsao = buscar('#previsao');
const posicao = buscar('#posicao');
const grade = buscar('#grade');
const feedback = buscar('#feedback');
const ajuda = buscar('#ajuda');
const niveis = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-fase]'));
const direcoes = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-direcao]'));

let indice = 0;
let fase = FASES[indice];
let estado = iniciar(fase);

function atualizarEscala(): void {
  const disponivel = bordaTabuleiro.clientWidth;
  const escala = Math.max(1, Math.floor(disponivel / LARGURA));
  canvas.style.width = `${LARGURA * escala}px`;
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

function atualizar(eventos: readonly Evento[] = [], mensagem = ''): void {
  const alta = mareAlta(estado.passos);
  const faltam = passosAteVirada(estado.passos);
  const movimentos = faltam === 1 ? '1 passo' : `${faltam} passos`;
  const finalizada = estado.situacao !== 'jogando';
  mare.textContent = alta ? 'Alta' : 'Baixa';
  passos.textContent = String(estado.passos);
  erros.textContent = `${estado.levadas} / ${LIMITE_LEVADAS}`;
  fragmento.hidden = !fase.mapa.some(linha => linha.includes('B'));
  fragmento.textContent = estado.temFragmento ? 'Fragmento no inventário' : 'Fragmento ainda na ilha';
  const ameaca = fase.ameaca;
  const sinalGarca = ameaca && vaiAtacar(ameaca, estado.passos + 1)
    ? ` Garça no próximo passo: coluna ${ameaca.alvo.coluna + 1}, linha ${ameaca.alvo.linha + 1}.` : '';
  previsao.textContent = finalizada ? 'Tentativa encerrada.'
    : `Em ${movimentos} a maré ${alta ? 'desce' : 'sobe'}.${sinalGarca}`;
  posicao.textContent = `Siri na coluna ${estado.posicao.coluna + 1}, linha ${estado.posicao.linha + 1}.`;
  const mensagens = eventos.map(descricao);
  if (eventos.some(evento => evento.tipo === 'levada')) {
    mensagens.push(estado.situacao === 'derrota' ? 'Três erros: tente de novo.' : 'De volta à última casa firme.');
  }
  if (estado.situacao === 'vitoria' && indice < FASES.length - 1) mensagens.push('Você já pode selecionar a próxima fase.');
  feedback.textContent = mensagem || mensagens.join(' ');
  desenhar(ctx, fase, estado);
}

function selecionar(novoIndice: number, mensagem?: string): void {
  indice = novoIndice;
  fase = FASES[indice];
  estado = iniciar(fase);
  titulo.textContent = fase.nome;
  objetivo.textContent = fase.objetivo;
  ensino.textContent = fase.ensino;
  grade.textContent = fase.mapa.join('\n');
  ajuda.open = false;
  niveis.forEach((botao, i) => botao.setAttribute('aria-pressed', String(indice === i)));
  atualizar([], mensagem ?? 'Fase selecionada. Maré baixa.');
}

function mover(direcao: Direcao): void {
  if (estado.situacao !== 'jogando') return;
  const transicao = executarPasso(fase, estado, direcao);
  estado = transicao.estado;
  atualizar(transicao.eventos);
}

const reiniciar = () => selecionar(indice, 'Fase reiniciada. Maré baixa.');
niveis.forEach((botao, i) => botao.addEventListener('click', () => selecionar(i)));
direcoes.forEach(botao => botao.addEventListener('click', () => mover(botao.dataset.direcao as Direcao)));
buscar('#reiniciar').addEventListener('click', reiniciar);
conectarTeclado(window, mover, reiniciar);
new ResizeObserver(atualizarEscala).observe(bordaTabuleiro);
atualizarEscala();
selecionar(0, 'Use as setas, WASD ou os controles de toque.');
