import assert from 'node:assert/strict';
import { test } from 'node:test';
import { criarAudio } from '../src/audio/index.ts';
import { faixaDoMundo, TRILHAS } from '../src/audio/trilha.ts';

type Ganho = [string, number, number];
class Parametro {
  value = 1;
  valores: Ganho[] = [];
  setValueAtTime(n: number, t: number) { this.valores.push(['set', n, t]); }
  linearRampToValueAtTime(n: number, t: number) { this.valores.push(['linear', n, t]); }
  exponentialRampToValueAtTime(n: number, t: number) { this.valores.push(['expo', n, t]); }
  setTargetAtTime(n: number, t: number) { this.value = n; this.valores.push(['target', n, t]); }
  cancelScheduledValues(t: number) { this.valores.push(['cancelar', 0, t]); }
}
class No {
  destino?: No;
  connect(no: No) { this.destino = no; }
  disconnect() {}
}
class Fonte extends No {
  buffer?: number;
  loop = false;
  onended?: () => void;
  inicio?: [number, number];
  fim?: number;
  start(t: number, fase = 0) { this.inicio = [t, fase]; }
  stop(t: number) { this.fim = t; }
}
class Oscilador extends Fonte { frequency = new Parametro(); }
class Contexto extends EventTarget {
  static instancias: Contexto[] = [];
  state = 'suspended';
  currentTime = 0;
  destination = new No();
  ganhos: (No & { gain: Parametro })[] = [];
  fontes: Fonte[] = [];
  efeitos: Oscilador[] = [];
  tentativas = 0;
  resolver?: () => void;
  rejeitar?: (erro: Error) => void;
  constructor() { super(); Contexto.instancias.push(this); }
  estado(novo: string) { this.state = novo; this.dispatchEvent(new Event('statechange')); }
  createGain() {
    const no = Object.assign(new No(), { gain: new Parametro() });
    this.ganhos.push(no);
    return no;
  }
  createBufferSource() { const fonte = new Fonte(); this.fontes.push(fonte); return fonte; }
  createOscillator() { const oscilador = new Oscilador(); this.efeitos.push(oscilador); return oscilador; }
  async decodeAudioData(bytes: ArrayBuffer) {
    const faixa = new Uint8Array(bytes)[0];
    if (faixa === 99) throw new Error('dados inválidos');
    return { duration: 29.6907291667, faixa };
  }
  resume() {
    this.tentativas++;
    return new Promise<void>((ok, rejeitar) => {
      this.resolver = () => { this.estado('running'); ok(); };
      this.rejeitar = rejeitar;
    });
  }
}

type Pedido = { url: string; sinal: AbortSignal; resolver: (resposta: Response) => void };
const bytes = (valor: number) => new Response(Uint8Array.of(valor));
const esperar = () => new Promise<void>(ok => setImmediate(ok));

function preparar() {
  const pedidos: Pedido[] = [];
  Contexto.instancias = [];
  Object.assign(globalThis, {
    AudioContext: Contexto,
    document: { querySelector: () => null },
    fetch: (url: string, { signal: sinal }: { signal: AbortSignal }) =>
      new Promise<Response>(resolver => { pedidos.push({ url, sinal, resolver }); }),
  });
  return { pedidos, audio: criarAudio() };
}

test('oito faixas, compartilhamento Praia–Enseadinha e nenhuma faixa para o Arquipélago', () => {
  assert.equal(TRILHAS.length, 8);
  assert.equal(faixaDoMundo('praia-enseadinha'), 'praia');
  assert.equal(faixaDoMundo('arquipelago'), undefined);
  for (const faixa of TRILHAS) assert.equal(faixaDoMundo(faixa), faixa);
});

