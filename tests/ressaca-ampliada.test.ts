import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, nosDo, totalDeFasesRegulares, trilhasDo, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { FASES_RESSACA_AMPLIADA } from '../src/fases/ressaca-ampliada.ts';
import { DIRECOES, executarPasso, iniciar, mesmaCasa } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const ponto = (coluna: number, linha: number) => ({ coluna, linha });

function menorRotaSemLevadas(fase: Fase, podeTrocar = true): number | undefined {
  const acoes: readonly Acao[] = fase.dupla && podeTrocar ? [...DIRECOES, 'trocar'] : DIRECOES;
  const porPassos: Estado[][] = [[iniciar(fase)]];
  const vistos = new Set<string>();
  for (const fila of porPassos) {
    for (const estado of fila) {
      // Uma troca entra na fila do mesmo passo; assim, ela nunca pesa no orçamento.
      const chave = JSON.stringify([estado.posicao, estado.dupla?.posicao, estado.dupla?.parceiroAtivo,
        estado.passos % 6, estado.fragmentos.map(p => p.linha * fase.mapa[0].length + p.coluna).sort()]);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      if (estado.situacao === 'vitoria') return estado.passos;
      for (const acao of acoes) {
        const proximo = executarPasso(fase, estado, acao).estado;
        if (proximo !== estado && !proximo.levadas && proximo.situacao !== 'derrota') {
          (porPassos[proximo.passos] ??= []).push(proximo);
        }
      }
    }
  }
}

test('as oito novas travessias passam sem levadas e dependem das balsas, da troca e da placa onde aplicável', () => {
  for (const fase of FASES_RESSACA_AMPLIADA) {
    assert.ok(validarSolucao(fase), fase.id);
    if ('balsas' in fase) {
      for (const balsa of fase.balsas) {
        const balsas = fase.balsas.filter(outra => outra !== balsa);
        assert.equal(menorRotaSemLevadas({ ...fase, balsas }), undefined, fase.id);
      }
    }
    if ('dupla' in fase) {
      const mapa = fase.mapa.map(linha => linha.replaceAll('P', '.'));
      assert.equal(menorRotaSemLevadas({ ...fase, mapa }), undefined, fase.id);
      assert.equal(menorRotaSemLevadas(fase, false), undefined, fase.id);
    }
  }
});

test('as duas travessias das moedas têm orçamento justo e encerram somente se faltar objetivo', () => {
  for (const fase of FASES_RESSACA_AMPLIADA) {
    if (!('orcamentoMoedas' in fase)) continue;
    assert.equal(menorRotaSemLevadas({ ...fase, orcamentoMoedas: undefined }), fase.orcamentoMoedas);
    assert.equal(menorRotaSemLevadas({ ...fase, orcamentoMoedas: fase.orcamentoMoedas - 1 }), undefined);
    const venceu = reproduzir(fase, fase.solucao);
    assert.equal(venceu.passos, fase.orcamentoMoedas);
    assert.equal(venceu.fragmentos.length, 3);
    assert.equal(venceu.situacao, 'vitoria');

    const estadoAntes = reproduzir(fase, fase.solucao.slice(0, -1));
    const virouUltimoPasso = executarPasso({ ...fase, orcamentoMoedas: fase.orcamentoMoedas - 1 },
      reproduzir(fase, fase.solucao.slice(0, -2)), fase.solucao.at(-2)!);
    assert.equal(virouUltimoPasso.estado.situacao, 'derrota');
    assert.ok(virouUltimoPasso.eventos.some(evento => evento.tipo === 'orcamento-esgotado'));
    assert.equal(estadoAntes.situacao, 'jogando');
    assert.equal(iniciar(fase).fragmentos.length, 0);
  }
});

test('o ramo retorna em todas as direções, persiste no save e não bloqueia o Farol', () => {
  let p: Progresso = { mundo: 'ressaca', posicao: ponto(1, 1), viuTutorial: true, concluidas: [] };
  for (const id of ['ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros'] as const) {
    p = moverNoMapa(p, 'direita').progresso;
    assert.equal(entradaEm(p.posicao, 'ressaca')?.id, id);
    p = concluirFase(p, id);
  }
  const arquipelago = viajar(moverNoMapa(p, 'baixo').progresso, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'cima').progresso, 'farol').mundo, 'farol');

  let ramo = moverNoMapa(p, 'esquerda').progresso;
  for (const [i, direcao] of (['cima', 'direita', 'direita', 'direita', 'direita', 'direita', 'baixo', 'esquerda'] as const).entries()) {
    ramo = moverNoMapa(ramo, direcao).progresso;
    const id = FASES_RESSACA_AMPLIADA[i].id;
    assert.equal(entradaEm(ramo.posicao, 'ressaca')?.id, id);
    ramo = concluirFase(ramo, id);
  }
  assert.equal(totalDeFasesRegulares('ressaca'), 10);
  assert.equal(nosDo('ressaca').length, 12);
  const trilhas = trilhasDo('ressaca');
  for (const t of trilhas) {
    assert.deepEqual(moverNoMapa({ ...ramo, posicao: t.de }, t.ida).progresso.posicao, t.para);
    assert.deepEqual(moverNoMapa({ ...ramo, posicao: t.para }, t.volta).progresso.posicao, t.de);
  }
  for (const posicao of nosDo('ressaca')) {
    for (const direcao of DIRECOES) {
      const opcoes = trilhas.filter(t => mesmaCasa(t.de, posicao) && t.ida === direcao
        || mesmaCasa(t.para, posicao) && t.volta === direcao);
      assert.ok(opcoes.length <= 1);
    }
  }
  let bruto = '';
  const storage = { setItem: (_: string, dados: string) => { bruto = dados; }, getItem: () => bruto };
  for (const progresso of [p, ramo]) {
    const save = { progresso, audio: { musica: 0, efeitos: 0 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
