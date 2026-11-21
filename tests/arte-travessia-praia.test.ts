import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FASES } from '../src/fases/index.ts';
import { executarPasso, iniciar } from '../src/motor/index.ts';
import { desenhar } from '../src/render/index.ts';
import { CORES_PRAIA, usaTravessiaPraia } from '../src/render/travessia-praia.ts';

type Marca = Readonly<{ x: number; y: number; l: number; a: number; cor: string }>;

function registrarRender(mundo: Parameters<typeof desenhar>[4], alta = false): Marca[] {
  const marcas: Marca[] = [];
  let escala = 2;
  const pilha: number[] = [];
  const contexto = {
    fillStyle: '',
    imageSmoothingEnabled: true,
    save() { pilha.push(escala); },
    restore() { escala = pilha.pop()!; },
    setTransform(densidade: number) { escala = densidade; },
    fillRect(x: number, y: number, l: number, a: number) {
      const medidas = [x, y, l, a].map(n => n * escala);
      assert.ok(medidas.every(Number.isInteger));
      assert.match(this.fillStyle, /^#[a-f0-9]{6}$/i);
      marcas.push({ x: medidas[0], y: medidas[1], l: medidas[2], a: medidas[3], cor: this.fillStyle });
    },
  };
  const fase = FASES[0];
  let estado = iniciar(fase);
  if (alta) {
    // A rota é a mesma do tutorial: entrar, sair do baixio e alcançar a concha.
    for (let passo = 0; passo < 3; passo++) estado = executarPasso(fase, estado, 'direita').estado;
    assert.equal(estado.situacao, 'vitoria');
  }
  desenhar(contexto as unknown as CanvasRenderingContext2D, fase, estado, { complete: false } as HTMLImageElement, mundo);
  assert.equal(contexto.imageSmoothingEnabled, false);
  assert.equal(pilha.length, 0);
  return marcas;
}

function corEm(marcas: Marca[], x: number, y: number): string | undefined {
  return marcas.findLast(m => x >= m.x && x < m.x + m.l && y >= m.y && y < m.y + m.a)?.cor;
}

test('A travessia da Praia usa a paleta V32 só no Cabo Baixo e na Enseadinha', () => {
  const temPraia = (marcas: Marca[]) => marcas[0].cor === CORES_PRAIA.mar;
  assert.ok(usaTravessiaPraia('praia') && usaTravessiaPraia('praia-enseadinha'));
  assert.ok(temPraia(registrarRender('praia')));
  assert.ok(temPraia(registrarRender('praia-enseadinha')));
  assert.ok(!temPraia(registrarRender('recifes')));
  assert.ok(!temPraia(registrarRender(false)));
});

test('Baixio da Praia tem areia molhada na baixa e cantos de 1 px nativo na alta', () => {
  const baixa = registrarRender('praia');
  const alta = registrarRender('praia', true);
  assert.equal(corEm(baixa, 238, 179), CORES_PRAIA.umida);
  assert.equal(corEm(alta, 229, 165), CORES_PRAIA.cantos);
  assert.equal(corEm(alta, 250, 165), CORES_PRAIA.cantos);
  assert.equal(corEm(alta, 229, 186), CORES_PRAIA.cantos);
  assert.equal(corEm(alta, 250, 186), CORES_PRAIA.cantos);
  assert.notEqual(corEm(alta, 238, 179), CORES_PRAIA.umida);
  assert.notEqual(corEm(alta, 230, 166), CORES_PRAIA.cantos);
  assert.equal(corEm(alta, 255, 165), CORES_PRAIA.aguaClara);
  assert.ok(baixa.some(marca => marca.cor === CORES_PRAIA.conchaEscura && marca.l === 1 && marca.a === 1));
});
