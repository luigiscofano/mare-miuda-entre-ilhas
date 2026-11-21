import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entradaEm, moverNoMapa, nosDo, trilhasDo } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { desenharCabo, desenharPraia } from '../src/render/index.ts';

const imagem = (naturalWidth: number, naturalHeight: number) =>
  ({ complete: true, naturalWidth, naturalHeight }) as HTMLImageElement;
const fundo = imagem(512, 384), cabo = imagem(192, 144), logo = imagem(180, 94);
const base = (concluidas: Progresso['concluidas'] = []): Progresso =>
  ({ mundo: 'praia-enseadinha', posicao: { coluna: 2, linha: 1 }, viuTutorial: true, concluidas });

function quadro(p: Progresso, comArte = true, usarCabo = false) {
  let escala = 2;
  const pilha: number[] = [];
  const imagens: Array<{ fonte: HTMLImageElement; coords: number[]; escala: number }> = [];
  const marcas: Array<{ cor: string; x: number; y: number; l: number; a: number }> = [];
  const ctx = {
    imageSmoothingEnabled: true, fillStyle: '',
    save() { pilha.push(escala); },
    restore() { escala = pilha.pop()!; },
    setTransform(a: number) { escala = a; },
    drawImage(fonte: HTMLImageElement, ...coords: number[]) { imagens.push({ fonte, coords, escala }); },
    fillRect(x: number, y: number, l: number, a: number) {
      const [px, py, lx, ly] = [x, y, l, a].map(valor => valor * escala);
      assert.ok([px, py, lx, ly].every(Number.isInteger));
      marcas.push({ cor: this.fillStyle, x: px, y: py, l: lx, a: ly });
    },
  };
  const canvas = ctx as unknown as CanvasRenderingContext2D;
  if (usarCabo) desenharCabo(canvas, p, cabo, logo);
  else desenharPraia(canvas, p, logo, undefined, undefined, comArte ? fundo : undefined);
  assert.equal(ctx.imageSmoothingEnabled, false);
  assert.equal(escala, 2);
  return {
    imagens, marcas,
    corEm(x: number, y: number) {
      return marcas.findLast(m => x >= m.x && x < m.x + m.l && y >= m.y && y < m.y + m.a)?.cor;
    },
  };
}

test('Enseadinha mantém as nove trilhas, dez vértices, projeção e recorte canônico', () => {
  assert.equal(trilhasDo('praia-enseadinha').length, 9);
  assert.equal(nosDo('praia-enseadinha').length, 10);
  const antigo = quadro(base(), false);
  const novo = quadro(base());
  assert.deepEqual(novo.imagens[0], { fonte: fundo, coords: [0, 0, 256, 192], escala: 2 });
  assert.deepEqual(novo.imagens[1], antigo.imagens[0]);
  const recifes: Progresso = { ...base(), mundo: 'recifes' };
  assert.deepEqual(quadro(recifes).imagens, quadro(recifes, false).imagens);
  assert.deepEqual(quadro(recifes).marcas, quadro(recifes, false).marcas);
});

test('A placa de Fio de areia mantém número, libera desvio e distingue dois chefes', () => {
  const bloqueado = base(), aberto = base(['praia-fio-de-areia']);
  assert.equal(quadro(bloqueado).corEm(224, 164), '#263b45');
  assert.equal(quadro(aberto).corEm(224, 164), '#efc987');
  const novos = quadro(aberto);
  for (const y of [90, 122]) assert.equal(novos.corEm(218, y), '#fff1cb');
  assert.equal(moverNoMapa(bloqueado, 'baixo').progresso, bloqueado);
  const desvio = moverNoMapa(aberto, 'baixo').progresso;
  assert.equal(entradaEm(desvio.posicao, 'praia-enseadinha')?.id, 'praia-bolso-mare');
  const chefe = moverNoMapa(aberto, 'cima').progresso;
  assert.equal(entradaEm(chefe.posicao, 'praia-enseadinha')?.chefe, true);
  assert.equal(moverNoMapa(chefe, 'cima').progresso, chefe);
});

test('Cabo Baixo continua usando fundo nativo e recorte no mesmo ponto registrado', () => {
  const p: Progresso = { ...base(), mundo: 'praia' };
  const atual = quadro(p, true, true);
  assert.deepEqual(atual.imagens[0], { fonte: cabo, coords: [32, 24, 192, 144], escala: 2 });
  assert.deepEqual(atual.imagens[1], { fonte: logo, coords: [75, 3, 31, 23, 135, 213, 31, 23], escala: 1 });
});