test('carrega apenas o mundo atual e conserva relógio e fonte no mesmo mapa/fase', async () => {
  const { pedidos, audio } = preparar();
  audio.ambiente('farol', true);
  assert.equal(Contexto.instancias.length, 0);
  assert.equal(pedidos.length, 0);
  const primeiro = audio.habilitar();
  const ctx = Contexto.instancias[0];
  await audio.habilitar();
  assert.equal(ctx.tentativas, 1);
  ctx.resolver?.();
  await primeiro;
  assert.deepEqual(pedidos.map(p => p.url), ['assets/audio/trilha/farol.mp3']);
  pedidos[0].resolver(bytes(8));
  await esperar();
  assert.equal(ctx.fontes[0].loop, true);
  assert.deepEqual(ctx.fontes[0].inicio, [0, 0]);
  ctx.currentTime = 7;
  audio.ambiente('farol', true);
  audio.ambiente('arquipelago', true);
  assert.equal(ctx.fontes.length, 1);
  audio.ambiente('mangue', true);
  assert.equal(ctx.fontes[0].fim, undefined);
  ctx.currentTime = 12.5;
  pedidos[1].resolver(bytes(3));
  await esperar();
  assert.deepEqual(ctx.fontes[1].inicio, [12.5, 12.5]);
  assert.equal(ctx.fontes[0].fim, 12.94);
  assert.deepEqual(ctx.ganhos.at(-1)?.gain.valores, [['set', 0, 12.5], ['linear', 1, 12.94]]);
  audio.ambiente('farol', true);
  assert.equal(pedidos.length, 2);
  assert.equal(ctx.fontes.length, 3);
});

test('pedido obsoleto não toca, 404/decodificação não param os efeitos, gesto permite tentar de novo', async () => {
  const { pedidos, audio } = preparar();
  audio.ambiente('praia', true);
  const primeiro = audio.habilitar();
  const ctx = Contexto.instancias[0];
  ctx.resolver?.();
  await primeiro;
  pedidos[0].resolver(bytes(1));
  await esperar();
  audio.ambiente('recifes', true);
  audio.ambiente('grutas', true);
  assert.equal(pedidos[1].sinal.aborted, true);
  pedidos[1].resolver(bytes(2));
  pedidos[2].resolver(new Response(null, { status: 404 }));
  await esperar();
  assert.equal(ctx.fontes.length, 1);
  audio.ambiente('grutas', true);
  assert.equal(pedidos.length, 3);
  audio.eventos([{ tipo: 'virada', alta: true }]);
  assert.equal(ctx.efeitos.length, 3);
  assert.equal(ctx.fontes[0].fim, undefined);
  await audio.habilitar();
  pedidos[3].resolver(bytes(99));
  await esperar();
  assert.equal(ctx.fontes.length, 1);
  await audio.habilitar();
  pedidos[4].resolver(bytes(6));
  await esperar();
  assert.equal(ctx.fontes.length, 2);
});

test('ganhos separados, fase preservada ao pausar, retomada interrompida e rejeitada', async () => {
  const { pedidos, audio } = preparar();
  audio.ambiente('praia', true);
  audio.volumes({ musica: 0, efeitos: 0.7 });
  const primeiro = audio.habilitar();
  const ctx = Contexto.instancias[0];
  ctx.resolver?.();
  await primeiro;
  assert.equal(pedidos.length, 0);
  audio.eventos([{ tipo: 'virada', alta: false }]);
  assert.equal(ctx.efeitos.length, 2);
  audio.volumes({ musica: 0.2, efeitos: 0 });
  assert.deepEqual(ctx.ganhos.slice(0, 2).map(g => g.gain.value), [0.2, 0]);
  pedidos[0].resolver(bytes(1));
  await esperar();
  audio.eventos([{ tipo: 'virada', alta: false }]);
  assert.equal(ctx.efeitos.length, 2);
  ctx.currentTime = 4;
  audio.ambiente('praia', false);
  ctx.currentTime = 9;
  audio.ambiente('praia', true);
  assert.deepEqual(ctx.fontes.at(-1)?.inicio, [9, 4]);
  ctx.estado('interrupted');
  audio.ambiente('praia', true);
  assert.equal(ctx.tentativas, 1);
  const falhou = audio.habilitar();
  ctx.rejeitar?.(new Error('interrompido'));
  await falhou;
  const recuperou = audio.habilitar();
  ctx.resolver?.();
  await recuperou;
  assert.equal(ctx.tentativas, 3);
  assert.deepEqual(ctx.fontes.at(-1)?.inicio, [9, 4]);
});
