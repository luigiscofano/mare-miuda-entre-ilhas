import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { gerarMareAMao } from '../src/mare-a-mao/index.ts';

// Este ensaio carrega o módulo realmente embutido no arquivo offline.
// Simula DOM/Canvas para isolar comandos e desenho; não substitui o Chromium.
class ElementoFalso {
  textContent = '';
  hidden = false;
  open = false;
  style = {};
  atributos = {};
  value = '';
  disabled = false;
  eventos = {};
  filhos = [];
  checked = false;
  append(filho) { this.filhos.push(filho); }
  replaceChildren() { this.filhos = []; }
  constructor(dataset = {}) { this.dataset = dataset; }
  addEventListener(nome, fn) { (this.eventos[nome] ??= []).push(fn); }
  setAttribute(nome, valor) { this.atributos[nome] = valor; }
  disparar(nome, evento) { for (const ouvinte of this.eventos[nome] ?? []) ouvinte(evento); }
  click() { if (!this.disabled) this.disparar('click'); }
  querySelector() { return this; }
  focus() {}
}
function prepararInterface() {
  const elementos = new Map();
  const pegar = chave => {
    if (!elementos.has(chave)) elementos.set(chave, new ElementoFalso());
    return elementos.get(chave);
  };
  const quadros = [];
  const recortes = [];
  const contexto = {
    fillStyle: '', save() {}, restore() {}, setTransform() {},
    drawImage(_imagem, ...args) { recortes.push(args); },
    fillRect(...args) { quadros.push([this.fillStyle, ...args]); },
  };
  Object.assign(pegar('#marca-praia'), { complete: true, naturalWidth: 180, naturalHeight: 94 });
  pegar('#tabuleiro').getContext = () => contexto;
  pegar('#moldura').clientWidth = 500;
  pegar('#moldura-logo').clientWidth = 400;
  pegar('#moldura-praia').clientWidth = 500;
  pegar('#mapa-praia').getContext = () => contexto;
  const fases = Array.from({ length: 3 }, (_, i) => new ElementoFalso({ fase: String(i + 1) }));
  const botoes = Object.fromEntries(
    ['cima', 'baixo', 'esquerda', 'direita'].map(direcao => [direcao, new ElementoFalso({ direcao })]),
  );
  const mapa = Object.fromEntries(
    ['cima', 'baixo', 'esquerda', 'direita'].map(mapaDirecao => [mapaDirecao, new ElementoFalso({ mapaDirecao })]),
  );
  const storage = new Map([['miudezas', 'preservado']]);
  globalThis.document = Object.assign(new ElementoFalso(), {
    createElement: () => new ElementoFalso(),
    querySelector: pegar,
    querySelectorAll: seletor => seletor === '[data-fase]' ? fases
      : Object.values(seletor === '[data-direcao]' ? botoes : mapa),
  });
  globalThis.window = new ElementoFalso();
  window.localStorage = {
    getItem: chave => storage.get(chave) ?? null,
    setItem: (chave, valor) => storage.set(chave, valor),
  };
  globalThis.Element = ElementoFalso;
  globalThis.ResizeObserver = class { observe() {} };
  function tecla(key, repeat = false) {
    window.disparar('keydown', { key, repeat, preventDefault() {} });
  }
  return { pegar, quadros, recortes, fases, botoes, mapa, tecla, storage };
}

