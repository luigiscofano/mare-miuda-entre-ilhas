import type { Evento } from '../motor/index.ts';

// Tema provisório original, em graus de Ré maior. A música é apenas ambiente;
// as duas direções da maré também têm sinais visuais e textuais completos.
const TEMA = [62, 69, 66, 71, 69, 66, 64, 62, 67, 74, 71, 69, 66, 64, 62, 57];
const GUIAS = [50, 55, 57, 55];
const hz = (nota: number) => 440 * 2 ** ((nota - 69) / 12);

export function criarAudio() {
  let ctx: AudioContext | undefined;
  let musica: GainNode | undefined;
  let efeitos: GainNode | undefined;
  let agenda: number | undefined;
  let proximaNota = 0;
  let batida = 0;
  let volumeMusica = 0.35;
  let volumeEfeitos = 0.55;
  let desejaTocar = false;

  function nota(destino: GainNode, altura: number, inicio: number, duracao: number, forca: number, tipo: OscillatorType) {
    if (!ctx) return;
    const oscilador = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(hz(altura), inicio);
    envelope.gain.setValueAtTime(0.001, inicio);
    envelope.gain.exponentialRampToValueAtTime(forca, inicio + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);
    oscilador.connect(envelope);
    envelope.connect(destino);
    oscilador.onended = () => { oscilador.disconnect(); envelope.disconnect(); };
    oscilador.start(inicio);
    oscilador.stop(inicio + duracao + 0.006);
  }
  function agendar() {
    if (!ctx || !musica || ctx.state !== 'running') return;
    if (proximaNota < ctx.currentTime) proximaNota = ctx.currentTime + 0.03;
    while (proximaNota < ctx.currentTime + 0.18) {
      nota(musica, TEMA[batida % TEMA.length], proximaNota, 0.33, 0.045, 'triangle');
      if (batida % 4 === 0) nota(musica, GUIAS[Math.floor(batida / 4) % GUIAS.length], proximaNota, 0.63, 0.035, 'sine');
      proximaNota += batida % 2 ? 0.30 : 0.34;
      batida++;
    }
  }
  function sincronizar() {
    const tocar = desejaTocar && musica && ctx?.state === 'running' && volumeMusica > 0;
    if (!tocar && agenda !== undefined) { window.clearInterval(agenda); agenda = undefined; }
    if (tocar && agenda === undefined) {
      agenda = window.setInterval(agendar, 80);
      agendar();
    }
  }

  return {
    async habilitar() {
      try {
        if (!ctx && typeof AudioContext !== 'undefined') {
          ctx = new AudioContext();
          musica = ctx.createGain();
          efeitos = ctx.createGain();
          musica.gain.value = volumeMusica;
          efeitos.gain.value = volumeEfeitos;
          musica.connect(ctx.destination);
          efeitos.connect(ctx.destination);
        }
        if (ctx?.state === 'suspended') await ctx.resume();
        sincronizar();
      } catch {
        // Áudio é opcional; uma falha de dispositivo não bloqueia a partida.
      }
    },
    volumes(preferencias: { musica: number; efeitos: number }) {
      volumeMusica = preferencias.musica;
      volumeEfeitos = preferencias.efeitos;
      if (musica && ctx) musica.gain.setTargetAtTime(volumeMusica, ctx.currentTime, 0.02);
      if (efeitos && ctx) efeitos.gain.setTargetAtTime(volumeEfeitos, ctx.currentTime, 0.02);
      sincronizar();
    },
    ambiente(ativo: boolean) {
      desejaTocar = ativo;
      sincronizar();
    },
    eventos(eventos: readonly Evento[]) {
      if (!ctx || !efeitos || ctx.state !== 'running' || !volumeEfeitos) return;
      let inicio = ctx.currentTime + 0.02;
      for (const evento of eventos) {
        const alturas = evento.tipo === 'virada' ? (evento.alta ? [64, 69, 74] : [74, 69, 64])
          : evento.tipo === 'vitoria' ? [62, 66, 69, 74]
          : evento.tipo === 'fragmento' ? [71, 76]
          : evento.tipo === 'levada' ? [55, 50] : [];
        for (const altura of alturas) {
          nota(efeitos, altura, inicio, 0.18, 0.07, 'triangle');
          inicio += 0.075;
        }
      }
    },
  };
}
