import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  concluirFase, entradaEm, moverNoMapa, nosDo, saidaEm, totalDeFasesRegulares, trilhasDo, viajar,
} from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { FASES_GRUTAS_AMPLIADAS } from '../src/fases/grutas-ampliadas.ts';
import { TODAS_AS_FASES } from '../src/fases/index.ts';
import { DIRECOES, executarPasso, iniciar, mesmaCasa } from '../src/motor/index.ts';
import type { Acao, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { validarSolucao } from '../src/validacao/index.ts';

const ponto = (coluna: number, linha: number) => ({ coluna, linha });
const legado = ['grutas-encaixe', 'grutas-ordem', 'grutas-retorno', 'grutas-dupla-portao', 'grutas-dupla-camaras'] as const;

function existeVitoriaSemLevadas(fase: Fase, comTroca = true): boolean {
  const acoes: readonly Acao[] = fase.dupla && comTroca ? [...DIRECOES, 'trocar'] : DIRECOES;
  const fila = [iniciar(fase)];
  const vistos = new Set<string>();
  for (const estado of fila) {
    if (estado.situacao === 'vitoria') return true;
    for (const acao of acoes) {
      const proximo = executarPasso(fase, estado, acao).estado;
      if (proximo === estado || proximo.levadas) continue;
      // Sem levadas, basta reter o ciclo da maré e o que muda as possibilidades da próxima ação.
      const chave = JSON.stringify([proximo.passos % 6, proximo.posicao, proximo.dupla?.posicao,
        proximo.dupla?.parceiroAtivo, proximo.etapaGruta, proximo.portadorGruta,
        proximo.fragmentos.map(p => p.linha * fase.mapa[0].length + p.coluna).sort()]);
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      fila.push(proximo);
    }
  }
  return false;
}

test('as Grutas têm dez regulares e a campanha tem 71 soluções sem levadas', () => {
  assert.equal(totalDeFasesRegulares('grutas'), 10);
  assert.equal(FASES_GRUTAS_AMPLIADAS.filter(f => 'dupla' in f).length, 3);
  assert.equal(TODAS_AS_FASES.length, 71);
  for (const fase of TODAS_AS_FASES) assert.ok(validarSolucao(fase), fase.id);
});

test('as cinco travessias dependem de cada etapa e os três resgates exigem troca', () => {
  for (const fase of FASES_GRUTAS_AMPLIADAS) {
    for (const etapa of fase.etapasGruta) {
      const mapa = fase.mapa.map(linha => linha.replaceAll(etapa, '.'));
      assert.equal(existeVitoriaSemLevadas({ ...fase, mapa }), false, fase.id + ' sem ' + etapa);
    }
    if ('dupla' in fase) {
      const semPlaca = fase.mapa.map(linha => linha.replaceAll('P', '.'));
      assert.equal(existeVitoriaSemLevadas({ ...fase, mapa: semPlaca }), false, fase.id + ' sem placa');
      assert.equal(existeVitoriaSemLevadas(fase, false), false, fase.id + ' sem troca');
    }
  }
});

test('coral e verde se alternam como portadores; o mesmo siri faz coleta e entrega', () => {
  const portadoresEsperados = ['principal', 'parceiro', 'principal'];
  for (const [i, fase] of FASES_GRUTAS_AMPLIADAS.slice(2).entries()) {
    let estado = iniciar(fase);
    const autores = new Map<string, string>();
    for (const acao of fase.solucao) {
      const autor = estado.dupla?.parceiroAtivo ? 'parceiro' : 'principal';
      const resultado = executarPasso(fase, estado, acao);
      for (const evento of resultado.eventos) {
        if (evento.tipo === 'gruta-avancou') autores.set(evento.etapa, autor);
      }
      estado = resultado.estado;
    }
    assert.equal(autores.get('K'), portadoresEsperados[i]);
    assert.equal(autores.get('E'), autores.get('K'));
    if (autores.has('F')) assert.notEqual(autores.get('F'), autores.get('E'));
    assert.equal(estado.situacao, 'vitoria');
    assert.equal(estado.levadas, 0);
  }
});

test('os novos marcos persistem, e a rota antiga basta para chegar à Baía', () => {
  let p: Progresso = { mundo: 'grutas', posicao: ponto(1, 1), viuTutorial: true, concluidas: [] };
  for (const id of legado) {
    p = moverNoMapa(p, 'direita').progresso;
    assert.equal(entradaEm(p.posicao, 'grutas')?.id, id);
    p = concluirFase(p, id);
  }
  const porto = moverNoMapa(p, 'baixo').progresso;
  const arquipelago = viajar(porto, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'direita').progresso, 'ressaca').mundo, 'ressaca');

  let ramo: Progresso = { ...p, posicao: ponto(2, 1) };
  const direcoes = ['cima', 'direita', 'direita', 'direita', 'direita'] as const;
  for (const [i, direcao] of direcoes.entries()) {
    ramo = moverNoMapa(ramo, direcao).progresso;
    const id = FASES_GRUTAS_AMPLIADAS[i].id;
    assert.equal(entradaEm(ramo.posicao, 'grutas')?.id, id);
    ramo = concluirFase(ramo, id);
  }
  assert.equal(nosDo('grutas').length, 11);
  const trilhas = trilhasDo('grutas');
  for (const t of trilhas) {
    assert.deepEqual(moverNoMapa({ ...ramo, posicao: t.de }, t.ida).progresso.posicao, t.para);
    assert.deepEqual(moverNoMapa({ ...ramo, posicao: t.para }, t.volta).progresso.posicao, t.de);
  }
  for (const posicao of nosDo('grutas')) {
    for (const direcao of DIRECOES) {
      const opcoes = trilhas.filter(t => mesmaCasa(t.de, posicao) && t.ida === direcao
        || mesmaCasa(t.para, posicao) && t.volta === direcao);
      assert.equal(opcoes.length, Number(saidaEm({ ...ramo, posicao }, direcao) !== undefined));
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
