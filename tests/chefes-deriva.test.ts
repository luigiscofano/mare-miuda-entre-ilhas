import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { MESTRE_DAS_CORRENTES, PASSAGEM_DAS_BALSAS } from '../src/fases/chefes-deriva.ts';
import { DIRECOES, executarPasso, iniciar, jogadorAtivo, mareAlta, mesmaCasa, posicoesDosSiris, siriAtivo } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });
const fases = [MESTRE_DAS_CORRENTES, PASSAGEM_DAS_BALSAS] as const;
const filaSolo = DIRECOES;
const filaDupla = [...DIRECOES, 'trocar'] as const;
type ModoDeBusca = 'minimo' | 'sem-carona' | 'recuperacao';

function acharEstados(fase: Fase, modo: ModoDeBusca) {
  const verificarVolta = modo === 'recuperacao';
  const acoes = fase.dupla ? filaDupla : filaSolo;
  const chave = (s: Estado) => JSON.stringify([s.posicao, s.dupla?.posicao, siriAtivo(s),
    s.passos % 6, s.ancoradouros?.map(pos => pos.linha).sort(), s.levadas, s.situacao,
    ...(verificarVolta ? [s.ultimoFirme, s.dupla?.ultimoFirme] : [])]);
  // A troca custa zero passos. Esta fila ordena pelo contador, não pelo
  // número de botões pressionados, para provar o menor tempo de travessia.
  const porPasso: Estado[][] = [[iniciar(fase)]];
  const vistos = new Set<string>();
  const anteriores = new Map<string, Set<string>>();
  const vitorias: string[] = [];
  for (let i = 0; i < porPasso.length; i++) {
    for (const estado of porPasso[i]) {
      const id = chave(estado);
      if (vistos.has(id)) continue;
      vistos.add(id);
      if (estado.situacao === 'vitoria') {
        if (!verificarVolta) return { passos: i };
        vitorias.push(id);
        continue;
      }
      for (const acao of acoes) {
        const novo = executarPasso(fase, estado, acao).estado;
        if (novo === estado || novo.situacao === 'derrota' || !verificarVolta && novo.levadas) continue;
        if (modo === 'sem-carona' && posicoesDosSiris(estado).some((pos, indice) =>
          indice !== siriAtivo(estado) && !mesmaCasa(pos, posicoesDosSiris(novo)[indice]))) continue;
        (porPasso[novo.passos] ??= []).push(novo);
        if (verificarVolta) {
          const destino = chave(novo);
          if (!anteriores.has(destino)) anteriores.set(destino, new Set());
          anteriores.get(destino)!.add(id);
        }
      }
    }
    porPasso[i] = [];
  }
  if (!verificarVolta) return {};
  // Busca reversa desde todos os estados de vitória: nenhum estado não
  // derrotado pode ficar sem saída mesmo depois de duas levadas.
  const recuperaveis = new Set(vitorias);
  for (const id of vitorias) for (const anterior of anteriores.get(id) ?? []) {
    if (!recuperaveis.has(anterior)) {
      recuperaveis.add(anterior);
      vitorias.push(anterior);
    }
  }
  return { estados: vistos.size, semVitoria: vistos.size - recuperaveis.size };
}

test('duas travessias da Deriva exigem todas as balsas, e a passagem exige carona inativa', () => {
  for (const [fase, passos] of [[MESTRE_DAS_CORRENTES, 24], [PASSAGEM_DAS_BALSAS, 25]] as const) {
    assert.ok(validarSolucao(fase));
    const fim = reproduzir(fase, fase.solucao);
    assert.equal(fim.situacao, 'vitoria');
    assert.equal(fim.levadas, 0);
    assert.equal(fim.passos, passos);
    assert.equal(acharEstados(fase, 'minimo').passos, passos);
    for (const indice of fase.balsas.keys()) {
      assert.equal(acharEstados({ ...fase, balsas: fase.balsas.filter((_, i) => i !== indice) }, 'minimo').passos, undefined);
    }
  }
  assert.equal(acharEstados(PASSAGEM_DAS_BALSAS, 'sem-carona').passos, undefined);
  for (const vinculo of PASSAGEM_DAS_BALSAS.portoesVinculados) {
    const portoesVinculados = PASSAGEM_DAS_BALSAS.portoesVinculados.filter(item => item !== vinculo);
    assert.equal(acharEstados({ ...PASSAGEM_DAS_BALSAS, portoesVinculados }, 'minimo').passos, undefined);
  }
});