test('HTML offline executa a bancada, a Praia, os créditos e o save sem rede', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  const modulo = html.match(/<script type="module" src="(data:[^"]+)"/)?.[1];
  assert.ok(modulo, 'A versão offline precisa embutir seu módulo.');
  assert.ok(html.includes('<style>'));
  const marca = html.match(/id="marca-praia" src="data:image\/png;base64,([^"]+)"/)?.[1];
  assert.ok(marca, 'O HTML offline incorpora a marca sem rede.');
  const png = await readFile(new URL('../assets/logo-placa-de-areia-pt.png', import.meta.url));
  assert.deepEqual(Buffer.from(marca, 'base64'), png, 'A imagem aprovada não pode ser reamostrada.');

  const cabo = html.match(/id="cabo-baixo" src="data:image\/png;base64,([^"]+)"/)?.[1];
  assert.ok(cabo);
  assert.deepEqual(Buffer.from(cabo, 'base64'), await readFile(new URL('../assets/cabo-baixo-192.png', import.meta.url)));

  for (const [id, arquivo] of Object.entries({
    'folha-fauna': 'spritesheet.png',
    'garca-patrulha': 'garca-patrulha.png',
    'garca-rasante': 'garca-rasante.png',
  })) {
    const embutida = html.match(new RegExp(`id="${id}" src="data:image/png;base64,([^"]+)"`))?.[1];
    assert.ok(embutida, id);
    assert.deepEqual(Buffer.from(embutida, 'base64'), await readFile(new URL(`../assets/fauna/${arquivo}`, import.meta.url)));
  }

  assert.ok(!html.includes("href=\"./styles.css\""));
  const { pegar, quadros, recortes, fases, botoes, mapa, tecla, storage } = prepararInterface();
  await import(modulo);
  const ler = id => pegar(id).textContent;
  assert.equal(pegar('#inicio').hidden, false);
  assert.equal(pegar('#marca-praia').style.width, '360px');
  pegar('#bancada').click();
  assert.equal(ler('#nome-fase'), 'Passagem da primeira onda');
  assert.equal(pegar('#tabuleiro').style.width, '256px');
  assert.equal(pegar('#tabuleiro').width, 512);
  assert.equal(pegar('#tabuleiro').height, 384);
  const recorte = recortes.at(-1);
  assert.deepEqual(recorte.slice(0, 4), [75, 3, 31, 23]);
  assert.deepEqual(recorte.slice(6), [31, 23]);
  assert.ok(recorte.every(Number.isInteger));
  assert.ok(quadros.length > 0);
  assert.ok(quadros.every(([cor, ...pos]) => /^#[0-9a-f]{6}$/i.test(cor) && pos.every(Number.isInteger)));
  tecla('ArrowRight', true);
  assert.equal(ler('#passos'), '0');
  tecla('ArrowLeft');
  assert.equal(ler('#passos'), '0');
  ['ArrowRight', 'd', 'ArrowRight'].forEach(key => tecla(key));
  assert.equal(ler('#mare'), 'Alta');
  assert.match(ler('#feedback'), /Fase concluída/);
  fases[1].click();
  assert.equal(pegar('#garca-patrulha').hidden, false);
  assert.equal(pegar('#garca-rasante').hidden, true);
  ['direita', 'direita'].forEach(dir => botoes[dir].click());
  assert.match(ler('#previsao'), /Garça no próximo passo/);
  assert.equal(pegar('#garca-patrulha').hidden, true);
  assert.equal(pegar('#garca-rasante').hidden, false);
  botoes.direita.click();
  assert.equal(ler('#erros'), '1 / 3');
  tecla('r');
  assert.equal(ler('#passos'), '0');
  ['direita', 'direita', 'baixo', 'cima', 'direita', 'direita'].forEach(dir => botoes[dir].click());
  assert.match(ler('#feedback'), /Fase concluída/);
  fases[2].click();
  botoes.direita.click();
  assert.match(ler('#feedback'), /encontre o fragmento/);
  pegar('#reiniciar').click();
  ['baixo','baixo','direita','esquerda','direita','esquerda','cima','cima','direita'].forEach(dir => botoes[dir].click());
  assert.match(ler('#feedback'), /Fase concluída/);
  assert.equal(ler('#fragmento'), 'Fragmento no inventário');
  pegar('#reiniciar').click();
  assert.equal(ler('#fragmento'), 'Fragmento ainda na ilha');
  assert.equal(ler('#erros'), '0 / 3');
  assert.equal(ler('#mare'), 'Baixa');
  assert.equal(storage.size, 1, 'A bancada não grava progresso da praia.');

  pegar('#voltar-fase').click();
  pegar('#comecar').click();
  const bilheteAntes = ler('#progresso-praia');
  assert.ok(!quadros.some(([cor]) => cor === '#dfb050'), 'A decoração antiga fica só no histórico.');
  assert.doesNotMatch(bilheteAntes, /bem-te-vi/i);
  const movimento = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' };
  const andar = rota => [...rota].forEach(d => mapa[movimento[d]].click());
  const jogar = rota => [...rota].forEach(d => botoes[movimento[d]].click());
  andar('D'); // O cenário marítimo não adquiriu uma casa caminhável.
  assert.match(ler('#mensagem-praia'), /Não há trilha/);
  assert.equal(ler('#progresso-praia'), bilheteAntes);
  const entrar = () => pegar('#entrar-fase').click();
  const voltar = () => pegar('#voltar-fase').click();
  andar('R'); entrar(); jogar('RRR'); voltar();
  assert.match(ler('#progresso-praia'), /1\/4/);
  andar('D'); entrar(); jogar('RLDDRRRRU'); voltar();
  assert.match(ler('#progresso-praia'), /Concha Perolada: encontrada/);
  andar('UR'); entrar(); jogar('RRDURR'); voltar();
  andar('R'); entrar(); jogar('DDRLRLUUR'); voltar();
  andar('R'); entrar(); jogar('RRRDDLRRRU');
  assert.equal(pegar('#seguir-fase').hidden, false);
  pegar('#seguir-fase').click();
  assert.equal(pegar('#creditos').hidden, false);
  assert.match(ler('#desfecho'), /primeira viagem termina/);
  pegar('#volume-musica').value = '0';
  pegar('#volume-musica').disparar('input');
  pegar('#volume-musica').disparar('change');
  const registro = JSON.parse(storage.get('mare-miuda-entre-ilhas/praia-v1'));
  assert.equal(registro.progresso.concluidas.length, 5);
  assert.equal(registro.audio.musica, 0);
  assert.equal(storage.get('miudezas'), 'preservado');
});

