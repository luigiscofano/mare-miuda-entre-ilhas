import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FASES_GRUTAS_AMPLIADAS } from '../src/fases/grutas-ampliadas.ts';
import { GUARDIAO_FAROL } from '../src/fases/guardiao-farol.ts';
import { RESSACA_ALTA } from '../src/fases/ressaca-alta.ts';
import { executarPasso, iniciar } from '../src/motor/index.ts';
import type { Fase } from '../src/motor/index.ts';
import { desenhar } from '../src/render/index.ts';
import { usaTravessiaPraia, temaDaCosta } from '../src/render/travessia-praia.ts';

type Marca = Readonly<{ x: number; y: number; l: number; a: number; cor: string }>;

function quadro(fase: Fase, mundo: 'grutas' | 'ressaca' | 'farol', passos: number): Marca[] {
  let estado = iniciar(fase);
  for (const acao of fase.solucao) {
    if (estado.passos === passos) break;
    estado = executarPasso(fase, estado, acao).estado;
  }
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

test('Grutas: a pérola e a concha continuam distintas da rocha e dos dois estados da maré', () => {
  const baixa = quadro(FASES_GRUTAS_AMPLIADAS[1], 'grutas', 0);
  const alta = quadro(FASES_GRUTAS_AMPLIADAS[1], 'grutas', 3);
  const { cores } = temaDaCosta('grutas')!;
  assert.equal(corEm(baixa, 0, 0), cores.mar);
  assert.equal(corEm(baixa, 136, 136), '#fff5dc');
  assert.notEqual(corEm(alta, 136, 136), '#fff5dc');
  assert.equal(corEm(baixa, 206, 179), cores.umida);
  assert.equal(corEm(alta, 197, 165), cores.cantos);
  assert.ok(baixa.some(m => m.cor === cores.conchaEscura && m.l === 1 && m.a === 1));
});

test('Ressaca: a espuma decorativa não persiste como faixa após o ataque', () => {
  const previsao = quadro(RESSACA_ALTA, 'ressaca', 2);
  const alta = quadro(RESSACA_ALTA, 'ressaca', 3);
  const { cores } = temaDaCosta('ressaca')!;
  assert.equal(corEm(previsao, 0, 0), cores.mar);
  assert.equal(corEm(previsao, 48, 129), '#fff0d6');
  assert.notEqual(corEm(alta, 48, 129), '#fff0d6');
  assert.equal(corEm(alta, 293, 117), cores.cantos);
  assert.ok(alta.some(m => m.cor === cores.conchaEscura && m.l === 1 && m.a === 1));
});

test('Farol: a barra da ponte acesa apaga, deixando só pontos no azul', () => {
  const antes = quadro(GUARDIAO_FAROL, 'farol', 0);
  const escuro = quadro(GUARDIAO_FAROL, 'farol', 6);
  const { cores } = temaDaCosta('farol')!;
  assert.equal(corEm(antes, 0, 0), cores.mar);
  assert.equal(corEm(antes, 196, 108), '#fff1d2');
  assert.notEqual(corEm(escuro, 196, 108), '#fff1d2');
  assert.equal(corEm(escuro, 200, 112), '#32747a');
  assert.ok(antes.some(m => m.cor === cores.conchaEscura && m.l === 1 && m.a === 1));
});

test('As oito travessias têm paletas próprias e a Praia conserva a seleção anterior', () => {
  const temas = (['praia', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'] as const)
    .map(mundo => temaDaCosta(mundo)!);
  assert.equal(new Set(temas.map(tema => tema.cores.mar)).size, 8);
  assert.equal(new Set(temas.map(tema => JSON.stringify(tema.desenhoConcha))).size, 8);
  assert.ok(usaTravessiaPraia('praia'));
  assert.equal(temaDaCosta('praia'), temaDaCosta('praia-enseadinha'));
  assert.equal(temaDaCosta(false), undefined);
  assert.equal(temaDaCosta('arquipelago'), undefined);
});
