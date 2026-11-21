import type { Evento } from '../motor/index.ts';
import type { Mundo } from '../campanha/index.ts';
import { criarTrilha, faixaDoMundo } from './trilha.ts';
import type { Faixa } from './trilha.ts';

type Canal = 'musica' | 'efeitos';
type Volumes = Readonly<Record<Canal, number>>;
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
type Parcial = readonly [timbre: OscillatorType, multiplicador: number, peso: number];
type Timbre = Readonly<{ pico: number; ataque: number; parciais: readonly Parcial[] }>;
const TIMBRE_EFEITO: Timbre = { pico: 0.055, ataque: 0.014, parciais: [['triangle', 1, 1]] };

// [altura MIDI, deslocamento em segundos, duração]. Subida em três impulsos,
// descida em dois; a diferença é audível mesmo sem ouvir a trilha.
const SINAIS = {
  subida: [[64, 0, 0.11], [69, 0.08, 0.11], [74, 0.16, 0.21]],
  descida: [[71, 0, 0.15], [62, 0.19, 0.22]],
  fragmento: [[76, 0, 0.12], [81, 0.045, 0.18]],
  levada: [[55, 0, 0.16], [51, 0.105, 0.21]],
  vitoria: [[62, 0, 0.16], [66, 0.10, 0.16], [69, 0.20, 0.16], [74, 0.32, 0.31]],
} as const;
type Sinal = (typeof SINAIS)[keyof typeof SINAIS];

function sinal(evento: Evento): Sinal | undefined {
  switch (evento.tipo) {
    case 'virada': return evento.alta ? SINAIS.subida : SINAIS.descida;
    case 'fragmento': return SINAIS.fragmento;
    case 'levada': return SINAIS.levada;
    case 'vitoria': return SINAIS.vitoria;
    default: return;
  }
}

function sintetizar(ctx: AudioContext, destino: AudioNode, midi: number, inicio: number,
  duracao: number, forca: number, timbre: Timbre) {
  const envelope = ctx.createGain();
  const pico = forca * timbre.pico;
  const ataque = timbre.ataque;
  // Os quatro marcos também são usados pelo exportador da prévia, sem efeitos externos.
  envelope.gain.setValueAtTime(0, inicio);
  envelope.gain.linearRampToValueAtTime(pico, inicio + ataque);
  envelope.gain.exponentialRampToValueAtTime(pico * 0.54, inicio + Math.min(ataque + 0.11, duracao * 0.5));
  envelope.gain.exponentialRampToValueAtTime(pico * 0.008, inicio + duracao - 0.012);
  envelope.gain.linearRampToValueAtTime(0, inicio + duracao);
  envelope.connect(destino);
  return timbre.parciais.map(([forma, multiplicador, peso]) => {
    const oscilador = ctx.createOscillator();
    const mistura = ctx.createGain();
    oscilador.type = forma;
    oscilador.frequency.setValueAtTime(hz(midi) * multiplicador, inicio);
    mistura.gain.value = peso;
    oscilador.connect(mistura);
    mistura.connect(envelope);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracao + 0.006);
    return { oscilador, mistura, envelope };
  });
}

// Safari também usa "interrupted", que ainda não consta em todos os tipos DOM.
function estadoDoContexto(ctx: AudioContext): string {
  return ctx.state;
}

export function criarAudio() {
  let ctx: AudioContext | undefined;
  let canais: Record<Canal, GainNode> | undefined;
  let retomando: Promise<void> | undefined;
  let faixa: Faixa = 'praia';
  let trilha: ReturnType<typeof criarTrilha> | undefined;
  let desejos: Volumes = { musica: 0.35, efeitos: 0.55 };
  let ambienteAtivo = false;
  const notasAtivas = new Set<OscillatorNode>();

  function nota(midi: number, inicio: number, duracao: number, forca: number, timbre: Timbre) {
    if (!ctx || !canais) return;
    const parciais = sintetizar(ctx, canais.efeitos, midi, inicio, duracao, forca, timbre);
    const ativas = notasAtivas;
    let faltam = parciais.length;
    for (const { oscilador, mistura, envelope } of parciais) {
      ativas.add(oscilador);
      oscilador.onended = () => {
        ativas.delete(oscilador);
        oscilador.disconnect();
        mistura.disconnect();
        if (--faltam === 0) envelope.disconnect();
      };
    }
  }

  function cancelarNotas() {
    for (const oscilador of notasAtivas) {
      // O contexto pode ser encerrado pelo dispositivo antes desta limpeza.
      try { oscilador.stop(); } catch { /* O som já encerrou. */ }
    }
    notasAtivas.clear();
  }

  function sincronizar(tentarDeNovo = false) {
    const tocando = ctx?.state === 'running' && ambienteAtivo;
    trilha?.sincronizar(faixa, tocando && desejos.musica > 0, tentarDeNovo);
    if (!tocando || desejos.efeitos === 0) cancelarNotas();
  }

  const estadoMudou = () => sincronizar();

  return {
    async habilitar() {
      if (retomando) return;
      if (ctx?.state === 'running') { sincronizar(true); return; }
      try {
        if (!ctx || ctx.state === 'closed') {
          if (typeof AudioContext === 'undefined') return;
          ctx?.removeEventListener('statechange', estadoMudou);
          trilha?.sincronizar(faixa, false);
          ctx = new AudioContext();
          canais = { musica: ctx.createGain(), efeitos: ctx.createGain() };
          for (const canal of ['musica', 'efeitos'] as const) {
            canais[canal].gain.value = desejos[canal];
            canais[canal].connect(ctx.destination);
          }
          trilha = criarTrilha(ctx, canais.musica);
          ctx.addEventListener('statechange', estadoMudou);
        }
        const estado = estadoDoContexto(ctx);
        if (estado === 'suspended' || estado === 'interrupted') {
          // Resume é chamado na pilha do gesto, nunca por mudança de visibilidade
          // ou pelo timer. A promessa reúne dois gestos enquanto ele está pendente.
          retomando = ctx.resume();
          await retomando;
        }
      } catch {
        // Sem áudio a partida, os avisos visuais e a navegação continuam.
      } finally {
        retomando = undefined;
        sincronizar();
      }
    },
    volumes(novos: Volumes) {
      desejos = novos;
      if (ctx && ctx.state !== 'closed' && canais) {
        for (const canal of ['musica', 'efeitos'] as const) {
          canais[canal].gain.setTargetAtTime(desejos[canal], ctx.currentTime, 0.02);
        }
      }
      sincronizar();
    },
    ambiente(mundo: Mundo, ativo: boolean) {
      faixa = faixaDoMundo(mundo) ?? faixa;
      ambienteAtivo = ativo;
      sincronizar();
    },
    eventos(eventos: readonly Evento[]) {
      if (!ctx || ctx.state !== 'running' || !ambienteAtivo || desejos.efeitos === 0) return;
      let inicio = ctx.currentTime + 0.018;
      for (const evento of eventos) {
        const notas = sinal(evento);
        if (!notas) continue;
        for (const [midi, atraso, duracao] of notas) nota(midi, inicio + atraso, duracao, 1, TIMBRE_EFEITO);
        const [_, atraso, duracao] = notas[notas.length - 1];
        inicio += atraso + duracao + 0.035;
      }
    },
  };
}