test('HTML offline avisa a onda e salva a conclusão de Vento Sul sem rede', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  const modulo = html.match(/<script type="module" src="(data:[^"]+)"/)?.[1];
  assert.ok(modulo);
  const { pegar, botoes, mapa, storage, quadros } = prepararInterface();
  const chave = 'mare-miuda-entre-ilhas/praia-v1';
  storage.set(chave, JSON.stringify({
    versao: 1,
    progresso: {
      mundo: 'ressaca', posicao: { coluna: 8, linha: 3 }, viuTutorial: true,
      concluidas: ['ressaca-dupla-abrigo', 'ressaca-dupla-ancoradouros', 'ressaca-refugio-de-pedra',
        'ressaca-bolsos-opostos', 'ressaca-vigia-da-placa', 'ressaca-balsas-da-ponta',
        'ressaca-cais-em-paralelo', 'ressaca-tres-moedas-do-cais',
        'ressaca-atracadouro-torto', 'ressaca-cofre-da-vazante'],
    },
    audio: { musica: 0, efeitos: 0 },
  }));
  // O fragmento importa outra instância do módulo offline no DOM recém-criado.
  await import(modulo + '#vento-sul');
  const ler = id => pegar(id).textContent;
  const jogar = rota => [...rota].forEach(letra => botoes[{
    U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita',
  }[letra]].click());
  pegar('#comecar').click();
  mapa.esquerda.click();
  assert.match(ler('#posicao-praia'), /Vento Sul · chefe opcional/);
  quadros.length = 0;
  pegar('#entrar-fase').click();
  assert.match(ler('#previsao'), /Onda na subida: linha 1, colunas 2 a 4/);
  assert.equal(ler('#ancoradouros'), 'Ancoradouros firmes: 0/3');
  assert.ok(quadros.length && quadros.every(([, ...posicoes]) => posicoes.every(Number.isInteger)));

  jogar('RRR');
  assert.match(ler('#feedback'), /faixa da ressaca te alcançou/);
  assert.equal(ler('#erros'), '1 / 3');
  pegar('#reiniciar').click();
  jogar('DDUURRRLRLRDDRRRR');
  assert.match(ler('#feedback'), /ancoradouro na maré baixa/);
  assert.equal(ler('#ancoradouros'), 'Ancoradouros firmes: 2/3');
  jogar('LR');
  assert.equal(ler('#ancoradouros'), 'Ancoradouros firmes: 3/3');
  assert.match(ler('#grade'), /n=.H=..n/);
  jogar('LUURR');
  assert.match(ler('#feedback'), /Vento Sul vencido/);
  assert.equal(ler('#erros'), '0 / 3');
  pegar('#voltar-fase').click();
  assert.match(ler('#progresso-praia'), /10\/10/);
  assert.ok(JSON.parse(storage.get(chave)).progresso.concluidas.includes('ressaca-chefe-vento-sul'));
});

