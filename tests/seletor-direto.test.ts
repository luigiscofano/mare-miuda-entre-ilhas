import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, criarProgresso, entradasDo, mundoAtual, rotaLivre, trilhasDo, viajar } from '../src/campanha/index.ts';
import type { IdFase, Mundo, Progresso } from '../src/campanha/index.ts';
import { opcoesDoSeletor, selecionarMarco } from '../src/campanha/seletor.ts';
import { EXPANSAO } from '../src/fases/expansao/index.ts';
import { TODAS_AS_FASES } from '../src/fases/index.ts';

const MUNDOS: Mundo[] = ['praia', 'praia-enseadinha', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol'];
const CHAVE = ({ coluna, linha }: { coluna: number; linha: number }) => `${coluna},${linha}`;

test('cada entrada do catálogo aparece uma vez, sem expor a bancada', () => {
  const fases = MUNDOS.flatMap(mundo => opcoesDoSeletor({ ...criarProgresso(), mundo }).filter(o => o.fase));
  assert.equal(fases.length, 106 + EXPANSAO.length);
  assert.equal(new Set(fases.map(o => o.fase)).size, 106 + EXPANSAO.length);
  assert.deepEqual(new Set(fases.map(o => o.fase)), new Set(TODAS_AS_FASES.map(f => f.id)));
  assert.equal(fases.filter(o => o.categoria === 'regular').length, 77 + EXPANSAO.length);
  assert.equal(fases.filter(o => o.categoria === 'bonus').length, 13);
  assert.equal(fases.filter(o => o.categoria === 'chefe').length, 16);
  assert.deepEqual(opcoesDoSeletor({ ...criarProgresso(), mundo: 'arquipelago' }), []);
});

test('para todos os mundos, seleção direta e trilhas abertas têm o mesmo alcance durante a campanha', () => {
  for (const mundo of MUNDOS) {
    let p: Progresso = { ...criarProgresso(), mundo };
    for (let i = 0; i <= entradasDo(mundo).length; i++) {
      const visitados = new Set(['1,1']);
      let anterior = -1;
      while (anterior !== visitados.size) {
        anterior = visitados.size;
        for (const t of trilhasDo(mundo)) {
          if (!rotaLivre(p, t)) continue;
          const de = CHAVE(t.de), para = CHAVE(t.para);
          if (visitados.has(de) || visitados.has(para)) { visitados.add(de); visitados.add(para); }
        }
      }
      const opcoes = opcoesDoSeletor(p).filter(o => o.id !== 'embarque-cabo' && !o.depoisDe);
      for (const o of opcoes) {
        const livre = visitados.has(CHAVE(o.posicao));
        assert.equal(o.estado !== 'bloqueada', livre, o.id);
        assert.equal(Boolean(selecionarMarco(p, o.id)), livre, o.id);
      }
      const nova = opcoes.find(o => o.fase && o.estado === 'disponivel');
      if (!nova?.fase) break;
      p = concluirFase(p, nova.fase);
    }
  }
});

test('desbloqueia/rejoga sem alterar histórico e conserva dois embarques da Praia', () => {
  const p = criarProgresso();
  assert.equal(selecionarMarco(p, 'sombra-da-garca'), undefined);
  assert.equal(selecionarMarco(p, 'recife-pedra-firme'), undefined);
  assert.equal(selecionarMarco(p, 'embarque-cabo'), undefined);
  const selecionada = selecionarMarco(p, 'primeira-onda')!;
  assert.equal(selecionada.progresso.concluidas, p.concluidas);
  const aposOnda = concluirFase(selecionada.progresso, 'primeira-onda');
  assert.equal(selecionarMarco(aposOnda, 'primeira-onda')?.opcao.estado, 'concluida');
  assert.ok(selecionarMarco(aposOnda, 'sombra-da-garca'));
  const concluidas: IdFase[] = ['primeira-onda', 'sombra-da-garca', 'busca-e-volta', 'ponta-da-garca'];
  const cabo = selecionarMarco({ ...p, concluidas }, 'embarque-cabo')!;
  assert.equal(mundoAtual(viajar(cabo.progresso, cabo.opcao.destino!)), 'arquipelago');
  const portal = selecionarMarco({ ...p, concluidas }, 'ida-enseadinha')!;
  const enseadinha = viajar(portal.progresso, portal.opcao.destino!);
  assert.equal(mundoAtual(enseadinha), 'praia-enseadinha');
  assert.equal(selecionarMarco(enseadinha, 'saida-enseadinha'), undefined);
  const vitorias: IdFase[] = [...concluidas, 'praia-fio-de-areia', 'praia-pocas-espelho', 'praia-mirante'];
  assert.ok(selecionarMarco({ ...enseadinha, concluidas: vitorias }, 'saida-enseadinha'));
});
