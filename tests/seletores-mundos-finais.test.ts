import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entradaEm, moverNoMapa, nosDo, trilhasDo } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
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
  { mundo: 'grutas', x: 11, y: 1, rotas: 15, pixel: [480, 186], direcao: 'baixo',
    fase: 'grutas-chefe-sentinela-da-gruta', seguinte: 'grutas-chefe-cofre-das-espumas',
    ateAqui: ['grutas-encaixe', 'grutas-ordem', 'grutas-retorno', 'grutas-dupla-portao', 'grutas-dupla-camaras'] },
  { mundo: 'ressaca', x: 6, y: 3, rotas: 14, pixel: [288, 218], direcao: 'esquerda',
    fase: 'ressaca-chefe-vento-sul', seguinte: 'ressaca-chefe-ressaca-alta',
    ateAqui: ['ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros', 'ressaca-refugio-de-pedra', 'ressaca-bolsos-opostos',
      'ressaca-vigia-da-placa', 'ressaca-balsas-da-ponta', 'ressaca-cais-em-paralelo', 'ressaca-tres-moedas-do-cais',
      'ressaca-atracadouro-torto', 'ressaca-cofre-da-vazante'] },
  { mundo: 'farol', x: 11, y: 4, rotas: 15, pixel: [432, 250], direcao: 'esquerda',
    fase: 'farol-chefe-guardiao', seguinte: 'farol-chefe-ultima-virada',
    ateAqui: ['farol-fragmento-margens', 'farol-duas-luzes', 'farol-faroleiros-de-vigia', 'farol-turno-dos-guardioes',
      'farol-salao-das-lanternas', 'farol-luz-das-duas-mares'] },
] as const;

for (const { mundo, x, y, rotas, pixel, direcao, fase, seguinte, ateAqui } of CENARIOS) {
  const bloqueado: Progresso = { mundo, posicao: { coluna: x, linha: y }, viuTutorial: true, concluidas: ateAqui };
  test(`${mundo}: conserva as ligações, 14 vértices, o Siri e o fundo de contingência`, () => {
    assert.equal(trilhasDo(mundo).length, rotas);
    assert.equal(nosDo(mundo).length, 14);
    const antigo = quadro(bloqueado);
    const novo = quadro(bloqueado, fundo);
    assert.deepEqual(novo.imagens[0], { fonte: fundo, coords: [0, 0, 256, 192], escala: 2 });
    assert.deepEqual(novo.imagens[1], antigo.imagens[0]);
    assert.deepEqual(quadro(bloqueado, fundoInvalido).imagens, antigo.imagens);
    assert.deepEqual(quadro(bloqueado, fundoInvalido).marcas, antigo.marcas);
  });

  test(`${mundo}: o portão opcional só abre após a primeira arena`, () => {
    const aberto: Progresso = { ...bloqueado, concluidas: [...ateAqui, fase] };
    assert.equal(quadro(bloqueado, fundo).corEm(...pixel), '#263b45');
    assert.equal(quadro(aberto, fundo).corEm(...pixel), '#efc987');
    assert.equal(moverNoMapa(bloqueado, direcao).progresso, bloqueado);
    const avance = moverNoMapa(aberto, direcao).progresso;
    assert.equal(entradaEm(avance.posicao, mundo)?.id, seguinte);
    assert.equal(avance.concluidas, aberto.concluidas);
  });
}
