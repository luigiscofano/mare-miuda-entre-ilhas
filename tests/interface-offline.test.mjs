import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

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
  const contexto = { fillStyle: '', fillRect(...args) { quadros.push([this.fillStyle, ...args]); } };
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
  return { pegar, quadros, fases, botoes, mapa, tecla, storage };
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

  assert.ok(!html.includes("href=\"./styles.css\""));
  const { pegar, quadros, fases, botoes, mapa, tecla, storage } = prepararInterface();
  await import(modulo);
  const ler = id => pegar(id).textContent;
  assert.equal(pegar('#inicio').hidden, false);
  assert.equal(pegar('#marca-praia').style.width, '360px');
  pegar('#bancada').click();
  assert.equal(ler('#nome-fase'), 'Passagem da primeira onda');
  assert.equal(pegar('#tabuleiro').style.width, '256px');
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
  ['direita', 'direita'].forEach(dir => botoes[dir].click());
  assert.match(ler('#previsao'), /Garça no próximo passo/);
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
