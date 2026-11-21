import assert from 'node:assert/strict';
import { test } from 'node:test';
import { concluirFase, entradaEm, moverNoMapa, totalDeFasesRegulares, viajar } from '../src/campanha/index.ts';
import type { Progresso } from '../src/campanha/index.ts';
import { SENTINELA_DA_GRUTA, COFRE_DAS_ESPUMAS } from '../src/fases/chefes-grutas.ts';
import { DIRECOES, executarPasso, iniciar, janelaGrutaAtiva, siriAtivo } from '../src/motor/index.ts';
import type { Estado, Fase } from '../src/motor/index.ts';
import { carregar, salvar } from '../src/persistencia/index.ts';
import { reproduzir, validarMapa, validarSolucao } from '../src/validacao/index.ts';

const p = (coluna: number, linha: number) => ({ coluna, linha });
const fases = [SENTINELA_DA_GRUTA, COFRE_DAS_ESPUMAS] as const;
const filaSolo = DIRECOES;
const filaDupla = [...DIRECOES, 'trocar'] as const;

function acharEstados(fase: Fase, verificarVolta = false, siriImovel?: number) {
  const acoes = fase.dupla ? filaDupla : filaSolo;
  const chave = (s: Estado) => JSON.stringify([s.posicao, s.dupla?.posicao, siriAtivo(s),
    s.passos % 6, s.etapaGruta, s.portadorGruta, s.levadas, s.situacao,
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
        if (acao !== 'trocar' && siriAtivo(estado) === siriImovel) continue;
        const novo = executarPasso(fase, estado, acao).estado;
        if (novo === estado || novo.situacao === 'derrota' || !verificarVolta && novo.levadas) continue;
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

const comandos = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita', X: 'trocar' } as const;
const rota = (letras: string) => [...letras].map(letra => comandos[letra as keyof typeof comandos]);

test('as duas arenas usam as janelas; na segunda cada siri tem uma tarefa distinta', () => {
  for (const [fase, passos, semJanelas] of [[SENTINELA_DA_GRUTA, 24, 22], [COFRE_DAS_ESPUMAS, 27, 23]] as const) {
    assert.ok(validarSolucao(fase));
    const fim = reproduzir(fase, fase.solucao);
    assert.equal(fim.situacao, 'vitoria');
    assert.equal(fim.passos, passos);
    assert.equal(fim.levadas, 0);
    assert.equal(acharEstados(fase).passos, passos);
    assert.equal(acharEstados({ ...fase, condicoesGruta: undefined }).passos, semJanelas);
    const recuperacao = acharEstados(fase, true);
    assert.ok(recuperacao.estados! > 1000);
    assert.equal(recuperacao.semVitoria, 0);
  }
  for (const siri of [0, 1]) assert.equal(acharEstados(COFRE_DAS_ESPUMAS, false, siri).passos, undefined);
});

test('rejeita peças fora da janela, conserva o portador e deixa a alavanca em espera sem placa', () => {
  const sentinela = SENTINELA_DA_GRUTA;
  const cedo = executarPasso(sentinela, reproduzir(sentinela, rota('RRRDRR')), 'cima');
  assert.deepEqual(cedo.eventos, [{ tipo: 'gruta-fora-da-janela', janela: 'alta' }]);
  assert.equal(cedo.estado.etapaGruta, 1);

  const cofre = COFRE_DAS_ESPUMAS;
  const antes = reproduzir(cofre, rota('RRXDRRURRDURRRRRXRRRXDU'));
  const semPlaca = executarPasso(cofre, antes, 'direita');
  assert.equal(semPlaca.estado.passos, 21);
  assert.deepEqual(semPlaca.eventos, [{ tipo: 'virada', alta: true }, { tipo: 'gruta-sem-placa' }]);
  assert.equal(semPlaca.estado.etapaGruta, 2);
  const coletou = reproduzir(cofre, rota('RRXDRRURRDURRRRRXRR'));
  assert.equal(coletou.portadorGruta, 'principal');
  const encaixou = executarPasso(cofre, coletou, 'direita');
  assert.equal(encaixou.estado.passos, 18);
  assert.equal(encaixou.estado.etapaGruta, 2);
  assert.equal(encaixou.estado.portadorGruta, undefined);
  assert.equal(janelaGrutaAtiva('descida', 18), true);
  for (const passo of [0, 15, 17, 19, 20, 21]) assert.equal(janelaGrutaAtiva('descida', passo), false);
  assert.equal(iniciar(cofre).etapaGruta, 0);
  assert.throws(() => validarMapa({ ...cofre, condicoesGruta: [{ etapa: 'F', janela: 'alta', placa: p(0, 0) }] }), /Condições de maré/);
  assert.throws(() => validarMapa({ ...cofre, condicoesGruta: [cofre.condicoesGruta[0], cofre.condicoesGruta[0]] }), /Condições de maré/);
});

test('os chefes não interferem na passagem à Baía, no save ou na contagem de regulares', () => {
  const origem: Progresso = { mundo: 'grutas', posicao: p(10, 1), viuTutorial: true,
    concluidas: ['grutas-encaixe', 'grutas-ordem', 'grutas-retorno', 'grutas-dupla-portao'] };
  assert.strictEqual(moverNoMapa(origem, 'direita').progresso, origem);
  const legado = concluirFase(origem, 'grutas-dupla-camaras');
  const cais = moverNoMapa(legado, 'baixo').progresso;
  const marAberto = viajar(cais, 'arquipelago');
  assert.equal(viajar(moverNoMapa(marAberto, 'direita').progresso, 'ressaca').mundo, 'ressaca');

  const sentinela = moverNoMapa(legado, 'direita').progresso;
  assert.equal(entradaEm(sentinela.posicao, 'grutas')?.id, SENTINELA_DA_GRUTA.id);
  assert.strictEqual(moverNoMapa(sentinela, 'baixo').progresso, sentinela);
  const cofre = moverNoMapa(concluirFase(sentinela, SENTINELA_DA_GRUTA.id), 'baixo').progresso;
  assert.equal(entradaEm(cofre.posicao, 'grutas')?.id, COFRE_DAS_ESPUMAS.id);
  assert.deepEqual(moverNoMapa(cofre, 'cima').progresso.posicao, sentinela.posicao);
  assert.equal(totalDeFasesRegulares('grutas'), 10);

  let bruto = '';
  const storage = { getItem: () => bruto, setItem: (_: string, valor: string) => { bruto = valor; } };
  const save = { progresso: concluirFase(cofre, COFRE_DAS_ESPUMAS.id), audio: { musica: 0, efeitos: 0 } };
  assert.ok(salvar(storage, save));
  assert.deepEqual(carregar(storage), save);
});
