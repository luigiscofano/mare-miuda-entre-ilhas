import type { Mundo } from '../campanha/index.ts';

export const TRILHAS = ['praia', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'] as const;
export type Faixa = typeof TRILHAS[number];
export const caminhoDaFaixa = (faixa: Faixa) => `assets/audio/trilha/${faixa}.mp3`;

export function faixaDoMundo(mundo: Mundo): Faixa | undefined {
  // O arquipélago conecta regiões, mas não é um nono tema.
  if (mundo === 'arquipelago') return;
  return mundo === 'praia-enseadinha' ? 'praia' : mundo;
}

export async function carregarFaixa(faixa: Faixa, sinal: AbortSignal): Promise<ArrayBuffer> {
  const embutido = document.querySelector<HTMLScriptElement>(`#trilha-offline-${faixa}`);
  if (embutido?.textContent) {
    const binario = atob(embutido.textContent);
    return Uint8Array.from(binario, caractere => caractere.charCodeAt(0)).buffer;
  }
  const resposta = await fetch(caminhoDaFaixa(faixa), { signal: sinal });
  if (!resposta.ok) throw new Error(`Trilha indisponível: ${faixa}.`);
  return resposta.arrayBuffer();
}

type Voz = Readonly<{ faixa: Faixa; fonte: AudioBufferSourceNode; ganho: GainNode; iniciou: number }>;
const TRANSICAO = 0.44;
const CACHE_MAXIMO = 3;

export function criarTrilha(ctx: AudioContext, destino: AudioNode, carregar = carregarFaixa) {
  let voz: Voz | undefined;
  let pedido: { faixa: Faixa; cancelar: AbortController } | undefined;
  let falhou: Faixa | undefined;
  let alvo: Faixa = 'praia';
  let tocando = false;
  let origem: number | undefined;
  let faseParada = 0;
  const buffers = new Map<Faixa, AudioBuffer>();

  function cancelarPedido() {
    pedido?.cancelar.abort();
    pedido = undefined;
  }

  function apagar(anterior: Voz, agora: number, segundos: number) {
    const ganho = anterior.ganho.gain;
    // A curva de subida é linear: seu valor pode ser calculado em um segundo
    // cruzamento sem depender de cancelAndHoldAtTime no navegador.
    const nivel = Math.min(1, Math.max(0, (agora - anterior.iniciou) / TRANSICAO));
    ganho.cancelScheduledValues(agora);
    ganho.setValueAtTime(nivel, agora);
    ganho.linearRampToValueAtTime(0, agora + segundos);
    anterior.fonte.stop(agora + segundos);
  }

  function iniciar(faixa: Faixa, buffer: AudioBuffer) {
    if (voz?.faixa === faixa) return;
    const agora = ctx.currentTime;
    origem ??= agora - faseParada;
    const fonte = ctx.createBufferSource();
    const ganho = ctx.createGain();
    fonte.buffer = buffer;
    fonte.loop = true;
    fonte.connect(ganho);
    ganho.connect(destino);
    ganho.gain.setValueAtTime(0, agora);
    ganho.gain.linearRampToValueAtTime(1, agora + TRANSICAO);
    fonte.onended = () => { fonte.disconnect(); ganho.disconnect(); };
    // Os oito arranjos têm o mesmo compasso inicial e período. O relógio
    // compartilhado conserva a posição musical mesmo após um carregamento lento.
    fonte.start(agora, (agora - origem) % buffer.duration);
    if (voz) apagar(voz, agora, TRANSICAO);
    voz = { faixa, fonte, ganho, iniciou: agora };
  }

  function atualizar() {
    if (!tocando) {
      cancelarPedido();
      if (origem !== undefined) faseParada = ctx.currentTime - origem;
      origem = undefined;
      if (voz && ctx.state !== 'closed') apagar(voz, ctx.currentTime, 0.045);
      voz = undefined;
      return;
    }
    if (pedido?.faixa !== alvo) cancelarPedido();
    if (voz?.faixa === alvo || pedido || falhou === alvo) return;

    const salvo = buffers.get(alvo);
    if (salvo) {
      buffers.delete(alvo);
      buffers.set(alvo, salvo);
      iniciar(alvo, salvo);
      return;
    }

    const atual = { faixa: alvo, cancelar: new AbortController() };
    pedido = atual;
    void (async () => {
      try {
        const dados = await carregar(atual.faixa, atual.cancelar.signal);
        if (pedido !== atual) return;
        const buffer = await ctx.decodeAudioData(dados);
        if (pedido !== atual) return;
        if (!(buffer.duration > 0)) throw new Error('Trilha vazia.');
        buffers.set(atual.faixa, buffer);
        if (buffers.size > CACHE_MAXIMO) {
          const maisAntigo = buffers.keys().next();
          if (!maisAntigo.done) buffers.delete(maisAntigo.value);
        }
        iniciar(atual.faixa, buffer);
      } catch {
        // Um arquivo indisponível nunca bloqueia a partida nem os avisos sonoros.
        // A faixa anterior continua até que a nova esteja pronta, se houver.
        if (pedido === atual) falhou = atual.faixa;
      } finally {
        if (pedido === atual) pedido = undefined;
      }
    })();
  }

  return {
    sincronizar(faixa: Faixa, ativo: boolean, tentarDeNovo = false) {
      if (tentarDeNovo || faixa !== alvo) falhou = undefined;
      alvo = faixa;
      tocando = ativo;
      atualizar();
    },
  };
}
