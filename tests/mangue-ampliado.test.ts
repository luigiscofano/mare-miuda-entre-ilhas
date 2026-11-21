import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  abriuEnseada, concluirFase, entradaEm, moverNoMapa, nosDo, saidaEm, totalDeFasesRegulares, trilhasDo, viajar,
} from '../src/campanha/index.ts';
import type { IdFase, Progresso } from '../src/campanha/index.ts';
import { FASES_MANGUE, TODAS_AS_FASES } from '../src/fases/index.ts';
import { FASES_MANGUE_AMPLIADO } from '../src/fases/mangue-ampliado.ts';
import { DIRECOES, executarPasso, iniciar, mesmaCasa } from '../src/motor/index.ts';
import type { Acao, Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const legado = ['mangue-dois-encontros', 'mangue-placa', 'mangue-reuniao'] as const;
const ponto = (coluna: number, linha: number) => ({ coluna, linha });
const cais = ponto(1, 1);
const acoes: readonly Acao[] = [...DIRECOES, 'trocar'];

function existeVitoria(
  fase: Fase, maxTrocas?: number, imovel?: 'principal' | 'parceiro',
): boolean {
  const fila: { estado: Estado; trocas: number }[] = [{ estado: iniciar(fase), trocas: 0 }];
  const vistos = new Set<string>();
  for (const { estado, trocas } of fila) {
    if (estado.situacao === 'vitoria') return true;
    const ativo = estado.dupla?.parceiroAtivo ? 'parceiro' : 'principal';
    for (const acao of acoes) {
      if (acao === 'trocar' ? maxTrocas !== undefined && trocas >= maxTrocas : ativo === imovel) continue;
      const proximo = executarPasso(fase, estado, acao).estado;
      if (proximo === estado || proximo.levadas > 0) continue;
      const { passos, ultimoFirme: _firme, dupla, fragmentos, ...resto } = proximo;
      const novasTrocas = trocas + Number(acao === 'trocar');
      // Só buscamos vitórias sem levada, então o ponto de retorno não distingue estados.
      const chave = JSON.stringify([passos % 6, maxTrocas === undefined ? 0 : novasTrocas, resto, dupla?.posicao,
        dupla?.parceiroAtivo, fragmentos.map(p => p.linha * fase.mapa[0].length + p.coluna).sort()]);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      fila.push({ estado: proximo, trocas: novasTrocas });
    }
  }
  return false;
}

test('as dez travessias do Mangue são regulares e as 52 rotas de campanha vencem sem levadas', () => {
  assert.equal(FASES_MANGUE.length, 10);
  assert.equal(totalDeFasesRegulares('mangue'), 10);
  assert.equal(TODAS_AS_FASES.length, 52);
  for (const fase of TODAS_AS_FASES) assert.ok(validarSolucao(fase), fase.id);
  assert.deepEqual(FASES_MANGUE_AMPLIADO.map(f => f.solucao.filter(a => a !== 'trocar').length),
    [6, 10, 11, 12, 15, 17, 22]);
  for (const fase of FASES_MANGUE_AMPLIADO) {
    assert.ok(!existeVitoria(fase, undefined, 'principal'), fase.id);
    assert.ok(!existeVitoria(fase, undefined, 'parceiro'), fase.id);
  }
});

test('trocar não avança a maré e deixar o siri inativo no baixio causa uma só levada', () => {
  const fase = FASES_MANGUE_AMPLIADO[1];
  const primeira = reproduzir(fase, ['direita']);
  const troca = executarPasso(fase, primeira, 'trocar');
  assert.equal(troca.estado.passos, primeira.passos);
  assert.deepEqual(troca.eventos, [{ tipo: 'troca' }]);
  const segundo = executarPasso(fase, troca.estado, 'direita').estado;
  const terceiro = executarPasso(fase, segundo, 'direita');
  assert.equal(terceiro.estado.levadas, 1);
  assert.deepEqual(terceiro.estado.posicao, iniciar(fase).posicao);
  assert.deepEqual(terceiro.estado.dupla?.posicao, iniciar(fase).dupla?.posicao);
  assert.ok(terceiro.eventos.some(e => e.tipo === 'virada' && e.alta));
});

test('as portas exigem placa, e os dois encontros finais pedem revezamento', () => {
  const trinco = FASES_MANGUE_AMPLIADO[2];
  const antePorta = reproduzir(trinco, ['direita', 'direita']);
  assert.strictEqual(executarPasso(trinco, antePorta, 'direita').estado, antePorta);
  for (const [fase, trocas] of [[FASES_MANGUE_AMPLIADO[5], 2], [FASES_MANGUE_AMPLIADO[6], 3]] as const) {
    assert.equal(existeVitoria(fase, trocas), false);
    const portaoFechado = { ...fase, mapa: fase.mapa.map(linha => linha.replaceAll('D', '#')) };
    assert.equal(existeVitoria(portaoFechado), false);
  }
});

test('as duas rotas do seletor preservam o save e deixam a Enseada independente do ramo', () => {
  let progresso: Progresso = { mundo: 'mangue', posicao: cais, concluidas: ['recife-retorno'], viuTutorial: true };
  for (const id of legado) {
    progresso = moverNoMapa(progresso, 'direita').progresso;
    assert.equal(entradaEm(progresso.posicao, 'mangue')?.id, id);
    progresso = concluirFase(progresso, id);
  }
  assert.ok(abriuEnseada(progresso));
  const retorno = moverNoMapa(progresso, 'baixo').progresso;
  assert.deepEqual(retorno.posicao, cais);
  assert.deepEqual(viajar(retorno, 'arquipelago').posicao, ponto(5, 3));
  const comandos = ['cima', 'direita', 'direita', 'direita', 'baixo', 'baixo', 'esquerda'] as const;
  let ramo = moverNoMapa(retorno, 'direita').progresso;
  for (const [i, direcao] of comandos.entries()) {
    ramo = moverNoMapa(ramo, direcao).progresso;
    const id = FASES_MANGUE_AMPLIADO[i].id;
    assert.equal(entradaEm(ramo.posicao, 'mangue')?.id, id);
    ramo = concluirFase(ramo, id);
  }
  assert.equal(nosDo('mangue').length, 11);
  for (const t of trilhasDo('mangue')) {
    assert.deepEqual(moverNoMapa({ ...ramo, posicao: t.de }, t.ida).progresso.posicao, t.para);
    assert.deepEqual(moverNoMapa({ ...ramo, posicao: t.para }, t.volta).progresso.posicao, t.de);
  }
  for (const posicao of nosDo('mangue')) {
    for (const direcao of DIRECOES) {
      const opcoes = trilhasDo('mangue').filter(t => mesmaCasa(t.de, posicao) && t.ida === direcao
        || mesmaCasa(t.para, posicao) && t.volta === direcao);
      assert.equal(opcoes.length, Number(saidaEm({ ...ramo, posicao }, direcao) !== undefined));
    }
  }
  let bruto = '';
  const storage = { setItem: (_: string, dados: string) => { bruto = dados; }, getItem: () => bruto };
  for (const p of [progresso, ramo]) {
    const save = { progresso: p, audio: { musica: 0, efeitos: 0 } };
    assert.ok(salvar(storage, save));
    assert.deepEqual(carregar(storage), save);
  }
});
