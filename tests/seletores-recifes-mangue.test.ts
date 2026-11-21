import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entradaEm, moverNoMapa, nosDo, trilhasDo, totalDeFasesRegulares } from '../src/campanha/index.ts';
import type { Mundo, Progresso } from '../src/campanha/index.ts';
import { desenharPraia } from '../src/render/index.ts';

const logo = { complete: true, naturalWidth: 180, naturalHeight: 94 } as HTMLImageElement;
const fundo = { complete: true, naturalWidth: 512, naturalHeight: 384 } as HTMLImageElement;
const imagemAusente = { ...fundo, complete: false } as HTMLImageElement;

function pintar(p: Progresso, arte?: HTMLImageElement) {
  const imagens: { fonte: HTMLImageElement; coordenadas: number[] }[] = [];
  let escala = 2;
  const ctx = {
    fillStyle: '', imageSmoothingEnabled: true, save() {}, restore() { escala = 2; },
    setTransform(a: number) { escala = a; },
    drawImage(fonte: HTMLImageElement, ...coordenadas: number[]) { imagens.push({ fonte, coordenadas }); },
    fillRect(x: number, y: number, largura: number, altura: number) {
      assert.ok([x, y, largura, altura].every(n => Number.isInteger(n * escala)));
    },
  };
  desenharPraia(ctx as unknown as CanvasRenderingContext2D, p, logo, undefined, undefined, arte);
  assert.equal(ctx.imageSmoothingEnabled, false);
  return imagens;
}

const preparar = (mundo: Mundo): Progresso => ({
  mundo, posicao: { coluna: 2, linha: 1 }, viuTutorial: true, concluidas: [],
});

test('os dois fundos nativos não mudam os pixels ou a âncora do siri, nem o mapa sem arte', () => {
  for (const mundo of ['recifes', 'mangue'] as const) {
    const partida = preparar(mundo);
    const semFundo = pintar(partida);
    assert.deepEqual(pintar(partida, imagemAusente), semFundo);
    assert.deepEqual(pintar(partida, fundo), [{ fonte: fundo, coordenadas: [0, 0, 256, 192] }, ...semFundo]);
    assert.equal(totalDeFasesRegulares(mundo), 10);
  }
  const arquipelago = preparar('arquipelago');
  assert.deepEqual(pintar(arquipelago, fundo), pintar(arquipelago));
});

test('os seletores conservam os ramos, os dois chefes e as mesmas travas', () => {
  for (const [mundo, n, fase] of [['recifes', 15, 'recife-pedra-firme'], ['mangue', 13, 'mangue-dois-encontros']] as const) {
    const p = preparar(mundo);
    assert.equal(nosDo(mundo).length, n);
    assert.equal(trilhasDo(mundo).length, n);
    assert.equal(nosDo(mundo).filter(pos => entradaEm(pos, mundo)?.chefe).length, 2);
    assert.equal(moverNoMapa(p, 'cima').progresso, p);
    const aberto = { ...p, concluidas: [fase] };
    const resultado = moverNoMapa(aberto, 'cima');
    assert.equal(resultado.progresso.posicao.linha, 0);
    assert.deepEqual(resultado.progresso.concluidas, aberto.concluidas);
  }
});