test('HTML offline firma as âncoras da Deriva, transporta a dupla e preserva a contagem', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  const modulo = html.match(/<script type="module" src="(data:[^"]+)"/)?.[1];
  assert.ok(modulo);
  const { pegar, botoes, mapa, storage, tecla } = prepararInterface();
  const chave = 'mare-miuda-entre-ilhas/praia-v1';
  storage.set(chave, JSON.stringify({ versao: 1, progresso: { mundo: 'deriva', posicao: { coluna: 6, linha: 1 },
    viuTutorial: true, concluidas: ['deriva-primeira-balsa', 'deriva-duas-margens', 'deriva-corrente-cruzada'] },
  audio: { musica: 0, efeitos: 0 } }));
  await import(modulo + '#chefes-deriva');
  const ler = id => pegar(id).textContent;
  const direcoes = { U: 'cima', D: 'baixo', L: 'esquerda', R: 'direita' };
  const jogar = rota => [...rota].forEach(letra => {
    if (letra === 'X') tecla(' ');
    else botoes[direcoes[letra]].click();
  });

  pegar('#comecar').click();
  mapa.direita.click();
  assert.match(ler('#posicao-praia'), /Mestre das Correntes · chefe opcional/);
  mapa.baixo.click();
  assert.match(ler('#mensagem-praia'), /Vença Mestre das Correntes/);
  pegar('#entrar-fase').click();
  jogar('DD');
  assert.match(ler('#feedback'), /faltar um passo para a virada/);
  jogar('RDUDRUUULR');
  assert.equal(ler('#ancoradouros'), 'Ancoradouros firmes: 1/2');
  assert.match(ler('#grade'), /SC~~~n/);
  jogar('DDDLLLLULUUR');
  assert.match(ler('#feedback'), /Arena vencida: Mestre das Correntes/);
  pegar('#voltar-fase').click();
  mapa.baixo.click();
  pegar('#entrar-fase').click();
  jogar('DUDURRRRXR');
  assert.match(ler('#posicao'), /Coral: coluna 6, linha 1.*Verde \(ativo\): coluna 3, linha 4/);
  jogar('RXRRXR');
  assert.match(ler('#previsao'), /Portão 2 \(aberto\)/);
  jogar('RXR');
  assert.equal(ler('#erros'), '1 / 3');
  assert.match(ler('#feedback'), /A maré te levou/);
  pegar('#reiniciar').click();
  jogar('DUDURRRRXRRXRRXRRRXRRXRRRRXRRRR');
  assert.match(ler('#feedback'), /Arena vencida: Passagem das Balsas/);
  pegar('#voltar-fase').click();
  assert.match(ler('#progresso-praia'), /3\/10/);
  const save = JSON.parse(storage.get(chave));
  assert.ok(save.progresso.concluidas.includes('deriva-chefe-mestre-das-correntes'));
  assert.ok(save.progresso.concluidas.includes('deriva-chefe-passagem-das-balsas'));
  mapa.cima.click();
  assert.match(ler('#posicao-praia'), /Mestre das Correntes · chefe opcional · concluída/);
});

