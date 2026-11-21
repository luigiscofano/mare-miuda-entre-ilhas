import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FASES_MANGUE_AMPLIADO } from '../src/fases/mangue-ampliado.ts';
import { FASES_RECIFES_AMPLIADOS } from '../src/fases/recifes-ampliados.ts';
import { executarPasso, iniciar } from '../src/motor/index.ts';
import type { Fase } from '../src/motor/index.ts';
import { desenhar } from '../src/render/index.ts';
import { temaDaCosta } from '../src/render/travessia-praia.ts';

type Marca = Readonly<{ x: number; y: number; l: number; a: number; cor: string }>;

function quadro(fase: Fase, mundo: 'recifes' | 'mangue', alta: boolean): Marca[] {
  let estado = iniciar(fase);
  if (alta) {
    for (const acao of fase.solucao.slice(0, 3)) estado = executarPasso(fase, estado, acao).estado;
    assert.equal(estado.passos, 3);
    assert.equal(estado.levadas, 0);
  }
  const marcas: Marca[] = [];
  const pilha: number[] = [];
  let escala = 2;
  const ctx = {
    fillStyle: '',
    imageSmoothingEnabled: true,
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

for (const [mundo, fase] of [['recifes', FASES_RECIFES_AMPLIADOS[0]], ['mangue', FASES_MANGUE_AMPLIADO[1]]] as const) {
  test(`Travessia de ${mundo}: mar, concha e avisos de maré funcionam em pixels nativos`, () => {
    const tema = temaDaCosta(mundo)!;
    const baixa = quadro(fase, mundo, false);
    const alta = quadro(fase, mundo, true);
    assert.equal(corEm(baixa, 0, 0), tema.cores.mar);
    assert.equal(corEm(baixa, 222, 163), tema.cores.umida);
    assert.notEqual(corEm(alta, 222, 163), tema.cores.umida);
    for (const [x, y] of [[213, 149], [234, 149], [213, 170], [234, 170]]) {
      assert.equal(corEm(alta, x, y), tema.cores.cantos);
    }
    assert.notEqual(corEm(alta, 214, 150), tema.cores.cantos);
    assert.ok(baixa.some(m => m.cor === tema.cores.conchaEscura && m.a === 1 && m.l === 1));
    assert.ok(baixa.some(m => m.cor === tema.cores.espuma));
  });
}

test('Recifes e Mangue contêm conchas e enfeites próprios, sem trocar a arte de outros mundos', () => {
  const recifes = temaDaCosta('recifes')!;
  const mangue = temaDaCosta('mangue')!;
  assert.notDeepEqual(recifes.desenhoConcha, mangue.desenhoConcha);
  assert.notDeepEqual(recifes.enfeites, mangue.enfeites);
  assert.notEqual(recifes.cores.mar, mangue.cores.mar);
  for (const mundo of [false, 'arquipelago', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'] as const) {
    assert.equal(temaDaCosta(mundo), undefined);
  }
});
