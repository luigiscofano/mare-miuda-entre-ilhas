import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entradaEm, moverNoMapa, nosDo, trilhasDo } from '../src/campanha/index.ts';
import type { IdFase, Progresso } from '../src/campanha/index.ts';
import { desenharPraia } from '../src/render/index.ts';

const imagem = (naturalWidth: number, naturalHeight: number) =>
  ({ complete: true, naturalWidth, naturalHeight }) as HTMLImageElement;
const fundo = imagem(512, 384), fundoInvalido = imagem(511, 384), logo = imagem(180, 94);

function quadro(p: Progresso, arte?: HTMLImageElement) {
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
  desenharPraia(ctx as unknown as CanvasRenderingContext2D, p, logo, undefined, undefined, arte);
  assert.equal(ctx.imageSmoothingEnabled, false);
  assert.equal(escala, 2);
  return {
    imagens, marcas,
    corEm(x: number, y: number) {
      return marcas.findLast(m => x >= m.x && x < m.x + m.l && y >= m.y && y < m.y + m.a)?.cor;
    },
  };
}

const CENARIOS = [
  ['enseada', 'enseada-sombra-restinga', 'enseada-passo-sombra', 'enseada-vigia-das-pedras'],
  ['deriva', 'deriva-primeira-balsa', 'deriva-um-passo-ao-cais', 'deriva-cais-da-alta'],
] as const satisfies readonly (readonly [Progresso['mundo'], IdFase, IdFase, IdFase])[];

for (const [mundo, abertura, fase, seguinte] of CENARIOS) {
  const bloqueado: Progresso = { mundo, posicao: { coluna: 2, linha: 0 }, viuTutorial: true, concluidas: [abertura] };
  test(`${mundo}: conserva 15 caminhos, 15 vértices, o Siri e o fundo de contingência`, () => {
    assert.equal(trilhasDo(mundo).length, 15);
    assert.equal(nosDo(mundo).length, 15);
    const antigo = quadro(bloqueado);
    const novo = quadro(bloqueado, fundo);
    assert.deepEqual(novo.imagens[0], { fonte: fundo, coords: [0, 0, 256, 192], escala: 2 });
    assert.deepEqual(novo.imagens[1], antigo.imagens[0]);
    assert.deepEqual(quadro(bloqueado, fundoInvalido).imagens, antigo.imagens);
    assert.deepEqual(quadro(bloqueado, fundoInvalido).marcas, antigo.marcas);
  });

  test(`${mundo}: remove o cadeado só após o requisito, sem mudar a fase de destino`, () => {
    const aberto: Progresso = { ...bloqueado, concluidas: [abertura, fase] };
    assert.equal(quadro(bloqueado, fundo).corEm(224, 122), '#263b45');
    assert.equal(quadro(aberto, fundo).corEm(224, 122), '#efc987');
    assert.equal(moverNoMapa(bloqueado, 'direita').progresso, bloqueado);
    const avance = moverNoMapa(aberto, 'direita').progresso;
    assert.equal(entradaEm(avance.posicao, mundo)?.id, seguinte);
    assert.equal(avance.concluidas, aberto.concluidas);
  });
}