test('ancoradouros só registram o desembarque na virada, funcionando na alta e na baixa', () => {
  const fase = MESTRE_DAS_CORRENTES;
  const saiuCedo = executarPasso(fase, reproduzir(fase, ['baixo']), 'baixo');
  assert.deepEqual(saiuCedo.estado.ancoradouros, []);
  assert.deepEqual(saiuCedo.eventos, [{ tipo: 'aguarde-desembarque' }]);
  const chegadaAPe = executarPasso(fase, reproduzir(fase, fase.solucao.slice(0, 9)), 'cima');
  assert.deepEqual(chegadaAPe.estado.ancoradouros, []);
  const primeira = executarPasso(fase, reproduzir(fase, fase.solucao.slice(0, 11)), 'direita');
  assert.equal(mareAlta(primeira.estado.passos), false);
  assert.deepEqual(primeira.estado.ancoradouros, [p(5, 0)]);
  assert.deepEqual(primeira.eventos, [{ tipo: 'virada', alta: false }, { tipo: 'ancorou' }]);
  const segunda = executarPasso(fase, reproduzir(fase, fase.solucao.slice(0, 20)), 'esquerda');
  assert.equal(mareAlta(segunda.estado.passos), true);
  assert.deepEqual(segunda.estado.ancoradouros, [p(5, 0), p(0, 2)]);
  assert.deepEqual(segunda.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'ancorou' }]);
  assert.deepEqual(iniciar(fase).ancoradouros, []);
  assert.throws(() => validarMapa({ ...fase, balsas: [fase.balsas[0]] }), /Ancoradouro sem acesso/);
  assert.throws(() => validarMapa({ ...fase, atracacaoNaVirada: [p(5, 0), p(5, 0)] }), /posição inválida/);
  assert.deepEqual(executarPasso(fase, iniciar(fase), 'direita').eventos, [{ tipo: 'faltam-ancoradouros' }]);
});

test('sincronizar as duas balsas e os dois portões admite erro e recuperação', () => {
  const fase = PASSAGEM_DAS_BALSAS;
  const pronto = reproduzir(fase, fase.solucao.slice(0, 9));
  assert.equal(jogadorAtivo(pronto).linha, 3);
  const virada = executarPasso(fase, pronto, 'direita');
  assert.equal(virada.estado.passos, 9);
  assert.deepEqual(posicoesDosSiris(virada.estado), [p(5, 0), p(2, 3)]);
  assert.ok(virada.eventos.some(e => e.tipo === 'balsa'));

  const naVazante = reproduzir(fase, fase.solucao.slice(0, 16));
  assert.equal(naVazante.passos, 13);
  const baixio = executarPasso(fase, naVazante, 'direita').estado;
  assert.equal(baixio.passos, 14);
  const trocou = executarPasso(fase, baixio, 'trocar').estado;
  const inundou = executarPasso(fase, trocou, 'direita');
  assert.deepEqual(inundou.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'levada', motivos: ['mare'] }]);
  assert.equal(inundou.estado.levadas, 1);
  assert.equal(inundou.estado.passos, 15);
  assert.deepEqual(posicoesDosSiris(inundou.estado), [p(7, 0), p(3, 3)]);

  for (const fase of fases) {
    const verificacao = acharEstados(fase, 'recuperacao');
    assert.ok(verificacao.estados! > 0);
    assert.equal(verificacao.semVitoria, 0);
  }
});

test('as duas arenas ficam em um desvio; mapa, contagem, save e Grutas não dependem delas', () => {
  const original: Progresso = { mundo: 'deriva', posicao: p(6, 1), viuTutorial: true,
    concluidas: ['deriva-primeira-balsa', 'deriva-duas-margens'] };
  assert.strictEqual(moverNoMapa(original, 'direita').progresso, original);
  const legado = concluirFase(original, 'deriva-corrente-cruzada');
  const porto = moverNoMapa(legado, 'baixo').progresso;
  const arquipelago = viajar(porto, 'arquipelago');
  assert.equal(viajar(moverNoMapa(arquipelago, 'cima').progresso, 'grutas').mundo, 'grutas');

  const mestre = moverNoMapa(legado, 'direita').progresso;
  assert.equal(entradaEm(mestre.posicao, 'deriva')?.id, MESTRE_DAS_CORRENTES.id);
  assert.strictEqual(moverNoMapa(mestre, 'baixo').progresso, mestre);
  const passagem = moverNoMapa(concluirFase(mestre, MESTRE_DAS_CORRENTES.id), 'baixo').progresso;
  assert.equal(entradaEm(passagem.posicao, 'deriva')?.id, PASSAGEM_DAS_BALSAS.id);
  assert.deepEqual(moverNoMapa(passagem, 'cima').progresso.posicao, mestre.posicao);
  assert.equal(totalDeFasesRegulares('deriva'), 10);

  let bruto = '';
  const storage = { getItem: () => bruto, setItem: (_: string, valor: string) => { bruto = valor; } };
  const save = { progresso: concluirFase(passagem, PASSAGEM_DAS_BALSAS.id), audio: { musica: 0, efeitos: 0 } };
  assert.ok(salvar(storage, save));
  assert.deepEqual(carregar(storage), save);
});