test('HTML offline abre e revisita o desfecho no mesmo marco com apenas seis fases', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  const modulo = html.match(/<script type="module" src="(data:[^"]+)"/)?.[1];
  assert.ok(modulo);
  let ui = prepararInterface();
  const chave = 'mare-miuda-entre-ilhas/praia-v1';
  const concluidas = ['farol-fragmento-margens', 'farol-duas-luzes', 'farol-faroleiros-de-vigia',
    'farol-turno-dos-guardioes', 'farol-salao-das-lanternas'];
  const audio = { musica: 0, efeitos: 0 };
  ui.storage.set(chave, JSON.stringify({ versao: 1, progresso: { mundo: 'farol',
    posicao: { coluna: 10, linha: 1 }, viuTutorial: true, concluidas }, audio }));
  await import(modulo + '#desfecho');
  const pegar = id => ui.pegar(id);
  pegar('#creditos-inicio').click();
  assert.equal(pegar('#titulo-creditos').textContent, 'Créditos');
  assert.doesNotMatch(pegar('#desfecho').textContent, /A luz voltou/);
  pegar('#voltar-creditos').click();
  pegar('#comecar').click();
  assert.equal(pegar('#rever-desfecho').hidden, true);
  ui.mapa.baixo.click();
  pegar('#entrar-fase').click();
  assert.equal(pegar('#nome-fase').textContent, 'A luz das duas marés');
  assert.equal(pegar('#seguir-fase').hidden, true);
  const direcoes = { D: 'baixo', L: 'esquerda', R: 'direita' };
  for (const letra of 'RXRRRXRRRXRRRXRRRRXDDXRRLRLRLDDRLDRRRXRRD') {
    if (letra === 'X') ui.tecla(' ');
    else ui.botoes[direcoes[letra]].click();
  }
  assert.equal(pegar('#passos').textContent, '34');
  assert.equal(pegar('#erros').textContent, '0 / 3');
  assert.equal(pegar('#creditos').hidden, true);
  assert.equal(pegar('#seguir-fase').hidden, false);
  assert.equal(pegar('#seguir-fase').textContent, 'Ver desfecho');
  const salvo = ui.storage.get(chave);
  assert.deepEqual(JSON.parse(salvo), { versao: 1, progresso: { mundo: 'farol',
    posicao: { coluna: 11, linha: 3 }, viuTutorial: true,
    concluidas: [...concluidas, 'farol-luz-das-duas-mares'] }, audio });
  pegar('#seguir-fase').click();
  assert.match(pegar('#desfecho').textContent, /A luz voltou/);
  pegar('#voltar-creditos').click();
  assert.match(pegar('#posicao-praia').textContent, /A luz das duas marés · concluída/);
  assert.equal(ui.storage.get(chave), salvo);

  ui = prepararInterface();
  ui.storage.set(chave, salvo);
  await import(modulo + '#desfecho-recarregado');
  pegar('#comecar').click();
  assert.match(pegar('#progresso-praia').textContent, /6\/10/);
  assert.equal(pegar('#rever-desfecho').hidden, false);
  ui.mapa.cima.click();
  pegar('#rever-desfecho').click();
  assert.match(pegar('#desfecho').textContent, /A luz voltou/);
  pegar('#voltar-creditos').click();
  assert.match(pegar('#posicao-praia').textContent, /Salão das lanternas · concluída/);
});

test('Build autônomo conserva os bytes dos fundos nativos de todos os seletores com arte', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  for (const [id, arquivo] of [
    ['arte-arquipelago', 'arquipelago-meia-lua.png'], ['enseadinha', 'enseadinha-512.png'], ['cabo-baixo', 'cabo-baixo-192.png'],
    ['mapa-recifes', 'seletor-recifes-512.png'], ['mapa-mangue', 'seletor-mangue-512.png'],
    ['mapa-enseada', 'seletor-enseada-512.png'], ['mapa-deriva', 'seletor-deriva-512.png'],
    ['mapa-grutas', 'seletor-grutas-512.png'], ['mapa-ressaca', 'seletor-ressaca-512.png'], ['mapa-farol', 'seletor-farol-512.png'],
  ]) {
    const original = await readFile(new URL(`../assets/${arquivo}`, import.meta.url));
    const copiado = await readFile(new URL(`../dist/assets/${arquivo}`, import.meta.url));
    const embutido = html.match(new RegExp(`id="${id}" src="data:image/png;base64,([^"]+)"`))?.[1];
    assert.ok(embutido, id);
    assert.deepEqual(Buffer.from(embutido, 'base64'), original, id);
    assert.deepEqual(copiado, original, id);
  }
});

