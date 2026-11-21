import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FASES_ENSEADA_AMPLIADA } from '../src/fases/enseada-ampliada.ts';
import { FASES_DERIVA_AMPLIADA } from '../src/fases/deriva-ampliada.ts';
import { executarPasso, iniciar } from '../src/motor/index.ts';
import type { Fase } from '../src/motor/index.ts';
import { desenhar } from '../src/render/index.ts';
import { temaDaCosta } from '../src/render/travessia-praia.ts';

type Marca = Readonly<{ x: number; y: number; l: number; a: number; cor: string }>;

function quadro(fase: Fase, mundo: 'enseada' | 'deriva', passos: number): Marca[] {
  let estado = iniciar(fase);
  for (const acao of fase.solucao.slice(0, passos)) estado = executarPasso(fase, estado, acao).estado;
  assert.equal(estado.passos, passos);
  const marcas: Marca[] = [];
  const pilha: number[] = [];
  let escala = 2;
  const ctx = {
    fillStyle: '', imageSmoothingEnabled: true,
    save() { pilha.push(escala); },
    restore() { escala = pilha.pop()!; },
    setTransform(densidade: number) { escala = densidade; },
    fillRect(x: number, y: number, l: number, a: number) {
      assert.ok([x, y, l, a].every(n => Number.isInteger(n * escala)));
      assert.match(this.fillStyle, /^#[a-f0-9]{6}$/i);
      marcas.push({ x: x * escala, y: y * escala, l: l * escala, a: a * escala, cor: this.fillStyle });
    },
  };
  desenhar(ctx as unknown as CanvasRenderingContext2D, fase, estado, { complete: false } as HTMLImageElement, mundo);
  assert.equal(ctx.imageSmoothingEnabled, false);
  assert.equal(pilha.length, 0);
  return marcas;
}

function corEm(marcas: readonly Marca[], x: number, y: number): string | undefined {
  return marcas.findLast(m => x >= m.x && x < m.x + m.l && y >= m.y && y < m.y + m.a)?.cor;
}

test('Enseada: a sombra no próximo passo fica sobre a areia, e os quatro cantos aparecem na alta', () => {
  const fase = FASES_ENSEADA_AMPLIADA[2];
  const { cores } = temaDaCosta('enseada')!;
  const baixa = quadro(fase, 'enseada', 2);
  const alta = quadro(fase, 'enseada', 3);
  assert.equal(corEm(baixa, 0, 0), cores.mar);
  assert.equal(corEm(baixa, 238, 179), cores.umida);
  for (const [x, y] of [[229, 165], [250, 165], [229, 186], [250, 186]]) {
    assert.equal(corEm(alta, x, y), cores.cantos);
  }
  // No segundo passo, o aviso em X da Garça tem oito pixels lógicos de ponta a ponta.
  assert.equal(corEm(baixa, 232, 136), '#243c41');
  assert.equal(corEm(baixa, 246, 136), '#243c41');
  assert.notEqual(corEm(alta, 238, 179), cores.umida);
  assert.ok(baixa.some(m => m.cor === cores.conchaEscura && m.l === 1 && m.a === 1));
});

test('Deriva: a balsa conserva forma e posição regulamentar nas duas marés', () => {
  const fase = FASES_DERIVA_AMPLIADA[2];
  const { cores } = temaDaCosta('deriva')!;
  const baixa = quadro(fase, 'deriva', 0);
  const alta = quadro(fase, 'deriva', 3);
  assert.equal(corEm(baixa, 0, 0), cores.mar);
  // A madeira aparece apenas na parada ocupada; a boia é uma silhueta isolada do lado de fora.
  assert.equal(corEm(baixa, 216, 152), '#bb965f');
  assert.notEqual(corEm(alta, 216, 152), '#bb965f');
  assert.equal(corEm(alta, 280, 152), '#bb965f');
  const x = 336, y = 144;
  assert.equal(corEm(baixa, x + 14, y + 19), cores.umida);
  assert.equal(corEm(alta, x + 5, y + 5), cores.cantos);
  assert.ok(baixa.some(m => m.cor === cores.conchaEscura && m.l === 1 && m.a === 1));
});

test('Enseada, Deriva e as outras costas têm conchas e enfeites distintos', () => {
  const temas = (['recifes', 'mangue', 'enseada', 'deriva'] as const).map(mundo => temaDaCosta(mundo)!);
  assert.equal(new Set(temas.map(tema => JSON.stringify(tema.desenhoConcha))).size, temas.length);
  assert.equal(new Set(temas.map(tema => JSON.stringify(tema.enfeites))).size, temas.length);
});
