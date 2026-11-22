import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TODAS_AS_FASES } from '../src/fases/index.ts';
import { MUNDOS_MARE_A_MAO } from '../src/mare-a-mao/index.ts';
import { destinoPermitido, executarPasso, iniciar, lerCelula, posicoesDosSiris } from '../src/motor/index.ts';
import type { Fase } from '../src/motor/index.ts';
import { CASA_PRAIA_NATIVA, pintarCosta, temaDaCosta } from '../src/render/travessia-praia.ts';

test('Pedra é intransitável nas duas marés; areia elevada é piso transitável', () => {
  const fase: Fase = { id: 'teste-pedra-e-refugio', nome: 'Teste', objetivo: 'Teste', ensino: '',
    mapa: ['#SHC'], solucao: ['direita', 'direita'] };
  for (const passos of [0, 3]) {
    const estado = { ...iniciar(fase), passos };
    assert.equal(destinoPermitido(fase, estado, 'esquerda'), undefined);
    assert.deepEqual(executarPasso(fase, estado, 'esquerda').estado, estado);
    assert.deepEqual(destinoPermitido(fase, estado, 'direita'), { coluna: 2, linha: 0 });
    assert.equal(executarPasso(fase, estado, 'direita').estado.levadas, 0);
  }
});

test('As 231 soluções continuam válidas e nunca colocam um siri em casa de pedra', () => {
  assert.equal(TODAS_AS_FASES.length, 231);
  let refugios = 0;
  for (const fase of TODAS_AS_FASES) {
    let estado = iniciar(fase);
    for (const acao of fase.solucao) {
      estado = executarPasso(fase, estado, acao).estado;
      for (const pos of posicoesDosSiris(estado)) {
        const piso = lerCelula(fase, pos);
        assert.notEqual(piso, '#', fase.id);
        if (piso === 'H') refugios++;
      }
    }
    assert.equal(estado.situacao, 'vitoria', fase.id);
    assert.equal(estado.levadas, 0, fase.id);
  }
  assert.ok(refugios > 0, 'as soluções realmente usam os refúgios');
});

test('Refúgio de todos os mundos tem um ressalto de areia no lugar do corpo de rocha', () => {
  const n = CASA_PRAIA_NATIVA;
  const x = 240, y = 176;
  for (const mundo of MUNDOS_MARE_A_MAO) {
    const tema = temaDaCosta(mundo)!;
    for (const alta of [false, true]) {
      const pintados = new Map<string, string>();
      const ctx = {
        fillStyle: '', save() {}, restore() {}, setTransform() {},
        fillRect(px: number, py: number, l: number, a: number) {
          for (let j = Math.max(y, py); j < Math.min(y + n, py + a); j++) {
            for (let i = Math.max(x, px); i < Math.min(x + n, px + l); i++) {
              pintados.set(`${i - x},${j - y}`, this.fillStyle);
            }
          }
        },
      };
      pintarCosta({ contexto: ctx as unknown as CanvasRenderingContext2D, origemX: x, origemY: y },
        ['H'], alta, 512, 384, tema);
      // Um patamar quase da largura da casa, e não um objeto no centro.
      assert.equal(pintados.get('3,11'), tema.cores.areiaClara, mundo);
      assert.equal(pintados.get('28,11'), tema.cores.areiaClara, mundo);
      assert.equal(pintados.get('3,25'), tema.cores.areiaBorda, mundo);
      assert.equal(pintados.get('28,25'), tema.cores.areiaBorda, mundo);
      const tonsDeRocha = [tema.cores.rochaEscura, tema.cores.rochaFace, tema.cores.rochaTopo];
      assert.ok([...pintados.values()].every(tom => !tonsDeRocha.includes(tom)), mundo);
    }
  }
});