test('cada faixa offline é idêntica ao arquivo servido, sem referência remota', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  const blocos = [...html.matchAll(/type="application\/octet-stream" id="trilha-offline-([a-z]+)">([^<]+)</g)];
  assert.deepEqual(blocos.map(([, faixa]) => faixa), ['praia', 'recifes', 'mangue', 'enseada', 'deriva', 'grutas', 'ressaca', 'farol']);
  for (const [, faixa, base64] of blocos) {
    const origem = await readFile(new URL(`../assets/audio/trilha/${faixa}.mp3`, import.meta.url));
    const servido = await readFile(new URL(`../dist/assets/audio/trilha/${faixa}.mp3`, import.meta.url));
    assert.deepEqual(Buffer.from(base64, 'base64'), origem, faixa);
    assert.deepEqual(servido, origem, faixa);
  }
});

test('Ilha de Improviso gera, reinicia, avança e recupera a semente fora da campanha', async () => {
  const html = await readFile(new URL('../dist/mare-miuda-prototipo.html', import.meta.url), 'utf8');
  const modulo = html.match(/<script type="module" src="(data:[^"]+)"/)?.[1];
  assert.ok(modulo);
  const chaveCampanha = 'mare-miuda-entre-ilhas/praia-v1';
  const chaveIlha = 'mare-miuda-entre-ilhas/mare-a-mao-v1';
  const saveCampanha = JSON.stringify({ versao:1, progresso:{ mundo:'praia', posicao:{coluna:1,linha:1},
    viuTutorial:true, concluidas:['primeira-onda'] }, audio:{musica:0,efeitos:0} });
  const ui = prepararInterface();
  const { pegar, storage } = ui;
  storage.set(chaveCampanha, saveCampanha);
  await import(modulo + '#ilha-improviso');
  pegar('#abrir-mare-a-mao').click();
  assert.equal(pegar('#mare-a-mao').hidden, false);
  pegar('#mare-tema').value = 'recifes';
  pegar('#mare-dificuldade').value = 'Sossegado';
  pegar('#mare-siris').value = '1';
  pegar('#configurar-mare-a-mao').disparar('submit', { preventDefault() {} });
  assert.equal(pegar('#fase').hidden, false);
  assert.equal(pegar('#nova-mare-a-mao').hidden, true);
  const [entrada] = JSON.parse(storage.get(chaveIlha));
  const prova = gerarMareAMao(entrada.opcoes, entrada.semente);
  assert.ok(prova);
  assert.equal(pegar('#grade').textContent, prova.mapa.join('\n'));
  assert.equal(pegar('#voltar-fase').textContent, 'Editar filtros');
  pegar('#reiniciar').click();
  assert.equal(pegar('#grade').textContent, prova.mapa.join('\n'));
  assert.equal(pegar('#passos').textContent, '0');
  for (const acao of prova.solucao) {
    if (acao === 'trocar') pegar('#trocar-siri').click();
    else ui.botoes[acao].click();
  }
  assert.match(pegar('#feedback').textContent, /Fase concluída/);
  assert.equal(pegar('#nova-mare-a-mao').hidden, false);
  pegar('#nova-mare-a-mao').click();
  assert.equal(pegar('#passos').textContent,'0');
  assert.equal(pegar('#nova-mare-a-mao').hidden,true);
  const entradas = JSON.parse(storage.get(chaveIlha));
  assert.equal(entradas.length,2);
  assert.notEqual(entradas[0].semente, entrada.semente);
  assert.equal(storage.get(chaveCampanha), saveCampanha);

  const recarregada = prepararInterface();
  recarregada.storage.set(chaveCampanha, saveCampanha);
  recarregada.storage.set(chaveIlha, JSON.stringify(entradas));
  await import(modulo + '#ilha-improviso-recarregada');
  recarregada.pegar('#abrir-mare-a-mao').click();
  const opcoes = recarregada.pegar('#mare-historico-itens').filhos;
  assert.equal(opcoes.length,2);
  opcoes[1].filhos[0].click();
  assert.equal(recarregada.pegar('#grade').textContent, prova.mapa.join('\n'));
  assert.equal(recarregada.storage.get(chaveCampanha), saveCampanha);
});
