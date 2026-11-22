import assert from 'node:assert/strict';
import { test } from 'node:test';
import { criarProgresso } from '../src/campanha/index.ts';
import { opcoesDoSeletor } from '../src/campanha/seletor.ts';
import { TODAS_AS_FASES } from '../src/fases/index.ts';
import { DIFICULDADES_MARE_A_MAO, gerarMareAMao, MUNDOS_MARE_A_MAO } from '../src/mare-a-mao/index.ts';
import { ALTURA, DENSIDADE, LARGURA } from '../src/render/index.ts';
import { obstaculosOceanicos } from '../src/render/obstaculos-oceanicos.ts';
import type { Retangulo } from '../src/render/obstaculos-oceanicos.ts';
import { CASA_PRAIA_NATIVA, pintarCosta, temaDaCosta } from '../src/render/travessia-praia.ts';

const largura = LARGURA * DENSIDADE, altura = ALTURA * DENSIDADE;
type Costa = NonNullable<ReturnType<typeof temaDaCosta>>;

function intercepta(a: Retangulo, b: Retangulo) {
  return a.x < b.x + b.largura && a.x + a.largura > b.x
    && a.y < b.y + b.altura && a.y + a.altura > b.y;
}

function conferirMapa(mapa: readonly string[], tema: Costa, id: string) {
  const w = mapa[0].length * CASA_PRAIA_NATIVA, h = mapa.length * CASA_PRAIA_NATIVA;
  const grade = { x: (largura - w) / 2, y: (altura - h) / 2, largura: w, altura: h };
  const caixas = obstaculosOceanicos(grade, largura, altura, id);
  assert.deepEqual(caixas.map(c => c.forma), ['bloco', 'seixo', 'afloramento'], id);
  caixas.forEach((caixa, i) => {
    assert.ok(caixa.x >= 2 && caixa.y >= 2 && caixa.x + caixa.largura <= largura - 2
      && caixa.y + caixa.altura <= altura - 2, id);
    assert.equal(intercepta(caixa, grade), false, id);
    for (const outra of caixas.slice(i + 1)) assert.equal(intercepta(caixa, outra), false, id);
  });
  if (id === 'praia-trilha-das-pedras') assert.ok(caixas[2].x < grade.x, id);

  for (const alta of [false, true]) {
    const coresPorEstrutura = caixas.map(() => new Set<string>());
    const coresAgua = new Set([tema.cores.mar, tema.cores.fundoOnda, tema.cores.onda,
      tema.cores.fundo, tema.cores.raso, tema.cores.beira, tema.cores.aguaClara]);
    const borda = { x: grade.x - 1, y: grade.y - 1, largura: grade.largura + 2, altura: grade.altura + 2 };
    const ctx = {
      fillStyle: '', save() {}, restore() {}, setTransform() {},
      fillRect(x: number, y: number, l: number, a: number) {
        const ret = { x, y, largura: l, altura: a };
        if (coresAgua.has(this.fillStyle) || intercepta(ret, borda)) return;
        const indice = caixas.findIndex(caixa => intercepta(caixa, ret));
        assert.notEqual(indice, -1, `${id}: estrutura fora das três caixas`);
        const caixa = caixas[indice];
        assert.ok(x >= caixa.x && y >= caixa.y && x + l <= caixa.x + caixa.largura
          && y + a <= caixa.y + caixa.altura, id);
        coresPorEstrutura[indice].add(this.fillStyle);
      },
    };
    pintarCosta({ contexto: ctx as unknown as CanvasRenderingContext2D, origemX: grade.x, origemY: grade.y },
      mapa, alta, largura, altura, tema, id);
    // Todas as caixas recebem desenho visível depois do piso e da beira.
    for (const cores of coresPorEstrutura) assert.ok(cores.size >= 3, id);
  }
}

test('As 231 travessias da campanha têm três estruturas no oceano nas duas marés', () => {
  const mundos = [...MUNDOS_MARE_A_MAO, 'praia-enseadinha'] as const;
  const vistas = new Set<string>();
  for (const mundo of mundos) {
    const tema = temaDaCosta(mundo)!;
    for (const entrada of opcoesDoSeletor({ ...criarProgresso(), mundo })) {
      const fase = TODAS_AS_FASES.find(candidata => candidata.id === entrada.id);
      if (!fase) continue;
      conferirMapa(fase.mapa, tema, fase.id);
      vistas.add(fase.id);
    }
  }
  assert.equal(vistas.size, 231);
  assert.deepEqual(new Set(TODAS_AS_FASES.map(fase => fase.id)), vistas);
});

test('Ilha de Improviso mantém as três estruturas nos oito temas, inclusive na grade 15 × 11', () => {
  for (const mundo of MUNDOS_MARE_A_MAO) {
    for (const dificuldade of DIFICULDADES_MARE_A_MAO) {
      const fase = gerarMareAMao({ mundo, dificuldade, siris: 3, garca: true, fragmento: true }, `oceano/${mundo}`);
      assert.ok(fase, `${mundo}/${dificuldade}`);
      if (dificuldade === 'Maré Feroz') {
        assert.equal(fase.mapa[0].length, 15);
        assert.equal(fase.mapa.length, 11);
      }
      conferirMapa(fase.mapa, temaDaCosta(mundo)!, fase.id);
    }
  }
});
