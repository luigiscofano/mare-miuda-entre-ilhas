import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VIGIA_DAS_ONDAS } from '../src/fases/vigia-das-ondas.ts';
import { criarOndaVisual, DURACAO_DA_ONDA } from '../src/interface/onda-visual.ts';
import { executarPasso, iniciar } from '../src/motor/index.ts';
import type { Estado, FaixaRessaca, Transicao } from '../src/motor/index.ts';
import { desenhar } from '../src/render/index.ts';
import { CORES_ONDA, CORES_ESPUMA_IMINENTE, ESPUMA_DE_AVISO, ONDA_FRONTAL } from '../src/render/onda-frontal.ts';

const fase = VIGIA_DAS_ONDAS;
const zona = fase.ressaca.faixas[0];
const colunasAtingidas = [2, 3, 5, 6, 7];

function executar(rota: string): Transicao {
  let quadro: Transicao = { estado: iniciar(fase), eventos: [] };
  for (const letra of rota) {
    quadro = executarPasso(fase, quadro.estado, letra === 'R' ? 'direita' : letra === 'L' ? 'esquerda' : 'baixo');
  }
  return quadro;
}

function pintar(estado: Estado, impacto?: FaixaRessaca) {
  let escala = 2;
  const pilha: number[] = [];
  const pixels = new Map<string, string>();
  const ctx = {
    fillStyle: '', imageSmoothingEnabled: true,
    save() { pilha.push(escala); },
    restore() { escala = pilha.pop()!; },
    setTransform(n: number) { escala = n; },
    fillRect(x: number, y: number, l: number, a: number) {
      assert.ok([x, y, l, a].every(v => Number.isInteger(v * escala)));
      assert.match(this.fillStyle, /^#[0-9a-f]{6}$/);
      for (let j = y * escala; j < (y + a) * escala; j++) for (let i = x * escala; i < (x + l) * escala; i++) {
        pixels.set(`${i},${j}`, this.fillStyle);
      }
    },
  };
  desenhar(ctx as unknown as CanvasRenderingContext2D, fase, estado, { complete: false } as HTMLImageElement,
    'praia', undefined, impacto);
  assert.equal(pilha.length, 0);
  const cor = (coluna: number, x: number, y: number) => pixels.get(`${96 + coluna * 32 + x},${176 + y}`);
  return { cor };
}

test('Espuma antes da virada, contraste no último passo e nenhuma crista até a alta', () => {
  const aviso = pintar(iniciar(fase));
  const iminente = pintar(executar('RR').estado);
  const alta = pintar(executar('RLR').estado);
  for (const coluna of colunasAtingidas) {
    const { x, y } = ESPUMA_DE_AVISO;
    assert.equal(aviso.cor(coluna, x + 8, y), CORES_ONDA.e);
    assert.equal(iminente.cor(coluna, x + 8, y), CORES_ESPUMA_IMINENTE.e);
    assert.equal(iminente.cor(coluna, x + 12, y), CORES_ONDA.c);
    assert.notEqual(alta.cor(coluna, x + 12, y), CORES_ONDA.c);
  }
  for (const coluna of [0, 1, 4, 8, 9]) {
    assert.notEqual(iminente.cor(coluna, ESPUMA_DE_AVISO.x + 12, ESPUMA_DE_AVISO.y), CORES_ONDA.c);
  }
});

test('A crista frontal aparece na mesma faixa ao acertar ou errar, sem desenhar sobre refúgio', () => {
  const naufragio = executar('RRD');
  const seguro = executar('RLR');
  assert.equal(seguro.estado.levadas, 0);
  assert.equal(naufragio.estado.levadas, 1);
  const { x, y } = ONDA_FRONTAL;
  for (const quadro of [seguro, naufragio]) {
    assert.deepEqual(quadro.eventos[0], { tipo: 'virada', alta: true });
    const impacto = pintar(quadro.estado, zona);
    for (const coluna of colunasAtingidas) {
      assert.equal(impacto.cor(coluna, x + 13, y + 2), CORES_ONDA.c);
      assert.equal(impacto.cor(coluna, x + 13, y + 12), CORES_ONDA.r);
    }
    for (const coluna of [0, 1, 4, 8, 9]) assert.notEqual(impacto.cor(coluna, x + 13, y + 2), CORES_ONDA.c);
  }
});

test('Um evento real agenda só um quadro estático; bloqueios e redesenhos não o reiniciam', () => {
  let fim: (() => void) | undefined;
  let agendas = 0, cancelamentos = 0, redesenhos = 0;
  const visual = criarOndaVisual((callback, ms) => {
    assert.equal(ms, DURACAO_DA_ONDA);
    agendas++;
    fim = callback;
    return () => { cancelamentos++; };
  }, () => redesenhos++);
  const { estado, eventos } = executar('RLR');
  visual.aposAcao(fase, estado.passos, eventos); // Subida segura é suficiente.
  assert.deepEqual(visual.faixa(), zona);
  const bloqueio = executarPasso(fase, estado, 'cima');
  visual.aposAcao(fase, bloqueio.estado.passos, bloqueio.eventos);
  assert.deepEqual(visual.faixa(), zona);
  assert.equal(agendas, 1);
  fim?.();
  assert.equal(redesenhos, 1);
  assert.equal(visual.faixa(), undefined);
  visual.aposAcao(fase, estado.passos, eventos);
  assert.equal(agendas, 1, 'o mesmo evento não reinicia a crista');
  visual.aposAcao(fase, 6, [{ tipo: 'virada', alta: false }]);
  assert.equal(agendas, 1);
  visual.reiniciar();
  visual.aposAcao(fase, estado.passos, eventos);
  const callbackObsoleto = fim;
  visual.reiniciar();
  assert.equal(cancelamentos, 1);
  callbackObsoleto?.();
  assert.equal(redesenhos, 1, 'o quadro anterior nunca volta depois do reinício');
  visual.aposAcao(fase, estado.passos, eventos);
  visual.aposAcao(fase, 4, []);
  assert.equal(cancelamentos, 2);
  assert.equal(visual.faixa(), undefined);
});
