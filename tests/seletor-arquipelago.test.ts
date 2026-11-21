import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entradaEm, moverNoMapa, nosDo, trilhasDo } from '../src/campanha/index.ts';
import type { IdFase, Progresso } from '../src/campanha/index.ts';
import { desenharPraia } from '../src/render/index.ts';
import { CORES_DO_SELETOR } from '../src/render/seletor-arquipelago.ts';

const imagem = { complete: true, naturalWidth: 512, naturalHeight: 384 } as HTMLImageElement;
const logo = { complete: true, naturalWidth: 180, naturalHeight: 94 } as HTMLImageElement;
const progresso = (concluidas: readonly IdFase[] = []): Progresso => ({
  mundo: 'arquipelago', posicao: { coluna: 2, linha: 1 }, viuTutorial: true, concluidas,
});

function quadro(p: Progresso, usarArte = true) {
  let escala = 2;
  const pilha: number[] = [];
  const imagens: Array<{ fonte: HTMLImageElement; coords: number[]; escala: number }> = [];
  const marcas: Array<{ cor: string; x: number; y: number; l: number; a: number }> = [];
  const ctx = {
    imageSmoothingEnabled: true, fillStyle: '',
    save() { pilha.push(escala); },
    restore() { escala = pilha.pop()!; },
    setTransform(a: number) { escala = a; },
    drawImage(fonte: HTMLImageElement, ...coords: number[]) {
      imagens.push({ fonte, coords, escala });
    },
    fillRect(x: number, y: number, l: number, a: number) {
      const [px, py, lx, ly] = [x, y, l, a].map(valor => valor * escala);
      assert.ok([px, py, lx, ly].every(Number.isInteger));
      marcas.push({ cor: this.fillStyle, x: px, y: py, l: lx, a: ly });
    },
  };
  desenharPraia(ctx as unknown as CanvasRenderingContext2D, p, logo, undefined, usarArte ? imagem : undefined);
  assert.equal(escala, 2);
  assert.equal(ctx.imageSmoothingEnabled, false);
  return {
    imagens,
    corEm(x: number, y: number) {
      return marcas.findLast(m => x >= m.x && x < m.x + m.l && y >= m.y && y < m.y + m.a)?.cor;
    },
  };
}

test('Meia-Lua usa fundo nativo e não muda coordenadas, recorte ou ordem do siri', () => {
  const antigo = quadro(progresso(), false);
  const novo = quadro(progresso());
  assert.deepEqual(novo.imagens[0], { fonte: imagem, coords: [0, 0], escala: 1 });
  assert.deepEqual(novo.imagens[1], antigo.imagens[0]);
  assert.equal(novo.imagens.length, 2);
  assert.equal(antigo.imagens.length, 1); // Sem fundo, a pintura anterior segue legível.
  assert.equal(trilhasDo('arquipelago').length, 8);
  assert.equal(nosDo('arquipelago').length, 9);
});

test('Enseada muda de cadeado para losango apenas depois dos dois percursos', () => {
  const fechado = progresso(['recife-retorno']);
  const aberto = progresso(['recife-retorno', 'mangue-reuniao']);
  assert.equal(quadro(fechado).corEm(320, 152), CORES_DO_SELETOR.travamento);
  assert.equal(quadro(aberto).corEm(320, 152), CORES_DO_SELETOR.fundoMarco);
  assert.equal(quadro(fechado).corEm(448, 152), CORES_DO_SELETOR.travamento);
  assert.equal(quadro(aberto).corEm(448, 152), CORES_DO_SELETOR.travamento);
  assert.equal(moverNoMapa(fechado, 'direita').progresso, fechado);
  const movimento = moverNoMapa(aberto, 'direita');
  assert.equal(entradaEm(movimento.progresso.posicao, 'arquipelago')?.destino, 'enseada');
  assert.deepEqual(movimento.progresso.concluidas, aberto.concluidas);
});
