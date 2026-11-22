import assert from 'node:assert/strict';
import { test } from 'node:test';
import { criarProgresso } from '../src/campanha/index.ts';
import { opcoesDoSeletor } from '../src/campanha/seletor.ts';
import { TODAS_AS_FASES } from '../src/fases/index.ts';
import { DIFICULDADES_MARE_A_MAO, gerarMareAMao, MUNDOS_MARE_A_MAO } from '../src/mare-a-mao/index.ts';
import { tonsDosGraos } from '../src/render/graos-de-areia.ts';
import { pintarCosta, temaDaCosta } from '../src/render/travessia-praia.ts';

const LARGURA = 512, ALTURA = 384, CASA = 32;
type MundoDeCosta = Exclude<Parameters<typeof temaDaCosta>[0], false | 'arquipelago'>;
type Marca = Readonly<{ x: number; y: number; lado: number; cor: string }>;

function conferirGraos(mundo: MundoDeCosta, mapa: readonly string[], id: string): readonly Marca[] {
  const tema = temaDaCosta(mundo)!;
  const [claro, escuro] = tonsDosGraos(tema.cores.areia, tema.cores.barranco);
  assert.notEqual(claro, escuro, mundo);
  const origemX = (LARGURA - mapa[0].length * CASA) / 2;
  const origemY = (ALTURA - mapa.length * CASA) / 2;
  const secas = mapa.flatMap((linha, l) => [...linha].flatMap((casa, c) =>
    '#~=I'.includes(casa) ? [] : [`${c},${l}`]));
  const quadros = [false, true].map(alta => {
    const marcas: Marca[] = [];
    const ctx = {
      fillStyle: '', save() {}, restore() {}, setTransform() {},
      fillRect(x: number, y: number, l: number, a: number) {
        if (this.fillStyle !== claro && this.fillStyle !== escuro) return;
        assert.ok([x, y, l, a].every(Number.isInteger), id);
        assert.equal(l, a, id);
        assert.ok(l === 2 || l === 3, id);
        marcas.push({ x, y, lado: l, cor: this.fillStyle });
      },
    };
    pintarCosta({ contexto: ctx as unknown as CanvasRenderingContext2D, origemX, origemY },
      mapa, alta, LARGURA, ALTURA, tema);
    return marcas;
  });
  const [baixa, alta] = quadros;
  assert.deepEqual(baixa, alta, id);
  const tamanhos = new Map<string, number[]>();
  for (const { x, y, lado } of alta) {
    const coluna = Math.floor((x - origemX) / CASA), linha = Math.floor((y - origemY) / CASA);
    assert.ok(secas.includes(`${coluna},${linha}`), id);
    assert.equal(Math.floor((x - origemX + lado - 1) / CASA), coluna, id);
    assert.equal(Math.floor((y - origemY + lado - 1) / CASA), linha, id);
    const chave = `${coluna},${linha}`;
    tamanhos.set(chave, [...(tamanhos.get(chave) ?? []), lado]);
  }
  assert.equal(tamanhos.size, secas.length, id);
  for (const lados of tamanhos.values()) assert.deepEqual(lados.toSorted(), [2, 3], id);
  return baixa;
}

test('Todas as fases recebem dois quadrados escuros por casa seca, nas duas marés', () => {
  const porId = new Map(TODAS_AS_FASES.map(fase => [fase.id, fase]));
  const vistos = new Set<string>();
  for (const mundo of [...MUNDOS_MARE_A_MAO, 'praia-enseadinha'] as const) {
    for (const { id } of opcoesDoSeletor({ ...criarProgresso(), mundo })) {
      const fase = porId.get(id);
      if (!fase) continue;
      conferirGraos(mundo, fase.mapa, fase.id);
      vistos.add(fase.id);
    }
  }
  assert.equal(vistos.size, TODAS_AS_FASES.length);
  assert.deepEqual(vistos, new Set(porId.keys()));
});

test('Ilha de Improviso preserva os quadrados para os oito temas, cinco dificuldades e solos/duplas/trios', () => {
  for (const mundo of MUNDOS_MARE_A_MAO) {
    for (const dificuldade of DIFICULDADES_MARE_A_MAO) {
      for (const siris of [1, 2, 3] as const) {
        const fase = gerarMareAMao({ mundo, dificuldade, siris, garca: true, fragmento: true }, 'graos-nas-duas-mares');
        assert.ok(fase, `${mundo}/${dificuldade}/${siris}`);
        conferirGraos(mundo, fase.mapa, fase.id);
      }
    }
  }
});

test('Os dois tons são sólidos, mais escuros que a areia e variam as posições da textura', () => {
  for (const mundo of MUNDOS_MARE_A_MAO) {
    const tema = temaDaCosta(mundo)!;
    const luminosidade = (cor: string) => {
      const [r,g,b] = [1,3,5].map(i => Number.parseInt(cor.slice(i, i + 2), 16));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [claro, escuro] = tonsDosGraos(tema.cores.areia, tema.cores.barranco);
    assert.match(claro, /^#[0-9a-f]{6}$/);
    assert.match(escuro, /^#[0-9a-f]{6}$/);
    assert.ok(luminosidade(escuro) < luminosidade(claro) && luminosidade(claro) < luminosidade(tema.cores.areia));
  }
  const casas = conferirGraos('praia', ['S.H.C', '=.~#I'], 'amostra');
  const posicoes = casas.map(({ x, y }) => `${x % CASA},${y % CASA}`);
  assert.ok(new Set(posicoes).size > 2);
});
