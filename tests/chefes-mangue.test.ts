import assert from 'node:assert/strict';
import { test } from 'node:test';
import { abriuEnseada, concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { GUARDIAO_DA_RAIZ, DUPLA_NO_MANGUE } from '../src/fases/chefes-mangue.ts';
import { alvoDaGarca, DIRECOES, executarPasso, iniciar, lerCelula, portaoLiberado, siriAtivo } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });
const acoes = [...DIRECOES, 'trocar'] as const;
const mdc = (a: number, b: number): number => b ? mdc(b, a % b) : a;

function analisar(fase: Fase, recuperar = false, imovel?: number) {
  const prazo = fase.ameaca?.primeiroAtaque ?? 0;
  const periodo = (fase.ameaca?.periodo ?? 1) * (1 + (fase.ameaca?.rota?.length ?? 0));
  const ciclo = 6 * periodo / mdc(6, periodo);
  const chave = (s: Estado) => JSON.stringify([s.posicao, s.dupla?.posicao, siriAtivo(s), s.levadas,
    s.passos < prazo ? s.passos : prazo + (s.passos - prazo) % ciclo,
    ...(recuperar ? [s.ultimoFirme, s.dupla?.ultimoFirme, s.situacao] : [])]);
  const filas: Estado[][] = [[iniciar(fase)]];
  const vistos = new Map<string, Estado>();
  const vemDe = new Map<string, Set<string>>();
  const vitorias: string[] = [];
  for (let i = 0; i < filas.length; i++) {
    for (const estado of filas[i]) {
      const id = chave(estado);
      if (vistos.has(id)) continue;
      vistos.set(id, estado);
      if (estado.situacao === 'vitoria') {
        if (!recuperar) return { passos: i };
        vitorias.push(id);
        continue;
      }
      for (const acao of acoes) {
        if (acao !== 'trocar' && siriAtivo(estado) === imovel) continue;
        const novo = executarPasso(fase, estado, acao).estado;
        if (novo === estado || novo.situacao === 'derrota' || !recuperar && novo.levadas) continue;
        (filas[novo.passos] ??= []).push(novo);
        if (recuperar) {
          const seguinte = chave(novo);
          if (!vemDe.has(seguinte)) vemDe.set(seguinte, new Set());
          vemDe.get(seguinte)!.add(id);
        }
      }
    }
    filas[i] = [];
  }
  if (!recuperar) return {};
  // Chegue a todos os estados que podem terminar. Ficar em baixio prestes a
  // inundar é um erro recuperável; não pode encurralar a dupla em piso firme.
  const comRota = new Set(vitorias);
  for (const id of vitorias) for (const anterior of vemDe.get(id) ?? []) {
    if (!comRota.has(anterior)) { comRota.add(anterior); vitorias.push(anterior); }
  }
  const firmesSemRota = [...vistos].filter(([id, s]) => !comRota.has(id)
    && [s.posicao, s.dupla!.posicao].every(pos => !['=', 'D'].includes(lerCelula(fase, pos)!)));
  return { estados: vistos.size, firmesSemRota: firmesSemRota.length };
}

test('os dois chefes usam os dois siris e a patrulha altera a melhor rota', () => {
  for (const [fase, passos] of [[GUARDIAO_DA_RAIZ, 28], [DUPLA_NO_MANGUE, 34]] as const) {
    assert.ok(validarSolucao(fase));
    assert.equal(analisar(fase).passos, passos);
    for (const siri of [0, 1]) assert.equal(analisar(fase, false, siri).passos, undefined);
  }
  assert.equal(analisar({ ...DUPLA_NO_MANGUE, ameaca: undefined }).passos, 32);
});

test('cada raiz responde só à placa correspondente; a garça acerta o parceiro parado', () => {
  const raiz = GUARDIAO_DA_RAIZ;
  const [primeiro, segundo] = raiz.portoesVinculados;
  assert.ok(portaoLiberado(raiz, primeiro.portao, [primeiro.placa]));
  assert.ok(!portaoLiberado(raiz, segundo.portao, [primeiro.placa]));
  assert.ok(portaoLiberado(raiz, segundo.portao, [segundo.placa]));
  assert.ok(!portaoLiberado(raiz, primeiro.portao, [segundo.placa]));
  for (const alvo of raiz.portoesVinculados) {
    const portoesVinculados = raiz.portoesVinculados.filter(item => item !== alvo);
    assert.equal(analisar({ ...raiz, portoesVinculados }).passos, undefined);
  }
  const fase = DUPLA_NO_MANGUE;
  const r = { R: 'direita', X: 'trocar' } as const;
  const antes = reproduzir(fase, [...'XRRRRRRRXRRR'].map(k => r[k as keyof typeof r]));
  assert.equal(antes.passos, 10);
  assert.equal(siriAtivo(antes), 0);
  assert.deepEqual(alvoDaGarca(fase.ameaca, 11), antes.dupla?.posicao);
  const errou = executarPasso(fase, antes, 'esquerda');
  assert.deepEqual(errou.eventos, [{ tipo: 'levada', motivos: ['garca'] }]);
  assert.equal(errou.estado.levadas, 1);
  assert.equal(errou.estado.passos, 11);
  assert.equal(analisar({ ...fase, mapa: fase.mapa.map(linha => linha.replace('P', '.')) }).passos, undefined);
});

test('nenhum estado alcançado em piso firme exige perder outra vez ou reiniciar', () => {
  assert.deepEqual(analisar(GUARDIAO_DA_RAIZ, true), { estados: 4272, firmesSemRota: 0 });
  assert.deepEqual(analisar(DUPLA_NO_MANGUE, true), { estados: 8723, firmesSemRota: 0 });
});

test('as arenas salvam conclusão, retornam ao marco e não bloqueiam a Enseada', () => {
  const historico: Progresso = { mundo: 'mangue', posicao: p(6, 1), viuTutorial: true,
    concluidas: ['recife-retorno', 'mangue-dois-encontros', 'mangue-placa'] };
  assert.strictEqual(moverNoMapa(historico, 'direita').progresso, historico);
  const legado = concluirFase(historico, 'mangue-reuniao');
  assert.ok(abriuEnseada(legado));
  const raiz = moverNoMapa(legado, 'direita').progresso;
  assert.equal(entradaEm(raiz.posicao, 'mangue')?.id, GUARDIAO_DA_RAIZ.id);
  assert.strictEqual(moverNoMapa(raiz, 'baixo').progresso, raiz);
  const duelo = moverNoMapa(concluirFase(raiz, GUARDIAO_DA_RAIZ.id), 'baixo').progresso;
  assert.equal(entradaEm(duelo.posicao, 'mangue')?.id, DUPLA_NO_MANGUE.id);
  assert.deepEqual(moverNoMapa(duelo, 'cima').progresso.posicao, raiz.posicao);
  assert.equal(totalDeFasesRegulares('mangue'), 10);
  let bruto = '';
  const storage = { getItem: () => bruto, setItem: (_: string, valor: string) => { bruto = valor; } };
  const save = { progresso: concluirFase(duelo, DUPLA_NO_MANGUE.id), audio: { musica: 0, efeitos: 0 } };
  assert.ok(salvar(storage, save));
  assert.deepEqual(carregar(storage), save);
});
